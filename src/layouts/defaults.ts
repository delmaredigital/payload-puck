/**
 * Default Layout Definitions
 *
 * These provide sensible defaults for common page layout patterns.
 * Users can override or extend these in their own configuration.
 */

import type { LayoutDefinition, LayoutConfig } from './types.js'

/**
 * Default layout - standard content width with padding
 */
export const defaultLayout: LayoutDefinition = {
  value: 'default',
  label: 'Default',
  description: 'Standard page layout with contained content width',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    content: '',
  },
  maxWidth: '1200px',
  fullWidth: false,
}

/**
 * Landing layout - optimized for marketing/landing pages
 */
export const landingLayout: LayoutDefinition = {
  value: 'landing',
  label: 'Landing',
  description: 'Full-width sections with no global container constraints',
  classes: {
    wrapper: '',
    container: '',
    content: '',
  },
  fullWidth: true,
}

/**
 * Full width layout - edge-to-edge content
 */
export const fullWidthLayout: LayoutDefinition = {
  value: 'full-width',
  label: 'Full Width',
  description: 'Content spans the full viewport width',
  classes: {
    wrapper: 'w-full',
    container: 'w-full',
    content: '',
  },
  maxWidth: '100%',
  fullWidth: true,
}

/**
 * Narrow layout - ideal for blog posts and articles
 */
export const narrowLayout: LayoutDefinition = {
  value: 'narrow',
  label: 'Narrow',
  description: 'Narrow content width for optimal reading experience',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6',
    content: '',
  },
  maxWidth: '768px',
  fullWidth: false,
}

/**
 * Wide layout - extra wide content area
 */
export const wideLayout: LayoutDefinition = {
  value: 'wide',
  label: 'Wide',
  description: 'Wider content area for dashboards or galleries',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    content: '',
  },
  maxWidth: '1440px',
  fullWidth: false,
}

/**
 * Default layouts included with the plugin
 */
export const DEFAULT_LAYOUTS: LayoutDefinition[] = [
  defaultLayout,
  landingLayout,
  fullWidthLayout,
]

/**
 * Extended layouts for users who want more options
 */
export const EXTENDED_LAYOUTS: LayoutDefinition[] = [
  defaultLayout,
  landingLayout,
  fullWidthLayout,
  narrowLayout,
  wideLayout,
]

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  layouts: DEFAULT_LAYOUTS,
  defaultLayout: 'default',
}
