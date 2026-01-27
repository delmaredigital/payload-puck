/**
 * Layout Utilities
 *
 * Functions for working with layout configurations.
 */

import type { LayoutDefinition, LayoutConfig, LayoutOption } from './types.js'
import { DEFAULT_LAYOUTS, DEFAULT_LAYOUT_CONFIG } from './defaults.js'

/**
 * Resolves a layout config, merging with defaults if needed
 */
export function resolveLayoutConfig(config?: Partial<LayoutConfig>): LayoutConfig {
  if (!config) return DEFAULT_LAYOUT_CONFIG

  return {
    layouts: config.layouts ?? DEFAULT_LAYOUTS,
    defaultLayout: config.defaultLayout ?? 'default',
  }
}

/**
 * Gets a layout definition by value
 */
export function getLayout(
  layouts: LayoutDefinition[],
  value: string,
  fallback = 'default'
): LayoutDefinition | undefined {
  const layout = layouts.find((l) => l.value === value)
  if (layout) return layout

  // Try fallback
  if (value !== fallback) {
    return layouts.find((l) => l.value === fallback)
  }

  // Return first layout if nothing matches
  return layouts[0]
}

/**
 * Converts layout definitions to Puck select options
 */
export function layoutsToOptions(layouts: LayoutDefinition[]): LayoutOption[] {
  return layouts.map(({ value, label, description }) => ({
    value,
    label,
    description,
  }))
}

/**
 * Converts layout definitions to Payload select options
 */
export function layoutsToPayloadOptions(
  layouts: LayoutDefinition[]
): Array<{ label: string; value: string }> {
  return layouts.map(({ value, label }) => ({
    label,
    value,
  }))
}

/**
 * Creates a custom layout definition
 */
export function createLayout(
  config: Omit<LayoutDefinition, 'value' | 'label'> & {
    value: string
    label: string
  }
): LayoutDefinition {
  return {
    ...config,
  }
}

/**
 * Merges layout configurations
 */
export function mergeLayouts(
  base: LayoutDefinition[],
  custom: LayoutDefinition[],
  options?: {
    /** Replace base layouts instead of merging */
    replace?: boolean
    /** Exclude these layout values from base */
    exclude?: string[]
  }
): LayoutDefinition[] {
  if (options?.replace) {
    return custom
  }

  let result = [...base]

  // Exclude specified layouts
  if (options?.exclude) {
    result = result.filter((l) => !options.exclude!.includes(l.value))
  }

  // Merge/override with custom layouts
  for (const customLayout of custom) {
    const existingIndex = result.findIndex((l) => l.value === customLayout.value)
    if (existingIndex >= 0) {
      result[existingIndex] = customLayout
    } else {
      result.push(customLayout)
    }
  }

  return result
}

/**
 * Creates render-ready layouts by stripping header/footer components.
 *
 * Use this when your host application already provides a global header/footer
 * via its root layout (e.g., Next.js layout.tsx), and you want to avoid
 * double headers/footers when rendering Puck pages.
 *
 * **Why this exists:**
 * - Editor layouts need header/footer components for realistic preview in the Puck editor iframe
 * - Render layouts typically should NOT include header/footer since the host app provides them
 *
 * @example
 * ```tsx
 * // In your host app's page renderer:
 * import { HybridPageRenderer, createRenderLayouts } from '@delmaredigital/payload-puck/render'
 * import { siteLayouts } from '@/lib/puck-layouts' // layouts with header/footer for editor
 *
 * // Strip header/footer for rendering (host app layout provides them)
 * const renderLayouts = createRenderLayouts(siteLayouts)
 *
 * export function PageRenderer({ page }) {
 *   return (
 *     <HybridPageRenderer
 *       page={page}
 *       layouts={renderLayouts}
 *       legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 *     />
 *   )
 * }
 * ```
 *
 * @param editorLayouts - Layouts configured for the Puck editor (with header/footer)
 * @returns Layouts without header/footer components, suitable for PageRenderer/HybridPageRenderer
 */
export function createRenderLayouts(editorLayouts: LayoutDefinition[]): LayoutDefinition[] {
  return editorLayouts.map(({ header, footer, ...rest }) => rest)
}
