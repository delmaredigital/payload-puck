import type { Config as PuckConfig, Data, Plugin as PuckPlugin } from '@puckeditor/core';
/**
 * Props for the PuckEditorView component
 */
export interface PuckEditorViewProps {
    /**
     * Puck configuration with components and settings
     */
    config: PuckConfig;
    /**
     * Collection slug for API endpoints
     * @default 'pages'
     */
    collectionSlug?: string;
    /**
     * Base API path for Puck operations
     * @default '/api/puck'
     */
    apiBasePath?: string;
    /**
     * URL to navigate to when back button is clicked
     * Falls back to /admin/collections/{collectionSlug}
     */
    backUrl?: string;
    /**
     * Preview URL or function to generate preview URL from slug
     */
    previewUrl?: string | ((slug: string) => string);
    /**
     * Layout styles for theme-aware preview
     */
    layoutStyles?: Record<string, {
        background: string;
        isDark: boolean;
    }>;
    /**
     * Key in root.props to read layout value from
     * @default 'pageLayout'
     */
    layoutKey?: string;
    /**
     * Additional Puck plugins to use.
     * The headingAnalyzer plugin is included by default.
     * Set to `false` to disable all default plugins.
     */
    plugins?: PuckPlugin[] | false;
    /**
     * Callback on successful save
     */
    onSaveSuccess?: (data: Data) => void;
    /**
     * Callback on save error
     */
    onSaveError?: (error: Error) => void;
}
/**
 * Ready-to-use Puck editor page component
 *
 * Use this in your own editor page route (e.g., /pages/[id]/edit).
 * It auto-fetches page data from the API and renders the PuckEditor.
 *
 * @example
 * ```tsx
 * // src/app/pages/[id]/edit/page.tsx
 * 'use client'
 *
 * import { PuckEditorView } from '@delmaredigital/payload-puck/editor'
 * import { editorConfig } from '@/puck/config'
 *
 * export default function PageEditor() {
 *   return (
 *     <PuckEditorView
 *       config={editorConfig}
 *       collectionSlug="pages"
 *       apiBasePath="/api/puck"
 *       backUrl="/admin/collections/pages"
 *       previewUrl={(slug) => `/${slug}`}
 *     />
 *   )
 * }
 * ```
 */
export declare function PuckEditorView({ config, collectionSlug, apiBasePath, backUrl, previewUrl, layoutStyles, layoutKey, plugins, onSaveSuccess, onSaveError, }: PuckEditorViewProps): import("react/jsx-runtime").JSX.Element;
export default PuckEditorView;
//# sourceMappingURL=PuckEditorView.d.ts.map