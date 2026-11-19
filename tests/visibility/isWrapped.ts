/**
 * Test helper: whether a component config renders through show/hide exactly
 * once. The wrapper's displayName is `BlockVisibility(<inner render name>)`;
 * a wrapper around a wrapper (`BlockVisibility(BlockVisibility(...))`) means
 * a block was wrapped twice, which would be a bug, so it doesn't count.
 */
export function isWrapped(component: { render?: unknown } | undefined): boolean {
  const render = component?.render
  if (typeof render !== 'function') return false
  const name = (render as { displayName?: string }).displayName ?? ''
  return name.startsWith('BlockVisibility(') && !name.startsWith('BlockVisibility(BlockVisibility(')
}
