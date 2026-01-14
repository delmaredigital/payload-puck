/**
 * Button Component - Server-safe Puck Configuration
 *
 * CTA button with customizable styling and link support.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */

import type { ComponentConfig } from '@puckeditor/core'
import {
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  colorValueToCSS,
  borderValueToCSS,
  transformValueToCSS,
  sizeValueToCSS,
  getSizeClasses,
  type PaddingValue,
  type ColorValue,
  type BorderValue,
  type AnimationValue,
  type TransformValue,
  type SizeValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import type { Alignment } from '../../fields/AlignmentField'
import { DEFAULT_BUTTON_VARIANTS, DEFAULT_FOCUS_RING } from '../../theme/defaults'
import { getVariantClasses } from '../../theme/utils'

export interface ButtonProps {
  text: string
  link: string
  variant: string
  size: SizeValue | null
  openInNewTab: string
  margin: PaddingValue | null
  customBackgroundColor: ColorValue | null
  customTextColor: ColorValue | null
  customBorder: BorderValue | null
  alignment: Alignment | null
  transform: TransformValue | null
  animation: AnimationValue | null
  customPadding: PaddingValue | null
}

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-sm',
  default: 'h-10 px-4',
  lg: 'h-12 px-8 text-lg',
}

const alignmentWrapperMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const defaultProps: ButtonProps = {
  text: 'Click Me',
  link: '',
  variant: 'default',
  size: null,
  openInNewTab: 'no',
  margin: null,
  customBackgroundColor: null,
  customTextColor: null,
  customBorder: null,
  alignment: null,
  transform: null,
  animation: null,
  customPadding: null,
}

export const ButtonConfig: ComponentConfig<ButtonProps> = {
  label: 'Button',
  defaultProps,
  render: ({ text, link, variant, size, openInNewTab, alignment, margin, customBackgroundColor, customTextColor, customBorder, transform, animation, customPadding }) => {
    // Determine if custom styles should override preset variant/size styles
    const hasCustomBackground = customBackgroundColor?.hex
    const hasCustomTextColor = customTextColor?.hex
    const hasCustomPadding = customPadding
    const hasCustomSize = size?.mode === 'custom'

    // Get variant classes from defaults (SSR-safe, no hooks)
    const variantClasses = getVariantClasses(DEFAULT_BUTTON_VARIANTS, variant, 'default')

    // Get size classes for preset modes, or empty for custom mode
    const sizeClasses = getSizeClasses(size, sizeStyles)

    // Build button classes - exclude variant/size classes if custom styles are set
    const buttonClasses = cn(
      'inline-flex items-center justify-center font-medium transition-colors',
      `focus:outline-none focus:ring-2 focus:ring-offset-2 ${DEFAULT_FOCUS_RING}`,
      'disabled:opacity-50 disabled:pointer-events-none',
      // Only apply variant styles if no custom background/text color
      !hasCustomBackground && !hasCustomTextColor && variantClasses,
      // Only apply background portion of variant if no custom background
      hasCustomBackground && !hasCustomTextColor && 'hover:opacity-90',
      // Only apply size classes if not using custom size or custom padding
      !hasCustomPadding && !hasCustomSize && sizeClasses,
      // Apply rounded-md unless custom border has radius
      !customBorder?.radius && 'rounded-md'
    )

    // Build inline styles for the button
    const buttonStyle: React.CSSProperties = {}

    // Apply custom background color
    if (hasCustomBackground) {
      buttonStyle.backgroundColor = colorValueToCSS(customBackgroundColor)
    }

    // Apply custom text color
    if (hasCustomTextColor) {
      buttonStyle.color = colorValueToCSS(customTextColor)
    }

    // Apply custom border
    const borderStyles = borderValueToCSS(customBorder)
    if (borderStyles) {
      Object.assign(buttonStyle, borderStyles)
    }

    // Apply custom size (only if mode is custom)
    const customSizeStyles = sizeValueToCSS(size)
    if (customSizeStyles) {
      Object.assign(buttonStyle, customSizeStyles)
    }

    // Apply custom padding (overrides size padding if set)
    const paddingCSS = paddingValueToCSS(customPadding)
    if (paddingCSS) {
      buttonStyle.padding = paddingCSS
    }

    // Apply transform
    const transformStyles = transformValueToCSS(transform)
    if (transformStyles) {
      Object.assign(buttonStyle, transformStyles)
    }

    const buttonElement = link ? (
      <a
        href={link}
        target={openInNewTab === 'yes' ? '_blank' : undefined}
        rel={openInNewTab === 'yes' ? 'noopener noreferrer' : undefined}
        className={buttonClasses}
        style={buttonStyle}
      >
        {text}
      </a>
    ) : (
      <button type="button" className={buttonClasses} style={buttonStyle}>
        {text}
      </button>
    )

    const wrapperStyle: React.CSSProperties = {}
    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      wrapperStyle.margin = marginCSS
    }

    // Get alignment value, defaulting to 'left'
    const alignmentValue = alignment ?? 'left'

    return (
      <AnimatedWrapper
        animation={animation}
        className={alignmentWrapperMap[alignmentValue] || alignmentWrapperMap.left}
        style={wrapperStyle}
      >
        {buttonElement}
      </AnimatedWrapper>
    )
  },
}
