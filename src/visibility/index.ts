/**
 * Block visibility — server-safe helpers.
 *
 * Every block can be Shown (the default) or Hidden, and can additionally be
 * hidden on chosen screen sizes. The setting lives on the block's own props
 * under `_visibility`; a missing value means shown, so existing pages need no
 * migration.
 *
 * This module has no React or Puck runtime imports, so it is safe to use from
 * Payload hooks, endpoints and other plugins on the server.
 *
 * @example
 * ```ts
 * import { isBlockHidden, walkShownBlocks } from '@delmaredigital/payload-puck/visibility'
 *
 * walkShownBlocks(page.puckData, config, (block) => {
 *   if (block.type === 'Banner') banners.push(block.props.id)
 * })
 * ```
 */

import type { ComponentData, Config, Data } from '@puckeditor/core'

/** The prop each block stores its visibility under. */
export const VISIBILITY_PROP = '_visibility' as const

/** Screen sizes a block can be hidden on, smallest first. */
export const SCREEN_SIZES = ['phone', 'tablet', 'desktop'] as const

export type ScreenSize = (typeof SCREEN_SIZES)[number]

/**
 * Viewport widths (px) where each screen size starts. Phone is everything
 * below `tablet`. They match the editor's viewport switcher: its Mobile (360),
 * Tablet (768) and Desktop (1280) previews fall in phone, tablet and desktop.
 */
export const SCREEN_BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const

/** Media query matching each screen size. */
export const SCREEN_MEDIA_QUERIES: Readonly<Record<ScreenSize, string>> = {
  phone: `(max-width: ${SCREEN_BREAKPOINTS.tablet - 0.02}px)`,
  tablet: `(min-width: ${SCREEN_BREAKPOINTS.tablet}px) and (max-width: ${SCREEN_BREAKPOINTS.desktop - 0.02}px)`,
  desktop: `(min-width: ${SCREEN_BREAKPOINTS.desktop}px)`,
}

/** The stored value of a block's `_visibility` prop. */
export interface BlockVisibility {
  /** Hidden everywhere. Takes precedence over `hideOn`. */
  hidden?: boolean
  /** Screen sizes the block is hidden on (with CSS; it stays in the HTML). */
  hideOn?: ScreenSize[]
}

/** A block's effective visibility. */
export interface ResolvedBlockVisibility {
  /**
   * True when the block is left out of the live page entirely: it is marked
   * Hidden, or it is hidden on every screen size.
   */
  hidden: boolean
  /**
   * Screen sizes the block is hidden on while it is otherwise shown, smallest
   * first. Always empty when `hidden` is true.
   */
  hideOn: ScreenSize[]
}

/** Anything with a `props` object, e.g. Puck `ComponentData`. */
export type BlockLike = { props?: unknown } | null | undefined

const SHOWN: ResolvedBlockVisibility = Object.freeze({ hidden: false, hideOn: [] as ScreenSize[] }) as ResolvedBlockVisibility

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Reads the raw stored value from a block's props, ignoring anything malformed. */
export function readBlockVisibility(props: unknown): BlockVisibility | undefined {
  if (!isRecord(props)) return undefined
  const raw = props[VISIBILITY_PROP]
  if (!isRecord(raw)) return undefined
  const value: BlockVisibility = {}
  if (raw.hidden === true) value.hidden = true
  if (Array.isArray(raw.hideOn)) {
    const sizes = SCREEN_SIZES.filter((size) => (raw.hideOn as unknown[]).includes(size))
    if (sizes.length) value.hideOn = sizes
  }
  return value
}

/** Resolves a stored value to its effective visibility. */
export function resolveVisibility(value: BlockVisibility | undefined): ResolvedBlockVisibility {
  if (!value) return SHOWN
  const hideOn = SCREEN_SIZES.filter((size) => value.hideOn?.includes(size))
  if (value.hidden === true || hideOn.length === SCREEN_SIZES.length) return { hidden: true, hideOn: [] }
  return hideOn.length ? { hidden: false, hideOn } : SHOWN
}

/** A block's effective visibility. A block with no setting is shown. */
export function getBlockVisibility(block: BlockLike): ResolvedBlockVisibility {
  return resolveVisibility(readBlockVisibility(block?.props))
}

/**
 * True when the block is left out of the live page: it is Hidden, or hidden
 * on every screen size. A block hidden on only some sizes is not hidden — it
 * is still in the page's HTML.
 */
export function isBlockHidden(block: BlockLike): boolean {
  return getBlockVisibility(block).hidden
}

