import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { PageRenderer } from './PageRenderer';
/**
 * Renders a page using either Puck or legacy Payload blocks
 *
 * Decision logic:
 * 1. If editorVersion is 'puck' AND puckData has content → render with PageRenderer
 * 2. If legacy blocks exist → render with legacyRenderer
 * 3. Otherwise → render fallback
 */
export function HybridPageRenderer({ page, legacyRenderer, legacyBlocksField = 'layout', fallback = _jsx("div", { children: "No content available" }), config, layouts, wrapper, className, }) {
    // Check for Puck content
    const puckData = page.puckData;
    const hasPuckContent = puckData?.content && Array.isArray(puckData.content) && puckData.content.length > 0;
    // Check for legacy content
    const legacyBlocks = page[legacyBlocksField];
    const hasLegacyContent = Array.isArray(legacyBlocks) && legacyBlocks.length > 0;
    // Render Puck pages
    if (page.editorVersion === 'puck' && hasPuckContent) {
        return (_jsx(PageRenderer, { data: puckData, config: config, layouts: layouts, wrapper: wrapper, className: className }));
    }
    // Render legacy pages
    if (hasLegacyContent) {
        return _jsx(_Fragment, { children: legacyRenderer(legacyBlocks) });
    }
    // Fallback for empty pages
    return _jsx(_Fragment, { children: fallback });
}
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
export function toHybridPageData(page) {
    const { editorVersion, puckData, ...rest } = page;
    // Validate editorVersion if present
    if (editorVersion !== undefined && editorVersion !== null) {
        if (editorVersion !== 'legacy' && editorVersion !== 'puck') {
            throw new Error(`Invalid editorVersion: "${editorVersion}". Expected "legacy", "puck", or undefined.`);
        }
    }
    // Validate puckData shape if present (basic check)
    if (puckData !== undefined && puckData !== null) {
        if (typeof puckData !== 'object') {
            throw new Error(`Invalid puckData: expected object, got ${typeof puckData}`);
        }
    }
    return {
        ...rest,
        editorVersion: editorVersion,
        puckData: puckData,
    };
}
//# sourceMappingURL=HybridPageRenderer.js.map