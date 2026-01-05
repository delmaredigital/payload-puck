/**
 * Migration Utility for Converting Legacy Payload CMS Pages to Puck Format
 *
 * This utility converts legacy Payload CMS page block structures to the
 * Puck visual editor format, enabling seamless migration of existing content.
 */

import type { PuckPageData, PuckRootProps, MediaObject } from '../types'

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Legacy block from Payload CMS pages.
 * Each block has a blockType discriminator and various props.
 */
export interface LegacyBlock {
  blockType: string
  id?: string | null
  blockName?: string | null
  [key: string]: unknown
}

/**
 * Subset of Page type used for migration.
 * Only includes fields relevant to content migration.
 */
export interface LegacyPage {
  title: string
  slug: string
  pageLayout?: string
  layout?: LegacyBlock[] | null
  [key: string]: unknown
}

/**
 * Media reference in Puck format
 */
export interface MediaReference {
  id: string | number
  url?: string
  alt?: string
  width?: number
  height?: number
}

/**
 * Puck content item structure
 */
export interface PuckContentItem {
  type: string
  props: { id: string; [key: string]: unknown }
}

// =============================================================================
// Block Type Mapping
// =============================================================================

/**
 * Maps legacy Payload block types (camelCase) to Puck component types (PascalCase).
 * Extend this map to support additional custom block types.
 */
export const blockTypeMap: Record<string, string> = {
  heroBlock: 'Hero',
  richTextBlock: 'RichText',
  containerBlock: 'Container',
  flexBlock: 'Flex',
  gridBlock: 'Grid',
  sectionBlock: 'Section',
  spacerBlock: 'Spacer',
  headingBlock: 'Heading',
  textBlock: 'Text',
  imageBlock: 'Image',
  buttonBlock: 'Button',
  cardBlock: 'Card',
  dividerBlock: 'Divider',
  accordionBlock: 'Accordion',
}

// =============================================================================
// ID Generation
// =============================================================================

/**
 * Generates a unique ID for Puck content items.
 * Uses a format compatible with Puck's internal ID scheme.
 */
