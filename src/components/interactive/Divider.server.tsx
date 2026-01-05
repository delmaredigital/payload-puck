/**
 * Divider Component - Server-safe Puck Configuration
 *
 * Horizontal line separator with customizable style.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */

import type { ComponentConfig } from '@measured/puck'
import {
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
  customPadding: null,
}

export const DividerConfig: ComponentConfig<DividerProps> = {
  label: 'Divider',
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
        <div className="px-4" style={Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined}>
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
