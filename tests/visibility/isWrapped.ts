/**
 * Test helper: whether a component config renders through show/hide. The
 * wrapper's displayName is `BlockVisibility(<inner render name>)`.
 */
export function isWrapped(component: { render?: unknown } | undefined): boolean {
  const render = component?.render
  if (typeof render !== 'function') return false
  return /^BlockVisibility\(/.test((render as { displayName?: string }).displayName ?? '')
}
