'use client'

/**
 * MediaField - Custom Puck field for selecting Payload CMS media
 *
 * This component provides a media picker that integrates with Payload's
 * media collection, allowing users to browse and select images.
 */

import React, { useState, useEffect, useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { Image, X, Search, Loader2, Upload, AlertCircle, Link } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export interface MediaReference {
  id: string | number
  url: string
  alt?: string
  width?: number
  height?: number
}

interface MediaFieldProps {
  value: MediaReference | null
  onChange: (value: MediaReference | null) => void
  label?: string
  readOnly?: boolean
  apiEndpoint?: string
}

interface MediaItem {
  id: string | number
  url: string
  alt?: string
  filename?: string
  width?: number
  height?: number
  mimeType?: string
}

type DialogTab = 'browse' | 'upload' | 'url'

interface UploadState {
  file: File | null
  preview: string | null
  uploading: boolean
  error: string | null
}

interface UrlState {
  url: string
  loading: boolean
  error: string | null
  previewLoaded: boolean
}

// =============================================================================
// Styles
// =============================================================================

const styles = {
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
    marginBottom: '8px',
  } as CSSProperties,
  previewContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  } as CSSProperties,
  imagePreview: {
    position: 'relative',
  } as CSSProperties,
  previewImage: {
    width: '96px',
    height: '96px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-200)',
  } as CSSProperties,
  removeButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    padding: '4px',
    backgroundColor: 'var(--theme-error-500)',
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.15s',
  } as CSSProperties,
  placeholder: {
    width: '96px',
    height: '96px',
    backgroundColor: 'var(--theme-elevation-100)',
    borderRadius: '6px',
    border: '1px dashed var(--theme-elevation-300)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  actionsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  buttonOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
    backgroundColor: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } as CSSProperties,
  buttonGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-error-600)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } as CSSProperties,
  buttonPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-bg)',
    backgroundColor: 'var(--theme-elevation-900)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } as CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  urlDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    marginTop: '8px',
  } as CSSProperties,
  // Dialog styles
  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  dialogContent: {
    backgroundColor: 'var(--theme-bg)',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    margin: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as CSSProperties,
  dialogHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--theme-elevation-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  } as CSSProperties,
  dialogTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--theme-elevation-900)',
    margin: 0,
  } as CSSProperties,
  closeButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--theme-elevation-500)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid var(--theme-elevation-200)',
    padding: '0 20px',
    flexShrink: 0,
  } as CSSProperties,
  tabButton: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  tabButtonActive: {
    color: 'var(--theme-elevation-900)',
    borderBottomColor: 'var(--theme-elevation-900)',
  } as CSSProperties,
  searchContainer: {
    padding: '16px 20px',
    position: 'relative',
    flexShrink: 0,
  } as CSSProperties,
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 40px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '6px',
    outline: 'none',
  } as CSSProperties,
  searchIcon: {
    position: 'absolute',
    left: '32px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--theme-elevation-400)',
    pointerEvents: 'none',
  } as CSSProperties,
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  } as CSSProperties,
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  } as CSSProperties,
  mediaItem: {
    position: 'relative',
    aspectRatio: '1',
    overflow: 'hidden',
    borderRadius: '6px',
    border: '2px solid var(--theme-elevation-200)',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    backgroundColor: 'var(--theme-elevation-100)',
  } as CSSProperties,
  mediaItemSelected: {
    borderColor: 'var(--theme-elevation-900)',
    boxShadow: '0 0 0 2px var(--theme-elevation-200)',
  } as CSSProperties,
  mediaItemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as CSSProperties,
  mediaItemAlt: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    fontSize: '12px',
    padding: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px',
  } as CSSProperties,
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  skeleton: {
    backgroundColor: 'var(--theme-elevation-200)',
    borderRadius: '6px',
    aspectRatio: '1',
    animation: 'pulse 2s infinite',
  } as CSSProperties,
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    padding: '20px',
  } as CSSProperties,
  uploadPreview: {
    width: '100%',
    maxWidth: '448px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  uploadImageContainer: {
    position: 'relative',
    aspectRatio: '16/9',
    backgroundColor: 'var(--theme-elevation-100)',
    borderRadius: '8px',
    overflow: 'hidden',
  } as CSSProperties,
  uploadImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,
  uploadMeta: {
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  errorBox: {
    padding: '12px',
    backgroundColor: 'var(--theme-error-50)',
    border: '1px solid var(--theme-error-200)',
    borderRadius: '6px',
    color: 'var(--theme-error-700)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  } as CSSProperties,
  actionsRow: {
    display: 'flex',
    gap: '8px',
  } as CSSProperties,
  dropZone: {
    textAlign: 'center',
  } as CSSProperties,
  dropZoneIcon: {
    width: '64px',
    height: '64px',
    color: 'var(--theme-elevation-300)',
    margin: '0 auto 16px',
  } as CSSProperties,
  hiddenInput: {
    display: 'none',
  } as CSSProperties,
  urlContainer: {
    width: '100%',
    maxWidth: '448px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  urlIntro: {
    textAlign: 'center',
    marginBottom: '24px',
  } as CSSProperties,
  urlIcon: {
    width: '48px',
    height: '48px',
    color: 'var(--theme-elevation-400)',
    margin: '0 auto 8px',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  inputLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
  } as CSSProperties,
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '6px',
    outline: 'none',
  } as CSSProperties,
  previewLoading: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--theme-elevation-100)',
  } as CSSProperties,
  icon: {
    width: '16px',
    height: '16px',
  } as CSSProperties,
  iconSmall: {
    width: '12px',
    height: '12px',
    flexShrink: 0,
  } as CSSProperties,
}

