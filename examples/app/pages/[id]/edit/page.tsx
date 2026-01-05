/**
 * Puck Editor Page
 *
 * Copy this file to: app/(manage)/pages/[id]/edit/page.tsx
 * (or your preferred route structure)
 *
 * Provides a visual page editor with:
 * - Save draft / Publish functionality
 * - Version history (if versions route exists)
 * - Unsaved changes warning
 * - Preview in new tab
 * - Header/footer preview in editor
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
import { DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'
// Import your custom layouts - create from examples/lib/puck-layouts.ts
// import { siteLayouts } from '@/lib/puck-layouts'
// Import your theme - create from examples/lib/puck-theme.ts
// import { puckTheme } from '@/lib/puck-theme'
import type { Data } from '@measured/puck'

interface PageData {
  id: string
  title: string
  slug: string
  puckData: Data
  _status?: 'draft' | 'published'
}

export default function EditPagePage() {
  const params = useParams()
  const pageId = params.id as string

  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true)
        const response = await fetch(`/api/puck/pages/${pageId}`)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch page')
        }

        const data = await response.json()
        setPage(data.doc)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (pageId) {
      fetchPage()
    }
  }, [pageId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link
            href="/admin/collections/pages"
            className="text-primary underline hover:no-underline"
          >
            Back to Pages
          </Link>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Page not found</p>
          <Link
            href="/admin/collections/pages"
            className="text-primary underline hover:no-underline"
          >
            Back to Pages
          </Link>
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
      config={editorConfig}
      pageTitle={page.title}
      pageSlug={page.slug}
      apiEndpoint="/api/puck/pages"
      backUrl={`/admin/collections/pages/${page.id}`}
      previewUrl={(slug: string) => `/${slug}`}
      initialStatus={page._status}
      // Layouts control header/footer preview and editor backgrounds
      // Use DEFAULT_LAYOUTS or create custom ones in lib/puck-layouts.ts
      layouts={DEFAULT_LAYOUTS}
      // Optional: Custom theme - uncomment after creating puck-theme.ts
      // theme={puckTheme}
      onSaveSuccess={(data: Data) => {
        console.log('Page saved successfully:', data)
      }}
      onSaveError={(err: Error) => {
        console.error('Failed to save page:', err)
      }}
    />
  )
}
