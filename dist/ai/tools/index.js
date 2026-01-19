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
import { z } from 'zod';
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
export function createPayloadTools(config) {
    const tools = {};
    // Collection query tools
    if (config.collections) {
        const collections = Array.isArray(config.collections)
            ? Object.fromEntries(config.collections.map((c) => [c, `Items from the ${c} collection`]))
            : config.collections;
        for (const [slug, description] of Object.entries(collections)) {
            const toolName = `get${slug.charAt(0).toUpperCase()}${slug.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
            tools[toolName] = {
                description: `Query ${slug} collection. ${description}`,
                inputSchema: z.object({
                    limit: z.number().optional().describe('Maximum number of items to return (default: 10)'),
                    where: z
                        .record(z.string(), z.unknown())
                        .optional()
                        .describe('Payload where query for filtering results'),
                    search: z.string().optional().describe('Search term to filter by title/name fields'),
                }),
                execute: async (input, context) => {
                    if (!context?.payload) {
                        throw new Error('Payload instance not available in tool context');
                    }
                    const { payload } = context;
                    const query = {
                        collection: slug,
                        limit: input.limit || 10,
                    };
                    if (input.where) {
                        query.where = input.where;
                    }
                    // If search is provided, try common text fields
                    if (input.search) {
                        query.where = {
                            or: [
                                { title: { contains: input.search } },
                                { name: { contains: input.search } },
                                { label: { contains: input.search } },
                            ],
                        };
                    }
                    const result = await payload.find(query);
                    return result.docs;
                },
            };
        }
    }
    // Media library tool
    if (config.media) {
        const mediaCollection = typeof config.media === 'string' ? config.media : 'media';
        tools.getMedia = {
            description: 'Search the media library for images. Returns URLs and metadata for matching images.',
            inputSchema: z.object({
                search: z.string().optional().describe('Search by filename or alt text'),
                mimeType: z.string().optional().describe('Filter by MIME type (e.g., "image/jpeg")'),
                limit: z.number().optional().describe('Maximum number of results (default: 10)'),
            }),
            execute: async (input, context) => {
                if (!context?.payload) {
                    throw new Error('Payload instance not available in tool context');
                }
                const { payload } = context;
                const query = {
                    collection: mediaCollection,
                    limit: input.limit || 10,
                };
                const conditions = [];
                if (input.search) {
                    conditions.push({ filename: { contains: input.search } }, { alt: { contains: input.search } });
                }
                if (input.mimeType) {
                    conditions.push({ mimeType: { equals: input.mimeType } });
                }
                if (conditions.length > 0) {
                    query.where = input.search ? { or: conditions } : { and: conditions };
                }
                const result = await payload.find(query);
                return result.docs.map((doc) => ({
                    id: doc.id,
                    url: doc.url,
                    filename: doc.filename,
                    alt: doc.alt,
                    width: doc.width,
                    height: doc.height,
                    mimeType: doc.mimeType,
                }));
            },
        };
    }
    // Pages tool for internal linking
    if (config.pages) {
        tools.getPages = {
            description: 'Look up existing pages for internal linking. Returns page titles, slugs, and URLs.',
            inputSchema: z.object({
                search: z.string().optional().describe('Search by page title'),
                limit: z.number().optional().describe('Maximum number of results (default: 10)'),
            }),
            execute: async (input, context) => {
                if (!context?.payload) {
                    throw new Error('Payload instance not available in tool context');
                }
                const { payload } = context;
                const query = {
                    collection: config.pages,
                    limit: input.limit || 10,
                };
                if (input.search) {
                    query.where = {
                        or: [{ title: { contains: input.search } }, { slug: { contains: input.search } }],
                    };
                }
                const result = await payload.find(query);
                return result.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.title,
                    slug: doc.slug,
                    url: `/${doc.slug}`,
                }));
            },
        };
    }
    // Globals tools
    if (config.globals && config.globals.length > 0) {
        for (const globalSlug of config.globals) {
            const toolName = `get${globalSlug.charAt(0).toUpperCase()}${globalSlug.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
            tools[toolName] = {
                description: `Get ${globalSlug} global data (site-wide settings/configuration)`,
                inputSchema: z.object({}),
                execute: async (_input, context) => {
                    if (!context?.payload) {
                        throw new Error('Payload instance not available in tool context');
                    }
                    const { payload } = context;
                    return await payload.findGlobal({ slug: globalSlug });
                },
            };
        }
    }
    return tools;
}
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
export function createTool(tool) {
    return tool;
}
//# sourceMappingURL=index.js.map