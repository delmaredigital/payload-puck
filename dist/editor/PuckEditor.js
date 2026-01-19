'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingState } from './components/LoadingState';
import { injectPageTreeFields } from './utils/injectPageTreeFields.js';
import { hasPageTreeFields } from './utils/detectPageTree.js';
import { usePuckConfig } from '../views/PuckConfigContext.js';
import { injectAiConfig, hasAiConfig } from '../ai/utils/injectAiConfig.js';
import { comprehensiveComponentAiConfig } from '../ai/presets/index.js';
// Dynamic import with ssr: false to prevent hydration mismatch
// Puck generates random IDs for drag-and-drop that differ between server/client
const PuckEditorImpl = dynamic(() => import('./PuckEditorImpl.client').then((mod) => mod.PuckEditorImpl), {
    ssr: false,
    loading: () => _jsx(LoadingState, {}),
});
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
export function PuckEditor({ pageId, initialData, config: configProp, pageTitle, pageSlug, apiEndpoint, backUrl, previewUrl, enableViewports, plugins, layouts: layoutsProp, layoutStyles, layoutKey, headerActionsStart, headerActionsEnd, overrides, onSaveSuccess, onSaveError, onChange, initialStatus, theme: themeProp, 
// Page-tree props
hasPageTree = false, folder, pageSegment, 
// Editor iframe styling props
editorStylesheets: editorStylesheetsProp, editorCss: editorCssProp, 
// AI integration props
enableAi = false, aiOptions, aiExamplePrompts, hasPromptsCollection = false, hasContextCollection = false, aiComponentInstructions, experimentalFullScreenCanvas = false, 
// Dark mode props
autoDetectDarkMode = true, showPreviewDarkModeToggle = true, initialPreviewDarkMode = false, }) {
    // Get config from context as fallback
    const { config: configFromContext, layouts: layoutsFromContext, theme: themeFromContext, editorStylesheets: editorStylesheetsFromContext, editorCss: editorCssFromContext, } = usePuckConfig();
    // Use prop config if provided, otherwise fall back to context
    const baseConfig = configProp || configFromContext;
    const theme = themeProp || themeFromContext;
    // Props take precedence over context for editor stylesheets
    const editorStylesheets = editorStylesheetsProp || editorStylesheetsFromContext;
    const editorCss = editorCssProp || editorCssFromContext;
    // Merge layouts from props and context
    // Props may have metadata (value, label, editorBackground) but no React components
    // Context may have React components (header, footer) that can't be serialized through props
    // Merge by matching on 'value', combining properties, preferring context for components
    const layouts = useMemo(() => {
        // If no layouts from either source, return undefined
        if (!layoutsProp && !layoutsFromContext)
            return undefined;
        // If only one source, use it
        if (!layoutsProp)
            return layoutsFromContext;
        if (!layoutsFromContext)
            return layoutsProp;
        // Merge: for each prop layout, find matching context layout and combine
        return layoutsProp.map((propLayout) => {
            const contextLayout = layoutsFromContext.find((c) => c.value === propLayout.value);
            if (!contextLayout)
                return propLayout;
            // Combine: prop values first, then context values (context provides components)
            return {
                ...propLayout,
                // Context provides React components (these can't be serialized through server props)
                header: propLayout.header || contextLayout.header,
                footer: propLayout.footer || contextLayout.footer,
                // Context may also provide other values not in props
                editorBackground: propLayout.editorBackground || contextLayout.editorBackground,
                editorDarkMode: propLayout.editorDarkMode ?? contextLayout.editorDarkMode,
                stickyHeaderHeight: propLayout.stickyHeaderHeight ?? contextLayout.stickyHeaderHeight,
                styles: propLayout.styles || contextLayout.styles,
            };
        });
    }, [layoutsProp, layoutsFromContext]);
    // Conditionally inject page-tree fields and AI config into config
    const finalConfig = useMemo(() => {
        if (!baseConfig)
            return null;
        let config = baseConfig;
        // Inject AI component instructions when AI is enabled
        if (enableAi && !hasAiConfig(config)) {
            // Merge comprehensive instructions with user-provided overrides
            const mergedAiConfig = aiComponentInstructions
                ? { ...comprehensiveComponentAiConfig, ...aiComponentInstructions }
                : comprehensiveComponentAiConfig;
            config = injectAiConfig(config, mergedAiConfig);
        }
        // Inject page-tree fields if enabled
        if (hasPageTree && !hasPageTreeFields(config)) {
            config = injectPageTreeFields(config);
        }
        return config;
    }, [baseConfig, hasPageTree, enableAi, aiComponentInstructions]);
    // Merge page-tree initial values into initialData
    const finalInitialData = useMemo(() => {
        if (!hasPageTree)
            return initialData;
        return {
            ...initialData,
            root: {
                ...initialData.root,
                props: {
                    ...initialData.root?.props,
                    // Only set if provided and hasPageTree is true
                    ...(folder !== undefined && { folder }),
                    ...(pageSegment !== undefined && { pageSegment }),
                },
            },
        };
    }, [initialData, hasPageTree, folder, pageSegment]);
    // Show error if no config available
    if (!finalConfig) {
        return (_jsx("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 120px)',
                padding: '40px',
                textAlign: 'center',
            }, children: _jsxs("div", { style: {
                    backgroundColor: 'var(--theme-elevation-50)',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: '8px',
                    padding: '32px 48px',
                    maxWidth: '560px',
                }, children: [_jsx("h2", { style: {
                            color: 'var(--theme-elevation-800)',
                            fontSize: '18px',
                            fontWeight: 600,
                            margin: '0 0 12px 0',
                        }, children: "Puck Configuration Required" }), _jsxs("p", { style: {
                            color: 'var(--theme-elevation-500)',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            margin: '0 0 16px 0',
                        }, children: ["Either pass ", _jsx("code", { style: { backgroundColor: 'var(--theme-elevation-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }, children: "config" }), " prop directly, or wrap your application with", ' ', _jsx("code", { style: { backgroundColor: 'var(--theme-elevation-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }, children: "PuckConfigProvider" })] }), _jsx("pre", { style: {
                            backgroundColor: 'var(--theme-elevation-100)',
                            padding: '16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            textAlign: 'left',
                            overflow: 'auto',
                            margin: 0,
                        }, children: `// Option 1: Pass config directly
<PuckEditor config={editorConfig} ... />

// Option 2: Use context provider
<PuckConfigProvider config={editorConfig}>
  <PuckEditor ... />
</PuckConfigProvider>` })] }) }));
    }
    // Merge example prompts from plugin config and aiOptions prop
    const mergedAiOptions = useMemo(() => {
        if (!enableAi)
            return undefined;
        const mergedPrompts = [
            ...(aiExamplePrompts || []),
            ...(aiOptions?.examplePrompts || []),
        ];
        return {
            host: aiOptions?.host || '/api/puck/ai',
            examplePrompts: mergedPrompts.length > 0 ? mergedPrompts : undefined,
        };
    }, [enableAi, aiExamplePrompts, aiOptions]);
    return (_jsx(PuckEditorImpl, { pageId: pageId, initialData: finalInitialData, config: finalConfig, pageTitle: pageTitle, pageSlug: pageSlug, apiEndpoint: apiEndpoint, backUrl: backUrl, previewUrl: previewUrl, enableViewports: enableViewports, plugins: plugins, layouts: layouts, layoutStyles: layoutStyles, layoutKey: layoutKey, headerActionsStart: headerActionsStart, headerActionsEnd: headerActionsEnd, overrides: overrides, onSaveSuccess: onSaveSuccess, onSaveError: onSaveError, onChange: onChange, initialStatus: initialStatus, theme: theme, editorStylesheets: editorStylesheets, editorCss: editorCss, enableAi: enableAi, aiOptions: mergedAiOptions, hasPromptsCollection: hasPromptsCollection, hasContextCollection: hasContextCollection, experimentalFullScreenCanvas: experimentalFullScreenCanvas, autoDetectDarkMode: autoDetectDarkMode, showPreviewDarkModeToggle: showPreviewDarkModeToggle, initialPreviewDarkMode: initialPreviewDarkMode }));
}
//# sourceMappingURL=PuckEditor.js.map