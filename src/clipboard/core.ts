/**
 * Block clipboard: what may be pasted where, and copying a block's data.
 * Storage, scope and expiry live in `./storage.ts` (re-exported here).
 *
 * No React here: the paste checks and id regeneration are plain functions,
 * tested on their own.
 */

import { walkTree, type ComponentData, type Config, type Content } from '@puckeditor/core'
import type { PasteDestination } from './types.js'
import { isRecord, slotsInBlock, type SlotInfo } from '../utils/slots.js'

export { slotsInBlock, type SlotInfo }

export * from './storage.js'

export const CLIPBOARD_STRINGS = {
  copy: 'Copy block',
  pasteAfter: 'Paste after',
  pasteInside: 'Paste inside',
  pasteInto: (slot: string) => `Paste into ${slot}`,
  copied: 'Block copied.',
  pasted: 'Block pasted.',
  unreadable: 'The copied block came from a different version of the editor. Copy it again.',
  unknownType: (type: string) => `This editor has no "${type}" block, so the copied block can't be pasted here.`,
  notAllowed: (block: string, slot: string) => `${block} can't go in ${slot}.`,
  noInsert: (block: string) => `${block} can't be added here.`,
  cantCopy: "This block holds something that can't be copied.",
  vetoed: "This block can't be pasted here.",
}

// -----------------------------------------------------------------------------
// Slots
// -----------------------------------------------------------------------------

/** The block type's name for messages: its label, else its key. */
export function blockLabel(type: string, config: Config): string {
  return config.components[type]?.label || type
}

function slotAllows(slot: Pick<SlotInfo, 'allow' | 'disallow'>, type: string): boolean {
  if (slot.allow && !slot.allow.includes(type)) return false
  if (slot.disallow && slot.disallow.includes(type)) return false
  return true
}

// -----------------------------------------------------------------------------
// Checks
// -----------------------------------------------------------------------------

/** The slot a paste goes into, as `checkPaste` needs it. */
export interface SlotTarget {
  /** The block the slot belongs to, or undefined for the page itself (root). */
  parent?: ComponentData
  /** The slot's prop path on the parent, from the zone `<parentId>:<path>`. */
  slotPath: string
}

export type PasteCheck = { ok: true } | { ok: false; reason: string }

const isBlock = (value: unknown): value is ComponentData =>
  isRecord(value) && typeof value.type === 'string' && isRecord(value.props)

/**
 * Whether `block` may be pasted at `target`, stopping at the first refusal:
 * - it is well formed: a `{ type, props }` whose slots, at every depth, are
 *   arrays of blocks (else the copy is reported as unreadable);
 * - its type, and every type nested in it, exists in this editor's config;
 * - `veto` asks the `blockClipboard.canPaste` hooks, if supplied;
 * - the destination slot allows it (`allow` / `disallow`), and so does each
 *   slot inside it for the blocks it holds;
 * - Puck's `insert` permission allows its type.
 *
 * The page itself (root) and legacy DropZones have no allow list this can
 * read, so only the other checks apply there; Puck's own drag and drop has
 * the same view of them.
 */
export function checkPaste(
  block: ComponentData,
  target: SlotTarget,
  config: Config,
  canInsert: (type: string) => boolean,
  veto?: () => string | undefined,
): PasteCheck {
  const problem = findCopyProblem(block, config)
  if (problem) return { ok: false, reason: problem }

  const refusal = veto?.()
  if (refusal) return { ok: false, reason: refusal }

  if (target.parent) {
    const slot = slotsInBlock(target.parent, config).find((s) => s.path === target.slotPath)
    if (slot && !slotAllows(slot, block.type)) {
      return { ok: false, reason: CLIPBOARD_STRINGS.notAllowed(blockLabel(block.type, config), slot.label) }
    }
  }

  const disallowed = findDisallowed(block, config)
  if (disallowed) return { ok: false, reason: disallowed }

  if (!canInsert(block.type)) return { ok: false, reason: CLIPBOARD_STRINGS.noInsert(blockLabel(block.type, config)) }
  return { ok: true }
}

/**
 * The first reason `block` can't be pasted at all, walking every slot at
 * every depth: malformed or an unknown type. Puck's walkTree throws on
 * unknown types, so this walks by itself.
 */
