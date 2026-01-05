/**
 * Theme Type Definitions
 *
 * Defines all theme-related TypeScript interfaces for the payload-puck plugin.
 * These types enable consuming applications to customize button variants,
 * color presets, and other visual styles.
 */

/**
 * Configuration for a single button variant
 */
export interface ButtonVariantConfig {
  /** Tailwind classes for the variant */
  classes: string
  /** Optional CSS variable reference for dynamic theming */
  cssVariable?: string
}

/**
 * Map of button variant names to their configurations
 */
export interface ButtonVariantStyles {
  default?: ButtonVariantConfig
  primary?: ButtonVariantConfig
  secondary?: ButtonVariantConfig
  outline?: ButtonVariantConfig
  ghost?: ButtonVariantConfig
  destructive?: ButtonVariantConfig
  link?: ButtonVariantConfig
  [key: string]: ButtonVariantConfig | undefined
}

/**
 * Color preset for the color picker
 */
export interface ColorPreset {
  /** Hex color value (e.g., '#3b82f6') */
  hex: string
  /** Display label for the preset */
  label: string
  /** Optional CSS variable reference (e.g., 'var(--color-primary)') */
  cssVariable?: string
}

/**
 * Background style configurations for CTA components
 */
export interface BackgroundStyles {
  default?: string
  dark?: string
  light?: string
  [key: string]: string | undefined
}

/**
 * Theme configuration provided by consuming applications
 * All properties are optional and will be merged with defaults
 */
export interface ThemeConfig {
  /**
   * Button variant styles
   * Merged with default button variants
   */
  buttonVariants?: Partial<ButtonVariantStyles>

  /**
   * CTA button variant styles
   * Merged with default CTA button variants
   */
  ctaButtonVariants?: Partial<ButtonVariantStyles>

  /**
   * CTA background styles
   * Merged with default background styles
   */
  ctaBackgroundStyles?: Partial<BackgroundStyles>

  /**
   * Color picker preset colors
   * If provided, replaces defaults unless extendColorPresets is true
   */
  colorPresets?: ColorPreset[]

  /**
   * Whether to extend default color presets (true) or replace them (false)
   * @default false
   */
  extendColorPresets?: boolean

  /**
   * Focus ring color class (e.g., 'focus:ring-primary')
   * @default 'focus:ring-blue-500'
   */
  focusRingColor?: string
}

/**
 * Fully resolved theme with all defaults applied
 * This is what components receive via useTheme()
 */
export interface ResolvedTheme {
  buttonVariants: ButtonVariantStyles
  ctaButtonVariants: ButtonVariantStyles
  ctaBackgroundStyles: BackgroundStyles
  colorPresets: ColorPreset[]
  focusRingColor: string
}

/**
 * Theme context value provided by ThemeProvider
 */
export interface ThemeContextValue {
  theme: ResolvedTheme
}
