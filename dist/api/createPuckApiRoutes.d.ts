import type { PuckApiRoutesConfig, PuckApiRouteHandlers } from './types';
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
export declare function createPuckApiRoutes(routeConfig: PuckApiRoutesConfig): PuckApiRouteHandlers;
//# sourceMappingURL=createPuckApiRoutes.d.ts.map