import type { Config as PuckConfig } from '@puckeditor/core'
import type { ComponentAiOverrides } from '../types.js'

// Extended types to include AI configuration
// These match what Puck AI expects but aren't in the core types yet
type ComponentWithAi = {
  ai?: {
    instructions?: string
    exclude?: boolean
    schema?: object
  }
  fields?: Record<string, FieldWithAi>
  [key: string]: unknown
}

type FieldWithAi = {
  ai?: {
    instructions?: string
    required?: boolean
    exclude?: boolean
    bind?: string
    schema?: object
  }
  [key: string]: unknown
}

/**
 * Injects AI configuration into an existing Puck config
 *
 * This function:
 * 1. Applies component-level and field-level AI overrides from the provided config
 * 2. **Automatically excludes ALL `type: 'custom'` fields** from AI generation
 *    (custom fields are UI-only interactive fields that AI cannot generate values for)
 *
 * @example Basic usage
 * ```typescript
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 * import { injectAiConfig, defaultComponentAiConfig } from '@delmaredigital/payload-puck/ai'
 *
 * // Use default AI configs for built-in components
 * const aiEnabledConfig = injectAiConfig(editorConfig, defaultComponentAiConfig)
 * ```
 *
 * @example With custom overrides
 * ```typescript
 * const aiEnabledConfig = injectAiConfig(editorConfig, {
 *   ...defaultComponentAiConfig,
 *   // Override a built-in component
 *   Heading: {
 *     ai: {
 *       instructions: 'Use our brand voice: professional but approachable',
 *     },
 *     fields: {
 *       text: {
 *         ai: {
 *           instructions: 'Keep headings concise (under 10 words)',
 *           required: true,
 *         },
 *       },
 *     },
 *   },
 *   // Add config for a custom component
 *   HeroSection: {
 *     ai: {
 *       instructions: 'Always place at the top of the page',
 *     },
 *     fields: {
 *       headline: {
 *         ai: {
 *           instructions: 'Use power words, keep under 8 words',
 *           required: true,
 *         },
 *       },
 *     },
 *   },
 * })
 * ```
 *
 * @param config - The base Puck configuration to enhance
 * @param overrides - AI configuration overrides for each component
 * @returns A new Puck config with AI metadata injected
 */
export function injectAiConfig(
  config: PuckConfig,
  overrides: ComponentAiOverrides
): PuckConfig {
  // Deep clone the config to avoid mutating the original
  // Use type assertion to work with AI-extended types
  const newConfig = {
    ...config,
    components: { ...config.components } as Record<string, ComponentWithAi>,
  }

  // First pass: Apply user-provided overrides
  for (const [componentName, componentOverride] of Object.entries(overrides)) {
    const existingComponent = newConfig.components[componentName]

    // Skip if component doesn't exist in config
    if (!existingComponent) {
      continue
    }

    // Create a new component config with AI metadata
    const newComponent: ComponentWithAi = {
      ...existingComponent,
    }

    // Add component-level AI config
    if (componentOverride.ai) {
      newComponent.ai = {
        ...existingComponent.ai,
        ...componentOverride.ai,
      }
    }

    // Process field-level AI configs from overrides
    if (componentOverride.fields && existingComponent.fields) {
      const newFields: Record<string, FieldWithAi> = { ...existingComponent.fields }

      for (const [fieldName, fieldOverride] of Object.entries(componentOverride.fields)) {
        const existingField = existingComponent.fields[fieldName]

        // Skip if field doesn't exist
        if (!existingField) {
          continue
        }

        // Add AI config to field
        newFields[fieldName] = {
          ...existingField,
          ai: {
            ...existingField.ai,
            ...fieldOverride.ai,
          },
        }
      }

      newComponent.fields = newFields
    }

    newConfig.components[componentName] = newComponent
  }

  // Second pass: Auto-exclude custom fields that don't have AI instructions
  // Custom fields (type: 'custom') are typically interactive UI elements,
  // BUT some styling fields (background, padding, etc.) ARE custom fields
  // that we want AI to use. Only auto-exclude if NO AI instructions provided.
  for (const [componentName, component] of Object.entries(newConfig.components)) {
    if (!component.fields) continue

    const updatedFields: Record<string, FieldWithAi> = {}
    let hasChanges = false

    for (const [fieldName, field] of Object.entries(component.fields)) {
      const existingAi = (field as FieldWithAi).ai

      // Check if this is a custom field type
      if ((field as any).type === 'custom') {
        // If the field has AI instructions, DON'T auto-exclude it
        // The presence of instructions indicates we want AI to use this field
        if (existingAi?.instructions) {
          updatedFields[fieldName] = field as FieldWithAi
        }
        // Otherwise, auto-exclude custom fields from AI generation
        // (unless already excluded)
        else if (!existingAi?.exclude) {
          updatedFields[fieldName] = {
            ...field,
            ai: {
              ...existingAi,
              exclude: true,
            },
          }
          hasChanges = true
        } else {
          updatedFields[fieldName] = field as FieldWithAi
        }
      } else {
        updatedFields[fieldName] = field as FieldWithAi
      }
    }

    // Only update component if we made changes
    if (hasChanges) {
      newConfig.components[componentName] = {
        ...component,
        fields: updatedFields,
      }
    }
  }

  // Third pass: Auto-exclude custom fields from ROOT config (same logic as components)
  // Root can have fields just like components (e.g., isHomepage, pageLayout, etc.)
  if ((config as any).root?.fields) {
    const rootFields = (config as any).root.fields
    const updatedRootFields: Record<string, FieldWithAi> = {}
    let hasRootChanges = false

    for (const [fieldName, field] of Object.entries(rootFields)) {
      const existingAi = (field as FieldWithAi).ai

      // Check if this is a custom field type
      if ((field as any).type === 'custom') {
        // If the field has AI instructions, DON'T auto-exclude it
        if (existingAi?.instructions) {
          updatedRootFields[fieldName] = field as FieldWithAi
        }
        // Otherwise, auto-exclude custom fields from AI generation
        else if (!existingAi?.exclude) {
          updatedRootFields[fieldName] = {
            ...(field as FieldWithAi),
            ai: {
              ...existingAi,
              exclude: true,
            },
          }
          hasRootChanges = true
        } else {
          updatedRootFields[fieldName] = field as FieldWithAi
        }
      } else {
        updatedRootFields[fieldName] = field as FieldWithAi
      }
    }

    // Update root if we made changes
    if (hasRootChanges) {
      ;(newConfig as any).root = {
        ...(newConfig as any).root,
        fields: updatedRootFields,
      }
    }
  }

  // Cast back to PuckConfig for return
  return newConfig as unknown as PuckConfig
}

/**
 * Checks if a config already has AI configuration
 *
 * @param config - The Puck configuration to check
 * @returns True if any component has AI configuration
 */
export function hasAiConfig(config: PuckConfig): boolean {
  for (const component of Object.values(config.components)) {
    if ((component as any).ai) {
      return true
    }

    if (component.fields) {
      for (const field of Object.values(component.fields)) {
        if ((field as any).ai) {
          return true
        }
      }
    }
  }

  return false
}
