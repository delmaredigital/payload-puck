'use client'

/**
 * Pre-built Puck configuration presets
 *
 * These presets provide ready-to-use configurations that can be extended
 * with custom components.
 *
 * @example
 * ```tsx
 * import { fullConfig, extendConfig } from '@delmaredigital/payload-puck/config'
 * import { MyHeroConfig } from '@/components/puck/Hero'
 *
 * export const puckConfig = extendConfig({
 *   base: fullConfig,
 *   components: {
 *     Hero: MyHeroConfig,
 *   },
 *   categories: {
 *     custom: { title: 'Custom', components: ['Hero'] },
 *   },
 * })
 * ```
 */

import type { Config as PuckConfig, ComponentConfig } from '@measured/puck'
import type { ReactNode } from 'react'

// Import component configs
import {
  ContainerConfig,
  FlexConfig,
  GridConfig,
  SectionConfig,
  SpacerConfig,
  TemplateConfig,
  HeadingConfig,
  TextConfig,
  RichTextEditorConfig,
  ImageConfig,
  ButtonConfig,
  CardConfig,
  DividerConfig,
  AccordionConfig,
} from '../components/exports.js'

// Import field factories for root config
import { createBackgroundField } from '../fields/BackgroundField.js'
import { lockedSlugField, lockedHomepageField } from '../fields/LockedField.js'
import { createFolderPickerField } from '../fields/FolderPickerField.js'
import { createPageSegmentField } from '../fields/PageSegmentField.js'
import { createSlugPreviewField } from '../fields/SlugPreviewField.js'

/**
 * Default root configuration used by presets
 */
export const defaultRoot = {
  fields: {
    // Page identity (locked fields)
    slug: lockedSlugField,
    isHomepage: lockedHomepageField,
    // Page settings
    title: {
      type: 'text' as const,
      label: 'Page Title',
    },
    pageLayout: {
      type: 'select' as const,
      label: 'Page Layout',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'Full Width', value: 'full-width' },
      ],
    },
    // Page-level overrides
    showHeader: {
      type: 'radio' as const,
      label: 'Show Header',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Show', value: 'show' },
        { label: 'Hide', value: 'hide' },
      ],
    },
    showFooter: {
      type: 'radio' as const,
      label: 'Show Footer',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Show', value: 'show' },
        { label: 'Hide', value: 'hide' },
      ],
    },
    pageBackground: createBackgroundField({
      label: 'Page Background',
    }),
    pageMaxWidth: {
      type: 'select' as const,
      label: 'Page Width',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Narrow (720px)', value: '720px' },
        { label: 'Standard (1000px)', value: '1000px' },
        { label: 'Wide (1200px)', value: '1200px' },
        { label: 'Extra Wide (1400px)', value: '1400px' },
        { label: 'Full Width', value: '100%' },
      ],
    },
  },
  defaultProps: {
    slug: '',
    isHomepage: false,
    title: 'New Page',
    pageLayout: 'default',
    showHeader: 'default',
    showFooter: 'default',
    pageBackground: null,
    pageMaxWidth: 'default',
  },
  render: ({ children }: { children: ReactNode }) => <>{children}</>,
}

/**
 * Root configuration for use with @delmaredigital/payload-page-tree
 *
 * Replaces the standard locked slug field with:
 * - Folder picker (select which folder the page belongs to)
 * - Page segment (editable URL segment for this page)
 * - Slug preview (read-only computed URL)
 *
 * @example
 * ```tsx
 * import { pageTreeRoot, fullConfig, extendConfig } from '@delmaredigital/payload-puck/config'
 *
 * export const puckConfig = extendConfig({
 *   base: fullConfig,
 *   root: pageTreeRoot,
 * })
 * ```
 */
