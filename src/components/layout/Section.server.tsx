/**
 * Section Component - Server-safe Puck Configuration
 *
 * Full-width section with background options and content slot.
 * Used as a top-level page section wrapper.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * This is a server-safe version with NO fields property.
 * For the full editor version with fields, use Section.tsx
 *
 * Responsive Controls:
 * - dimensions: Different dimensions at different breakpoints
 * - customPadding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
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

export interface SectionProps {
  id: string
  content: unknown
  // Background
  background: BackgroundValue | null
  fullWidth: boolean
  // Advanced custom options
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
  // Responsive visibility
  visibility: VisibilityValue | null
}

const defaultProps: SectionProps = {
  id: '',
  content: [],
  background: null,
  fullWidth: false,
  customPadding: null,
  dimensions: null,
  border: null,
  margin: null,
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
    background,
    fullWidth,
    customPadding,
    dimensions,
    border,
    margin,
    animation,
    visibility,
  }) => {
    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const sectionClass = `puck-section-${uniqueId}`
    const contentClass = `puck-section-content-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Generate styles from BackgroundValue
    const backgroundStyles = backgroundValueToCSS(background)

    // Build section styles
    const sectionStyles: React.CSSProperties = {
      ...backgroundStyles,
    }

    // Add padding with responsive support
    const paddingResult = responsiveValueToCSS(
      customPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      sectionClass
    )
    Object.assign(sectionStyles, paddingResult.baseStyles)
    if (paddingResult.mediaQueryCSS) {
      mediaQueries.push(paddingResult.mediaQueryCSS)
    }

    // Add border if set
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) {
      Object.assign(sectionStyles, borderStyles)
    }

    // Add margin with responsive support
    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      sectionClass
    )
    Object.assign(sectionStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) {
      mediaQueries.push(marginResult.mediaQueryCSS)
    }

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, sectionClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    const sectionClasses = cn('relative w-full', sectionClass)

    // Use dimensions with responsive support
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      contentClass
    )
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    const contentClasses = cn(
      'relative z-10',
      // Only apply preset content width if no dimensions set
      !dimensions && !fullWidth && 'max-w-[1200px] mx-auto px-4',
      contentClass,
    )

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Type assertion for Puck slot content - cast to any to avoid complex React type issues
    const ContentSlot = Content as any

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <section
          id={id || undefined}
          className={sectionClasses}
          style={sectionStyles}
        >
          <ContentSlot className={contentClasses} style={dimensionsResult.baseStyles} />
        </section>
      </AnimatedWrapper>
    )
  },
}
