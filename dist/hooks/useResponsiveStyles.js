'use client';
/**
 * useResponsiveStyles - Runtime breakpoint detection for responsive values
 *
 * Returns the appropriate value for the current viewport width.
 * Enables live preview in the Puck editor when resizing.
 */
import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS, isResponsiveValue } from '../fields/shared';
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Gets the current breakpoint based on window width
 */
function getCurrentBreakpoint() {
    if (typeof window === 'undefined')
        return 'xs';
    const width = window.innerWidth;
    // Check breakpoints from largest to smallest
    for (let i = BREAKPOINTS.length - 1; i >= 0; i--) {
        const bp = BREAKPOINTS[i];
        if (bp.minWidth !== null && width >= bp.minWidth) {
            return bp.key;
        }
    }
    return 'xs';
}
/**
 * Gets the effective value for a breakpoint with mobile-first cascade
 * Falls back through smaller breakpoints to xs base
 */
function getValueForBreakpoint(value, breakpoint) {
    // For xs, return xs value directly (it's required)
    if (breakpoint === 'xs') {
        return value.xs;
    }
    // Check if this breakpoint has an explicit value
    const explicitValue = value[breakpoint];
    if (explicitValue !== undefined) {
        return explicitValue;
    }
    // Cascade down to find the nearest defined value (mobile-first)
    const breakpointOrder = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        const bpValue = value[bp];
        if (bpValue !== undefined) {
            return bpValue;
        }
    }
    // Fallback to xs base (always exists in valid ResponsiveValue)
    return value.xs;
}
// =============================================================================
// Hook: useCurrentBreakpoint
// =============================================================================
/**
 * Returns the current breakpoint based on window width.
 * Updates when window is resized.
 */
export function useCurrentBreakpoint(options = {}) {
    const { listenToResize = true, debounceDelay = 100 } = options;
    const [breakpoint, setBreakpoint] = useState(() => getCurrentBreakpoint());
    useEffect(() => {
        if (!listenToResize || typeof window === 'undefined')
            return;
        let timeoutId = null;
        const handleResize = () => {
            if (timeoutId)
                clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setBreakpoint(getCurrentBreakpoint());
            }, debounceDelay);
        };
        window.addEventListener('resize', handleResize);
        // Initial check
        setBreakpoint(getCurrentBreakpoint());
        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutId)
                clearTimeout(timeoutId);
        };
    }, [listenToResize, debounceDelay]);
    return breakpoint;
}
// =============================================================================
// Hook: useResponsiveValue
// =============================================================================
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
export function useResponsiveValue(value, defaultValue, options = {}) {
    const currentBreakpoint = useCurrentBreakpoint(options);
    return useCallback(() => {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return defaultValue;
        }
        // If not a responsive value, return as-is
        if (!isResponsiveValue(value)) {
            return value;
        }
        // Get value for current breakpoint with mobile-first cascade
        return getValueForBreakpoint(value, currentBreakpoint);
    }, [value, defaultValue, currentBreakpoint])();
}
// =============================================================================
// Hook: useResponsiveStyles (Main Export)
// =============================================================================
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
export function useResponsiveStyles(value, converter, defaultValue, options = {}) {
    const effectiveValue = useResponsiveValue(value, defaultValue, options);
    return converter(effectiveValue) || {};
}
//# sourceMappingURL=useResponsiveStyles.js.map