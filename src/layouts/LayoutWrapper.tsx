/**
 * Layout Wrapper Component
 *
 * Wraps page content with layout-specific styling and structure.
 */

import type { ReactNode, CSSProperties } from 'react'
import type { LayoutDefinition } from './types'
import { backgroundValueToCSS, type BackgroundValue } from '../fields/shared'

/**
 * Page-level overrides for layout settings
 */
export interface PageOverrides {
  /** Override header visibility: 'default' uses layout, 'show'/'hide' overrides */
  showHeader?: 'default' | 'show' | 'hide'
  /** Override footer visibility: 'default' uses layout, 'show'/'hide' overrides */
  showFooter?: 'default' | 'show' | 'hide'
  /** Page background (overrides any layout background) */
  background?: BackgroundValue | null
  /** Page max width: 'default' uses layout, otherwise uses the value */
  maxWidth?: string
}

export interface LayoutWrapperProps {
  children: ReactNode
  layout?: LayoutDefinition
  className?: string
  /** Page-level overrides from Puck root props */
  overrides?: PageOverrides
}

/**
 * Styles for sticky footer layout - pushes footer to bottom of viewport
 */
const stickyFooterContainerStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}

const stickyFooterMainStyle: CSSProperties = {
  flex: 1,
}

/**
 * Applies layout configuration to page content
 */
export function LayoutWrapper({ children, layout, className, overrides }: LayoutWrapperProps) {
  // No layout - render children directly (but still apply background if set)
  if (!layout) {
    if (overrides?.background) {
      const bgStyles = backgroundValueToCSS(overrides.background)
      return <div style={{ minHeight: '100vh', ...bgStyles }}>{children}</div>
    }
    return <>{children}</>
  }

  // Get header/footer components
  const Header = layout.header
  const Footer = layout.footer

  // Determine header/footer visibility based on overrides
  const shouldShowHeader =
    overrides?.showHeader === 'hide'
      ? false
      : overrides?.showHeader === 'show'
        ? true
        : !!Header

  const shouldShowFooter =
    overrides?.showFooter === 'hide'
      ? false
      : overrides?.showFooter === 'show'
        ? true
        : !!Footer

  // Sticky footer is enabled by default - check for explicit false
  const useStickyFooter = layout.stickyFooter !== false

  // Calculate main content style with sticky header offset
  const mainStyle: CSSProperties = {
    ...(layout.stickyHeaderHeight && shouldShowHeader ? { paddingTop: layout.stickyHeaderHeight } : {}),
    ...(useStickyFooter ? stickyFooterMainStyle : {}),
  }

  // Build outer container background styles
  // Page override takes precedence, then falls back to layout wrapper background
  const wrapperStyles = layout.styles?.wrapper
  const outerBackgroundStyles: CSSProperties = overrides?.background
    ? backgroundValueToCSS(overrides.background)
    : {
        ...(wrapperStyles?.background !== undefined
          ? { background: wrapperStyles.background }
          : {}),
        ...(wrapperStyles?.backgroundAttachment !== undefined
          ? { backgroundAttachment: wrapperStyles.backgroundAttachment }
          : {}),
      }

  // Get effective max width (override or layout default)
  const effectiveMaxWidth =
    overrides?.maxWidth && overrides.maxWidth !== 'default'
      ? overrides.maxWidth
      : layout.maxWidth

  // Helper to wrap content with sticky footer container if needed
  const wrapWithStickyFooter = (content: ReactNode) => {
    if (useStickyFooter) {
      return (
        <div style={{ ...stickyFooterContainerStyle, ...outerBackgroundStyles }}>
          {content}
        </div>
      )
    }
    // Non-sticky-footer: still apply background if set
    const hasBackground = Object.keys(outerBackgroundStyles).length > 0
    if (hasBackground) {
      return <div style={{ minHeight: '100vh', ...outerBackgroundStyles }}>{content}</div>
    }
    return <>{content}</>
  }

  // Custom wrapper component takes precedence
  if (layout.wrapper) {
    const CustomWrapper = layout.wrapper
    return wrapWithStickyFooter(
      <>
        {shouldShowHeader && Header && <Header />}
        <main style={Object.keys(mainStyle).length > 0 ? mainStyle : undefined}>
          <CustomWrapper>{children}</CustomWrapper>
        </main>
        {shouldShowFooter && Footer && <Footer />}
      </>
    )
  }

  // Build wrapper styles
  const wrapperStyle: CSSProperties = {
    ...layout.styles?.wrapper,
  }

  // Build container styles with effective max width
  const containerStyle: CSSProperties = {
    ...(effectiveMaxWidth && !layout.fullWidth ? { maxWidth: effectiveMaxWidth } : {}),
    ...layout.styles?.container,
  }

  // Build content styles
  const contentStyle: CSSProperties = {
    ...layout.styles?.content,
  }

  // Build data attributes
  const dataAttrs: Record<string, string> = {
    'data-layout': layout.value,
    ...layout.dataAttributes,
  }

  // For landing/full-width layouts, render without container constraints
  if (layout.fullWidth) {
    return wrapWithStickyFooter(
      <>
        {shouldShowHeader && Header && <Header />}
        <main
          className={[layout.classes?.wrapper, className].filter(Boolean).join(' ') || undefined}
          style={{
            ...mainStyle,
            ...(Object.keys(wrapperStyle).length > 0 ? wrapperStyle : {}),
          }}
          {...dataAttrs}
        >
          {children}
        </main>
        {shouldShowFooter && Footer && <Footer />}
      </>
    )
  }

  // Standard layout with container
  return wrapWithStickyFooter(
    <>
      {shouldShowHeader && Header && <Header />}
      <main
        className={layout.classes?.wrapper || undefined}
        style={{
          ...mainStyle,
          ...(Object.keys(wrapperStyle).length > 0 ? wrapperStyle : {}),
        }}
        {...dataAttrs}
      >
        <div
          className={[layout.classes?.container, className].filter(Boolean).join(' ') || undefined}
          style={Object.keys(containerStyle).length > 0 ? containerStyle : undefined}
        >
          <div
            className={layout.classes?.content || undefined}
            style={Object.keys(contentStyle).length > 0 ? contentStyle : undefined}
          >
            {children}
          </div>
        </div>
      </main>
      {shouldShowFooter && Footer && <Footer />}
    </>
  )
}
