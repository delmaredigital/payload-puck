'use client'

/**
 * RichText Component - Puck Editor Configuration
 *
 * Uses Puck's native richtext field with custom extensions for:
 * - Text colors with opacity (RGBA)
 * - Highlight with multicolor support
 * - Font sizes (presets + custom)
 * - Superscript and subscript
 *
 * Supports contentEditable for inline canvas editing.
 * Requires @tailwindcss/typography - uses the `prose` class for styling.
 */

import React, { useMemo } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import {
  marginValueToCSS,
  paddingValueToCSS,
  dimensionsValueToCSS,
  type PaddingValue,
  type DimensionsValue,
} from '../../fields/shared'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createResetField } from '../../fields/ResetField'
import { createRichTextField } from '../../fields/richtext'

export interface RichTextEditorProps {
  content: React.ReactNode // Puck richtext returns React elements for contentEditable
  dimensions: DimensionsValue | null
  margin: PaddingValue | null
  customPadding: PaddingValue | null
  id?: string // Puck adds this automatically
}

const defaultProps: RichTextEditorProps = {
  content: '<p>Click to start editing...</p>',
  dimensions: null,
  margin: null,
  customPadding: null,
}

// =============================================================================
// Render Component for Editor Config
// =============================================================================

// Uses Puck's native richtext field which supports inline contentEditable editing.
// Content is rendered directly as {content} - Puck handles the rest.

function RichTextRender({
  content,
  dimensions,
  margin,
  customPadding,
}: RichTextEditorProps) {
  // Build styles
  const style = useMemo(() => {
    const s: React.CSSProperties = {}

    const dimensionsStyles = dimensions ? dimensionsValueToCSS(dimensions) : undefined
    if (dimensionsStyles) {
      Object.assign(s, dimensionsStyles)
    }

    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      s.margin = marginCSS
    }

    const customPaddingCSS = paddingValueToCSS(customPadding)
    if (customPaddingCSS) {
      s.padding = customPaddingCSS
    }

    return Object.keys(s).length > 0 ? s : undefined
  }, [dimensions, margin, customPadding])

  // Render content directly - Puck's richtext field handles both:
  // - Editor: Returns React elements for contentEditable inline editing
  // - Frontend <Render>: Returns HTML string which React renders
  return (
    <section className="relative overflow-hidden" style={style}>
      <div className="prose dark:prose-invert max-w-none">{content}</div>
    </section>
  )
}

// =============================================================================
// Puck Component Config
// =============================================================================

export const RichTextEditorConfig: ComponentConfig = {
  label: 'Rich Text',
  fields: {
    _reset: createResetField({ defaultProps }),
    content: createRichTextField({
      label: 'Content',
      contentEditable: true, // Enable inline canvas editing
    }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: (props) => (
    <RichTextRender
      content={props.content}
      dimensions={props.dimensions}
      margin={props.margin}
      customPadding={props.customPadding}
      id={props.id}
    />
  ),
}
