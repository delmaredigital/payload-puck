/**
 * Dynamic Page Renderer
 *
 * Copy this file to: app/(frontend)/[...slug]/page.tsx
 * (or your preferred route structure)
 *
 * Renders Puck pages from Payload CMS with:
 * - SEO metadata generation
 * - 404 handling for missing pages
 * - Layout-based header/footer rendering
 * - Optional theming support
 */

import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { LayoutWrapper, DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'
// Import your custom layouts - create from examples/lib/puck-layouts.ts
// import { siteLayouts } from '@/lib/puck-layouts'
// Import your theme - create from examples/lib/puck-theme.ts
// import { puckTheme } from '@/lib/puck-theme'
import type { Data as PuckData } from '@measured/puck'
import type { Metadata } from 'next'

interface PageParams {
  slug: string[]
}

// Generate SEO metadata from page data
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug.join('/') } },
    limit: 1,
  })

  const page = docs[0] as any
  if (!page) return {}

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
    robots: page.meta?.noindex ? { index: false } : undefined,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug.join('/') } },
    limit: 1,
  })

  const page = docs[0] as any
  if (!page) notFound()

  // Handle pages without content
  if (!page.puckData) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
        <p className="text-muted-foreground">
          This page has no content yet. Edit it in the admin panel.
        </p>
      </div>
    )
  }

  // Find the layout definition based on page's pageLayout setting
  // Use your custom siteLayouts instead of DEFAULT_LAYOUTS for header/footer
  const layouts = DEFAULT_LAYOUTS // Replace with: siteLayouts
  const pageLayout = page.puckData?.root?.props?.pageLayout || 'default'
  const layout = layouts.find((l) => l.value === pageLayout)

  return (
    <LayoutWrapper layout={layout}>
      <PageRenderer
        data={page.puckData as PuckData}
        config={baseConfig}
        // Optional: Custom theme - uncomment after creating puck-theme.ts
        // theme={puckTheme}
      />
    </LayoutWrapper>
  )
}
