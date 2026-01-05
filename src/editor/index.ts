'use client'

/**
 * @delmaredigital/payload-puck/editor
 *
 * Full-featured Puck editor components with dynamic loading,
 * unsaved changes tracking, and theme-aware preview.
 *
 * @example
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
 *       backUrl="/admin/pages"
 *       layoutStyles={{
 *         default: { background: '#fff', isDark: false },
 *         dark: { background: '#1a1a1a', isDark: true },
 *       }}
 *       onSaveSuccess={(data) => console.log('Saved!', data)}
 *       onSaveError={(error) => console.error('Error:', error)}
 *     />
 *   )
 * }
 * ```
 */

// Main editor components
export { PuckEditor, type PuckEditorProps } from './PuckEditor.client'
export { PuckEditorCore, type PuckEditorCoreProps } from './PuckEditorCore.client'

// Ready-to-use editor page component (auto-fetches page data from route params)
export { PuckEditorView, type PuckEditorViewProps } from '../admin/PuckEditorView'

// Sub-components
export { HeaderActions, type HeaderActionsProps } from './components/HeaderActions'
export { IframeWrapper, type IframeWrapperProps, type LayoutStyle } from './components/IframeWrapper'
export { LoadingState, type LoadingStateProps } from './components/LoadingState'
export { PreviewModal, type PreviewModalProps } from './components/PreviewModal'
export { VersionHistory, type VersionHistoryProps, type PageVersion } from './components/VersionHistory'

// Hooks
export { useUnsavedChanges, type UseUnsavedChangesReturn } from './hooks/useUnsavedChanges'

// Plugins
export { headingAnalyzer } from './plugins'
