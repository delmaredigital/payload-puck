import type { AiGenerateConfig, AiGenerateFunction } from './types.js';
/**
 * Creates a headless AI page generation function
 *
 * Use this to generate Puck pages programmatically without the editor UI.
 * Useful for batch generation, automated workflows, or API-driven page creation.
 *
 * @example Basic generation
 * ```typescript
 * import { createAiGenerate } from '@delmaredigital/payload-puck/ai'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 * import config from '@payload-config'
 *
 * const generatePage = createAiGenerate({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (req) => {
 *       // Authenticate the request
 *       return { authenticated: true, user: { id: 'system' } }
 *     },
 *   },
 *   ai: {
 *     context: 'We are Acme Corp. You build our marketing pages.',
 *   },
 * })
 *
 * // Generate a new page
 * const pageData = await generatePage({
 *   prompt: 'Create a landing page for our new product launch',
 *   puckConfig: editorConfig,
 * })
 *
 * // Save to Payload
 * await payload.create({
 *   collection: 'pages',
 *   data: {
 *     title: 'New Product Launch',
 *     slug: 'new-product',
 *     puckData: pageData,
 *   },
 * })
 * ```
 *
 * @example Updating an existing page
 * ```typescript
 * // Fetch existing page
 * const page = await payload.findByID({ collection: 'pages', id: 'abc123' })
 *
 * // Update with AI
 * const updatedData = await generatePage({
 *   prompt: 'Add a testimonials section after the hero',
 *   puckConfig: editorConfig,
 *   pageData: page.puckData, // Pass existing data
 * })
 *
 * // Save the update
 * await payload.update({
 *   collection: 'pages',
 *   id: 'abc123',
 *   data: { puckData: updatedData },
 * })
 * ```
 */
export declare function createAiGenerate(config: AiGenerateConfig): AiGenerateFunction;
//# sourceMappingURL=createAiGenerate.d.ts.map