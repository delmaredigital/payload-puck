/**
 * Flex Component - Puck Configuration
 *
 * Flexbox layout following official Puck demo patterns.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * Supports both preset options and advanced custom styling:
 * - Background: unified BackgroundField (solid, gradient, or image)
 * - Advanced: customPadding, customWidth, border
 *
 * Responsive Controls:
 * - dimensions: Different dimensions at different breakpoints
 * - customPadding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
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
  justifyContentMap,
  alignItemsMap,
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
import { createResetField } from '../../fields/ResetField.js'
import { createMarginField } from '../../fields/MarginField.js'
import { createBackgroundField } from '../../fields/BackgroundField.js'
import { createAnimationField } from '../../fields/AnimationField.js'
import { createResponsiveField } from '../../fields/ResponsiveField.js'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField.js'
import {
  createJustifyContentField,
  createAlignItemsField,
  type JustifyContent,
  type AlignItems,
} from '../../fields/FlexAlignmentField.js'

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

export type FlexSemanticElement = 'div' | 'nav' | 'ul' | 'ol' | 'aside' | 'section'

export interface FlexProps {
  content: unknown
  semanticElement: FlexSemanticElement
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
  semanticElement: 'div',
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
        { label: 'Nav', value: 'nav' },
        { label: 'Unordered List', value: 'ul' },
        { label: 'Ordered List', value: 'ol' },
        { label: 'Aside', value: 'aside' },
        { label: 'Section', value: 'section' },
      ],
    },
    direction: {
      type: 'radio',
      label: 'Direction',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Column', value: 'column' },
      ],
    },
    justifyContent: createJustifyContentField({ label: 'Justify Content' }),
    alignItems: createAlignItemsField({ label: 'Align Items' }),
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
    },
    wrap: {
      type: 'radio',
      label: 'Wrap',
      options: [
        { label: 'Yes', value: 'wrap' },
        { label: 'No', value: 'nowrap' },
      ],
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
    // Dynamic element based on semanticElement prop
    const Wrapper = semanticElement as React.ElementType

    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
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

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <Wrapper className={wrapperClass} style={wrapperStyles}>
          <Content className={contentClasses} style={contentStyles} />
        </Wrapper>
      </AnimatedWrapper>
    )
  },
}
