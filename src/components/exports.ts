'use client'

/**
 * Individual component config exports
 *
 * This module exports individual Puck component configurations so users can
 * cherry-pick components for their custom configs.
 *
 * @example
 * ```tsx
 * import {
 *   SectionConfig,
 *   HeadingConfig,
 *   TextConfig,
 * } from '@delmaredigital/payload-puck/components'
 *
 * export const myConfig: Config = {
 *   components: {
 *     Section: SectionConfig,
 *     Heading: HeadingConfig,
 *     Text: TextConfig,
 *   },
 *   // ...
 * }
 * ```
 */

// =============================================================================
// Editor Component Configs (for Puck Editor)
// =============================================================================

// Layout components
export { ContainerConfig } from './layout/Container.js'
export { FlexConfig } from './layout/Flex.js'
export { GridConfig } from './layout/Grid.js'
export { SectionConfig } from './layout/Section.js'
export { SpacerConfig } from './layout/Spacer.js'
export { TemplateConfig } from './layout/Template.js'

// Typography components
export { HeadingConfig } from './typography/Heading.js'
export { TextConfig } from './typography/Text.js'
export { RichTextEditorConfig } from './typography/RichText.editor.js'
export { RichTextConfig } from './typography/RichText.js'

// Media components
export { ImageConfig } from './media/Image.js'

// Interactive components
export { ButtonConfig } from './interactive/Button.js'
export { CardConfig } from './interactive/Card.js'
export { DividerConfig } from './interactive/Divider.js'
export { AccordionConfig } from './interactive/Accordion.js'

// =============================================================================
// Server Component Configs (for PageRenderer)
// =============================================================================
// These are SSR-safe variants without client-side interactivity.
// Use these when building a custom baseConfig for PageRenderer.

// Layout components (server)
export { ContainerConfig as ContainerServerConfig } from './layout/Container.server.js'
export { FlexConfig as FlexServerConfig } from './layout/Flex.server.js'
export { GridConfig as GridServerConfig } from './layout/Grid.server.js'
export { SectionConfig as SectionServerConfig } from './layout/Section.server.js'
export { SpacerConfig as SpacerServerConfig } from './layout/Spacer.server.js'
export { TemplateServerConfig } from './layout/Template.server.js'

// Typography components (server)
export { HeadingConfig as HeadingServerConfig } from './typography/Heading.server.js'
export { TextConfig as TextServerConfig } from './typography/Text.server.js'
export { RichTextConfig as RichTextServerConfig } from './typography/RichText.server.js'

// Media components (server)
export { ImageConfig as ImageServerConfig } from './media/Image.server.js'

// Interactive components (server)
export { ButtonConfig as ButtonServerConfig } from './interactive/Button.server.js'
export { CardConfig as CardServerConfig } from './interactive/Card.server.js'
export { DividerConfig as DividerServerConfig } from './interactive/Divider.server.js'
export { AccordionConfig as AccordionServerConfig } from './interactive/Accordion.server.js'
