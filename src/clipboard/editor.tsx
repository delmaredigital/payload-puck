'use client'

/**
 * Editor side of the block clipboard: Copy block / Paste after / Paste inside
 * in each block's action bar, Cmd/Ctrl+C and Cmd/Ctrl+V on a selected block,
 * and a short status message (announced to screen readers) when something
 * happens or a paste can't.
 *
 * `composeClipboardOverrides` wraps the editor's final overrides (after show/
 * hide), so a host's own `actionBar`, `iframe` or `puck` override keeps working.
 * The clipboard itself (`createEditorClipboard`) is made once per user and
 * scope by the editor and passed in, so recomputing the overrides never resets
 * it.
 */

import {
  createElement,
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { ActionBar, createUsePuck, setDeep, useGetPuck, type ComponentData, type Overrides } from '@puckeditor/core'
import { ClipboardPaste, ClipboardPlus, Copy } from 'lucide-react'
import { useActionBarBlock } from '../visibility/editor.js'
import {
  CLIPBOARD_STRINGS,
  checkPaste,
  clipboardScope,
  createClipboardStore,
  sessionScope,
  slotsInBlock,
  toClipboardBlock,
  vetoPaste,
  withNewIds,
  type ClipboardContents,
  type ClipboardScope,
  type ClipboardStore,
  type SlotInfo,
} from './core.js'
import type { PasteAncestor } from './types.js'

const usePuck = createUsePuck()

type PuckApi = ReturnType<ReturnType<typeof useGetPuck>>

// -----------------------------------------------------------------------------
// Clipboard
// -----------------------------------------------------------------------------

/**
 * Stores by scope, so editors in one tab with the same user and host scope
 * share a store (and its in-memory fallback).
 */
const stores = new Map<string, ClipboardStore>()

function storeFor(scope: ClipboardScope): ClipboardStore {
  const id = `${scope.storage}|${scope.key}`
  let store = stores.get(id)
  if (!store) stores.set(id, (store = createClipboardStore({ scope })))
  return store
}

/** Tests only: forget the stores (e.g. after replacing localStorage). */
export function resetClipboardStoresForTests(): void {
  stores.clear()
}

export interface ClipboardOptions {
  /** The signed-in user's id; without one the clipboard lasts only for the tab. */
  userId?: string | number | null
  /** The host's own scope (a tenant or site), combined with the user id. */
  scope?: string
}

const EMPTY: ClipboardContents = { status: 'empty' }

/**
 * One editor's clipboard: its status message, and its store once the scope is
 * known (hashing the user id is asynchronous, so for a moment after the
 * editor opens there is nothing to copy into or paste from).
 */
export interface EditorClipboard {
  status: ClipboardStatus
  store(): ClipboardStore | undefined
  read(): ClipboardContents
  subscribe(listener: () => void): () => void
  /** True while a paste is between its two Puck actions (see `pasteBlock`). */
  isPasting(): boolean
  /** Runs `dispatches` with `isPasting()` true. */
  pasting(dispatches: () => void): void
}

export function createEditorClipboard(options: ClipboardOptions = {}): EditorClipboard {
  const status = createClipboardStatus()
  let store: ClipboardStore | undefined
  let resolving: Promise<void> | undefined
  let midPaste = false
  const listeners = new Set<() => void>()
  let unsubscribeStore: (() => void) | undefined
  const notify = () => listeners.forEach((listener) => listener())

  const resolve = () => {
    resolving ??= clipboardScope(options.userId, options.scope)
      .catch((): ClipboardScope => sessionScope(options.userId, options.scope))
      .then((scope) => {
        store = storeFor(scope)
        if (listeners.size > 0) unsubscribeStore = store.subscribe(notify)
        notify()
      })
  }

  // Start now in the browser, so the store is ready by the time a block is selected
  if (typeof window !== 'undefined') resolve()

  return {
    status,
    store: () => store,
    read: () => (store ? store.read() : EMPTY),
    subscribe(listener) {
      resolve()
      if (listeners.size === 0 && store) unsubscribeStore = store.subscribe(notify)
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          unsubscribeStore?.()
          unsubscribeStore = undefined
        }
      }
    },
    isPasting: () => midPaste,
    pasting(dispatches) {
      midPaste = true
      try {
        dispatches()
      } finally {
        midPaste = false
      }
    },
  }
}

function useClipboardContents(clipboard: EditorClipboard): ClipboardContents {
  return useSyncExternalStore(clipboard.subscribe, clipboard.read, () => EMPTY)
}

