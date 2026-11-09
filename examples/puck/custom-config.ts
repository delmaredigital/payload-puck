import { extendConfig, editorConfig } from '@delmaredigital/payload-puck/config/editor'
import { CustomBannerConfig } from '@/components/CustomBanner'

export const customConfig = extendConfig({
  // Start from the full payload-puck editor configuration
  base: editorConfig,

  // The key becomes the component's identifier in the editor
  components: {
    Banner: CustomBannerConfig,
  },

  // Categories are the collapsible sections of Puck's component list.
  // For an existing category, components are appended.
  categories: {
    interactive: {
      title: 'Interactive',
      components: ['Banner'], // added next to Button, Card, Divider, Accordion
    },
    // marketing: { title: 'Marketing', components: ['Hero'], defaultExpanded: false },
  },

  // Remove built-in components you don't need
  exclude: [
    // 'Template',
  ],

  // Optional: page-level root fields
  // root: {
  //   fields: { headerStyle: { type: 'select', label: 'Header Style', options: [...] } },
  //   defaultProps: { headerStyle: 'default' },
  // },
})
