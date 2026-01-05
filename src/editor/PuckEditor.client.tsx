'use client'

import dynamic from 'next/dynamic'
import type { Config as PuckConfig, Data, Plugin as PuckPlugin, Overrides as PuckOverrides } from '@measured/puck'
import type { ReactNode } from 'react'
import type { LayoutStyle } from './components/IframeWrapper'
import type { ThemeConfig } from '../theme'
import type { LayoutDefinition } from '../layouts'
import { LoadingState } from './components/LoadingState'

// Dynamic import with ssr: false to prevent hydration mismatch
// Puck generates random IDs for drag-and-drop that differ between server/client
const PuckEditorCore = dynamic(
  () => import('./PuckEditorCore.client').then((mod) => mod.PuckEditorCore),
  {
    ssr: false,
    loading: () => <LoadingState />,
  }
)

export interface PuckEditorProps {
  /**
   * Page ID for save operations
   */
  pageId: string
  /**
   * Initial Puck data to load
   */
  initialData: Data
  /**
   * Puck configuration with components and settings
   */
  config: PuckConfig
  /**
   * Page title for display
   */
  pageTitle: string
  /**
   * Page slug for preview URL
   */
  pageSlug: string
  /**
   * API endpoint for save operations
   * @default '/api/puck/pages'
   */
  apiEndpoint?: string
  /**
   * URL to navigate to when back button is clicked
   */
  backUrl?: string
  /**
   * Preview URL or function to generate preview URL from slug
   */
  previewUrl?: string | ((slug: string) => string)
  /**
   * Whether to enable viewport switching
   * @default true
   */
  enableViewports?: boolean
  /**
   * Additional Puck plugins to use.
   * The headingAnalyzer plugin is included by default.
   * Set to `false` to disable all default plugins.
   */
  plugins?: PuckPlugin[] | false
  /**
   * Layout definitions for the editor preview.
   * The editor reads header, footer, editorBackground, and editorDarkMode
   * from the layout definition matching the selected pageLayout.
   */
  layouts?: LayoutDefinition[]
  /**
   * Layout style configurations for theme-aware preview
   * @deprecated Use `layouts` prop instead. layoutStyles will be removed in a future version.
   */
  layoutStyles?: Record<string, LayoutStyle>
  /**
   * Key in root.props to read layout value from
   * @default 'pageLayout'
   */
  layoutKey?: string
  /**
   * Custom actions to render at the start of the header
   */
  headerActionsStart?: ReactNode
  /**
   * Custom actions to render at the end of the header
   */
  headerActionsEnd?: ReactNode
  /**
   * Puck overrides to merge with defaults
   */
  overrides?: Partial<PuckOverrides>
  /**
   * Callback on successful save
   */
  onSaveSuccess?: (data: Data) => void
  /**
   * Callback on save error
   */
  onSaveError?: (error: Error) => void
  /**
   * Callback when data changes
   */
  onChange?: (data: Data) => void
  /**
   * Initial document status from Payload (_status field)
   * Automatically populated when using PuckEditorView
   */
  initialStatus?: 'draft' | 'published'

  /**
   * Theme configuration for customizing component styles
   * When provided, components will use themed styles
   */
  theme?: ThemeConfig
}

/**
 * Puck Editor wrapper with dynamic import
 *
 * This component wraps PuckEditorCore with next/dynamic to prevent
 * hydration mismatches caused by Puck's random ID generation for
 * drag-and-drop functionality.
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { PuckEditor } from '@delmaredigital/payload-puck/editor'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export function PageEditor({ page }) {
 *   return (
 *     <PuckEditor
 *       pageId={page.id}
 *       initialData={page.puckData}
 *       config={editorConfig}
 *       pageTitle={page.title}
 *       pageSlug={page.slug}
 *       backUrl="/admin/pages"
 *     />
 *   )
 * }
 * ```
 */
export function PuckEditor({
  pageId,
  initialData,
  config,
  pageTitle,
  pageSlug,
  apiEndpoint,
  backUrl,
  previewUrl,
  enableViewports,
  plugins,
  layouts,
  layoutStyles,
  layoutKey,
  headerActionsStart,
  headerActionsEnd,
  overrides,
  onSaveSuccess,
  onSaveError,
  onChange,
  initialStatus,
  theme,
}: PuckEditorProps) {
  return (
    <PuckEditorCore
      pageId={pageId}
      initialData={initialData}
      config={config}
      pageTitle={pageTitle}
      pageSlug={pageSlug}
      apiEndpoint={apiEndpoint}
      backUrl={backUrl}
      previewUrl={previewUrl}
      enableViewports={enableViewports}
      plugins={plugins}
      layouts={layouts}
      layoutStyles={layoutStyles}
      layoutKey={layoutKey}
      headerActionsStart={headerActionsStart}
      headerActionsEnd={headerActionsEnd}
      overrides={overrides}
      onSaveSuccess={onSaveSuccess}
      onSaveError={onSaveError}
      onChange={onChange}
      initialStatus={initialStatus}
      theme={theme}
    />
  )
}
