import type { RootPropsMapping } from '../types'

/**
 * Default mappings from Puck root.props to Payload fields
 *
 * These mappings sync common page properties from Puck's visual editor
 * to the corresponding Payload collection fields.
 *
 * SEO fields use the official @payloadcms/plugin-seo convention: meta.title, meta.description
 */
export const DEFAULT_ROOT_PROPS_MAPPINGS: RootPropsMapping[] = [
  // Core page fields
  { from: 'title', to: 'title' },
  { from: 'slug', to: 'slug' },
  { from: 'pageLayout', to: 'pageLayout' },
  { from: 'pageType', to: 'pageType' },
  { from: 'isHomepage', to: 'isHomepage' },

  // Page-tree integration fields
  { from: 'folder', to: 'folder' },
  { from: 'pageSegment', to: 'pageSegment' },

  // SEO/Meta fields (uses official @payloadcms/plugin-seo convention)
  { from: 'metaTitle', to: 'meta.title' },
  { from: 'metaDescription', to: 'meta.description' },
  { from: 'noindex', to: 'meta.noindex' },
  { from: 'nofollow', to: 'meta.nofollow' },
  { from: 'excludeFromSitemap', to: 'meta.excludeFromSitemap' },

  // Conversion tracking fields
  { from: 'isConversionPage', to: 'conversionTracking.isConversionPage' },
  { from: 'conversionType', to: 'conversionTracking.conversionType' },
  { from: 'conversionValue', to: 'conversionTracking.conversionValue' },
]

/**
 * Set a nested value in an object using dot notation path
 *
 * @example
 * ```typescript
 * const obj = {}
 * setNestedValue(obj, 'meta.title', 'My Title')
 * // Result: { meta: { title: 'My Title' } }
 * ```
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  const finalKey = keys[keys.length - 1]
  current[finalKey] = value
}

/**
 * Get a nested value from an object using dot notation path
 *
 * @example
 * ```typescript
 * const obj = { meta: { title: 'My Title' } }
 * getNestedValue(obj, 'meta.title') // 'My Title'
 * ```
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Merge mappings, with custom mappings taking precedence over defaults
 *
 * @param customMappings - Custom mappings to merge with defaults
 * @returns Merged array of mappings with duplicates resolved (custom wins)
 */
export function mergeMappings(
  customMappings?: RootPropsMapping[]
): RootPropsMapping[] {
  if (!customMappings || customMappings.length === 0) {
    return DEFAULT_ROOT_PROPS_MAPPINGS
  }

  // Create a map to track unique mappings by 'from' field
  const mappingMap = new Map<string, RootPropsMapping>()

  // Add defaults first
  for (const mapping of DEFAULT_ROOT_PROPS_MAPPINGS) {
    mappingMap.set(mapping.from, mapping)
  }

  // Custom mappings override defaults
  for (const mapping of customMappings) {
    mappingMap.set(mapping.from, mapping)
  }

  return Array.from(mappingMap.values())
}

/**
 * Map Puck root.props to Payload field update data
 *
 * Takes the root.props from Puck data and maps them to the appropriate
 * Payload fields based on the provided mappings.
 *
 * @param rootProps - The root.props object from Puck data
 * @param customMappings - Optional custom mappings to merge with defaults
 * @returns Object ready to be spread into Payload update data
 *
 * @example
 * ```typescript
 * const rootProps = {
 *   title: 'My Page',
 *   metaTitle: 'My Page | Site Name',
 *   metaDescription: 'Description here',
 * }
 *
 * const updateData = mapRootPropsToPayloadFields(rootProps)
 * // Result: {
 * //   title: 'My Page',
 * //   meta: {
 * //     title: 'My Page | Site Name',
 * //     description: 'Description here',
 * //   },
 * // }
 * ```
 */
export function mapRootPropsToPayloadFields(
  rootProps: Record<string, unknown>,
  customMappings?: RootPropsMapping[]
): Record<string, unknown> {
  const mappings = mergeMappings(customMappings)
  const result: Record<string, unknown> = {}

  for (const mapping of mappings) {
    const value = rootProps[mapping.from]

    // Skip undefined values to avoid overwriting existing data
    if (value === undefined) {
      continue
    }

    // Apply transformation if provided
    const transformedValue = mapping.transform ? mapping.transform(value) : value

    // Set the value at the target path
    setNestedValue(result, mapping.to, transformedValue)
  }

  return result
}

/**
 * Deep merge objects, with source values overwriting target values
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged object (target is modified in place)
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      target[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else {
      // Direct assignment for non-object values or arrays
      target[key] = sourceValue
    }
  }

  return target
}
