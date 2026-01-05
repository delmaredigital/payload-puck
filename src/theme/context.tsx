'use client'

/**
 * Theme Context
 *
 * React context for distributing theme configuration to Puck components.
 * The useTheme() hook returns defaults when no provider is present,
 * ensuring backwards compatibility.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ThemeConfig, ThemeContextValue, ResolvedTheme } from './types'
import { DEFAULT_THEME } from './defaults'
import { resolveTheme } from './utils'

const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: ReactNode
  /** Theme configuration to apply */
  theme?: ThemeConfig
}

/**
 * Provides theme configuration to descendant Puck components
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={{
 *   buttonVariants: {
 *     default: { classes: 'bg-primary text-white hover:bg-primary/90' }
 *   }
 * }}>
 *   <PageRenderer data={data} />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
    }),
    [resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access the current theme
 *
 * Returns DEFAULT_THEME if no ThemeProvider is present,
 * ensuring components work standalone for backwards compatibility.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme()
 *   const buttonClasses = getVariantClasses(theme.buttonVariants, 'primary')
 *   return <button className={buttonClasses}>Click me</button>
 * }
 * ```
 */
export function useTheme(): ResolvedTheme {
  const context = useContext(ThemeContext)
  // Return defaults if no provider - ensures backwards compatibility
  return context?.theme ?? DEFAULT_THEME
}

/**
 * Gets the default theme for server components
 *
 * Use this when you need theme values in a server component
 * where hooks cannot be used.
 */
export function getDefaultTheme(): ResolvedTheme {
  return DEFAULT_THEME
}

/**
 * Hook to check if a ThemeProvider is present
 *
 * Useful for conditional logic based on whether theming is configured.
 */
export function useHasThemeProvider(): boolean {
  const context = useContext(ThemeContext)
  return context !== null
}
