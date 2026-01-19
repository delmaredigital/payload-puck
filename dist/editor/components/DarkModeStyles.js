'use client';
import { useEffect } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
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
 * This CSS forces light-mode text colors in Puck UI elements
 * to prevent white-on-white text when Payload is in dark mode.
 */

/* Force dark text in all Puck form inputs and UI elements */
.dark [class*="Puck"],
.dark [class*="puck-"],
[data-theme="dark"] [class*="Puck"],
[data-theme="dark"] [class*="puck-"] {
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
`.trim();
const STYLE_ID = 'puck-dark-mode-styles';
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
export function DarkModeStyles({ forceEnabled }) {
    const { isDarkMode } = useDarkMode();
    // Determine if we should inject styles
    const shouldInject = forceEnabled ?? isDarkMode;
    useEffect(() => {
        if (typeof document === 'undefined')
            return;
        // Check if style element already exists
        let styleElement = document.getElementById(STYLE_ID);
        if (shouldInject) {
            // Inject styles if not already present
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = STYLE_ID;
                styleElement.textContent = DARK_MODE_CSS;
                document.head.appendChild(styleElement);
            }
        }
        else {
            // Remove styles if present
            if (styleElement) {
                styleElement.remove();
            }
        }
        // Cleanup on unmount
        return () => {
            const el = document.getElementById(STYLE_ID);
            if (el) {
                el.remove();
            }
        };
    }, [shouldInject]);
    // This component doesn't render anything
    return null;
}
//# sourceMappingURL=DarkModeStyles.js.map