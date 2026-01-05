/**
 * Container Component - Puck Configuration
 *
 * Content wrapper with max-width and background options.
 * Uses Puck's slot system for nesting other components.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * Supports both preset options and advanced custom styling:
 * - Outer (Section): background, customPadding, border (applies to full-width wrapper)
 * - Inner (Content): innerBackground, innerPadding, innerBorder (applies to max-width container)
 *
 * Responsive Controls:
 * - dimensions: Different max-width at different breakpoints
 * - customPadding: Different outer padding at different breakpoints
 * - innerPadding: Different inner padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import { useId } from 'react'
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
import { createPaddingField } from '../../fields/PaddingField'
import { createBorderField } from '../../fields/BorderField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createMarginField } from '../../fields/MarginField'
import { createResetField } from '../../fields/ResetField'
import { createBackgroundField } from '../../fields/BackgroundField'
import { createAnimationField } from '../../fields/AnimationField'
import { createResponsiveField } from '../../fields/ResponsiveField'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField'

// Default dimensions for responsive field
const DEFAULT_DIMENSIONS: DimensionsValue = {
  mode: 'contained',
  alignment: 'center',
  maxWidth: { value: 1200, unit: 'px', enabled: true },
}

// Default padding for responsive field
const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
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
    _reset: createResetField({ defaultProps }),
    content: {
      type: 'slot',
    },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    // Outer (section-level) options
    background: createBackgroundField({ label: 'Outer Background' }),
    border: createBorderField({ label: 'Outer Border' }),
    // Responsive dimensions field
    dimensions: createResponsiveField({
      label: 'Dimensions (Responsive)',
      innerField: (config) => createDimensionsField(config),
      defaultValue: DEFAULT_DIMENSIONS,
    }),
    animation: createAnimationField({ label: 'Animation' }),
    // Inner (content container) options
    innerBackground: createBackgroundField({ label: 'Inner Background' }),
    innerBorder: createBorderField({ label: 'Inner Border' }),
    // Responsive inner padding
    innerPadding: createResponsiveField({
      label: 'Inner Padding (Responsive)',
      innerField: (config) => createPaddingField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    // Spacing (grouped at bottom) - Responsive
    margin: createResponsiveField({
      label: 'Margin (Responsive)',
      innerField: (config) => createMarginField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    customPadding: createResponsiveField({
      label: 'Outer Padding (Responsive)',
      innerField: (config) => createPaddingField(config),
      defaultValue: DEFAULT_PADDING,
    }),
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
    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
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

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div className={outerClass} style={outerStyles}>
          {hasInnerStyles ? (
            <div className={contentClasses} style={innerStyles}>
              <Content />
            </div>
          ) : (
            <Content className={contentClasses} style={innerStyles} />
          )}
        </div>
      </AnimatedWrapper>
    )
  },
}
