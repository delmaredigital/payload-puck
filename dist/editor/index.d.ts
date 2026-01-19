/**
 * @delmaredigital/payload-puck/editor
 *
 * Full-featured Puck editor component with built-in page-tree support,
 * dynamic loading, unsaved changes tracking, and theme-aware preview.
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
export { PuckEditor, type PuckEditorProps } from './PuckEditor.js';
export { PuckEditorView, type PuckEditorViewProps } from '../admin/PuckEditorView.js';
export { HeaderActions, type HeaderActionsProps } from './components/HeaderActions.js';
export { IframeWrapper, type IframeWrapperProps, type LayoutStyle } from './components/IframeWrapper.js';
export { LoadingState, type LoadingStateProps } from './components/LoadingState.js';
export { PreviewModal, type PreviewModalProps } from './components/PreviewModal.js';
export { DarkModeStyles, type DarkModeStylesProps } from './components/DarkModeStyles.js';
export { PreviewModeToggle, type PreviewModeToggleProps } from './components/PreviewModeToggle.js';
/**
 * @deprecated Use createVersionHistoryPlugin instead. VersionHistory has moved to the plugin rail.
 */
export { VersionHistory, type VersionHistoryProps, type PageVersion } from './components/VersionHistory.js';
export { injectPageTreeFields } from './utils/injectPageTreeFields.js';
export { detectPageTree, hasPageTreeFields } from './utils/detectPageTree.js';
export { useUnsavedChanges, type UseUnsavedChangesReturn } from './hooks/useUnsavedChanges.js';
export { useDarkMode, type UseDarkModeReturn, type DarkModeSource } from './hooks/useDarkMode.js';
export { headingAnalyzer } from './plugins/index.js';
export { createVersionHistoryPlugin, type VersionHistoryPluginOptions, VersionHistoryPanel, type VersionHistoryPanelProps, } from './plugins/index.js';
//# sourceMappingURL=index.d.ts.map