'use client';
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
// Main editor component
export { PuckEditor } from './PuckEditor.js';
// Ready-to-use editor page component (auto-fetches page data from route params)
export { PuckEditorView } from '../admin/PuckEditorView.js';
// Sub-components for advanced customization
export { HeaderActions } from './components/HeaderActions.js';
export { IframeWrapper } from './components/IframeWrapper.js';
export { LoadingState } from './components/LoadingState.js';
export { PreviewModal } from './components/PreviewModal.js';
export { DarkModeStyles } from './components/DarkModeStyles.js';
export { PreviewModeToggle } from './components/PreviewModeToggle.js';
/**
 * @deprecated Use createVersionHistoryPlugin instead. VersionHistory has moved to the plugin rail.
 */
export { VersionHistory } from './components/VersionHistory.js';
// Utilities
export { injectPageTreeFields } from './utils/injectPageTreeFields.js';
export { detectPageTree, hasPageTreeFields } from './utils/detectPageTree.js';
// Hooks
export { useUnsavedChanges } from './hooks/useUnsavedChanges.js';
export { useDarkMode } from './hooks/useDarkMode.js';
// Plugins
export { headingAnalyzer } from './plugins/index.js';
export { createVersionHistoryPlugin, VersionHistoryPanel, } from './plugins/index.js';
//# sourceMappingURL=index.js.map