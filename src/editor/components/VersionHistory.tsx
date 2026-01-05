'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import {
  IconHistory,
  IconLoader2,
  IconCheck,
  IconRotate,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react'

/**
 * Version entry from Payload's versions system
 */
export interface PageVersion {
  id: string
  parent: string
  version: {
    title?: string
    slug?: string
    _status?: 'draft' | 'published'
    updatedAt: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
  autosave?: boolean
  latest?: boolean
}

export interface VersionHistoryProps {
  /**
   * Page ID to fetch versions for
   */
  pageId: string
  /**
   * API endpoint base path
   * @default '/api/puck/pages'
   */
  apiEndpoint?: string
  /**
   * Callback when a version is restored
   */
  onRestore?: (version: PageVersion) => void
  /**
   * Whether restore operations are disabled
   */
  disabled?: boolean
}

/**
 * Version history dropdown for the Puck editor
 *
 * Shows a list of previous versions with the ability to restore them.
 */
export const VersionHistory = memo(function VersionHistory({
  pageId,
  apiEndpoint = '/api/puck/pages',
  onRestore,
  disabled,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [versions, setVersions] = useState<PageVersion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null) // null = checking, false = not available
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if versions endpoint is available on mount
  useEffect(() => {
    async function checkAvailability() {
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}/versions?limit=1`, {
          method: 'GET',
        })
        // 404 means endpoint doesn't exist, other errors might be auth-related
        setIsAvailable(response.status !== 404)
      } catch {
        // Network error or other issue - assume not available
        setIsAvailable(false)
      }
    }
    checkAvailability()
  }, [apiEndpoint, pageId])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch versions when dropdown opens
  const fetchVersions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiEndpoint}/${pageId}/versions?limit=20`)
      if (!response.ok) {
        throw new Error('Failed to fetch versions')
      }
      const data = await response.json()
      setVersions(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions')
      console.error('Error fetching versions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint, pageId])

  // Fetch versions when opening
  useEffect(() => {
    if (isOpen) {
      fetchVersions()
    }
  }, [isOpen, fetchVersions])

  // Handle version restore
  const handleRestore = useCallback(
    async (version: PageVersion) => {
      if (!confirm(`Restore this version from ${formatDate(version.updatedAt)}? This will overwrite current changes.`)) {
        return
      }

      setIsRestoring(true)
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}/versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId: version.id }),
        })

        if (!response.ok) {
          throw new Error('Failed to restore version')
        }

        onRestore?.(version)
        setIsOpen(false)
        // Reload the page to show restored version
        window.location.reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to restore version')
        console.error('Error restoring version:', err)
      } finally {
        setIsRestoring(false)
      }
    },
    [apiEndpoint, pageId, onRestore]
  )

  // Format date for display
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Format time for display
  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Don't render if versions endpoint is not available or still checking
  if (isAvailable !== true) {
    return null
  }

  // Button styles
  const baseBtn =
    'inline-flex items-center whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-colors'
  const secondaryBtn = `${baseBtn} text-gray-700 bg-white border border-gray-300 hover:bg-gray-100`

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${secondaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <IconHistory className="h-4 w-4 mr-1 flex-shrink-0" />
        History
        <IconChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 max-h-[400px] overflow-hidden"
        >
          {/* Header */}
          <div
            className="border-b border-gray-200 flex items-center justify-between px-4 py-3"
          >
            <span className="font-medium text-sm text-gray-900">Version History</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[340px] overflow-y-auto">
            {isLoading ? (
              <div
                className="flex items-center justify-center p-8"
              >
                <IconLoader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div
                className="text-sm text-red-600 p-4 text-center"
              >
                {error}
              </div>
            ) : versions.length === 0 ? (
              <div
                className="text-sm text-gray-500 p-4 text-center"
              >
                No version history available
              </div>
            ) : (
              <div className="p-2">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between px-3 py-2.5 gap-3"
                  >
                    {/* Version info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(version.updatedAt)}
                        </span>
                        {index === 0 && (
                          <span
                            className="text-xs font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-700"
                          >
                            Current
                          </span>
                        )}
                        {version.version._status === 'published' && (
                          <span
                            className="text-xs font-medium rounded-full px-2 py-0.5 bg-green-100 text-green-700"
                          >
                            Published
                          </span>
                        )}
                        {version.autosave && (
                          <span
                            className="text-xs text-gray-400"
                            title="Autosaved"
                          >
                            (auto)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatTime(version.updatedAt)}
                        {version.version.title && (
                          <span> &middot; {version.version.title}</span>
                        )}
                      </div>
                    </div>

                    {/* Restore button (not for current version) */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRestore(version)}
                        disabled={isRestoring}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 flex items-center gap-1 px-2 py-1 flex-shrink-0"
                      >
                        {isRestoring ? (
                          <IconLoader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <IconRotate className="h-3 w-3" />
                        )}
                        Restore
                      </button>
                    )}

                    {/* Current indicator */}
                    {index === 0 && (
                      <span className="text-gray-400 flex-shrink-0">
                        <IconCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})
