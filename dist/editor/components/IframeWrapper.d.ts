import { type ReactNode, type ComponentType } from 'react';
import type { LayoutDefinition } from '../../layouts';
/**
 * Layout style configuration for theme-aware preview
 * @deprecated Use LayoutDefinition with editorBackground and editorDarkMode instead
 */
export interface LayoutStyle {
    /**
     * CSS background value (color, gradient, etc.)
     */
    background: string;
    /**
     * Whether this layout uses dark mode styling
     */
    isDark: boolean;
    /**
     * Header component to render above the page content in the editor preview
     */
    header?: ComponentType;
    /**
     * Footer component to render below the page content in the editor preview
     */
    footer?: ComponentType;
}
export interface IframeWrapperProps {
    children: ReactNode;
    /**
     * The iframe document to apply styles to
     */
    document?: Document;
    /**
     * Layout definitions - the primary way to configure layouts.
     * Reads header, footer, editorBackground, and editorDarkMode from each layout.
     */
    layouts?: LayoutDefinition[];
    /**
     * Layout style configurations keyed by layout value
     * @deprecated Use `layouts` prop instead
     */
    layoutStyles?: Record<string, LayoutStyle>;
    /**
     * Key in root.props to read layout value from
     * @default 'pageLayout'
     */
    layoutKey?: string;
    /**
     * Default layout to use if none specified
     * @default 'default'
     */
    defaultLayout?: string;
    /**
     * Stylesheet URLs to inject into the iframe.
     * These are merged from PuckConfigProvider and layout-specific settings.
     * Use this to provide frontend CSS (Tailwind, CSS variables, etc.) that
     * header/footer components need for proper styling.
     */
    editorStylesheets?: string[];
    /**
     * Raw CSS to inject into the iframe.
     * Merged from PuckConfigProvider and layout-specific settings.
     * Useful for CSS variables or style overrides.
     */
    editorCss?: string;
    /**
     * Override the layout's dark mode setting for the preview.
     * When true, forces dark mode in the preview iframe.
     * When false, forces light mode in the preview iframe.
     * When undefined, uses the layout's editorDarkMode setting.
     */
    previewDarkModeOverride?: boolean;
}
/**
 * Theme-aware iframe wrapper component
 *
 * Uses usePuck to read the pageLayout from root.props and applies
 * appropriate background and theme class to the preview iframe.
 *
 * @example
 * ```tsx
 * // Using layouts (recommended)
 * const overrides = {
 *   iframe: ({ children, document }) => (
 *     <IframeWrapper
 *       document={document}
 *       layouts={[
 *         { value: 'default', label: 'Default', header: Header, footer: Footer },
 *         { value: 'landing', label: 'Landing', editorBackground: '#f8fafc' },
 *       ]}
 *     >
 *       {children}
 *     </IframeWrapper>
 *   ),
 * }
 * ```
 */
export declare const IframeWrapper: import("react").NamedExoticComponent<IframeWrapperProps>;
//# sourceMappingURL=IframeWrapper.d.ts.map