import type { RootPropsMapping } from '../types';
/**
 * Default mappings from Puck root.props to Payload fields
 *
 * These mappings sync common page properties from Puck's visual editor
 * to the corresponding Payload collection fields.
 *
 * SEO fields use the official @payloadcms/plugin-seo convention: meta.title, meta.description
 */
export declare const DEFAULT_ROOT_PROPS_MAPPINGS: RootPropsMapping[];
/**
 * Set a nested value in an object using dot notation path
 *
 * @example
 * ```typescript
 * const obj = {}
 * setNestedValue(obj, 'meta.title', 'My Title')
 * // Result: { meta: { title: 'My Title' } }
 * ```
 */
export declare function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void;
/**
 * Get a nested value from an object using dot notation path
 *
 * @example
 * ```typescript
 * const obj = { meta: { title: 'My Title' } }
 * getNestedValue(obj, 'meta.title') // 'My Title'
 * ```
 */
export declare function getNestedValue(obj: Record<string, unknown>, path: string): unknown;
/**
 * Merge mappings, with custom mappings taking precedence over defaults
 *
 * @param customMappings - Custom mappings to merge with defaults
 * @returns Merged array of mappings with duplicates resolved (custom wins)
 */
export declare function mergeMappings(customMappings?: RootPropsMapping[]): RootPropsMapping[];
/**
 * Map Puck root.props to Payload field update data
 *
 * Takes the root.props from Puck data and maps them to the appropriate
 * Payload fields based on the provided mappings.
 *
 * @param rootProps - The root.props object from Puck data
 * @param customMappings - Optional custom mappings to merge with defaults
 * @returns Object ready to be spread into Payload update data
 *
 * @example
 * ```typescript
 * const rootProps = {
 *   title: 'My Page',
 *   metaTitle: 'My Page | Site Name',
 *   metaDescription: 'Description here',
 * }
 *
 * const updateData = mapRootPropsToPayloadFields(rootProps)
 * // Result: {
 * //   title: 'My Page',
 * //   meta: {
 * //     title: 'My Page | Site Name',
 * //     description: 'Description here',
 * //   },
 * // }
 * ```
 */
export declare function mapRootPropsToPayloadFields(rootProps: Record<string, unknown>, customMappings?: RootPropsMapping[]): Record<string, unknown>;
/**
 * Deep merge objects, with source values overwriting target values
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged object (target is modified in place)
 */
export declare function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown>;
/**
 * Map Payload document fields to Puck root.props format
 *
 * This is the reverse of mapRootPropsToPayloadFields. It takes a Payload
 * document and extracts the fields that should be synced to root.props
 * when loading the editor.
 *
 * @param doc - The Payload document
 * @param customMappings - Optional custom mappings to merge with defaults
 * @returns Object with root.props field names and values
 *
 * @example
 * ```typescript
 * const page = { title: 'My Page', isHomepage: true, meta: { title: 'SEO Title' } }
 * const rootProps = mapPayloadFieldsToRootProps(page)
 * // Result: { title: 'My Page', isHomepage: true, metaTitle: 'SEO Title' }
 * ```
 */
export declare function mapPayloadFieldsToRootProps(doc: Record<string, unknown>, customMappings?: RootPropsMapping[]): Record<string, unknown>;
//# sourceMappingURL=mapRootProps.d.ts.map