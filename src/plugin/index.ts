import type { CollectionConfig, Config as PayloadConfig, Field, Plugin } from 'payload'
import type { PuckPluginOptions, PuckAdminConfig, PageTreeIntegrationOptions } from '../types'
import { generatePagesCollection } from './collections/Pages'
import { TemplatesCollection } from '../collections/Templates'
import { getPuckFields } from './fields'
import {
  createListHandler,
  createCreateHandler,
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
  createVersionsHandler,
  createRestoreHandler,
} from '../endpoints/index.js'

/**
 * Get all field names from a collection's fields array (including nested group fields and tabs)
 */
function getExistingFieldNames(fields: Field[]): Set<string> {
  const names = new Set<string>()

  function addFieldNames(fieldsToCheck: Field[]) {
    for (const field of fieldsToCheck) {
      // Add the field name if it has one
      if ('name' in field && field.name) {
        names.add(field.name)
      }

      // Check nested fields in groups, rows, collapsibles, etc.
      if ('fields' in field && Array.isArray(field.fields)) {
        addFieldNames(field.fields)
      }

      // Check fields inside tabs
      if (field.type === 'tabs' && 'tabs' in field && Array.isArray(field.tabs)) {
        for (const tab of field.tabs) {
          if ('fields' in tab && Array.isArray(tab.fields)) {
            addFieldNames(tab.fields)
          }
        }
      }
    }
  }

  addFieldNames(fields)
  return names
}

/**
 * Filter out fields that already exist in the target collection
 */
function filterExistingFields(fieldsToAdd: Field[], existingNames: Set<string>): Field[] {
  return fieldsToAdd.filter((field) => {
    if ('name' in field && field.name) {
      return !existingNames.has(field.name)
    }
    return true // Keep fields without names (like UI fields)
  })
}

/**
 * Generates the UI field configuration for the Edit with Puck button
 */
function generatePuckEditField(
  collectionSlug: string,
  adminConfig: PuckAdminConfig = {}
): Field {
  const {
    editorPathPattern = '/pages/{id}/edit',
    buttonLabel = 'Edit with Puck',
    buttonPosition, // undefined = main area (default), 'sidebar' = sidebar
  } = adminConfig

  return {
    name: 'puckEdit',
    type: 'ui',
    admin: {
      // Only set position if explicitly specified (sidebar)
      // undefined means main form area in Payload
      ...(buttonPosition && { position: buttonPosition }),
      components: {
        Field: '@delmaredigital/payload-puck/admin/client#EditWithPuckButton',
        Cell: '@delmaredigital/payload-puck/admin/client#EditWithPuckCell',
      },
      custom: {
        collectionSlug,
        editorPathPattern,
        label: buttonLabel,
      },
    },
  }
}

