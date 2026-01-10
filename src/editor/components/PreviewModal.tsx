'use client'

import { useState, useCallback, memo, useEffect, type MouseEvent, type CSSProperties } from 'react'
import type { Data as PuckData } from '@measured/puck'
import {
  X,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { PageRenderer } from '../../render/PageRenderer.js'
import type { LayoutDefinition } from '../../layouts/index.js'

export interface PreviewModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean
  /**
   * Handler for closing the modal
   */
  onClose: () => void
  /**
   * Puck data to render in the preview
   */
  data: PuckData | null
  /**
   * Page title for the modal header
   */
  pageTitle?: string
  /**
   * Handler for opening the page in a new tab
   */
  onOpenInNewTab?: () => void
  /**
   * Available layouts for rendering
   */
  layouts?: LayoutDefinition[]
  /**
   * Whether there are unsaved changes in the editor
   */
  hasUnsavedChanges?: boolean
  /**
   * Handler to save the current data before navigating
   */
  onSave?: () => Promise<void>
  /**
   * Whether a save is in progress
   */
  isSaving?: boolean
}

// Styles
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9990,
    backgroundColor: 'var(--theme-bg)',
  } as CSSProperties,
  controlPanel: {
    position: 'fixed',
    top: '50%',
    right: '16px',
    transform: 'translateY(-50%)',
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  } as CSSProperties,
  controlCard: {
    backgroundColor: 'var(--theme-bg)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--theme-elevation-200)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-bg)',
    backgroundColor: 'var(--theme-elevation-900)',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'var(--theme-elevation-600)',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    transition: 'background-color 0.15s, color 0.15s',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  unsavedBadge: {
    backgroundColor: 'var(--theme-warning-100)',
    color: 'var(--theme-warning-700)',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  } as CSSProperties,
  content: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--theme-bg)',
  } as CSSProperties,
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  // Navigation dialog styles
  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as CSSProperties,
  dialogContainer: {
    backgroundColor: 'var(--theme-bg)',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '448px',
    width: '100%',
    margin: '0 16px',
    overflow: 'hidden',
  } as CSSProperties,
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--theme-elevation-200)',
    backgroundColor: 'var(--theme-warning-50)',
  } as CSSProperties,
  dialogIconWrapper: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-warning-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  dialogTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--theme-elevation-900)',
    margin: 0,
  } as CSSProperties,
  dialogSubtitle: {
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    margin: 0,
  } as CSSProperties,
  dialogBody: {
    padding: '16px 20px',
  } as CSSProperties,
  dialogBodyText: {
    fontSize: '14px',
    color: 'var(--theme-elevation-700)',
    margin: 0,
    marginBottom: '8px',
  } as CSSProperties,
  dialogUrl: {
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: 'var(--theme-elevation-100)',
    padding: '8px 12px',
    borderRadius: '4px',
    color: 'var(--theme-elevation-800)',
    wordBreak: 'break-all',
  } as CSSProperties,
  dialogWarning: {
    fontSize: '14px',
    color: 'var(--theme-warning-600)',
    marginTop: '12px',
    fontWeight: 500,
  } as CSSProperties,
  dialogFooter: {
    padding: '16px 20px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderTop: '1px solid var(--theme-elevation-200)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  buttonSecondary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
    backgroundColor: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    cursor: 'pointer',
  } as CSSProperties,
  buttonPrimary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-bg)',
    backgroundColor: 'var(--theme-elevation-900)',
    border: 'none',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    cursor: 'pointer',
  } as CSSProperties,
  buttonDanger: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-error-700)',
    backgroundColor: 'var(--theme-error-50)',
    border: '1px solid var(--theme-error-200)',
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    cursor: 'pointer',
  } as CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  icon: {
    width: '16px',
    height: '16px',
  } as CSSProperties,
}

/**
 * Full-screen preview modal with client-side rendering
 *
 * Renders the current editor data directly using PageRenderer.
 * Links prompt for confirmation before navigating (with option to save first).
 *
 * Features:
 * - Zero consumer setup required
 * - Shows current editor state (including unsaved changes)
 * - Interactive elements (accordions, hover states) still work
 * - Links show confirmation dialog before navigating
 */
