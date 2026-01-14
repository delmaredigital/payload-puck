'use client'

import { memo, useCallback, type ReactNode, type CSSProperties } from 'react'
import { createUsePuck, type Data } from '@puckeditor/core'
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Loader2,
  Check,
  MousePointerClick,
  MousePointer,
  Upload,
  X,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { VersionHistory } from './VersionHistory.js'
import { VERSION } from '../../version.js'

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
   * Handler for unpublish button click (reverts to draft)
   */
  onUnpublish?: () => void
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
   * Whether to show the version history button in the header
   * @default true
   * @deprecated Version history has moved to the plugin rail. This prop will be removed in a future version.
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

// Shared styles
const styles = {
  buttonBase: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'background-color 0.15s, border-color 0.15s',
    cursor: 'pointer',
    border: 'none',
  } as CSSProperties,
  buttonSecondary: {
    padding: '6px 12px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    border: '1px solid var(--theme-elevation-200)',
  } as CSSProperties,
  buttonPrimary: {
    padding: '6px 12px',
    backgroundColor: 'var(--theme-elevation-900)',
    color: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-900)',
  } as CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  icon: {
    width: '16px',
    height: '16px',
    marginRight: '4px',
    flexShrink: 0,
  } as CSSProperties,
  iconSmall: {
    width: '14px',
    height: '14px',
  } as CSSProperties,
  badge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  badgePublished: {
    backgroundColor: 'var(--theme-success-100)',
    color: 'var(--theme-success-700)',
    border: '1px solid var(--theme-success-200)',
  } as CSSProperties,
  badgeUnpublished: {
    backgroundColor: 'var(--theme-warning-100)',
    color: 'var(--theme-warning-700)',
    border: '1px solid var(--theme-warning-200)',
  } as CSSProperties,
  badgeDraft: {
    backgroundColor: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-600)',
    border: '1px solid var(--theme-elevation-200)',
  } as CSSProperties,
  statusText: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  } as CSSProperties,
  unsavedText: {
    fontSize: '12px',
    color: 'var(--theme-warning-600)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  versionText: {
    fontSize: '10px',
    color: 'var(--theme-elevation-400)',
    fontFamily: 'monospace',
  } as CSSProperties,
  linkButton: {
    background: 'none',
    border: 'none',
    padding: '4px 8px',
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  } as CSSProperties,
  errorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: 'var(--theme-error-50)',
    border: '1px solid var(--theme-error-200)',
    borderRadius: '6px',
    color: 'var(--theme-error-700)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as CSSProperties,
  modalContainer: {
    backgroundColor: 'var(--theme-bg)',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '448px',
    width: '100%',
    margin: '0 16px',
    overflow: 'hidden',
  } as CSSProperties,
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--theme-elevation-150)',
    backgroundColor: 'var(--theme-error-50)',
  } as CSSProperties,
  modalIconWrapper: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-error-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  modalTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--theme-elevation-900)',
    margin: 0,
  } as CSSProperties,
  modalSubtitle: {
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    margin: 0,
  } as CSSProperties,
  modalBody: {
    padding: '16px 20px',
  } as CSSProperties,
  modalBodyText: {
    fontSize: '14px',
    color: 'var(--theme-elevation-700)',
    margin: 0,
  } as CSSProperties,
  modalFooter: {
    padding: '16px 20px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderTop: '1px solid var(--theme-elevation-150)',
    display: 'flex',
    justifyContent: 'flex-end',
  } as CSSProperties,
  toggleContainer: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  toggleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    transition: 'background-color 0.15s',
    padding: '6px 10px',
    cursor: 'pointer',
  } as CSSProperties,
  toggleActive: {
    backgroundColor: 'var(--theme-elevation-900)',
    color: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-900)',
  } as CSSProperties,
  toggleInactive: {
    backgroundColor: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-500)',
    border: '1px solid var(--theme-elevation-200)',
  } as CSSProperties,
}

/**
 * Custom header actions component for the Puck editor
 *
 * Provides standard actions: Back, Edit/Interactive toggle, View Page, Save Draft
 * Also displays save status and last saved time.
 */
