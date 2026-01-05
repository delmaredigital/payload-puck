/**
 * Example Theme Configuration
 *
 * Copy this file to your project and customize it to match your design system.
 *
 * Usage:
 * 1. Copy this file to your project (e.g., src/lib/puck-theme.ts)
 * 2. Customize the values to match your CSS variables/design tokens
 * 3. Import and pass to PageRenderer or PuckEditor:
 *
 * ```tsx
 * import { puckTheme } from '@/lib/puck-theme'
 *
 * <PageRenderer data={data} config={config} theme={puckTheme} />
 * ```
 */

import type { ThemeConfig } from './types'

/**
 * Example theme using shadcn/ui CSS variables
 *
 * This example assumes you have CSS variables like:
 * --primary, --primary-foreground
 * --secondary, --secondary-foreground
 * --accent, --accent-foreground
 * --muted, --muted-foreground
 * --destructive, --destructive-foreground
 * --ring (for focus rings)
 */
export const exampleTheme: ThemeConfig = {
  // Button component variants
  buttonVariants: {
    default: {
      classes: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    secondary: {
      classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    outline: {
      classes: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    },
    ghost: {
      classes: 'hover:bg-accent hover:text-accent-foreground',
    },
    destructive: {
      classes: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    link: {
      classes: 'text-primary underline-offset-4 hover:underline',
    },
  },

  // CTA button variants
  ctaButtonVariants: {
    primary: {
      classes: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    secondary: {
      classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    outline: {
      classes: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    },
  },

  // CTA background styles
  ctaBackgroundStyles: {
    default: 'bg-muted',
    dark: 'bg-primary text-primary-foreground',
    light: 'bg-background',
  },

  // Focus ring class
  focusRingColor: 'focus:ring-ring',

  // Color picker presets - customize with your brand colors
  colorPresets: [
    { hex: '#ffffff', label: 'White' },
    { hex: '#f8fafc', label: 'Slate 50' },
    { hex: '#f1f5f9', label: 'Slate 100' },
    { hex: '#e2e8f0', label: 'Slate 200' },
    { hex: '#64748b', label: 'Slate 500' },
    { hex: '#334155', label: 'Slate 700' },
    { hex: '#1e293b', label: 'Slate 800' },
    { hex: '#0f172a', label: 'Slate 900' },
    { hex: '#000000', label: 'Black' },
    { hex: '#3b82f6', label: 'Blue' },
    { hex: '#10b981', label: 'Green' },
    { hex: '#f59e0b', label: 'Amber' },
    { hex: '#ef4444', label: 'Red' },
  ],

  // Set to true to add your presets to defaults instead of replacing
  extendColorPresets: false,
}
