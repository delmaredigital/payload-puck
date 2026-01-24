'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Config as PuckConfig, Data, Plugin as PuckPlugin, Overrides as PuckOverrides } from '@puckeditor/core'
import type { ReactNode } from 'react'
import type { LayoutStyle } from './components/IframeWrapper'
import type { ThemeConfig } from '../theme'
import type { LayoutDefinition } from '../layouts'
import type { AiExamplePrompt, ComponentAiOverrides } from '../ai/types.js'
import { LoadingState } from './components/LoadingState'
import { injectPageTreeFields } from './utils/injectPageTreeFields.js'
import { hasPageTreeFields } from './utils/detectPageTree.js'
import { usePuckConfig } from '../views/PuckConfigContext.js'
import { injectAiConfig, hasAiConfig } from '../ai/utils/injectAiConfig.js'
import { comprehensiveComponentAiConfig } from '../ai/presets/index.js'

// Dynamic import with ssr: false to prevent hydration mismatch
// Puck generates random IDs for drag-and-drop that differ between server/client
const PuckEditorImpl = dynamic(
  () => import('./PuckEditorImpl.client').then((mod) => mod.PuckEditorImpl),
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
   * Puck configuration with components and settings.
   * If not provided, will attempt to read from PuckConfigContext.
   */
  config?: PuckConfig
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
   * URL prefix for preview (e.g., '/acme' for org-scoped pages).
   * When provided, the preview URL will be built as:
   * - Homepage: `{prefix}`
   * - Regular pages: `{prefix}/{slug}`
   * This is useful for Server Components where functions can't be passed.
   */
  previewUrlPrefix?: string
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

  // Page-tree integration props

  /**
   * Enable page-tree integration (folder picker, page segment, computed slug).
   * When true, injects folder/pageSegment/slug fields into root config.
   * Requires @delmaredigital/payload-page-tree plugin to be installed.
   * @default false
   */
  hasPageTree?: boolean
  /**
   * Initial folder ID for page-tree integration.
   * Only used when hasPageTree is true.
   */
  folder?: string | null
  /**
   * Initial page segment for page-tree integration.
   * Only used when hasPageTree is true.
   */
  pageSegment?: string

  // Editor iframe styling props

  /**
   * Stylesheet URLs to inject into the editor iframe.
   * Use this to provide frontend CSS (Tailwind, CSS variables, etc.)
   * that header/footer components need for proper styling.
   * Takes precedence over stylesheets from PuckConfigProvider.
   *
   * @example
   * ```tsx
   * <PuckEditor
   *   editorStylesheets={['/editor-styles.css']}
   *   // ...
   * />
   * ```
   */
  editorStylesheets?: string[]
  /**
   * Raw CSS to inject into the editor iframe.
   * Useful for CSS variables or style overrides.
   * Takes precedence over CSS from PuckConfigProvider.
   *
   * @example
   * ```tsx
   * <PuckEditor
   *   editorCss=":root { --primary: blue; }"
   *   // ...
   * />
   * ```
   */
  editorCss?: string

  // AI integration props

  /**
   * Enable AI features in the editor.
   * When true, adds the AI chat plugin to the editor.
   * Requires @puckeditor/plugin-ai to be installed and
   * PUCK_API_KEY environment variable to be set.
   * @default false
   */
  enableAi?: boolean

  /**
   * AI plugin configuration options.
   * Only used when enableAi is true.
   */
  aiOptions?: {
    /**
     * API host for AI requests.
     * @default '/api/puck/ai'
     */
    host?: string
    /**
     * Example prompts to show in the chat interface.
     * Users can click these to quickly send common prompts.
     */
    examplePrompts?: AiExamplePrompt[]
  }

  /**
   * Example prompts from plugin config.
   * These are merged with aiOptions.examplePrompts if both are provided.
   * Typically set automatically by PuckEditorView from plugin config.
   */
  aiExamplePrompts?: AiExamplePrompt[]

  /**
   * Whether the puck-ai-prompts collection is enabled.
   * When true, the prompt editor plugin is added to the plugin rail.
   * Typically set automatically by PuckEditorView from plugin config.
   */
  hasPromptsCollection?: boolean

  /**
   * Whether the puck-ai-context collection is enabled.
   * When true, the context editor plugin is added to the plugin rail.
   * Typically set automatically by PuckEditorView from plugin config.
   */
  hasContextCollection?: boolean

  /**
   * Custom component AI instructions to override or extend defaults.
   * When AI is enabled, built-in component instructions are auto-applied.
   * Use this to customize instructions for your brand/use case.
   * Typically set automatically by PuckEditorView from plugin config.
   */
  aiComponentInstructions?: ComponentAiOverrides

  /**
   * Enable experimental full screen canvas mode.
   * When enabled, the canvas takes up the full viewport with a floating viewport switcher.
   * This is an experimental Puck feature.
   * @default false
   */
  experimentalFullScreenCanvas?: boolean

  // Dark mode props

  /**
   * Auto-detect dark mode from PayloadCMS admin.
   * When true (default), dark mode CSS is automatically injected when Payload is in dark mode.
   * Set to false to disable automatic dark mode detection.
   * @default true
   */
  autoDetectDarkMode?: boolean

  /**
   * Show the preview dark mode toggle near the viewport switcher.
   * Allows toggling the preview iframe between light/dark modes independently.
   * @default true
   */
  showPreviewDarkModeToggle?: boolean

  /**
   * Initial state for the preview dark mode toggle.
   * Only used when showPreviewDarkModeToggle is true.
   * @default false (light mode)
   */
  initialPreviewDarkMode?: boolean
}