export const HeaderActions = memo(function HeaderActions({
  children,
  onBack,
  onPreview,
  onSave,
  onPublish,
  onUnpublish,
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

  return (
    <>
      {/* Custom actions at start */}
      {actionsStart}

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{ ...styles.buttonBase, ...styles.buttonSecondary }}
      >
        <ArrowLeft style={styles.icon} />
        Back
      </button>

      {/* Version indicator for debugging */}
      <span style={styles.versionText}>v{VERSION}</span>

      {/* Document status badge */}
      {documentStatus && (() => {
        const isPublished = documentStatus === 'published'
        const hasUnpublishedChanges = documentStatus === 'draft' && wasPublished

        let badgeLabel: string
        let badgeStyle: CSSProperties

        if (isPublished) {
          badgeLabel = 'Published'
          badgeStyle = { ...styles.badge, ...styles.badgePublished }
        } else if (hasUnpublishedChanges) {
          badgeLabel = 'Unpublished Changes'
          badgeStyle = { ...styles.badge, ...styles.badgeUnpublished }
        } else {
          badgeLabel = 'Draft'
          badgeStyle = { ...styles.badge, ...styles.badgeDraft }
        }

        return <span style={badgeStyle}>{badgeLabel}</span>
      })()}

      {/* Interactive mode toggle */}
      {showInteractiveToggle && (
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => isInteractive && togglePreviewMode()}
            style={{
              ...styles.toggleButton,
              ...(!isInteractive ? styles.toggleActive : styles.toggleInactive),
            }}
          >
            <MousePointer style={styles.iconSmall} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => !isInteractive && togglePreviewMode()}
            style={{
              ...styles.toggleButton,
              ...(isInteractive ? styles.toggleActive : styles.toggleInactive),
            }}
          >
            <MousePointerClick style={styles.iconSmall} />
            Interactive
          </button>
        </div>
      )}

      {/* Status indicators */}
      {lastSaved && !saveError && (
        <span style={styles.statusText}>
          <Check style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          Saved {lastSaved.toLocaleTimeString()}
        </span>
      )}
      {hasUnsavedChanges && !saveError && (
        <span style={styles.unsavedText}>Unsaved</span>
      )}

      {/* Error indicator in header - clicking opens modal */}
      {saveError && (
        <button
          type="button"
          onClick={() => {}}
          style={styles.errorButton}
        >
          <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--theme-error-500)', flexShrink: 0 }} />
          Error
        </button>
      )}

      {/* Error Modal */}
      {saveError && (
        <div
          style={styles.modalOverlay}
          onClick={onDismissError}
        >
          <div
            style={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalIconWrapper}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--theme-error-600)' }} />
              </div>
              <div>
                <h3 style={styles.modalTitle}>Save Failed</h3>
                <p style={styles.modalSubtitle}>Unable to save your changes</p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              <p style={styles.modalBodyText}>{saveError}</p>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={onDismissError}
                style={{ ...styles.buttonBase, ...styles.buttonPrimary }}
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
          style={{
            ...styles.buttonBase,
            ...styles.buttonPrimary,
            ...(isSaving ? styles.buttonDisabled : {}),
          }}
        >
          <Eye style={styles.icon} />
          Preview
        </button>
      )}

      {/* View published page in new tab */}
      {showViewPage && (
        <button
          type="button"
          onClick={onPreview}
          style={{ ...styles.buttonBase, ...styles.buttonSecondary }}
        >
          <ExternalLink style={styles.icon} />
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
          style={{
            ...styles.buttonBase,
            ...styles.buttonSecondary,
            ...((isSaving || !hasUnsavedChanges) ? styles.buttonDisabled : {}),
          }}
        >
          {isSaving ? (
            <Loader2 style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} />
          ) : (
            <Save style={styles.icon} />
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
          style={{
            ...styles.buttonBase,
            ...styles.buttonPrimary,
            ...(isSaving ? styles.buttonDisabled : {}),
          }}
        >
          {isSaving ? (
            <Loader2 style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} />
          ) : (
            <Upload style={styles.icon} />
          )}
          Publish
        </button>
      )}

      {/* Unpublish link (only shown when document is published) */}
      {onUnpublish && documentStatus === 'published' && (
        <button
          type="button"
          onClick={onUnpublish}
          disabled={isSaving}
          style={{
            ...styles.linkButton,
            ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
        >
          Unpublish
        </button>
      )}

      {/* Custom actions at end */}
      {actionsEnd}

      {/* Default Puck actions (undo/redo, publish button if no custom handler) */}
      {!onPublish && children}
    </>
  )
})
