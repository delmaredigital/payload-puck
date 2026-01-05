import type { Access, CollectionConfig, Field } from 'payload'
import type { PuckPluginOptions } from '../../types'
import { DEFAULT_LAYOUTS } from '../../layouts/defaults'
import { layoutsToPayloadOptions } from '../../layouts/utils'
import {
  puckDataField,
  createEditorVersionField,
  createPageLayoutField,
  isHomepageField,
  seoFieldGroup,
  conversionFieldGroup,
} from '../fields'

/**
 * Default access function - allows all
 */
const defaultAccess: Access = () => true

/**
 * Generates a Pages collection configuration for Puck
 */
export function generatePagesCollection(
  slug: string,
  options: PuckPluginOptions
): CollectionConfig {
  const {
    collectionOverrides = {},
    access = {},
    layouts = DEFAULT_LAYOUTS,
    additionalFields = [],
  } = options

  const baseFields: Field[] = [
    // Core Fields (title and slug with duplication hooks - unique to collection generation)
    {
      name: 'title',
      type: 'text',
      required: true,
      hooks: {
        beforeDuplicate: [
          ({ value }) => {
            if (!value) return value
            const copyMatch = value.match(/^(.+) \(Copy(?: (\d+))?\)$/)
            if (copyMatch) {
              const baseName = copyMatch[1]
              const copyNum = copyMatch[2] ? parseInt(copyMatch[2], 10) + 1 : 2
              return `${baseName} (Copy ${copyNum})`
            }
            return `${value} (Copy)`
          },
        ],
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL path for this page (auto-generated from title)',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (data && !value && data.title) {
              return (data.title as string)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            }
            return value
          },
        ],
        beforeDuplicate: [
          ({ value }) => {
            if (!value) return value
            const copyMatch = value.match(/^(.+)-copy(?:-(\d+))?$/)
            if (copyMatch) {
              const baseName = copyMatch[1]
              const copyNum = copyMatch[2] ? parseInt(copyMatch[2], 10) + 1 : 2
              return `${baseName}-copy-${copyNum}`
            }
            return `${value}-copy`
          },
        ],
      },
    },

    // Page Layout
    createPageLayoutField(layouts, true),

    // Editor Version
    createEditorVersionField('puck', true),

    // Homepage Flag
    isHomepageField,

    // Puck Data (hidden - managed via visual editor)
    puckDataField,

    // SEO Fields
    seoFieldGroup,

    // Conversion Tracking Fields
    conversionFieldGroup,

    // Additional fields from options
    ...additionalFields,
  ]

  return {
    slug,
    admin: {
      useAsTitle: 'title',
      group: 'Content',
      defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
      ...(collectionOverrides.admin ?? {}),
    },
    access: {
      read: access.read ?? defaultAccess,
      create: access.create ?? defaultAccess,
      update: access.update ?? defaultAccess,
      delete: access.delete ?? defaultAccess,
      ...(collectionOverrides.access ?? {}),
    },
    versions:
      typeof collectionOverrides.versions === 'object'
        ? { drafts: true, ...collectionOverrides.versions }
        : { drafts: true },
    fields: baseFields,
    ...collectionOverrides,
    // Ensure fields aren't overwritten by collectionOverrides
    ...(collectionOverrides.fields && {
      fields: [...baseFields, ...collectionOverrides.fields],
    }),
  }
}

// Note: puckDataField is now exported from '../fields' for hybrid collection integration
// Re-export for backwards compatibility
export { puckDataField } from '../fields'
