import type { NextRequest } from 'next/server'
import type { Data as PuckData } from '@measured/puck'

// =============================================================================
// Authentication Types
// =============================================================================

/**
 * Authenticated user from the auth system
 */
export interface AuthenticatedUser {
  id: string
  [key: string]: unknown
}

/**
 * Result of an authentication check
 */
export interface AuthResult {
  authenticated: boolean
  user?: AuthenticatedUser
  error?: string
}

/**
 * Result of a permission check
 */
export interface PermissionResult {
  allowed: boolean
  error?: string
}

// =============================================================================
// Auth Hooks Interface
// =============================================================================

/**
 * Authentication and authorization hooks for Puck API routes
 *
 * These hooks allow you to integrate with any authentication system
 * (Better Auth, NextAuth, Payload auth, custom JWT, etc.)
 *
 * @example
 * ```typescript
 * // Example with Better Auth
 * const authHooks: PuckApiAuthHooks = {
 *   authenticate: async (request) => {
 *     const session = await auth.api.getSession({ headers: await headers() })
 *     if (!session?.user) return { authenticated: false }
 *     return { authenticated: true, user: session.user }
 *   },
 *   canEdit: async (user, pageId) => {
 *     return { allowed: hasRole(user, 'editor') }
 *   },
 * }
 * ```
 */
export interface PuckApiAuthHooks {
  /**
   * Authenticate the incoming request
   * Should return the authenticated user or authentication failure
   */
  authenticate: (request: NextRequest) => Promise<AuthResult>

  /**
   * Check if user can list pages
   * @default Always allowed for authenticated users
   */
  canList?: (
    user: AuthenticatedUser
  ) => Promise<PermissionResult> | PermissionResult

  /**
   * Check if user can view a specific page
   * @default Always allowed for authenticated users
   */
  canView?: (
    user: AuthenticatedUser,
    pageId: string
  ) => Promise<PermissionResult> | PermissionResult

  /**
   * Check if user can create new pages
   * @default Always allowed for authenticated users
   */
  canCreate?: (
    user: AuthenticatedUser
  ) => Promise<PermissionResult> | PermissionResult

  /**
   * Check if user can edit a specific page
   * @default Always allowed for authenticated users
   */
  canEdit?: (
    user: AuthenticatedUser,
    pageId: string
  ) => Promise<PermissionResult> | PermissionResult

  /**
   * Check if user can publish a specific page (change status to published)
   * @default Same as canEdit
   */
  canPublish?: (
    user: AuthenticatedUser,
    pageId: string
  ) => Promise<PermissionResult> | PermissionResult

  /**
   * Check if user can delete a specific page
   * @default Always allowed for authenticated users
   */
  canDelete?: (
    user: AuthenticatedUser,
    pageId: string
  ) => Promise<PermissionResult> | PermissionResult
}

// =============================================================================
// Root Props Mapping Types
// =============================================================================

/**
 * Mapping configuration for syncing Puck root.props to Payload fields
 *
 * @example
 * ```typescript
 * // Simple mapping
 * { from: 'pageLayout', to: 'pageLayout' }
 *
 * // Nested field mapping (uses official @payloadcms/plugin-seo convention)
 * { from: 'title', to: 'meta.title' }
 *
 * // With transformation
 * {
 *   from: 'publishDate',
 *   to: 'publishedAt',
 *   transform: (value) => value ? new Date(value as string).toISOString() : null
 * }
 * ```
 */
export interface RootPropsMapping {
  /**
   * Property name in Puck root.props
   */
  from: string

  /**
   * Field path in Payload document (supports dot notation for nested fields)
   */
  to: string

  /**
   * Optional transformation function
   */
  transform?: (value: unknown) => unknown
}

// =============================================================================
// API Routes Configuration
// =============================================================================

/**
 * Error context passed to onError callback
 */
export interface ErrorContext {
  operation: string
  request: NextRequest
  pageId?: string
}

