/**
 * Hybrid Page Renderer
 *
 * Renders pages that can be either Puck-edited or legacy Payload block-based.
 * For new projects using only Puck, legacyRenderer is optional.
 *
 * @example New project (Puck-only)
 * ```tsx
 * import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
 * import { puckConfig } from '@/puck/config'
 *
 * export async function PageRenderer({ slug }) {
 *   const page = await fetchPage(slug)
 *   return <HybridPageRenderer page={page} config={puckConfig} />
 * }
 * ```
 *
 * @example Migration (with legacy blocks)
 * ```tsx
 * import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
 * import { puckConfig } from '@/puck/config'
 * import { siteLayouts } from '@/lib/puck-layouts'
 * import { BlockRenderer } from '@/components/blocks/BlockRenderer'
 *
 * export async function PageRenderer({ slug }) {
 *   const page = await fetchPage(slug)
 *
 *   return (
 *     <HybridPageRenderer
 *       page={page}
 *       config={puckConfig}
 *       layouts={siteLayouts}
 *       legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 *     />
 *   )
 * }
 * ```
 */

import type { Config as PuckConfig, Data as PuckData } from '@puckeditor/core'
import { PageRenderer, type PageRendererProps } from './PageRenderer.js'
import type { ReactNode } from 'react'

/**
 * Loose input type that accepts Payload's generic JSON field types.
 * Use with `toHybridPageData()` to convert to `HybridPageData`.
 */
export interface HybridPageDataInput {
  editorVersion?: string | null
  puckData?: unknown
  [key: string]: unknown
}

/**
 * Page data shape for hybrid rendering
 */
export interface HybridPageData {
  /**
   * Which editor was used to create the page
   * - 'puck': Page was created/edited with Puck visual editor
   * - 'legacy': Page uses traditional Payload block fields
   */
  editorVersion?: 'legacy' | 'puck'

  /**
   * Puck editor data (for pages with editorVersion: 'puck')
   */
  puckData?: PuckData | null

  /**
   * Legacy blocks array (for pages with editorVersion: 'legacy')
   * The field name varies by project (e.g., 'layout', 'blocks', 'content')
   */
  [key: string]: unknown
}

export interface HybridPageRendererProps<TBlocks = unknown[]>
  extends Omit<PageRendererProps, 'data'> {
  /**
   * Page document containing editorVersion, puckData, and optionally legacy blocks
   */
  page: HybridPageData

  /**
   * Render function for legacy Payload blocks.
   * Called when editorVersion is 'legacy' or when puckData is not available.
   *
   * Optional for new projects that will only have Puck pages. If not provided
   * and legacy blocks are encountered, the fallback will be rendered instead.
   *
   * Use the generic type parameter to get proper typing for your blocks:
   * @example
   * ```tsx
   * <HybridPageRenderer<NonNullable<Page['layout']>>
   *   legacyRenderer={(blocks) => <RenderBlocks blocks={blocks} />}
   * />
   * ```
   *
   * @param blocks - The legacy blocks array from the page
   * @returns React node to render
   */
  legacyRenderer?: (blocks: TBlocks) => ReactNode

  /**
   * Name of the field containing legacy blocks
   * @default 'layout'
   */
  legacyBlocksField?: string

  /**
   * Fallback content when no content is available
   * @default <div>No content available</div>
   */
  fallback?: ReactNode
}

/**
 * Renders a page using either Puck or legacy Payload blocks
 *
 * Decision logic:
 * 1. If editorVersion is 'puck' AND puckData has content → render with PageRenderer
 * 2. If legacy blocks exist AND legacyRenderer is provided → render with legacyRenderer
 * 3. Otherwise → render fallback
 */
export function HybridPageRenderer<TBlocks = unknown[]>({
  page,
  legacyRenderer,
  legacyBlocksField = 'layout',
  fallback = <div>No content available</div>,
  config,
  layouts,
  wrapper,
  className,
}: HybridPageRendererProps<TBlocks>) {
  // Check for Puck content
  const puckData = page.puckData as PuckData | null | undefined
  const hasPuckContent =
    puckData?.content && Array.isArray(puckData.content) && puckData.content.length > 0

  // Check for legacy content
  const legacyBlocks = page[legacyBlocksField] as TBlocks | undefined
  const hasLegacyContent = Array.isArray(legacyBlocks) && legacyBlocks.length > 0

  // Render Puck pages
  if (page.editorVersion === 'puck' && hasPuckContent) {
    return (
      <PageRenderer
        data={puckData as PuckData}
        config={config}
        layouts={layouts}
        wrapper={wrapper}
        className={className}
      />
    )
  }

  // Render legacy pages (only if legacyRenderer is provided)
  if (hasLegacyContent && legacyRenderer) {
    return <>{legacyRenderer(legacyBlocks as TBlocks)}</>
  }

  // Fallback for empty pages
  return <>{fallback}</>
}

/**
 * Converts a loosely-typed page object (e.g., from Payload's generated types)
 * to a properly typed `HybridPageData`.
 *
 * Use this when Payload's generated types for JSON fields are too generic
 * and don't match `HybridPageData`.
 *
 * @example
 * ```tsx
 * import { HybridPageRenderer, toHybridPageData } from '@delmaredigital/payload-puck/render'
 *
 * // page comes from Payload with generic JSON types
 * const page = await payload.findByID({ collection: 'pages', id })
 *
 * <HybridPageRenderer
 *   page={toHybridPageData(page)}
 *   config={config}
 *   legacyRenderer={(blocks) => <BlockRenderer blocks={blocks} />}
 * />
 * ```
 *
 * @param page - Page object with loosely-typed fields
 * @returns Properly typed HybridPageData
 * @throws Error if editorVersion is present but invalid
 */
export function toHybridPageData(page: HybridPageDataInput): HybridPageData {
  const { editorVersion, puckData, ...rest } = page

  // Validate editorVersion if present
  if (editorVersion !== undefined && editorVersion !== null) {
    if (editorVersion !== 'legacy' && editorVersion !== 'puck') {
      throw new Error(
        `Invalid editorVersion: "${editorVersion}". Expected "legacy", "puck", or undefined.`
      )
    }
  }

  // Validate puckData shape if present (basic check)
  if (puckData !== undefined && puckData !== null) {
    if (typeof puckData !== 'object') {
      throw new Error(`Invalid puckData: expected object, got ${typeof puckData}`)
    }
  }

  return {
    ...rest,
    editorVersion: editorVersion as HybridPageData['editorVersion'],
    puckData: puckData as HybridPageData['puckData'],
  }
}
