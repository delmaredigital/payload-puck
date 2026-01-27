/**
 * @delmaredigital/payload-puck
 *
 * A portable PayloadCMS plugin for Puck visual page builder integration.
 *
 * @example
 * ```typescript
 * // In payload.config.ts
 * import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'
 *
 * export default buildConfig({
 *   plugins: [
 *     createPuckPlugin({
 *       pagesCollection: 'pages',
 *     }),
 *   ],
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Using config for rendering
 * import { baseConfig } from '@delmaredigital/payload-puck/config'
 * import { PageRenderer } from '@delmaredigital/payload-puck/render'
 *
 * <PageRenderer data={page.puckData} config={baseConfig} />
 * ```
 *
 * @example
 * ```typescript
 * // Merging custom components
 * import { mergeConfigs, editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * const customConfig = mergeConfigs({
 *   base: editorConfig,
 *   components: {
 *     CustomHero: myHeroConfig,
 *   },
 *   categories: {
 *     custom: { title: 'Custom', components: ['CustomHero'] },
 *   },
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Creating API routes
 * // src/app/api/puck/pages/route.ts
 * import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
 *
 * export const { GET, POST } = createPuckApiRoutes({
 *   auth: {
 *     authenticate: async (request) => {
 *       const session = await getSession(request)
 *       if (!session?.user) return { authenticated: false }
 *       return { authenticated: true, user: session.user }
 *     },
 *   },
 * })
 * ```
 */

// Re-export all types
export * from './types/index.js'

// Re-export plugin utilities
export {
  createPuckPlugin,
  generatePagesCollection,
  generatePuckEditField,
  TemplatesCollection,
} from './plugin/index.js'

// Re-export field utilities for hybrid collection integration
export {
  getPuckFields,
  puckDataField,
  editorVersionField,
  createEditorVersionField,
  pageLayoutField,
  createPageLayoutField,
  isHomepageField,
  seoFieldGroup,
  conversionFieldGroup,
} from './plugin/index.js'

// Re-export field types
export type { GetPuckFieldsOptions } from './plugin/fields/types.js'
