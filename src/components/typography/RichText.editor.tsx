'use client'

/**
 * RichText Component - Puck Editor Configuration with Modal Editing
 *
 * Uses a modal-based approach for TipTap editing. The sidebar shows a
 * preview and "Edit Content" button that opens a full-screen modal.
 * This works within Puck's architecture where canvas events are captured.
 *
 * Requires @tailwindcss/typography - uses the `prose` class for styling.
 */

import React, { useMemo } from 'react'
import type { ComponentConfig } from '@measured/puck'
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
import { createTiptapModalField } from '../../fields/TiptapModalField'

export interface RichTextEditorProps {
  content: string
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

// Note: RichTextEditorConfig is only used in the Puck editor (editorConfig).
// The frontend uses RichTextConfig from RichText.server.tsx (baseConfig).
// Content is edited via modal from the sidebar, canvas shows preview.

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

  // Render static preview (editing happens via modal in sidebar)
  return (
    <section className="relative overflow-hidden" style={style}>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
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
    content: createTiptapModalField({ label: 'Content' }),
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
