import type { PayloadHandler, CollectionSlug } from 'payload'
import type { MovePayload, ReorderPayload, CreatePayload } from '../types.js'
import { slugify } from '../utils/getFolderPath.js'

interface TreeEndpointOptions {
  collections: string[]
  folderSlug: string
}

/**
 * Move a page or folder to a new parent and/or position
 */
export function createMoveHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections, folderSlug } = options

  return async (req) => {
    try {
      const body = (await req.json?.()) as MovePayload

      if (!body?.type || !body?.id) {
        return Response.json({ error: 'Missing required fields: type, id' }, { status: 400 })
      }

      const { type, id, newParentId, newIndex } = body

      if (type === 'folder') {
        // Move folder
        await req.payload.update({
          collection: folderSlug as CollectionSlug,
          id,
          data: {
            folder: newParentId || null,
            sortOrder: newIndex,
          },
        })
      } else {
        // Move page - find which collection it belongs to
        for (const collectionSlug of collections) {
          try {
            await req.payload.update({
              collection: collectionSlug as CollectionSlug,
              id,
              data: {
                folder: newParentId || null,
                sortOrder: newIndex,
              },
            })
            break // Found and updated
          } catch {
            // Not in this collection, try next
          }
        }
      }

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-page-tree] Move error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Move failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Reorder items within a folder (batch update sortOrder)
 */
export function createReorderHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections, folderSlug } = options

  return async (req) => {
    try {
      const body = (await req.json?.()) as ReorderPayload

      if (!body?.type || !body?.items) {
        return Response.json({ error: 'Missing required fields: type, items' }, { status: 400 })
      }

      const { type, items } = body

      if (type === 'folder') {
        // Reorder folders
        await Promise.all(
          items.map((item) =>
            req.payload.update({
              collection: folderSlug as CollectionSlug,
              id: item.id,
              data: { sortOrder: item.sortOrder },
            }),
          ),
        )
      } else {
        // Reorder pages - try each collection
        for (const collectionSlug of collections) {
          try {
            await Promise.all(
              items.map((item) =>
                req.payload.update({
                  collection: collectionSlug as CollectionSlug,
                  id: item.id,
                  data: { sortOrder: item.sortOrder },
                }),
              ),
            )
            break
          } catch {
            // Try next collection
          }
        }
      }

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-page-tree] Reorder error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Reorder failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Create a new page or folder
 */
export function createCreateHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections, folderSlug } = options

  return async (req) => {
    try {
      const body = (await req.json?.()) as CreatePayload

      if (!body?.type || !body?.name) {
        return Response.json({ error: 'Missing required fields: type, name' }, { status: 400 })
      }

      const { type, name, parentId, collection: targetCollection } = body

      if (type === 'folder') {
        const result = await req.payload.create({
          collection: folderSlug as CollectionSlug,
          data: {
            name,
            pathSegment: slugify(name), // Required field - auto-generated from name
            folder: parentId || null,
            sortOrder: 0,
          },
        })
        return Response.json({ success: true, id: result.id, type: 'folder' })
      } else {
        // Create page in specified collection or first collection
        const collectionSlug = targetCollection || collections[0]
        const result = await req.payload.create({
          collection: collectionSlug as CollectionSlug,
          data: {
            title: name,
            folder: parentId || null,
            sortOrder: 0,
            _status: 'draft',
          },
        })
        return Response.json({ success: true, id: result.id, type: 'page', collection: collectionSlug })
      }
    } catch (error) {
      console.error('[payload-page-tree] Create error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Create failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Delete a page or folder
 */
export function createDeleteHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections, folderSlug } = options

  return async (req) => {
    try {
      if (!req.url) {
        return Response.json({ error: 'Invalid request URL' }, { status: 400 })
      }
      const url = new URL(req.url)
      const type = url.searchParams.get('type')
      const id = url.searchParams.get('id')
      const deleteChildren = url.searchParams.get('deleteChildren') === 'true'

      if (!type || !id) {
        return Response.json({ error: 'Missing required params: type, id' }, { status: 400 })
      }

      if (type === 'folder') {
        if (deleteChildren) {
          // Delete all child pages first
          for (const collectionSlug of collections) {
            const { docs } = await req.payload.find({
              collection: collectionSlug as CollectionSlug,
              where: { folder: { equals: id } },
              limit: 0,
            })
            for (const doc of docs) {
              await req.payload.delete({
                collection: collectionSlug as CollectionSlug,
                id: doc.id,
              })
            }
          }

          // Delete child folders recursively
          const { docs: childFolders } = await req.payload.find({
            collection: folderSlug as CollectionSlug,
            where: { folder: { equals: id } },
            limit: 0,
          })
          for (const folder of childFolders) {
            // Recursive delete via API call
            await createDeleteHandler(options)({
              ...req,
              url: `${req.url}?type=folder&id=${folder.id}&deleteChildren=true`,
            } as typeof req)
          }
        }

        // Delete the folder itself
        await req.payload.delete({
          collection: folderSlug as CollectionSlug,
          id,
        })
      } else {
        // Delete page - find which collection it belongs to
        for (const collectionSlug of collections) {
          try {
            await req.payload.delete({
              collection: collectionSlug as CollectionSlug,
              id,
            })
            break
          } catch {
            // Try next collection
          }
        }
      }

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-page-tree] Delete error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Delete failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Duplicate a page
 */
export function createDuplicateHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      if (!req.url) {
        return Response.json({ error: 'Invalid request URL' }, { status: 400 })
      }
      const url = new URL(req.url)
      const id = url.searchParams.get('id')
      const collection = url.searchParams.get('collection')

      if (!id || !collection) {
        return Response.json({ error: 'Missing required params: id, collection' }, { status: 400 })
      }

      // Get the original document
      const original = await req.payload.findByID({
        collection: collection as CollectionSlug,
        id,
      })

      // Create a copy with modified title
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, slug: _slug, ...data } = original as Record<string, unknown>

      const result = await req.payload.create({
        collection: collection as CollectionSlug,
        data: {
          ...data,
          title: `${(data.title as string) || 'Untitled'} (Copy)`,
          _status: 'draft',
        },
      })

      return Response.json({ success: true, id: result.id })
    } catch (error) {
      console.error('[payload-page-tree] Duplicate error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Duplicate failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Update page status (publish/unpublish)
 */
export function createStatusHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections } = options

  return async (req) => {
    try {
      const body = (await req.json?.()) as { id: string; collection: string; status: 'draft' | 'published' }

      if (!body?.id || !body?.collection || !body?.status) {
        return Response.json({ error: 'Missing required fields: id, collection, status' }, { status: 400 })
      }

      await req.payload.update({
        collection: body.collection as CollectionSlug,
        id: body.id,
        data: { _status: body.status },
      })

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-page-tree] Status update error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Status update failed' },
        { status: 500 },
      )
    }
  }
}

/**
 * Rename a page or folder
 */
export function createRenameHandler(options: TreeEndpointOptions): PayloadHandler {
  const { collections, folderSlug } = options

  return async (req) => {
    try {
      const body = (await req.json?.()) as { type: 'page' | 'folder'; id: string; name: string; collection?: string }

      if (!body?.type || !body?.id || !body?.name) {
        return Response.json({ error: 'Missing required fields: type, id, name' }, { status: 400 })
      }

      const { type, id, name, collection } = body

      if (type === 'folder') {
        await req.payload.update({
          collection: folderSlug as CollectionSlug,
          id,
          data: { name },
        })
      } else if (collection) {
        await req.payload.update({
          collection: collection as CollectionSlug,
          id,
          data: { title: name },
        })
      }

      return Response.json({ success: true })
    } catch (error) {
      console.error('[payload-page-tree] Rename error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Rename failed' },
        { status: 500 },
      )
    }
  }
}
