import type { Config as PuckConfig } from '@measured/puck'
import type { MergeConfigOptions } from '../types'

/**
 * Merges Puck configurations together
 *
 * @example
 * ```typescript
 * import { mergeConfigs, baseConfig } from '@delmaredigital/payload-puck/config'
 *
 * const customConfig = mergeConfigs({
 *   base: baseConfig,
 *   components: {
 *     CustomHero: myHeroConfig,
 *   },
 *   categories: {
 *     custom: { title: 'Custom', components: ['CustomHero'] },
 *   },
 *   exclude: ['CallToAction'], // Remove if not needed
 * })
 * ```
 */
export function mergeConfigs(options: MergeConfigOptions): PuckConfig {
  const { base, components = {}, categories = {}, root, exclude = [] } = options

  // Filter out excluded components from base
  const filteredBaseComponents = Object.fromEntries(
    Object.entries(base.components || {}).filter(([key]) => !exclude.includes(key))
  )

  // Merge categories
  const mergedCategories: PuckConfig['categories'] = {}

  // First, process base categories (filtering excluded components)
  for (const [key, category] of Object.entries(base.categories || {})) {
    if (category) {
      mergedCategories[key] = {
        ...category,
        components: category.components?.filter((c) => !exclude.includes(String(c))) || [],
      }
    }
  }

  // Then, merge in new categories
  for (const [key, category] of Object.entries(categories)) {
    if (category) {
      if (mergedCategories[key]) {
        // Merge with existing category
        mergedCategories[key] = {
          ...mergedCategories[key],
          ...category,
          components: [
            ...(mergedCategories[key]?.components || []),
            ...(category.components || []),
          ],
        }
      } else {
        // Add new category
        mergedCategories[key] = category
      }
    }
  }

  // Merge root config
  const mergedRoot = root
    ? {
        ...base.root,
        ...root,
        fields: {
          ...base.root?.fields,
          ...root.fields,
        },
        defaultProps: {
          ...base.root?.defaultProps,
          ...root.defaultProps,
        },
      }
    : base.root

  return {
    ...base,
    root: mergedRoot,
    categories: mergedCategories,
    components: {
      ...filteredBaseComponents,
      ...components,
    },
  }
}
