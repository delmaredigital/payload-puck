import type { Field } from 'payload';
/**
 * Configuration for generating the edit button field
 */
export interface AdminComponentsConfig {
    /**
     * Collection slug for the pages collection
     * @default 'pages'
     */
    collectionSlug?: string;
    /**
     * URL pattern for the Puck editor page
     * Use {id} as placeholder for document ID
     * @default '/pages/{id}/edit'
     */
    editorPathPattern?: string;
    /**
     * Button label text
     * @default 'Visual Editor'
     */
    buttonLabel?: string;
    /**
     * Position of the edit button in admin
     * @default 'sidebar'
     */
    buttonPosition?: 'sidebar' | 'main';
}
/**
 * Generates the UI field configuration for the Edit with Puck button
 *
 * Use this if you want to manually add the edit button field to your
 * collection instead of using the plugin's auto-generation.
 *
 * @example
 * ```ts
 * import { generatePuckEditField } from '@delmaredigital/payload-puck/admin'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   fields: [
 *     // ... other fields
 *     generatePuckEditField({
 *       editorPathPattern: '/pages/{id}/edit',
 *       buttonLabel: 'Visual Editor',
 *     }),
 *   ],
 * }
 * ```
 */
export declare function generatePuckEditField(config?: AdminComponentsConfig): Field;
//# sourceMappingURL=generateAdminComponents.d.ts.map