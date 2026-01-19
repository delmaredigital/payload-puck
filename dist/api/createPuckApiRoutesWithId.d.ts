import type { PuckApiRoutesConfig, PuckApiRouteWithIdHandlers } from './types';
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
export declare function createPuckApiRoutesWithId(routeConfig: PuckApiRoutesConfig): PuckApiRouteWithIdHandlers;
//# sourceMappingURL=createPuckApiRoutesWithId.d.ts.map