// =============================================================================
// Utility Functions
// =============================================================================

function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// =============================================================================
// MediaField Component
// =============================================================================

function MediaFieldInner({
  value,
  onChange,
  label,
  readOnly,
  apiEndpoint = '/api/media',
}: MediaFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState<DialogTab>('browse')
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null)
  const [previewHovered, setPreviewHovered] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    error: null,
  })
  const [urlState, setUrlState] = useState<UrlState>({
    url: '',
    loading: false,
    error: null,
    previewLoaded: false,
  })

  // Fetch media from Payload API
  const fetchMedia = useCallback(async (searchTerm: string = '', pageNum: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '24',
        page: pageNum.toString(),
        sort: '-createdAt',
      })

      params.set('where[mimeType][contains]', 'image')

      if (searchTerm) {
        params.set('where[alt][contains]', searchTerm)
      }

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch media')

      const data = await response.json()
      const items: MediaItem[] = (data.docs || []).map((doc: Record<string, unknown>) => ({
        id: doc.id as string | number,
        url: (doc.url as string) || '',
        alt: (doc.alt as string) || '',
        filename: (doc.filename as string) || '',
        width: doc.width as number | undefined,
        height: doc.height as number | undefined,
        mimeType: (doc.mimeType as string) || '',
      }))

      if (pageNum === 1) {
        setMediaList(items)
      } else {
        setMediaList((prev) => [...prev, ...items])
      }

      setHasMore(data.hasNextPage || false)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  // Load media when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPage(1)
      fetchMedia(searchQuery, 1)
    }
  }, [isOpen, fetchMedia, searchQuery])

  // Handle search with debounce
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      setPage(1)
      fetchMedia(searchQuery, 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, isOpen, fetchMedia])

  // Handle media selection
  const handleSelect = (item: MediaItem) => {
    onChange({
      id: item.id,
      url: item.url,
      alt: item.alt,
      width: item.width,
      height: item.height,
    })
    setIsOpen(false)
  }

  // Handle remove
  const handleRemove = () => {
    onChange(null)
  }

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchMedia(searchQuery, nextPage)
  }

  // Reset upload state
  const resetUploadState = useCallback(() => {
    setUploadState((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview)
      return { file: null, preview: null, uploading: false, error: null }
    })
  }, [])

  // Reset URL state
  const resetUrlState = useCallback(() => {
    setUrlState({ url: '', loading: false, error: null, previewLoaded: false })
  }, [])

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    const url = urlState.url.trim()
    if (!url) {
      setUrlState((prev) => ({ ...prev, error: 'Please enter a URL' }))
      return
    }

    try {
      new URL(url)
    } catch {
      setUrlState((prev) => ({ ...prev, error: 'Please enter a valid URL' }))
      return
    }

    onChange({
      id: `external-${Date.now()}`,
      url: url,
      alt: '',
    })
    setIsOpen(false)
    resetUrlState()
  }, [urlState.url, onChange, resetUrlState])

  const handleUrlPreviewLoad = useCallback(() => {
    setUrlState((prev) => ({ ...prev, previewLoaded: true, error: null }))
  }, [])

  const handleUrlPreviewError = useCallback(() => {
    setUrlState((prev) => ({
      ...prev,
      previewLoaded: false,
      error: 'Unable to load image from this URL',
    }))
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadState((prev) => ({ ...prev, error: 'Only image files are allowed' }))
      return
    }

    setUploadState((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview)
      return prev
    })

    const preview = URL.createObjectURL(file)
    setUploadState({ file, preview, uploading: false, error: null })
  }, [])

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return

    setUploadState((prev) => ({ ...prev, uploading: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('file', uploadState.file)
      const altText = uploadState.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      formData.append('alt', altText)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(error.message || error.errors?.[0]?.message || 'Upload failed')
      }

      const data = await response.json()
      const doc = data.doc || data
      onChange({
        id: doc.id,
        url: doc.url,
        alt: doc.alt,
        width: doc.width,
        height: doc.height,
      })
      setIsOpen(false)
      resetUploadState()
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }))
    }
  }, [uploadState.file, apiEndpoint, onChange, resetUploadState])

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setIsOpen(false)
    resetUploadState()
    resetUrlState()
    setActiveTab('browse')
  }, [resetUploadState, resetUrlState])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDialogClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleDialogClose])

  return (
    <div className="puck-field">
      {label && <label style={styles.label}>{label}</label>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={styles.previewContainer}>
          {/* Preview */}
          {value?.url ? (
            <div
              style={styles.imagePreview}
              onMouseEnter={() => setPreviewHovered(true)}
              onMouseLeave={() => setPreviewHovered(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.url}
                alt={value.alt || ''}
                style={styles.previewImage}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    ...styles.removeButton,
                    opacity: previewHovered ? 1 : 0,
                  }}
                  aria-label="Remove image"
                >
                  <X style={styles.iconSmall} />
                </button>
              )}
            </div>
          ) : (
            <div style={styles.placeholder}>
              <Image style={{ width: '32px', height: '32px', color: 'var(--theme-elevation-400)' }} />
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div style={styles.actionsColumn}>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                style={styles.buttonOutline}
              >
                {value ? 'Change Image' : 'Select Image'}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  style={styles.buttonGhost}
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current URL display */}
        {value?.url && (
          <div style={styles.urlDisplay}>
            <Link style={styles.iconSmall} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }} title={value.url}>
              {value.url}
            </span>
          </div>
        )}
      </div>

      {/* Media Picker Dialog */}
      {isOpen && (
        <div style={styles.dialogOverlay} onClick={handleDialogClose}>
          <div style={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={styles.dialogHeader}>
              <h2 style={styles.dialogTitle}>Select Media</h2>
              <button type="button" onClick={handleDialogClose} style={styles.closeButton}>
                <X style={styles.icon} />
              </button>
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === 'browse' ? styles.tabButtonActive : {}),
                }}
              >
                Browse Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === 'upload' ? styles.tabButtonActive : {}),
                }}
              >
                Upload New
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === 'url' ? styles.tabButtonActive : {}),
                }}
              >
                From URL
              </button>
            </div>

            {/* Search (browse tab only) */}
            {activeTab === 'browse' && (
              <div style={styles.searchContainer}>
                <Search style={styles.searchIcon as CSSProperties} />
                <input
                  type="text"
                  placeholder="Search by alt text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            )}

            {/* Content Area */}
            <div style={styles.contentArea}>
              {activeTab === 'browse' ? (
                /* Browse Tab */
                loading && mediaList.length === 0 ? (
                  <div style={styles.mediaGrid}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} style={styles.skeleton} />
                    ))}
                  </div>
                ) : mediaList.length === 0 ? (
                  <div style={styles.emptyState}>No images found</div>
                ) : (
                  <>
                    <div style={styles.mediaGrid}>
                      {mediaList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            ...styles.mediaItem,
                            ...(value?.id === item.id ? styles.mediaItemSelected : {}),
                            ...(hoveredItem === item.id ? { borderColor: 'var(--theme-elevation-600)' } : {}),
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.alt || item.filename || ''}
                            style={styles.mediaItemImage}
                            loading="lazy"
                          />
                          {item.alt && (
                            <div style={styles.mediaItemAlt}>{item.alt}</div>
                          )}
                        </button>
                      ))}
                    </div>

                    {hasMore && (
                      <div style={styles.loadMoreContainer}>
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          disabled={loading}
                          style={{
                            ...styles.buttonOutline,
                            ...(loading ? styles.buttonDisabled : {}),
                          }}
                        >
                          {loading ? (
                            <>
                              <Loader2 style={{ ...styles.icon, marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )
              ) : activeTab === 'upload' ? (
                /* Upload Tab */
                <div style={styles.uploadContainer}>
                  {uploadState.preview ? (
                    <div style={styles.uploadPreview}>
                      <div style={styles.uploadImageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={uploadState.preview}
                          alt="Preview"
                          style={styles.uploadImage}
                        />
                      </div>

                      <div style={styles.uploadMeta}>
                        <p><span style={{ fontWeight: 500 }}>Filename:</span> {uploadState.file?.name}</p>
                        <p><span style={{ fontWeight: 500 }}>Size:</span> {formatFileSize(uploadState.file?.size)}</p>
                      </div>

                      {uploadState.error && (
                        <div style={styles.errorBox}>
                          <AlertCircle style={{ ...styles.icon, flexShrink: 0, marginTop: '2px' }} />
                          <span>{uploadState.error}</span>
                        </div>
                      )}

                      <div style={styles.actionsRow}>
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={uploadState.uploading}
                          style={{
                            ...styles.buttonPrimary,
                            ...(uploadState.uploading ? styles.buttonDisabled : {}),
                          }}
                        >
                          {uploadState.uploading ? (
                            <>
                              <Loader2 style={{ ...styles.icon, marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload style={{ ...styles.icon, marginRight: '8px' }} />
                              Upload & Select
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={resetUploadState}
                          disabled={uploadState.uploading}
                          style={{
                            ...styles.buttonOutline,
                            ...(uploadState.uploading ? styles.buttonDisabled : {}),
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.dropZone}>
                      <Image style={styles.dropZoneIcon} />
                      <label style={{ cursor: 'pointer' }}>
                        <button type="button" style={styles.buttonPrimary}>
                          Select Image
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={styles.hiddenInput}
                        />
                      </label>
                      <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--theme-elevation-500)' }}>
                        Select an image file to upload
                      </p>
                      {uploadState.error && (
                        <div style={{ ...styles.errorBox, marginTop: '16px' }}>
                          {uploadState.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === 'url' ? (
                /* URL Tab */
                <div style={styles.uploadContainer}>
                  <div style={styles.urlContainer}>
                    <div style={styles.urlIntro as CSSProperties}>
                      <Link style={styles.urlIcon} />
                      <p style={{ fontSize: '14px', color: 'var(--theme-elevation-500)' }}>
                        Enter an image URL from an external source
                      </p>
                    </div>

                    <div style={styles.inputGroup as CSSProperties}>
                      <label style={styles.inputLabel} htmlFor="image-url">Image URL</label>
                      <input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlState.url}
                        onChange={(e) =>
                          setUrlState((prev) => ({
                            ...prev,
                            url: e.target.value,
                            error: null,
                            previewLoaded: false,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleUrlSubmit()
                          }
                        }}
                        style={styles.input}
                      />
                    </div>

                    {urlState.url && !urlState.error && (
                      <div style={styles.uploadImageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlState.url}
                          alt="Preview"
                          style={styles.uploadImage}
                          onLoad={handleUrlPreviewLoad}
                          onError={handleUrlPreviewError}
                        />
                        {!urlState.previewLoaded && (
                          <div style={styles.previewLoading}>
                            <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: 'var(--theme-elevation-400)' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {urlState.error && (
                      <div style={styles.errorBox}>
                        <AlertCircle style={{ ...styles.icon, flexShrink: 0, marginTop: '2px' }} />
                        <span>{urlState.error}</span>
                      </div>
                    )}

                    <div style={styles.actionsRow}>
                      <button
                        type="button"
                        onClick={handleUrlSubmit}
                        disabled={!urlState.url || urlState.loading}
                        style={{
                          ...styles.buttonPrimary,
                          ...((!urlState.url || urlState.loading) ? styles.buttonDisabled : {}),
                        }}
                      >
                        <Link style={{ ...styles.icon, marginRight: '8px' }} />
                        Use This URL
                      </button>
                      {urlState.url && (
                        <button
                          type="button"
                          onClick={resetUrlState}
                          style={styles.buttonOutline}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const MediaField = memo(MediaFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for media selection
 */
export function createMediaField(config: {
  label?: string
  apiEndpoint?: string
}): CustomField<MediaReference | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <MediaField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        apiEndpoint={config.apiEndpoint}
      />
    ),
  }
}
