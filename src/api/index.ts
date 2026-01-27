/**
 * Puck API Routes
 *
 * Factory functions for creating Next.js App Router API route handlers
 * that integrate with PayloadCMS for Puck visual editor data management.
 *
 * @example
 * ```typescript
 * // src/app/api/puck/pages/route.ts
 * import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
 *
 * export const { GET, POST } = createPuckApiRoutes({
 *   auth: {
 *     authenticate: async (request) => {
 *       // Your auth implementation
 *     },
 *   },
 * })
 * ```
 *
 * @example
 * ```typescript
 * // src/app/api/puck/pages/[id]/route.ts
 * import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
 *
 * export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({
 *   auth: {
 *     authenticate: async (request) => {
 *       // Your auth implementation
 *     },
 *   },
 * })
 * ```
 */

// Route factories
export { createPuckApiRoutes } from './createPuckApiRoutes.js'
export { createPuckApiRoutesWithId } from './createPuckApiRoutesWithId.js'
export { createPuckApiRoutesVersions } from './createPuckApiRoutesVersions.js'

// Utilities
export {
  mapRootPropsToPayloadFields,
  mapPayloadFieldsToRootProps,
  DEFAULT_ROOT_PROPS_MAPPINGS,
  setNestedValue,
  getNestedValue,
  mergeMappings,
  deepMerge,
} from './utils/mapRootProps.js'

// Types
export type {
  // Auth types
  AuthenticatedUser,
  AuthResult,
  PermissionResult,
  PuckApiAuthHooks,

  // Mapping types
  RootPropsMapping,

  // Config types
  PuckApiRoutesConfig,
  ErrorContext,

  // Handler types
  RouteHandler,
  RouteHandlerWithId,
  RouteHandlerContext,
  RouteHandlerWithIdContext,
  PuckApiRouteHandlers,
  PuckApiRouteWithIdHandlers,

  // Request/Response types
  CreatePageBody,
  UpdatePageBody,
  ApiResponse,

  // Version types
  PageVersion,
  PuckApiVersionsRouteHandlers,
} from './types.js'