export const pageTreeRoot = {
  fields: {
    // Page identity
    title: {
      type: 'text' as const,
      label: 'Page Title',
    },
    // Page-tree specific fields
    folder: createFolderPickerField({ label: 'Folder' }),
    pageSegment: createPageSegmentField({ label: 'Page Segment' }),
    slug: createSlugPreviewField({
      label: 'URL Slug',
      hint: 'Auto-generated from folder + page segment',
    }),
    isHomepage: lockedHomepageField,
    // Page settings
    pageLayout: {
      type: 'select' as const,
      label: 'Page Layout',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'Full Width', value: 'full-width' },
      ],
    },
    // Page-level overrides
    showHeader: {
      type: 'radio' as const,
      label: 'Show Header',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Show', value: 'show' },
        { label: 'Hide', value: 'hide' },
      ],
    },
    showFooter: {
      type: 'radio' as const,
      label: 'Show Footer',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Show', value: 'show' },
        { label: 'Hide', value: 'hide' },
      ],
    },
    pageBackground: createBackgroundField({
      label: 'Page Background',
    }),
    pageMaxWidth: {
      type: 'select' as const,
      label: 'Page Width',
      options: [
        { label: 'Use Layout Default', value: 'default' },
        { label: 'Narrow (720px)', value: '720px' },
        { label: 'Standard (1000px)', value: '1000px' },
        { label: 'Wide (1200px)', value: '1200px' },
        { label: 'Extra Wide (1400px)', value: '1400px' },
        { label: 'Full Width', value: '100%' },
      ],
    },
  },
  defaultProps: {
    title: 'New Page',
    folder: null,
    pageSegment: '',
    slug: '',
    isHomepage: false,
    pageLayout: 'default',
    showHeader: 'default',
    showFooter: 'default',
    pageBackground: null,
    pageMaxWidth: 'default',
  },
  render: ({ children }: { children: ReactNode }) => <>{children}</>,
}

/**
 * Full configuration with all built-in components
 *
 * Use this as a base and extend with custom components via `extendConfig()`.
 */
export const fullConfig = {
  root: defaultRoot,
  categories: {
    layout: {
      title: 'Layout',
      components: ['Container', 'Flex', 'Grid', 'Section', 'Spacer', 'Template'],
      defaultExpanded: true,
    },
    typography: {
      title: 'Typography',
      components: ['Heading', 'Text', 'RichText'],
    },
    media: {
      title: 'Media',
      components: ['Image'],
    },
    interactive: {
      title: 'Interactive',
      components: ['Button', 'Card', 'Divider', 'Accordion'],
    },
  },
  components: {
    // Layout
    Container: ContainerConfig as ComponentConfig<any>,
    Flex: FlexConfig as ComponentConfig<any>,
    Grid: GridConfig as ComponentConfig<any>,
    Section: SectionConfig as ComponentConfig<any>,
    Spacer: SpacerConfig as ComponentConfig<any>,
    Template: TemplateConfig as ComponentConfig<any>,
    // Typography
    Heading: HeadingConfig as ComponentConfig<any>,
    Text: TextConfig as ComponentConfig<any>,
    RichText: RichTextEditorConfig as ComponentConfig<any>,
    // Media
    Image: ImageConfig as ComponentConfig<any>,
    // Interactive
    Button: ButtonConfig as ComponentConfig<any>,
    Card: CardConfig as ComponentConfig<any>,
    Divider: DividerConfig as ComponentConfig<any>,
    Accordion: AccordionConfig as ComponentConfig<any>,
  },
} satisfies PuckConfig

/**
 * Minimal configuration with essential components only
 *
 * Good for simple landing pages or when you want a cleaner editor sidebar.
 */
export const minimalConfig = {
  root: defaultRoot,
  categories: {
    layout: {
      title: 'Layout',
      components: ['Section'],
      defaultExpanded: true,
    },
    content: {
      title: 'Content',
      components: ['Heading', 'Text', 'Image', 'Button'],
    },
  },
  components: {
    Section: SectionConfig as ComponentConfig<any>,
    Heading: HeadingConfig as ComponentConfig<any>,
    Text: TextConfig as ComponentConfig<any>,
    Image: ImageConfig as ComponentConfig<any>,
    Button: ButtonConfig as ComponentConfig<any>,
  },
} satisfies PuckConfig

// Re-export mergeConfigs as extendConfig for convenience
export { mergeConfigs, mergeConfigs as extendConfig } from './merge.js'
