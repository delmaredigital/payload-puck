// GET: one page · PATCH: update (draft/publish) · DELETE: delete
import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
import { getPayload } from 'payload'
import config from '@payload-config'

export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({
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
    canView: async (user, pageId) => ({ allowed: true }),
    canEdit: async (user, pageId) => ({ allowed: !!user }),
    // Defaults to canEdit
    canPublish: async (user, pageId) => ({ allowed: !!user }),
    // Example: only admins can delete
    canDelete: async (user, pageId) => ({ allowed: user?.role === 'admin' }),
  },

  // Optional: map Puck root props to Payload fields
  rootPropsMapping: [
    { from: 'metaTitle', to: 'seo.metaTitle' },
    { from: 'metaDescription', to: 'seo.metaDescription' },
    { from: 'pageLayout', to: 'pageLayout' },
  ],
})
