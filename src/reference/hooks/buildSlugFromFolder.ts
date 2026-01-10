import type { CollectionBeforeChangeHook } from 'payload'
import { getFolderPath, slugify } from '../utils/getFolderPath.js'

interface BuildSlugOptions {
  folderSlug: string
  segmentFieldName: string
  pageSegmentFieldName: string
  folderFieldName: string
}

/**
 * Creates a beforeChange hook that auto-generates the slug from folder hierarchy
 */
export function createBuildSlugHook(options: BuildSlugOptions): CollectionBeforeChangeHook {
  const { folderSlug, segmentFieldName, pageSegmentFieldName, folderFieldName } = options

  return async ({ data, req }) => {
    if (!data) return data

    // Get the folder ID - handle both populated and unpopulated cases
    const folderId =
      typeof data[folderFieldName] === 'object' && data[folderFieldName] !== null
        ? data[folderFieldName].id
        : data[folderFieldName]

    // Get the page segment - use provided value or generate from title
    let pageSegment = data[pageSegmentFieldName]
    if (!pageSegment && data.title) {
      pageSegment = slugify(data.title)
      data[pageSegmentFieldName] = pageSegment
    }

    // If no segment at all, we can't build a slug
    if (!pageSegment) {
      return data
    }

    // Get the folder path
    const folderPath = await getFolderPath(folderId, req.payload, folderSlug, segmentFieldName)

    // Build the full slug
    const newSlug = folderPath ? `${folderPath}/${pageSegment}` : pageSegment

    // Only update if slug has changed
    if (data.slug !== newSlug) {
      data.slug = newSlug
    }

    return data
  }
}