/**
 * Puck Editor - The primary editor component
 *
 * A full-featured visual page builder with:
 * - Save draft and publish functionality
 * - Unsaved changes tracking with beforeunload warning
 * - Interactive/Edit mode toggle
 * - Theme-aware preview backgrounds
 * - Responsive viewport switching
 * - Optional page-tree integration (folder-based URL structure)
 *
 * @example Basic usage
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
 *       apiEndpoint="/api/puck/pages"
 *       backUrl="/admin/pages"
 *     />
 *   )
 * }
 * ```
 *
 * @example With page-tree integration
 * ```tsx
 * <PuckEditor
 *   pageId={page.id}
 *   initialData={page.puckData}
 *   config={editorConfig}
 *   pageTitle={page.title}
 *   pageSlug={page.slug}
 *   apiEndpoint="/api/puck/pages"
 *   hasPageTree={true}
 *   folder={page.folder}
 *   pageSegment={page.pageSegment}
 * />
 * ```
 */
export function PuckEditor({
  pageId,
  initialData,
  config: configProp,
  pageTitle,
  pageSlug,
  apiEndpoint,
  backUrl,
  previewUrl,
  previewUrlPrefix,
  enableViewports,
  plugins,
  layouts: layoutsProp,
  layoutStyles,
  layoutKey,
  headerActionsStart,
  headerActionsEnd,
  overrides,
  onSaveSuccess,
  onSaveError,
  onChange,
  initialStatus,
  theme: themeProp,
  // Page-tree props
  hasPageTree = false,
  folder,
  pageSegment,
  // Editor iframe styling props
  editorStylesheets: editorStylesheetsProp,
  editorCss: editorCssProp,
  // AI integration props
  enableAi = false,
  aiOptions,
  aiExamplePrompts,
  hasPromptsCollection = false,
  hasContextCollection = false,
  aiComponentInstructions,
  experimentalFullScreenCanvas = false,
  // Dark mode props
  autoDetectDarkMode = true,
  showPreviewDarkModeToggle = true,
  initialPreviewDarkMode = false,
}: PuckEditorProps) {
  // Get config from context as fallback
  const {
    config: configFromContext,
    layouts: layoutsFromContext,
    theme: themeFromContext,
    plugins: pluginsFromContext,
    editorStylesheets: editorStylesheetsFromContext,
    editorCss: editorCssFromContext,
  } = usePuckConfig()

  // Use prop config if provided, otherwise fall back to context
  const baseConfig = configProp || configFromContext
  const theme = themeProp || themeFromContext

  // Merge plugins from props and context
  // Props take precedence and are added first, context plugins follow
  const mergedPlugins = useMemo(() => {
    // If plugins prop is false, disable all plugins (including context ones)
    if (plugins === false) return false
    // If plugins prop is provided (not undefined), it takes precedence
    // But also include context plugins
    const propPlugins = plugins || []
    const contextPlugins = pluginsFromContext || []
    const combined = [...propPlugins, ...contextPlugins]
    return combined.length > 0 ? combined : undefined
  }, [plugins, pluginsFromContext])

  // Props take precedence over context for editor stylesheets
  const editorStylesheets = editorStylesheetsProp || editorStylesheetsFromContext
  const editorCss = editorCssProp || editorCssFromContext

  // Merge layouts from props and context
  // Props may have metadata (value, label, editorBackground) but no React components
  // Context may have React components (header, footer) that can't be serialized through props
  // Merge by matching on 'value', combining properties, preferring context for components
  const layouts = useMemo(() => {
    // If no layouts from either source, return undefined
    if (!layoutsProp && !layoutsFromContext) return undefined
    // If only one source, use it
    if (!layoutsProp) return layoutsFromContext
    if (!layoutsFromContext) return layoutsProp

    // Merge: for each prop layout, find matching context layout and combine
    return layoutsProp.map((propLayout) => {
      const contextLayout = layoutsFromContext.find((c) => c.value === propLayout.value)
      if (!contextLayout) return propLayout

      // Combine: prop values first, then context values (context provides components)
      return {
        ...propLayout,
        // Context provides React components (these can't be serialized through server props)
        header: propLayout.header || contextLayout.header,
        footer: propLayout.footer || contextLayout.footer,
        // Context may also provide other values not in props
        editorBackground: propLayout.editorBackground || contextLayout.editorBackground,
        editorDarkMode: propLayout.editorDarkMode ?? contextLayout.editorDarkMode,
        stickyHeaderHeight: propLayout.stickyHeaderHeight ?? contextLayout.stickyHeaderHeight,
        styles: propLayout.styles || contextLayout.styles,
      }
    })
  }, [layoutsProp, layoutsFromContext])

  // Conditionally inject page-tree fields and AI config into config
  const finalConfig = useMemo(() => {
    if (!baseConfig) return null

    let config = baseConfig

    // Inject AI component instructions when AI is enabled
    if (enableAi && !hasAiConfig(config)) {
      // Merge comprehensive instructions with user-provided overrides
      const mergedAiConfig = aiComponentInstructions
        ? { ...comprehensiveComponentAiConfig, ...aiComponentInstructions }
        : comprehensiveComponentAiConfig

      config = injectAiConfig(config, mergedAiConfig)
    }

    // Inject page-tree fields if enabled
    if (hasPageTree && !hasPageTreeFields(config)) {
      config = injectPageTreeFields(config)
    }

    return config
  }, [baseConfig, hasPageTree, enableAi, aiComponentInstructions])

  // Merge page-tree initial values into initialData
  const finalInitialData = useMemo(() => {
    if (!hasPageTree) return initialData

    return {
      ...initialData,
      root: {
        ...initialData.root,
        props: {
          ...(initialData.root as any)?.props,
          // Only set if provided and hasPageTree is true
          ...(folder !== undefined && { folder }),
          ...(pageSegment !== undefined && { pageSegment }),
        },
      },
    }
  }, [initialData, hasPageTree, folder, pageSegment])

  // Show error if no config available
  if (!finalConfig) {
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
            Either pass <code style={{ backgroundColor: 'var(--theme-elevation-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>config</code> prop directly, or wrap your application with{' '}
            <code style={{ backgroundColor: 'var(--theme-elevation-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>PuckConfigProvider</code>
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
{`// Option 1: Pass config directly
<PuckEditor config={editorConfig} ... />

// Option 2: Use context provider
<PuckConfigProvider config={editorConfig}>
  <PuckEditor ... />
</PuckConfigProvider>`}
          </pre>
        </div>
      </div>
    )
  }

  // Merge example prompts from plugin config and aiOptions prop
  const mergedAiOptions = useMemo(() => {
    if (!enableAi) return undefined

    const mergedPrompts = [
      ...(aiExamplePrompts || []),
      ...(aiOptions?.examplePrompts || []),
    ]

    return {
      host: aiOptions?.host || '/api/puck/ai',
      examplePrompts: mergedPrompts.length > 0 ? mergedPrompts : undefined,
    }
  }, [enableAi, aiExamplePrompts, aiOptions])

  // Compute preview URL from prefix (for Server Component compatibility)
  // previewUrlPrefix takes precedence if provided
  const finalPreviewUrl = useMemo(() => {
    if (previewUrlPrefix) {
      // Convert prefix to a function that builds the full URL
      return (slug: string) => (slug ? `${previewUrlPrefix}/${slug}` : previewUrlPrefix)
    }
    return previewUrl
  }, [previewUrlPrefix, previewUrl])

  return (
    <PuckEditorImpl
      pageId={pageId}
      initialData={finalInitialData}
      config={finalConfig}
      pageTitle={pageTitle}
      pageSlug={pageSlug}
      apiEndpoint={apiEndpoint}
      backUrl={backUrl}
      previewUrl={finalPreviewUrl}
      enableViewports={enableViewports}
      plugins={mergedPlugins}
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
      editorStylesheets={editorStylesheets}
      editorCss={editorCss}
      enableAi={enableAi}
      aiOptions={mergedAiOptions}
      hasPromptsCollection={hasPromptsCollection}
      hasContextCollection={hasContextCollection}
      experimentalFullScreenCanvas={experimentalFullScreenCanvas}
      autoDetectDarkMode={autoDetectDarkMode}
      showPreviewDarkModeToggle={showPreviewDarkModeToggle}
      initialPreviewDarkMode={initialPreviewDarkMode}
    />
  )
}
