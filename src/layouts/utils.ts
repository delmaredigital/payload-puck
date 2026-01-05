/**
 * Layout Utilities
 *
 * Functions for working with layout configurations.
 */

import type { LayoutDefinition, LayoutConfig, LayoutOption } from './types'
import { DEFAULT_LAYOUTS, DEFAULT_LAYOUT_CONFIG } from './defaults'

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
