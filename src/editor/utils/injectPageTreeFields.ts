import type { Config as PuckConfig } from '@puckeditor/core'
import { createFolderPickerField } from '../../fields/FolderPickerField.js'
import { createPageSegmentField } from '../../fields/PageSegmentField.js'
import { createSlugPreviewField } from '../../fields/SlugPreviewField.js'

/**
 * Injects page-tree fields (folder, pageSegment, slug) into a Puck config's root fields.
 * Replaces any existing slug field with the page-tree slug preview.
 *
 * @param config - The base Puck config to enhance
 * @returns A new config with page-tree fields injected into root.fields
 */
export function injectPageTreeFields(config: PuckConfig): PuckConfig {
  // Create page-tree specific fields
  const pageTreeFields = {
    folder: createFolderPickerField({ label: 'Folder' }),
    pageSegment: createPageSegmentField({ label: 'Page Segment' }),
    slug: createSlugPreviewField({
      label: 'URL Slug',
      hint: 'Auto-generated from folder + page segment',
    }),
  }

  // Merge page-tree fields into root config, replacing existing slug field
  const existingRootFields = config.root?.fields || {}
  const { slug: _existingSlug, ...otherFields } = existingRootFields as Record<string, unknown>

  return {
    ...config,
    root: {
      ...config.root,
      fields: {
        ...otherFields,
        ...pageTreeFields,
      },
    },
  } as PuckConfig
}
