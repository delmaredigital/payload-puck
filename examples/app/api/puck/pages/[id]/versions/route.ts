// GET: list versions. POST is re-exported by the restore route below.
import { createPuckApiRoutesVersions } from '@delmaredigital/payload-puck/api'
import { getPayload } from 'payload'
import config from '@payload-config'

export const { GET, POST } = createPuckApiRoutesVersions({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      const payload = await getPayload({ config })
      const { user } = await payload.auth({ headers: request.headers })
      if (!user) return { authenticated: false }
      return {
        authenticated: true,
        user: { ...user, id: String(user.id) },
        payloadUser: user,
      }
    },
    // Optional: who can view versions
    canView: async (user, pageId) => ({ allowed: !!user }),
    // Optional: who can restore versions
    canEdit: async (user, pageId) => ({ allowed: !!user }),
  },
})