/**
 * Configuration for Puck API routes
 *
 * @example
 * ```typescript
 * const config: PuckApiRoutesConfig = {
 *   collection: 'pages',
 *   auth: {
 *     authenticate: async (request) => {
 *       // Your auth logic here
 *     },
 *     canPublish: async (user) => {
 *       return { allowed: user.role === 'admin' }
 *     },
 *   },
 *   rootPropsMapping: [
 *     { from: 'title', to: 'meta.title' },
 *     { from: 'description', to: 'meta.description' },
 *   ],
 *   enableDrafts: true,
 * }
 * ```
 */
export interface PuckApiRoutesConfig {
  /**
   * Payload collection slug for pages
   * @default 'pages'
   */
  collection?: string

  /**
   * Payload configuration - import from @payload-config
   * Required for Turbopack/Next.js 16+ compatibility
   *
   * @example
   * ```typescript
   * import config from '@payload-config'
   *
   * createPuckApiRoutesWithId({
   *   payloadConfig: config,
   *   // ...
   * })
   * ```
   */
  payloadConfig: Promise<import('payload').SanitizedConfig>

  /**
   * Authentication and authorization hooks
   */
  auth: PuckApiAuthHooks

  /**
   * Custom mappings from Puck root.props to Payload fields
   * These are merged with the default mappings
   */
  rootPropsMapping?: RootPropsMapping[]

  /**
   * Default Puck data for new pages
   */
  defaultPuckData?: PuckData

  /**
   * Enable draft mode for page creation/updates
   * @default true
   */
  enableDrafts?: boolean

  /**
   * Custom error handler for logging/monitoring
   */
  onError?: (error: unknown, context: ErrorContext) => void
}

// =============================================================================
// Route Handler Types
// =============================================================================

/**
 * Context passed to Next.js App Router route handlers
 */
export interface RouteHandlerContext {
  params: Promise<Record<string, string>>
}

/**
 * Context for route handlers that require an id parameter
 */
export interface RouteHandlerWithIdContext {
  params: Promise<{ id: string }>
}

/**
 * Next.js App Router route handler type
 */
export type RouteHandler = (
  request: NextRequest,
  context: RouteHandlerContext
) => Promise<Response>

/**
 * Next.js App Router route handler type for [id] routes
 */
export type RouteHandlerWithId = (
  request: NextRequest,
  context: RouteHandlerWithIdContext
) => Promise<Response>

/**
 * Route handlers returned by createPuckApiRoutes
 */
export interface PuckApiRouteHandlers {
  GET: RouteHandler
  POST: RouteHandler
}

/**
 * Route handlers returned by createPuckApiRoutesWithId
 */
export interface PuckApiRouteWithIdHandlers {
  GET: RouteHandlerWithId
  PATCH: RouteHandlerWithId
  DELETE: RouteHandlerWithId
}

// =============================================================================
// Request/Response Types
// =============================================================================

/**
 * Request body for creating a new page
 */
export interface CreatePageBody {
  title: string
  slug: string
  puckData?: PuckData
  status?: 'draft' | 'published'
}

/**
 * Request body for updating a page
 */
export interface UpdatePageBody {
  puckData?: PuckData
  title?: string
  slug?: string
  status?: 'draft' | 'published'
  /**
   * When true, save as draft without publishing.
   * Used by Payload's versions.drafts system.
   */
  draft?: boolean
  /**
   * Folder ID for page-tree integration.
   * When page-tree plugin is active, this determines the page's parent folder.
   */
  folder?: string | null
  /**
   * Page segment for page-tree integration.
   * Combined with folder path to generate the full slug.
   */
  pageSegment?: string
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  doc?: T
  docs?: T[]
  error?: string
  success?: boolean
  totalDocs?: number
  totalPages?: number
  page?: number
  limit?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
}

// =============================================================================
// Version Types
// =============================================================================

/**
 * A version entry from Payload's versions system
 */
export interface PageVersion {
  id: string
  parent: string
  version: {
    title?: string
    slug?: string
    puckData?: PuckData
    _status?: 'draft' | 'published'
    updatedAt: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
  autosave?: boolean
  latest?: boolean
}

/**
 * Route handlers returned by createPuckApiRoutesVersions
 */
export interface PuckApiVersionsRouteHandlers {
  GET: RouteHandlerWithId
  POST: RouteHandlerWithId
}
