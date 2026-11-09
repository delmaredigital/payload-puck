// GET: list pages · POST: create a page
import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
import { getPayload } from 'payload'
import config from '@payload-config'

export const { GET, POST } = createPuckApiRoutes({
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
    // Optional: who can list pages
    canList: async (user) => ({ allowed: true }),
    // Optional: who can create pages
    canCreate: async (user) => ({ allowed: !!user }),
  },
})
