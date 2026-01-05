'use client'

/**
 * MediaField - Custom Puck field for selecting Payload CMS media
 *
 * This component provides a media picker that integrates with Payload's
 * media collection, allowing users to browse and select images.
 */

import React, { useState, useEffect, useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { IconPhoto, IconX, IconSearch, IconLoader2, IconUpload, IconAlertCircle, IconLink } from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Skeleton } from '../components/ui/skeleton'
import { cn } from '../lib/utils'

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

      // Filter by images only
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

  // Reset upload state and cleanup object URL
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

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setUrlState((prev) => ({ ...prev, error: 'Please enter a valid URL' }))
      return
    }

    // Use the URL directly (external image)
    onChange({
      id: `external-${Date.now()}`,
      url: url,
      alt: '',
    })
    setIsOpen(false)
    resetUrlState()
  }, [urlState.url, onChange, resetUrlState])

  // Handle URL preview load
  const handleUrlPreviewLoad = useCallback(() => {
    setUrlState((prev) => ({ ...prev, previewLoaded: true, error: null }))
  }, [])

  // Handle URL preview error
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

    // Cleanup previous preview URL
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
  const handleDialogClose = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        resetUploadState()
        resetUrlState()
        setActiveTab('browse')
      }
    },
    [resetUploadState, resetUrlState]
  )

  return (
    <div className="puck-field">
      {label && (
        <Label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </Label>
      )}

      <div className="space-y-2">
        <div className="flex items-start gap-4">
          {/* Preview */}
          {value?.url ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.url}
                alt={value.alt || ''}
                className="w-24 h-24 object-cover rounded-md border border-border"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <IconX className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 bg-muted rounded-md border border-dashed border-input flex items-center justify-center">
              <IconPhoto className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
              >
                {value ? 'Change Image' : 'Select Image'}
              </Button>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Current URL display */}
        {value?.url && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[280px]" title={value.url}>
              {value.url}
            </span>
          </div>
        )}
      </div>

      {/* Media Picker Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>

          {/* Tab Bar */}
          <div className="flex border-b border-border -mt-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'browse'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Browse Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'upload'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Upload New
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'url'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              From URL
            </button>
          </div>

          {/* Search (browse tab only) */}
          {activeTab === 'browse' && (
            <div className="relative flex-shrink-0">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Content Area - explicit max height for reliable scrolling */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            {activeTab === 'browse' ? (
              /* Browse Tab - Media Grid */
              loading && mediaList.length === 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : mediaList.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No images found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    {mediaList.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'relative aspect-square overflow-hidden rounded-md border-2 transition-all hover:border-primary hover:shadow-md',
                          value?.id === item.id ? 'border-primary ring-2 ring-ring/30' : 'border-border'
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.alt || item.filename || ''}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {item.alt && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                            {item.alt}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )
            ) : activeTab === 'upload' ? (
              /* Upload Tab */
              <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                {uploadState.preview ? (
                  <div className="w-full max-w-md space-y-4">
                    {/* Preview */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadState.preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Filename:</span> {uploadState.file?.name}
                      </p>
                      <p>
                        <span className="font-medium">Size:</span>{' '}
                        {formatFileSize(uploadState.file?.size)}
                      </p>
                    </div>

                    {/* Error */}
                    {uploadState.error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-start gap-2">
                        <IconAlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{uploadState.error}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button onClick={handleUpload} disabled={uploadState.uploading}>
                        {uploadState.uploading ? (
                          <>
                            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <IconUpload className="h-4 w-4 mr-2" />
                            Upload & Select
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetUploadState}
                        disabled={uploadState.uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <IconPhoto className="h-16 w-16 text-muted mx-auto mb-4" />
                    <label className="cursor-pointer">
                      <Button asChild>
                        <span>Select Image</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-sm text-muted-foreground">Select an image file to upload</p>
                    {uploadState.error && (
                      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
                        {uploadState.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'url' ? (
              /* URL Tab */
              <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-full max-w-md space-y-4">
                  <div className="text-center mb-6">
                    <IconLink className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Enter an image URL from an external source
                    </p>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
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
                    />
                  </div>

                  {/* Preview */}
                  {urlState.url && !urlState.error && (
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlState.url}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onLoad={handleUrlPreviewLoad}
                        onError={handleUrlPreviewError}
                      />
                      {!urlState.previewLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {urlState.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-start gap-2">
                      <IconAlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{urlState.error}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={!urlState.url || urlState.loading}
                    >
                      <IconLink className="h-4 w-4 mr-2" />
                      Use This URL
                    </Button>
                    {urlState.url && (
                      <Button variant="outline" onClick={resetUrlState}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
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
