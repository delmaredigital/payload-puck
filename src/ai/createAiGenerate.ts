import type { Data as PuckData } from '@puckeditor/core'
import type { AiGenerateConfig, AiGenerateOptions, AiGenerateFunction } from './types.js'

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
export function createAiGenerate(config: AiGenerateConfig): AiGenerateFunction {
  const { ai } = config

  return async (options: AiGenerateOptions): Promise<PuckData> => {
    const { prompt, puckConfig, pageData } = options

    // Lazy import @puckeditor/cloud-client
    let generate: typeof import('@puckeditor/cloud-client').generate
    let tool: typeof import('@puckeditor/cloud-client').tool

    try {
      const cloudClient = await import('@puckeditor/cloud-client')
      generate = cloudClient.generate
      tool = cloudClient.tool
    } catch (e) {
      throw new Error(
        'AI generation requires @puckeditor/cloud-client. Please install it with: pnpm add @puckeditor/cloud-client'
      )
    }

    // Convert our tool format to Puck's tool format
    const puckTools: Record<string, ReturnType<typeof tool>> = {}
    if (ai?.tools) {
      for (const [name, toolDef] of Object.entries(ai.tools)) {
        puckTools[name] = tool({
          description: toolDef.description,
          inputSchema: toolDef.inputSchema,
          execute: toolDef.execute,
          name: toolDef.name,
        })
      }
    }

    // Call the generate API
    const result = await generate({
      prompt,
      config: puckConfig,
      context: ai?.context,
      apiKey: ai?.apiKey,
      host: ai?.host,
      pageData,
      tools: Object.keys(puckTools).length > 0 ? puckTools : undefined,
    })

    if (!result) {
      throw new Error('AI generation failed: no result returned')
    }

    return result as PuckData
  }
}
