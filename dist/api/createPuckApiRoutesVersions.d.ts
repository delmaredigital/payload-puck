import type { PuckApiRoutesConfig, PuckApiVersionsRouteHandlers } from './types';
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
export declare function createPuckApiRoutesVersions(routeConfig: PuckApiRoutesConfig): PuckApiVersionsRouteHandlers;
//# sourceMappingURL=createPuckApiRoutesVersions.d.ts.map