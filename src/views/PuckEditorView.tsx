/**
 * PuckEditorView - React Server Component for Payload Admin
 *
 * Renders the Puck editor full-viewport under the admin route, without Payload's
 * admin chrome (nav, header). Puck lays out its own panels and auto-zooms the
 * canvas against the space it is given, so wrapping it in `DefaultTemplate`
 * starved the canvas and produced nested scroll contexts. Staying under /admin
 * keeps Payload's session, `req` and access handling; the editor's Back button
 * returns to the document.
 *
 * Registered as a custom view via config.admin.components.views. Payload renders
 * custom views without a template unless the view adds one.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { AdminViewProps } from 'payload'
import { PuckEditor } from '../editor/PuckEditor.js'
import { mapPayloadFieldsToRootProps } from '../api/utils/mapRootProps.js'
import type { RootPropsMapping } from '../api/types.js'

export interface PuckEditorViewProps extends AdminViewProps {
  // Additional props can be passed via plugin config
}

/**
 * Server Component that renders the Puck editor within Payload admin
 *
 * URL pattern: /admin/puck-editor/:collection/:id
 */
export async function PuckEditorView({
  initPageResult,
  params,
  searchParams,
}: PuckEditorViewProps) {
  const { req } = initPageResult
  const { payload } = req

  // Get admin route from config
  const adminRoute = req.payload.config.routes?.admin || '/admin'

  // Parse segments from URL: /admin/puck-editor/:collection/:id
  // params.segments contains the full path after /admin/, e.g. ['puck-editor', 'pages', '1']
  // We need to skip the route prefix ('puck-editor') to get collection and id
  const segments = (await params)?.segments as string[] | undefined
  // segments[0] = 'puck-editor' (route prefix), segments[1] = collection, segments[2] = id
  const collection = segments?.[1] || 'pages'
  const pageId = segments?.[2]

  if (!pageId) {
    return (
      <EditorMessage backUrl={`${adminRoute}/collections/${collection}`}>
        No page ID provided. Please navigate from the collection view.
      </EditorMessage>
    )
  }

  // Get puck config from plugin custom settings
  const puckConfig = (payload.config as any).custom?.puck?.config
  const layouts = (payload.config as any).custom?.puck?.layouts
  const explicitPageTreeConfig = (payload.config as any).custom?.puck?.pageTree
  const aiConfig = (payload.config as any).custom?.puck?.ai
  const editorStylesheets = (payload.config as any).custom?.puck?.editorStylesheets as string[] | undefined
  const previewUrlConfig = (payload.config as any).custom?.puck?.previewUrl as
    | string
    | ((page: any) => string | ((slug: string) => string))
    | undefined
  const rootPropsMapping = (payload.config as any).custom?.puck?.rootPropsMapping as
    | RootPropsMapping[]
    | undefined

  // Fetch the page data
  // Use depth: 1 if previewUrl is a function (may need relationship data like organization)
  let page: any = null
  let error: string | null = null
  const needsRelationships = typeof previewUrlConfig === 'function'

  // Read locale from searchParams (e.g. ?locale=bg)
  const resolvedSearch = await searchParams
  const locale = (resolvedSearch?.locale as string | undefined) || req.locale

  // Read as the signed-in admin user. The Local API defaults to
  // `overrideAccess: true`, which would hand any admin user the draft of a page
  // the collection's read access denies them. Passing `req` carries the user.
  try {
    page = await payload.findByID({
      collection: collection as any,
      id: pageId,
      draft: true, // Always get draft for editing
      depth: needsRelationships ? 1 : 0,
      locale,
      req,
      overrideAccess: false,
    })
  } catch (err) {
    console.error('[PuckEditorView] Error fetching page:', err)
    error = err instanceof Error ? err.message : 'Failed to load page'
  }

  // Compute preview URL prefix from config
  // Note: Functions can't be passed to client components, so we extract a string prefix here.
  // The client reconstructs the URL function as: (slug) => slug ? `${prefix}/${slug}` : prefix
  //
  // IMPORTANT: When the config returns a function, we call it with '' to get the prefix.
  // This relies on the function using the pattern: (slug) => slug ? `/${org}/${slug}` : `/${org}`
  // See PuckPluginOptions.previewUrl JSDoc in src/types/index.ts for details.
  let previewUrlPrefix: string | undefined
  if (previewUrlConfig && page) {
    if (typeof previewUrlConfig === 'function') {
      const result = previewUrlConfig(page)
      if (typeof result === 'string') {
        // Function returned a string prefix directly (e.g., '/acme')
        previewUrlPrefix = result
      } else if (typeof result === 'function') {
        // Function returned a slug-to-URL function - call with '' to extract prefix
        // e.g., (slug) => slug ? `/acme/${slug}` : `/acme` called with '' returns '/acme'
        previewUrlPrefix = result('')
      }
    } else {
      previewUrlPrefix = previewUrlConfig
    }
  }

  // Fetch AI prompts from collection if enabled
  let aiExamplePrompts = aiConfig?.examplePrompts || []
  if (aiConfig?.enabled && aiConfig?.promptsCollection) {
    try {
      const promptsResult = await payload.find({
        collection: 'puck-ai-prompts' as any,
        sort: 'order',
        limit: 50,
        req,
        overrideAccess: false,
      })
      // Merge collection prompts with config prompts (collection prompts first)
      const collectionPrompts = promptsResult.docs.map((doc: any) => ({
        label: doc.label,
        prompt: doc.prompt,
      }))
      aiExamplePrompts = [...collectionPrompts, ...aiExamplePrompts]
    } catch (e) {
      // Collection might not exist yet, or the user can't read it -- either
      // way the editor works without the stored prompts
      console.warn('[PuckEditorView] Could not fetch AI prompts:', e)
    }
  }

  // Determine page-tree config:
  // 1. If explicitly set to false in plugin options, disable
  // 2. If explicit config provided, use it
  // 3. Otherwise, auto-detect by checking for pageSegment field (added by page-tree plugin)
  let pageTreeConfig = null
  if (explicitPageTreeConfig === false) {
    // Explicitly disabled
    pageTreeConfig = null
  } else if (explicitPageTreeConfig) {
    // Use explicit config
    pageTreeConfig = explicitPageTreeConfig
  } else {
    // Auto-detect: check if collection has pageSegment field
    const collectionConfig = payload.collections[collection]?.config
    const hasPageTreeFields = collectionConfig?.fields?.some(
      (field: any) => field.name === 'pageSegment'
    )
    if (hasPageTreeFields) {
      pageTreeConfig = {
        folderSlug: 'payload-folders',
        pageSegmentFieldName: 'pageSegment',
        folderFieldName: 'folder',
      }
    }
  }

  // Build back URL to collection
  const backUrl = `${adminRoute}/collections/${collection}/${pageId}`

  // Build initial data, syncing Payload fields to root.props
  let initialData = page?.puckData || { content: [], root: { props: {} } }

  if (page) {
    // Map Payload document fields to root.props format
    // This ensures fields like title, slug, isHomepage, pageLayout are synced.
    // Pass the configured custom mappings so the load direction mirrors the
    // save endpoints (otherwise custom-mapped fields would appear to revert).
    const syncedRootProps = mapPayloadFieldsToRootProps(
      page as Record<string, unknown>,
      rootPropsMapping
    )

    // Handle folder ID specially (could be object or string)
    if (pageTreeConfig && page.folder !== undefined) {
      const folderId = typeof page.folder === 'object' ? page.folder?.id : page.folder
      syncedRootProps.folder = folderId || null
    }

    initialData = {
      ...initialData,
      root: {
        ...initialData.root,
        props: {
          ...initialData.root?.props,
          ...syncedRootProps,
        },
      },
    }
  }

  if (error) {
    return (
      <EditorMessage backUrl={`${adminRoute}/collections/${collection}`} isError>
        Error: {error}
      </EditorMessage>
    )
  }

  return (
    <PuckEditor
      pageId={pageId}
      initialData={initialData}
      pageTitle={page?.title || 'Untitled'}
      pageSlug={page?.slug || ''}
      apiEndpoint={`/api/puck/${collection}`}
      initialStatus={page?._status}
      backUrl={backUrl}
      previewUrlPrefix={previewUrlPrefix}
      layouts={layouts}
      hasPageTree={!!pageTreeConfig}
      folder={pageTreeConfig ? (typeof page?.folder === 'object' ? page?.folder?.id : page?.folder) : undefined}
      pageSegment={pageTreeConfig ? page?.pageSegment : undefined}
      enableAi={aiConfig?.enabled}
      aiExamplePrompts={aiExamplePrompts}
      hasPromptsCollection={!!aiConfig?.promptsCollection}
      hasContextCollection={!!aiConfig?.contextCollection}
      aiComponentInstructions={aiConfig?.componentInstructions}
      editorStylesheets={editorStylesheets}
    />
  )
}

/**
 * Full-viewport message with a way back, for states where the editor can't load.
 * There is no admin chrome on this route, so the link is the only navigation.
 * Payload v4 renames `--theme-text` to `--color-text`; prefer the new name and
 * fall back so this reads correctly on both.
 */
function EditorMessage({
  backUrl,
  children,
  isError = false,
}: {
  backUrl: string
  children: ReactNode
  isError?: boolean
}) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    height: '100dvh',
    padding: '24px',
    textAlign: 'center',
    color: isError ? 'var(--theme-error-500, #b91c1c)' : 'var(--color-text, var(--theme-text))',
  }
  return (
    <div style={style}>
      <p>{children}</p>
      <a href={backUrl} style={{ color: 'var(--color-text, var(--theme-text))' }}>
        &larr; Back
      </a>
    </div>
  )
}

export default PuckEditorView
