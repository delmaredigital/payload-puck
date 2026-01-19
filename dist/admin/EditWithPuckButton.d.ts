import type { UIFieldClientComponent } from 'payload';
/**
 * Props for EditWithPuckButton when used standalone
 */
export interface EditWithPuckButtonProps {
    /**
     * Document ID to edit
     */
    id?: string;
    /**
     * Collection slug
     * @default 'pages'
     */
    collectionSlug?: string;
    /**
     * Custom path pattern for the Puck editor
     * Use {id} as placeholder for the document ID, {collection} for collection slug
     * @default Uses admin view: '/admin/puck-editor/{collection}/{id}'
     */
    editorPathPattern?: string;
    /**
     * Button label
     * @default 'Visual Editor'
     */
    label?: string;
    /**
     * Whether to show as icon only
     * @default false
     */
    iconOnly?: boolean;
}
/**
 * Edit with Puck button for use in Payload admin document edit views
 *
 * Links to the Puck editor admin view. The editor is integrated directly
 * into Payload's admin UI.
 *
 * @example
 * ```tsx
 * // In your Payload collection config:
 * {
 *   name: 'puckEdit',
 *   type: 'ui',
 *   admin: {
 *     position: 'sidebar',
 *     components: {
 *       Field: '@delmaredigital/payload-puck/admin/client#EditWithPuckButton',
 *     },
 *     custom: {
 *       label: 'Visual Editor',
 *     },
 *   },
 * }
 * ```
 */
export declare const EditWithPuckButton: UIFieldClientComponent;
/**
 * Standalone version of the button that doesn't rely on Payload context
 *
 * @example
 * ```tsx
 * <EditWithPuckLink
 *   id="123"
 *   collectionSlug="pages"
 *   adminRoute="/admin"
 * />
 * ```
 */
export declare function EditWithPuckLink({ id, collectionSlug, editorPathPattern, label, iconOnly, }: EditWithPuckButtonProps & {
    id: string;
    adminRoute?: string;
}): import("react/jsx-runtime").JSX.Element;
export default EditWithPuckButton;
//# sourceMappingURL=EditWithPuckButton.d.ts.map