/**
 * Creates a Payload plugin that integrates Puck visual page builder
 *
 * This plugin:
 * - Generates a Pages collection with puckData field
 * - Registers the Puck editor as an admin view at /admin/puck-editor/:collection/:id
 * - Adds an "Edit with Puck" button in the admin document view
 * - Optionally registers API endpoints for CRUD operations
 *
 * The Puck editor is fully integrated into Payload's admin UI.
 *
 * @example
 * ```typescript
 * import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'
 *
 * export default buildConfig({
 *   plugins: [
 *     createPuckPlugin({
 *       pagesCollection: 'pages',
 *       access: {
 *         read: () => true,
 *         create: ({ req }) => !!req.user,
 *         update: ({ req }) => !!req.user,
 *         delete: ({ req }) => req.user?.role === 'admin',
 *       },
 *       admin: {
 *         buttonLabel: 'Visual Editor',
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export function createPuckPlugin(options: PuckPluginOptions = {}): Plugin {
  const {
    pagesCollection = 'pages',
    autoGenerateCollection = true,
    admin: pluginAdminConfig = {},
    enableAdminView = true,
    adminViewPath = '/puck-editor',
    enableEndpoints = true,
    pageTreeIntegration, // No default - undefined means auto-detect
  } = options

  const { addEditButton = true } = pluginAdminConfig

  // Parse page-tree integration config
  // - undefined: auto-detect at runtime (null stored, view will check for pageSegment field)
  // - false: explicitly disabled (store false to prevent auto-detection)
  // - true: use defaults
  // - object: use custom field names
  let pageTreeConfig: PageTreeIntegrationOptions | false | null = null
  if (pageTreeIntegration === undefined) {
    // Not specified - store null to trigger auto-detection in the view
    pageTreeConfig = null
  } else if (pageTreeIntegration === false) {
    // Explicitly disabled - store false to prevent auto-detection
    pageTreeConfig = false
  } else if (pageTreeIntegration === true) {
    // Explicitly enabled with defaults
    pageTreeConfig = {
      folderSlug: 'payload-folders',
      segmentFieldName: 'pathSegment',
      pageSegmentFieldName: 'pageSegment',
      folderFieldName: 'folder',
    }
  } else {
    // Custom config object
    pageTreeConfig = {
      folderSlug: pageTreeIntegration.folderSlug ?? 'payload-folders',
      segmentFieldName: pageTreeIntegration.segmentFieldName ?? 'pathSegment',
      pageSegmentFieldName: pageTreeIntegration.pageSegmentFieldName ?? 'pageSegment',
      folderFieldName: pageTreeIntegration.folderFieldName ?? 'folder',
    }
  }

  return (incomingConfig: PayloadConfig): PayloadConfig => {
    // Generate Pages collection if auto-generate is enabled
    let collections = incomingConfig.collections || []

    // Always add the Templates collection if it doesn't exist
    const templatesCollectionExists = collections.some(
      (c) => c.slug === 'puck-templates'
    )
    if (!templatesCollectionExists) {
      collections = [...collections, TemplatesCollection]
    }

    if (autoGenerateCollection) {
      // Check if collection already exists
      const existingCollectionIndex = collections.findIndex(
        (c) => c.slug === pagesCollection
      )

      // Generate the edit button field if enabled
      const editButtonField = addEditButton
        ? [generatePuckEditField(pagesCollection, pluginAdminConfig)]
        : []

      if (existingCollectionIndex >= 0) {
        // Collection exists - only add Puck fields that don't already exist
        const existingCollection = collections[existingCollectionIndex]
        const existingFields = existingCollection.fields || []
        const existingFieldNames = getExistingFieldNames(existingFields)

        // Get Puck-specific fields (not the full collection with title/slug)
        // This avoids duplicating fields the user may have already defined
        const puckFields = getPuckFields({
          includeSEO: !existingFieldNames.has('meta'),
          includeConversion: !existingFieldNames.has('conversionTracking'),
          includeEditorVersion: !existingFieldNames.has('editorVersion'),
          includePageLayout: !existingFieldNames.has('pageLayout'),
          includeIsHomepage: !existingFieldNames.has('isHomepage'),
          layouts: options.layouts,
        })

        // Filter out any remaining duplicates (e.g., puckData if user already has it)
        const fieldsToAdd = filterExistingFields(puckFields, existingFieldNames)

        // Only add edit button if puckEdit doesn't exist
        const editFieldsToAdd = existingFieldNames.has('puckEdit') ? [] : editButtonField

        collections = [
          ...collections.slice(0, existingCollectionIndex),
          {
            ...existingCollection,
            // Ensure drafts are enabled for Puck
            versions:
              typeof existingCollection.versions === 'object'
                ? { drafts: true, ...existingCollection.versions }
                : existingCollection.versions ?? { drafts: true },
            fields: [
              ...existingFields,
              ...fieldsToAdd,
              ...editFieldsToAdd,
            ],
          },
          ...collections.slice(existingCollectionIndex + 1),
        ]
      } else {
        // Add new collection with edit button field
        const generatedCollection = generatePagesCollection(pagesCollection, options)
        collections = [
          ...collections,
          {
            ...generatedCollection,
            fields: [...generatedCollection.fields, ...editButtonField],
          },
        ]
      }
    }

    // Build the admin config with view registration
    const payloadAdminConfig: PayloadConfig['admin'] = {
      ...incomingConfig.admin,
    }

    // Register the Puck editor admin view if enabled
    if (enableAdminView) {
      payloadAdminConfig.components = {
        ...payloadAdminConfig.components,
        views: {
          ...payloadAdminConfig.components?.views,
          puckEditor: {
            Component: '@delmaredigital/payload-puck/rsc#PuckEditorView',
            path: `${adminViewPath}/:segments*` as `/${string}`,
          },
        },
      }
    }

    // Register API endpoints if enabled
    const puckCollections = [pagesCollection]
    const endpointOptions = { collections: puckCollections }
    const endpoints = enableEndpoints
      ? [
          ...(incomingConfig.endpoints || []),
          {
            path: '/puck/:collection',
            method: 'get' as const,
            handler: createListHandler(endpointOptions),
          },
          {
            path: '/puck/:collection',
            method: 'post' as const,
            handler: createCreateHandler(endpointOptions),
          },
          {
            path: '/puck/:collection/:id',
            method: 'get' as const,
            handler: createGetHandler(endpointOptions),
          },
          {
            path: '/puck/:collection/:id',
            method: 'patch' as const,
            handler: createUpdateHandler(endpointOptions),
          },
          {
            path: '/puck/:collection/:id',
            method: 'delete' as const,
            handler: createDeleteHandler(endpointOptions),
          },
          {
            path: '/puck/:collection/:id/versions',
            method: 'get' as const,
            handler: createVersionsHandler(endpointOptions),
          },
          {
            path: '/puck/:collection/:id/restore',
            method: 'post' as const,
            handler: createRestoreHandler(endpointOptions),
          },
        ]
      : incomingConfig.endpoints || []

    return {
      ...incomingConfig,
      admin: payloadAdminConfig,
      collections,
      endpoints,
      // Store options in custom for the view to access
      custom: {
        ...incomingConfig.custom,
        puck: {
          collections: puckCollections,
          layouts: options.layouts,
          // Page-tree integration config (null if not enabled)
          pageTree: pageTreeConfig,
        },
      },
      onInit: async (payload) => {
        // Call existing onInit if present
        if (incomingConfig.onInit) {
          await incomingConfig.onInit(payload)
        }
      },
    }
  }
}

// Re-export collection utilities
export { generatePagesCollection } from './collections/Pages'
export { TemplatesCollection } from '../collections/Templates'

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
} from './fields'

// Export the edit button generator for hybrid collections
export { generatePuckEditField }

// Re-export types
export type { PuckPluginOptions, PuckAdminConfig } from '../types'
export type { GetPuckFieldsOptions } from './fields/types'
