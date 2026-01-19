import type { DefaultCellComponentProps } from 'payload';
/**
 * Props for configuring the EditWithPuckCell component
 */
export interface EditWithPuckCellConfig {
    /**
     * Collection slug for building the editor URL
     * @default 'pages'
     */
    collectionSlug?: string;
    /**
     * Custom editor path pattern
     * Use {id} as placeholder for the document ID
     * @default '/admin/puck/{collectionSlug}/{id}/edit'
     */
    editorPathPattern?: string;
}
/**
 * Custom cell component that renders an "Edit with Puck" button in list views
 *
 * Add this to a UI field in your collection to show the visual editor button
 * in the list view table.
 *
 * @example
 * ```ts
 * // In your collection config:
 * {
 *   name: 'puckEdit',
 *   type: 'ui',
 *   admin: {
 *     components: {
 *       Cell: '@delmaredigital/payload-puck/admin#EditWithPuckCell',
 *     },
 *     custom: {
 *       collectionSlug: 'pages',
 *     },
 *   },
 * }
 * ```
 */
export declare const EditWithPuckCell: React.FC<DefaultCellComponentProps>;
export default EditWithPuckCell;
//# sourceMappingURL=EditWithPuckCell.d.ts.map