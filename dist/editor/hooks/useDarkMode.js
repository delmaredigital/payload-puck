'use client';
import { useState, useEffect, useCallback } from 'react';
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
export function useDarkMode() {
    const [state, setState] = useState({
        isDarkMode: false,
        source: 'none',
    });
    // Check for dark mode class on document element
    const checkDarkModeClass = useCallback(() => {
        if (typeof document === 'undefined')
            return false;
        return document.documentElement.classList.contains('dark');
    }, []);
    // Check for OS dark mode preference
    const checkMediaQuery = useCallback(() => {
        if (typeof window === 'undefined')
            return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }, []);
    // Compute current dark mode state
    const computeState = useCallback(() => {
        // Priority 1: Check for .dark class (PayloadCMS)
        if (checkDarkModeClass()) {
            return { isDarkMode: true, source: 'class' };
        }
        // Priority 2: Check OS preference
        if (checkMediaQuery()) {
            return { isDarkMode: true, source: 'media-query' };
        }
        return { isDarkMode: false, source: 'none' };
    }, [checkDarkModeClass, checkMediaQuery]);
    useEffect(() => {
        // Set initial state
        setState(computeState());
        // Watch for class changes on document element
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class') {
                    setState(computeState());
                    break;
                }
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        // Watch for OS preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = () => {
            setState(computeState());
        };
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    }, [computeState]);
    return state;
}
//# sourceMappingURL=useDarkMode.js.map