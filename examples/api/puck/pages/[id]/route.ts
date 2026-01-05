/**
 * Puck Pages API - Get, Update, Delete
 *
 * Copy this file to: app/api/puck/pages/[id]/route.ts
 *
 * Provides:
 * - GET: Get a single page by ID
 * - PATCH: Update a page (supports draft/publish)
 * - DELETE: Delete a page
 */

import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
import config from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    // Customize authentication logic for your app
    authenticate: async (request) => {
      const payload = await getPayload({ config })
      const { user } = await payload.auth({ headers: await headers() })

      if (!user) {
        return { authenticated: false }
      }

      return {
        authenticated: true,
        user: { id: user.id, role: (user as any).role },
      }
    },

    // Optional: Customize who can view a page
    canView: async (user, pageId) => {
      return { allowed: true }
    },

    // Optional: Customize who can edit a page
    canEdit: async (user, pageId) => {
      return { allowed: !!user }
    },

    // Optional: Customize who can publish (defaults to canEdit)
    canPublish: async (user, pageId) => {
      return { allowed: !!user }
    },

    // Optional: Customize who can delete a page
    canDelete: async (user, pageId) => {
      // Example: Only admins can delete
      return { allowed: user?.role === 'admin' }
    },
  },

  // Optional: Map Puck root props to Payload fields
  rootPropsMapping: [
    { from: 'metaTitle', to: 'seo.metaTitle' },
    { from: 'metaDescription', to: 'seo.metaDescription' },
    { from: 'pageLayout', to: 'pageLayout' },
  ],
})
