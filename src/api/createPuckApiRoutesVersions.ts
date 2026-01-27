import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type {
  PuckApiRoutesConfig,
  PuckApiVersionsRouteHandlers,
  RouteHandlerWithIdContext,
} from './types.js'

/**
 * Create API route handlers for /api/puck/pages/[id]/versions
 *
 * Provides GET (list versions) and POST (restore version) handlers
 * for managing page version history.
 *
 * @example
 * ```typescript
 * // src/app/api/puck/pages/[id]/versions/route.ts
 * import { createPuckApiRoutesVersions } from '@delmaredigital/payload-puck/api'
 * import config from '@payload-config'
 *
 * export const { GET, POST } = createPuckApiRoutesVersions({
 *   collection: 'pages',
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await getSession(request)
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *   },
 * })
 * ```
 */
export function createPuckApiRoutesVersions(
  routeConfig: PuckApiRoutesConfig
): PuckApiVersionsRouteHandlers {
  const {
    collection = 'pages',
    payloadConfig,
    auth,
    onError,
  } = routeConfig

  /**
   * GET /api/puck/pages/[id]/versions
   * Fetch version history for a page
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

      // Parse query params for pagination
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '20', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)

      // Fetch versions for this page
      const versions = await payload.findVersions({
        collection,
        where: {
          parent: { equals: id },
        },
        sort: '-updatedAt',
        limit,
        page,
      })

      return NextResponse.json({
        docs: versions.docs,
        totalDocs: versions.totalDocs,
        totalPages: versions.totalPages,
        page: versions.page,
        limit: versions.limit,
        hasPrevPage: versions.hasPrevPage,
        hasNextPage: versions.hasNextPage,
      })
    } catch (error) {
      const params = await context.params
      if (onError) {
        onError(error, { operation: 'listVersions', request, pageId: params.id })
      }
      console.error('Error fetching versions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }
  }

  /**
   * POST /api/puck/pages/[id]/versions
   * Restore a specific version
   *
   * Request Body:
   * - versionId: string - The version ID to restore
   */
  async function POST(
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
      const body = await request.json()
      const { versionId } = body as { versionId: string }

      if (!versionId) {
        return NextResponse.json(
          { error: 'Version ID is required' },
          { status: 400 }
        )
      }

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      // Restore the version
      const restoredDoc = await payload.restoreVersion({
        collection,
        id: versionId,
      })

      return NextResponse.json({ doc: restoredDoc })
    } catch (error) {
      const params = await context.params
      if (onError) {
        onError(error, { operation: 'restoreVersion', request, pageId: params.id })
      }
      console.error('Error restoring version:', error)
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      )
    }
  }

  return { GET, POST }
}
