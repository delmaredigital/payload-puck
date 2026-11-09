import type { Config } from 'payload'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

// Merge this fragment's plugins into your existing buildConfig({...}).
// Keep your existing secret, db, admin and other configuration.
export const puckConfig = {
  plugins: [
    createPuckPlugin({
      // Collection slug for pages (default: 'pages')
      pagesCollection: 'pages',

      // Generate the Pages collection (default: true)
      // Set to false to define your own collection
      autoGenerateCollection: true,

      // Optional: override parts of the generated collection
      collectionOverrides: {
        admin: {
          defaultColumns: ['title', 'slug', 'updatedAt'],
        },
      },

      // Optional: access control (shown: the defaults)
      access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
      },

      // Optional: options for the Page Layout field.
      // Only value/label matter here; header/footer components
      // live in lib/puck-layouts.ts
      layouts: [
        { value: 'default', label: 'Default' },
        { value: 'landing', label: 'Landing' },
        { value: 'full-width', label: 'Full Width' },
      ],

      // Admin UI
      admin: {
        buttonLabel: 'Edit with Puck',
      },
    }),
  ],
  // Drafts are enabled on the pages collection automatically
} satisfies Pick<Config, 'plugins'>
