/**
 * Text Component - Server-Safe Puck Configuration
 *
 * Simple paragraph text with customizable styling.
 * This version excludes field definitions for server-side rendering.
 */

import type React from 'react'
import type { ComponentConfig } from '@measured/puck'
import {
  textSizeMap,
  alignmentMap,
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  colorValueToCSS,
  dimensionsValueToCSS,
  type PaddingValue,
  type ColorValue,
  type DimensionsValue,
  type AnimationValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import type { Alignment } from '../../fields/AlignmentField'

export interface TextProps {
  content: string
  size: string
  alignment: Alignment | null
  textColor: ColorValue | null
  dimensions: DimensionsValue | null
  animation: AnimationValue | null
  margin: PaddingValue | null
  customPadding: PaddingValue | null
}

const defaultProps: TextProps = {
  content: 'Enter your text here...',
  size: 'base',
  alignment: null,
  textColor: null,
  dimensions: null,
  animation: null,
  margin: null,
  customPadding: null,
}

export const TextConfig: ComponentConfig<TextProps> = {
  label: 'Text',
  defaultProps,
  render: ({ content, size, alignment, textColor, dimensions, animation, margin, customPadding }) => {
    const dimensionsStyles = dimensions ? dimensionsValueToCSS(dimensions) : undefined

    const style: React.CSSProperties = {
      ...dimensionsStyles,
    }
    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      style.margin = marginCSS
    }
    const paddingCSS = paddingValueToCSS(customPadding)
    if (paddingCSS) {
      style.padding = paddingCSS
    }
    // Apply text color from ColorValue
    const colorCSS = colorValueToCSS(textColor)
    if (colorCSS) {
      style.color = colorCSS
    }

    const alignmentValue = alignment ?? 'left'

    return (
      <AnimatedWrapper animation={animation}>
        <p
          className={cn(
            textSizeMap[size] || textSizeMap.base,
            alignmentMap[alignmentValue] || alignmentMap.left
          )}
          style={Object.keys(style).length > 0 ? style : undefined}
        >
          {content}
        </p>
      </AnimatedWrapper>
    )
  },
}
