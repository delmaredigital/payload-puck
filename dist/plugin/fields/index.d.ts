/**
 * Puck Field Utilities
 *
 * Provides reusable field definitions for adding Puck support to existing collections.
 * Use getPuckFields() for easy integration, or import individual fields for granular control.
 *
 * @example
 * ```typescript
 * // Option 1: Use getPuckFields() for recommended defaults
 * import { getPuckFields } from '@delmaredigital/payload-puck'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields...
 *     ...getPuckFields({ includeSEO: false }),
 *   ],
 * }
 *
 * // Option 2: Import individual fields
 * import { puckDataField, editorVersionField } from '@delmaredigital/payload-puck'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields...
 *     puckDataField,
 *     editorVersionField,
 *   ],
 * }
 * ```
 */
import type { Field } from 'payload';
import type { GetPuckFieldsOptions, ConversionTypeOption } from './types';
import type { LayoutDefinition } from '../../layouts/types';
/**
 * Puck data field - stores the visual editor JSON data.
 * This field is always hidden in the admin UI as it's managed via the visual editor.
 */
export declare const puckDataField: Field;
/**
 * Creates an editor version field with smart detection for hybrid setups.
 *
 * The field uses a beforeValidate hook to intelligently determine the editor version:
 * - New pages: Default to 'puck' (or custom defaultValue)
 * - Existing pages with legacy blocks but no puckData: Set to 'legacy'
 * - Existing pages with puckData: Set to 'puck'
 *
 * This prevents existing legacy content from being incorrectly marked as 'puck'
 * when the field is first added to a collection.
 *
 * @param defaultValue - The default editor version for NEW pages ('puck' or 'legacy')
 * @param sidebar - Whether to position in the sidebar (default: true)
 * @param legacyBlocksFieldName - Name of the legacy blocks field to check (default: 'layout')
 */
export declare function createEditorVersionField(defaultValue?: 'legacy' | 'puck', sidebar?: boolean, legacyBlocksFieldName?: string): Field;
/**
 * Pre-configured editor version field with 'puck' as default.
 * Use createEditorVersionField() for custom configuration.
 */
export declare const editorVersionField: Field;
/**
 * Creates a page layout field with custom layouts.
 *
 * @param layouts - Array of layout definitions (defaults to DEFAULT_LAYOUTS)
 * @param sidebar - Whether to position in the sidebar (default: true)
 */
export declare function createPageLayoutField(layouts?: LayoutDefinition[], sidebar?: boolean): Field;
/**
 * Pre-configured page layout field with DEFAULT_LAYOUTS.
 * Use createPageLayoutField() for custom layouts.
 */
export declare const pageLayoutField: Field;
/**
 * Homepage flag field - marks a page as the site homepage.
 */
export declare const isHomepageField: Field;
/**
 * SEO/Meta field group with all metadata fields.
 * Uses the official @payloadcms/plugin-seo convention: meta.title, meta.description
 *
 * Includes: title, description, image, noindex, nofollow, excludeFromSitemap
 */
export declare const seoFieldGroup: Field;
/**
 * Default conversion type options
 */
export declare const DEFAULT_CONVERSION_TYPES: ConversionTypeOption[];
/**
 * Creates a conversion tracking field group with custom options.
 *
 * @param conversionTypes - Custom conversion type options (defaults to DEFAULT_CONVERSION_TYPES)
 * @param sidebar - Whether to position in the sidebar (default: true)
 *
 * @example
 * ```typescript
 * // Use default conversion types
 * ...getPuckFields({ includeConversion: true })
 *
 * // Use custom conversion types
 * ...getPuckFields({
 *   includeConversion: true,
 *   conversionTypeOptions: [
 *     { label: 'Registration', value: 'registration' },
 *     { label: 'Donation', value: 'donation' },
 *     { label: 'Course Start', value: 'course_start' },
 *     { label: 'Custom', value: 'custom' },
 *   ],
 * })
 * ```
 */
export declare function createConversionFieldGroup(conversionTypes?: ConversionTypeOption[], sidebar?: boolean): Field;
/**
 * Pre-configured conversion tracking field group with default options.
 * Use createConversionFieldGroup() for custom conversion types.
 */
export declare const conversionFieldGroup: Field;
/**
 * Returns an array of Puck-related field definitions for hybrid collection integration.
 *
 * Use this when you have an existing collection with legacy Payload blocks and want
 * to ADD Puck support without replacing your entire collection configuration.
 *
 * @param options - Configuration options for which fields to include
 * @returns Array of Field definitions to spread into your collection's fields array
 *
 * @example
 * ```typescript
 * import { getPuckFields } from '@delmaredigital/payload-puck'
 *
 * export const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // Your existing fields
 *     { name: 'title', type: 'text', required: true },
 *     { name: 'slug', type: 'text', required: true },
 *
 *     // Legacy Payload blocks (keep these!)
 *     { name: 'layout', type: 'blocks', blocks: [...] },
 *
 *     // Add Puck fields for hybrid editing
 *     ...getPuckFields({
 *       includeSEO: false,       // You have your own SEO fields
 *       includeConversion: true, // Include conversion tracking
 *       includeEditorVersion: true,
 *     }),
 *   ],
 * }
 * ```
 */
export declare function getPuckFields(options?: GetPuckFieldsOptions): Field[];
export type { GetPuckFieldsOptions, ConversionTypeOption } from './types';
//# sourceMappingURL=index.d.ts.map