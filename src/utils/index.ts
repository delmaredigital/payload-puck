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

// =============================================================================
// Migration Exports
// =============================================================================

export {
  // Main migration function
  migrateLegacyToPuck,
  // Preview function
  getMigrationPreview,
  // Block type mapping
  blockTypeMap,
  // ID generation
  generatePuckId,
  // Prop transformation utilities
  transformBlockProps,
  transformMediaReference,
  transformRichText,
  transformRelationshipArray,
  // Types
  type LegacyBlock,
  type LegacyPage,
  type MediaReference,
  type PuckContentItem,
  type MigrateLegacyOptions,
  type MigrationPreview,
} from './migration'

// =============================================================================
// Validation Exports
// =============================================================================

export {
  // Main validation function
  validatePuckData,
  // Type guards
  isPuckData,
  isPuckRootProps,
  // Assertion helper
  assertPuckData,
  // JSON parsing helper
  parsePuckDataJson,
  // Types
  type ValidationResult,
  type ValidationOptions,
} from './validation'
