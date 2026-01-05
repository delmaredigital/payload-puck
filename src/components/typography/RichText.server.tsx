/**
 * RichText Component - Server-Safe Puck Configuration
 *
 * Rich text content with customizable styling.
 * This version excludes field definitions for server-side rendering.
 *
 * Requires @tailwindcss/typography - uses the `prose` class for styling.
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
import type { Alignment } from '../../fields/AlignmentField'

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

export const RichTextConfig: ComponentConfig<RichTextProps> = {
  label: 'Rich Text',
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
