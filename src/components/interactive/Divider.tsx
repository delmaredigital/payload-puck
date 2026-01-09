/**
 * Divider Component - Puck Configuration
 *
 * Horizontal line separator with customizable style.
 */

import type { ComponentConfig } from '@measured/puck'
import {
  dividerStyleField,
  dividerStyleMap,
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  colorValueToCSS,
  dimensionsValueToCSS,
  transformValueToCSS,
  type PaddingValue,
  type ColorValue,
  type DimensionsValue,
  type AnimationValue,
  type TransformValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createColorPickerField } from '../../fields/ColorPickerField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createAnimationField } from '../../fields/AnimationField'
import { createTransformField } from '../../fields/TransformField'
import { createResetField } from '../../fields/ResetField'

// Default padding with standard horizontal spacing (replaces hardcoded px-4)
const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 16,
  bottom: 0,
  left: 16,
  unit: 'px',
  linked: false,
}

export interface DividerProps {
  style: string
  color: ColorValue | null
  margin: PaddingValue | null
  dimensions: DimensionsValue | null
  transform: TransformValue | null
  animation: AnimationValue | null
  customPadding: PaddingValue | null
}

const defaultProps: DividerProps = {
  style: 'solid',
  color: null,
  margin: null,
  dimensions: null,
  transform: null,
  animation: null,
  customPadding: DEFAULT_PADDING, // Default 16px horizontal padding, visible in editor
}

export const DividerConfig: ComponentConfig = {
  label: 'Divider',
  fields: {
    _reset: createResetField({ defaultProps }),
    style: dividerStyleField,
    color: createColorPickerField({ label: 'Color' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    transform: createTransformField({ label: 'Transform' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: ({ style, color, dimensions, margin, transform, animation, customPadding }) => {
    const dimensionsStyles = dimensionsValueToCSS(dimensions)

    const wrapperStyle: React.CSSProperties = {
      ...dimensionsStyles,
    }
    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      wrapperStyle.margin = marginCSS
    }
    const paddingCSS = paddingValueToCSS(customPadding)
    if (paddingCSS) {
      wrapperStyle.padding = paddingCSS
    }
    const transformStyles = transformValueToCSS(transform)
    if (transformStyles) {
      Object.assign(wrapperStyle, transformStyles)
    }

    // Only set color if explicitly provided, otherwise use CSS variable
    const customColor = colorValueToCSS(color)
    const hrStyle: React.CSSProperties | undefined = customColor
      ? { borderColor: customColor }
      : undefined

    return (
      <AnimatedWrapper animation={animation}>
        <div style={Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}>
          <hr
            className={cn(
              'border-t border-border',
              dividerStyleMap[style] || dividerStyleMap.solid
            )}
            style={hrStyle}
          />
        </div>
      </AnimatedWrapper>
    )
  },
}
