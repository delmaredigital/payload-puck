import type { SanitizedConfig } from 'payload';
import type { PuckApiAuthHooks, RouteHandler, RouteHandlerWithId } from '../../api/types.js';
/**
 * Configuration for AI prompts API routes
 */
export interface PromptApiRoutesConfig {
    /**
     * Payload configuration - import from @payload-config
     */
    payloadConfig: Promise<SanitizedConfig>;
    /**
     * Authentication hooks
     */
    auth: PuckApiAuthHooks;
    /**
     * Collection slug for prompts
     * @default 'puck-ai-prompts'
     */
    collection?: string;
}
/**
 * Creates API route handlers for /api/puck/ai-prompts
 *
 * Provides CRUD operations for AI prompts stored in Payload.
 *
 * @example
 * ```typescript
 * // app/api/puck/ai-prompts/route.ts
 * import { createPromptApiRoutes } from '@delmaredigital/payload-puck/ai'
 * import config from '@payload-config'
 *
 * const handlers = createPromptApiRoutes({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => { ... },
 *   },
 * })
 *
 * export const GET = handlers.GET
 * export const POST = handlers.POST
 * ```
 *
 * @example
 * ```typescript
 * // app/api/puck/ai-prompts/[id]/route.ts
 * import { createPromptApiRoutesWithId } from '@delmaredigital/payload-puck/ai'
 *
 * const handlers = createPromptApiRoutesWithId({
 *   payloadConfig: config,
 *   auth: { ... },
 * })
 *
 * export const PATCH = handlers.PATCH
 * export const DELETE = handlers.DELETE
 * ```
 */
export declare function createPromptApiRoutes(config: PromptApiRoutesConfig): {
    GET: RouteHandler;
    POST: RouteHandler;
};
/**
 * Creates API route handlers for /api/puck/ai-prompts/[id]
 */
export declare function createPromptApiRoutesWithId(config: PromptApiRoutesConfig): {
    PATCH: RouteHandlerWithId;
    DELETE: RouteHandlerWithId;
};
//# sourceMappingURL=promptApiRoutes.d.ts.map