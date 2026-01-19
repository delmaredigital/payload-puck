import type { Breakpoint, ResponsiveValue } from '../fields/shared';
export interface UseResponsiveStylesOptions {
    /** Whether to listen for resize events (default: true) */
    listenToResize?: boolean;
    /** Debounce delay in ms for resize events (default: 100) */
    debounceDelay?: number;
}
/**
 * Returns the current breakpoint based on window width.
 * Updates when window is resized.
 */
export declare function useCurrentBreakpoint(options?: UseResponsiveStylesOptions): Breakpoint;
/**
 * Returns the appropriate value from a ResponsiveValue based on current viewport.
 *
 * @param value - The responsive or non-responsive value
 * @param defaultValue - Default value if null/undefined
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function MyComponent({ padding }: { padding: ResponsiveValue<PaddingValue> | PaddingValue | null }) {
 *   const effectivePadding = useResponsiveValue(padding, DEFAULT_PADDING)
 *   // effectivePadding will be the appropriate value for current viewport
 * }
 * ```
 */
export declare function useResponsiveValue<T>(value: ResponsiveValue<T> | T | null | undefined, defaultValue: T, options?: UseResponsiveStylesOptions): T;
/**
 * Converts a responsive value to CSS properties for the current viewport.
 * Useful for applying styles dynamically in the editor.
 *
 * @param value - The responsive or non-responsive value
 * @param converter - Function to convert value to CSS properties
 * @param defaultValue - Default value if null/undefined
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function MyComponent({ dimensions }: Props) {
 *   const styles = useResponsiveStyles(
 *     dimensions,
 *     dimensionsValueToCSS,
 *     DEFAULT_DIMENSIONS
 *   )
 *   return <div style={styles}>...</div>
 * }
 * ```
 */
export declare function useResponsiveStyles<T>(value: ResponsiveValue<T> | T | null | undefined, converter: (v: T) => React.CSSProperties | undefined, defaultValue: T, options?: UseResponsiveStylesOptions): React.CSSProperties;
//# sourceMappingURL=useResponsiveStyles.d.ts.map