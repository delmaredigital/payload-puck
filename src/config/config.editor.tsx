'use client'

/**
 * Client-side Puck configuration with custom fields
 *
 * This config includes all components plus client-only features like:
 * - TipTap rich text editor for RichText
 * - Accordion (requires useState)
 *
 * Use this config for the Puck visual editor.
 */

import type { Config as PuckConfig, ComponentConfig } from '@puckeditor/core'
import type { ReactNode } from 'react'
import { createBackgroundField } from '../fields/BackgroundField.js'
import { lockedSlugField, lockedHomepageField } from '../fields/LockedField.js'

// Layout Components
import { ContainerConfig } from '../components/layout/Container.js'
import { FlexConfig } from '../components/layout/Flex.js'
import { GridConfig } from '../components/layout/Grid.js'
import { SectionConfig } from '../components/layout/Section.js'
import { SpacerConfig } from '../components/layout/Spacer.js'
import { TemplateConfig } from '../components/layout/Template.js'

// Typography Components
import { HeadingConfig } from '../components/typography/Heading.js'
import { TextConfig } from '../components/typography/Text.js'
import { RichTextEditorConfig } from '../components/typography/RichText.editor.js'

// Media Components
import { ImageConfig } from '../components/media/Image.js'

// Interactive Components
import { ButtonConfig } from '../components/interactive/Button.js'
import { CardConfig } from '../components/interactive/Card.js'
import { DividerConfig } from '../components/interactive/Divider.js'
import { AccordionConfig } from '../components/interactive/Accordion.js'

/**
 * Editor Puck configuration with all components including client-only ones
 *
 * Use this config for the Puck <Editor /> component.
 */
// Using type assertion since Puck's strict typing conflicts with our generic configs
export const editorConfig = {
  root: {
    fields: {
      // Page identity (locked fields)
      slug: lockedSlugField,
      isHomepage: lockedHomepageField,
      // Page settings
      title: {
        type: 'text',
        label: 'Page Title',
      },
      pageLayout: {
        type: 'select',
        label: 'Page Layout',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Landing', value: 'landing' },
          { label: 'Full Width', value: 'full-width' },
        ],
      },
      // Page-level overrides
      showHeader: {
        type: 'radio',
        label: 'Show Header',
        options: [
          { label: 'Use Layout Default', value: 'default' },
          { label: 'Show', value: 'show' },
          { label: 'Hide', value: 'hide' },
        ],
      },
      showFooter: {
        type: 'radio',
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
        type: 'select',
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
  },
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
    RichText: RichTextEditorConfig as ComponentConfig<any>, // Uses TipTap
    // Media
    Image: ImageConfig as ComponentConfig<any>,
    // Interactive
    Button: ButtonConfig as ComponentConfig<any>,
    Card: CardConfig as ComponentConfig<any>,
    Divider: DividerConfig as ComponentConfig<any>,
    Accordion: AccordionConfig as ComponentConfig<any>, // Client-only
  },
} satisfies PuckConfig

// Re-export merge utility for convenience
export { mergeConfigs } from './merge.js'

// Re-export presets for extending configs
export {
  fullConfig,
  minimalConfig,
  defaultRoot,
  pageTreeRoot,
  extendConfig,
} from './presets.js'
