import type { PayloadHandler } from 'payload';
/**
 * List all AI context entries, sorted by order
 * Only returns enabled entries by default
 *
 * GET /api/puck/ai-context
 * Query: ?all=true to include disabled entries
 */
export declare function createContextListHandler(): PayloadHandler;
/**
 * Create a new AI context entry
 *
 * POST /api/puck/ai-context
 * Body: { name: string, content: string, category?: string, enabled?: boolean, order?: number }
 */
export declare function createContextCreateHandler(): PayloadHandler;
/**
 * Update an existing AI context entry
 *
 * PATCH /api/puck/ai-context/:id
 * Body: { name?: string, content?: string, category?: string, enabled?: boolean, order?: number }
 */
export declare function createContextUpdateHandler(): PayloadHandler;
/**
 * Delete an AI context entry
 *
 * DELETE /api/puck/ai-context/:id
 */
export declare function createContextDeleteHandler(): PayloadHandler;
//# sourceMappingURL=context.d.ts.map