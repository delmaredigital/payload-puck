import type { ThemeConfig } from '@delmaredigital/payload-puck/theme'

// Uses shadcn/ui CSS variable conventions: --primary, --secondary,
// --accent, --muted, --destructive, --background, --foreground, --input, --ring
export const puckTheme: ThemeConfig = {
  buttonVariants: {
    default: { classes: 'bg-primary text-primary-foreground hover:bg-primary/90' },
    secondary: { classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
    outline: { classes: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' },
    ghost: { classes: 'hover:bg-accent hover:text-accent-foreground' },
    destructive: { classes: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
    link: { classes: 'text-primary underline-offset-4 hover:underline' },
  },

  focusRingColor: 'focus:ring-ring',

  // Colour picker presets: add your brand colours
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
    // { hex: '#3b82f6', label: 'Brand Blue' },
  ],
}
