/**
 * Section Component - Server-safe Puck Configuration
 *
 * Full-width section with two-layer architecture:
 * - Section layer (outer): Full-bleed background, border, padding, margin
 * - Content layer (inner): Constrained content area with max-width, background, border, padding
 *
 * This is a server-safe version with minimal fields (only slot for content).
 * For the full editor version with fields, use Section.tsx
 *
 * Responsive Controls:
 * - contentDimensions: Different max-width/min-height at different breakpoints
 * - sectionPadding: Different section padding at different breakpoints
 * - contentPadding: Different content padding at different breakpoints
 * - sectionMargin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import type { ComponentConfig } from '@measured/puck'
import {
  cn,
  dimensionsValueToCSS,
  marginValueToCSS,
  paddingValueToCSS,
  borderValueToCSS,
  backgroundValueToCSS,
  responsiveValueToCSS,
  visibilityValueToCSS,
  type PaddingValue,
  type BorderValue,
  type DimensionsValue,
  type BackgroundValue,
  type AnimationValue,
  type ResponsiveValue,
  type VisibilityValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'

// Simple ID generator for server-side rendering
let idCounter = 0
function generateUniqueId(): string {
  return `s${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// Default content dimensions - 1200px max-width centered
const DEFAULT_CONTENT_DIMENSIONS: DimensionsValue = {
  mode: 'contained',
  alignment: 'center',
  maxWidth: { value: 1200, unit: 'px', enabled: true },
}

// Default content padding with standard horizontal spacing
const DEFAULT_CONTENT_PADDING: PaddingValue = {
  top: 0,
  right: 16,
  bottom: 0,
  left: 16,
  unit: 'px',
  linked: false,
}

export interface SectionProps {
  id: string
  content: unknown
  // Section layer (outer, full-width)
  sectionBackground: BackgroundValue | null
  sectionBorder: BorderValue | null
  sectionPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  sectionMargin: ResponsiveValue<PaddingValue> | PaddingValue | null
  // Content layer (inner, constrained)
  contentDimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  contentBackground: BackgroundValue | null
  contentBorder: BorderValue | null
  contentPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  // Other
  animation: AnimationValue | null
  visibility: VisibilityValue | null
}

const defaultProps: SectionProps = {
  id: '',
  content: [],
  // Section layer defaults
  sectionBackground: null,
  sectionBorder: null,
  sectionPadding: null,
  sectionMargin: null,
  // Content layer defaults - 1200px max-width so two-layer design is immediately visible
  contentDimensions: { xs: DEFAULT_CONTENT_DIMENSIONS },
  contentBackground: null,
  contentBorder: null,
  contentPadding: { xs: DEFAULT_CONTENT_PADDING },
  // Other
  animation: null,
  visibility: null,
}

export const SectionConfig: ComponentConfig = {
  label: 'Section',
  fields: {
    content: { type: 'slot' },
  },
  defaultProps,
  render: ({
    id,
    content: Content,
    sectionBackground,
    sectionBorder,
    sectionPadding,
    sectionMargin,
    contentDimensions,
    contentBackground,
    contentBorder,
    contentPadding,
    animation,
    visibility,
  }) => {
    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const sectionClass = `puck-section-${uniqueId}`
    const contentClass = `puck-section-content-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // === Section layer styles (outer, full-width) ===
    const sectionBackgroundStyles = backgroundValueToCSS(sectionBackground)
    const sectionStyles: React.CSSProperties = {
      ...sectionBackgroundStyles,
    }

    // Section border
    const sectionBorderStyles = borderValueToCSS(sectionBorder)
    if (sectionBorderStyles) {
      Object.assign(sectionStyles, sectionBorderStyles)
    }

    // Section padding with responsive support
    const sectionPaddingResult = responsiveValueToCSS(
      sectionPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      sectionClass
    )
    Object.assign(sectionStyles, sectionPaddingResult.baseStyles)
    if (sectionPaddingResult.mediaQueryCSS) {
      mediaQueries.push(sectionPaddingResult.mediaQueryCSS)
    }

    // Section margin with responsive support
    const sectionMarginResult = responsiveValueToCSS(
      sectionMargin,
      (v) => ({ margin: marginValueToCSS(v) }),
      sectionClass
    )
    Object.assign(sectionStyles, sectionMarginResult.baseStyles)
    if (sectionMarginResult.mediaQueryCSS) {
      mediaQueries.push(sectionMarginResult.mediaQueryCSS)
    }

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, sectionClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    // === Content layer styles (inner, constrained) ===
    const contentBackgroundStyles = backgroundValueToCSS(contentBackground)
    const contentStyles: React.CSSProperties = {
      ...contentBackgroundStyles,
    }

    // Content dimensions with responsive support
    const contentDimensionsResult = responsiveValueToCSS(
      contentDimensions,
      dimensionsValueToCSS,
      contentClass
    )
    Object.assign(contentStyles, contentDimensionsResult.baseStyles)
    if (contentDimensionsResult.mediaQueryCSS) {
      mediaQueries.push(contentDimensionsResult.mediaQueryCSS)
    }

    // Check if minHeight is set - if so, we need flex layout to make slot expand
    const hasMinHeight = (() => {
      if (!contentDimensions) return false
      // Check if it's a responsive value
      if (typeof contentDimensions === 'object' && 'xs' in contentDimensions) {
        const responsiveDims = contentDimensions as ResponsiveValue<DimensionsValue>
        return Object.values(responsiveDims).some((v) => {
          if (!v || typeof v !== 'object') return false
          const dim = v as DimensionsValue
          return dim.minHeight?.enabled && dim.minHeight?.value > 0
        })
      }
      // Non-responsive value
      const dim = contentDimensions as DimensionsValue
      return dim.minHeight?.enabled && dim.minHeight?.value > 0
    })()

    // Add flex layout when minHeight is set to make content stretch
    if (hasMinHeight) {
      contentStyles.display = 'flex'
      contentStyles.flexDirection = 'column'
    }

    // Content border
    const contentBorderStyles = borderValueToCSS(contentBorder)
    if (contentBorderStyles) {
      Object.assign(contentStyles, contentBorderStyles)
    }

    // Content padding with responsive support
    const contentPaddingResult = responsiveValueToCSS(
      contentPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      contentClass
    )
    Object.assign(contentStyles, contentPaddingResult.baseStyles)
    if (contentPaddingResult.mediaQueryCSS) {
      mediaQueries.push(contentPaddingResult.mediaQueryCSS)
    }

    const sectionClasses = cn('relative w-full', sectionClass)
    const contentClasses = cn('relative z-10', contentClass)

    // Check if we have any content styling
    const hasContentStyles = Object.keys(contentStyles).length > 0

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Type assertion for Puck slot content
    const ContentSlot = Content as any

    // When minHeight is set, wrap Content to ensure slot expands
    const renderContent = () => {
      if (hasMinHeight) {
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ContentSlot style={{ flex: 1 }} />
          </div>
        )
      }
      return <ContentSlot />
    }

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <section
          id={id || undefined}
          className={sectionClasses}
          style={sectionStyles}
        >
          {hasContentStyles ? (
            <div className={contentClasses} style={contentStyles}>
              {renderContent()}
            </div>
          ) : (
            <ContentSlot className={contentClasses} />
          )}
        </section>
      </AnimatedWrapper>
    )
  },
}
