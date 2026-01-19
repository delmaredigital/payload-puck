/**
 * Theme Context
 *
 * React context for distributing theme configuration to Puck components.
 * The useTheme() hook returns defaults when no provider is present,
 * ensuring backwards compatibility.
 */
import { type ReactNode } from 'react';
import type { ThemeConfig, ResolvedTheme } from './types';
export interface ThemeProviderProps {
    children: ReactNode;
    /** Theme configuration to apply */
    theme?: ThemeConfig;
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
export declare function ThemeProvider({ children, theme }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
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
export declare function useTheme(): ResolvedTheme;
/**
 * Gets the default theme for server components
 *
 * Use this when you need theme values in a server component
 * where hooks cannot be used.
 */
export declare function getDefaultTheme(): ResolvedTheme;
/**
 * Hook to check if a ThemeProvider is present
 *
 * Useful for conditional logic based on whether theming is configured.
 */
export declare function useHasThemeProvider(): boolean;
//# sourceMappingURL=context.d.ts.map