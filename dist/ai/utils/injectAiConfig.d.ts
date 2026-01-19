import type { Config as PuckConfig } from '@puckeditor/core';
import type { ComponentAiOverrides } from '../types.js';
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
export declare function injectAiConfig(config: PuckConfig, overrides: ComponentAiOverrides): PuckConfig;
/**
 * Checks if a config already has AI configuration
 *
 * @param config - The Puck configuration to check
 * @returns True if any component has AI configuration
 */
export declare function hasAiConfig(config: PuckConfig): boolean;
//# sourceMappingURL=injectAiConfig.d.ts.map