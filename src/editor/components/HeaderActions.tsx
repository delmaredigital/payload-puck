'use client'

import { memo, useCallback, type ReactNode } from 'react'
import { createUsePuck, type Data } from '@measured/puck'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconExternalLink,
  IconLoader2,
  IconCheck,
  IconHandClick,
  IconPointer,
  IconUpload,
  IconX,
  IconAlertTriangle,
  IconEye,
} from '@tabler/icons-react'
import { VersionHistory } from './VersionHistory'
import { cn } from '../../lib/utils'

// Create usePuck hook for accessing editor state
const usePuck = createUsePuck()

export interface HeaderActionsProps {
  /**
   * Default Puck header actions (undo/redo, publish button)
   */
  children: ReactNode
  /**
   * Handler for back button click
   */
  onBack: () => void
  /**
   * Handler for preview button click
   */
  onPreview: () => void
  /**
   * Handler for save button click
   */
  onSave: (data: Data) => void
  /**
   * Handler for publish button click (optional, uses default Puck publish if not provided)
   */
  onPublish?: (data: Data) => void
  /**
   * Whether a save operation is in progress
   */
  isSaving: boolean
  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges: boolean
  /**
   * Last saved timestamp
   */
  lastSaved: Date | null
  /**
   * Document status from Payload (_status field)
   * Shows visual indicator for draft vs published
   */
  documentStatus?: 'draft' | 'published'
  /**
   * Whether the document has ever been published (initially or during this session)
   * Used to show "Unpublished Changes" vs "Draft" badge
   */
  wasPublished?: boolean
  /**
   * Custom actions to render at the start of the header
   */
  actionsStart?: ReactNode
  /**
   * Custom actions to render at the end of the header (before publish)
   */
  actionsEnd?: ReactNode
  /**
   * Whether to show the save draft button
   * @default true
   */
  showSaveDraft?: boolean
  /**
   * Whether to show the view page button
   * @default true
   */
  showViewPage?: boolean
  /**
   * Whether to show the interactive mode toggle
   * @default false
   * @deprecated Use the Preview button instead
   */
  showInteractiveToggle?: boolean
  /**
   * Whether to show the preview button
   * @default true
   */
  showPreviewButton?: boolean
  /**
   * Handler for opening the preview modal
   */
  onOpenPreview?: () => void
  /**
   * Whether to show the version history button
   * @default true
   */
  showVersionHistory?: boolean
  /**
   * Page ID for version history (required if showVersionHistory is true)
   */
  pageId?: string
  /**
   * API endpoint base path for version history
   * @default '/api/puck/pages'
   */
  apiEndpoint?: string
  /**
   * Error message to display (e.g., validation errors)
   */
  saveError?: string | null
  /**
   * Handler to dismiss the error message
   */
  onDismissError?: () => void
}

/**
 * Custom header actions component for the Puck editor
 *
 * Provides standard actions: Back, Edit/Interactive toggle, View Page, Save Draft
 * Also displays save status and last saved time.
 *
 * @example
 * ```tsx
 * const overrides = {
 *   headerActions: ({ children }) => (
 *     <HeaderActions
 *       onBack={handleBack}
 *       onPreview={handlePreview}
 *       onSave={handleSave}
 *       isSaving={isSaving}
 *       hasUnsavedChanges={hasUnsavedChanges}
 *       lastSaved={lastSaved}
 *     >
 *       {children}
 *     </HeaderActions>
 *   ),
 * }
 * ```
 */
