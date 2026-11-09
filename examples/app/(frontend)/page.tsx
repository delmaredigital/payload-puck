import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'
// import { siteLayouts } from '@/lib/puck-layouts'
import type { Data as PuckData } from '@puckeditor/core'
import type { Metadata } from 'next'

async function getHomepage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { or: [{ isHomepage: { equals: true } }, { slug: { equals: 'home' } }] },
      ],
    },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomepage()
  if (!page) return { title: 'Home' }
  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
  }
}

export default async function HomePage() {
  const page = await getHomepage()
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

  // PageRenderer applies the page's layout (header, footer, width)
  return (
    <PageRenderer
      data={page.puckData as PuckData}
      config={baseConfig}
      layouts={DEFAULT_LAYOUTS} // Replace with: siteLayouts
    />
  )
}
