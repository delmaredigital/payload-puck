/**
 * Template Component - Puck Configuration
 *
 * A reusable template container that allows saving and loading
 * pre-configured component arrangements from the Payload CMS.
 *
 * Use this component to:
 * - Create reusable page sections
 * - Save common component patterns as templates
 * - Quickly load pre-built layouts
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
  responsiveValueToCSS,
  visibilityValueToCSS,
  type PaddingValue,
  type DimensionsValue,
  type ResponsiveValue,
  type VisibilityValue,
} from '../../fields/shared.js'
import { createResetField } from '../../fields/ResetField.js'
import { createTemplateField } from '../../fields/TemplateField.js'
import { createPaddingField } from '../../fields/PaddingField.js'
import { createMarginField } from '../../fields/MarginField.js'
import { createDimensionsField } from '../../fields/DimensionsField.js'
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

// =============================================================================
// Types
// =============================================================================

export interface TemplateProps {
  /** Slot for nested components */
  content: unknown
  /** ID of the currently loaded template (or null if none) */
  templateId: string | null
  /** Responsive dimensions */
  dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null
  /** Responsive padding */
  customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null
  /** Responsive margin */
  margin: ResponsiveValue<PaddingValue> | PaddingValue | null
  /** Responsive visibility */
  visibility: VisibilityValue | null
}

// =============================================================================
// Default Props
// =============================================================================

const defaultProps: TemplateProps = {
  content: [],
  templateId: null,
  dimensions: null,
  customPadding: null,
  margin: null,
  visibility: null,
}

// =============================================================================
// Component Configuration
// =============================================================================

export const TemplateConfig: ComponentConfig = {
  label: 'Template',
  fields: {
    _reset: createResetField({ defaultProps }),
    templateId: createTemplateField({ label: 'Template' }),
    content: {
      type: 'slot',
    },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    // Responsive dimensions
    dimensions: createResponsiveField({
      label: 'Dimensions (Responsive)',
      innerField: (config) => createDimensionsField(config),
      defaultValue: DEFAULT_DIMENSIONS,
    }),
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
  render: ({ content: Content, dimensions, customPadding, margin, visibility }) => {
    // Generate unique IDs for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
    const wrapperClass = `puck-template-${uniqueId}`
    const contentClass = `puck-template-content-${uniqueId}`

    // Collect all media query CSS
    const mediaQueries: string[] = []

    // Build wrapper styles
    const wrapperStyles: React.CSSProperties = {}

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

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)
    if (visibilityCSS) {
      mediaQueries.push(visibilityCSS)
    }

    // Use dimensions with responsive support
    const dimensionsResult = responsiveValueToCSS(
      dimensions,
      dimensionsValueToCSS,
      contentClass
    )
    if (dimensionsResult.mediaQueryCSS) {
      mediaQueries.push(dimensionsResult.mediaQueryCSS)
    }

    // Combine all media queries
    const allMediaQueryCSS = mediaQueries.join('\n')

    // Content is a slot component that Puck provides
    // It renders all the nested components within this template
    return (
      <>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div
          className={cn('template-wrapper', wrapperClass)}
          style={Object.keys(wrapperStyles).length > 0 ? wrapperStyles : undefined}
        >
          <Content className={contentClass} style={dimensionsResult.baseStyles} />
        </div>
      </>
    )
  },
}
