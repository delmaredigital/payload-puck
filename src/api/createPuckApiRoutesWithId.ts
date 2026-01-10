import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type {
  PuckApiRoutesConfig,
  PuckApiRouteWithIdHandlers,
  UpdatePageBody,
  RouteHandlerWithIdContext,
} from './types'
import { mapRootPropsToPayloadFields, deepMerge } from './utils/mapRootProps'

/**
 * Create API route handlers for /api/puck/pages/[id]
 *
 * Provides GET (fetch page), PATCH (update page), and DELETE (delete page)
 * handlers with configurable authentication and authorization.
 *
 * @example
 * ```typescript
 * // src/app/api/puck/pages/[id]/route.ts
 * import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
 * import config from '@payload-config'
 *
 * export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({
 *   collection: 'pages',
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await getSession(request)
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *     canPublish: async (user) => {
 *       return { allowed: user.role === 'admin' }
 *     },
 *   },
 *   rootPropsMapping: [
 *     { from: 'customField', to: 'customPayloadField' },
 *   ],
 * })
 * ```
 */
export function createPuckApiRoutesWithId(
  routeConfig: PuckApiRoutesConfig
): PuckApiRouteWithIdHandlers {
  const {
    collection = 'pages',
    payloadConfig,
    auth,
    rootPropsMapping,
    onError,
  } = routeConfig

  /**
   * GET /api/puck/pages/[id]
   * Fetch a single page by ID
   */
  async function GET(
    request: NextRequest,
    context: RouteHandlerWithIdContext
  ): Promise<Response> {
    try {
      // Get page ID from params
      const params = await context.params
      const id = params.id

      if (!id) {
        return NextResponse.json(
          { error: 'Page ID is required' },
          { status: 400 }
        )
      }

      // Authenticate
      const authResult = await auth.authenticate(request)
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check view permission
      if (auth.canView) {
        const permission = await auth.canView(authResult.user, id)
        if (!permission.allowed) {
          return NextResponse.json(
            { error: permission.error || 'Forbidden' },
            { status: 403 }
          )
        }
      }

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      // Check if caller wants draft or published version
      // Default to draft=true for editor use (load latest draft)
      const url = new URL(request.url)
      const wantsDraft = url.searchParams.get('draft') !== 'false'

      const page = await payload.findByID({
        collection,
        id,
        draft: wantsDraft, // Load draft version by default for editing
      })

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }

      return NextResponse.json({ doc: page })
    } catch (error) {
      const params = await context.params
      if (onError) {
        onError(error, { operation: 'read', request, pageId: params.id })
      }
      console.error('Error fetching page:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }
  }

  /**
   * PATCH /api/puck/pages/[id]
   * Update a page with Puck data
   *
   * Request Body:
   * - puckData?: PuckData - Full Puck editor data
   * - title?: string - Override title (also synced from root.props)
   * - slug?: string - Override slug (also synced from root.props)
   * - status?: 'draft' | 'published' - Publishing status
   *
   * Root props from puckData are automatically synced to Payload fields
   * based on the configured mappings.
   */
  async function PATCH(
    request: NextRequest,
    context: RouteHandlerWithIdContext
  ): Promise<Response> {
    try {
      // Get page ID from params
      const params = await context.params
      const id = params.id

      if (!id) {
        return NextResponse.json(
          { error: 'Page ID is required' },
          { status: 400 }
        )
      }

      // Authenticate
      const authResult = await auth.authenticate(request)
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check edit permission
      if (auth.canEdit) {
        const permission = await auth.canEdit(authResult.user, id)
        if (!permission.allowed) {
          return NextResponse.json(
            { error: permission.error || 'Forbidden' },
            { status: 403 }
          )
        }
      }

      // Parse request body
      const body = (await request.json()) as UpdatePageBody
      const { puckData, title, slug, status, draft, folder, pageSegment } = body

      // Check publish permission only if explicitly publishing
      if (status === 'published') {
        const canPublish = auth.canPublish || auth.canEdit
        if (canPublish) {
          const permission = await canPublish(authResult.user, id)
          if (!permission.allowed) {
            return NextResponse.json(
              { error: permission.error || 'Not authorized to publish pages' },
              { status: 403 }
            )
          }
        }
      }

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      // Extract root props from puckData for syncing to Payload fields
      const rootProps =
        (puckData?.root as { props?: Record<string, unknown> })?.props || {}

      // Build update data starting with editorVersion
      const updateData: Record<string, unknown> = {
        editorVersion: 'puck',
      }

      // Add puckData if provided
      if (puckData) {
        updateData.puckData = puckData
      }

      // Map root.props to Payload fields
      const mappedFields = mapRootPropsToPayloadFields(rootProps, rootPropsMapping)

      // Merge mapped fields into update data (deep merge for nested objects)
      deepMerge(updateData, mappedFields)

      // Explicit title/slug override the mapped values
      if (title !== undefined) {
        updateData.title = title
      }
      if (slug !== undefined) {
        updateData.slug = slug
      }

      // Page-tree integration: explicit folder/pageSegment override the mapped values
      if (folder !== undefined) {
        updateData.folder = folder
      }
      if (pageSegment !== undefined) {
        updateData.pageSegment = pageSegment
      }

      // Set status if provided (for explicit publish)
      if (status) {
        updateData._status = status
      }

      // Call payload.update with draft parameter for Payload's versions.drafts system
      // When draft=true, saves without publishing
      // When draft=false or status='published', publishes the document
      const updatedPage = await payload.update({
        collection,
        id,
        data: updateData,
        draft: draft === true,
      })

      return NextResponse.json({ doc: updatedPage })
    } catch (error) {
      const params = await context.params
      if (onError) {
        onError(error, { operation: 'update', request, pageId: params.id })
      }
      console.error('Error updating page:', error)

      // Handle Payload validation errors gracefully
      if (error instanceof Error && error.name === 'ValidationError') {
        const validationError = error as Error & {
          data?: { errors?: Array<{ field: string; message: string }> }
        }
        const fieldErrors = validationError.data?.errors || []

        // Check for common validation issues and provide friendly messages
        const slugError = fieldErrors.find((e) => e.field === 'slug')
        if (slugError) {
          return NextResponse.json(
            {
              error: 'A page with this slug already exists. Please choose a different slug.',
              field: 'slug',
              details: fieldErrors,
            },
            { status: 400 }
          )
        }

        // Generic validation error
        return NextResponse.json(
          {
            error: `Validation failed: ${fieldErrors.map((e) => e.message || e.field).join(', ')}`,
            details: fieldErrors,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update page' },
        { status: 500 }
      )
    }
  }

  /**
   * DELETE /api/puck/pages/[id]
   * Delete a page by ID
   */
  async function DELETE(
    request: NextRequest,
    context: RouteHandlerWithIdContext
  ): Promise<Response> {
    try {
      // Get page ID from params
      const params = await context.params
      const id = params.id

      if (!id) {
        return NextResponse.json(
          { error: 'Page ID is required' },
          { status: 400 }
        )
      }

      // Authenticate
      const authResult = await auth.authenticate(request)
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check delete permission
      if (auth.canDelete) {
        const permission = await auth.canDelete(authResult.user, id)
        if (!permission.allowed) {
          return NextResponse.json(
            { error: permission.error || 'Forbidden' },
            { status: 403 }
          )
        }
      }

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      await payload.delete({
        collection,
        id,
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      const params = await context.params
      if (onError) {
        onError(error, { operation: 'delete', request, pageId: params.id })
      }
      console.error('Error deleting page:', error)
      return NextResponse.json(
        { error: 'Failed to delete page' },
        { status: 500 }
      )
    }
  }

  return { GET, PATCH, DELETE }
}
