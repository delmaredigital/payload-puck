/**
 * Grid Component - Puck Configuration
 *
 * CSS Grid layout following official Puck demo patterns.
 * Responsive: stacks on mobile (flex column), grid on desktop (md+).
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * Supports both preset options and advanced custom styling:
 * - Background: unified BackgroundField (solid, gradient, or image)
 * - Advanced: customPadding, customWidth, border
 *
 * Responsive Controls:
 * - gap: Different gap at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */

import { useId } from 'react'
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
  isResponsiveValue,
  type PaddingValue,
  type BorderValue,
  type DimensionsValue,
  type BackgroundValue,
  type AnimationValue,
  type ResponsiveValue,
  type VisibilityValue,
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'
import { createPaddingField } from '../../fields/PaddingField.js'
import { createBorderField } from '../../fields/BorderField.js'
import { createDimensionsField } from '../../fields/DimensionsField.js'
import { createMarginField } from '../../fields/MarginField.js'
import { createResetField } from '../../fields/ResetField.js'
import { createBackgroundField } from '../../fields/BackgroundField.js'
import { createAnimationField } from '../../fields/AnimationField.js'
import { createResponsiveField } from '../../fields/ResponsiveField.js'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField.js'

// Default values for responsive fields
const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
}

const DEFAULT_DIMENSIONS: DimensionsValue = {
  mode: 'full',
  alignment: 'center',
  maxWidth: { value: 100, unit: '%', enabled: true },
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
    _reset: createResetField({ defaultProps }),
    content: {
      type: 'slot',
      disallow: ['Section'],
    },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    // Semantic element selection
    semanticElement: {
      type: 'select',
      label: 'HTML Element',
      options: [
        { label: 'Div', value: 'div' },
        { label: 'Unordered List', value: 'ul' },
        { label: 'Ordered List', value: 'ol' },
      ],
    },
    numColumns: {
      type: 'number',
      label: 'Number of Columns',
      min: 1,
      max: 12,
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
    },
    // Background
    background: createBackgroundField({ label: 'Background' }),
    // Advanced custom options
    border: createBorderField({ label: 'Border' }),
    // Responsive dimensions
    dimensions: createResponsiveField({
      label: 'Dimensions (Responsive)',
      innerField: (config) => createDimensionsField(config),
      defaultValue: DEFAULT_DIMENSIONS,
    }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom) - Responsive
    margin: createResponsiveField({
      label: 'Margin (Responsive)',
      innerField: (config) => createMarginField(config),
      defaultValue: DEFAULT_PADDING,
    }),
    customPadding: createResponsiveField({
      label: 'Padding (Responsive)',
      innerField: (config) => createPaddingField(config),
      defaultValue: DEFAULT_PADDING,
    }),
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

    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
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

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <Wrapper className={wrapperClass} style={wrapperStyles}>
          <Content
            className={contentClasses}
            style={gridStyles}
          />
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
