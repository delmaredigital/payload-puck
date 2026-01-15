import type { CollectionConfig } from 'payload'

/**
 * AI Context Collection
 *
 * Stores business context entries for the AI chat interface.
 * These context entries are concatenated and sent to the AI system prompt
 * to help it understand your brand, tone, and requirements.
 *
 * @example Creating context entries in Payload admin:
 * - "Brand Guidelines" - Colors, fonts, brand voice
 * - "Tone of Voice" - How to communicate
 * - "Product Information" - What you sell/offer
 * - "Industry Context" - Your market and audience
 */
export const AiContextCollection: CollectionConfig = {
  slug: 'puck-ai-context',
  labels: {
    singular: 'AI Context',
    plural: 'AI Contexts',
  },
  admin: {
    group: 'Puck',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'enabled', 'order', 'updatedAt'],
    hidden: false, // Visible in admin for context management
    description:
      'Business context for AI page generation. Add entries for brand guidelines, tone of voice, product info, etc.',
  },
  access: {
    // Default: authenticated users can manage context
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name for this context block (e.g., "Brand Guidelines", "Tone of Voice")',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'The context content in markdown format. Use headers (##) to organize, lists for guidelines, etc.',
        rows: 12,
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Brand Guidelines', value: 'brand' },
        { label: 'Tone of Voice', value: 'tone' },
        { label: 'Product Information', value: 'product' },
        { label: 'Industry Context', value: 'industry' },
        { label: 'Technical Requirements', value: 'technical' },
        { label: 'Page Patterns', value: 'patterns' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Category for organizing context blocks',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Include this context in AI prompts. Uncheck to temporarily disable.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in the context (lower numbers appear earlier in the prompt)',
      },
    },
  ],
  timestamps: true,
}