export const PreviewModal = memo(function PreviewModal({
  isOpen,
  onClose,
  data,
  pageTitle,
  onOpenInNewTab,
  layouts,
  hasUnsavedChanges = false,
  onSave,
  isSaving = false,
}: PreviewModalProps) {
  // Navigation confirmation state
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [viewButtonHovered, setViewButtonHovered] = useState(false)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingNavigation) {
          setPendingNavigation(null)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, pendingNavigation, onClose])

  // Intercept link clicks
  const handleContentClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const anchor = target.closest('a')

    if (anchor) {
      const href = anchor.getAttribute('href')

      // Allow hash-only links (scroll to section on same page)
      if (href?.startsWith('#') && !href.includes('/')) {
        return
      }

      // Block navigation and show confirmation
      e.preventDefault()
      e.stopPropagation()

      if (href) {
        setPendingNavigation(href)
      }
    }
  }, [])

  // Handle navigation after confirmation
  const handleNavigate = useCallback((saveFirst: boolean) => {
    if (!pendingNavigation) return

    const navigate = () => {
      setIsNavigating(true)
      onClose()
      window.location.href = pendingNavigation
    }

    if (saveFirst && onSave) {
      onSave().then(navigate).catch(() => {
        setIsNavigating(false)
      })
    } else {
      navigate()
    }
  }, [pendingNavigation, onClose, onSave])

  // Cancel navigation
  const handleCancelNavigation = useCallback(() => {
    setPendingNavigation(null)
  }, [])

  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      {/* Floating control panel */}
      <div style={styles.controlPanel}>
        <div style={styles.controlCard}>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            title="Close preview (Esc)"
          >
            <X style={styles.icon} />
            Close Preview
          </button>

          {/* View page button */}
          {onOpenInNewTab && (
            <button
              type="button"
              onClick={onOpenInNewTab}
              style={{
                ...styles.viewButton,
                ...(viewButtonHovered ? {
                  backgroundColor: 'var(--theme-elevation-100)',
                  color: 'var(--theme-elevation-900)',
                } : {}),
              }}
              onMouseEnter={() => setViewButtonHovered(true)}
              onMouseLeave={() => setViewButtonHovered(false)}
              title="Open published page in new tab"
            >
              <ExternalLink style={styles.icon} />
              View Page
            </button>
          )}
        </div>

        {/* Status badge */}
        {hasUnsavedChanges && (
          <div style={styles.unsavedBadge}>
            Unsaved changes
          </div>
        )}
      </div>

      {/* Preview content */}
      <div
        style={styles.content}
        onClickCapture={handleContentClick}
      >
        {data ? (
          <PageRenderer data={data} layouts={layouts} />
        ) : (
          <div style={styles.emptyState}>
            No content to preview
          </div>
        )}
      </div>

      {/* Navigation confirmation dialog */}
      {pendingNavigation && (
        <div style={styles.dialogOverlay}>
          <div
            style={styles.dialogContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.dialogHeader}>
              <div style={styles.dialogIconWrapper}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--theme-warning-600)' }} />
              </div>
              <div>
                <h3 style={styles.dialogTitle}>Navigate away?</h3>
                <p style={styles.dialogSubtitle}>This will close the preview</p>
              </div>
            </div>

            {/* Body */}
            <div style={styles.dialogBody}>
              <p style={styles.dialogBodyText}>
                You&apos;re about to navigate to:
              </p>
              <p style={styles.dialogUrl}>
                {pendingNavigation}
              </p>
              {hasUnsavedChanges && (
                <p style={styles.dialogWarning}>
                  You have unsaved changes that will be lost.
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={styles.dialogFooter}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCancelNavigation}
                  disabled={isNavigating || isSaving}
                  style={{
                    ...styles.buttonSecondary,
                    ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                  }}
                >
                  Cancel
                </button>
                {hasUnsavedChanges && onSave && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(true)}
                    disabled={isNavigating || isSaving}
                    style={{
                      ...styles.buttonPrimary,
                      ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save & Navigate'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleNavigate(false)}
                  disabled={isNavigating || isSaving}
                  style={{
                    ...(hasUnsavedChanges ? styles.buttonDanger : styles.buttonPrimary),
                    ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                  }}
                >
                  {isNavigating ? 'Navigating...' : hasUnsavedChanges ? 'Navigate without saving' : 'Navigate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