function findCopyProblem(block: unknown, config: Config): string | undefined {
  if (!isBlock(block)) return CLIPBOARD_STRINGS.unreadable
  if (!config.components[block.type]) return CLIPBOARD_STRINGS.unknownType(block.type)
  for (const slot of slotsInBlock(block, config)) {
    if (slot.value === undefined) continue
    if (!Array.isArray(slot.value)) return CLIPBOARD_STRINGS.unreadable
    for (const child of slot.value) {
      const problem = findCopyProblem(child, config)
      if (problem) return problem
    }
  }
  return undefined
}

/** The first nested slot refusal, after the whole copy is readable and known. */
function findDisallowed(block: ComponentData, config: Config): string | undefined {
  for (const slot of slotsInBlock(block, config)) {
    for (const child of (slot.value ?? []) as ComponentData[]) {
      const problem = findDisallowed(child, config)
      if (problem) return problem
      if (!slotAllows(slot, child.type)) {
        return CLIPBOARD_STRINGS.notAllowed(blockLabel(child.type, config), slot.label)
      }
    }
  }
  return undefined
}

// -----------------------------------------------------------------------------
// Copying
// -----------------------------------------------------------------------------

/**
 * The block as the clipboard keeps it: the same JSON that saving the page
 * would store. `undefined` values are left out and a Date becomes its ISO
 * string, as when the page is saved. A block holding something JSON can't
 * carry (a function, a React element, a Map, a class instance) can't be
 * copied; undefined is returned and the editor says so.
 */
export function toClipboardBlock(block: ComponentData): ComponentData | undefined {
  const plain = (value: unknown): unknown => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
    if (Array.isArray(value)) return value.map((item) => (item === undefined ? null : plain(item)))
    if (isRecord(value)) {
      const proto = Object.getPrototypeOf(value)
      // React elements fail on their Symbol `$$typeof`; Maps, Dates' kin and class instances here
      if (proto !== Object.prototype && proto !== null) throw new TypeError('not plain')
      const out: Record<string, unknown> = {}
      for (const [key, item] of Object.entries(value)) {
        if (item !== undefined) out[key] = plain(item)
      }
      return out
    }
    throw new TypeError('not JSON')
  }
  try {
    return plain(block) as ComponentData
  } catch {
    return undefined
  }
}

/**
 * Asks each block type's `blockClipboard.canPaste` hook: first every block
 * the paste lands inside (nearest first, so a container can refuse anything
 * pasted anywhere beneath it), then the pasted block's own type. Returns the
 * first refusal message, or undefined when all allow it. A hook that throws,
 * or returns something other than `true` or a message, refuses the paste.
 */
export function vetoPaste(block: ComponentData, destination: PasteDestination, config: Config): string | undefined {
  const ask = (type: string, ancestor?: PasteDestination['ancestors'][number]): string | undefined => {
    const canPaste = config.components[type]?.blockClipboard?.canPaste
    if (!canPaste) return undefined
    try {
      const answer = canPaste({ block, destination, ancestor })
      if (answer === true) return undefined
      return typeof answer === 'string' && answer.trim() ? answer : CLIPBOARD_STRINGS.vetoed
    } catch (error) {
      console.error(`[payload-puck] blockClipboard.canPaste for "${type}" threw; paste refused:`, error)
      return CLIPBOARD_STRINGS.vetoed
    }
  }
  for (const ancestor of destination.ancestors) {
    const message = ask(ancestor.type, ancestor)
    if (message) return message
  }
  return ask(block.type)
}

// -----------------------------------------------------------------------------
// Ids
// -----------------------------------------------------------------------------

/**
 * A random v4 UUID. `crypto.randomUUID` only exists in secure contexts (an
 * admin on https or localhost), so like Puck's own ids this falls back to
 * `crypto.getRandomValues`, and to `Math.random` only when there is no Web
 * Crypto at all. Ids only need to be unique within a page, not secret.
 */
export function randomUuid(cryptoApi: Partial<Crypto> | undefined = globalThis.crypto): string {
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()
  const bytes = new Uint8Array(16)
  if (typeof cryptoApi?.getRandomValues === 'function') cryptoApi.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** The same id shape Puck gives new blocks: `<type>-<uuid>`. */
export function newBlockId(type: string): string {
  return `${type}-${randomUuid()}`
}

/**
 * A copy of `block` where it and every block nested in it have new ids, as
 * Puck's own Duplicate does, so the paste never collides with the original.
 */
export function withNewIds(block: ComponentData, config: Config): ComponentData {
  const copy = structuredClone(block)
  return walkTree(
    { ...copy, props: { ...copy.props, id: newBlockId(copy.type) } },
    config,
    (content: Content) => content.map((child) => ({ ...child, props: { ...child.props, id: newBlockId(child.type) } })),
  ) as ComponentData
}
