/**
 * RichText Component - Puck Server Configuration
 *
 * Server-safe config for rendering. Uses a simple textarea for the field.
 * The editor config (RichText.editor.tsx) uses Tiptap for the visual editor.
 */

import type React from 'react'
import type { ComponentConfig } from '@measured/puck'
import {
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  dimensionsValueToCSS,
  colorValueToCSS,
  alignmentMap,
  type PaddingValue,
  type DimensionsValue,
  type ColorValue,
  type AnimationValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createColorPickerField } from '../../fields/ColorPickerField'
import { createAlignmentField, type Alignment } from '../../fields/AlignmentField'
import { createAnimationField } from '../../fields/AnimationField'
import { createResetField } from '../../fields/ResetField'

export interface RichTextProps {
  content: string
  alignment: Alignment | null
  textColor: ColorValue | null
  dimensions: DimensionsValue | null
  animation: AnimationValue | null
  margin: PaddingValue | null
  customPadding: PaddingValue | null
}

const defaultProps: RichTextProps = {
  content: '<p>Enter your content here...</p>',
  alignment: null,
  textColor: null,
  dimensions: null,
  animation: null,
  margin: null,
  customPadding: null,
}

export const RichTextConfig: ComponentConfig = {
  label: 'Rich Text',
  fields: {
    _reset: createResetField({ defaultProps }),
    content: {
      type: 'textarea',
      label: 'Content (HTML)',
    },
    textColor: createColorPickerField({ label: 'Text Color' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    alignment: createAlignmentField({ label: 'Alignment' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: ({ content, alignment, textColor, dimensions, animation, margin, customPadding }) => {
    const dimensionsStyles = dimensions ? dimensionsValueToCSS(dimensions) : undefined

    const style: React.CSSProperties = {
      ...dimensionsStyles,
    }
    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      style.margin = marginCSS
    }
    const customPaddingCSS = paddingValueToCSS(customPadding)
    if (customPaddingCSS) {
      style.padding = customPaddingCSS
    }
    // Apply text color from ColorValue
    const colorCSS = colorValueToCSS(textColor)
    if (colorCSS) {
      style.color = colorCSS
    }

    const alignmentValue = alignment ?? 'left'
    const alignmentClass = alignmentMap[alignmentValue] || alignmentMap.left

    // Handle empty content
    if (!content || content === '<p></p>') {
      return (
        <AnimatedWrapper animation={animation}>
          <section className={cn('relative overflow-hidden px-4', alignmentClass)} style={Object.keys(style).length > 0 ? style : undefined}>
            <div className="prose dark:prose-invert">
              <p><em>No content available</em></p>
            </div>
          </section>
        </AnimatedWrapper>
      )
    }

    return (
      <AnimatedWrapper animation={animation}>
        <section className={cn('relative overflow-hidden px-4', alignmentClass)} style={Object.keys(style).length > 0 ? style : undefined}>
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      </AnimatedWrapper>
    )
  },
}
