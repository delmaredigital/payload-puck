'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDocumentInfo, useConfig } from '@payloadcms/ui';
/**
 * Pencil/Edit icon component
 */
function PuckIcon({ size = 18 }) {
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), _jsx("path", { d: "M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" })] }));
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
export const EditWithPuckButton = (props) => {
    // Get document and config context from Payload
    const { id, collectionSlug } = useDocumentInfo();
    const { config } = useConfig();
    // Extract custom props passed via field config
    const customProps = props?.field?.custom;
    const label = customProps?.label || 'Visual Editor';
    const iconOnly = customProps?.iconOnly || false;
    const collection = customProps?.collectionSlug || collectionSlug || 'pages';
    // Get admin route from config
    const adminRoute = config.routes?.admin || '/admin';
    // Build editor URL - defaults to admin view
    let editorPath;
    if (customProps?.editorPathPattern) {
        // Custom pattern provided (for backwards compatibility)
        editorPath = customProps.editorPathPattern
            .replace('{id}', String(id))
            .replace('{collection}', collection);
    }
    else {
        // Default: use admin view
        editorPath = `${adminRoute}/puck-editor/${collection}/${id}`;
    }
    if (!id) {
        return null;
    }
    return (_jsx("div", { style: { marginBottom: '1rem' }, children: _jsxs("a", { href: editorPath, style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: iconOnly ? '8px' : '10px 16px',
                backgroundColor: 'var(--theme-success-500, #22c55e)',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s, opacity 0.15s',
            }, onMouseEnter: (e) => {
                e.currentTarget.style.opacity = '0.9';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.opacity = '1';
            }, title: iconOnly ? label : undefined, children: [_jsx(PuckIcon, { size: iconOnly ? 20 : 18 }), !iconOnly && label] }) }));
};
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
export function EditWithPuckLink({ id, collectionSlug = 'pages', editorPathPattern, label = 'Visual Editor', iconOnly = false, }) {
    // Build path - prefer admin view by default
    const path = editorPathPattern
        ? editorPathPattern.replace('{id}', id).replace('{collection}', collectionSlug)
        : `/admin/puck-editor/${collectionSlug}/${id}`;
    return (_jsxs("a", { href: path, style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: iconOnly ? '8px' : '10px 16px',
            backgroundColor: 'var(--theme-success-500, #22c55e)',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'opacity 0.15s',
        }, onMouseEnter: (e) => {
            e.currentTarget.style.opacity = '0.9';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.opacity = '1';
        }, title: iconOnly ? label : undefined, children: [_jsx(PuckIcon, { size: iconOnly ? 20 : 18 }), !iconOnly && label] }));
}
export default EditWithPuckButton;
//# sourceMappingURL=EditWithPuckButton.js.map