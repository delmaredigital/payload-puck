import type { ComponentAiOverrides } from '../types.js';
/**
 * Default AI configurations for built-in payload-puck components
 *
 * These provide sensible defaults that help the AI understand how to use
 * each component effectively. Users can override or extend these.
 *
 * NOTE: Custom fields (type: 'custom') are automatically excluded by injectAiConfig.
 * This includes: _reset, visibility, background, media, animation, padding, margin,
 * border, dimensions, transform, alignment fields, etc.
 *
 * @example Using defaults
 * ```typescript
 * import { injectAiConfig, defaultComponentAiConfig } from '@delmaredigital/payload-puck/ai'
 *
 * const aiEnabledConfig = injectAiConfig(editorConfig, defaultComponentAiConfig)
 * ```
 *
 * @example Extending defaults
 * ```typescript
 * const customAiConfig = {
 *   ...defaultComponentAiConfig,
 *   Heading: {
 *     ...defaultComponentAiConfig.Heading,
 *     ai: {
 *       instructions: 'Use our brand voice',
 *     },
 *   },
 * }
 * ```
 */
export declare const defaultComponentAiConfig: ComponentAiOverrides;
/**
 * Minimal AI configuration for components
 *
 * Use this for a lighter-weight configuration that only marks
 * required fields. Custom fields are still auto-excluded by injectAiConfig.
 */
export declare const minimalComponentAiConfig: ComponentAiOverrides;
//# sourceMappingURL=componentAiDefaults.d.ts.map