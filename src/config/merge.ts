import type { ComponentConfig, Config as PuckConfig, Plugin as PuckPlugin } from '@puckeditor/core'
import type { MergeConfigOptions } from '../types/index.js'

const warnedMessages = new Set<string>()

/** Log each integration warning once in development, including across editor remounts. */
export function warnOnce(message: string): void {
  if (process.env.NODE_ENV === 'production' || warnedMessages.has(message)) return
  warnedMessages.add(message)
  console.warn(message)
}

/** @internal Test-only reset; not exported from package entry points. */
export function resetIntegrationWarningsForTests(): void {
  warnedMessages.clear()
}

/** A ready-made bundle of components, categories and optional editor plugins. */
export interface PuckIntegration {
  name: string
  components?: Record<string, ComponentConfig<any>>
  categories?: PuckConfig['categories']
  /** Editor only; ignored by render-side config helpers. */
  plugins?: readonly PuckPlugin[]
}

/** Fill missing host component keys, preserving host category fields and lists. */
export function applyIntegrations(
  config: PuckConfig,
  integrations?: readonly PuckIntegration[],
  exclude: readonly string[] = [],
): PuckConfig {
  if (!integrations?.length) return config

  const components = { ...config.components }
  const categories = { ...config.categories }
  const componentOwners = new Map<string, string>()

  for (const integration of integrations) {
    for (const [key, component] of Object.entries(integration.components || {})) {
      if (exclude.includes(key)) continue
      if (Object.hasOwn(components, key)) {
        if (components[key] !== component) {
          const owner = componentOwners.get(key)
          warnOnce(`[payload-puck] integration "${integration.name}": component "${key}" already defined by ${owner === undefined ? 'the host' : `integration "${owner}"`}; skipped`)
        }
        continue
      }
      components[key] = component
      componentOwners.set(key, integration.name)
    }

    for (const [key, category] of Object.entries(integration.categories || {})) {
      if (!category) continue
      const hostCategory = categories[key]
      const names = [...(hostCategory?.components || [])]
      for (const name of category.components || []) {
        if (!exclude.includes(String(name)) && !names.includes(name)) names.push(name)
      }
      if (!hostCategory && names.length === 0) continue
      categories[key] = { ...category, ...hostCategory, components: names }
    }
  }

  return { ...config, components, categories }
}

/**
 * Merges Puck configurations together
 *
 * @example
 * ```typescript
 * import { extendConfig, fullConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * const puckConfig = extendConfig({
 *   base: fullConfig,
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
  const { base, components = {}, categories = {}, root, exclude = [], integrations } = options

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

  return applyIntegrations(
    {
      ...base,
      root: mergedRoot,
      categories: mergedCategories,
      components: {
        ...filteredBaseComponents,
        ...components,
      },
    },
    integrations,
    exclude,
  )
}
