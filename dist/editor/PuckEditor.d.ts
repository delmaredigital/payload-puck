import type { Config as PuckConfig, Data, Plugin as PuckPlugin, Overrides as PuckOverrides } from '@puckeditor/core';
import type { ReactNode } from 'react';
import type { LayoutStyle } from './components/IframeWrapper';
import type { ThemeConfig } from '../theme';
import type { LayoutDefinition } from '../layouts';
import type { AiExamplePrompt, ComponentAiOverrides } from '../ai/types.js';
export interface PuckEditorProps {
    /**
     * Page ID for save operations
     */
    pageId: string;
    /**
     * Initial Puck data to load
     */
    initialData: Data;
    /**
     * Puck configuration with components and settings.
     * If not provided, will attempt to read from PuckConfigContext.
     */
    config?: PuckConfig;
    /**
     * Page title for display
     */
    pageTitle: string;
    /**
     * Page slug for preview URL
     */
    pageSlug: string;
    /**
     * API endpoint for save operations
     * @default '/api/puck/pages'
     */
    apiEndpoint?: string;
    /**
     * URL to navigate to when back button is clicked
     */
    backUrl?: string;
    /**
     * Preview URL or function to generate preview URL from slug
     */
    previewUrl?: string | ((slug: string) => string);
    /**
     * Whether to enable viewport switching
     * @default true
     */
    enableViewports?: boolean;
    /**
     * Additional Puck plugins to use.
     * The headingAnalyzer plugin is included by default.
     * Set to `false` to disable all default plugins.
     */
    plugins?: PuckPlugin[] | false;
    /**
     * Layout definitions for the editor preview.
     * The editor reads header, footer, editorBackground, and editorDarkMode
     * from the layout definition matching the selected pageLayout.
     */
    layouts?: LayoutDefinition[];
    /**
     * Layout style configurations for theme-aware preview
     * @deprecated Use `layouts` prop instead. layoutStyles will be removed in a future version.
     */
    layoutStyles?: Record<string, LayoutStyle>;
    /**
     * Key in root.props to read layout value from
     * @default 'pageLayout'
     */
    layoutKey?: string;
    /**
     * Custom actions to render at the start of the header
     */
    headerActionsStart?: ReactNode;
    /**
     * Custom actions to render at the end of the header
     */
    headerActionsEnd?: ReactNode;
    /**
     * Puck overrides to merge with defaults
     */
    overrides?: Partial<PuckOverrides>;
    /**
     * Callback on successful save
     */
    onSaveSuccess?: (data: Data) => void;
    /**
     * Callback on save error
     */
    onSaveError?: (error: Error) => void;
    /**
     * Callback when data changes
     */
    onChange?: (data: Data) => void;
    /**
     * Initial document status from Payload (_status field)
     * Automatically populated when using PuckEditorView
     */
    initialStatus?: 'draft' | 'published';
    /**
     * Theme configuration for customizing component styles
     * When provided, components will use themed styles
     */
    theme?: ThemeConfig;
    /**
     * Enable page-tree integration (folder picker, page segment, computed slug).
     * When true, injects folder/pageSegment/slug fields into root config.
     * Requires @delmaredigital/payload-page-tree plugin to be installed.
     * @default false
     */
    hasPageTree?: boolean;
    /**
     * Initial folder ID for page-tree integration.
     * Only used when hasPageTree is true.
     */
    folder?: string | null;
    /**
     * Initial page segment for page-tree integration.
     * Only used when hasPageTree is true.
     */
    pageSegment?: string;
    /**
     * Stylesheet URLs to inject into the editor iframe.
     * Use this to provide frontend CSS (Tailwind, CSS variables, etc.)
     * that header/footer components need for proper styling.
     * Takes precedence over stylesheets from PuckConfigProvider.
     *
     * @example
     * ```tsx
     * <PuckEditor
     *   editorStylesheets={['/editor-styles.css']}
     *   // ...
     * />
     * ```
     */
    editorStylesheets?: string[];
    /**
     * Raw CSS to inject into the editor iframe.
     * Useful for CSS variables or style overrides.
     * Takes precedence over CSS from PuckConfigProvider.
     *
     * @example
     * ```tsx
     * <PuckEditor
     *   editorCss=":root { --primary: blue; }"
     *   // ...
     * />
     * ```
     */
    editorCss?: string;
    /**
     * Enable AI features in the editor.
     * When true, adds the AI chat plugin to the editor.
     * Requires @puckeditor/plugin-ai to be installed and
     * PUCK_API_KEY environment variable to be set.
     * @default false
     */
    enableAi?: boolean;
    /**
     * AI plugin configuration options.
     * Only used when enableAi is true.
     */
    aiOptions?: {
        /**
         * API host for AI requests.
         * @default '/api/puck/ai'
         */
        host?: string;
        /**
         * Example prompts to show in the chat interface.
         * Users can click these to quickly send common prompts.
         */
        examplePrompts?: AiExamplePrompt[];
    };
    /**
     * Example prompts from plugin config.
     * These are merged with aiOptions.examplePrompts if both are provided.
     * Typically set automatically by PuckEditorView from plugin config.
     */
    aiExamplePrompts?: AiExamplePrompt[];
    /**
     * Whether the puck-ai-prompts collection is enabled.
     * When true, the prompt editor plugin is added to the plugin rail.
     * Typically set automatically by PuckEditorView from plugin config.
     */
    hasPromptsCollection?: boolean;
    /**
     * Whether the puck-ai-context collection is enabled.
     * When true, the context editor plugin is added to the plugin rail.
     * Typically set automatically by PuckEditorView from plugin config.
     */
    hasContextCollection?: boolean;
    /**
     * Custom component AI instructions to override or extend defaults.
     * When AI is enabled, built-in component instructions are auto-applied.
     * Use this to customize instructions for your brand/use case.
     * Typically set automatically by PuckEditorView from plugin config.
     */
    aiComponentInstructions?: ComponentAiOverrides;
    /**
     * Enable experimental full screen canvas mode.
     * When enabled, the canvas takes up the full viewport with a floating viewport switcher.
     * This is an experimental Puck feature.
     * @default false
     */
    experimentalFullScreenCanvas?: boolean;
    /**
     * Auto-detect dark mode from PayloadCMS admin.
     * When true (default), dark mode CSS is automatically injected when Payload is in dark mode.
     * Set to false to disable automatic dark mode detection.
     * @default true
     */
    autoDetectDarkMode?: boolean;
    /**
     * Show the preview dark mode toggle near the viewport switcher.
     * Allows toggling the preview iframe between light/dark modes independently.
     * @default true
     */
    showPreviewDarkModeToggle?: boolean;
    /**
     * Initial state for the preview dark mode toggle.
     * Only used when showPreviewDarkModeToggle is true.
     * @default false (light mode)
     */
    initialPreviewDarkMode?: boolean;
}
/**
 * Puck Editor - The primary editor component
 *
 * A full-featured visual page builder with:
 * - Save draft and publish functionality
 * - Unsaved changes tracking with beforeunload warning
 * - Interactive/Edit mode toggle
 * - Theme-aware preview backgrounds
 * - Responsive viewport switching
 * - Optional page-tree integration (folder-based URL structure)
 *
 * @example Basic usage
 * ```tsx
 * 'use client'
 *
 * import { PuckEditor } from '@delmaredigital/payload-puck/editor'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export function PageEditor({ page }) {
 *   return (
 *     <PuckEditor
 *       pageId={page.id}
 *       initialData={page.puckData}
 *       config={editorConfig}
 *       pageTitle={page.title}
 *       pageSlug={page.slug}
 *       apiEndpoint="/api/puck/pages"
 *       backUrl="/admin/pages"
 *     />
 *   )
 * }
 * ```
 *
 * @example With page-tree integration
 * ```tsx
 * <PuckEditor
 *   pageId={page.id}
 *   initialData={page.puckData}
 *   config={editorConfig}
 *   pageTitle={page.title}
 *   pageSlug={page.slug}
 *   apiEndpoint="/api/puck/pages"
 *   hasPageTree={true}
 *   folder={page.folder}
 *   pageSegment={page.pageSegment}
 * />
 * ```
 */
export declare function PuckEditor({ pageId, initialData, config: configProp, pageTitle, pageSlug, apiEndpoint, backUrl, previewUrl, enableViewports, plugins, layouts: layoutsProp, layoutStyles, layoutKey, headerActionsStart, headerActionsEnd, overrides, onSaveSuccess, onSaveError, onChange, initialStatus, theme: themeProp, hasPageTree, folder, pageSegment, editorStylesheets: editorStylesheetsProp, editorCss: editorCssProp, enableAi, aiOptions, aiExamplePrompts, hasPromptsCollection, hasContextCollection, aiComponentInstructions, experimentalFullScreenCanvas, autoDetectDarkMode, showPreviewDarkModeToggle, initialPreviewDarkMode, }: PuckEditorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PuckEditor.d.ts.map