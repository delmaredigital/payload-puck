'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Source of dark mode detection
 */
export type DarkModeSource = 'attribute' | 'class' | 'media-query' | 'none'

/**
 * Return type for useDarkMode hook
 */
export interface UseDarkModeReturn {
  /**
   * Whether dark mode is currently active
   */
  isDarkMode: boolean
  /**
   * How dark mode was detected
   */
  source: DarkModeSource
}

/**
 * Detects dark mode state from PayloadCMS admin or OS preferences.
 *
 * Detection priority:
 * 1. `data-theme` on `document.documentElement`. Payload admin always sets it
 *    (resolving its "auto" setting against the OS), so when present it is
 *    authoritative in both directions.
 * 2. `.dark` class on `document.documentElement` (class-based themes)
 * 3. `prefers-color-scheme: dark` media query (OS preference)
 *
 * Uses MutationObserver to track `data-theme`/class changes in real-time.
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
export function useDarkMode(): UseDarkModeReturn {
  const [state, setState] = useState<UseDarkModeReturn>({
    isDarkMode: false,
    source: 'none',
  })

  // Payload's theme attribute: 'dark' | 'light', or null when absent
  const readThemeAttribute = useCallback((): string | null => {
    if (typeof document === 'undefined') return null
    return document.documentElement.getAttribute('data-theme')
  }, [])

  // Check for dark mode class on document element
  const checkDarkModeClass = useCallback((): boolean => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  }, [])

  // Check for OS dark mode preference
  const checkMediaQuery = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  // Compute current dark mode state
  const computeState = useCallback((): UseDarkModeReturn => {
    // Priority 1: Payload's data-theme attribute
    const themeAttribute = readThemeAttribute()
    if (themeAttribute === 'dark' || themeAttribute === 'light') {
      return { isDarkMode: themeAttribute === 'dark', source: 'attribute' }
    }

    // Priority 2: Check for .dark class
    if (checkDarkModeClass()) {
      return { isDarkMode: true, source: 'class' }
    }

    // Priority 3: Check OS preference
    if (checkMediaQuery()) {
      return { isDarkMode: true, source: 'media-query' }
    }

    return { isDarkMode: false, source: 'none' }
  }, [readThemeAttribute, checkDarkModeClass, checkMediaQuery])

  useEffect(() => {
    // Set initial state
    setState(computeState())

    // Watch for theme attribute/class changes on document element
    const observer = new MutationObserver(() => {
      setState(computeState())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    // Watch for OS preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      setState(computeState())
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [computeState])

  return state
}
