/**
 * Layout Utilities
 *
 * Functions for working with layout configurations.
 */
import type { LayoutDefinition, LayoutConfig, LayoutOption } from './types';
/**
 * Resolves a layout config, merging with defaults if needed
 */
export declare function resolveLayoutConfig(config?: Partial<LayoutConfig>): LayoutConfig;
/**
 * Gets a layout definition by value
 */
export declare function getLayout(layouts: LayoutDefinition[], value: string, fallback?: string): LayoutDefinition | undefined;
/**
 * Converts layout definitions to Puck select options
 */
export declare function layoutsToOptions(layouts: LayoutDefinition[]): LayoutOption[];
/**
 * Converts layout definitions to Payload select options
 */
export declare function layoutsToPayloadOptions(layouts: LayoutDefinition[]): Array<{
    label: string;
    value: string;
}>;
/**
 * Creates a custom layout definition
 */
export declare function createLayout(config: Omit<LayoutDefinition, 'value' | 'label'> & {
    value: string;
    label: string;
}): LayoutDefinition;
/**
 * Merges layout configurations
 */
export declare function mergeLayouts(base: LayoutDefinition[], custom: LayoutDefinition[], options?: {
    /** Replace base layouts instead of merging */
    replace?: boolean;
    /** Exclude these layout values from base */
    exclude?: string[];
}): LayoutDefinition[];
/**
 * Creates render-ready layouts by stripping header/footer components.
 *
 * Use this when your host application already provides a global header/footer
 * via its root layout (e.g., Next.js layout.tsx), and you want to avoid
 * double headers/footers when rendering Puck pages.
 *
 * **Why this exists:**
 * - Editor layouts need header/footer components for realistic preview in the Puck editor iframe
 * - Render layouts typically should NOT include header/footer since the host app provides them
 *
 * @example
 * ```tsx
 * // In your host app's page renderer:
 * import { HybridPageRenderer, createRenderLayouts } from '@delmaredigital/payload-puck/render'
 * import { siteLayouts } from '@/lib/puck-layouts' // layouts with header/footer for editor
 *
 * // Strip header/footer for rendering (host app layout provides them)
 * const renderLayouts = createRenderLayouts(siteLayouts)
 *
 * export function PageRenderer({ page }) {
 *   return (
 *     <HybridPageRenderer
 *       page={page}
 *       layouts={renderLayouts}
 *       legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 *     />
 *   )
 * }
 * ```
 *
 * @param editorLayouts - Layouts configured for the Puck editor (with header/footer)
 * @returns Layouts without header/footer components, suitable for PageRenderer/HybridPageRenderer
 */
export declare function createRenderLayouts(editorLayouts: LayoutDefinition[]): LayoutDefinition[];
//# sourceMappingURL=utils.d.ts.map