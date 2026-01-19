'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Theme Context
 *
 * React context for distributing theme configuration to Puck components.
 * The useTheme() hook returns defaults when no provider is present,
 * ensuring backwards compatibility.
 */
import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_THEME } from './defaults';
import { resolveTheme } from './utils';
const ThemeContext = createContext(null);
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
export function ThemeProvider({ children, theme }) {
    const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
    const value = useMemo(() => ({
        theme: resolvedTheme,
    }), [resolvedTheme]);
    return _jsx(ThemeContext.Provider, { value: value, children: children });
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
export function useTheme() {
    const context = useContext(ThemeContext);
    // Return defaults if no provider - ensures backwards compatibility
    return context?.theme ?? DEFAULT_THEME;
}
/**
 * Gets the default theme for server components
 *
 * Use this when you need theme values in a server component
 * where hooks cannot be used.
 */
export function getDefaultTheme() {
    return DEFAULT_THEME;
}
/**
 * Hook to check if a ThemeProvider is present
 *
 * Useful for conditional logic based on whether theming is configured.
 */
export function useHasThemeProvider() {
    const context = useContext(ThemeContext);
    return context !== null;
}
//# sourceMappingURL=context.js.map