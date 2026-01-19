import type { PayloadHandler } from 'payload';
import type { AiTool, AiToolContext } from '../ai/types.js';
export type { AiTool, AiToolContext };
/**
 * Options for the AI endpoint handler
 */
export interface AiEndpointOptions {
    /**
     * Business context for AI generation
     * Helps the AI understand your brand, tone, and requirements
     */
    context?: string;
    /**
     * Custom tools for AI to use during generation
     * These allow AI to perform actions like database lookups, API calls, etc.
     */
    tools?: Record<string, AiTool>;
}
/**
 * Creates a Payload endpoint handler for Puck AI
 *
 * This handler wraps @puckeditor/cloud-client's puckHandler with
 * Payload authentication. It's auto-registered by createPuckPlugin
 * when `ai.enabled: true`.
 *
 * @example
 * // Automatically registered at /api/puck/ai when:
 * createPuckPlugin({
 *   ai: {
 *     enabled: true,
 *     context: 'You build pages for Acme Corp...',
 *   },
 * })
 */
export declare function createAiEndpointHandler(options?: AiEndpointOptions): PayloadHandler;
//# sourceMappingURL=ai.d.ts.map