/**
 * Container Component - Server-safe Puck Configuration
 *
 * Content wrapper with max-width and background options.
 * Uses Puck's slot system for nesting other components.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * This is a server-safe version with NO fields property (only slot for content).
 * For the full editor version with fields, use Container.tsx
 *
 * Responsive Controls:
 * - dimensions: Different max-width at different breakpoints
 * - customPadding: Different outer padding at different breakpoints
 * - innerPadding: Different inner padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import type { ComponentConfig } from '@measured/puck'
import {
  cn,
  dimensionsValueToCSS,
  borderValueToCSS,
  paddingValueToCSS,
  marginValueToCSS,
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
  return `c${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export interface ContainerProps {
  content: unknown
  // Outer (section-level) options
  background: BackgroundValue | null
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  border: BorderValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
  // Inner (content container) options
  innerBackground: BackgroundValue | null
  innerPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  innerBorder: BorderValue | null
  // Responsive visibility
  visibility: VisibilityValue | null
}

const defaultProps: ContainerProps = {
  content: [],
  background: null,
  customPadding: null,
  dimensions: null,
  border: null,
  margin: null,
  animation: null,
  innerBackground: null,
  innerPadding: null,
  innerBorder: null,
  visibility: null,
}

export const ContainerConfig: ComponentConfig = {
  label: 'Container',
  fields: {
    content: { type: 'slot' },
  },
  defaultProps,
  render: ({
    content: Content,
    background,
    customPadding,
    dimensions,
    border,
    margin,
    animation,
    innerBackground,
    innerPadding,
    innerBorder,
    visibility,
  }) => {
    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
    const outerClass = `puck-container-outer-${uniqueId}`
    const innerClass = `puck-container-inner-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Generate outer wrapper styles from BackgroundValue
    const outerBackgroundStyles = backgroundValueToCSS(background)
    const outerStyles: React.CSSProperties = {
      ...outerBackgroundStyles,
    }

    // Add outer padding with responsive support
    const outerPaddingResult = responsiveValueToCSS(
      customPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      outerClass
    )
    Object.assign(outerStyles, outerPaddingResult.baseStyles)
    if (outerPaddingResult.mediaQueryCSS) {
      mediaQueries.push(outerPaddingResult.mediaQueryCSS)
    }

    // Add outer border if set
    const outerBorderStyles = borderValueToCSS(border)
    if (outerBorderStyles) {
      Object.assign(outerStyles, outerBorderStyles)
    }

    // Add margin with responsive support
    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      outerClass
    )
    Object.assign(outerStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) {
      mediaQueries.push(marginResult.mediaQueryCSS)
    }

    // Generate inner container styles
    const innerBackgroundStyles = backgroundValueToCSS(innerBackground)
    const innerStyles: React.CSSProperties = {
      ...innerBackgroundStyles,
    }

    // Dimensions with responsive support
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      innerClass
    )
    Object.assign(innerStyles, dimensionsResult.baseStyles)
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    // Inner padding with responsive support
    const innerPaddingResult = responsiveValueToCSS(
      innerPadding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      innerClass
    )
    Object.assign(innerStyles, innerPaddingResult.baseStyles)
    if (innerPaddingResult.mediaQueryCSS) {
      mediaQueries.push(innerPaddingResult.mediaQueryCSS)
    }

    // Inner border
    const innerBorderStyles = borderValueToCSS(innerBorder)
    if (innerBorderStyles) {
      Object.assign(innerStyles, innerBorderStyles)
    }

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, outerClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    const contentClasses = cn('px-4', innerClass)

    // Check if we have any inner styling
    const hasInnerStyles = Object.keys(innerStyles).length > 0

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Type assertion for Puck slot content - cast to any to avoid complex React type issues
    const ContentSlot = Content as any

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div className={outerClass} style={outerStyles}>
          {hasInnerStyles ? (
            <div className={contentClasses} style={innerStyles}>
              <ContentSlot />
            </div>
          ) : (
            <ContentSlot className={contentClasses} style={innerStyles} />
          )}
        </div>
      </AnimatedWrapper>
    )
  },
}
