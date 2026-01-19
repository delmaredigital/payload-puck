'use client';
/**
 * useScrollAnimation - Hook for scroll-triggered animations
 *
 * Uses IntersectionObserver to detect when an element enters the viewport.
 * Perfect for triggering entrance animations, lazy loading, or scroll-based effects.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
// =============================================================================
// Hook Implementation
// =============================================================================
export function useScrollAnimation(options = {}) {
    const { triggerOnScroll = true, threshold = 0.1, once = true, rootMargin = '0px', delay = 0, } = options;
    const ref = useRef(null);
    // Always start with isInView: false to allow initial → animate transition
    const [isInView, setIsInView] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const timeoutRef = useRef(null);
    const hasMountedRef = useRef(false);
    // Reset function
    const reset = useCallback(() => {
        setIsInView(false);
        setHasAnimated(false);
        hasMountedRef.current = false;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);
    useEffect(() => {
        // If not triggering on scroll, animate immediately after mount
        // Use requestAnimationFrame to ensure the initial state is rendered first
        if (!triggerOnScroll) {
            // Skip if already mounted (prevents re-triggering on re-renders)
            if (hasMountedRef.current)
                return;
            hasMountedRef.current = true;
            // Use double RAF to ensure browser has painted initial state
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (delay > 0) {
                        timeoutRef.current = setTimeout(() => {
                            setIsInView(true);
                            setHasAnimated(true);
                        }, delay);
                    }
                    else {
                        setIsInView(true);
                        setHasAnimated(true);
                    }
                });
            });
            return;
        }
        // If once mode and already animated, skip observer setup
        if (once && hasAnimated) {
            return;
        }
        const element = ref.current;
        if (!element)
            return;
        // Check if IntersectionObserver is available (SSR safety)
        if (typeof IntersectionObserver === 'undefined') {
            setIsInView(true);
            setHasAnimated(true);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            const inView = entry.isIntersecting;
            if (inView) {
                if (delay > 0) {
                    // Apply delay before setting isInView
                    timeoutRef.current = setTimeout(() => {
                        setIsInView(true);
                        setHasAnimated(true);
                    }, delay);
                }
                else {
                    setIsInView(true);
                    setHasAnimated(true);
                }
                // If once mode, disconnect observer after triggering
                if (once) {
                    observer.disconnect();
                }
            }
            else if (!once) {
                // Only update isInView to false if not in once mode
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                setIsInView(false);
            }
        }, {
            threshold,
            rootMargin,
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [triggerOnScroll, threshold, once, rootMargin, delay, hasAnimated]);
    return {
        ref,
        isInView,
        hasAnimated,
        reset,
    };
}
//# sourceMappingURL=useScrollAnimation.js.map