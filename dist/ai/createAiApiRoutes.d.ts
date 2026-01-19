import type { PuckAiRoutesConfig, PuckAiRouteHandlers } from './types.js';
/**
 * Creates API route handlers for /api/puck/[...all]
 *
 * Wraps @puckeditor/cloud-client's puckHandler with authentication
 * and custom context/tools support.
 *
 * @example
 * ```typescript
 * // app/api/puck/[...all]/route.ts
 * import { createPuckAiApiRoutes } from '@delmaredigital/payload-puck/ai'
 * import config from '@payload-config'
 * import { z } from 'zod'
 *
 * export const POST = createPuckAiApiRoutes({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await auth.api.getSession({ headers: request.headers })
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *   },
 *   ai: {
 *     context: 'We are Acme Corp. You build our landing pages.',
 *     tools: {
 *       getProducts: {
 *         description: 'Get a list of products',
 *         inputSchema: z.object({}),
 *         execute: async () => {
 *           return await payload.find({ collection: 'products' })
 *         },
 *       },
 *     },
 *   },
 * })
 * ```
 */
export declare function createPuckAiApiRoutes(config: PuckAiRoutesConfig): PuckAiRouteHandlers;
//# sourceMappingURL=createAiApiRoutes.d.ts.map