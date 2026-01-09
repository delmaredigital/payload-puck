/**
 * Container Component - Puck Configuration
 *
 * Simple organizational wrapper for grouping content.
 * Uses Puck's slot system for nesting other components.
 *
 * For two-layer layouts (full-bleed background with constrained content),
 * use the Section component instead.
 *
 * Responsive Controls:
 * - dimensions: Different max-width/min-height at different breakpoints
 * - padding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import { useId } from 'react'
import type { ComponentConfig } from '@measured/puck'
import {
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

// Default padding (none)
const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
}

// Default dimensions (full width)
const DEFAULT_DIMENSIONS: DimensionsValue = {
  mode: 'full',
  alignment: 'center',
  maxWidth: { value: 100, unit: '%', enabled: true },
}

export interface ContainerProps {
  content: unknown
  visibility: VisibilityValue | null
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  background: BackgroundValue | null
  border: BorderValue | null
  padding: ResponsiveValue<PaddingValue> | PaddingValue | null
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  animation: AnimationValue | null
}

const defaultProps: ContainerProps = {
  content: [],
  visibility: null,
  dimensions: null,
  background: null,
  border: null,
  padding: null,
  margin: null,
  animation: null,
}

export const ContainerConfig: ComponentConfig = {
  label: 'Container',
  fields: {
    _reset: createResetField({ defaultProps }),
    content: {
      type: 'slot',
    },
    // Visibility first
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    // Dimensions
    dimensions: createResponsiveField({
      label: 'Dimensions',
      innerField: (config) => createDimensionsField(config),
      defaultValue: DEFAULT_DIMENSIONS,
    }),
    // Styling
    background: createBackgroundField({ label: 'Background' }),
    border: createBorderField({ label: 'Border' }),
    // Spacing
    padding: createResponsiveField({
      label: 'Padding',
      innerField: (config) => createPaddingField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    margin: createResponsiveField({
      label: 'Margin',
      innerField: (config) => createMarginField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    // Animation
    animation: createAnimationField({ label: 'Animation' }),
  },
  defaultProps,
  render: ({
    content: Content,
    visibility,
    dimensions,
    background,
    border,
    padding,
    margin,
    animation,
  }) => {
    // Generate unique ID for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
    const containerClass = `puck-container-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Build container styles
    const containerStyles: React.CSSProperties = {}

    // Background
    const backgroundStyles = backgroundValueToCSS(background)
    if (backgroundStyles) {
      Object.assign(containerStyles, backgroundStyles)
    }

    // Border
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) {
      Object.assign(containerStyles, borderStyles)
    }

    // Dimensions with responsive support
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      containerClass
    )
    Object.assign(containerStyles, dimensionsResult.baseStyles)
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    // Check if minHeight is set - if so, we need flex layout to make slot expand
    const hasMinHeight = (() => {
      if (!dimensions) return false
      // Check if it's a responsive value
      if (typeof dimensions === 'object' && 'xs' in dimensions) {
        const responsiveDims = dimensions as ResponsiveValue<DimensionsValue>
        return Object.values(responsiveDims).some((v) => {
          if (!v || typeof v !== 'object') return false
          const dim = v as DimensionsValue
          return dim.minHeight?.enabled && dim.minHeight?.value > 0
        })
      }
      // Non-responsive value
      const dim = dimensions as DimensionsValue
      return dim.minHeight?.enabled && dim.minHeight?.value > 0
    })()

    // Add flex layout when minHeight is set to make content stretch
    if (hasMinHeight) {
      containerStyles.display = 'flex'
      containerStyles.flexDirection = 'column'
    }

    // Padding with responsive support
    const paddingResult = responsiveValueToCSS(
      padding,
      (v) => ({ padding: paddingValueToCSS(v) }),
      containerClass
    )
    Object.assign(containerStyles, paddingResult.baseStyles)
    if (paddingResult.mediaQueryCSS) {
      mediaQueries.push(paddingResult.mediaQueryCSS)
    }

    // Margin with responsive support
    const marginResult = responsiveValueToCSS(
      margin,
      (v) => ({ margin: marginValueToCSS(v) }),
      containerClass
    )
    Object.assign(containerStyles, marginResult.baseStyles)
    if (marginResult.mediaQueryCSS) {
      mediaQueries.push(marginResult.mediaQueryCSS)
    }

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, containerClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Check if we have any styling
    const hasStyles = Object.keys(containerStyles).length > 0

    // When minHeight is set, wrap Content to ensure slot expands
    const renderContent = () => {
      if (hasMinHeight) {
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Content style={{ flex: 1 }} />
          </div>
        )
      }
      return <Content />
    }

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        {hasStyles ? (
          <div className={containerClass} style={containerStyles}>
            {renderContent()}
          </div>
        ) : (
          <Content className={containerClass} />
        )}
      </AnimatedWrapper>
    )
  },
}
