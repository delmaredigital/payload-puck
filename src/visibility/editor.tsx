'use client'

/**
 * Editor side of block visibility: the action bar toggle and the styles that
 * gray hidden blocks in the canvas and tag them in the Outline.
 *
 * `composeVisibilityOverrides` wraps the editor's final overrides, so a host's
 * own `actionBar`, `iframe` or `puck` override keeps working with these added.
 */

import { createElement, Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ActionBar, createUsePuck, type ComponentData, type Config, type Data, type Overrides, type PuckAction } from '@puckeditor/core'
import { Eye, EyeOff } from 'lucide-react'
import { buildCanvasCss, buildOutlineCss, type VisibilityEntry } from './css.js'
import { VISIBILITY_STRINGS } from './BlockVisibilityField.js'
import { VISIBILITY_PROP, forEachBlock, getBlockVisibility, readBlockVisibility, setBlockHidden } from './core.js'

const usePuck = createUsePuck()

/**
 * Every block with a visibility setting, including blocks inside hidden ones
 * and blocks in legacy DropZone zones.
 */
export function collectVisibilityEntries(data: Data, config: Config): VisibilityEntry[] {
  const entries: VisibilityEntry[] = []
  forEachBlock(data, config, (block) => {
    const visibility = getBlockVisibility(block)
    if ((visibility.hidden || visibility.hideOn.length) && typeof block.props?.id === 'string') {
      entries.push({ id: block.props.id, visibility })
    }
  }, { skipHidden: false })
  return entries
}

/**
 * One walk per data change, shared by the canvas and editor styles (they
 * render in different documents, so they can't share a React memo).
 */
const entriesCache = new WeakMap<object, { config: Config; entries: VisibilityEntry[] }>()

export function visibilityEntriesFor(data: Data, config: Config): VisibilityEntry[] {
  const cached = entriesCache.get(data)
  if (cached?.config === config) return cached.entries
  const entries = collectVisibilityEntries(data, config)
  entriesCache.set(data, { config, entries })
  return entries
}

function useVisibilityEntries(): VisibilityEntry[] {
  const data = usePuck((s) => s.appState.data)
  const config = usePuck((s) => s.config)
  return visibilityEntriesFor(data, config)
}

/** Grays hidden blocks in the canvas. Rendered inside the preview iframe. */
export function VisibilityCanvasStyles() {
  const css = buildCanvasCss(useVisibilityEntries())
  return css ? createElement('style', { 'data-payload-puck-visibility': 'canvas' }, css) : null
}

/** Tags hidden blocks in the Outline, and covers the canvas when it isn't in an iframe. */
export function VisibilityEditorStyles() {
  const entries = useVisibilityEntries()
  const css = [buildOutlineCss(entries), buildCanvasCss(entries)].filter(Boolean).join('\n')
  return css ? createElement('style', { 'data-payload-puck-visibility': 'editor' }, css) : null
}

/**
 * The Puck action that flips a block between Shown and Hidden. A `replace`,
 * so Puck records it in history (undo/redo) like any other edit.
 */
export function toggleVisibilityAction(
  block: ComponentData,
  selector: { index: number; zone: string },
): PuckAction {
  const props: Record<string, unknown> = { ...block.props }
  const next = setBlockHidden(readBlockVisibility(props), !getBlockVisibility(block).hidden)
  if (next) props[VISIBILITY_PROP] = next
  else delete props[VISIBILITY_PROP]
  return {
    type: 'replace',
    destinationIndex: selector.index,
    destinationZone: selector.zone,
    data: { ...block, props } as ComponentData,
  }
}

type PuckLookups = {
  getSelectorForId: (id: string) => unknown
  getItemById: (id: string) => ComponentData | undefined
}

/**
 * The block an action bar belongs to, or undefined if it no longer exists.
 * The owner id comes from the DOM and can briefly name a block that was just
 * removed (delete, undo). Puck's getItemById throws for an unknown id, so the
 * node is checked first: getSelectorForId returns undefined for a missing one.
 */
export function ownerBlock(puck: PuckLookups, owner: string | null): ComponentData | undefined {
  return owner && puck.getSelectorForId(owner) ? puck.getItemById(owner) : undefined
}

