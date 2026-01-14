'use client'

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
export { PuckEditor, type PuckEditorProps } from './PuckEditor.js'

// Ready-to-use editor page component (auto-fetches page data from route params)
export { PuckEditorView, type PuckEditorViewProps } from '../admin/PuckEditorView.js'

// Sub-components for advanced customization
export { HeaderActions, type HeaderActionsProps } from './components/HeaderActions.js'
export { IframeWrapper, type IframeWrapperProps, type LayoutStyle } from './components/IframeWrapper.js'
export { LoadingState, type LoadingStateProps } from './components/LoadingState.js'
export { PreviewModal, type PreviewModalProps } from './components/PreviewModal.js'
/**
 * @deprecated Use createVersionHistoryPlugin instead. VersionHistory has moved to the plugin rail.
 */
export { VersionHistory, type VersionHistoryProps, type PageVersion } from './components/VersionHistory.js'

// Utilities
export { injectPageTreeFields } from './utils/injectPageTreeFields.js'
export { detectPageTree, hasPageTreeFields } from './utils/detectPageTree.js'

// Hooks
export { useUnsavedChanges, type UseUnsavedChangesReturn } from './hooks/useUnsavedChanges.js'

// Plugins
export { headingAnalyzer } from './plugins/index.js'
export {
  createVersionHistoryPlugin,
  type VersionHistoryPluginOptions,
  VersionHistoryPanel,
  type VersionHistoryPanelProps,
} from './plugins/index.js'
