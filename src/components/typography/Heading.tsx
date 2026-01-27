/**
 * Heading Component - Puck Configuration
 *
 * H1-H6 headings with customizable styling.
 * Supports custom margin for spacing control.
 */

import React, { createElement } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import {
  headingLevelField,
  headingLevelMap,
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
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'
import { createMarginField } from '../../fields/MarginField.js'
import { createPaddingField } from '../../fields/PaddingField.js'
import { createColorPickerField } from '../../fields/ColorPickerField.js'
import { createAlignmentField, type Alignment } from '../../fields/AlignmentField.js'
import { createDimensionsField } from '../../fields/DimensionsField.js'
import { createAnimationField } from '../../fields/AnimationField.js'
import { createResetField } from '../../fields/ResetField.js'

export interface HeadingProps {
  text: string
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  alignment: Alignment | null
  textColor: ColorValue | null
  dimensions: DimensionsValue | null
  animation: AnimationValue | null
  margin: PaddingValue | null
  customPadding: PaddingValue | null
}

const defaultProps: HeadingProps = {
  text: 'Heading Text',
  level: 'h2',
  alignment: null,
  textColor: null,
  dimensions: null,
  animation: null,
  margin: null,
  customPadding: null,
}

export const HeadingConfig: ComponentConfig = {
  label: 'Heading',
  fields: {
    _reset: createResetField({ defaultProps }),
    text: {
      type: 'text',
      label: 'Text',
    },
    level: headingLevelField,
    textColor: createColorPickerField({ label: 'Text Color' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    alignment: createAlignmentField({ label: 'Alignment' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: ({ text, level, alignment, textColor, dimensions, animation, margin, customPadding }) => {
    const tag = level || 'h2'
    const alignmentValue = alignment ?? 'left'
    const classes = cn(
      headingLevelMap[level] || headingLevelMap.h2,
      alignmentMap[alignmentValue] || alignmentMap.left
    )

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

    const headingElement = createElement(tag, { className: classes, style: Object.keys(style).length > 0 ? style : undefined }, text)

    return (
      <AnimatedWrapper animation={animation}>
        {headingElement}
      </AnimatedWrapper>
    )
  },
}
