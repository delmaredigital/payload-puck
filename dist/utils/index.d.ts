/**
 * Migration and Validation Utilities
 *
 * This module provides utilities for migrating legacy Payload CMS pages
 * to Puck format and validating Puck data structures.
 *
 * @example
 * ```ts
 * import {
 *   migrateLegacyToPuck,
 *   validatePuckData,
 *   getMigrationPreview,
 *   blockTypeMap,
 * } from '@delmaredigital/payload-puck/utils'
 *
 * // Preview migration
 * const preview = getMigrationPreview(legacyPage)
 * console.log('Blocks to migrate:', preview.blockCount)
 * console.log('Warnings:', preview.warnings)
 *
 * // Perform migration
 * const puckData = migrateLegacyToPuck(legacyPage)
 *
 * // Validate result
 * const validation = validatePuckData(puckData)
 * if (validation.valid) {
 *   await payload.update({ collection: 'pages', id: pageId, data: { puckData } })
 * }
 * ```
 */
export { migrateLegacyToPuck, getMigrationPreview, blockTypeMap, generatePuckId, transformBlockProps, transformMediaReference, transformRichText, transformRelationshipArray, type LegacyBlock, type LegacyPage, type MediaReference, type PuckContentItem, type MigrateLegacyOptions, type MigrationPreview, } from './migration';
export { validatePuckData, isPuckData, isPuckRootProps, assertPuckData, parsePuckDataJson, type ValidationResult, type ValidationOptions, } from './validation';
//# sourceMappingURL=index.d.ts.map