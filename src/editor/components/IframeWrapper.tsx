'use client'

import { memo, useEffect, useMemo, type ReactNode, type ComponentType } from 'react'
import { createUsePuck } from '@measured/puck'
import type { LayoutDefinition } from '../../layouts'
import { backgroundValueToCSS, type BackgroundValue } from '../../fields/shared'

// Create usePuck hook for accessing editor state
const usePuck = createUsePuck()

/**
 * Layout style configuration for theme-aware preview
 * @deprecated Use LayoutDefinition with editorBackground and editorDarkMode instead
 */
export interface LayoutStyle {
  /**
   * CSS background value (color, gradient, etc.)
   */
  background: string
  /**
   * Whether this layout uses dark mode styling
   */
  isDark: boolean
  /**
   * Header component to render above the page content in the editor preview
   */
  header?: ComponentType
  /**
   * Footer component to render below the page content in the editor preview
   */
  footer?: ComponentType
}

/**
 * Internal layout config used by the iframe wrapper
 */
interface InternalLayoutConfig {
  background: string
  isDark: boolean
  header?: ComponentType
  footer?: ComponentType
  stickyHeaderHeight?: number
}

export interface IframeWrapperProps {
  children: ReactNode
  /**
   * The iframe document to apply styles to
   */
  document?: Document
  /**
   * Layout definitions - the primary way to configure layouts.
   * Reads header, footer, editorBackground, and editorDarkMode from each layout.
   */
  layouts?: LayoutDefinition[]
  /**
   * Layout style configurations keyed by layout value
   * @deprecated Use `layouts` prop instead
   */
  layoutStyles?: Record<string, LayoutStyle>
  /**
   * Key in root.props to read layout value from
   * @default 'pageLayout'
   */
  layoutKey?: string
  /**
   * Default layout to use if none specified
   * @default 'default'
   */
  defaultLayout?: string
}

/**
 * Default layout config
 */
const DEFAULT_LAYOUT_CONFIG: InternalLayoutConfig = {
  background: '#ffffff',
  isDark: false,
}

/**
 * Theme-aware iframe wrapper component
 *
 * Uses usePuck to read the pageLayout from root.props and applies
 * appropriate background and theme class to the preview iframe.
 *
 * @example
 * ```tsx
 * // Using layouts (recommended)
 * const overrides = {
 *   iframe: ({ children, document }) => (
 *     <IframeWrapper
 *       document={document}
 *       layouts={[
 *         { value: 'default', label: 'Default', header: Header, footer: Footer },
 *         { value: 'landing', label: 'Landing', editorBackground: '#f8fafc' },
 *       ]}
 *     >
 *       {children}
 *     </IframeWrapper>
 *   ),
 * }
 * ```
 */
