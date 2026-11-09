'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
import { DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'
// import { siteLayouts } from '@/lib/puck-layouts'
// import { puckTheme } from '@/lib/puck-theme'
import type { Data } from '@puckeditor/core'

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
    if (pageId) fetchPage()
  }, [pageId])

  if (loading) return <p className="p-8 text-muted-foreground">Loading page...</p>

  if (error || !page) {
    return (
      <div className="p-8">
        <p className="text-destructive mb-4">{error ?? 'Page not found'}</p>
        <Link href="/admin/collections/pages" className="text-primary underline">
          Back to Pages
        </Link>
      </div>
    )
  }

  // Default Puck data if none exists
  const initialData: Data = page.puckData || {
    root: { props: { title: page.title || 'New Page' } },
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
      layouts={DEFAULT_LAYOUTS} // Replace with: siteLayouts
      // theme={puckTheme}
      onSaveSuccess={(data: Data) => console.log('Page saved:', data)}
      onSaveError={(err: Error) => console.error('Failed to save page:', err)}
    />
  )
}
