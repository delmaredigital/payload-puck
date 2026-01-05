/**
 * Payload Configuration with Puck Plugin
 *
 * Copy to: src/payload.config.ts (merge with existing config)
 *
 * This shows the minimal configuration needed to add Puck to your Payload setup.
 */

import { buildConfig } from 'payload'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'
// Import your other Payload plugins, collections, etc.

export default buildConfig({
  // ... your existing config (admin, db, etc.)

  plugins: [
    // Add Puck plugin
    createPuckPlugin({
      // Collection slug for pages (default: 'pages')
      pagesCollection: 'pages',

      // Auto-generate the Pages collection (default: true)
      // Set to false if you want to define your own collection
      autoGenerateCollection: true,

      // Optional: Override collection config
      collectionOverrides: {
        admin: {
          defaultColumns: ['title', 'slug', 'updatedAt'],
        },
      },

      // Optional: Custom access control
      access: {
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
      },

      // Optional: Custom layouts (shown in editor page layout selector)
      // Only value/label are needed here - header/footer components are added
      // in your puck-layouts.ts file for editor preview and frontend rendering
      layouts: [
        { value: 'default', label: 'Default' },
        { value: 'landing', label: 'Landing' },
        { value: 'full-width', label: 'Full Width' },
      ],

      // Admin UI configuration
      admin: {
        // URL pattern for the editor (use {id} placeholder)
        editorPathPattern: '/pages/{id}/edit',
        // Button label in Payload admin
        buttonLabel: 'Edit with Puck',
      },
    }),

    // ... your other plugins
  ],

  // Required for Puck pages: Enable drafts on the pages collection
  // (The plugin handles this automatically when autoGenerateCollection is true)
})
