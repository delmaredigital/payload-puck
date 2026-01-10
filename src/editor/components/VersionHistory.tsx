'use client'

import { useState, useCallback, useEffect, useRef, memo, type CSSProperties } from 'react'
import {
  History,
  Loader2,
  Check,
  RotateCcw,
  X,
  ChevronDown,
} from 'lucide-react'

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

// Shared styles
const styles = {
  container: {
    position: 'relative',
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    border: '1px solid var(--theme-elevation-200)',
    cursor: 'pointer',
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
    width: '12px',
    height: '12px',
    marginLeft: '4px',
    flexShrink: 0,
  } as CSSProperties,
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
    width: '320px',
    maxHeight: '400px',
    overflow: 'hidden',
  } as CSSProperties,
  header: {
    borderBottom: '1px solid var(--theme-elevation-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
  } as CSSProperties,
  headerTitle: {
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--theme-elevation-900)',
  } as CSSProperties,
  closeButton: {
    color: 'var(--theme-elevation-400)',
    transition: 'color 0.15s',
    padding: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  content: {
    maxHeight: '340px',
    overflowY: 'auto',
  } as CSSProperties,
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
  } as CSSProperties,
  loadingIcon: {
    width: '20px',
    height: '20px',
    color: 'var(--theme-elevation-400)',
    animation: 'spin 1s linear infinite',
  } as CSSProperties,
  errorText: {
    fontSize: '14px',
    color: 'var(--theme-error-600)',
    padding: '16px',
    textAlign: 'center',
  } as CSSProperties,
  emptyText: {
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    padding: '16px',
    textAlign: 'center',
  } as CSSProperties,
  listContainer: {
    padding: '8px',
  } as CSSProperties,
  versionItem: {
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    gap: '12px',
  } as CSSProperties,
  versionInfo: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  versionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  versionDate: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-900)',
  } as CSSProperties,
  badgeCurrent: {
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '9999px',
    padding: '2px 8px',
    backgroundColor: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-700)',
  } as CSSProperties,
  badgePublished: {
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '9999px',
    padding: '2px 8px',
    backgroundColor: 'var(--theme-success-100)',
    color: 'var(--theme-success-700)',
  } as CSSProperties,
  autosaveText: {
    fontSize: '12px',
    color: 'var(--theme-elevation-400)',
  } as CSSProperties,
  versionDetails: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    marginTop: '2px',
  } as CSSProperties,
  restoreButton: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
    transition: 'color 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  restoreButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  checkIcon: {
    width: '16px',
    height: '16px',
    color: 'var(--theme-elevation-400)',
    flexShrink: 0,
  } as CSSProperties,
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
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if versions endpoint is available on mount
  useEffect(() => {
    async function checkAvailability() {
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}/versions?limit=1`, {
          method: 'GET',
        })
        setIsAvailable(response.status !== 404)
      } catch {
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

  return (
    <div ref={dropdownRef} style={styles.container}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          ...styles.button,
          ...(disabled ? styles.buttonDisabled : {}),
        }}
      >
        <History style={styles.icon} />
        History
        <ChevronDown style={styles.iconSmall} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.headerTitle}>Version History</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <Loader2 style={styles.loadingIcon} />
              </div>
            ) : error ? (
              <div style={styles.errorText as CSSProperties}>
                {error}
              </div>
            ) : versions.length === 0 ? (
              <div style={styles.emptyText as CSSProperties}>
                No version history available
              </div>
            ) : (
              <div style={styles.listContainer}>
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    style={{
                      ...styles.versionItem,
                      backgroundColor: hoveredIndex === index ? 'var(--theme-elevation-50)' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Version info */}
                    <div style={styles.versionInfo}>
                      <div style={styles.versionHeader}>
                        <span style={styles.versionDate}>
                          {formatDate(version.updatedAt)}
                        </span>
                        {index === 0 && (
                          <span style={styles.badgeCurrent}>
                            Current
                          </span>
                        )}
                        {version.version._status === 'published' && (
                          <span style={styles.badgePublished}>
                            Published
                          </span>
                        )}
                        {version.autosave && (
                          <span style={styles.autosaveText} title="Autosaved">
                            (auto)
                          </span>
                        )}
                      </div>
                      <div style={styles.versionDetails}>
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
                        style={{
                          ...styles.restoreButton,
                          ...(isRestoring ? styles.restoreButtonDisabled : {}),
                        }}
                      >
                        {isRestoring ? (
                          <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <RotateCcw style={{ width: '12px', height: '12px' }} />
                        )}
                        Restore
                      </button>
                    )}

                    {/* Current indicator */}
                    {index === 0 && (
                      <span style={{ flexShrink: 0 }}>
                        <Check style={styles.checkIcon} />
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
