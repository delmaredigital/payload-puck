/**
 * Puck Field Utilities
 *
 * Provides reusable field definitions for adding Puck support to existing collections.
 * Use getPuckFields() for easy integration, or import individual fields for granular control.
 *
 * @example
 * ```typescript
 * // Option 1: Use getPuckFields() for recommended defaults
 * import { getPuckFields } from '@delmaredigital/payload-puck'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields...
 *     ...getPuckFields({ includeSEO: false }),
 *   ],
 * }
 *
 * // Option 2: Import individual fields
 * import { puckDataField, editorVersionField } from '@delmaredigital/payload-puck'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields...
 *     puckDataField,
 *     editorVersionField,
 *   ],
 * }
 * ```
 */

import type { Field } from 'payload'
import type { GetPuckFieldsOptions, ConversionTypeOption } from './types'
import type { LayoutDefinition } from '../../layouts/types'
import { DEFAULT_LAYOUTS } from '../../layouts/defaults'
import { layoutsToPayloadOptions } from '../../layouts/utils'

// =============================================================================
// Core Fields
// =============================================================================

/**
 * Puck data field - stores the visual editor JSON data.
 * This field is always hidden in the admin UI as it's managed via the visual editor.
 */
export const puckDataField: Field = {
  name: 'puckData',
  type: 'json',
  admin: {
    hidden: true,
    description: 'Puck editor data - managed via visual editor',
  },
}

/**
 * Creates an editor version field with smart detection for hybrid setups.
 *
 * The field uses a beforeValidate hook to intelligently determine the editor version:
 * - New pages: Default to 'puck' (or custom defaultValue)
 * - Existing pages with legacy blocks but no puckData: Set to 'legacy'
 * - Existing pages with puckData: Set to 'puck'
 *
 * This prevents existing legacy content from being incorrectly marked as 'puck'
 * when the field is first added to a collection.
 *
 * @param defaultValue - The default editor version for NEW pages ('puck' or 'legacy')
 * @param sidebar - Whether to position in the sidebar (default: true)
 * @param legacyBlocksFieldName - Name of the legacy blocks field to check (default: 'layout')
 */
export function createEditorVersionField(
  defaultValue: 'legacy' | 'puck' = 'puck',
  sidebar: boolean = true,
  legacyBlocksFieldName: string = 'layout'
): Field {
  return {
    name: 'editorVersion',
    type: 'select',
    // NO defaultValue here - we use the hook to intelligently detect the value
    // This prevents migrations from blindly setting 'puck' on legacy pages
    options: [
      { label: 'Legacy (Payload Blocks)', value: 'legacy' },
      { label: 'Puck Visual Editor', value: 'puck' },
    ],
    admin: {
      position: sidebar ? 'sidebar' : undefined,
      description: 'Which editor was used to create this page',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, operation }) => {
          // If value is explicitly set (and not null/undefined), keep it
          if (value) return value

          // Detect based on content - works for both new and existing documents
          const legacyBlocks = data?.[legacyBlocksFieldName]
          const hasLegacyBlocks = Array.isArray(legacyBlocks) && legacyBlocks.length > 0

          const puckData = data?.puckData as { content?: unknown[] } | null | undefined
          const hasPuckData =
            puckData?.content && Array.isArray(puckData.content) && puckData.content.length > 0

          // If has legacy blocks but no puck data, it's a legacy page
          if (hasLegacyBlocks && !hasPuckData) {
            return 'legacy'
          }

          // If has puck data, it's a puck page
          if (hasPuckData) {
            return 'puck'
          }

          // For new documents with no content yet, use configured default
          // For existing documents with no content, also use default
          return defaultValue
        },
      ],
    },
  }
}

/**
 * Pre-configured editor version field with 'puck' as default.
 * Use createEditorVersionField() for custom configuration.
 */
export const editorVersionField: Field = createEditorVersionField('puck', true)

/**
 * Creates a page layout field with custom layouts.
 *
 * @param layouts - Array of layout definitions (defaults to DEFAULT_LAYOUTS)
 * @param sidebar - Whether to position in the sidebar (default: true)
 */
export function createPageLayoutField(
  layouts: LayoutDefinition[] = DEFAULT_LAYOUTS,
  sidebar: boolean = true
): Field {
  return {
    name: 'pageLayout',
    type: 'select',
    required: true,
    defaultValue: 'default',
    options: layoutsToPayloadOptions(layouts),
    admin: {
      position: sidebar ? 'sidebar' : undefined,
      description: 'Overall page structure and layout style',
    },
  }
}

/**
 * Pre-configured page layout field with DEFAULT_LAYOUTS.
 * Use createPageLayoutField() for custom layouts.
 */
export const pageLayoutField: Field = createPageLayoutField()

/**
 * Homepage flag field - marks a page as the site homepage.
 */
export const isHomepageField: Field = {
  name: 'isHomepage',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Mark this page as the homepage',
  },
}

// =============================================================================
// Field Groups
// =============================================================================

/**
 * SEO/Meta field group with all metadata fields.
 * Uses the official @payloadcms/plugin-seo convention: meta.title, meta.description
 *
 * Includes: title, description, image, noindex, nofollow, excludeFromSitemap
 */
