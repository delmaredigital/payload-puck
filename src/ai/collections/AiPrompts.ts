import type { CollectionConfig } from 'payload'

/**
 * AI Prompts Collection
 *
 * Stores example prompts for the AI chat interface.
 * These prompts are displayed in the Puck editor for users to quickly
 * start common AI generation tasks.
 */
export const AiPromptsCollection: CollectionConfig = {
  slug: 'puck-ai-prompts',
  labels: {
    singular: 'AI Prompt',
    plural: 'AI Prompts',
  },
  admin: {
    group: 'Puck',
    useAsTitle: 'label',
    defaultColumns: ['label', 'category', 'order', 'updatedAt'],
    hidden: false, // Visible in admin for prompt management
  },
  access: {
    // Default: authenticated users can manage prompts
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display label for the prompt (e.g., "Landing page")',
      },
    },
    {
      name: 'prompt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The actual prompt text sent to the AI',
        rows: 4,
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Optional category for grouping prompts (e.g., "Marketing", "Product")',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
  ],
  timestamps: true,
}
