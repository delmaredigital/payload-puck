export interface PreviewModeToggleProps {
    /**
     * Whether dark mode is currently enabled in the preview
     */
    isDarkMode: boolean;
    /**
     * Callback when the mode is toggled
     */
    onToggle: (isDarkMode: boolean) => void;
    /**
     * Whether the toggle is disabled
     */
    disabled?: boolean;
}
/**
 * Toggle button for switching preview iframe between light/dark modes.
 *
 * This controls the preview content's dark mode independently from the
 * editor UI dark mode. Useful for testing how the page looks in both modes.
 *
 * @example
 * ```tsx
 * const [previewDarkMode, setPreviewDarkMode] = useState(false)
 *
 * <PreviewModeToggle
 *   isDarkMode={previewDarkMode}
 *   onToggle={setPreviewDarkMode}
 * />
 * ```
 */
export declare const PreviewModeToggle: import("react").NamedExoticComponent<PreviewModeToggleProps>;
//# sourceMappingURL=PreviewModeToggle.d.ts.map