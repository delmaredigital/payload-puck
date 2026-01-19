/**
 * Migration Utility for Converting Legacy Payload CMS Pages to Puck Format
 *
 * This utility converts legacy Payload CMS page block structures to the
 * Puck visual editor format, enabling seamless migration of existing content.
 */
import type { PuckPageData, MediaObject } from '../types';
/**
 * Legacy block from Payload CMS pages.
 * Each block has a blockType discriminator and various props.
 */
export interface LegacyBlock {
    blockType: string;
    id?: string | null;
    blockName?: string | null;
    [key: string]: unknown;
}
/**
 * Subset of Page type used for migration.
 * Only includes fields relevant to content migration.
 */
export interface LegacyPage {
    title: string;
    slug: string;
    pageLayout?: string;
    layout?: LegacyBlock[] | null;
    [key: string]: unknown;
}
/**
 * Media reference in Puck format
 */
export interface MediaReference {
    id: string | number;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
}
/**
 * Puck content item structure
 */
export interface PuckContentItem {
    type: string;
    props: {
        id: string;
        [key: string]: unknown;
    };
}
/**
 * Maps legacy Payload block types (camelCase) to Puck component types (PascalCase).
 * Extend this map to support additional custom block types.
 */
export declare const blockTypeMap: Record<string, string>;
/**
 * Generates a unique ID for Puck content items.
 * Uses a format compatible with Puck's internal ID scheme.
 */
export declare function generatePuckId(legacyId?: string | null): string;
/**
 * Transforms a Payload media reference (ID or Media object) to Puck MediaReference format.
 * Handles both ID-only references and full Media objects.
 */
export declare function transformMediaReference(media: string | number | {
    id: string | number;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
} | MediaObject | null | undefined): MediaReference | null;
/**
 * Transforms Lexical rich text content to a serialized string format.
 * Puck stores rich text as JSON strings for the custom editors.
 */
export declare function transformRichText(richText: unknown): string | undefined;
/**
 * Transforms an array of relationships to Puck format.
 */
export declare function transformRelationshipArray<T extends {
    id: string | number;
    title?: string;
    slug?: string;
}>(relations: (string | number | T)[] | null | undefined): Array<{
    id: string | number;
    title: string;
    slug?: string;
}> | undefined;
/**
 * Transform props for a specific block type.
 * Handles any block-specific transformations needed.
 */
export declare function transformBlockProps(block: LegacyBlock, options?: {
    richTextFields?: string[];
    mediaFields?: string[];
    customTransformers?: Record<string, (value: unknown) => unknown>;
}): Record<string, unknown>;
/**
 * Options for the migration function
 */
export interface MigrateLegacyOptions {
    /**
     * Custom block type mapping to extend or override defaults
     */
    blockTypeMap?: Record<string, string>;
    /**
     * Additional rich text field names to transform
     */
    richTextFields?: string[];
    /**
     * Additional media field names to transform
     */
    mediaFields?: string[];
    /**
     * Custom prop transformers for specific field names
     */
    customTransformers?: Record<string, (value: unknown) => unknown>;
    /**
     * Whether to skip unknown block types (default: true)
     * If false, unknown blocks will throw an error
     */
    skipUnknownBlocks?: boolean;
    /**
     * Callback for handling unknown block types
     */
    onUnknownBlock?: (block: LegacyBlock) => PuckContentItem | null;
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
export declare function migrateLegacyToPuck(page: LegacyPage, options?: MigrateLegacyOptions): PuckPageData;
/**
 * Migration preview result
 */
export interface MigrationPreview {
    title: string;
    slug: string;
    blockCount: number;
    blockTypes: string[];
    warnings: string[];
    unmappedBlockTypes: string[];
}
/**
 * Gets a summary of a legacy page for migration preview.
 * Useful for showing users what will be migrated before committing.
 *
 * @param page - The legacy page to preview
 * @param customBlockTypeMap - Optional custom block type mapping
 * @returns Preview information about the migration
 */
export declare function getMigrationPreview(page: LegacyPage, customBlockTypeMap?: Record<string, string>): MigrationPreview;
//# sourceMappingURL=migration.d.ts.map