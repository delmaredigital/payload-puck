/**
 * Rendering components for Puck pages
 *
 * This module only exports server-safe components.
 * For the client-side editor, use '@delmaredigital/payload-puck/editor'
 */

export { PageRenderer } from './PageRenderer.js'
export type { PageRendererProps } from './PageRenderer.js'

export { HybridPageRenderer, toHybridPageData } from './HybridPageRenderer.js'
export type {
  HybridPageRendererProps,
  HybridPageData,
  HybridPageDataInput,
} from './HybridPageRenderer.js'

// Re-export createRenderLayouts for convenience (commonly used with renderers)
export { createRenderLayouts } from '../layouts/utils.js'

// Note: PuckEditor has been moved to '@delmaredigital/payload-puck/editor'
// to avoid RSC import issues with the client-only Puck component
