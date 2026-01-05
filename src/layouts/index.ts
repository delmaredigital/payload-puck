/**
 * Layouts Module
 *
 * Dynamic page layout system for payload-puck.
 *
 * @example
 * ```tsx
 * import {
 *   DEFAULT_LAYOUTS,
 *   createLayout,
 *   mergeLayouts,
 * } from '@delmaredigital/payload-puck/layouts'
 *
 * // Create custom layouts
 * const customLayouts = mergeLayouts(DEFAULT_LAYOUTS, [
 *   createLayout({
 *     value: 'blog',
 *     label: 'Blog Post',
 *     maxWidth: '720px',
 *     classes: { container: 'mx-auto px-4 prose' },
 *   }),
 * ])
 * ```
 */

// Types
export type {
  LayoutOption,
  LayoutClasses,
  LayoutStyles,
  LayoutDefinition,
  LayoutConfig,
  LayoutWrapperProps,
} from './types'

// Defaults
export {
  defaultLayout,
  landingLayout,
  fullWidthLayout,
  narrowLayout,
  wideLayout,
  DEFAULT_LAYOUTS,
  EXTENDED_LAYOUTS,
  DEFAULT_LAYOUT_CONFIG,
} from './defaults'

// Utilities
export {
  resolveLayoutConfig,
  getLayout,
  layoutsToOptions,
  layoutsToPayloadOptions,
  createLayout,
  mergeLayouts,
} from './utils'

// Components
export { LayoutWrapper, type LayoutWrapperProps as LayoutWrapperComponentProps, type PageOverrides } from './LayoutWrapper'
