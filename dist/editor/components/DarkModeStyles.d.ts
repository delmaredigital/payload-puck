export interface DarkModeStylesProps {
    /**
     * Override automatic dark mode detection.
     * When true, always inject dark mode styles.
     * When false, never inject dark mode styles.
     * When undefined, use automatic detection.
     */
    forceEnabled?: boolean;
}
/**
 * Injects dark mode CSS overrides for Puck when dark mode is detected.
 *
 * This component uses the useDarkMode hook to detect when PayloadCMS admin
 * is in dark mode (via .dark class) or when OS preference is dark mode.
 * It then injects/removes the CSS overrides accordingly.
 *
 * @example
 * ```tsx
 * function MyEditor() {
 *   return (
 *     <>
 *       <DarkModeStyles />
 *       <Puck ... />
 *     </>
 *   )
 * }
 * ```
 */
export declare function DarkModeStyles({ forceEnabled }: DarkModeStylesProps): null;
//# sourceMappingURL=DarkModeStyles.d.ts.map