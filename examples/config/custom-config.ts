/**
 * Custom Puck Configuration Example
 *
 * This example demonstrates how to:
 * - Import the base payload-puck configuration
 * - Add your own custom components using mergeConfigs
 * - Exclude unwanted built-in components
 * - Organize components into categories
 *
 * Copy and adapt this file for your project's needs.
 */

import type { Config as PuckConfig } from '@measured/puck'

// =============================================================================
// Import the base configuration and merge utility
// =============================================================================

/**
 * The editorConfig is the full payload-puck configuration with all built-in
 * components. It includes:
 * - Layout: Container, Flex, Grid, Section, Spacer
 * - Typography: Heading, Text, RichText
 * - Media: Image, TextImageSplit
 * - Interactive: Button, Card, Divider, Accordion, CallToAction
 *
 * mergeConfigs is a utility that helps combine configurations while:
 * - Preserving base component configurations
 * - Adding new custom components
 * - Merging categories appropriately
 * - Excluding components you don't need
 */
import { editorConfig, mergeConfigs } from '@delmaredigital/payload-puck/config'

// =============================================================================
// Import your custom components
// =============================================================================

/**
 * Import your custom component configurations.
 * Each should export a ComponentConfig object.
 *
 * See examples/components/CustomBanner.tsx for how to create these.
 */
import { CustomBannerConfig } from '../components/CustomBanner'

// You might also have other custom components:
// import { HeroConfig } from '../components/Hero'
// import { TestimonialConfig } from '../components/Testimonial'
// import { PricingTableConfig } from '../components/PricingTable'

// =============================================================================
// Create your merged configuration
// =============================================================================

/**
 * Use mergeConfigs to combine the base config with your customizations.
 *
 * Options:
 * - base: The configuration to extend (typically editorConfig)
 * - components: Object mapping component names to their configs
 * - categories: Object to define/extend component categories
 * - root: Optional root configuration overrides
 * - exclude: Array of component names to remove from base
 */
export const customConfig = mergeConfigs({
  // Start with the full payload-puck configuration
  base: editorConfig,

  // Add your custom components
  // The key becomes the component's identifier in the editor
  components: {
    // Add the Banner component
    Banner: CustomBannerConfig,

    // Add more custom components as needed:
    // Hero: HeroConfig,
    // Testimonial: TestimonialConfig,
    // PricingTable: PricingTableConfig,
  },

  // Organize components into categories
  // Categories appear as collapsible sections in Puck's component picker
  categories: {
    // Add Banner to the existing 'interactive' category
    // The components array is merged with existing components in that category
    interactive: {
      title: 'Interactive',
      components: ['Banner'],
      // Note: Banner will be added alongside existing interactive components
      // (Button, Card, Divider, Accordion, CallToAction)
    },

    // You can also create entirely new categories:
    // marketing: {
    //   title: 'Marketing',
    //   components: ['Hero', 'Testimonial', 'PricingTable'],
    //   defaultExpanded: false, // Collapsed by default
    // },
  },

  // Exclude components you don't need
  // This removes them from both the component list and categories
  exclude: [
    // Example: Remove CallToAction if you have your own marketing components
    // 'CallToAction',

    // Example: Remove TextImageSplit if you prefer custom layouts
    // 'TextImageSplit',
  ],

  // Optional: Override root configuration
  // The root defines page-level fields and the wrapper render function
  // root: {
  //   fields: {
  //     // Add custom page-level fields
  //     pageDescription: {
  //       type: 'textarea',
  //       label: 'Meta Description',
  //     },
  //     headerStyle: {
  //       type: 'select',
  //       label: 'Header Style',
  //       options: [
  //         { label: 'Default', value: 'default' },
  //         { label: 'Transparent', value: 'transparent' },
  //         { label: 'Dark', value: 'dark' },
  //       ],
  //     },
  //   },
  //   defaultProps: {
  //     pageDescription: '',
  //     headerStyle: 'default',
  //   },
  // },
})

// =============================================================================
// Alternative: Minimal configuration with only your components
// =============================================================================

/**
 * If you want to start from scratch with only specific components,
 * you can build a config directly without merging.
 *
 * This is useful when you want full control over what's available.
 */
// import type { ComponentConfig } from '@measured/puck'
// import { ContainerConfig, FlexConfig } from '@delmaredigital/payload-puck/components'
// import { HeadingConfig, TextConfig } from '@delmaredigital/payload-puck/components'
//
// export const minimalConfig: PuckConfig = {
//   root: {
//     fields: {
//       title: { type: 'text', label: 'Page Title' },
//     },
//     defaultProps: {
//       title: 'New Page',
//     },
//     render: ({ children }) => <>{children}</>,
//   },
//   categories: {
//     layout: {
//       title: 'Layout',
//       components: ['Container', 'Flex'],
//     },
//     content: {
//       title: 'Content',
//       components: ['Heading', 'Text', 'Banner'],
//     },
//   },
//   components: {
//     Container: ContainerConfig as ComponentConfig<any>,
//     Flex: FlexConfig as ComponentConfig<any>,
//     Heading: HeadingConfig as ComponentConfig<any>,
//     Text: TextConfig as ComponentConfig<any>,
//     Banner: CustomBannerConfig as ComponentConfig<any>,
//   },
// }

// =============================================================================
// Usage in your Puck Editor
// =============================================================================

/**
 * Import this config in your Puck editor page:
 *
 * ```tsx
 * // app/(manage)/pages/[id]/edit/page.tsx
 * 'use client'
 *
 * import { Puck } from '@measured/puck'
 * import { customConfig } from '@/lib/puck/custom-config'
 * import { ThemeProvider } from '@delmaredigital/payload-puck/theme'
 *
 * export default function EditorPage({ data, onSave }) {
 *   return (
 *     <ThemeProvider>
 *       <Puck
 *         config={customConfig}
 *         data={data}
 *         onPublish={onSave}
 *       />
 *     </ThemeProvider>
 *   )
 * }
 * ```
 *
 * And in your page renderer:
 *
 * ```tsx
 * // app/(frontend)/[...slug]/page.tsx
 * import { Render } from '@measured/puck'
 * import { customConfig } from '@/lib/puck/custom-config'
 *
 * export default function Page({ data }) {
 *   return <Render config={customConfig} data={data} />
 * }
 * ```
 */

// Export for use in your application
export default customConfig
