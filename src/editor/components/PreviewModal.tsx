'use client'

import { useState, useCallback, memo, type MouseEvent } from 'react'
import type { Data as PuckData } from '@measured/puck'
import {
  Dialog,
  DialogContentFullscreen,
} from '../../components/ui/dialog'
import {
  IconX,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { cn } from '../../lib/utils'
import { PageRenderer } from '../../render/PageRenderer'
import type { LayoutDefinition } from '../../layouts'

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
      // Close the preview and navigate
      onClose()
      window.location.href = pendingNavigation
    }

    if (saveFirst && onSave) {
      onSave().then(navigate).catch(() => {
        // Save failed, don't navigate
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContentFullscreen
        hideCloseButton
        accessibleTitle={`Preview: ${pageTitle || 'Page'}`}
        className="p-0"
      >
        {/* Floating control panel - middle-right of screen, avoids sticky headers */}
        <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[9998] flex flex-col gap-2 items-end">
          {/* Main controls card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-1">
            {/* Close button - prominent */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              title="Close preview (Esc)"
            >
              <IconX className="h-4 w-4" />
              Close Preview
            </button>

            {/* View page button */}
            {onOpenInNewTab && (
              <button
                type="button"
                onClick={onOpenInNewTab}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Open published page in new tab"
              >
                <IconExternalLink className="h-4 w-4" />
                View Page
              </button>
            )}
          </div>

          {/* Status badge */}
          {hasUnsavedChanges && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
              Unsaved changes
            </div>
          )}
        </div>

        {/* Preview content - full height, no padding needed */}
        <div
          className="h-full overflow-auto bg-white"
          onClickCapture={handleContentClick}
        >
          {data ? (
            <PageRenderer data={data} layouts={layouts} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No content to preview
            </div>
          )}
        </div>

        {/* Navigation confirmation dialog */}
        {pendingNavigation && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-amber-50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <IconAlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Navigate away?</h3>
                  <p className="text-sm text-gray-500">This will close the preview</p>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-2">
                  You&apos;re about to navigate to:
                </p>
                <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded text-gray-800 break-all">
                  {pendingNavigation}
                </p>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600 mt-3 font-medium">
                    You have unsaved changes that will be lost.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelNavigation}
                  disabled={isNavigating || isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                {hasUnsavedChanges && onSave && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(true)}
                    disabled={isNavigating || isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save & Navigate'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleNavigate(false)}
                  disabled={isNavigating || isSaving}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50",
                    hasUnsavedChanges
                      ? "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                      : "text-white bg-gray-900 hover:bg-gray-800"
                  )}
                >
                  {isNavigating ? 'Navigating...' : hasUnsavedChanges ? 'Navigate without saving' : 'Navigate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContentFullscreen>
    </Dialog>
  )
})
