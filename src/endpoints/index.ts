/**
 * Puck API Endpoint Handlers
 *
 * These handlers are registered via config.endpoints in the plugin.
 * They provide CRUD operations for Puck-enabled collections.
 */

import type { PayloadHandler, CollectionSlug } from 'payload'
import { APIError } from 'payload'
import { unsetHomepage, HomepageConflictError } from '../plugin/hooks/isHomepageUnique.js'

export interface PuckEndpointOptions {
  collections: string[]
}

/**
 * GET /api/puck/:collection
 * List all documents in a Puck-enabled collection
 */
export function createListHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const result = await req.payload.find({
        collection: collection as CollectionSlug,
        draft: true,
        depth: 0,
        limit: 100,
      })

      return Response.json(result)
    } catch (error) {
      console.error('[payload-puck] List error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'List failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * POST /api/puck/:collection
 * Create a new document in a Puck-enabled collection
 */
export function createCreateHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const body = await req.json?.()

      const doc = await req.payload.create({
        collection: collection as CollectionSlug,
        data: body,
        draft: true,
      })

      return Response.json({ doc })
    } catch (error) {
      console.error('[payload-puck] Create error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Create failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * GET /api/puck/:collection/:id
 * Get a single document by ID
 */
export function createGetHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string
      const id = req.routeParams?.id as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const doc = await req.payload.findByID({
        collection: collection as CollectionSlug,
        id,
        draft: true,
        depth: 0,
      })

      return Response.json({ doc })
    } catch (error) {
      console.error('[payload-puck] Get error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Get failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * PATCH /api/puck/:collection/:id
 * Update a document (supports draft saving, publishing, and homepage swapping)
 */
export function createUpdateHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string
      const id = req.routeParams?.id as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const body = await req.json?.()
      const { _status, swapHomepage, ...data } = body || {}

      // Determine if this is a publish or draft save
      const shouldPublish = _status === 'published'

      // Handle homepage swap if requested
      // When swapHomepage is true and isHomepage is being set to true,
      // we need to unset the current homepage first
      if (swapHomepage && data.isHomepage === true) {
        // Find the current homepage
        const existingHomepage = await req.payload.find({
          collection: collection as CollectionSlug,
          where: {
            and: [
              { isHomepage: { equals: true } },
              { id: { not_equals: id } },
            ],
          },
          limit: 1,
          depth: 0,
        })

        // Unset the existing homepage if found
        if (existingHomepage.docs.length > 0) {
          const existingId = String(existingHomepage.docs[0].id)
          await unsetHomepage(req.payload, collection, existingId)
        }
      }

      const doc = await req.payload.update({
        collection: collection as CollectionSlug,
        id,
        data: {
          ...data,
          _status: shouldPublish ? 'published' : 'draft',
        },
        draft: !shouldPublish,
        // Skip the isHomepage hook if we've already handled the swap
        context: swapHomepage ? { skipIsHomepageHook: true } : undefined,
      })

      return Response.json({ doc, published: shouldPublish })
    } catch (error) {
      console.error('[payload-puck] Update error:', error)

      // Handle HomepageConflictError specially - pass through existingHomepage data
      if (error instanceof HomepageConflictError) {
        return Response.json(
          {
            error: error.message,
            data: { existingHomepage: error.existingHomepage },
          },
          { status: 400 }
        )
      }

      // Handle other APIErrors
      if (error instanceof APIError) {
        return Response.json(
          {
            error: error.message,
            data: error.data,
          },
          { status: error.status || 500 }
        )
      }

      return Response.json(
        { error: error instanceof Error ? error.message : 'Update failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * DELETE /api/puck/:collection/:id
 * Delete a document
 */
export function createDeleteHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string
      const id = req.routeParams?.id as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      await req.payload.delete({
        collection: collection as CollectionSlug,
        id,
      })

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-puck] Delete error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Delete failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * GET /api/puck/:collection/:id/versions
 * Get version history for a document
 */
export function createVersionsHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string
      const id = req.routeParams?.id as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const versions = await req.payload.findVersions({
        collection: collection as CollectionSlug,
        where: {
          parent: { equals: id },
        },
        sort: '-updatedAt',
        limit: 20,
      })

      return Response.json({ versions: versions.docs })
    } catch (error) {
      console.error('[payload-puck] Versions error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Versions failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * POST /api/puck/:collection/:id/restore
 * Restore a specific version
 */
export function createRestoreHandler(options: PuckEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const collection = req.routeParams?.collection as string
      const id = req.routeParams?.id as string

      if (!collections.includes(collection)) {
        return Response.json(
          { error: `Collection '${collection}' is not configured for Puck` },
          { status: 400 }
        )
      }

      const body = await req.json?.()
      const { versionId } = body || {}

      if (!versionId) {
        return Response.json(
          { error: 'Missing versionId in request body' },
          { status: 400 }
        )
      }

      const doc = await req.payload.restoreVersion({
        collection: collection as CollectionSlug,
        id: versionId,
      })

      return Response.json({ doc })
    } catch (error) {
      console.error('[payload-puck] Restore error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Restore failed' },
        { status: 500 }
      )
    }
  }
}
