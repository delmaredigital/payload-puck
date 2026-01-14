'use client'

import { useState, useCallback, useMemo, useRef, type ReactNode, createElement } from 'react'
import { useRouter } from 'next/navigation'
import { Puck, type Config as PuckConfig, type Data, type Plugin as PuckPlugin, type Overrides as PuckOverrides } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import headingAnalyzer from '@puckeditor/plugin-heading-analyzer'
import '@puckeditor/plugin-heading-analyzer/dist/index.css'

import { Maximize2 } from 'lucide-react'
import { HeaderActions } from './components/HeaderActions'
import { IframeWrapper, type LayoutStyle } from './components/IframeWrapper'
import { PreviewModal } from './components/PreviewModal'
import { useUnsavedChanges } from './hooks/useUnsavedChanges'
import { createVersionHistoryPlugin } from './plugins/versionHistoryPlugin'
import { ThemeProvider, type ThemeConfig } from '../theme'
import { usePuckConfig } from '../views/PuckConfigContext'
import type { LayoutDefinition } from '../layouts'

/**
 * Default viewports for responsive preview
 */
const DEFAULT_VIEWPORTS = [
  {
    width: 360,
    height: 'auto' as const,
    label: 'Mobile',
    icon: 'Smartphone' as const,
  },
  {
    width: 768,
    height: 'auto' as const,
    label: 'Tablet',
    icon: 'Tablet' as const,
  },
  {
    width: 1280,
    height: 'auto' as const,
    label: 'Desktop',
    icon: 'Monitor' as const,
  },
  {
    width: '100%' as const,
    height: 'auto' as const,
    label: 'Full Width',
    icon: createElement(Maximize2, { size: 16 }),
  },
]

/**
 * Extended Data type to include our root props
 */
interface PuckDataWithMeta extends Data {
  root: {
    props?: {
      title?: string
      slug?: string
      pageLayout?: string
      // Page-tree integration fields
      folder?: string | null
      pageSegment?: string
      [key: string]: unknown
    }
  }
}

export interface PuckEditorImplProps {
  /**
   * Page ID for save operations
   */
  pageId: string
  /**
   * Initial Puck data to load
   */
  initialData: Data
  /**
   * Puck configuration with components and settings
   */
  config: PuckConfig
  /**
   * Page title for display
   */
  pageTitle: string
  /**
   * Page slug for preview URL
   */
  pageSlug: string
  /**
   * API endpoint for save operations
   * @default '/api/puck/pages'
   */
  apiEndpoint?: string
  /**
   * URL to navigate to when back button is clicked
   */
  backUrl?: string
  /**
   * Preview URL or function to generate preview URL from slug
   */
  previewUrl?: string | ((slug: string) => string)
  /**
   * Whether to enable viewport switching
   * @default true
   */
  enableViewports?: boolean
  /**
   * Additional Puck plugins to use.
   * The headingAnalyzer plugin is included by default.
   * Set to `false` to disable all default plugins.
   */
  plugins?: PuckPlugin[] | false
  /**
   * Layout definitions for the editor preview.
   * The editor reads header, footer, editorBackground, and editorDarkMode
   * from the layout definition matching the selected pageLayout.
   */
  layouts?: LayoutDefinition[]
  /**
   * Layout style configurations for theme-aware preview
   * @deprecated Use `layouts` prop instead. layoutStyles will be removed in a future version.
   */
  layoutStyles?: Record<string, LayoutStyle>
  /**
   * Key in root.props to read layout value from
   * @default 'pageLayout'
   */
  layoutKey?: string
  /**
   * Custom actions to render at the start of the header
   */
  headerActionsStart?: ReactNode
  /**
   * Custom actions to render at the end of the header
   */
  headerActionsEnd?: ReactNode
  /**
   * Puck overrides to merge with defaults
   */
  overrides?: Partial<PuckOverrides>
  /**
   * Callback on successful save
   */
  onSaveSuccess?: (data: Data) => void
  /**
   * Callback on save error
   */
  onSaveError?: (error: Error) => void
  /**
   * Callback when data changes
   */
  onChange?: (data: Data) => void
  /**
   * Initial document status from Payload (_status field)
   * Used to show draft/published badge in the header
   */
  initialStatus?: 'draft' | 'published'

