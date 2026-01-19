/**
 * Theme Resolution Utilities
 *
 * Functions for merging user-provided theme config with defaults
 * and safely accessing theme values.
 */
import type { ThemeConfig, ResolvedTheme, ButtonVariantStyles, BackgroundStyles } from './types';
/**
 * Merges user-provided theme config with defaults to create a fully resolved theme
 */
export declare function resolveTheme(config?: ThemeConfig): ResolvedTheme;
/**
 * Safely gets variant classes from a variant styles object
 *
 * @param variants - The button variant styles object
 * @param variant - The variant key to look up
 * @param fallback - Fallback variant key if the requested variant doesn't exist
 * @returns The CSS classes string for the variant
 */
export declare function getVariantClasses(variants: ButtonVariantStyles, variant: string, fallback?: string): string;
/**
 * Safely gets background style classes
 *
 * @param styles - The background styles object
 * @param style - The style key to look up
 * @param fallback - Fallback style key if the requested style doesn't exist
 * @returns The CSS classes string for the background
 */
export declare function getBackgroundClasses(styles: BackgroundStyles, style: string, fallback?: string): string;
//# sourceMappingURL=utils.d.ts.map