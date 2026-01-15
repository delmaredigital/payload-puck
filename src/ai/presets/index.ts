/**
 * AI Preset Configurations
 *
 * This module exports comprehensive AI instructions for Puck components
 * and page composition patterns.
 *
 * @example Using comprehensive config (recommended)
 * ```typescript
 * import { comprehensiveComponentAiConfig } from '@delmaredigital/payload-puck/ai'
 * import { injectAiConfig } from '@delmaredigital/payload-puck/ai'
 *
 * const aiEnabledConfig = injectAiConfig(editorConfig, comprehensiveComponentAiConfig)
 * ```
 *
 * @example Adding page pattern context to AI system prompt
 * ```typescript
 * import { pagePatternSystemContext } from '@delmaredigital/payload-puck/ai'
 *
 * createPuckAiApiRoutes({
 *   ai: {
 *     context: `${yourBusinessContext}\n\n${pagePatternSystemContext}`,
 *   },
 * })
 * ```
 */

import type { ComponentAiOverrides } from '../types.js'

// Import instruction modules
import { typographyInstructions, typographyComponents } from './instructions/typography.js'
import { layoutInstructions, layoutComponents } from './instructions/layout.js'
import { interactiveInstructions, interactiveComponents } from './instructions/interactive.js'
import { mediaInstructions, mediaComponents } from './instructions/media.js'
import { pagePatternContext, componentFieldReference } from './instructions/pagePatterns.js'

// Re-export legacy config for backward compatibility
export {
  defaultComponentAiConfig,
  minimalComponentAiConfig,
} from './componentAiDefaults.js'

/**
 * Comprehensive AI configuration for all built-in components
 *
 * Combines detailed instructions from all component categories:
 * - Typography: Heading, Text, RichText
 * - Layout: Section, Container, Flex, Grid, Spacer
 * - Interactive: Button, Card, Accordion, Divider
 * - Media: Image, Template
 *
 * Each component includes:
 * - Purpose and usage guidelines
 * - Correct field names and recommended values
 * - Composition patterns with other components
 * - Common mistakes to avoid
 */
export const comprehensiveComponentAiConfig: ComponentAiOverrides = {
  ...typographyInstructions,
  ...layoutInstructions,
  ...interactiveInstructions,
  ...mediaInstructions,
}

/**
 * System context string for AI page generation
 *
 * Contains comprehensive guidance on:
 * - Page structure patterns (hero, features, testimonials, FAQ, CTA)
 * - Page type templates (landing, about, services, contact)
 * - Typography hierarchy rules
 * - Spacing and color guidelines
 * - Responsive considerations
 *
 * Add this to your AI context for better page generation:
 *
 * @example
 * ```typescript
 * createPuckAiApiRoutes({
 *   ai: {
 *     context: `${yourBusinessContext}\n\n${pagePatternSystemContext}`,
 *   },
 * })
 * ```
 */
export const pagePatternSystemContext = `${pagePatternContext}\n\n${componentFieldReference}`

/**
 * Just the page pattern context (without field reference)
 * Use if you only need the composition patterns
 */
export { pagePatternContext }

/**
 * Just the field reference (without patterns)
 * Use if you only need a quick field name reference
 */
export { componentFieldReference }

/**
 * List of all component names by category
 */
export const allComponents = {
  typography: typographyComponents,
  layout: layoutComponents,
  interactive: interactiveComponents,
  media: mediaComponents,
} as const

/**
 * Flat list of all component names
 */
export const componentNames = [
  ...typographyComponents,
  ...layoutComponents,
  ...interactiveComponents,
  ...mediaComponents,
] as const

// Re-export instruction modules for advanced usage
export { typographyInstructions } from './instructions/typography.js'
export { layoutInstructions } from './instructions/layout.js'
export { interactiveInstructions } from './instructions/interactive.js'
export { mediaInstructions } from './instructions/media.js'
