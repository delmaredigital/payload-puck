import type { NextRequest } from 'next/server'
import type { PuckAiRoutesConfig, PuckAiRouteHandlers } from './types.js'

/**
 * Creates API route handlers for /api/puck/[...all]
 *
 * Wraps @puckeditor/cloud-client's puckHandler with authentication
 * and custom context/tools support.
 *
 * @example
 * ```typescript
 * // app/api/puck/[...all]/route.ts
 * import { createPuckAiApiRoutes } from '@delmaredigital/payload-puck/ai'
 * import config from '@payload-config'
 * import { z } from 'zod'
 *
 * export const POST = createPuckAiApiRoutes({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await auth.api.getSession({ headers: request.headers })
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *   },
 *   ai: {
 *     context: 'We are Acme Corp. You build our landing pages.',
 *     tools: {
 *       getProducts: {
 *         description: 'Get a list of products',
 *         inputSchema: z.object({}),
 *         execute: async () => {
 *           return await payload.find({ collection: 'products' })
 *         },
 *       },
 *     },
 *   },
 * })
 * ```
 */
export function createPuckAiApiRoutes(config: PuckAiRoutesConfig): PuckAiRouteHandlers {
  const { auth, ai, onError } = config

  return {
    POST: async (request: NextRequest): Promise<Response> => {
      try {
        // 1. Authenticate the request
        const authResult = await auth.authenticate(request)

        if (!authResult.authenticated) {
          return new Response(
            JSON.stringify({ error: authResult.error || 'Unauthorized' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        // 2. Lazy import @puckeditor/cloud-client to avoid errors if not installed
        let puckHandler: typeof import('@puckeditor/cloud-client').puckHandler
        let tool: typeof import('@puckeditor/cloud-client').tool

        try {
          const cloudClient = await import('@puckeditor/cloud-client')
          puckHandler = cloudClient.puckHandler
          tool = cloudClient.tool
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: 'AI features require @puckeditor/cloud-client. Please install it.',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        // 3. Convert our tool format to Puck's tool format
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

        // 4. Call puckHandler with our configuration
        return puckHandler(request, {
          apiKey: ai?.apiKey,
          host: ai?.host,
          ai: {
            context: ai?.context,
            tools: Object.keys(puckTools).length > 0 ? puckTools : undefined,
          },
        })
      } catch (error) {
        // Call custom error handler if provided
        if (onError) {
          onError(error, { operation: 'ai-chat', request })
        }

        console.error('[Puck AI] Error handling request:', error)

        return new Response(
          JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    },
  }
}
