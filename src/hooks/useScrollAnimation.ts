'use client'

/**
 * useScrollAnimation - Hook for scroll-triggered animations
 *
 * Uses IntersectionObserver to detect when an element enters the viewport.
 * Perfect for triggering entrance animations, lazy loading, or scroll-based effects.
 */

import { useRef, useState, useEffect, useCallback } from 'react'

// =============================================================================
// Types
// =============================================================================

export interface UseScrollAnimationOptions {
  /**
   * Whether to trigger animation on scroll into view.
   * If false, isInView will always be true.
   * @default true
   */
  triggerOnScroll?: boolean

  /**
   * Threshold for intersection (0-1).
   * 0 = trigger as soon as any pixel is visible.
   * 1 = trigger only when fully visible.
   * @default 0.1
   */
  threshold?: number

  /**
   * Whether to only trigger once.
   * If true, hasAnimated will stay true after first trigger.
   * @default true
   */
  once?: boolean

  /**
   * Root margin for intersection observer.
   * Allows triggering before/after the element enters the viewport.
   * @example "-50px" // Trigger 50px before entering viewport
   * @example "100px 0px" // 100px top/bottom, 0px left/right
   * @default "0px"
   */
  rootMargin?: string

  /**
   * Delay in milliseconds before setting isInView to true.
   * Useful for staggering animations.
   * @default 0
   */
  delay?: number
}

export interface UseScrollAnimationResult<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the element you want to observe
   */
  ref: React.RefObject<T | null>

  /**
   * Whether the element is currently in view
   */
  isInView: boolean

  /**
   * Whether the element has ever been in view
   * (useful for once-only animations)
   */
  hasAnimated: boolean

  /**
   * Manually reset the animation state
   */
  reset: () => void
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationResult<T> {
  const {
    triggerOnScroll = true,
    threshold = 0.1,
    once = true,
    rootMargin = '0px',
    delay = 0,
  } = options

  const ref = useRef<T | null>(null)
  // Always start with isInView: false to allow initial → animate transition
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedRef = useRef(false)

  // Reset function
  const reset = useCallback(() => {
    setIsInView(false)
    setHasAnimated(false)
    hasMountedRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    // If not triggering on scroll, animate immediately after mount
    // Use requestAnimationFrame to ensure the initial state is rendered first
    if (!triggerOnScroll) {
      // Skip if already mounted (prevents re-triggering on re-renders)
      if (hasMountedRef.current) return
      hasMountedRef.current = true

      // Use double RAF to ensure browser has painted initial state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
              setIsInView(true)
              setHasAnimated(true)
            }, delay)
          } else {
            setIsInView(true)
            setHasAnimated(true)
          }
        })
      })
      return
    }

    // If once mode and already animated, skip observer setup
    if (once && hasAnimated) {
      return
    }

    const element = ref.current
    if (!element) return

    // Check if IntersectionObserver is available (SSR safety)
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      setHasAnimated(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const inView = entry.isIntersecting

        if (inView) {
          if (delay > 0) {
            // Apply delay before setting isInView
            timeoutRef.current = setTimeout(() => {
              setIsInView(true)
              setHasAnimated(true)
            }, delay)
          } else {
            setIsInView(true)
            setHasAnimated(true)
          }

          // If once mode, disconnect observer after triggering
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          // Only update isInView to false if not in once mode
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [triggerOnScroll, threshold, once, rootMargin, delay, hasAnimated])

  return {
    ref,
    isInView,
    hasAnimated,
    reset,
  }
}
