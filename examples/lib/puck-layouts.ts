import {
  DEFAULT_LAYOUTS,
  createLayout,
  mergeLayouts,
  type LayoutDefinition,
} from '@delmaredigital/payload-puck/layouts'
// import { Header } from '@/components/header'
// import { Footer } from '@/components/footer'

// Default layout with a sticky header.
// stickyHeaderHeight adds that much top padding, in the editor AND on the
// frontend, so content doesn't render behind the header.
// stickyFooter defaults to true: the footer stays at the bottom of the
// viewport even with little content. Set false to let it flow.
export const defaultWithHeader = createLayout({
  value: 'default',
  label: 'Default',
  description: 'Standard page layout with header and footer',
  classes: { wrapper: '', container: 'mx-auto px-4 sm:px-6 lg:px-8', content: '' },
  maxWidth: '1200px',
  fullWidth: false,
  // header: Header,
  // footer: Footer,
  editorBackground: '#ffffff',
  editorDarkMode: false,
  stickyHeaderHeight: 80,
})

// Landing pages: no header/footer, full control of the page
export const landingLayout = createLayout({
  value: 'landing',
  label: 'Landing',
  description: 'Full-width layout without header/footer',
  fullWidth: true,
  editorBackground: '#f8fafc',
})

// Dark layout: editorDarkMode sets the dark mode class on the iframe
export const darkLayout = createLayout({
  value: 'dark',
  label: 'Dark',
  description: 'Dark theme layout',
  classes: { wrapper: 'bg-gray-900', container: 'mx-auto px-4 sm:px-6 lg:px-8', content: '' },
  maxWidth: '1200px',
  editorBackground: '#111827',
  editorDarkMode: true,
  stickyHeaderHeight: 80,
})

// Narrow, reading-optimised layout
export const blogLayout = createLayout({
  value: 'blog',
  label: 'Blog Post',
  description: 'Narrow layout optimized for long-form reading',
  classes: { container: 'mx-auto px-4 sm:px-6', content: 'prose prose-lg max-w-none' },
  maxWidth: '720px',
  stickyHeaderHeight: 80,
})

// Full-width sections with a data attribute for page-type styling
export const marketingLayout = createLayout({
  value: 'marketing',
  label: 'Marketing',
  description: 'Full-width sections with contained content areas',
  fullWidth: true,
  dataAttributes: { 'data-page-type': 'marketing' },
  stickyHeaderHeight: 80,
})

// replace: true returns only these layouts instead of merging with the defaults
export const siteLayouts: LayoutDefinition[] = mergeLayouts(
  DEFAULT_LAYOUTS,
  [defaultWithHeader, landingLayout, darkLayout, blogLayout, marketingLayout],
  { replace: true },
)
