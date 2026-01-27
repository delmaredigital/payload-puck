/**
 * Template Component - Server-safe Configuration
 *
 * A reusable template container for rendering nested components.
 * This server-safe version excludes the TemplateField (which requires client-side APIs).
 *
 * For the full editor experience with template loading, use Template.tsx
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
  responsiveValueToCSS,
  visibilityValueToCSS,
  type PaddingValue,
  type DimensionsValue,
  type ResponsiveValue,
  type VisibilityValue,
} from '../../fields/shared.js'

// Simple ID generator for server-side rendering
let idCounter = 0
function generateUniqueId(): string {
  return `t${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// =============================================================================
// Types
// =============================================================================

export interface TemplateProps {
  /** Slot for nested components */
  content: unknown
  /** ID of the currently loaded template (for tracking only) */
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
// Component Configuration (Server-safe)
// =============================================================================

export const TemplateServerConfig: ComponentConfig = {
  label: 'Template',
  fields: {
    // In server config, templateId is just for reference (no loading UI)
    templateId: {
      type: 'text',
      label: 'Template ID',
    },
    content: {
      type: 'slot',
    },
  },
  defaultProps,
  render: ({ content: Content, dimensions, customPadding, margin, visibility }) => {
    // Generate unique IDs for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
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

    // Type assertion for Puck slot content
    const ContentSlot = Content as any

    // Content is a slot component that Puck provides
    // It renders all the nested components within this template
    return (
      <>
        {allMediaQueryCSS && <style>{allMediaQueryCSS}</style>}
        <div
          className={cn('template-wrapper', wrapperClass)}
          style={Object.keys(wrapperStyles).length > 0 ? wrapperStyles : undefined}
        >
          <ContentSlot className={contentClass} style={dimensionsResult.baseStyles} />
        </div>
      </>
    )
  },
}