export const IframeWrapper = memo(function IframeWrapper({
  children,
  document: iframeDoc,
  layouts,
  layoutStyles,
  layoutKey = 'pageLayout',
  defaultLayout = 'default',
}: IframeWrapperProps) {
  const appState = usePuck((s) => s.appState)

  // Check if we're in interactive mode (links should be clickable)
  const isInteractive = appState.ui.previewMode === 'interactive'

  // Read layout value and page-level overrides from root props
  const rootProps = appState.data.root?.props as Record<string, unknown> | undefined
  const layoutValue = (rootProps?.[layoutKey] as string) || defaultLayout

  // Page-level overrides
  const showHeaderOverride = rootProps?.showHeader as 'default' | 'show' | 'hide' | undefined
  const showFooterOverride = rootProps?.showFooter as 'default' | 'show' | 'hide' | undefined
  const pageBackground = rootProps?.pageBackground as BackgroundValue | null | undefined

  // Convert layouts array to config map, or use deprecated layoutStyles
  const layoutConfigMap = useMemo<Record<string, InternalLayoutConfig>>(() => {
    // If layouts prop provided, convert to internal format
    if (layouts) {
      const map: Record<string, InternalLayoutConfig> = {}
      for (const layout of layouts) {
        map[layout.value] = {
          background: layout.editorBackground ?? '#ffffff',
          isDark: layout.editorDarkMode ?? false,
          header: layout.header,
          footer: layout.footer,
          stickyHeaderHeight: layout.stickyHeaderHeight,
        }
      }
      return map
    }

    // Fall back to deprecated layoutStyles if provided
    if (layoutStyles) {
      return layoutStyles
    }

    // Default fallback
    return { default: DEFAULT_LAYOUT_CONFIG }
  }, [layouts, layoutStyles])

  // Get config for current layout
  const layoutConfig = layoutConfigMap[layoutValue] || layoutConfigMap[defaultLayout] || DEFAULT_LAYOUT_CONFIG

  useEffect(() => {
    if (!iframeDoc) return

    const body = iframeDoc.body
    const html = iframeDoc.documentElement

    // Apply background - page-level override takes precedence
    if (pageBackground) {
      const bgStyles = backgroundValueToCSS(pageBackground)
      // Clear previous background styles
      body.style.background = ''
      body.style.backgroundColor = ''
      body.style.backgroundImage = ''
      // Apply new styles
      Object.assign(body.style, bgStyles)
    } else {
      body.style.background = layoutConfig.background
    }
    body.style.backgroundAttachment = 'fixed'
    body.style.minHeight = '100vh'

    // Apply theme class for dark/light mode
    if (layoutConfig.isDark) {
      html.classList.add('dark')
      html.classList.remove('light')
      body.style.color = '#ffffff'
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      body.style.color = '#1f2937' // gray-800
    }

    // Inject richtext-output styles into the iframe for proper heading/list rendering
    const RICHTEXT_STYLES_ID = 'puck-richtext-output-styles'
    if (!iframeDoc.getElementById(RICHTEXT_STYLES_ID)) {
      const style = iframeDoc.createElement('style')
      style.id = RICHTEXT_STYLES_ID
      style.textContent = `
        /* Rich Text Output Styles for Puck Preview */
        .richtext-output {
          font-size: 1.125rem;
          line-height: 1.75;
          color: inherit;
        }
        .richtext-output h1 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          font-size: 2.25rem;
          line-height: 1.2;
        }
        .richtext-output h1:first-child { margin-top: 0; }
        .richtext-output h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          font-size: 1.875rem;
          line-height: 1.25;
        }
        .richtext-output h2:first-child { margin-top: 0; }
        .richtext-output h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          font-size: 1.5rem;
          line-height: 1.3;
        }
        .richtext-output h3:first-child { margin-top: 0; }
        .richtext-output h4 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          font-size: 1.25rem;
          line-height: 1.35;
        }
        .richtext-output h4:first-child { margin-top: 0; }
        .richtext-output p {
          margin-bottom: 1.25rem;
        }
        .richtext-output p:last-child { margin-bottom: 0; }
        .richtext-output ul {
          margin-bottom: 1.25rem;
          padding-left: 2rem;
          list-style-type: disc !important;
        }
        .richtext-output ol {
          margin-bottom: 1.25rem;
          padding-left: 2rem;
          list-style-type: decimal !important;
        }
        .richtext-output li {
          margin-bottom: 0.5rem;
          display: list-item !important;
        }
        .richtext-output li::marker {
          color: currentColor;
        }
        .richtext-output ul ul,
        .richtext-output ol ul {
          list-style-type: circle !important;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .richtext-output ul ul ul,
        .richtext-output ol ul ul {
          list-style-type: square !important;
        }
        .richtext-output ol ol,
        .richtext-output ul ol {
          list-style-type: lower-alpha !important;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .richtext-output blockquote {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          border-left: 4px solid #e5e7eb;
          font-style: italic;
        }
        .richtext-output a {
          color: #2563eb;
          text-decoration: underline;
        }
        .richtext-output a:hover { opacity: 0.8; }
        .richtext-output code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .richtext-output mark {
          background-color: #fef08a;
          padding: 0.125rem 0.25rem;
          border-radius: 0.125rem;
        }
        .richtext-output s,
        .richtext-output strike {
          text-decoration: line-through;
        }
        @media (max-width: 768px) {
          .richtext-output { font-size: 1rem; }
          .richtext-output h1 { font-size: 1.875rem; }
          .richtext-output h2 { font-size: 1.5rem; }
          .richtext-output h3 { font-size: 1.25rem; }
        }
      `
      iframeDoc.head.appendChild(style)
    }
  }, [iframeDoc, layoutConfig, pageBackground])

  // Get header/footer components from layout config
  const LayoutHeader = layoutConfig.header
  const LayoutFooter = layoutConfig.footer

  // Determine header/footer visibility based on page-level overrides
  // 'default' or undefined = use layout setting
  // 'show' = always show (even if layout doesn't have one - use layout's component)
  // 'hide' = always hide
  const shouldShowHeader =
    showHeaderOverride === 'hide'
      ? false
      : showHeaderOverride === 'show'
        ? !!LayoutHeader
        : !!LayoutHeader

  const shouldShowFooter =
    showFooterOverride === 'hide'
      ? false
      : showFooterOverride === 'show'
        ? !!LayoutFooter
        : !!LayoutFooter

  // If we have header or footer to show, wrap in flex container to ensure proper layout
  if (shouldShowHeader || shouldShowFooter) {
    // Calculate content padding for sticky headers (only if header is actually shown)
    const contentStyle: React.CSSProperties = {
      flex: 1,
      position: 'relative',
      // Add padding-top for sticky headers so content doesn't render behind them
      ...(shouldShowHeader && layoutConfig.stickyHeaderHeight && { paddingTop: layoutConfig.stickyHeaderHeight }),
    }

    // Disable pointer events on header/footer in edit mode to prevent accidental clicks
    const headerFooterStyle: React.CSSProperties = isInteractive
      ? {}
      : { pointerEvents: 'none' }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {shouldShowHeader && LayoutHeader && (
          <div style={headerFooterStyle}>
            <LayoutHeader />
          </div>
        )}
        <div style={contentStyle}>{children}</div>
        {shouldShowFooter && LayoutFooter && (
          <div style={headerFooterStyle}>
            <LayoutFooter />
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
})
