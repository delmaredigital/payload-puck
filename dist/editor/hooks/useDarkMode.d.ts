/**
 * Source of dark mode detection
 */
export type DarkModeSource = 'class' | 'media-query' | 'none';
/**
 * Return type for useDarkMode hook
 */
export interface UseDarkModeReturn {
    /**
     * Whether dark mode is currently active
     */
    isDarkMode: boolean;
    /**
     * How dark mode was detected
     */
    source: DarkModeSource;
}
/**
 * Detects dark mode state from PayloadCMS admin or OS preferences.
 *
 * Detection priority:
 * 1. `.dark` class on `document.documentElement` (PayloadCMS admin)
 * 2. `prefers-color-scheme: dark` media query (OS preference)
 *
 * Uses MutationObserver to track class changes in real-time.
 *
 * @example
 * ```tsx
 * const { isDarkMode, source } = useDarkMode()
 *
 * if (isDarkMode) {
 *   // Apply dark mode styles
 * }
 * ```
 */
export declare function useDarkMode(): UseDarkModeReturn;
//# sourceMappingURL=useDarkMode.d.ts.map