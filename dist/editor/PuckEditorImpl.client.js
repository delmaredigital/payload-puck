'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo, useRef, createElement } from 'react';
import { useRouter } from 'next/navigation';
import { Puck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import headingAnalyzer from '@puckeditor/plugin-heading-analyzer';
import '@puckeditor/plugin-heading-analyzer/dist/index.css';
import { createAiPlugin } from '@puckeditor/plugin-ai';
import '@puckeditor/plugin-ai/styles.css';
import './ai-plugin-overrides.css';
import { Maximize2 } from 'lucide-react';
import { HeaderActions } from './components/HeaderActions';
import { IframeWrapper } from './components/IframeWrapper';
import { PreviewModal } from './components/PreviewModal';
import { DarkModeStyles } from './components/DarkModeStyles';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { createVersionHistoryPlugin } from './plugins/versionHistoryPlugin';
import { ThemeProvider } from '../theme';
import { usePuckConfig } from '../views/PuckConfigContext';
import { useAiPrompts } from '../ai/hooks/useAiPrompts.js';
/**
 * Default viewports for responsive preview
 */
const DEFAULT_VIEWPORTS = [
    {
        width: 360,
        height: 'auto',
        label: 'Mobile',
        icon: 'Smartphone',
    },
    {
        width: 768,
        height: 'auto',
        label: 'Tablet',
        icon: 'Tablet',
    },
    {
        width: 1280,
        height: 'auto',
        label: 'Desktop',
        icon: 'Monitor',
    },
    {
        width: '100%',
        height: 'auto',
        label: 'Full Width',
        icon: createElement(Maximize2, { size: 16 }),
    },
];
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
export function PuckEditorImpl({ pageId, initialData, config, pageTitle, pageSlug, apiEndpoint = '/api/puck/pages', backUrl, previewUrl, enableViewports = true, plugins, layouts, layoutStyles, layoutKey = 'pageLayout', headerActionsStart, headerActionsEnd, overrides: customOverrides, onSaveSuccess, onSaveError, onChange: onChangeProp, initialStatus, theme, editorStylesheets: editorStylesheetsProp, editorCss: editorCssProp, enableAi = false, aiOptions, hasPromptsCollection = false, hasContextCollection = false, experimentalFullScreenCanvas = false, autoDetectDarkMode = true, showPreviewDarkModeToggle = true, initialPreviewDarkMode = false, }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const [documentStatus, setDocumentStatus] = useState(initialStatus);
    // Track if document was ever published (initially or during this session)
    const [wasPublished, setWasPublished] = useState(initialStatus === 'published');
    const { hasUnsavedChanges, markClean, markDirty } = useUnsavedChanges();
    // Preview modal state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    // Preview dark mode state (for toggling dark/light in preview iframe)
    const [previewDarkMode, setPreviewDarkMode] = useState(initialPreviewDarkMode);
    // Inject slug into initial data if not present
    const dataWithSlug = useMemo(() => {
        const data = initialData;
        return {
            ...data,
            root: {
                ...data.root,
                props: {
                    ...data.root?.props,
                    slug: data.root?.props?.slug || pageSlug,
                },
            },
        };
    }, [initialData, pageSlug]);
    // Use a ref to track latest data without causing re-renders
    const latestDataRef = useRef(dataWithSlug);
    // Get editor stylesheets from PuckConfigProvider context (as fallback)
    const { editorStylesheets: contextStylesheets, editorCss: contextCss } = usePuckConfig();
    // Props take precedence over context
    const baseStylesheets = editorStylesheetsProp || contextStylesheets;
    const baseCss = editorCssProp || contextCss;
    // Get current layout to merge layout-specific stylesheets
    const currentLayoutValue = dataWithSlug.root?.props?.pageLayout || 'default';
    const currentLayout = useMemo(() => {
        return layouts?.find((l) => l.value === currentLayoutValue);
    }, [layouts, currentLayoutValue]);
    // Merge base stylesheets (props/context) + layout-specific settings
    const mergedEditorStylesheets = useMemo(() => {
        const fromBase = baseStylesheets || [];
        const fromLayout = currentLayout?.editorStylesheets || [];
        return [...fromBase, ...fromLayout];
    }, [baseStylesheets, currentLayout?.editorStylesheets]);
    // Merge base CSS (props/context) + layout-specific settings
    const mergedEditorCss = useMemo(() => {
        const parts = [baseCss, currentLayout?.editorCss].filter(Boolean);
        return parts.length > 0 ? parts.join('\n') : undefined;
    }, [baseCss, currentLayout?.editorCss]);
    // Handle save (as draft)
    const handleSave = useCallback(async (data) => {
        setIsSaving(true);
        const typedData = data;
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    puckData: data,
                    title: typedData.root?.props?.title || pageTitle,
                    slug: typedData.root?.props?.slug || pageSlug,
                    // Page-tree integration: include folder and pageSegment if present
                    folder: typedData.root?.props?.folder,
                    pageSegment: typedData.root?.props?.pageSegment,
                    draft: true, // Save as draft, don't publish
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || errorData.message || 'Failed to save page';
                const err = new Error(errorMessage);
                err.field = errorData.field;
                err.details = errorData.details;
                throw err;
            }
            setLastSaved(new Date());
            setSaveError(null); // Clear any previous error
            // After saving as draft, update status to draft (shows "Unpublished Changes" if was published)
            setDocumentStatus('draft');
            markClean();
            onSaveSuccess?.(data);
        }
        catch (error) {
            console.error('Error saving page:', error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error');
            onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
        finally {
            setIsSaving(false);
        }
    }, [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError]);
    // Handle publish
    const handlePublish = useCallback(async (data) => {
        setIsSaving(true);
        const typedData = data;
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    puckData: data,
                    title: typedData.root?.props?.title || pageTitle,
                    slug: typedData.root?.props?.slug || pageSlug,
                    // Page-tree integration: include folder and pageSegment if present
                    folder: typedData.root?.props?.folder,
                    pageSegment: typedData.root?.props?.pageSegment,
                    _status: 'published',
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || errorData.message || 'Failed to publish page';
                const err = new Error(errorMessage);
                err.field = errorData.field;
                err.details = errorData.details;
                throw err;
            }
            setLastSaved(new Date());
            setSaveError(null); // Clear any previous error
            setDocumentStatus('published'); // Update status after successful publish
            setWasPublished(true); // Mark as having been published
            markClean();
            onSaveSuccess?.(data);
        }
        catch (error) {
            console.error('Error publishing page:', error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error');
            onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
        finally {
            setIsSaving(false);
        }
    }, [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError]);
    // Handle unpublish (revert to draft)
    const handleUnpublish = useCallback(async () => {
        if (!confirm('This will unpublish the page and return it to draft status. Continue?')) {
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _status: 'draft',
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || errorData.message || 'Failed to unpublish page';
                throw new Error(errorMessage);
            }
            setLastSaved(new Date());
            setSaveError(null);
            setDocumentStatus('draft');
        }
        catch (error) {
            console.error('Error unpublishing page:', error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error');
        }
        finally {
            setIsSaving(false);
        }
    }, [apiEndpoint, pageId]);
    // Handle data change
    const handleChange = useCallback((data) => {
        latestDataRef.current = data;
        markDirty();
        onChangeProp?.(data);
    }, [markDirty, onChangeProp]);
    // Handle back navigation
    const handleBack = useCallback(() => {
        if (hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
            }
        }
        if (backUrl) {
            router.push(backUrl);
        }
        else {
            router.back();
        }
    }, [hasUnsavedChanges, router, backUrl]);
    // Handle preview (opens in new tab)
    const handlePreview = useCallback(() => {
        const rootProps = latestDataRef.current?.root?.props;
        const currentSlug = rootProps?.slug || pageSlug;
        const isHomepage = rootProps?.isHomepage === true;
        let url;
        if (typeof previewUrl === 'function') {
            // If homepage, pass '/' to the function, otherwise pass the slug
            url = previewUrl(isHomepage ? '' : currentSlug);
        }
        else if (previewUrl) {
            url = previewUrl;
        }
        else {
            // If homepage, navigate to root, otherwise use slug
            url = isHomepage ? '/' : `/${currentSlug}`;
        }
        window.open(url, '_blank');
    }, [pageSlug, previewUrl]);
    // Handle opening preview modal
    const handleOpenPreview = useCallback(() => {
        setIsPreviewOpen(true);
    }, []);
    // Handle save from preview modal (returns Promise for navigation flow)
    const handleSaveFromPreview = useCallback(async () => {
        const data = latestDataRef.current;
        setIsSaving(true);
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    puckData: data,
                    title: data?.root?.props?.title || pageTitle,
                    slug: data?.root?.props?.slug || pageSlug,
                    // Page-tree integration: include folder and pageSegment if present
                    folder: data?.root?.props?.folder,
                    pageSegment: data?.root?.props?.pageSegment,
                    draft: true,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || errorData.message || 'Failed to save page';
                throw new Error(errorMessage);
            }
            setLastSaved(new Date());
            setSaveError(null);
            setDocumentStatus('draft');
            markClean();
            onSaveSuccess?.(data);
        }
        catch (error) {
            console.error('Error saving page:', error);
            setSaveError(error instanceof Error ? error.message : 'Unknown error');
            onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
            throw error; // Re-throw so preview modal knows save failed
        }
        finally {
            setIsSaving(false);
        }
    }, [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError]);
    // Memoized overrides
    const overrides = useMemo(() => ({
        headerActions: ({ children }) => (_jsx(HeaderActions, { onBack: handleBack, onPreview: handlePreview, onSave: handleSave, onPublish: handlePublish, onUnpublish: handleUnpublish, onOpenPreview: handleOpenPreview, isSaving: isSaving, hasUnsavedChanges: hasUnsavedChanges, lastSaved: lastSaved, documentStatus: documentStatus, wasPublished: wasPublished, actionsStart: headerActionsStart, actionsEnd: headerActionsEnd, pageId: pageId, apiEndpoint: apiEndpoint, saveError: saveError, onDismissError: () => setSaveError(null), showVersionHistory: false, showPreviewDarkModeToggle: showPreviewDarkModeToggle, previewDarkMode: previewDarkMode, onPreviewDarkModeChange: setPreviewDarkMode, children: children })),
        // Always wrap iframe for richtext styles injection and theme-aware background
        iframe: ({ children, document }) => (_jsx(IframeWrapper, { document: document, layouts: layouts, layoutStyles: layoutStyles, layoutKey: layoutKey, editorStylesheets: mergedEditorStylesheets, editorCss: mergedEditorCss, previewDarkModeOverride: showPreviewDarkModeToggle ? previewDarkMode : undefined, children: children })),
        // Merge custom overrides
        ...customOverrides,
    }), [
        handleBack,
        handlePreview,
        handleSave,
        handlePublish,
        handleUnpublish,
        handleOpenPreview,
        isSaving,
        hasUnsavedChanges,
        lastSaved,
        saveError,
        documentStatus,
        wasPublished,
        headerActionsStart,
        headerActionsEnd,
        pageId,
        apiEndpoint,
        layouts,
        layoutStyles,
        layoutKey,
        customOverrides,
        mergedEditorStylesheets,
        mergedEditorCss,
        showPreviewDarkModeToggle,
        previewDarkMode,
        setPreviewDarkMode,
    ]);
    // Default plugins - headingAnalyzer is always included unless plugins is explicitly false
    const defaultPlugins = [headingAnalyzer];
    // Version history plugin for the plugin rail
    const versionHistoryPlugin = useMemo(() => {
        if (!pageId)
            return null;
        return createVersionHistoryPlugin({
            pageId,
            apiEndpoint,
            onRestoreSuccess: markClean,
        });
    }, [pageId, apiEndpoint, markClean]);
    // Fetch AI prompts client-side when prompts collection is enabled
    // This allows prompts to update in real-time when edited via the prompt editor panel
    const { prompts: clientPrompts, loading: promptsLoading } = useAiPrompts('/api/puck/ai-prompts', enableAi && hasPromptsCollection);
    // Use refs to store the latest prompts so onClick handlers can access current values
    // without causing the plugin to be recreated (which would cause Puck to remount panels)
    const clientPromptsRef = useRef(clientPrompts);
    clientPromptsRef.current = clientPrompts;
    const staticPromptsRef = useRef(aiOptions?.examplePrompts);
    staticPromptsRef.current = aiOptions?.examplePrompts;
    // AI plugin - statically imported, only instantiated when enabled
    // IMPORTANT: We intentionally exclude clientPrompts and aiOptions.examplePrompts from deps
    // to prevent plugin recreation. The onClick handlers use refs to access current prompts.
    const aiPlugin = useMemo(() => {
        if (!enableAi)
            return null;
        // Don't create plugin until prompts are loaded (when using prompts collection)
        if (hasPromptsCollection && promptsLoading)
            return null;
        // Use client-fetched prompts when prompts collection is enabled,
        // otherwise fall back to static props from config
        // NOTE: We read from refs in onClick to get current values without causing re-renders
        const getPrompts = () => hasPromptsCollection
            ? (clientPromptsRef.current || [])
            : (staticPromptsRef.current || []);
        // Get initial prompts for labels (labels are stable, only prompts text might change)
        const initialPrompts = getPrompts();
        // Convert our { label, prompt } format to plugin's { label, onClick } format
        // The plugin expects onClick to send the message via window.__PUCK_AI.sendMessage
        const convertedPrompts = initialPrompts.map((item, index) => ({
            label: item.label,
            onClick: () => {
                // Access current prompts via ref to get latest values
                const currentPrompts = getPrompts();
                const currentPrompt = currentPrompts[index]?.prompt || item.prompt;
                // Use Puck AI's global API to send the prompt as a user message
                // sendMessage accepts { text: string } as a simpler format
                if (typeof window !== 'undefined' && window.__PUCK_AI?.sendMessage) {
                    ;
                    window.__PUCK_AI.sendMessage({ text: currentPrompt });
                }
            },
        }));
        return createAiPlugin({
            host: aiOptions?.host || '/api/puck/ai',
            chat: {
                examplePrompts: convertedPrompts.length > 0 ? convertedPrompts : undefined,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit prompt arrays to prevent recreation
    }, [enableAi, hasPromptsCollection, promptsLoading, aiOptions?.host]);
    // Prompt editor plugin - for managing AI prompts in the plugin rail
    const promptEditorPlugin = useMemo(() => {
        if (!enableAi || !hasPromptsCollection)
            return null;
        try {
            // Dynamic require to avoid errors if module not available
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { createPromptEditorPlugin } = require('../ai/plugins/promptEditorPlugin');
            return createPromptEditorPlugin({
                apiEndpoint: '/api/puck/ai-prompts',
            });
        }
        catch (e) {
            console.warn('[PuckEditor] Failed to load prompt editor plugin:', e);
            return null;
        }
    }, [enableAi, hasPromptsCollection]);
    // Context editor plugin - for managing AI context in the plugin rail
    const contextEditorPlugin = useMemo(() => {
        if (!enableAi || !hasContextCollection)
            return null;
        try {
            // Dynamic require to avoid errors if module not available
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { createContextEditorPlugin } = require('../ai/plugins/contextEditorPlugin');
            return createContextEditorPlugin({
                apiEndpoint: '/api/puck/ai-context',
            });
        }
        catch (e) {
            console.warn('[PuckEditor] Failed to load context editor plugin:', e);
            return null;
        }
    }, [enableAi, hasContextCollection]);
    const resolvedPlugins = useMemo(() => {
        if (plugins === false)
            return undefined;
        const base = !plugins || plugins.length === 0 ? defaultPlugins : [...defaultPlugins, ...plugins];
        // Add version history plugin if available
        if (versionHistoryPlugin) {
            base.push(versionHistoryPlugin);
        }
        // Add AI plugin if enabled
        if (aiPlugin) {
            base.push(aiPlugin);
        }
        // Add prompt editor plugin if enabled
        if (promptEditorPlugin) {
            base.push(promptEditorPlugin);
        }
        // Add context editor plugin if enabled
        if (contextEditorPlugin) {
            base.push(contextEditorPlugin);
        }
        return base;
    }, [plugins, versionHistoryPlugin, aiPlugin, promptEditorPlugin, contextEditorPlugin]);
    const editorContent = (_jsxs(_Fragment, { children: [autoDetectDarkMode && _jsx(DarkModeStyles, {}), _jsx("div", { className: "h-screen", children: _jsx(Puck, { config: config, data: dataWithSlug, onChange: handleChange, onPublish: handlePublish, headerTitle: `${pageTitle} /${pageSlug}`, plugins: resolvedPlugins, viewports: enableViewports ? DEFAULT_VIEWPORTS : undefined, overrides: overrides, _experimentalFullScreenCanvas: experimentalFullScreenCanvas }) }), _jsx(PreviewModal, { isOpen: isPreviewOpen, onClose: () => setIsPreviewOpen(false), data: latestDataRef.current, pageTitle: pageTitle, onOpenInNewTab: handlePreview, layouts: layouts, hasUnsavedChanges: hasUnsavedChanges, onSave: handleSaveFromPreview, isSaving: isSaving, editorStylesheets: mergedEditorStylesheets, editorCss: mergedEditorCss })] }));
    // Wrap with ThemeProvider if theme is provided
    if (theme) {
        return _jsx(ThemeProvider, { theme: theme, children: editorContent });
    }
    return editorContent;
}
//# sourceMappingURL=PuckEditorImpl.client.js.map