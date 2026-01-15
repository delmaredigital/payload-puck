import type { PayloadHandler } from 'payload'

/**
 * Collection slug for AI context
 * Matches the auto-generated collection from createPuckPlugin
 */
const COLLECTION = 'puck-ai-context'

/**
 * List all AI context entries, sorted by order
 * Only returns enabled entries by default
 *
 * GET /api/puck/ai-context
 * Query: ?all=true to include disabled entries
 */
export function createContextListHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Check if we should include all entries (including disabled)
      const includeAll = req.query?.all === 'true'

      const result = await req.payload.find({
        collection: COLLECTION,
        sort: 'order',
        limit: 100, // Reasonable limit for context entries
        where: includeAll ? {} : { enabled: { equals: true } },
      })
      return Response.json(result)
    } catch (e) {
      console.error('[payload-puck] Error listing context:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to list context' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a new AI context entry
 *
 * POST /api/puck/ai-context
 * Body: { name: string, content: string, category?: string, enabled?: boolean, order?: number }
 */
export function createContextCreateHandler(): PayloadHandler {
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
      console.error('[payload-puck] Error creating context:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to create context' },
        { status: 500 }
      )
    }
  }
}

/**
 * Update an existing AI context entry
 *
 * PATCH /api/puck/ai-context/:id
 * Body: { name?: string, content?: string, category?: string, enabled?: boolean, order?: number }
 */
export function createContextUpdateHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ error: 'Context ID is required' }, { status: 400 })
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
      console.error('[payload-puck] Error updating context:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to update context' },
        { status: 500 }
      )
    }
  }
}

/**
 * Delete an AI context entry
 *
 * DELETE /api/puck/ai-context/:id
 */
export function createContextDeleteHandler(): PayloadHandler {
  return async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ error: 'Context ID is required' }, { status: 400 })
    }

    try {
      await req.payload.delete({
        collection: COLLECTION,
        id,
      })
      return Response.json({ success: true })
    } catch (e) {
      console.error('[payload-puck] Error deleting context:', e)
      return Response.json(
        { error: e instanceof Error ? e.message : 'Failed to delete context' },
        { status: 500 }
      )
    }
  }
}
