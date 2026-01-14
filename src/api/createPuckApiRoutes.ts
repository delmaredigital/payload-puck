import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import type { Data as PuckData } from '@puckeditor/core'
import type {
  PuckApiRoutesConfig,
  PuckApiRouteHandlers,
  CreatePageBody,
  RouteHandlerContext,
} from './types'

/**
 * Default Puck data for new pages
 */
const DEFAULT_PUCK_DATA: PuckData = {
  root: {
    props: {
      title: '',
    } as Record<string, unknown>,
  },
  content: [],
  zones: {},
}

/**
 * Create API route handlers for /api/puck/pages
 *
 * Provides GET (list pages) and POST (create page) handlers
 * with configurable authentication and authorization.
 *
 * @example
 * ```typescript
 * // src/app/api/puck/pages/route.ts
 * import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
 * import config from '@payload-config'
 *
 * export const { GET, POST } = createPuckApiRoutes({
 *   collection: 'pages',
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await getSession(request)
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *     canCreate: async (user) => {
 *       return { allowed: user.role === 'admin' || user.role === 'editor' }
 *     },
 *   },
 * })
 * ```
 */
export function createPuckApiRoutes(
  routeConfig: PuckApiRoutesConfig
): PuckApiRouteHandlers {
  const {
    collection = 'pages',
    payloadConfig,
    auth,
    defaultPuckData = DEFAULT_PUCK_DATA,
    enableDrafts = true,
    onError,
  } = routeConfig

  /**
   * GET /api/puck/pages
   * List all pages with optional filtering
   *
   * Query Parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10)
   * - search: Search in title field
   * - status: Filter by _status ('draft', 'published', 'all')
   * - editorVersion: Filter by editorVersion field
   * - sort: Sort field (default: '-updatedAt')
   */
  async function GET(request: NextRequest, _context: RouteHandlerContext): Promise<Response> {
    try {
      // Authenticate
      const authResult = await auth.authenticate(request)
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check list permission
      if (auth.canList) {
        const permission = await auth.canList(authResult.user)
        if (!permission.allowed) {
          return NextResponse.json(
            { error: permission.error || 'Forbidden' },
            { status: 403 }
          )
        }
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1', 10)
      const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100)
      const search = searchParams.get('search') || ''
      const status = searchParams.get('status')
      const editorVersion = searchParams.get('editorVersion')
      const sort = searchParams.get('sort') || '-updatedAt'

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      // Build where clause
      const conditions: Where[] = []

      if (search) {
        conditions.push({ title: { contains: search } })
      }

      if (status && status !== 'all') {
        conditions.push({ _status: { equals: status } })
      }

      if (editorVersion && editorVersion !== 'all') {
        conditions.push({ editorVersion: { equals: editorVersion } })
      }

      const where: Where | undefined =
        conditions.length > 0
          ? conditions.length === 1
            ? conditions[0]
            : { and: conditions }
          : undefined

      const result = await payload.find({
        collection,
        page,
        limit,
        sort,
        where,
      })

      return NextResponse.json(result)
    } catch (error) {
      if (onError) {
        onError(error, { operation: 'list', request })
      }
      console.error('Error listing pages:', error)
      return NextResponse.json(
        { error: 'Failed to list pages' },
        { status: 500 }
      )
    }
  }

  /**
   * POST /api/puck/pages
   * Create a new page with Puck data
   *
   * Request Body:
   * - title: string (required)
   * - slug: string (required)
   * - puckData?: PuckData (optional, uses default if not provided)
   * - status?: 'draft' | 'published' (default: 'draft')
   */
  async function POST(request: NextRequest, _context: RouteHandlerContext): Promise<Response> {
    try {
      // Authenticate
      const authResult = await auth.authenticate(request)
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json(
          { error: authResult.error || 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check create permission
      if (auth.canCreate) {
        const permission = await auth.canCreate(authResult.user)
        if (!permission.allowed) {
          return NextResponse.json(
            { error: permission.error || 'Forbidden' },
            { status: 403 }
          )
        }
      }

      // Parse request body
      const body = (await request.json()) as CreatePageBody
      const { title, slug, puckData, status = 'draft' } = body

      // Validate required fields
      if (!title || !slug) {
        return NextResponse.json(
          { error: 'Title and slug are required' },
          { status: 400 }
        )
      }

      // Get Payload instance with provided config
      const config = await payloadConfig
      const payload = await getPayload({ config })

      // Check if slug already exists
      const existing = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 409 }
        )
      }

      // Prepare initial Puck data with title in root.props
      const initialPuckData = puckData || {
        ...defaultPuckData,
        root: {
          ...defaultPuckData.root,
          props: {
            ...(defaultPuckData.root as { props?: Record<string, unknown> })?.props,
            title,
          },
        },
      }

      // Create the page
      const newPage = await payload.create({
        collection,
        draft: enableDrafts,
        data: {
          title,
          slug,
          editorVersion: 'puck',
          puckData: initialPuckData,
          _status: status,
        },
      })

      return NextResponse.json({ doc: newPage }, { status: 201 })
    } catch (error) {
      if (onError) {
        onError(error, { operation: 'create', request })
      }
      console.error('Error creating page:', error)
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      )
    }
  }

  return { GET, POST }
}
