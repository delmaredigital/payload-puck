/**
 * Pre-built AI tools for Payload CMS integration
 *
 * These tools allow the AI to query your Payload database during page generation,
 * enabling it to use real content instead of placeholder text.
 *
 * @example
 * ```typescript
 * import { createPayloadTools } from '@delmaredigital/payload-puck/ai'
 *
 * createPuckPlugin({
 *   ai: {
 *     enabled: true,
 *     tools: createPayloadTools({
 *       collections: ['products', 'team-members', 'testimonials'],
 *       media: true,
 *       pages: 'pages',
 *     }),
 *   },
 * })
 * ```
 */
import type { AiTool } from '../types.js';
/**
 * Configuration for createPayloadTools
 */
export interface PayloadToolsConfig {
    /**
     * Collections the AI can query.
     * Pass an array of collection slugs, or an object mapping slugs to descriptions.
     *
     * @example
     * ```typescript
     * // Simple - just collection names
     * collections: ['products', 'team-members']
     *
     * // With descriptions - helps AI understand when to use each
     * collections: {
     *   products: 'Product catalog with name, price, description, and image',
     *   'team-members': 'Staff profiles with name, role, bio, and headshot',
     * }
     * ```
     */
    collections?: string[] | Record<string, string>;
    /**
     * Enable media library tool.
     * When true, AI can search for images by filename or alt text.
     * @default false
     */
    media?: boolean | string;
    /**
     * Pages collection slug for internal linking.
     * When set, AI can look up page URLs for navigation/links.
     */
    pages?: string;
    /**
     * Globals the AI can read.
     * Useful for site settings, contact info, etc.
     *
     * @example
     * ```typescript
     * globals: ['site-settings', 'contact-info']
     * ```
     */
    globals?: string[];
}
/**
 * Creates a set of AI tools for querying Payload CMS
 *
 * IMPORTANT: These tools need the `payload` instance at runtime.
 * The plugin automatically injects `payload` into the tool execution context.
 *
 * @example
 * ```typescript
 * import { createPayloadTools } from '@delmaredigital/payload-puck/ai'
 *
 * createPuckPlugin({
 *   ai: {
 *     enabled: true,
 *     context: 'You are building pages for Acme Corp...',
 *     tools: createPayloadTools({
 *       collections: {
 *         products: 'Products with name, price, description, and image',
 *         testimonials: 'Customer testimonials with quote, author, and company',
 *       },
 *       media: true,
 *       pages: 'pages',
 *       globals: ['site-settings'],
 *     }),
 *   },
 * })
 * ```
 */
export declare function createPayloadTools(config: PayloadToolsConfig): Record<string, AiTool<any, any>>;
/**
 * Create a custom AI tool with proper typing
 *
 * @example
 * ```typescript
 * import { createTool } from '@delmaredigital/payload-puck/ai'
 * import { z } from 'zod'
 *
 * const getWeather = createTool({
 *   description: 'Get current weather for a location',
 *   inputSchema: z.object({
 *     city: z.string().describe('City name'),
 *   }),
 *   execute: async ({ city }, context) => {
 *     const response = await fetch(`https://api.weather.com/...`)
 *     return response.json()
 *   },
 * })
 * ```
 */
export declare function createTool<TInput, TOutput>(tool: AiTool<TInput, TOutput>): AiTool<TInput, TOutput>;
//# sourceMappingURL=index.d.ts.map