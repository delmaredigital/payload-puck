/**
 * Theme Resolution Utilities
 *
 * Functions for merging user-provided theme config with defaults
 * and safely accessing theme values.
 */

import type {
  ThemeConfig,
  ResolvedTheme,
  ButtonVariantStyles,
  BackgroundStyles,
} from './types'
import {
  DEFAULT_BUTTON_VARIANTS,
  DEFAULT_CTA_BUTTON_VARIANTS,
  DEFAULT_CTA_BACKGROUND_STYLES,
  DEFAULT_COLOR_PRESETS,
  DEFAULT_FOCUS_RING,
  DEFAULT_THEME,
} from './defaults'

/**
 * Merges user-provided theme config with defaults to create a fully resolved theme
 */
export function resolveTheme(config?: ThemeConfig): ResolvedTheme {
  if (!config) return DEFAULT_THEME

  return {
    buttonVariants: mergeVariants(DEFAULT_BUTTON_VARIANTS, config.buttonVariants),
    ctaButtonVariants: mergeVariants(DEFAULT_CTA_BUTTON_VARIANTS, config.ctaButtonVariants),
    ctaBackgroundStyles: mergeBackgroundStyles(
      DEFAULT_CTA_BACKGROUND_STYLES,
      config.ctaBackgroundStyles
    ),
    colorPresets: resolveColorPresets(config),
    focusRingColor: config.focusRingColor ?? DEFAULT_FOCUS_RING,
  }
}

/**
 * Merges variant overrides with defaults
 */
function mergeVariants(
  defaults: ButtonVariantStyles,
  overrides?: Partial<ButtonVariantStyles>
): ButtonVariantStyles {
  if (!overrides) return defaults

  const result: ButtonVariantStyles = { ...defaults }
  for (const key of Object.keys(overrides)) {
    const override = overrides[key]
    if (override) {
      result[key] = override
    }
  }
  return result
}

/**
 * Merges background style overrides with defaults
 */
function mergeBackgroundStyles(
  defaults: BackgroundStyles,
  overrides?: Partial<BackgroundStyles>
): BackgroundStyles {
  if (!overrides) return defaults
  return { ...defaults, ...overrides }
}

/**
 * Resolves color presets based on config
 */
function resolveColorPresets(config: ThemeConfig) {
  if (!config.colorPresets) {
    return DEFAULT_COLOR_PRESETS
  }

  if (config.extendColorPresets) {
    return [...DEFAULT_COLOR_PRESETS, ...config.colorPresets]
  }

  return config.colorPresets
}

/**
 * Safely gets variant classes from a variant styles object
 *
 * @param variants - The button variant styles object
 * @param variant - The variant key to look up
 * @param fallback - Fallback variant key if the requested variant doesn't exist
 * @returns The CSS classes string for the variant
 */
export function getVariantClasses(
  variants: ButtonVariantStyles,
  variant: string,
  fallback = 'default'
): string {
  const config = variants[variant]
  if (config?.classes) {
    return config.classes
  }

  const fallbackConfig = variants[fallback]
  return fallbackConfig?.classes ?? ''
}

/**
 * Safely gets background style classes
 *
 * @param styles - The background styles object
 * @param style - The style key to look up
 * @param fallback - Fallback style key if the requested style doesn't exist
 * @returns The CSS classes string for the background
 */
export function getBackgroundClasses(
  styles: BackgroundStyles,
  style: string,
  fallback = 'default'
): string {
  return styles[style] ?? styles[fallback] ?? ''
}
