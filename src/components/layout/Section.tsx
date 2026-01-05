/**
 * Section Component - Puck Configuration
 *
 * Full-width section with background options and content slot.
 * Used as a top-level page section wrapper.
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
import { createPaddingField } from '../../fields/PaddingField'
import { createBorderField } from '../../fields/BorderField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createMarginField } from '../../fields/MarginField'
import { createResetField } from '../../fields/ResetField'
import { createBackgroundField } from '../../fields/BackgroundField'
import { createAnimationField } from '../../fields/AnimationField'
import { createResponsiveField } from '../../fields/ResponsiveField'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField'

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
    _reset: createResetField({ defaultProps }),
    id: {
      type: 'text',
      label: 'Section ID',
    },
    content: {
      type: 'slot',
    },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    fullWidth: {
      type: 'radio',
      label: 'Full Width Content',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
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
    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
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

    return (
      <AnimatedWrapper animation={animation}>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <section
          id={id || undefined}
          className={sectionClasses}
          style={sectionStyles}
        >
          <Content className={contentClasses} style={dimensionsResult.baseStyles} />
        </section>
      </AnimatedWrapper>
    )
  },
}