  /**
   * Theme configuration for customizing component styles
   * When provided, components will use themed styles
   */
  theme?: ThemeConfig

  /**
   * Stylesheet URLs to inject into the editor iframe.
   * Merged with stylesheets from PuckConfigProvider context.
   */
  editorStylesheets?: string[]
  /**
   * Raw CSS to inject into the editor iframe.
   * Merged with CSS from PuckConfigProvider context.
   */
  editorCss?: string
}

/**
 * Full-featured Puck editor implementation
 *
 * Provides a complete editing experience with:
 * - Save draft and publish functionality
 * - Unsaved changes tracking with beforeunload warning
 * - Interactive/Edit mode toggle
 * - Theme-aware preview backgrounds
 * - Responsive viewport switching
 * - Custom header actions
 *
 * Internal implementation component - use PuckEditor instead.
 * @internal
 */
export function PuckEditorImpl({
  pageId,
  initialData,
  config,
  pageTitle,
  pageSlug,
  apiEndpoint = '/api/puck/pages',
  backUrl,
  previewUrl,
  enableViewports = true,
  plugins,
  layouts,
  layoutStyles,
  layoutKey = 'pageLayout',
  headerActionsStart,
  headerActionsEnd,
  overrides: customOverrides,
  onSaveSuccess,
  onSaveError,
  onChange: onChangeProp,
  initialStatus,
  theme,
  editorStylesheets: editorStylesheetsProp,
  editorCss: editorCssProp,
}: PuckEditorImplProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'published' | undefined>(initialStatus)
  // Track if document was ever published (initially or during this session)
  const [wasPublished, setWasPublished] = useState(initialStatus === 'published')
  const { hasUnsavedChanges, markClean, markDirty } = useUnsavedChanges()

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Inject slug into initial data if not present
  const dataWithSlug = useMemo<PuckDataWithMeta>(() => {
    const data = initialData as PuckDataWithMeta
    return {
      ...data,
      root: {
        ...data.root,
        props: {
          ...data.root?.props,
          slug: data.root?.props?.slug || pageSlug,
        },
      },
    }
  }, [initialData, pageSlug])

  // Use a ref to track latest data without causing re-renders
  const latestDataRef = useRef<PuckDataWithMeta>(dataWithSlug)

  // Get editor stylesheets from PuckConfigProvider context (as fallback)
  const { editorStylesheets: contextStylesheets, editorCss: contextCss } = usePuckConfig()

  // Props take precedence over context
  const baseStylesheets = editorStylesheetsProp || contextStylesheets
  const baseCss = editorCssProp || contextCss

  // Get current layout to merge layout-specific stylesheets
  const currentLayoutValue = dataWithSlug.root?.props?.pageLayout || 'default'
  const currentLayout = useMemo(() => {
    return layouts?.find((l) => l.value === currentLayoutValue)
  }, [layouts, currentLayoutValue])

  // Merge base stylesheets (props/context) + layout-specific settings
  const mergedEditorStylesheets = useMemo(() => {
    const fromBase = baseStylesheets || []
    const fromLayout = currentLayout?.editorStylesheets || []
    return [...fromBase, ...fromLayout]
  }, [baseStylesheets, currentLayout?.editorStylesheets])

  // Merge base CSS (props/context) + layout-specific settings
  const mergedEditorCss = useMemo(() => {
    const parts = [baseCss, currentLayout?.editorCss].filter(Boolean) as string[]
    return parts.length > 0 ? parts.join('\n') : undefined
  }, [baseCss, currentLayout?.editorCss])

  // Handle save (as draft)
  const handleSave = useCallback(
    async (data: Data) => {
      setIsSaving(true)
      const typedData = data as PuckDataWithMeta
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puckData: data,
            title: typedData.root?.props?.title || pageTitle,
            slug: typedData.root?.props?.slug || pageSlug,
            // Page-tree integration: include folder and pageSegment if present
            folder: typedData.root?.props?.folder,
            pageSegment: typedData.root?.props?.pageSegment,
            draft: true, // Save as draft, don't publish
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.message || 'Failed to save page'
          const err = new Error(errorMessage) as Error & { field?: string; details?: unknown }
          err.field = errorData.field
          err.details = errorData.details
          throw err
        }

        setLastSaved(new Date())
        setSaveError(null) // Clear any previous error
        // After saving as draft, update status to draft (shows "Unpublished Changes" if was published)
        setDocumentStatus('draft')
        markClean()
        onSaveSuccess?.(data)
      } catch (error) {
        console.error('Error saving page:', error)
        setSaveError(error instanceof Error ? error.message : 'Unknown error')
        onSaveError?.(error instanceof Error ? error : new Error('Unknown error'))
      } finally {
        setIsSaving(false)
      }
    },
    [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError]
  )

  // Handle publish
  const handlePublish = useCallback(
    async (data: Data) => {
      setIsSaving(true)
      const typedData = data as PuckDataWithMeta
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puckData: data,
            title: typedData.root?.props?.title || pageTitle,
            slug: typedData.root?.props?.slug || pageSlug,
            // Page-tree integration: include folder and pageSegment if present
            folder: typedData.root?.props?.folder,
            pageSegment: typedData.root?.props?.pageSegment,
            status: 'published',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.message || 'Failed to publish page'
          const err = new Error(errorMessage) as Error & { field?: string; details?: unknown }
          err.field = errorData.field
          err.details = errorData.details
          throw err
        }

        setLastSaved(new Date())
        setSaveError(null) // Clear any previous error
        setDocumentStatus('published') // Update status after successful publish
        setWasPublished(true) // Mark as having been published
        markClean()
        onSaveSuccess?.(data)
      } catch (error) {
        console.error('Error publishing page:', error)
        setSaveError(error instanceof Error ? error.message : 'Unknown error')
        onSaveError?.(error instanceof Error ? error : new Error('Unknown error'))
      } finally {
        setIsSaving(false)
      }
    },
    [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError]
  )

  // Handle unpublish (revert to draft)
  const handleUnpublish = useCallback(
    async () => {
      if (!confirm('This will unpublish the page and return it to draft status. Continue?')) {
        return
      }

      setIsSaving(true)
      try {
        const response = await fetch(`${apiEndpoint}/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'draft',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMessage = errorData.error || errorData.message || 'Failed to unpublish page'
          throw new Error(errorMessage)
        }

        setLastSaved(new Date())
        setSaveError(null)
        setDocumentStatus('draft')
      } catch (error) {
        console.error('Error unpublishing page:', error)
        setSaveError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsSaving(false)
      }
    },
    [apiEndpoint, pageId]
  )

  // Handle data change
  const handleChange = useCallback(
    (data: Data) => {
      latestDataRef.current = data as PuckDataWithMeta
      markDirty()
      onChangeProp?.(data)
    },
    [markDirty, onChangeProp]
  )

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return
      }
    }
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }, [hasUnsavedChanges, router, backUrl])

  // Handle preview (opens in new tab)
  const handlePreview = useCallback(() => {
    const currentSlug = latestDataRef.current?.root?.props?.slug || pageSlug
    let url: string
    if (typeof previewUrl === 'function') {
      url = previewUrl(currentSlug)
    } else if (previewUrl) {
      url = previewUrl
    } else {
      url = `/${currentSlug}`
    }
    window.open(url, '_blank')
  }, [pageSlug, previewUrl])

  // Handle opening preview modal
  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true)
  }, [])

  // Handle save from preview modal (returns Promise for navigation flow)
  const handleSaveFromPreview = useCallback(async () => {
    const data = latestDataRef.current
    setIsSaving(true)
    try {
      const response = await fetch(`${apiEndpoint}/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puckData: data,
          title: data?.root?.props?.title || pageTitle,
          slug: data?.root?.props?.slug || pageSlug,
          // Page-tree integration: include folder and pageSegment if present
          folder: data?.root?.props?.folder,
          pageSegment: data?.root?.props?.pageSegment,
          draft: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.message || 'Failed to save page'
        throw new Error(errorMessage)
      }

      setLastSaved(new Date())
      setSaveError(null)
      setDocumentStatus('draft')
      markClean()
      onSaveSuccess?.(data)
    } catch (error) {
      console.error('Error saving page:', error)
      setSaveError(error instanceof Error ? error.message : 'Unknown error')
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'))
      throw error // Re-throw so preview modal knows save failed
    } finally {
      setIsSaving(false)
    }
  }, [apiEndpoint, pageId, pageTitle, pageSlug, markClean, onSaveSuccess, onSaveError])

  // Memoized overrides
  const overrides = useMemo<Partial<PuckOverrides>>(
    () => ({
      headerActions: ({ children }: { children: ReactNode }) => (
        <HeaderActions
          onBack={handleBack}
          onPreview={handlePreview}
          onSave={handleSave}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onOpenPreview={handleOpenPreview}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
          documentStatus={documentStatus}
          wasPublished={wasPublished}
          actionsStart={headerActionsStart}
          actionsEnd={headerActionsEnd}
          pageId={pageId}
          apiEndpoint={apiEndpoint}
          saveError={saveError}
          onDismissError={() => setSaveError(null)}
          showVersionHistory={false}
        >
          {children}
        </HeaderActions>
      ),
      // Always wrap iframe for richtext styles injection and theme-aware background
      iframe: ({ children, document }: { children: ReactNode; document?: Document }) => (
        <IframeWrapper
          document={document}
          layouts={layouts}
          layoutStyles={layoutStyles}
          layoutKey={layoutKey}
          editorStylesheets={mergedEditorStylesheets}
          editorCss={mergedEditorCss}
        >
          {children}
        </IframeWrapper>
      ),
      // Merge custom overrides
      ...customOverrides,
    }),
    [
      handleBack,
      handlePreview,
      handleSave,
      handlePublish,
      handleUnpublish,
      handleOpenPreview,
      isSaving,
      hasUnsavedChanges,
      lastSaved,
      saveError,
      documentStatus,
      wasPublished,
      headerActionsStart,
      headerActionsEnd,
      pageId,
      apiEndpoint,
      layouts,
      layoutStyles,
      layoutKey,
      customOverrides,
      mergedEditorStylesheets,
      mergedEditorCss,
    ]
  )

  // Default plugins - headingAnalyzer is always included unless plugins is explicitly false
  const defaultPlugins: PuckPlugin[] = [headingAnalyzer]

  // Version history plugin for the plugin rail
  const versionHistoryPlugin = useMemo(() => {
    if (!pageId) return null
    return createVersionHistoryPlugin({
      pageId,
      apiEndpoint,
      onRestoreSuccess: markClean,
    })
  }, [pageId, apiEndpoint, markClean])

  const resolvedPlugins = useMemo(() => {
    if (plugins === false) return undefined
    const base = !plugins || plugins.length === 0 ? defaultPlugins : [...defaultPlugins, ...plugins]
    // Add version history plugin if available
    if (versionHistoryPlugin) {
      return [...base, versionHistoryPlugin]
    }
    return base
  }, [plugins, versionHistoryPlugin])

  const editorContent = (
    <>
      <div className="h-screen">
        <Puck
          config={config}
          data={dataWithSlug}
          onChange={handleChange}
          onPublish={handlePublish}
          headerTitle={`${pageTitle} /${pageSlug}`}
          plugins={resolvedPlugins}
          viewports={enableViewports ? DEFAULT_VIEWPORTS : undefined}
          overrides={overrides}
        />
      </div>
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={latestDataRef.current}
        pageTitle={pageTitle}
        onOpenInNewTab={handlePreview}
        layouts={layouts}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveFromPreview}
        isSaving={isSaving}
        editorStylesheets={mergedEditorStylesheets}
        editorCss={mergedEditorCss}
      />
    </>
  )

  // Wrap with ThemeProvider if theme is provided
  if (theme) {
    return <ThemeProvider theme={theme}>{editorContent}</ThemeProvider>
  }

  return editorContent
}
