/**
 * Grid Component - Server-safe Puck Configuration
 *
 * CSS Grid layout following official Puck demo patterns.
 * Responsive: stacks on mobile (flex column), grid on desktop (md+).
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * This is a server-safe version with NO fields property (only slot for content).
 * For the full editor version with fields, use Grid.tsx
 *
 * Responsive Controls:
 * - dimensions: Different dimensions at different breakpoints
 * - customPadding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import type { ComponentConfig } from '@puckeditor/core'
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
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'

// Simple ID generator for server-side rendering
let idCounter = 0
function generateUniqueId(): string {
  return `g${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export type GridSemanticElement = 'div' | 'ul' | 'ol'

export interface GridProps {
  content: unknown
  semanticElement: GridSemanticElement
  numColumns: number
  gap: number
  // Background
  background: BackgroundValue | null
  // Advanced custom options
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
  // Responsive visibility
  visibility: VisibilityValue | null
}

const defaultProps: GridProps = {
  content: [],
  semanticElement: 'div',
  numColumns: 3,
  gap: 24,
  background: null,
  customPadding: null,
  dimensions: null,
  border: null,
  margin: null,
  animation: null,
  visibility: null,
}

export const GridConfig: ComponentConfig = {
  label: 'Grid',
  fields: {
    content: { type: 'slot' },
  },
  defaultProps,
  render: ({
    content: Content,
    semanticElement = 'div',
    numColumns,
    gap,
    background,
    customPadding,
    dimensions,
    border,
    margin,
    animation,
    visibility,
  }) => {
    // Dynamic element based on semanticElement prop
    const Wrapper = semanticElement as React.ElementType

    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const wrapperClass = `puck-grid-${uniqueId}`
    const contentClass = `puck-grid-content-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Generate styles from BackgroundValue
    const backgroundStyles = backgroundValueToCSS(background)

    // Build wrapper styles
    const wrapperStyles: React.CSSProperties = {
      ...backgroundStyles,
    }

    // Add padding with responsive support
    const paddingResult = responsiveValueToCSS(
      customPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, paddingResult.baseStyles)
    if (paddingResult.mediaQueryCSS) {
      mediaQueries.push(paddingResult.mediaQueryCSS)
    }

    // Add border if set
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) {
      Object.assign(wrapperStyles, borderStyles)
    }

    // Add margin with responsive support
    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      wrapperClass
    )
    Object.assign(wrapperStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) {
      mediaQueries.push(marginResult.mediaQueryCSS)
    }

    // Use dimensions with responsive support
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      contentClass
    )

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    // Tailwind classes for responsive grid: flex column on mobile, grid on md+
    const contentClasses = cn(
      'flex flex-col w-full',
      'md:grid',
      contentClass,
    )

    // Dynamic styles that need inline (user-controlled values: gap, columns)
    const contentStyles: React.CSSProperties = {
      gap,
      ...dimensionsResult.baseStyles,
    }
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    // Grid template columns must be inline since numColumns is dynamic
    const gridStyles: React.CSSProperties = {
      ...contentStyles,
      '--grid-cols': numColumns,
    } as React.CSSProperties

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Type assertion for Puck slot content - cast to any to avoid complex React type issues
    const ContentSlot = Content as any

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <Wrapper className={wrapperClass} style={wrapperStyles}>
          <ContentSlot className={contentClasses} style={gridStyles} />
          <style>{`
            @media (min-width: 768px) {
              .flex.md\\:grid {
                grid-template-columns: repeat(var(--grid-cols), 1fr);
              }
            }
          `}</style>
        </Wrapper>
      </AnimatedWrapper>
    )
  },
}