export function generatePuckId(legacyId?: string | null): string {
  if (legacyId) {
    return legacyId
  }
  // Generate a random ID similar to Puck's format
  return `puck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// =============================================================================
// Prop Transformation Utilities
// =============================================================================

/**
 * Transforms a Payload media reference (ID or Media object) to Puck MediaReference format.
 * Handles both ID-only references and full Media objects.
 */
export function transformMediaReference(
  media:
    | string
    | number
    | { id: string | number; url?: string; alt?: string; width?: number; height?: number }
    | MediaObject
    | null
    | undefined
): MediaReference | null {
  if (media === null || media === undefined) {
    return null
  }

  if (typeof media === 'number' || typeof media === 'string') {
    // Just an ID reference - Puck will need to fetch the full media
    return { id: media }
  }

  // Full media object
  return {
    id: media.id,
    url: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height,
  }
}

/**
 * Transforms Lexical rich text content to a serialized string format.
 * Puck stores rich text as JSON strings for the custom editors.
 */
export function transformRichText(richText: unknown): string | undefined {
  if (!richText) {
    return undefined
  }

  // If it's already a string, return as-is
  if (typeof richText === 'string') {
    return richText
  }

  // If it's an object (Lexical format), serialize it
  if (typeof richText === 'object') {
    try {
      return JSON.stringify(richText)
    } catch {
      console.warn('[payload-puck] Failed to serialize rich text content')
      return undefined
    }
  }

  return undefined
}

/**
 * Transforms an array of relationships to Puck format.
 */
export function transformRelationshipArray<
  T extends { id: string | number; title?: string; slug?: string },
>(
  relations: (string | number | T)[] | null | undefined
): Array<{ id: string | number; title: string; slug?: string }> | undefined {
  if (!relations || !Array.isArray(relations)) {
    return undefined
  }

  return relations.map((rel) => {
    if (typeof rel === 'number' || typeof rel === 'string') {
      return { id: rel, title: '' } // Title will need to be fetched
    }
    return {
      id: rel.id,
      title: rel.title || '',
      slug: rel.slug,
    }
  })
}

// =============================================================================
// Block Prop Transformation
// =============================================================================

/**
 * Known rich text field names in legacy blocks
 */
const RICH_TEXT_FIELDS = [
  'headingRich',
  'subheadingRich',
  'textRich',
  'content',
  'leftContent',
  'rightContent',
  'bodyContent',
  'description',
]

/**
 * Known media field names in legacy blocks
 */
const MEDIA_FIELDS = [
  'backgroundImage',
  'image',
  'rightImage',
  'leftImage',
  'profileImage',
  'media',
  'thumbnail',
  'icon',
]

/**
 * Transform props for a specific block type.
 * Handles any block-specific transformations needed.
 */
export function transformBlockProps(
  block: LegacyBlock,
  options?: {
    richTextFields?: string[]
    mediaFields?: string[]
    customTransformers?: Record<string, (value: unknown) => unknown>
  }
): Record<string, unknown> {
  const { blockType, id, blockName, ...restProps } = block
  const richTextFields = options?.richTextFields || RICH_TEXT_FIELDS
  const mediaFields = options?.mediaFields || MEDIA_FIELDS
  const customTransformers = options?.customTransformers || {}

  const props: Record<string, unknown> = {
    id: generatePuckId(id),
  }

  // Process each prop based on known patterns
  for (const [key, value] of Object.entries(restProps)) {
    // Check for custom transformer first
    if (customTransformers[key]) {
      props[key] = customTransformers[key](value)
      continue
    }

    // Rich text fields - serialize Lexical content
    if (richTextFields.includes(key)) {
      props[key] = transformRichText(value)
      continue
    }

    // Media fields - transform to MediaReference
    if (mediaFields.includes(key)) {
      props[key] = transformMediaReference(
        value as
          | string
          | number
          | { id: string | number; url?: string; alt?: string }
          | null
      )
      continue
    }

    // Array fields that need ID generation for items
    if (Array.isArray(value)) {
      props[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const { id: itemId, ...itemRest } = item as {
            id?: string
            [k: string]: unknown
          }
          return {
            ...itemRest,
            id: itemId || generatePuckId(),
          }
        }
        return item
      })
      continue
    }

    // Default: pass through as-is
    props[key] = value
  }

  return props
}

// =============================================================================
// Main Migration Function
// =============================================================================

/**
 * Options for the migration function
 */
export interface MigrateLegacyOptions {
  /**
   * Custom block type mapping to extend or override defaults
   */
  blockTypeMap?: Record<string, string>

  /**
   * Additional rich text field names to transform
   */
  richTextFields?: string[]

  /**
   * Additional media field names to transform
   */
  mediaFields?: string[]

  /**
   * Custom prop transformers for specific field names
   */
  customTransformers?: Record<string, (value: unknown) => unknown>

  /**
   * Whether to skip unknown block types (default: true)
   * If false, unknown blocks will throw an error
   */
  skipUnknownBlocks?: boolean

  /**
   * Callback for handling unknown block types
   */
  onUnknownBlock?: (block: LegacyBlock) => PuckContentItem | null
}

/**
 * Migrates a legacy Payload CMS page to Puck format.
 *
 * This function:
 * 1. Extracts root props (title, pageLayout, etc.)
 * 2. Converts each block in the layout array to a Puck content item
 * 3. Maps block types from camelCase to PascalCase using blockTypeMap
 * 4. Transforms block props appropriately
 *
 * @param page - The legacy Page object from Payload CMS
 * @param options - Migration options
 * @returns PuckPageData ready for use with the Puck editor
 *
 * @example
 * ```ts
 * const legacyPage = await payload.findByID({ collection: 'pages', id: pageId })
 * const puckData = migrateLegacyToPuck(legacyPage)
 * await payload.update({
 *   collection: 'pages',
 *   id: pageId,
 *   data: { puckData },
 * })
 * ```
 */
export function migrateLegacyToPuck(
  page: LegacyPage,
  options: MigrateLegacyOptions = {}
): PuckPageData {
  const {
    blockTypeMap: customBlockTypeMap,
    richTextFields,
    mediaFields,
    customTransformers,
    skipUnknownBlocks = true,
    onUnknownBlock,
  } = options

  // Merge custom block type map with defaults
  const effectiveBlockTypeMap = {
    ...blockTypeMap,
    ...customBlockTypeMap,
  }

  // Build root props
  const rootProps: PuckRootProps = {
    title: page.title,
    pageLayout: page.pageLayout || 'default',
  }

  // Convert layout blocks to Puck content items
  const content: PuckContentItem[] = []

  if (page.layout && Array.isArray(page.layout)) {
    for (const block of page.layout) {
      const legacyBlock = block as LegacyBlock

      // Get the Puck component type from the legacy block type
      const puckType = effectiveBlockTypeMap[legacyBlock.blockType]

      if (!puckType) {
        // Handle unknown block type
        if (onUnknownBlock) {
          const customItem = onUnknownBlock(legacyBlock)
          if (customItem) {
            content.push(customItem)
          }
          continue
        }

        if (skipUnknownBlocks) {
          console.warn(
            `[payload-puck] Unknown block type "${legacyBlock.blockType}" - skipping during migration`
          )
          continue
        }

        throw new Error(
          `Unknown block type "${legacyBlock.blockType}" encountered during migration`
        )
      }

      // Transform the block props
      const transformedProps = transformBlockProps(legacyBlock, {
        richTextFields,
        mediaFields,
        customTransformers,
      })

      // Create the Puck content item
      const contentItem: PuckContentItem = {
        type: puckType,
        props: transformedProps as { id: string; [key: string]: unknown },
      }

      content.push(contentItem)
    }
  }

  // Build the complete Puck data structure
  const puckData: PuckPageData = {
    root: {
      props: rootProps,
    },
    content,
    zones: {},
  }

  return puckData
}

// =============================================================================
// Migration Preview
// =============================================================================

/**
 * Migration preview result
 */
export interface MigrationPreview {
  title: string
  slug: string
  blockCount: number
  blockTypes: string[]
  warnings: string[]
  unmappedBlockTypes: string[]
}

/**
 * Gets a summary of a legacy page for migration preview.
 * Useful for showing users what will be migrated before committing.
 *
 * @param page - The legacy page to preview
 * @param customBlockTypeMap - Optional custom block type mapping
 * @returns Preview information about the migration
 */
export function getMigrationPreview(
  page: LegacyPage,
  customBlockTypeMap?: Record<string, string>
): MigrationPreview {
  const warnings: string[] = []
  const blockTypes: string[] = []
  const unmappedBlockTypes: string[] = []

  const effectiveBlockTypeMap = {
    ...blockTypeMap,
    ...customBlockTypeMap,
  }

  if (page.layout && Array.isArray(page.layout)) {
    for (const block of page.layout) {
      const legacyBlock = block as LegacyBlock
      const puckType = effectiveBlockTypeMap[legacyBlock.blockType]

      if (puckType) {
        blockTypes.push(puckType)
      } else {
        warnings.push(`Unknown block type: ${legacyBlock.blockType}`)
        if (!unmappedBlockTypes.includes(legacyBlock.blockType)) {
          unmappedBlockTypes.push(legacyBlock.blockType)
        }
      }
    }
  }

  return {
    title: page.title,
    slug: page.slug,
    blockCount: page.layout?.length || 0,
    blockTypes,
    warnings,
    unmappedBlockTypes,
  }
}
