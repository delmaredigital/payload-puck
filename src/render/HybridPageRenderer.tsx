/**
 * Hybrid Page Renderer
 *
 * Renders pages that can be either Puck-edited or legacy Payload block-based.
 * Use this when migrating existing collections to Puck while maintaining
 * backwards compatibility with legacy content.
 *
 * @example
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

import type { Config as PuckConfig, Data as PuckData } from '@measured/puck'
import { PageRenderer, type PageRendererProps } from './PageRenderer'
import type { ReactNode } from 'react'

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

export interface HybridPageRendererProps extends Omit<PageRendererProps, 'data'> {
  /**
   * Page document containing editorVersion, puckData, and optionally legacy blocks
   */
  page: HybridPageData

  /**
   * Render function for legacy Payload blocks.
   * Called when editorVersion is 'legacy' or when puckData is not available.
   *
   * @param blocks - The legacy blocks array from the page
   * @returns React node to render
   */
  legacyRenderer: (blocks: unknown[]) => ReactNode

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
 * 2. If legacy blocks exist → render with legacyRenderer
 * 3. Otherwise → render fallback
 */
export function HybridPageRenderer({
  page,
  legacyRenderer,
  legacyBlocksField = 'layout',
  fallback = <div>No content available</div>,
  config,
  layouts,
  wrapper,
  className,
}: HybridPageRendererProps) {
  // Check for Puck content
  const puckData = page.puckData as PuckData | null | undefined
  const hasPuckContent =
    puckData?.content && Array.isArray(puckData.content) && puckData.content.length > 0

  // Check for legacy content
  const legacyBlocks = page[legacyBlocksField] as unknown[] | undefined
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

  // Render legacy pages
  if (hasLegacyContent) {
    return <>{legacyRenderer(legacyBlocks)}</>
  }

  // Fallback for empty pages
  return <>{fallback}</>
}
