/**
 * Types for Puck field utilities
 *
 * These types support the getPuckFields() utility for hybrid collection integration.
 */

import type { LayoutDefinition } from '../../layouts/types'

/**
 * Conversion type option for the conversion tracking field
 */
export interface ConversionTypeOption {
  label: string
  value: string
}

/**
 * Options for getPuckFields() utility function
 *
 * Use this to configure which Puck-related fields to include
 * when adding Puck support to an existing collection.
 *
 * @example
 * ```typescript
 * import { getPuckFields } from '@delmaredigital/payload-puck'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields...
 *     { name: 'layout', type: 'blocks', blocks: [...] },
 *
 *     // Add Puck support
 *     ...getPuckFields({
 *       includeSEO: false,      // Using your own SEO fields
 *       includeConversion: true,
 *     }),
 *   ],
 * }
 * ```
 */
export interface GetPuckFieldsOptions {
  /**
   * Include SEO field group using official @payloadcms/plugin-seo convention
   * (meta.title, meta.description, meta.image, noindex, nofollow, excludeFromSitemap)
   * @default true
   */
  includeSEO?: boolean

  /**
   * Include conversion tracking field group (isConversionPage, conversionType, conversionValue)
   * @default false
   */
  includeConversion?: boolean

  /**
   * Include editor version field ('legacy' | 'puck' discriminator)
   * @default true
   */
  includeEditorVersion?: boolean

  /**
   * Include page layout selector field
   * @default true
   */
  includePageLayout?: boolean

  /**
   * Include isHomepage checkbox field
   * @default false
   */
  includeIsHomepage?: boolean

  /**
   * Custom layouts for the page layout selector.
   * If not provided, uses the plugin's DEFAULT_LAYOUTS.
   *
   * Only the `value` and `label` properties are used for the Payload field.
   * Header/footer components are used by the editor and renderer.
   */
  layouts?: LayoutDefinition[]

  /**
   * Default editor version value for new pages.
   * @default 'puck'
   */
  defaultEditorVersion?: 'legacy' | 'puck'

  /**
   * Name of the legacy blocks field to check when detecting editor version.
   * Used by the smart detection hook to determine if existing pages have legacy content.
   * @default 'layout'
   */
  legacyBlocksFieldName?: string

  /**
   * Whether to place applicable fields in the sidebar.
   * @default true
   */
  sidebarPosition?: boolean

  /**
   * Custom conversion type options for the conversion tracking field.
   * Only used when includeConversion is true.
   *
   * @example
   * ```typescript
   * ...getPuckFields({
   *   includeConversion: true,
   *   conversionTypeOptions: [
   *     { label: 'Registration', value: 'registration' },
   *     { label: 'Donation', value: 'donation' },
   *     { label: 'Course Start', value: 'course_start' },
   *   ],
   * })
   * ```
   */
  conversionTypeOptions?: ConversionTypeOption[]
}
