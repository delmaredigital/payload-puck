/**
 * Puck Pages Versions API
 *
 * Copy this file to: app/api/puck/pages/[id]/versions/route.ts
 *
 * Provides:
 * - GET: List page versions
 * - POST: Restore a specific version
 *
 * The History button automatically appears in the editor when this route exists.
 */

import { createPuckApiRoutesVersions } from '@delmaredigital/payload-puck/api'
import config from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

export const { GET, POST } = createPuckApiRoutesVersions({
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

    // Optional: Customize who can view versions
    canView: async (user, pageId) => {
      return { allowed: !!user }
    },

    // Optional: Customize who can restore versions
    canEdit: async (user, pageId) => {
      return { allowed: !!user }
    },
  },
})