export const HeaderActions = memo(function HeaderActions({
  children,
  onBack,
  onPreview,
  onSave,
  onPublish,
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  documentStatus,
  wasPublished,
  actionsStart,
  actionsEnd,
  showSaveDraft = true,
  showViewPage = true,
  showInteractiveToggle = false,
  showPreviewButton = true,
  onOpenPreview,
  showVersionHistory = true,
  pageId,
  apiEndpoint = '/api/puck/pages',
  saveError,
  onDismissError,
}: HeaderActionsProps) {
  const appState = usePuck((s) => s.appState)
  const dispatch = usePuck((s) => s.dispatch)

  const isInteractive = appState.ui.previewMode === 'interactive'

  const togglePreviewMode = useCallback(() => {
    dispatch({
      type: 'setUi',
      ui: {
        previewMode: isInteractive ? 'edit' : 'interactive',
      },
    })
  }, [dispatch, isInteractive])

  const handleSaveClick = useCallback(() => {
    onSave(appState.data)
  }, [onSave, appState.data])

  const handlePublishClick = useCallback(() => {
    if (onPublish) {
      onPublish(appState.data)
    }
  }, [onPublish, appState.data])

  // Common button base class (non-color styles that Puck doesn't override)
  const btnBase = 'inline-flex items-center whitespace-nowrap text-sm font-medium rounded-md transition-colors'

  return (
    <>
      {/* Custom actions at start */}
      {actionsStart}

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className={cn(btnBase, "px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50")}
      >
        <IconArrowLeft className="h-4 w-4 mr-1 flex-shrink-0" />
        Back
      </button>

      {/* Document status badge */}
      {documentStatus && (() => {
        // Determine badge state
        const isPublished = documentStatus === 'published'
        const hasUnpublishedChanges = documentStatus === 'draft' && wasPublished

        // Badge label based on state
        let badgeLabel: string

        if (isPublished) {
          badgeLabel = 'Published'
        } else if (hasUnpublishedChanges) {
          badgeLabel = 'Unpublished Changes'
        } else {
          badgeLabel = 'Draft'
        }

        return (
          <span
            className={cn(
              "px-2.5 py-1 border rounded-full text-xs font-medium whitespace-nowrap",
              isPublished && "bg-green-100 text-green-800 border-green-300",
              hasUnpublishedChanges && "bg-orange-100 text-orange-700 border-orange-200",
              !isPublished && !hasUnpublishedChanges && "bg-amber-100 text-amber-700 border-amber-200"
            )}
          >
            {badgeLabel}
          </span>
        )
      })()}

      {/* Interactive mode toggle */}
      {showInteractiveToggle && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => isInteractive && togglePreviewMode()}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium rounded transition-colors px-2.5 py-1.5 border",
              !isInteractive
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}
          >
            <IconPointer className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => !isInteractive && togglePreviewMode()}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium rounded transition-colors px-2.5 py-1.5 border",
              isInteractive
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}
          >
            <IconHandClick className="h-3.5 w-3.5" />
            Interactive
          </button>
        </div>
      )}

      {/* Status indicators */}
      {lastSaved && !saveError && (
        <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
          <IconCheck className="h-3 w-3 flex-shrink-0" />
          Saved {lastSaved.toLocaleTimeString()}
        </span>
      )}
      {hasUnsavedChanges && !saveError && (
        <span className="text-xs text-amber-600 font-medium whitespace-nowrap">Unsaved</span>
      )}

      {/* Error indicator in header - clicking opens modal */}
      {saveError && (
        <button
          type="button"
          onClick={() => {}} // Modal is already open when saveError exists
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-medium"
        >
          <IconAlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          Error
        </button>
      )}

      {/* Error Modal */}
      {saveError && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={onDismissError}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-red-50">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <IconAlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Save Failed</h3>
                <p className="text-sm text-gray-500">Unable to save your changes</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">{saveError}</p>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onDismissError}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal button */}
      {showPreviewButton && onOpenPreview && (
        <button
          type="button"
          onClick={onOpenPreview}
          disabled={isSaving}
          className={cn(
            btnBase,
            "px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <IconEye className="h-4 w-4 mr-1 flex-shrink-0" />
          Preview
        </button>
      )}

      {/* View published page in new tab */}
      {showViewPage && (
        <button
          type="button"
          onClick={onPreview}
          className={cn(btnBase, "px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50")}
        >
          <IconExternalLink className="h-4 w-4 mr-1 flex-shrink-0" />
          View
        </button>
      )}

      {/* Version History */}
      {showVersionHistory && pageId && (
        <VersionHistory
          pageId={pageId}
          apiEndpoint={apiEndpoint}
          disabled={isSaving}
        />
      )}

      {/* Save Draft button */}
      {showSaveDraft && (
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving || !hasUnsavedChanges}
          className={cn(
            btnBase,
            "px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <IconLoader2 className="h-4 w-4 mr-1 flex-shrink-0 animate-spin" />
          ) : (
            <IconDeviceFloppy className="h-4 w-4 mr-1 flex-shrink-0" />
          )}
          Save
        </button>
      )}

      {/* Custom publish button if handler provided */}
      {onPublish && (
        <button
          type="button"
          onClick={handlePublishClick}
          disabled={isSaving}
          className={cn(
            btnBase,
            "px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <IconLoader2 className="h-4 w-4 mr-1 flex-shrink-0 animate-spin" />
          ) : (
            <IconUpload className="h-4 w-4 mr-1 flex-shrink-0" />
          )}
          Publish
        </button>
      )}

      {/* Custom actions at end */}
      {actionsEnd}

      {/* Default Puck actions (undo/redo, publish button if no custom handler) */}
      {!onPublish && children}
    </>
  )
})
