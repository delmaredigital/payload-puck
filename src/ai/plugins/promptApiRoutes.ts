import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import type { SanitizedConfig } from 'payload'
import type { PuckApiAuthHooks, RouteHandler, RouteHandlerWithId } from '../../api/types.js'

/**
 * Configuration for AI prompts API routes
 */
export interface PromptApiRoutesConfig {
  /**
   * Payload configuration - import from @payload-config
   */
  payloadConfig: Promise<SanitizedConfig>
  /**
   * Authentication hooks
   */
  auth: PuckApiAuthHooks
  /**
   * Collection slug for prompts
   * @default 'puck-ai-prompts'
   */
  collection?: string
}

/**
 * Creates API route handlers for /api/puck/ai-prompts
 *
 * Provides CRUD operations for AI prompts stored in Payload.
 *
 * @example
 * ```typescript
 * // app/api/puck/ai-prompts/route.ts
 * import { createPromptApiRoutes } from '@delmaredigital/payload-puck/ai'
 * import config from '@payload-config'
 *
 * const handlers = createPromptApiRoutes({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => { ... },
 *   },
 * })
 *
 * export const GET = handlers.GET
 * export const POST = handlers.POST
 * ```
 *
 * @example
 * ```typescript
 * // app/api/puck/ai-prompts/[id]/route.ts
 * import { createPromptApiRoutesWithId } from '@delmaredigital/payload-puck/ai'
 *
 * const handlers = createPromptApiRoutesWithId({
 *   payloadConfig: config,
 *   auth: { ... },
 * })
 *
 * export const PATCH = handlers.PATCH
 * export const DELETE = handlers.DELETE
 * ```
 */
export function createPromptApiRoutes(config: PromptApiRoutesConfig): {
  GET: RouteHandler
  POST: RouteHandler
} {
  const { payloadConfig, auth, collection = 'puck-ai-prompts' } = config

  return {
    GET: async (request: NextRequest): Promise<Response> => {
      try {
        // Authenticate
        const authResult = await auth.authenticate(request)
        if (!authResult.authenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Get Payload instance
        const payload = await getPayload({ config: await payloadConfig })

        // Fetch prompts
        const result = await payload.find({
          collection,
          sort: 'order',
          limit: 100,
        })

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('[AI Prompts] Error fetching prompts:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch prompts' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    },

    POST: async (request: NextRequest): Promise<Response> => {
      try {
        // Authenticate
        const authResult = await auth.authenticate(request)
        if (!authResult.authenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Get Payload instance
        const payload = await getPayload({ config: await payloadConfig })

        // Parse body
        const body = await request.json()

        // Create prompt
        const result = await payload.create({
          collection,
          data: {
            label: body.label,
            prompt: body.prompt,
            category: body.category,
            order: body.order ?? 0,
          },
        })

        return new Response(JSON.stringify({ doc: result }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('[AI Prompts] Error creating prompt:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create prompt' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    },
  }
}

/**
 * Creates API route handlers for /api/puck/ai-prompts/[id]
 */
export function createPromptApiRoutesWithId(config: PromptApiRoutesConfig): {
  PATCH: RouteHandlerWithId
  DELETE: RouteHandlerWithId
} {
  const { payloadConfig, auth, collection = 'puck-ai-prompts' } = config

  return {
    PATCH: async (request: NextRequest, context): Promise<Response> => {
      try {
        // Authenticate
        const authResult = await auth.authenticate(request)
        if (!authResult.authenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Get ID from params
        const params = await context.params
        const id = params.id

        // Get Payload instance
        const payload = await getPayload({ config: await payloadConfig })

        // Parse body
        const body = await request.json()

        // Update prompt
        const result = await payload.update({
          collection,
          id,
          data: {
            ...(body.label !== undefined && { label: body.label }),
            ...(body.prompt !== undefined && { prompt: body.prompt }),
            ...(body.category !== undefined && { category: body.category }),
            ...(body.order !== undefined && { order: body.order }),
          },
        })

        return new Response(JSON.stringify({ doc: result }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('[AI Prompts] Error updating prompt:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update prompt' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    },

    DELETE: async (request: NextRequest, context): Promise<Response> => {
      try {
        // Authenticate
        const authResult = await auth.authenticate(request)
        if (!authResult.authenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Get ID from params
        const params = await context.params
        const id = params.id

        // Get Payload instance
        const payload = await getPayload({ config: await payloadConfig })

        // Delete prompt
        await payload.delete({
          collection,
          id,
        })

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('[AI Prompts] Error deleting prompt:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to delete prompt' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    },
  }
}
