'use client'

import { useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode.js'

/**
 * Dark mode CSS to inject. This contains all Puck color variable overrides.
 * We inline this rather than importing a CSS file to avoid build complexity.
 */
const DARK_MODE_CSS = `
/**
 * Puck Editor Dark Mode CSS Overrides
 *
 * Puck's UI is always light-themed (no built-in dark mode).
 * When Payload CMS is in dark mode, we need to ensure Puck's
 * form inputs remain readable (dark text on light background).
 *
 * This CSS overrides PayloadCMS theme CSS variables within Puck UI
 * to force light-mode values, ensuring proper contrast.
 */

/* Override PayloadCMS theme CSS variables to light-mode values within Puck UI */
.dark [class*="Puck"],
.dark [class*="puck-"],
[data-theme="dark"] [class*="Puck"],
[data-theme="dark"] [class*="puck-"] {
  /* Force light-mode PayloadCMS elevation values */
  --theme-elevation-0: rgb(255, 255, 255);
  --theme-elevation-50: rgb(245, 245, 245);
  --theme-elevation-100: rgb(235, 235, 235);
  --theme-elevation-150: rgb(221, 221, 221);
  --theme-elevation-200: rgb(208, 208, 208);
  --theme-elevation-250: rgb(195, 195, 195);
  --theme-elevation-300: rgb(181, 181, 181);
  --theme-elevation-350: rgb(168, 168, 168);
  --theme-elevation-400: rgb(154, 154, 154);
  --theme-elevation-450: rgb(141, 141, 141);
  --theme-elevation-500: rgb(128, 128, 128);
  --theme-elevation-550: rgb(114, 114, 114);
  --theme-elevation-600: rgb(101, 101, 101);
  --theme-elevation-650: rgb(87, 87, 87);
  --theme-elevation-700: rgb(74, 74, 74);
  --theme-elevation-750: rgb(60, 60, 60);
  --theme-elevation-800: rgb(47, 47, 47);
  --theme-elevation-850: rgb(34, 34, 34);
  --theme-elevation-900: rgb(20, 20, 20);
  --theme-elevation-950: rgb(7, 7, 7);
  --theme-elevation-1000: rgb(0, 0, 0);

  /* Force light-mode derived theme variables */
  --theme-bg: rgb(255, 255, 255);
  --theme-input-bg: rgb(255, 255, 255);
  --theme-text: rgb(47, 47, 47);

  /* Reset text color inheritance from Payload's dark mode */
  color: #1f2937;
}

/* Ensure form inputs have dark text */
.dark [class*="Puck"] input,
.dark [class*="Puck"] textarea,
.dark [class*="Puck"] select,
.dark [class*="puck-"] input,
.dark [class*="puck-"] textarea,
.dark [class*="puck-"] select,
[data-theme="dark"] [class*="Puck"] input,
[data-theme="dark"] [class*="Puck"] textarea,
[data-theme="dark"] [class*="Puck"] select,
[data-theme="dark"] [class*="puck-"] input,
[data-theme="dark"] [class*="puck-"] textarea,
[data-theme="dark"] [class*="puck-"] select {
  color: #1f2937 !important;
  background-color: #ffffff !important;
}

/* Ensure labels and text in Puck panels are dark */
.dark [class*="Puck"] label,
.dark [class*="Puck"] span,
.dark [class*="Puck"] p,
.dark [class*="puck-"] label,
.dark [class*="puck-"] span,
.dark [class*="puck-"] p,
[data-theme="dark"] [class*="Puck"] label,
[data-theme="dark"] [class*="Puck"] span,
[data-theme="dark"] [class*="Puck"] p,
[data-theme="dark"] [class*="puck-"] label,
[data-theme="dark"] [class*="puck-"] span,
[data-theme="dark"] [class*="puck-"] p {
  color: #1f2937;
}

/* Ensure buttons maintain proper styling */
.dark [class*="Puck"] button,
.dark [class*="puck-"] button,
[data-theme="dark"] [class*="Puck"] button,
[data-theme="dark"] [class*="puck-"] button {
  color: inherit;
}

/* Fix placeholder text */
.dark [class*="Puck"] input::placeholder,
.dark [class*="Puck"] textarea::placeholder,
.dark [class*="puck-"] input::placeholder,
.dark [class*="puck-"] textarea::placeholder,
[data-theme="dark"] [class*="Puck"] input::placeholder,
[data-theme="dark"] [class*="Puck"] textarea::placeholder,
[data-theme="dark"] [class*="puck-"] input::placeholder,
[data-theme="dark"] [class*="puck-"] textarea::placeholder {
  color: #9ca3af !important;
}

/* Ensure headings in Puck are visible */
.dark [class*="Puck"] h1,
.dark [class*="Puck"] h2,
.dark [class*="Puck"] h3,
.dark [class*="Puck"] h4,
.dark [class*="puck-"] h1,
.dark [class*="puck-"] h2,
.dark [class*="puck-"] h3,
.dark [class*="puck-"] h4,
[data-theme="dark"] [class*="Puck"] h1,
[data-theme="dark"] [class*="Puck"] h2,
[data-theme="dark"] [class*="Puck"] h3,
[data-theme="dark"] [class*="Puck"] h4,
[data-theme="dark"] [class*="puck-"] h1,
[data-theme="dark"] [class*="puck-"] h2,
[data-theme="dark"] [class*="puck-"] h3,
[data-theme="dark"] [class*="puck-"] h4 {
  color: #1f2937;
}
`.trim()

const STYLE_ID = 'puck-dark-mode-styles'

export interface DarkModeStylesProps {
  /**
   * Override automatic dark mode detection.
   * When true, always inject dark mode styles.
   * When false, never inject dark mode styles.
   * When undefined, use automatic detection.
   */
  forceEnabled?: boolean
}

/**
 * Injects dark mode CSS overrides for Puck when dark mode is detected.
 *
 * This component uses the useDarkMode hook to detect when PayloadCMS admin
 * is in dark mode (via .dark class) or when OS preference is dark mode.
 * It then injects/removes the CSS overrides accordingly.
 *
 * @example
 * ```tsx
 * function MyEditor() {
 *   return (
 *     <>
 *       <DarkModeStyles />
 *       <Puck ... />
 *     </>
 *   )
 * }
 * ```
 */
export function DarkModeStyles({ forceEnabled }: DarkModeStylesProps) {
  const { isDarkMode } = useDarkMode()

  // Determine if we should inject styles
  const shouldInject = forceEnabled ?? isDarkMode

  useEffect(() => {
    if (typeof document === 'undefined') return

    // Check if style element already exists
    let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null

    if (shouldInject) {
      // Inject styles if not already present
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = STYLE_ID
        styleElement.textContent = DARK_MODE_CSS
        document.head.appendChild(styleElement)
      }
    } else {
      // Remove styles if present
      if (styleElement) {
        styleElement.remove()
      }
    }

    // Cleanup on unmount
    return () => {
      const el = document.getElementById(STYLE_ID)
      if (el) {
        el.remove()
      }
    }
  }, [shouldInject])

  // This component doesn't render anything
  return null
}
