/**
 * Puck Pages API - List & Create
 *
 * Copy this file to: app/api/puck/pages/route.ts
 *
 * Provides:
 * - GET: List all pages
 * - POST: Create a new page
 */

import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
import config from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

export const { GET, POST } = createPuckApiRoutes({
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

    // Optional: Customize who can list pages
    canList: async (user) => {
      return { allowed: true }
    },

    // Optional: Customize who can create pages
    canCreate: async (user) => {
      return { allowed: !!user }
    },
  },
})
