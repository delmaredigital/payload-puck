/**
 * CSS for block visibility. Pure string builders, no React.
 *
 * - Live page: one fixed stylesheet that hides `display: contents` wrappers
 *   per screen size.
 * - Editor canvas: rules keyed on `[data-puck-component="<id>"]`, the attribute
 *   Puck puts on every block in the canvas, to gray hidden blocks and badge them.
 * - Editor Outline: rules keyed on `[data-puck-layer-tree-id="<id>"]`, the
 *   attribute Puck puts on every Outline row. Puck does not document it; if a
 *   Puck release drops it the rules simply match nothing.
 */

import { SCREEN_MEDIA_QUERIES, SCREEN_SIZES, describeVisibility, type ResolvedBlockVisibility, type ScreenSize } from './core.js'

/**
 * Class on every per-size `display: contents` wrapper. Parents that style
 * their direct children (`> *`) can reach through it with
 * `> .payload-puck-visibility > *`.
 */
export const VISIBILITY_WRAPPER_CLASS = 'payload-puck-visibility'

/** Class that hides a live-page block on one screen size. */
export const hideOnClassName = (size: ScreenSize) => `payload-puck-hide-on-${size}`

/** `href` that lets React dedupe and hoist the live-page stylesheet. */
export const LIVE_STYLE_HREF = 'payload-puck-block-visibility'

export const LIVE_CSS = SCREEN_SIZES.map(
  (size) => `@media ${SCREEN_MEDIA_QUERIES[size]}{.${hideOnClassName(size)}{display:none!important}}`,
).join('\n')

/**
 * Quotes a value for use inside a CSS string or attribute selector. Block ids
 * come from page data, so everything except letters, digits, space, `_` and
 * `-` is hex-escaped: no quote, newline (\n, \r, \f), backslash or `<` can end
 * the string, the rule or the <style> element. NUL becomes U+FFFD, as CSS does.
 */
export function cssString(value: string): string {
  let out = ''
  for (const char of value) {
    const code = char.codePointAt(0)!
    out += /[A-Za-z0-9 _-]/.test(char) ? char : `\\${(code === 0 ? 0xfffd : code).toString(16)} `
  }
  return `"${out}"`
}

export interface VisibilityEntry {
  id: string
  visibility: ResolvedBlockVisibility
}

const BADGE =
  'position:absolute;top:4px;left:4px;z-index:2;pointer-events:none;' +
  'padding:1px 6px;border-radius:4px;background:#1f2937;color:#fff;' +
  'font:600 11px/1.5 system-ui,-apple-system,sans-serif;letter-spacing:.02em;white-space:nowrap;'

const GRAY = 'opacity:.45;filter:grayscale(1);'

const OUTLINE = 'outline:2px dashed #9ca3af;outline-offset:-2px;'

/**
 * Canvas rules. A hidden block's content is grayed and outlined and carries a
 * badge. The block element itself is not dimmed, and Puck draws its action bar
 * in a separate overlay, so the toolbar stays at full strength. A block hidden
 * on some screen sizes is badged everywhere and grayed only at those sizes.
 */
export function buildCanvasCss(entries: VisibilityEntry[]): string {
  const rules: string[] = []
  for (const { id, visibility } of entries) {
    const badge = describeVisibility(visibility)
    if (!badge) continue
    const block = `[data-puck-component=${cssString(id)}]`
    rules.push(`${block}::after{content:${cssString(badge)};${BADGE}}`)
    if (visibility.hidden) {
      rules.push(`${block}>*{${GRAY}}`, `${block}{${OUTLINE}}`)
    } else {
      for (const size of visibility.hideOn) {
        rules.push(`@media ${SCREEN_MEDIA_QUERIES[size]}{${block}>*{${GRAY}}${block}{${OUTLINE}}}`)
      }
    }
  }
  return rules.join('\n')
}

const TAG =
  'position:absolute;top:6px;right:8px;z-index:1;pointer-events:none;' +
  'padding:0 6px;border-radius:4px;background:#e5e7eb;color:#374151;' +
  'font:600 10px/1.6 system-ui,-apple-system,sans-serif;white-space:nowrap;'

/**
 * Outline rules. A Hidden block's row (and the rows inside it) is dimmed and
 * tagged; a block hidden on some sizes is tagged only. The tag gives way to
 * Puck's row actions on hover.
 */
export function buildOutlineCss(entries: VisibilityEntry[]): string {
  const rules: string[] = []
  for (const { id, visibility } of entries) {
    const tag = describeVisibility(visibility)
    if (!tag) continue
    const row = `[data-puck-layer-tree-id=${cssString(id)}]`
    rules.push(
      `${row}{position:relative;${visibility.hidden ? 'opacity:.55;' : ''}}`,
      `${row}::before{content:${cssString(tag)};${TAG}}`,
      `${row}:hover::before{visibility:hidden}`,
    )
  }
  return rules.join('\n')
}
