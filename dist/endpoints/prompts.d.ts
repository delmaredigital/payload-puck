import type { PayloadHandler } from 'payload';
/**
 * List all AI prompts, sorted by order
 *
 * GET /api/puck/ai-prompts
 */
export declare function createPromptsListHandler(): PayloadHandler;
/**
 * Create a new AI prompt
 *
 * POST /api/puck/ai-prompts
 * Body: { label: string, prompt: string, category?: string, order?: number }
 */
export declare function createPromptsCreateHandler(): PayloadHandler;
/**
 * Update an existing AI prompt
 *
 * PATCH /api/puck/ai-prompts/:id
 * Body: { label?: string, prompt?: string, category?: string, order?: number }
 */
export declare function createPromptsUpdateHandler(): PayloadHandler;
/**
 * Delete an AI prompt
 *
 * DELETE /api/puck/ai-prompts/:id
 */
export declare function createPromptsDeleteHandler(): PayloadHandler;
//# sourceMappingURL=prompts.d.ts.map