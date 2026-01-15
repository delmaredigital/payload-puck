import type { PayloadHandler } from 'payload'

/**
 * Collection slug for AI prompts
 * Matches the auto-generated collection from createPuckPlugin
 */
const COLLECTION = 'puck-ai-prompts'

/**
 * List all AI prompts, sorted by order
 *
 * GET /api/puck/ai-prompts
 */
export function createPromptsListHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const result = await req.payload.find({
        collection: COLLECTION,
        sort: 'order',
        limit: 100, // Reasonable limit for prompts
      })
      return Response.json(result)
    } catch (e) {
      console.error('[payload-puck] Error listing prompts:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to list prompts' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a new AI prompt
 *
 * POST /api/puck/ai-prompts
 * Body: { label: string, prompt: string, category?: string, order?: number }
 */
export function createPromptsCreateHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const data = await req.json?.()
      if (!data) {
        return Response.json({ error: 'Request body is required' }, { status: 400 })
      }

      const doc = await req.payload.create({
        collection: COLLECTION,
        data,
      })
      return Response.json(doc)
    } catch (e) {
      console.error('[payload-puck] Error creating prompt:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to create prompt' },
        { status: 500 }
      )
    }
  }
}

/**
 * Update an existing AI prompt
 *
 * PATCH /api/puck/ai-prompts/:id
 * Body: { label?: string, prompt?: string, category?: string, order?: number }
 */
export function createPromptsUpdateHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ error: 'Prompt ID is required' }, { status: 400 })
    }

    try {
      const data = await req.json?.()
      if (!data) {
        return Response.json({ error: 'Request body is required' }, { status: 400 })
      }

      const doc = await req.payload.update({
        collection: COLLECTION,
        id,
        data,
      })
      return Response.json(doc)
    } catch (e) {
      console.error('[payload-puck] Error updating prompt:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to update prompt' },
        { status: 500 }
      )
    }
  }
}

/**
 * Delete an AI prompt
 *
 * DELETE /api/puck/ai-prompts/:id
 */
export function createPromptsDeleteHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ error: 'Prompt ID is required' }, { status: 400 })
    }

    try {
      await req.payload.delete({
        collection: COLLECTION,
        id,
      })
      return Response.json({ success: true })
    } catch (e) {
      console.error('[payload-puck] Error deleting prompt:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to delete prompt' },
        { status: 500 }
      )
    }
  }
}
