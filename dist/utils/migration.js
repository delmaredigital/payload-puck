/**
 * Migration Utility for Converting Legacy Payload CMS Pages to Puck Format
 *
 * This utility converts legacy Payload CMS page block structures to the
 * Puck visual editor format, enabling seamless migration of existing content.
 */
// =============================================================================
// Block Type Mapping
// =============================================================================
/**
 * Maps legacy Payload block types (camelCase) to Puck component types (PascalCase).
 * Extend this map to support additional custom block types.
 */
export const blockTypeMap = {
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
};
// =============================================================================
// ID Generation
// =============================================================================
/**
 * Generates a unique ID for Puck content items.
 * Uses a format compatible with Puck's internal ID scheme.
 */
export function generatePuckId(legacyId) {
    if (legacyId) {
        return legacyId;
    }
    // Generate a random ID similar to Puck's format
    return `puck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
// =============================================================================
// Prop Transformation Utilities
// =============================================================================
/**
 * Transforms a Payload media reference (ID or Media object) to Puck MediaReference format.
 * Handles both ID-only references and full Media objects.
 */
export function transformMediaReference(media) {
    if (media === null || media === undefined) {
        return null;
    }
    if (typeof media === 'number' || typeof media === 'string') {
        // Just an ID reference - Puck will need to fetch the full media
        return { id: media };
    }
    // Full media object
    return {
        id: media.id,
        url: media.url,
        alt: media.alt,
        width: media.width,
        height: media.height,
    };
}
/**
 * Transforms Lexical rich text content to a serialized string format.
 * Puck stores rich text as JSON strings for the custom editors.
 */
export function transformRichText(richText) {
    if (!richText) {
        return undefined;
    }
    // If it's already a string, return as-is
    if (typeof richText === 'string') {
        return richText;
    }
    // If it's an object (Lexical format), serialize it
    if (typeof richText === 'object') {
        try {
            return JSON.stringify(richText);
        }
        catch {
            console.warn('[payload-puck] Failed to serialize rich text content');
            return undefined;
        }
    }
    return undefined;
}
/**
 * Transforms an array of relationships to Puck format.
 */
export function transformRelationshipArray(relations) {
    if (!relations || !Array.isArray(relations)) {
        return undefined;
    }
    return relations.map((rel) => {
        if (typeof rel === 'number' || typeof rel === 'string') {
            return { id: rel, title: '' }; // Title will need to be fetched
        }
        return {
            id: rel.id,
            title: rel.title || '',
            slug: rel.slug,
        };
    });
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
];
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
];
/**
 * Transform props for a specific block type.
 * Handles any block-specific transformations needed.
 */
export function transformBlockProps(block, options) {
    const { blockType, id, blockName, ...restProps } = block;
    const richTextFields = options?.richTextFields || RICH_TEXT_FIELDS;
    const mediaFields = options?.mediaFields || MEDIA_FIELDS;
    const customTransformers = options?.customTransformers || {};
    const props = {
        id: generatePuckId(id),
    };
    // Process each prop based on known patterns
    for (const [key, value] of Object.entries(restProps)) {
        // Check for custom transformer first
        if (customTransformers[key]) {
            props[key] = customTransformers[key](value);
            continue;
        }
        // Rich text fields - serialize Lexical content
        if (richTextFields.includes(key)) {
            props[key] = transformRichText(value);
            continue;
        }
        // Media fields - transform to MediaReference
        if (mediaFields.includes(key)) {
            props[key] = transformMediaReference(value);
            continue;
        }
        // Array fields that need ID generation for items
        if (Array.isArray(value)) {
            props[key] = value.map((item) => {
                if (typeof item === 'object' && item !== null) {
                    const { id: itemId, ...itemRest } = item;
                    return {
                        ...itemRest,
                        id: itemId || generatePuckId(),
                    };
                }
                return item;
            });
            continue;
        }
        // Default: pass through as-is
        props[key] = value;
    }
    return props;
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
export function migrateLegacyToPuck(page, options = {}) {
    const { blockTypeMap: customBlockTypeMap, richTextFields, mediaFields, customTransformers, skipUnknownBlocks = true, onUnknownBlock, } = options;
    // Merge custom block type map with defaults
    const effectiveBlockTypeMap = {
        ...blockTypeMap,
        ...customBlockTypeMap,
    };
    // Build root props
    const rootProps = {
        title: page.title,
        pageLayout: page.pageLayout || 'default',
    };
    // Convert layout blocks to Puck content items
    const content = [];
    if (page.layout && Array.isArray(page.layout)) {
        for (const block of page.layout) {
            const legacyBlock = block;
            // Get the Puck component type from the legacy block type
            const puckType = effectiveBlockTypeMap[legacyBlock.blockType];
            if (!puckType) {
                // Handle unknown block type
                if (onUnknownBlock) {
                    const customItem = onUnknownBlock(legacyBlock);
                    if (customItem) {
                        content.push(customItem);
                    }
                    continue;
                }
                if (skipUnknownBlocks) {
                    console.warn(`[payload-puck] Unknown block type "${legacyBlock.blockType}" - skipping during migration`);
                    continue;
                }
                throw new Error(`Unknown block type "${legacyBlock.blockType}" encountered during migration`);
            }
            // Transform the block props
            const transformedProps = transformBlockProps(legacyBlock, {
                richTextFields,
                mediaFields,
                customTransformers,
            });
            // Create the Puck content item
            const contentItem = {
                type: puckType,
                props: transformedProps,
            };
            content.push(contentItem);
        }
    }
    // Build the complete Puck data structure
    const puckData = {
        root: {
            props: rootProps,
        },
        content,
        zones: {},
    };
    return puckData;
}
/**
 * Gets a summary of a legacy page for migration preview.
 * Useful for showing users what will be migrated before committing.
 *
 * @param page - The legacy page to preview
 * @param customBlockTypeMap - Optional custom block type mapping
 * @returns Preview information about the migration
 */
export function getMigrationPreview(page, customBlockTypeMap) {
    const warnings = [];
    const blockTypes = [];
    const unmappedBlockTypes = [];
    const effectiveBlockTypeMap = {
        ...blockTypeMap,
        ...customBlockTypeMap,
    };
    if (page.layout && Array.isArray(page.layout)) {
        for (const block of page.layout) {
            const legacyBlock = block;
            const puckType = effectiveBlockTypeMap[legacyBlock.blockType];
            if (puckType) {
                blockTypes.push(puckType);
            }
            else {
                warnings.push(`Unknown block type: ${legacyBlock.blockType}`);
                if (!unmappedBlockTypes.includes(legacyBlock.blockType)) {
                    unmappedBlockTypes.push(legacyBlock.blockType);
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
    };
}
//# sourceMappingURL=migration.js.map