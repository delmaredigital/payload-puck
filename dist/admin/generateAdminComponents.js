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
export function generatePuckEditField(config = {}) {
    const { collectionSlug = 'pages', editorPathPattern = '/pages/{id}/edit', buttonLabel = 'Visual Editor', buttonPosition = 'sidebar', } = config;
    return {
        name: 'puckEdit',
        type: 'ui',
        admin: {
            position: buttonPosition,
            components: {
                Field: '@delmaredigital/payload-puck/admin/client#EditWithPuckButton',
                Cell: '@delmaredigital/payload-puck/admin/client#EditWithPuckCell',
            },
            custom: {
                collectionSlug,
                editorPathPattern,
                label: buttonLabel,
            },
        },
    };
}
//# sourceMappingURL=generateAdminComponents.js.map