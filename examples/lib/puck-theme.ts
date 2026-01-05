/**
 * Puck Theme Configuration
 *
 * Copy this file to: src/lib/puck-theme.ts
 *
 * Customizes Puck component styles to match your design system.
 * This example uses shadcn/ui CSS variable conventions.
 *
 * Usage:
 * ```tsx
 * import { puckTheme } from '@/lib/puck-theme'
 *
 * <PageRenderer data={data} config={config} theme={puckTheme} />
 * <PuckEditor ... theme={puckTheme} />
 * ```
 */

import type { ThemeConfig } from '@delmaredigital/payload-puck/theme'

/**
 * Theme using CSS variables from your design system
 *
 * Assumes your globals.css defines:
 * --primary, --primary-foreground
 * --secondary, --secondary-foreground
 * --accent, --accent-foreground
 * --muted, --muted-foreground
 * --destructive, --destructive-foreground
 * --background, --foreground
 * --input, --ring
 */
export const puckTheme: ThemeConfig = {
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
    { hex: '#f8fafc', label: 'Background' },
    { hex: '#f1f5f9', label: 'Secondary' },
    { hex: '#e2e8f0', label: 'Muted' },
    { hex: '#64748b', label: 'Muted FG' },
    { hex: '#334155', label: 'Slate 700' },
    { hex: '#1e293b', label: 'Primary' },
    { hex: '#0f172a', label: 'Foreground' },
    { hex: '#000000', label: 'Black' },
    // Add your brand accent colors:
    // { hex: '#3b82f6', label: 'Brand Blue' },
    // { hex: '#10b981', label: 'Success' },
    // { hex: '#ef4444', label: 'Danger' },
  ],
}
