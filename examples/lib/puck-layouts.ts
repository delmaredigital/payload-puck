/**
 * Custom Page Layouts
 *
 * Copy this file to: src/lib/puck-layouts.ts
 *
 * Define custom page layouts that affect how Puck content is rendered.
 * Each layout can specify CSS classes, max-width constraints, header/footer
 * components, and editor preview styling.
 *
 * Usage:
 * 1. Copy this file to your project's lib folder
 * 2. Import your Header/Footer components
 * 3. Customize the layouts to match your design system
 * 4. Import and use in your PuckEditor, PageRenderer, and plugin config
 */

import {
  DEFAULT_LAYOUTS,
  createLayout,
  mergeLayouts,
  type LayoutDefinition,
} from '@delmaredigital/payload-puck/layouts'

// =============================================================================
// Import your site's header/footer components
// =============================================================================

// Uncomment and adjust these imports for your project:
// import { Header } from '@/components/header'
// import { Footer } from '@/components/footer'

// =============================================================================
// Layouts with Header/Footer Examples
// =============================================================================

/**
 * Default layout with sticky header
 *
 * For layouts with sticky/fixed headers, set stickyHeaderHeight to the
 * header's pixel height. This adds padding-top to content in both the
 * editor preview AND the frontend, ensuring content doesn't render
 * behind the header.
 *
 * Note: stickyFooter defaults to true - the footer will always be pushed
 * to the bottom of the viewport even with minimal content. Set to false
 * if you want the footer to flow naturally after content.
 */
export const defaultWithHeader = createLayout({
  value: 'default',
  label: 'Default',
  description: 'Standard page layout with header and footer',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    content: '',
  },
  maxWidth: '1200px',
  fullWidth: false,
  // Uncomment to add your header/footer:
  // header: Header,
  // footer: Footer,
  // Editor preview settings
  editorBackground: '#ffffff',
  editorDarkMode: false,
  // Set this to your header's height if it's sticky/fixed
  stickyHeaderHeight: 80,
  // stickyFooter: true (default) - footer stays at bottom of viewport
  // Set to false if you want footer to flow after content:
  // stickyFooter: false,
})

/**
 * Landing page layout - no header/footer
 *
 * Full-width layout for custom landing pages where you want
 * complete control over the header area (e.g., transparent headers
 * over hero sections).
 */
export const landingLayout = createLayout({
  value: 'landing',
  label: 'Landing',
  description: 'Full-width layout without header/footer',
  classes: {
    wrapper: '',
    container: '',
    content: '',
  },
  fullWidth: true,
  // No header/footer - landing pages have custom designs
  editorBackground: '#f8fafc',
  editorDarkMode: false,
})

/**
 * Dark theme layout example
 *
 * Demonstrates editorDarkMode for layouts with dark backgrounds.
 */
export const darkLayout = createLayout({
  value: 'dark',
  label: 'Dark',
  description: 'Dark theme layout',
  classes: {
    wrapper: 'bg-gray-900',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    content: '',
  },
  maxWidth: '1200px',
  fullWidth: false,
  // Uncomment to add dark-themed header/footer:
  // header: DarkHeader,
  // footer: DarkFooter,
  editorBackground: '#111827', // gray-900
  editorDarkMode: true,
  stickyHeaderHeight: 80,
})

// =============================================================================
// Additional Layout Examples
// =============================================================================

/**
 * Blog post layout - narrow width optimized for reading
 */
export const blogLayout = createLayout({
  value: 'blog',
  label: 'Blog Post',
  description: 'Narrow layout optimized for long-form reading',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6',
    content: 'prose prose-lg max-w-none',
  },
  maxWidth: '720px',
  fullWidth: false,
  // Uncomment for blog header/footer:
  // header: Header,
  // footer: Footer,
  editorBackground: '#ffffff',
  stickyHeaderHeight: 80,
})

/**
 * Documentation layout - with sidebar space consideration
 */
export const docsLayout = createLayout({
  value: 'docs',
  label: 'Documentation',
  description: 'Layout for documentation pages',
  classes: {
    wrapper: '',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    content: 'prose max-w-none',
  },
  maxWidth: '900px',
  fullWidth: false,
})

/**
 * Dashboard layout - full width with minimal padding
 */
export const dashboardLayout = createLayout({
  value: 'dashboard',
  label: 'Dashboard',
  description: 'Full-width layout for dashboards and data displays',
  classes: {
    wrapper: 'min-h-screen bg-gray-50',
    container: 'p-4 sm:p-6',
    content: '',
  },
  fullWidth: true,
  editorBackground: '#f9fafb', // gray-50
})

/**
 * Marketing layout - sections span full width, content contained
 */
export const marketingLayout = createLayout({
  value: 'marketing',
  label: 'Marketing',
  description: 'Full-width sections with contained content areas',
  classes: {
    wrapper: '',
    container: '',
    content: '',
  },
  fullWidth: true,
  // Uncomment for marketing header/footer:
  // header: Header,
  // footer: Footer,
  dataAttributes: {
    'data-page-type': 'marketing',
  },
  stickyHeaderHeight: 80,
})

// =============================================================================
// Combined Layouts
// =============================================================================

/**
 * All custom layouts combined with defaults
 *
 * Use this in your PuckEditor and PageRenderer
 */
export const customLayouts: LayoutDefinition[] = mergeLayouts(
  DEFAULT_LAYOUTS,
  [
    defaultWithHeader,
    landingLayout,
    darkLayout,
    blogLayout,
    docsLayout,
    dashboardLayout,
    marketingLayout,
  ],
  { replace: true } // Replace default layouts with our customized versions
)

// =============================================================================
// Usage Examples
// =============================================================================

/*
// 1. In your editor page (e.g., app/(manage)/pages/[id]/edit/page.tsx):
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { customLayouts } from '@/lib/puck-layouts'

<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  layouts={customLayouts}  // <-- Pass layouts here
/>

// 2. In your page renderer (e.g., app/(frontend)/[...slug]/page.tsx):
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { customLayouts } from '@/lib/puck-layouts'

<PageRenderer
  data={page.puckData}
  layouts={customLayouts}  // <-- Pass layouts here
/>

// 3. In payload.config.ts (optional - for layout field in Pages collection):
import { customLayouts } from '@/lib/puck-layouts'

createPuckPlugin({
  layouts: customLayouts,
  // ... other options
})

// 4. Create a custom Puck config with layouts:
import { createConfig } from '@delmaredigital/payload-puck/config'
import { customLayouts } from '@/lib/puck-layouts'

const myConfig = createConfig(customLayouts)
*/
