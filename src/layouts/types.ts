/**
 * Layout System Types
 *
 * Defines the structure for page layouts that affect how content is rendered.
 */

import type { ReactNode, CSSProperties, ComponentType } from 'react'

/**
 * A layout option shown in the Puck editor's layout selector
 */
export interface LayoutOption {
  /** Unique identifier for the layout */
  value: string
  /** Display name in the editor */
  label: string
  /** Optional description shown in the editor */
  description?: string
}

/**
 * CSS class configuration for a layout
 */
export interface LayoutClasses {
  /** Classes applied to the outermost wrapper */
  wrapper?: string
  /** Classes applied to the main content container */
  container?: string
  /** Classes applied to the content area */
  content?: string
}

/**
 * Style configuration for a layout
 */
export interface LayoutStyles {
  /** Styles applied to the outermost wrapper */
  wrapper?: CSSProperties
  /** Styles applied to the main content container */
  container?: CSSProperties
  /** Styles applied to the content area */
  content?: CSSProperties
}

/**
 * Complete layout definition
 */
export interface LayoutDefinition extends LayoutOption {
  /** CSS classes to apply */
  classes?: LayoutClasses
  /** Inline styles to apply */
  styles?: LayoutStyles
  /** Custom wrapper component (overrides default rendering) */
  wrapper?: React.ComponentType<{ children: ReactNode }>
  /** Max width constraint (e.g., '1200px', '100%') */
  maxWidth?: string
  /** Whether the layout uses full viewport width */
  fullWidth?: boolean
  /** Additional data attributes to add */
  dataAttributes?: Record<string, string>
  /**
   * Header component to render above the page content.
   * Shown in both the editor preview and the rendered page.
   */
  header?: ComponentType
  /**
   * Footer component to render below the page content.
   * Shown in both the editor preview and the rendered page.
   */
  footer?: ComponentType
  /**
   * Background color/gradient for the editor preview.
   * Applied to the iframe body in the Puck editor.
   * @default '#ffffff'
   */
  editorBackground?: string
  /**
   * Whether this layout uses dark mode styling in the editor preview.
   * Controls text color and theme class on the iframe.
   * @default false
   */
  editorDarkMode?: boolean
  /**
   * Height of a sticky/fixed header in pixels.
   * Used to add padding-top to the content area in the editor preview
   * so content doesn't render behind the header.
   * @example 64 // for a 64px tall sticky header
   */
  stickyHeaderHeight?: number
  /**
   * Whether to push the footer to the bottom of the viewport.
   * Uses flexbox to ensure the footer stays at the bottom even when
   * page content is minimal. Set to `false` to allow footer to flow
   * naturally after content.
   * @default true
   */
  stickyFooter?: boolean
  /**
   * Additional stylesheet URLs to inject into the editor iframe for this layout.
   * Merged with stylesheets from PuckConfigProvider.
   * Use this for layout-specific styles that differ from the global editor styles.
   *
   * @example
   * ```tsx
   * {
   *   value: 'landing',
   *   label: 'Landing',
   *   editorStylesheets: ['/landing-styles.css'],
   * }
   * ```
   */
  editorStylesheets?: string[]
  /**
   * Additional CSS to inject into the editor iframe for this layout.
   * Merged with CSS from PuckConfigProvider.
   * Use this for layout-specific CSS variables or style overrides.
   *
   * @example
   * ```tsx
   * {
   *   value: 'dark-theme',
   *   label: 'Dark Theme',
   *   editorCss: ':root { --background: #1a1a1a; }',
   * }
   * ```
   */
  editorCss?: string
}

/**
 * Layout configuration passed to the plugin/renderer
 */
export interface LayoutConfig {
  /** Available layouts */
  layouts: LayoutDefinition[]
  /** Default layout value to use */
  defaultLayout?: string
}

/**
 * Props passed to a custom layout wrapper component
 */
export interface LayoutWrapperProps {
  children: ReactNode
  layout: LayoutDefinition
  pageTitle?: string
}