export const seoFieldGroup: Field = {
  name: 'meta',
  type: 'group',
  label: 'SEO',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Meta Title',
      admin: {
        description: 'Override the page title for search engines',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta Description',
      admin: {
        description: 'Description shown in search engine results',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Open Graph Image',
      admin: {
        description: 'Image shown when sharing on social media',
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'No Index',
      defaultValue: false,
      admin: {
        description: 'Prevent search engines from indexing this page',
      },
    },
    {
      name: 'nofollow',
      type: 'checkbox',
      label: 'No Follow',
      defaultValue: false,
      admin: {
        description: 'Prevent search engines from following links on this page',
      },
    },
    {
      name: 'excludeFromSitemap',
      type: 'checkbox',
      label: 'Exclude from Sitemap',
      defaultValue: false,
      admin: {
        description: 'Exclude this page from the XML sitemap',
      },
    },
  ],
}

/**
 * Default conversion type options
 */
export const DEFAULT_CONVERSION_TYPES: ConversionTypeOption[] = [
  { label: 'Lead', value: 'lead' },
  { label: 'Registration', value: 'registration' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Donation', value: 'donation' },
  { label: 'Newsletter Signup', value: 'newsletter' },
  { label: 'Contact Form', value: 'contact' },
  { label: 'Custom', value: 'custom' },
]

/**
 * Creates a conversion tracking field group with custom options.
 *
 * @param conversionTypes - Custom conversion type options (defaults to DEFAULT_CONVERSION_TYPES)
 * @param sidebar - Whether to position in the sidebar (default: true)
 *
 * @example
 * ```typescript
 * // Use default conversion types
 * ...getPuckFields({ includeConversion: true })
 *
 * // Use custom conversion types
 * ...getPuckFields({
 *   includeConversion: true,
 *   conversionTypeOptions: [
 *     { label: 'Registration', value: 'registration' },
 *     { label: 'Donation', value: 'donation' },
 *     { label: 'Course Start', value: 'course_start' },
 *     { label: 'Custom', value: 'custom' },
 *   ],
 * })
 * ```
 */
export function createConversionFieldGroup(
  conversionTypes: ConversionTypeOption[] = DEFAULT_CONVERSION_TYPES,
  sidebar: boolean = true
): Field {
  return {
    name: 'conversionTracking',
    type: 'group',
    label: 'Conversion Tracking',
    admin: {
      position: sidebar ? 'sidebar' : undefined,
      description: 'Configure conversion tracking for analytics',
    },
    fields: [
      {
        name: 'isConversionPage',
        type: 'checkbox',
        label: 'Is Conversion Page',
        defaultValue: false,
        admin: {
          description:
            'Check this if this page represents a completed conversion (e.g., thank you page)',
        },
      },
      {
        name: 'conversionType',
        type: 'select',
        label: 'Conversion Type',
        options: conversionTypes,
        admin: {
          description: 'Type of conversion this page represents',
          condition: (data, siblingData) => siblingData?.isConversionPage === true,
        },
      },
      {
        name: 'conversionValue',
        type: 'number',
        label: 'Conversion Value',
        defaultValue: 0,
        admin: {
          description: 'Monetary value of this conversion (0 for non-monetary conversions)',
          condition: (data, siblingData) => siblingData?.isConversionPage === true,
        },
      },
    ],
  }
}

/**
 * Pre-configured conversion tracking field group with default options.
 * Use createConversionFieldGroup() for custom conversion types.
 */
export const conversionFieldGroup: Field = createConversionFieldGroup()

// =============================================================================
// Main Utility Function
// =============================================================================

/**
 * Returns an array of Puck-related field definitions for hybrid collection integration.
 *
 * Use this when you have an existing collection with legacy Payload blocks and want
 * to ADD Puck support without replacing your entire collection configuration.
 *
 * @param options - Configuration options for which fields to include
 * @returns Array of Field definitions to spread into your collection's fields array
 *
 * @example
 * ```typescript
 * import { getPuckFields } from '@delmaredigital/payload-puck'
 *
 * export const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields
 *     { name: 'title', type: 'text', required: true },
 *     { name: 'slug', type: 'text', required: true },
 *
 *     // Legacy Payload blocks (keep these!)
 *     { name: 'layout', type: 'blocks', blocks: [...] },
 *
 *     // Add Puck fields for hybrid editing
 *     ...getPuckFields({
 *       includeSEO: false,       // You have your own SEO fields
 *       includeConversion: true, // Include conversion tracking
 *       includeEditorVersion: true,
 *     }),
 *   ],
 * }
 * ```
 */
export function getPuckFields(options: GetPuckFieldsOptions = {}): Field[] {
  const {
    includeSEO = true,
    includeConversion = false,
    includeEditorVersion = true,
    includePageLayout = true,
    includeIsHomepage = false,
    layouts = DEFAULT_LAYOUTS,
    defaultEditorVersion = 'puck',
    legacyBlocksFieldName = 'layout',
    sidebarPosition = true,
    conversionTypeOptions,
  } = options

  const fields: Field[] = []

  // Core puckData field (always included - this is essential for Puck)
  fields.push(puckDataField)

  // Editor version field (discriminator for hybrid rendering)
  // Uses smart detection to preserve legacy pages when field is first added
  if (includeEditorVersion) {
    fields.push(createEditorVersionField(defaultEditorVersion, sidebarPosition, legacyBlocksFieldName))
  }

  // Page layout field
  if (includePageLayout) {
    fields.push(createPageLayoutField(layouts, sidebarPosition))
  }

  // Homepage flag
  if (includeIsHomepage) {
    fields.push(isHomepageField)
  }

  // SEO group
  if (includeSEO) {
    fields.push(seoFieldGroup)
  }

  // Conversion tracking group (with optional custom conversion types)
  if (includeConversion) {
    fields.push(createConversionFieldGroup(conversionTypeOptions, sidebarPosition))
  }

  return fields
}

// Re-export types
export type { GetPuckFieldsOptions, ConversionTypeOption } from './types'
