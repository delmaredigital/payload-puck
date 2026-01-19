/**
 * Default Theme Values
 *
 * These defaults ensure backwards compatibility - components render
 * identically to before theming was introduced when no theme is provided.
 */
import type { ButtonVariantStyles, BackgroundStyles, ColorPreset, ResolvedTheme } from './types';
/**
 * Default button variant styles
 * Uses semantic Tailwind classes that map to CSS variables (--primary, --secondary, etc.)
 * This allows consuming apps to customize colors via their theme CSS variables.
 */
export declare const DEFAULT_BUTTON_VARIANTS: ButtonVariantStyles;
/**
 * Default CTA button variant styles
 * Uses semantic Tailwind classes that map to CSS variables.
 */
export declare const DEFAULT_CTA_BUTTON_VARIANTS: ButtonVariantStyles;
/**
 * Default CTA background styles
 * Uses semantic Tailwind classes that map to CSS variables.
 */
export declare const DEFAULT_CTA_BACKGROUND_STYLES: BackgroundStyles;
/**
 * Default color picker presets
 * Matches DEFAULT_PRESETS from ColorPickerField.tsx
 */
export declare const DEFAULT_COLOR_PRESETS: ColorPreset[];
/**
 * Default focus ring color class
 * Uses semantic ring color from CSS variables
 */
export declare const DEFAULT_FOCUS_RING = "focus:ring-ring";
/**
 * Complete default theme
 * Used when no ThemeProvider is present or no theme config is provided
 */
export declare const DEFAULT_THEME: ResolvedTheme;
//# sourceMappingURL=defaults.d.ts.map