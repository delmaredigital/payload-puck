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

/**
 * Per-block-type settings for show/hide, set on the component config:
 *
 * ```ts
 * const ListItem: ComponentConfig = {
 *   blockVisibility: { screenSizes: false },
 *   render: ({ text }) => <li>{text}</li>,
 * }
 * ```
 */
export interface BlockVisibilityComponentOptions {
  /**
   * Set false to offer only Shown / Hidden for this block type, without the
   * per-screen-size options. Use it for blocks whose root must be a direct
   * child of its parent: `<li>`, `<tr>` and other table or list parts, or
   * blocks styled by sibling selectors such as `:first-child` or `space-y-*`.
   * Per-size hiding wraps the block in a `display: contents` element, which
   * those can't tolerate.
   */
  screenSizes?: boolean
}

declare module '@puckeditor/core' {
  interface ComponentConfigExtensions {
    /** payload-puck show/hide settings for this block type. */
    blockVisibility?: BlockVisibilityComponentOptions
  }
}

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

/**
 * Media query matching each screen size. Classic min/max form rather than
 * range syntax (`width < 768px`), which Safari before 16.4 ignores: there the
 * rules would be dropped and blocks hidden per size would show everywhere.
 * The `.98` upper bounds leave no gap on fractional (zoomed) widths.
 */
export const SCREEN_MEDIA_QUERIES: Readonly<Record<ScreenSize, string>> = Object.freeze({
  phone: `(max-width: ${SCREEN_BREAKPOINTS.tablet - 0.02}px)`,
  tablet: `(min-width: ${SCREEN_BREAKPOINTS.tablet}px) and (max-width: ${SCREEN_BREAKPOINTS.desktop - 0.02}px)`,
  desktop: `(min-width: ${SCREEN_BREAKPOINTS.desktop}px)`,
})

/**
 * The stored value of a block's `_visibility` prop. This shape is a stable
 * public contract that other code may read directly:
 *
 * `{ hidden?: true, hideOn?: ('phone' | 'tablet' | 'desktop')[] }`
 *
 * A missing or malformed value means shown. Hidden on all three sizes means
 * fully hidden. Prefer the helpers below, which apply those rules.
 */
export interface BlockVisibility {
  /** Hidden everywhere. Takes precedence over `hideOn`. Only ever `true` or absent. */
  hidden?: true
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
  // A fresh object every time: callers may keep or change it
  const hideOn = SCREEN_SIZES.filter((size) => value?.hideOn?.includes(size))
  if (value?.hidden === true || hideOn.length === SCREEN_SIZES.length) return { hidden: true, hideOn: [] }
  return { hidden: false, hideOn }
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
  /**
   * The slot or zone holding the block, e.g. `root:default-zone`,
   * `<parentId>:content`, or for a slot inside an array field
   * `<parentId>:items[0].content`.
   */
  zone: string
}

type FieldsLike = Record<string, unknown>

/**
 * Slot contents of one block, following slot fields nested inside `array` and
 * `object` fields the way Puck does.
 */
function slotsOf(
  fields: unknown,
  props: unknown,
  path: string,
  out: Array<[string, unknown]>,
  seen: Set<object>,
): void {
  // Field definitions and prop values both come from outside; stop on repeats
  if (!isRecord(fields) || !isRecord(props) || seen.has(props)) return
  seen.add(props)
  for (const [name, field] of Object.entries(fields as FieldsLike)) {
    if (!isRecord(field)) continue
    const value = props[name]
    const at = path ? `${path}.${name}` : name
    if (field.type === 'slot') {
      out.push([at, value])
    } else if (field.type === 'array' && Array.isArray(value)) {
      value.forEach((item, index) => slotsOf(field.arrayFields, item, `${at}[${index}]`, out, seen))
    } else if (field.type === 'object') {
      slotsOf(field.objectFields, value, at, out, seen)
    }
  }
}

/**
 * Visits every block in the data top-down: slots (also inside array and
 * object fields) and legacy `data.zones`. With `skipHidden`, a hidden block is
 * skipped together with everything inside it.
 *
 * Never throws on malformed data, and stops at repeated zones or blocks, so
 * cyclic data can't recurse forever.
 * @internal
 */
export function forEachBlock(
  data: Partial<Data> | null | undefined,
  config: Pick<Config, 'components'> | null | undefined,
  visit: (block: ComponentData, context: WalkShownBlocksContext) => void,
  { skipHidden }: { skipHidden: boolean },
): void {
  if (!isRecord(data)) return
  const components = isRecord(config?.components) ? (config!.components as Record<string, unknown>) : {}
  const zones = isRecord(data.zones) ? (data.zones as Record<string, unknown>) : {}
  const seenBlocks = new Set<object>()
  const seenZones = new Set<string>()

  // Legacy zones by parent id. A key without "parent:" can't be placed; skip it
  const zonesByParent = new Map<string, string[]>()
  for (const zone of Object.keys(zones)) {
    const colon = zone.indexOf(':')
    if (colon <= 0) continue
    const parent = zone.slice(0, colon)
    zonesByParent.set(parent, [...(zonesByParent.get(parent) ?? []), zone])
  }

  // Iterative, depth-first, top-down: no recursion, so no stack overflow on deep data
  type Entry = { item: unknown; context: WalkShownBlocksContext }
  const stack: Entry[] = []
  const listEntries = (list: unknown, context: WalkShownBlocksContext): Entry[] =>
    Array.isArray(list) ? list.map((item) => ({ item, context })) : []
  const zoneEntries = (parentId: string): Entry[] =>
    (zonesByParent.get(parentId) ?? []).flatMap((zone) => {
      if (seenZones.has(zone)) return []
      seenZones.add(zone)
      return listEntries(zones[zone], { parentId: parentId === 'root' ? null : parentId, zone })
    })
  const push = (entries: Entry[]) => {
    for (let i = entries.length - 1; i >= 0; i--) stack.push(entries[i])
  }

  push([...listEntries(data.content, { parentId: null, zone: 'root:default-zone' }), ...zoneEntries('root')])

  while (stack.length) {
    const { item, context } = stack.pop()!
    if (!isRecord(item) || typeof item.type !== 'string' || !isRecord(item.props)) continue
    if (seenBlocks.has(item)) continue
    seenBlocks.add(item)
    const block = item as unknown as ComponentData
    if (skipHidden && isBlockHidden(block)) continue
    visit(block, context)

    const id = typeof block.props.id === 'string' ? block.props.id : null
    const component = components[block.type]
    const slots: Array<[string, unknown]> = []
    slotsOf(isRecord(component) ? component.fields : undefined, block.props, '', slots, new Set())
    push([
      ...slots.flatMap(([path, value]) => listEntries(value, { parentId: id, zone: `${id}:${path}` })),
      ...(id ? zoneEntries(id) : []),
    ])
  }
}

/**
 * Calls `visit` for every block that appears on the live page, top-down.
 *
 * A hidden block is skipped together with everything inside it. Blocks hidden
 * on only some screen sizes are visited, because they are still in the page.
 * Slots are found through the config's `slot` fields, including slots inside
 * `array` and `object` fields; legacy `data.zones` are followed too.
 *
 * Limit: slots that a component only adds at runtime through `resolveFields`
 * aren't in the static config, so blocks inside them are not visited.
 *
 * Never throws, whatever the data.
 */
export function walkShownBlocks(
  data: Partial<Data> | null | undefined,
  config: Pick<Config, 'components'>,
  visit: (block: ComponentData, context: WalkShownBlocksContext) => void,
): void {
  forEachBlock(data, config, visit, { skipHidden: true })
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