/** Marks which block an overlay (and so its action bar) belongs to. */
export const OWNER_ATTRIBUTE = 'data-payload-puck-visibility-owner'

/**
 * Hide/show toggle for the action bar. It acts on the block whose bar it sits
 * in: Puck draws each block's action bar and overlay together in one
 * `[data-puck-overlay]` element, and our componentOverlay override marks that
 * element with the block id. Puck gives the action bar no id of its own.
 *
 * Not shown when the block can't be edited (Puck `permissions.edit` false).
 */
export function VisibilityAction() {
  const anchor = useRef<HTMLSpanElement>(null)
  const [owner, setOwner] = useState<string | null>(null)

  useLayoutEffect(() => {
    const id = anchor.current
      ?.closest('[data-puck-overlay]')
      ?.querySelector(`[${OWNER_ATTRIBUTE}]`)
      ?.getAttribute(OWNER_ATTRIBUTE) ?? null
    if (id !== owner) setOwner(id)
  })

  const block = usePuck((s) => ownerBlock(s, owner))
  const canEdit = usePuck((s) => (block ? s.getPermissions({ item: block }).edit !== false : false))
  const dispatch = usePuck((s) => s.dispatch)
  const getSelectorForId = usePuck((s) => s.getSelectorForId)

  let action: ReactNode = null
  if (block && canEdit) {
    const hidden = getBlockVisibility(block).hidden
    action = createElement(ActionBar.Action, {
      onClick: () => {
        const selector = getSelectorForId(block.props.id as string)
        if (selector) dispatch(toggleVisibilityAction(block, selector))
      },
      label: hidden ? VISIBILITY_STRINGS.showAction : VISIBILITY_STRINGS.hideAction,
      active: hidden,
      children: createElement(hidden ? EyeOff : Eye, { size: 16 }),
    })
  }

  // The anchor is layout-neutral; it only lets the toggle find its overlay
  return createElement('span', { ref: anchor, style: { display: 'contents' } }, action)
}

type ActionBarProps = Parameters<Overrides['actionBar']>[0]
type OverlayProps = Parameters<Overrides['componentOverlay']>[0]

/** Puck's default action bar layout (not exported by Puck). */
export function DefaultActionBar({ label, children, parentAction, dragHandle }: ActionBarProps) {
  return createElement(
    ActionBar,
    null,
    createElement(ActionBar.Group, null, parentAction, label ? createElement(ActionBar.Label, { label }) : null),
    createElement(ActionBar.Group, null, children),
    dragHandle ? createElement(ActionBar.Group, null, dragHandle) : null,
  )
}

/**
 * Adds visibility to an editor's overrides without replacing any of them:
 * - `actionBar`: the toggle is passed as the first action into the host's
 *   action bar (or Puck's default one);
 * - `componentOverlay`: a hidden marker naming the block, so the toggle knows
 *   which block its bar belongs to;
 * - `iframe`: canvas styles are added next to the existing preview wrapper;
 * - `puck`: Outline styles are added around the existing editor UI.
 */
export function composeVisibilityOverrides(overrides: Partial<Overrides>): Partial<Overrides> {
  const { actionBar: HostActionBar, componentOverlay: HostOverlay, iframe: HostIframe, puck: HostPuck } = overrides
  const Bar = HostActionBar ?? DefaultActionBar

  return {
    ...overrides,
    actionBar: (props: ActionBarProps) =>
      createElement(Bar, props, createElement(VisibilityAction, null), props.children),
    componentOverlay: (props: OverlayProps) =>
      createElement(
        Fragment,
        null,
        createElement('span', { hidden: true, [OWNER_ATTRIBUTE]: props.componentId }),
        HostOverlay ? createElement(HostOverlay, props) : props.children,
      ),
    iframe: (props: { children: ReactNode; document?: Document }) =>
      createElement(
        Fragment,
        null,
        createElement(VisibilityCanvasStyles, null),
        HostIframe ? createElement(HostIframe, props) : props.children,
      ),
    puck: (props: { children: ReactNode }) =>
      createElement(
        Fragment,
        null,
        createElement(VisibilityEditorStyles, null),
        HostPuck ? createElement(HostPuck, props) : props.children,
      ),
  }
}
