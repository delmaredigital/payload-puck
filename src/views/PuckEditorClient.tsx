'use client'

/**
 * PuckEditorClient - Client component for the Puck editor in Payload admin
 *
 * This wraps PuckEditorCore and provides the necessary context for
 * running within Payload's admin UI.
 */

import { useMemo } from 'react'
import type { Data as PuckData, Config as PuckConfig } from '@measured/puck'
import { PuckEditorCore } from '../editor/PuckEditorCore.client.js'
import type { LayoutDefinition } from '../layouts/index.js'
import { usePuckConfig } from './PuckConfigContext.js'
import { createFolderPickerField } from '../fields/FolderPickerField.js'
import { createPageSegmentField } from '../fields/PageSegmentField.js'
import { createSlugPreviewField } from '../fields/SlugPreviewField.js'

export interface PuckEditorClientProps {
  /**
   * Page ID for save operations
   */
  pageId: string
  /**
   * Collection slug
   */
  collection: string
  /**
   * Initial Puck data
   */
  initialData: PuckData
  /**
   * Page title for display
   */
  pageTitle: string
  /**
   * Page slug for preview
   */
  pageSlug: string
  /**
   * Initial document status
   */
  initialStatus?: 'draft' | 'published'
  /**
   * URL to navigate back to
   */
  backUrl?: string
  /**
   * Admin route base
   */
  adminRoute?: string
  /**
   * Layout definitions (can also come from context)
   */
  layouts?: LayoutDefinition[]
  /**
   * Whether page-tree integration is active (auto-detected)
   * When true, folder picker and page segment fields are injected into root
   */
  hasPageTree?: boolean
}

/**
 * Client component that renders the Puck editor
 *
 * The Puck config is obtained from PuckConfigContext. The consuming application
 * must wrap their app with PuckConfigProvider.
 *
 * @example
 * ```tsx
 * // In your app's layout:
 * import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PuckConfigProvider config={editorConfig}>
 *           {children}
 *         </PuckConfigProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function PuckEditorClient({
  pageId,
  collection,
  initialData,
  pageTitle,
  pageSlug,
  initialStatus,
  backUrl,
  adminRoute = '/admin',
  layouts: layoutsProp,
  hasPageTree = false,
}: PuckEditorClientProps) {
  // Get config from context
  const { config: baseConfig, layouts: layoutsFromContext, theme } = usePuckConfig()

  // Use layouts from props or context
  const layouts = layoutsProp || layoutsFromContext

  // If page-tree is active, inject folder picker fields into root config
  const config = useMemo(() => {
    if (!baseConfig || !hasPageTree) return baseConfig

    // Create page-tree specific fields
    const pageTreeFields = {
      folder: createFolderPickerField({ label: 'Folder' }),
      pageSegment: createPageSegmentField({ label: 'Page Segment' }),
      slug: createSlugPreviewField({
        label: 'URL Slug',
        hint: 'Auto-generated from folder + page segment',
      }),
    }

    // Merge page-tree fields into root config, replacing slug field
    const existingRootFields = baseConfig.root?.fields || {}
    const { slug: _existingSlug, ...otherFields } = existingRootFields as Record<string, unknown>

    return {
      ...baseConfig,
      root: {
        ...baseConfig.root,
        fields: {
          ...otherFields,
          ...pageTreeFields,
        },
      },
    } as PuckConfig
  }, [baseConfig, hasPageTree])

  // API endpoint based on collection
  const apiEndpoint = `/api/puck/${collection}`

  // Preview URL - defaults to the page slug
  const previewUrl = (slug: string) => `/${slug}`

  if (!config) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 120px)',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '8px',
            padding: '32px 48px',
            maxWidth: '560px',
          }}
        >
          <h2
            style={{
              color: 'var(--theme-elevation-800)',
              fontSize: '18px',
              fontWeight: 600,
              margin: '0 0 12px 0',
            }}
          >
            Puck Configuration Required
          </h2>
          <p
            style={{
              color: 'var(--theme-elevation-500)',
              fontSize: '14px',
              lineHeight: 1.6,
              margin: '0 0 16px 0',
            }}
          >
            To use the Puck editor, wrap your application with{' '}
            <code
              style={{
                backgroundColor: 'var(--theme-elevation-100)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              PuckConfigProvider
            </code>
          </p>
          <pre
            style={{
              backgroundColor: 'var(--theme-elevation-100)',
              padding: '16px',
              borderRadius: '6px',
              fontSize: '12px',
              textAlign: 'left',
              overflow: 'auto',
              margin: 0,
            }}
          >
{`// In your layout.tsx:
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

<PuckConfigProvider config={editorConfig}>
  {children}
</PuckConfigProvider>`}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        // Take up full available height within the admin template
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PuckEditorCore
        pageId={pageId}
        initialData={initialData}
        config={config}
        pageTitle={pageTitle}
        pageSlug={pageSlug}
        apiEndpoint={apiEndpoint}
        backUrl={backUrl}
        previewUrl={previewUrl}
        initialStatus={initialStatus}
        layouts={layouts}
        theme={theme}
      />
    </div>
  )
}

export default PuckEditorClient
