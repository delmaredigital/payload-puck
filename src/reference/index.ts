import type { Config, CollectionConfig, Field, TextField, NumberField } from 'payload'
import type { PageTreePluginConfig } from './types.js'
import { createBuildSlugHook } from './hooks/buildSlugFromFolder.js'
import { createCascadeSlugUpdatesHook } from './hooks/cascadeSlugUpdates.js'
import { slugify } from './utils/getFolderPath.js'
import {
  createMoveHandler,
  createReorderHandler,
  createCreateHandler,
  createDeleteHandler,
  createDuplicateHandler,
  createStatusHandler,
  createRenameHandler,
} from './endpoints/treeOperations.js'

export type { PageTreePluginConfig } from './types.js'
export type { TreeNode, FolderDocument, PageDocument } from './types.js'
export { getFolderPath, slugify } from './utils/getFolderPath.js'
// Components are exported via /client and /rsc subpaths for proper import map resolution

/**
 * Payload Page Tree Plugin
 *
 * Extends Payload's built-in folders to auto-generate hierarchical URL slugs.
 * Folders define URL structure, pages pick a folder, and slugs are auto-generated.
 *
 * @example
 * ```ts
 * import { pageTreePlugin } from '@delmaredigital/payload-page-tree'
 *
 * export default buildConfig({
 *   plugins: [
 *     pageTreePlugin({
 *       collections: ['pages'],
 *     }),
 *   ],
 * })
 * ```
 */
export function pageTreePlugin(pluginOptions: PageTreePluginConfig) {
  const {
    collections,
    folderSlug = 'payload-folders',
    segmentFieldName = 'pathSegment',
    pageSegmentFieldName = 'pageSegment',
    disabled = false,
    adminView = {},
  } = pluginOptions

  const {
    enabled: adminViewEnabled = true,
    path: adminViewPath = '/page-tree',
  } = adminView

  // The folder field name that Payload's folders feature adds
  const folderFieldName = 'folder'

  return (config: Config): Config => {
    // Even if disabled, we need to add fields to maintain schema consistency
    const shouldAddHooks = !disabled

    // Get existing folder config (handle false, undefined, or object)
    const existingFolderConfig =
      config.folders && typeof config.folders === 'object' ? config.folders : {}

    // Add folder collection overrides to extend folders with pathSegment
    config.folders = {
      ...existingFolderConfig,
      collectionOverrides: [
        ...(existingFolderConfig.collectionOverrides || []),
        ({ collection }) => {
          const existingFields = collection.fields || []

          // Add pathSegment field to folders
          const pathSegmentField: TextField = {
            name: segmentFieldName,
            type: 'text',
            required: true,
            admin: {
              position: 'sidebar',
              description: 'URL path segment (e.g., "appeals" for /appeals/...)',
            },
            hooks: {
              beforeValidate: [
                // Auto-slugify the segment
                ({ value, data }: { value?: string; data?: Record<string, unknown> }) => {
                  if (value) return slugify(String(value))
                  if (data?.name) return slugify(String(data.name))
                  return value
                },
              ],
            },
          }

          // Add sortOrder field for tree ordering
          const sortOrderField: NumberField = {
            name: 'sortOrder',
            type: 'number',
            defaultValue: 0,
            admin: {
              hidden: true,
            },
          }

          // Create cascade hook for folder changes
          const cascadeHook = shouldAddHooks
            ? createCascadeSlugUpdatesHook({
                collections,
                folderSlug,
                segmentFieldName,
                folderFieldName,
              })
            : undefined

          return {
            ...collection,
            fields: [...existingFields, pathSegmentField, sortOrderField],
            hooks: {
              ...collection.hooks,
              afterChange: [
                ...(collection.hooks?.afterChange || []),
                ...(cascadeHook ? [cascadeHook] : []),
              ],
            },
          }
        },
      ],
    }

    // Process each collection that should have folder-based slugs
    if (config.collections) {
      config.collections = config.collections.map((collection) => {
        // Skip if this collection isn't in the list
        if (!collections.includes(collection.slug as string)) {
          return collection
        }

        // Enable folders on this collection
        const updatedCollection: CollectionConfig = {
          ...collection,
          folders: true, // Enable Payload's folders feature
        }

        // Add pageSegment field
        const pageSegmentField: TextField = {
          name: pageSegmentFieldName,
          type: 'text',
          admin: {
            position: 'sidebar',
            description: 'URL segment for this page (auto-generated from title if empty)',
          },
          hooks: {
            beforeValidate: [
              // Auto-slugify if provided, otherwise leave empty (will be generated from title)
              ({ value }: { value?: string }) => {
                if (value) return slugify(String(value))
                return value
              },
            ],
          },
        }

        // Add sortOrder field for tree ordering
        const pageSortOrderField: NumberField = {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            hidden: true,
          },
        }

        // Find and modify the slug field to be read-only
        const modifiedFields: Field[] = updatedCollection.fields.map((field) => {
          if ('name' in field && field.name === 'slug' && field.type === 'text') {
            const textField = field as TextField
            return {
              ...textField,
              admin: {
                ...textField.admin,
                readOnly: true,
                description: 'Auto-generated from folder path + page segment',
              },
            } satisfies TextField
          }
          return field
        })

        // Add the pageSegment and sortOrder fields
        updatedCollection.fields = [...modifiedFields, pageSegmentField, pageSortOrderField]

        // Add beforeChange hook for slug generation
        if (shouldAddHooks) {
          const buildSlugHook = createBuildSlugHook({
            folderSlug,
            segmentFieldName,
            pageSegmentFieldName,
            folderFieldName,
          })

          updatedCollection.hooks = {
            ...updatedCollection.hooks,
            beforeChange: [...(updatedCollection.hooks?.beforeChange || []), buildSlugHook],
          }
        }

        return updatedCollection
      })
    }

    // Register admin view if enabled
    if (adminViewEnabled) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          // Add nav link after existing nav links (client component)
          afterNavLinks: [
            ...(config.admin?.components?.afterNavLinks || []),
            '@delmaredigital/payload-page-tree/client#PageTreeNavLink',
          ],
          // Add custom view (server component)
          views: {
            ...config.admin?.components?.views,
            pageTree: {
              Component: '@delmaredigital/payload-page-tree/rsc#PageTreeView',
              path: adminViewPath as `/${string}`,
            },
          },
        },
      }
    }

    // Register API endpoints for tree operations
    const endpointOptions = { collections, folderSlug }
    config.endpoints = [
      ...(config.endpoints || []),
      {
        path: '/page-tree/move',
        method: 'post',
        handler: createMoveHandler(endpointOptions),
      },
      {
        path: '/page-tree/reorder',
        method: 'post',
        handler: createReorderHandler(endpointOptions),
      },
      {
        path: '/page-tree/create',
        method: 'post',
        handler: createCreateHandler(endpointOptions),
      },
      {
        path: '/page-tree/delete',
        method: 'delete',
        handler: createDeleteHandler(endpointOptions),
      },
      {
        path: '/page-tree/duplicate',
        method: 'post',
        handler: createDuplicateHandler(endpointOptions),
      },
      {
        path: '/page-tree/status',
        method: 'post',
        handler: createStatusHandler(endpointOptions),
      },
      {
        path: '/page-tree/rename',
        method: 'post',
        handler: createRenameHandler(endpointOptions),
      },
    ]

    return config
  }
}

export default pageTreePlugin
