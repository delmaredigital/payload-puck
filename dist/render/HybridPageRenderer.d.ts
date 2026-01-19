/**
 * Hybrid Page Renderer
 *
 * Renders pages that can be either Puck-edited or legacy Payload block-based.
 * Use this when migrating existing collections to Puck while maintaining
 * backwards compatibility with legacy content.
 *
 * @example
 * ```tsx
 * import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
 * import { puckConfig } from '@/puck/config'
 * import { siteLayouts } from '@/lib/puck-layouts'
 * import { BlockRenderer } from '@/components/blocks/BlockRenderer'
 *
 * export async function PageRenderer({ slug }) {
 *   const page = await fetchPage(slug)
 *
 *   return (
 *     <HybridPageRenderer
 *       page={page}
 *       config={puckConfig}
 *       layouts={siteLayouts}
 *       legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 *     />
 *   )
 * }
 * ```
 */
import type { Data as PuckData } from '@puckeditor/core';
import { type PageRendererProps } from './PageRenderer';
import type { ReactNode } from 'react';
/**
 * Loose input type that accepts Payload's generic JSON field types.
 * Use with `toHybridPageData()` to convert to `HybridPageData`.
 */
export interface HybridPageDataInput {
    editorVersion?: string | null;
    puckData?: unknown;
    [key: string]: unknown;
}
/**
 * Page data shape for hybrid rendering
 */
export interface HybridPageData {
    /**
     * Which editor was used to create the page
     * - 'puck': Page was created/edited with Puck visual editor
     * - 'legacy': Page uses traditional Payload block fields
     */
    editorVersion?: 'legacy' | 'puck';
    /**
     * Puck editor data (for pages with editorVersion: 'puck')
     */
    puckData?: PuckData | null;
    /**
     * Legacy blocks array (for pages with editorVersion: 'legacy')
     * The field name varies by project (e.g., 'layout', 'blocks', 'content')
     */
    [key: string]: unknown;
}
export interface HybridPageRendererProps<TBlocks = unknown[]> extends Omit<PageRendererProps, 'data'> {
    /**
     * Page document containing editorVersion, puckData, and optionally legacy blocks
     */
    page: HybridPageData;
    /**
     * Render function for legacy Payload blocks.
     * Called when editorVersion is 'legacy' or when puckData is not available.
     *
     * Use the generic type parameter to get proper typing for your blocks:
     * @example
     * ```tsx
     * <HybridPageRenderer<NonNullable<Page['layout']>>
     *   legacyRenderer={(blocks) => <RenderBlocks blocks={blocks} />}
     * />
     * ```
     *
     * @param blocks - The legacy blocks array from the page
     * @returns React node to render
     */
    legacyRenderer: (blocks: TBlocks) => ReactNode;
    /**
     * Name of the field containing legacy blocks
     * @default 'layout'
     */
    legacyBlocksField?: string;
    /**
     * Fallback content when no content is available
     * @default <div>No content available</div>
     */
    fallback?: ReactNode;
}
/**
 * Renders a page using either Puck or legacy Payload blocks
 *
 * Decision logic:
 * 1. If editorVersion is 'puck' AND puckData has content → render with PageRenderer
 * 2. If legacy blocks exist → render with legacyRenderer
 * 3. Otherwise → render fallback
 */
export declare function HybridPageRenderer<TBlocks = unknown[]>({ page, legacyRenderer, legacyBlocksField, fallback, config, layouts, wrapper, className, }: HybridPageRendererProps<TBlocks>): import("react/jsx-runtime").JSX.Element;
/**
 * Converts a loosely-typed page object (e.g., from Payload's generated types)
 * to a properly typed `HybridPageData`.
 *
 * Use this when Payload's generated types for JSON fields are too generic
 * and don't match `HybridPageData`.
 *
 * @example
 * ```tsx
 * import { HybridPageRenderer, toHybridPageData } from '@delmaredigital/payload-puck/render'
 *
 * // page comes from Payload with generic JSON types
 * const page = await payload.findByID({ collection: 'pages', id })
 *
 * <HybridPageRenderer
 *   page={toHybridPageData(page)}
 *   config={config}
 *   legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 * />
 * ```
 *
 * @param page - Page object with loosely-typed fields
 * @returns Properly typed HybridPageData
 * @throws Error if editorVersion is present but invalid
 */
export declare function toHybridPageData(page: HybridPageDataInput): HybridPageData;
//# sourceMappingURL=HybridPageRenderer.d.ts.map