function useClipboardReady(clipboard: EditorClipboard): boolean {
  return useSyncExternalStore(clipboard.subscribe, () => clipboard.store() !== undefined, () => false)
}

// -----------------------------------------------------------------------------
// Status message
// -----------------------------------------------------------------------------

export interface ClipboardStatusSnapshot {
  message: string | null
  /** Changes with every message, so a repeated message is announced again. */
  id: number
}

export interface ClipboardStatus {
  show(message: string): void
  read(): ClipboardStatusSnapshot
  subscribe(listener: () => void): () => void
}

const NO_STATUS: ClipboardStatusSnapshot = { message: null, id: 0 }

export function createClipboardStatus(): ClipboardStatus {
  let snapshot = NO_STATUS
  let timer: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  return {
    show(message) {
      snapshot = { message, id: snapshot.id + 1 }
      clearTimeout(timer)
      timer = setTimeout(() => {
        snapshot = { message: null, id: snapshot.id }
        notify()
      }, 4000)
      notify()
    },
    read: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** Centered in either text direction: no physical offsets or transforms. */
const toastStyle: CSSProperties = {
  position: 'fixed',
  insetBlockEnd: 24,
  insetInline: 0,
  marginInline: 'auto',
  width: 'max-content',
  maxWidth: 'calc(100vw - 32px)',
  zIndex: 2147483000,
  padding: '8px 12px',
  borderRadius: 8,
  background: 'var(--puck-color-grey-01, #181818)',
  color: 'var(--puck-color-white, #fff)',
  fontSize: 14,
  lineHeight: 1.4,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  pointerEvents: 'none',
}

/** Present for screen readers, invisible on screen. */
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/**
 * The live region is always in the page (a region added along with its text
 * is often not announced) and visually hidden; each message is a new node,
 * so the same message twice in a row is announced twice. The visible toast
 * repeats it and is hidden from assistive technology.
 */
function ClipboardStatusMessage({ status }: { status: ClipboardStatus }) {
  const { message, id } = useSyncExternalStore(status.subscribe, status.read, () => NO_STATUS)
  return createElement(
    Fragment,
    null,
    createElement(
      'div',
      { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', 'data-payload-puck-clipboard-status': '', style: visuallyHidden },
      message ? createElement('span', { key: id }, message) : null,
    ),
    message ? createElement('div', { 'aria-hidden': 'true', 'data-payload-puck-clipboard-toast': '', style: toastStyle }, message) : null,
  )
}

// -----------------------------------------------------------------------------
// Copy and paste
// -----------------------------------------------------------------------------

/**
 * Copies `block`. Returns false when the clipboard isn't ready yet (nothing
 * happened, so a key press should go to the browser), true otherwise, even
 * when the block can't be copied (that is said in the status message).
 */
export function copyBlock(block: ComponentData, clipboard: EditorClipboard): boolean {
  const store = clipboard.store()
  if (!store) return false
  const copy = toClipboardBlock(block)
  if (!copy) {
    clipboard.status.show(CLIPBOARD_STRINGS.cantCopy)
    return true
  }
  store.write(copy)
  clipboard.status.show(CLIPBOARD_STRINGS.copied)
  return true
}

/**
 * Pastes the clipboard's block at `index` in `zone`, with new ids, as one
 * change and one undo step, and selects it. Shows why when it can't.
 *
 * - Into a slot (at any depth): one `replace` of the slot's block, with the
 *   new block added to that slot.
 * - At the top of the page or into a legacy DropZone there is no block to
 *   replace, and Puck has no action that inserts a whole block, so it is an
 *   `insert` (not recorded in history, run inside `clipboard.pasting` so the
 *   editor holds back that in-between state) then a `replace`, so the host
 *   only ever sees the final block.
 *
 * Then, like Puck's own insert, the pasted block's `resolveData` runs with
 * the `insert` trigger.
 */
export function pasteBlock(puck: PuckApi, zone: string, index: number, clipboard: EditorClipboard): boolean {
  const { status } = clipboard
  const contents = clipboard.read()
  if (contents.status === 'empty') return false
  if (contents.status === 'unreadable') {
    status.show(CLIPBOARD_STRINGS.unreadable)
    return false
  }

  const { config, dispatch, getPermissions } = puck
  const ancestors = pasteAncestors(puck, zone)
  const [parentId, path = ''] = splitZone(zone)
  const parent = ancestors[0]?.id === parentId ? puck.getItemById(parentId) : undefined
  const check = checkPaste(
    contents.block,
    { parent, slotPath: path },
    config,
    (type) => getPermissions({ type }).insert !== false,
    () => vetoPaste(contents.block, { zone, index, ancestors }, config),
  )
  if (!check.ok) {
    status.show(check.reason)
    return false
  }
  const block = withNewIds(contents.block, config)
  const slot = parent ? slotsInBlock(parent, config).find((s) => s.path === path) : undefined
  const parentSelector = parent ? puck.getSelectorForId(parentId) : undefined

  if (parent && slot && parentSelector?.zone) {
    const children = Array.isArray(slot.value) ? [...(slot.value as ComponentData[])] : []
    children.splice(index, 0, block)
    dispatch({
      type: 'replace',
      destinationIndex: parentSelector.index,
      destinationZone: parentSelector.zone,
      data: { ...parent, props: setDeep(parent.props, path, children) },
      ui: { itemSelector: { index, zone } },
    })
  } else {
    // Only the in-between state is held back; the replace is the change
    clipboard.pasting(() => {
      dispatch({
        type: 'insert',
        componentType: block.type,
        destinationIndex: index,
        destinationZone: zone,
        id: block.props.id as string,
        recordHistory: false,
      })
    })
    dispatch({
      type: 'replace',
      destinationIndex: index,
      destinationZone: zone,
      data: block,
      ui: { itemSelector: { index, zone } },
    })
  }

  void puck.resolveDataById(block.props.id as string, 'insert')
  status.show(CLIPBOARD_STRINGS.pasted)
  return true
}

/**
 * The blocks a zone sits inside, nearest first, through Puck's public lookups.
 * Stops at the top of the page (or a legacy root zone).
 */
export function pasteAncestors(puck: Pick<PuckApi, 'getItemById' | 'getSelectorForId'>, zone: string): PasteAncestor[] {
  const ancestors: PasteAncestor[] = []
  const seen = new Set<string>()
  let current: string | undefined = zone
  while (current) {
    const [id, slot] = splitZone(current)
    // getItemById throws for an unknown id; getSelectorForId doesn't
    const selector = id && id !== 'root' && slot !== undefined && !seen.has(id) ? puck.getSelectorForId(id) : undefined
    const item = selector ? puck.getItemById(id) : undefined
    if (!item) break
    seen.add(id)
    ancestors.push({ id, type: item.type, slot: slot! })
    current = selector!.zone
  }
  return ancestors
}

function splitZone(zone: string): [string, string | undefined] {
  const at = zone.indexOf(':')
  return at === -1 ? [zone, undefined] : [zone.slice(0, at), zone.slice(at + 1)]
}

/** Where "Paste after" puts a block: right after `block`, in its slot. */
function afterBlock(puck: PuckApi, block: ComponentData): { zone: string; index: number } | undefined {
  const selector = puck.getSelectorForId(block.props.id as string)
  return selector?.zone ? { zone: selector.zone, index: selector.index + 1 } : undefined
}

/** Where "Paste inside" puts a block: at the end of one of `block`'s slots. */
function insideBlock(block: ComponentData, slot: SlotInfo): { zone: string; index: number } {
  return { zone: `${block.props.id}:${slot.path}`, index: Array.isArray(slot.value) ? slot.value.length : 0 }
}

// -----------------------------------------------------------------------------
// Action bar
// -----------------------------------------------------------------------------

const menuStyle: CSSProperties = {
  position: 'absolute',
  insetBlockStart: 'calc(100% + 4px)',
  insetInlineEnd: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 160,
  maxWidth: 'min(280px, calc(100vw - 32px))',
  padding: 4,
  borderRadius: 8,
  background: 'var(--puck-color-white, #fff)',
  color: 'var(--puck-color-grey-01, #181818)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
}

const menuItemStyle: CSSProperties = {
  all: 'unset',
  boxSizing: 'border-box',
  padding: '6px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  textAlign: 'start',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

/**
 * Paste inside. With one slot it pastes straight in. With several it is a
 * menu button: the trigger says it opens a menu and whether it is open; focus
 * moves to the first slot; Up/Down/Home/End move between slots (roving
 * tabindex); Escape closes and returns focus to the trigger; Tab or a click
 * outside closes it.
 */
function PasteInsideButton({ slots, onPaste }: { slots: SlotInfo[]; onPaste: (slot: SlotInfo) => void }) {
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const menuId = useId()
  const isMenu = slots.length > 1

  // Puck's ActionBar.Action takes no aria props; set them on its button
  useEffect(() => {
    const button = trigger.current
    if (!button) return
    if (isMenu) {
      button.setAttribute('aria-haspopup', 'menu')
      button.setAttribute('aria-expanded', String(open))
      if (open) button.setAttribute('aria-controls', menuId)
      else button.removeAttribute('aria-controls')
    } else {
      button.removeAttribute('aria-haspopup')
      button.removeAttribute('aria-expanded')
      button.removeAttribute('aria-controls')
    }
  }, [isMenu, open, menuId])

  useEffect(() => {
    if (open) items.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const doc = menu.current?.ownerDocument
    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null
      if (target && !menu.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false)
    }
    doc?.addEventListener('pointerdown', onPointerDown, true)
    return () => doc?.removeEventListener('pointerdown', onPointerDown, true)
  }, [open])

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) trigger.current?.focus()
  }

  const onMenuKeyDown = (event: ReactKeyboardEvent) => {
    const last = slots.length - 1
    const move = (index: number) => {
      event.preventDefault()
      setActive(index)
    }
    if (event.key === 'ArrowDown') move(active === last ? 0 : active + 1)
    else if (event.key === 'ArrowUp') move(active === 0 ? last : active - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(last)
    else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (event.key === 'Tab') close(false)
  }

  const action = createElement(ActionBar.Action, {
    ref: trigger,
    label: CLIPBOARD_STRINGS.pasteInside,
    active: open,
    onClick: () => {
      if (!isMenu) return onPaste(slots[0])
      setActive(0)
      setOpen((wasOpen) => !wasOpen)
    },
    children: createElement(ClipboardPlus, { size: 16 }),
  })

  const list = open && isMenu
    ? createElement(
        'div',
        { ref: menu, id: menuId, role: 'menu', 'aria-label': CLIPBOARD_STRINGS.pasteInside, style: menuStyle, onKeyDown: onMenuKeyDown },
        slots.map((slot, index) =>
          createElement('button', {
            key: slot.path,
            ref: (element: HTMLButtonElement | null) => { items.current[index] = element },
            type: 'button',
            role: 'menuitem',
            tabIndex: index === active ? 0 : -1,
            style: menuItemStyle,
            title: CLIPBOARD_STRINGS.pasteInto(slot.label),
            onClick: () => {
              close(true)
              onPaste(slot)
            },
          }, CLIPBOARD_STRINGS.pasteInto(slot.label)),
        ),
      )
    : null

  return createElement(Fragment, null, action, list)
}

/**
 * Copy block, and when the clipboard holds a block, Paste after and (for a
 * block with slots, at any depth) Paste inside, so an empty slot (an empty
 * column, an empty version of a block) can be filled too.
 *
 * Copy follows Puck's `duplicate` permission (a copy is a duplicate made
 * elsewhere); Paste inside follows the block's `edit` permission.
 */
export function ClipboardActions({ clipboard }: { clipboard: EditorClipboard }) {
  const [anchor, block] = useActionBarBlock()
  const contents = useClipboardContents(clipboard)
  const ready = useClipboardReady(clipboard)
  const getPuck = useGetPuck()
  const config = usePuck((s) => s.config)
  // Booleans, not the permissions object: a selector must return a stable value
  const canCopy = usePuck((s) => (block ? s.getPermissions({ item: block }).duplicate !== false : false))
  const canEdit = usePuck((s) => (block ? s.getPermissions({ item: block }).edit !== false : false))

  if (!block || !ready) {
    return createElement('span', { ref: anchor, style: { display: 'contents' } })
  }

  const canPaste = contents.status !== 'empty'
  const slots = canEdit ? slotsInBlock(block, config) : []

  const actions: ReactNode[] = []
  if (canCopy) {
    actions.push(createElement(ActionBar.Action, {
      key: 'copy',
      label: CLIPBOARD_STRINGS.copy,
      onClick: () => copyBlock(block, clipboard),
      children: createElement(Copy, { size: 16 }),
    }))
  }
  if (canPaste) {
    actions.push(createElement(ActionBar.Action, {
      key: 'after',
      label: CLIPBOARD_STRINGS.pasteAfter,
      onClick: () => {
        const destination = afterBlock(getPuck(), block)
        if (destination) pasteBlock(getPuck(), destination.zone, destination.index, clipboard)
      },
      children: createElement(ClipboardPaste, { size: 16 }),
    }))
    if (slots.length > 0) {
      actions.push(createElement(PasteInsideButton, {
        key: `inside:${block.props.id}`,
        slots,
        onPaste: (slot: SlotInfo) => {
          const destination = insideBlock(block, slot)
          pasteBlock(getPuck(), destination.zone, destination.index, clipboard)
        },
      }))
    }
  }

  return createElement(
    'span',
    { ref: anchor, style: { position: 'relative', display: 'inline-flex' }, 'data-payload-puck-clipboard': '' },
    actions,
  )
}

// -----------------------------------------------------------------------------
// Keyboard
// -----------------------------------------------------------------------------

const TEXT_TARGETS = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'

function inTextField(node: unknown): boolean {
  const element = node as { closest?: (selector: string) => unknown } | null
  return typeof element?.closest === 'function' && element.closest(TEXT_TARGETS) !== null
}

function hasTextSelection(doc: Document): boolean {
  const selection = doc.getSelection?.()
  return !!selection && !selection.isCollapsed && selection.toString().length > 0
}

/**
 * Cmd/Ctrl+C copies the selected block and Cmd/Ctrl+V pastes after it. Never
 * when focus is in a text field, input or contenteditable, and copy never
 * when text is selected, so normal text copy and paste keep working. The key
 * is only taken from the browser when the editor acts on it: before the
 * clipboard is ready, copyBlock does nothing and an unready clipboard reads as
 * empty, so both keys go to the browser.
 */
export function handleClipboardKey(event: KeyboardEvent, doc: Document, puck: PuckApi, clipboard: EditorClipboard): void {
  if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
  const key = event.key.toLowerCase()
  if (key !== 'c' && key !== 'v') return
  if (inTextField(event.target) || inTextField(doc.activeElement)) return

  const selected = puck.selectedItem
  if (!selected) return

  if (key === 'c') {
    if (hasTextSelection(doc)) return
    if (puck.getPermissions({ item: selected }).duplicate === false) return
    if (copyBlock(selected, clipboard)) event.preventDefault()
    return
  }

  if (clipboard.read().status === 'empty') return
  event.preventDefault()
  const destination = afterBlock(puck, selected)
  if (destination) pasteBlock(puck, destination.zone, destination.index, clipboard)
}

function ClipboardKeys({ doc, clipboard }: { doc: Document | undefined; clipboard: EditorClipboard }) {
  const getPuck = useGetPuck()
  useEffect(() => {
    if (!doc) return
    const onKeyDown = (event: KeyboardEvent) => handleClipboardKey(event, doc, getPuck(), clipboard)
    doc.addEventListener('keydown', onKeyDown)
    return () => doc.removeEventListener('keydown', onKeyDown)
  }, [doc, getPuck, clipboard])
  return null
}

// -----------------------------------------------------------------------------
// Overrides
// -----------------------------------------------------------------------------

type ActionBarProps = Parameters<Overrides['actionBar']>[0]

/**
 * Adds the clipboard to an editor's overrides without replacing any of them:
 * - `actionBar`: Copy / Paste actions go before the bar's own actions;
 * - `iframe`: keyboard shortcuts inside the preview iframe;
 * - `puck`: keyboard shortcuts in the editor, and the status message.
 *
 * Expects an `actionBar` override to exist (show/hide always adds one).
 */
export function composeClipboardOverrides(overrides: Partial<Overrides>, clipboard: EditorClipboard): Partial<Overrides> {
  const { actionBar: Bar, iframe: HostIframe, puck: HostPuck } = overrides

  return {
    ...overrides,
    ...(Bar
      ? {
          actionBar: (props: ActionBarProps) =>
            createElement(Bar, { ...props, children: createElement(Fragment, null, createElement(ClipboardActions, { clipboard }), props.children) }),
        }
      : {}),
    iframe: (props: { children: ReactNode; document?: Document }) =>
      createElement(
        Fragment,
        null,
        // Without an iframe the canvas shares the editor's document, already covered below
        props.document && typeof document !== 'undefined' && props.document !== document
          ? createElement(ClipboardKeys, { doc: props.document, clipboard })
          : null,
        HostIframe ? createElement(HostIframe, props) : props.children,
      ),
    puck: (props: { children: ReactNode }) =>
      createElement(
        Fragment,
        null,
        createElement(ClipboardKeys, { doc: typeof document === 'undefined' ? undefined : document, clipboard }),
        createElement(ClipboardStatusMessage, { status: clipboard.status }),
        HostPuck ? createElement(HostPuck, props) : props.children,
      ),
  }
}
