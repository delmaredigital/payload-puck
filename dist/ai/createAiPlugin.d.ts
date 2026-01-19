import type { Plugin as PuckPlugin } from '@puckeditor/core';
import type { AiPluginOptions } from './types.js';
/**
 * Creates a Puck AI plugin for the editor
 *
 * Wraps @puckeditor/plugin-ai with sensible defaults for payload-puck.
 * This factory allows for runtime-configurable prompts (from database, API, etc.).
 *
 * @example Basic usage
 * ```tsx
 * import { createAiPlugin } from '@delmaredigital/payload-puck/ai'
 *
 * const aiPlugin = createAiPlugin({
 *   host: '/api/puck',
 *   examplePrompts: [
 *     { label: 'Landing page', prompt: 'Create a landing page about our product' },
 *   ],
 * })
 *
 * <PuckEditor plugins={[aiPlugin]} />
 * ```
 *
 * @example With runtime prompts from database
 * ```tsx
 * // Fetch prompts from Payload
 * const prompts = await payload.find({ collection: 'puck-ai-prompts' })
 *
 * const aiPlugin = createAiPlugin({
 *   examplePrompts: prompts.docs.map(p => ({
 *     label: p.label,
 *     prompt: p.prompt,
 *   })),
 * })
 *
 * <PuckEditor plugins={[aiPlugin]} />
 * ```
 */
export declare function createAiPlugin(options?: AiPluginOptions): PuckPlugin;
//# sourceMappingURL=createAiPlugin.d.ts.map