/** True when the block is not visible on the given screen size. */
export function isBlockHiddenOn(block: BlockLike, size: ScreenSize): boolean {
  const visibility = getBlockVisibility(block)
  return visibility.hidden || visibility.hideOn.includes(size)
}

export interface WalkShownBlocksContext {
  /** Id of the block whose slot or zone holds this block; null at the top level. */
  parentId: string | null
  /** The slot or zone holding the block, e.g. `root:default-zone` or `<parentId>:content`. */
  zone: string
}

/**
 * Calls `visit` for every block that appears on the live page, top-down.
 *
 * A hidden block is skipped together with everything inside it. Blocks hidden
 * on only some screen sizes are visited, because they are still in the page.
 * Slots are found through the config's `slot` fields; legacy `data.zones`
 * are followed too.
 */
export function walkShownBlocks(
  data: Partial<Data> | null | undefined,
  config: Pick<Config, 'components'>,
  visit: (block: ComponentData, context: WalkShownBlocksContext) => void,
): void {
  if (!data) return
  const zones = isRecord(data.zones) ? (data.zones as Record<string, unknown>) : {}

  const walkList = (list: unknown, context: WalkShownBlocksContext) => {
    if (!Array.isArray(list)) return
    for (const item of list) {
      if (!isRecord(item) || typeof item.type !== 'string' || !isRecord(item.props)) continue
      const block = item as unknown as ComponentData
      if (isBlockHidden(block)) continue
      visit(block, context)

      const id = typeof block.props.id === 'string' ? block.props.id : null
      const fields = config.components?.[block.type]?.fields
      if (fields) {
        for (const [name, field] of Object.entries(fields)) {
          if ((field as { type?: string } | undefined)?.type === 'slot') {
            walkList((block.props as Record<string, unknown>)[name], { parentId: id, zone: `${id}:${name}` })
          }
        }
      }
      if (id) walkZonesOf(id)
    }
  }

  const walkZonesOf = (parentId: string) => {
    for (const [zone, list] of Object.entries(zones)) {
      if (zone.slice(0, zone.indexOf(':')) === parentId) walkList(list, { parentId, zone })
    }
  }

  walkList(data.content, { parentId: null, zone: 'root:default-zone' })
  for (const [zone, list] of Object.entries(zones)) {
    if (zone.startsWith('root:')) walkList(list, { parentId: null, zone })
  }
}

// -----------------------------------------------------------------------------
// Editing helpers (pure) — used by the sidebar field and the action bar toggle
// -----------------------------------------------------------------------------

/** Removes empty parts so a fully shown block stores nothing. */
function compact(value: BlockVisibility): BlockVisibility | undefined {
  const next: BlockVisibility = {}
  if (value.hidden) next.hidden = true
  const hideOn = SCREEN_SIZES.filter((size) => value.hideOn?.includes(size))
  if (hideOn.length) next.hideOn = hideOn
  return next.hidden || next.hideOn ? next : undefined
}

/**
 * Marks a block Hidden or Shown. Hiding keeps any screen-size choices so
 * showing the block again restores them; a block that was only hidden because
 * every size was ticked comes back shown on all sizes.
 */
export function setBlockHidden(value: BlockVisibility | undefined, hidden: boolean): BlockVisibility | undefined {
  if (hidden) return compact({ ...value, hidden: true })
  const hideOn = value?.hideOn ?? []
  return compact({ hideOn: hideOn.length === SCREEN_SIZES.length ? [] : hideOn })
}

/**
 * Turns hiding on one screen size on or off. Ticking the last remaining size
 * makes the block Hidden, so it is left out of the page instead of being sent
 * and hidden everywhere with CSS.
 */
export function setBlockHiddenOn(
  value: BlockVisibility | undefined,
  size: ScreenSize,
  hide: boolean,
): BlockVisibility | undefined {
  const current = new Set(value?.hideOn ?? [])
  if (hide) current.add(size)
  else current.delete(size)
  if (current.size === SCREEN_SIZES.length) return { hidden: true }
  return compact({ hidden: value?.hidden, hideOn: [...current] as ScreenSize[] })
}

/** Badge text for a block's state, or null when it is shown everywhere. */
export function describeVisibility(visibility: ResolvedBlockVisibility): string | null {
  if (visibility.hidden) return 'Hidden'
  if (!visibility.hideOn.length) return null
  const names = visibility.hideOn
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  return `Hidden on ${list}`
}
