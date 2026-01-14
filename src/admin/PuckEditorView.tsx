'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { Config as PuckConfig, Data, Plugin as PuckPlugin } from '@puckeditor/core'

/**
 * Props for the PuckEditorView component
 */
export interface PuckEditorViewProps {
  /**
   * Puck configuration with components and settings
   */
  config: PuckConfig
  /**
   * Collection slug for API endpoints
   * @default 'pages'
   */
  collectionSlug?: string
  /**
   * Base API path for Puck operations
   * @default '/api/puck'
   */
  apiBasePath?: string
  /**
   * URL to navigate to when back button is clicked
   * Falls back to /admin/collections/{collectionSlug}
   */
  backUrl?: string
  /**
   * Preview URL or function to generate preview URL from slug
   */
  previewUrl?: string | ((slug: string) => string)
  /**
   * Layout styles for theme-aware preview
   */
  layoutStyles?: Record<string, { background: string; isDark: boolean }>
  /**
   * Key in root.props to read layout value from
   * @default 'pageLayout'
   */
  layoutKey?: string
  /**
   * Additional Puck plugins to use.
   * The headingAnalyzer plugin is included by default.
   * Set to `false` to disable all default plugins.
   */
  plugins?: PuckPlugin[] | false
  /**
   * Callback on successful save
   */
  onSaveSuccess?: (data: Data) => void
  /**
   * Callback on save error
   */
  onSaveError?: (error: Error) => void
}

interface PageData {
  id: string
  title: string
  slug: string
  puckData: Data | null
  _status?: 'draft' | 'published'
}

/**
 * Ready-to-use Puck editor page component
 *
 * Use this in your own editor page route (e.g., /pages/[id]/edit).
 * It auto-fetches page data from the API and renders the PuckEditor.
 *
 * @example
 * ```tsx
 * // src/app/pages/[id]/edit/page.tsx
 * 'use client'
 *
 * import { PuckEditorView } from '@delmaredigital/payload-puck/editor'
 * import { editorConfig } from '@/puck/config'
 *
 * export default function PageEditor() {
 *   return (
 *     <PuckEditorView
 *       config={editorConfig}
 *       collectionSlug="pages"
 *       apiBasePath="/api/puck"
 *       backUrl="/admin/collections/pages"
 *       previewUrl={(slug) => `/${slug}`}
 *     />
 *   )
 * }
 * ```
 */
export function PuckEditorView({
  config,
  collectionSlug = 'pages',
  apiBasePath = '/api/puck',
  backUrl,
  previewUrl,
  layoutStyles,
  layoutKey = 'pageLayout',
  plugins,
  onSaveSuccess,
  onSaveError,
}: PuckEditorViewProps) {
  const params = useParams()
  const searchParams = useSearchParams()

  // Get page ID from route params or search params
  const pageId = (params?.id as string) || searchParams?.get('id') || ''

  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [PuckEditor, setPuckEditor] = useState<React.ComponentType<any> | null>(null)

  // Dynamically import PuckEditor to avoid SSR issues
  useEffect(() => {
    import('../editor/PuckEditor').then((mod) => {
      setPuckEditor(() => mod.PuckEditor)
    })
  }, [])

  useEffect(() => {
    async function fetchPage() {
      if (!pageId) {
        setError('No page ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${apiBasePath}/${collectionSlug}/${pageId}`)

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || `Failed to fetch page: ${response.status}`)
        }

        const data = await response.json()
        setPage(data.doc)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [pageId, apiBasePath, collectionSlug])

  const computedBackUrl = backUrl || `/admin/collections/${collectionSlug}`

  if (loading || !PuckEditor) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f0f',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #333',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#888' }}>Loading editor...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f0f',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
          <a
            href={computedBackUrl}
            style={{
              color: '#60a5fa',
              textDecoration: 'underline',
            }}
          >
            Back to {collectionSlug}
          </a>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f0f',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: '16px' }}>Page not found</p>
          <a
            href={computedBackUrl}
            style={{
              color: '#60a5fa',
              textDecoration: 'underline',
            }}
          >
            Back to {collectionSlug}
          </a>
        </div>
      </div>
    )
  }

  // Default puck data if none exists
  const initialData: Data = page.puckData || {
    root: {
      props: {
        title: page.title || 'New Page',
      },
    },
    content: [],
    zones: {},
  }

  return (
    <PuckEditor
      pageId={page.id}
      initialData={initialData}
      config={config}
      pageTitle={page.title}
      pageSlug={page.slug}
      apiEndpoint={`${apiBasePath}/${collectionSlug}`}
      backUrl={computedBackUrl}
      previewUrl={previewUrl}
      layoutStyles={layoutStyles}
      layoutKey={layoutKey}
      plugins={plugins}
      onSaveSuccess={onSaveSuccess}
      onSaveError={onSaveError}
      initialStatus={page._status}
    />
  )
}

export default PuckEditorView
