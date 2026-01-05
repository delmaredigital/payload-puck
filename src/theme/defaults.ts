/**
 * Default Theme Values
 *
 * These defaults ensure backwards compatibility - components render
 * identically to before theming was introduced when no theme is provided.
 */

import type {
  ButtonVariantStyles,
  BackgroundStyles,
  ColorPreset,
  ResolvedTheme,
} from './types'

/**
 * Default button variant styles
 * Uses semantic Tailwind classes that map to CSS variables (--primary, --secondary, etc.)
 * This allows consuming apps to customize colors via their theme CSS variables.
 */
export const DEFAULT_BUTTON_VARIANTS: ButtonVariantStyles = {
  default: { classes: 'bg-primary text-primary-foreground hover:bg-primary/90' },
  secondary: { classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
  outline: { classes: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' },
  ghost: { classes: 'bg-transparent hover:bg-accent hover:text-accent-foreground' },
  destructive: { classes: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  link: { classes: 'text-primary underline-offset-4 hover:underline bg-transparent' },
}

/**
 * Default CTA button variant styles
 * Uses semantic Tailwind classes that map to CSS variables.
 */
export const DEFAULT_CTA_BUTTON_VARIANTS: ButtonVariantStyles = {
  primary: { classes: 'bg-primary text-primary-foreground hover:bg-primary/90' },
  secondary: { classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
  outline: { classes: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' },
  ghost: { classes: 'bg-transparent hover:bg-accent hover:text-accent-foreground' },
  link: { classes: 'text-primary underline-offset-4 hover:underline bg-transparent' },
}

/**
 * Default CTA background styles
 * Uses semantic Tailwind classes that map to CSS variables.
 */
export const DEFAULT_CTA_BACKGROUND_STYLES: BackgroundStyles = {
  default: 'bg-muted',
  dark: 'bg-foreground text-background',
  light: 'bg-background',
}

/**
 * Default color picker presets
 * Matches DEFAULT_PRESETS from ColorPickerField.tsx
 */
export const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  { hex: '#ffffff', label: 'White' },
  { hex: '#f9fafb', label: 'Gray 50' },
  { hex: '#f3f4f6', label: 'Gray 100' },
  { hex: '#1f2937', label: 'Gray 800' },
  { hex: '#111827', label: 'Gray 900' },
  { hex: '#000000', label: 'Black' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#10b981', label: 'Green' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Red' },
]

/**
 * Default focus ring color class
 * Uses semantic ring color from CSS variables
 */
export const DEFAULT_FOCUS_RING = 'focus:ring-ring'

/**
 * Complete default theme
 * Used when no ThemeProvider is present or no theme config is provided
 */
export const DEFAULT_THEME: ResolvedTheme = {
  buttonVariants: DEFAULT_BUTTON_VARIANTS,
  ctaButtonVariants: DEFAULT_CTA_BUTTON_VARIANTS,
  ctaBackgroundStyles: DEFAULT_CTA_BACKGROUND_STYLES,
  colorPresets: DEFAULT_COLOR_PRESETS,
  focusRingColor: DEFAULT_FOCUS_RING,
}
