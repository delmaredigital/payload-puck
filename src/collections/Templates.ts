import type { CollectionConfig } from 'payload'

/**
 * Templates Collection - Stores reusable Puck component configurations
 *
 * This collection stores serialized Puck component data that can be
 * loaded into Template components for reuse across pages.
 */
export const TemplatesCollection: CollectionConfig = {
  slug: 'puck-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Puck',
    defaultColumns: ['name', 'category', 'updatedAt'],
    description: 'Reusable component templates for the visual editor',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'A descriptive name for this template',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of what this template contains',
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Category for organizing templates (e.g., "Hero", "Footer", "CTA")',
      },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Serialized Puck component data',
      },
    },
    {
      name: 'thumbnail',
      type: 'text',
      admin: {
        description: 'Optional thumbnail URL for template preview',
      },
    },
  ],
  timestamps: true,
}
