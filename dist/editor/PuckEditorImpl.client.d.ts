import { type ReactNode } from 'react';
import { type Config as PuckConfig, type Data, type Plugin as PuckPlugin, type Overrides as PuckOverrides } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import '@puckeditor/plugin-heading-analyzer/dist/index.css';
import '@puckeditor/plugin-ai/styles.css';
import './ai-plugin-overrides.css';
import { type LayoutStyle } from './components/IframeWrapper';
import { type ThemeConfig } from '../theme';
import type { LayoutDefinition } from '../layouts';
import type { AiExamplePrompt } from '../ai/types.js';
export interface PuckEditorImplProps {
    /**
     * Page ID for save operations
     */
    pageId: string;
    /**
     * Initial Puck data to load
     */
    initialData: Data;
    /**
     * Puck configuration with components and settings
     */
    config: PuckConfig;
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
     * Used to show draft/published badge in the header
     */
    initialStatus?: 'draft' | 'published';
    /**
     * Theme configuration for customizing component styles
     * When provided, components will use themed styles
     */
    theme?: ThemeConfig;
    /**
     * Stylesheet URLs to inject into the editor iframe.
     * Merged with stylesheets from PuckConfigProvider context.
     */
    editorStylesheets?: string[];
    /**
     * Raw CSS to inject into the editor iframe.
     * Merged with CSS from PuckConfigProvider context.
     */
    editorCss?: string;
    /**
     * Enable AI features in the editor.
     * When true, adds the AI chat plugin.
     * @default false
     */
    enableAi?: boolean;
    /**
     * AI plugin configuration options.
     * Only used when enableAi is true.
     */
    aiOptions?: {
        host?: string;
        examplePrompts?: AiExamplePrompt[];
    };
    /**
     * Whether the puck-ai-prompts collection is enabled.
     * When true, adds the prompt editor plugin to the plugin rail.
     * @default false
     */
    hasPromptsCollection?: boolean;
    /**
     * Whether the puck-ai-context collection is enabled.
     * When true, adds the context editor plugin to the plugin rail.
     * @default false
     */
    hasContextCollection?: boolean;
    /**
     * Enable experimental full screen canvas mode.
     * When enabled, the canvas takes up the full viewport with a floating viewport switcher.
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
 * Full-featured Puck editor implementation
 *
 * Provides a complete editing experience with:
 * - Save draft and publish functionality
 * - Unsaved changes tracking with beforeunload warning
 * - Interactive/Edit mode toggle
 * - Theme-aware preview backgrounds
 * - Responsive viewport switching
 * - Custom header actions
 *
 * Internal implementation component - use PuckEditor instead.
 * @internal
 */
export declare function PuckEditorImpl({ pageId, initialData, config, pageTitle, pageSlug, apiEndpoint, backUrl, previewUrl, enableViewports, plugins, layouts, layoutStyles, layoutKey, headerActionsStart, headerActionsEnd, overrides: customOverrides, onSaveSuccess, onSaveError, onChange: onChangeProp, initialStatus, theme, editorStylesheets: editorStylesheetsProp, editorCss: editorCssProp, enableAi, aiOptions, hasPromptsCollection, hasContextCollection, experimentalFullScreenCanvas, autoDetectDarkMode, showPreviewDarkModeToggle, initialPreviewDarkMode, }: PuckEditorImplProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PuckEditorImpl.client.d.ts.map