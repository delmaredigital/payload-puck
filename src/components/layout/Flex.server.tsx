/**
 * Flex Component - Server-safe Puck Configuration
 *
 * Flexbox layout following official Puck demo patterns.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * This is a server-safe version with NO fields property (only slot for content).
 * For the full editor version with fields, use Flex.tsx
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
  justifyContentMap,
  alignItemsMap,
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
  return `f${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// Inline type definitions to avoid importing from client-only FlexAlignmentField
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch'

// Tailwind class mappings for flex properties
const flexDirectionMap: Record<string, string> = {
  row: 'flex-row',
  column: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'column-reverse': 'flex-col-reverse',
}

const flexWrapMap: Record<string, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
}

export interface FlexProps {
  content: unknown
  direction: 'row' | 'column'
  justifyContent: JustifyContent | null
  alignItems: AlignItems | null
  gap: number
  wrap: 'wrap' | 'nowrap'
  // Background
  background: BackgroundValue | null
  // Advanced custom options
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  animation: AnimationValue | null
  // Responsive visibility
  visibility: VisibilityValue | null
}

const defaultProps: FlexProps = {
  content: [],
  direction: 'row',
  justifyContent: null,
  alignItems: null,
  gap: 24,
  wrap: 'wrap',
  background: null,
  customPadding: null,
  margin: null,
  dimensions: null,
  border: null,
  animation: null,
  visibility: null,
}

export const FlexConfig: ComponentConfig = {
  label: 'Flex',
  fields: {
    content: { type: 'slot' },
  },
  defaultProps,
  render: ({
    content: Content,
    direction,
    justifyContent,
    alignItems,
    gap,
    wrap,
    background,
    customPadding,
    margin,
    dimensions,
    border,
    animation,
    visibility,
  }) => {
    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const wrapperClass = `puck-flex-${uniqueId}`
    const contentClass = `puck-flex-content-${uniqueId}`

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

    // Apply margin with responsive support
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

    // Build Tailwind classes for flex layout
    // [&>*]:min-w-0 prevents flex children from overflowing (CSS best practice)
    const contentClasses = cn(
      'flex w-full min-h-[50px]',
      flexDirectionMap[direction],
      justifyContent && justifyContentMap[justifyContent],
      alignItems && alignItemsMap[alignItems],
      flexWrapMap[wrap],
      '[&>*]:min-w-0',
      contentClass,
    )

    // Dynamic styles that need inline (user-controlled values)
    const contentStyles: React.CSSProperties = {
      gap,
      ...dimensionsResult.baseStyles,
    }
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Type assertion for Puck slot content - cast to any to avoid complex React type issues
    const ContentSlot = Content as any

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div className={wrapperClass} style={wrapperStyles}>
          <ContentSlot className={contentClasses} style={contentStyles} />
        </div>
      </AnimatedWrapper>
    )
  },
}
