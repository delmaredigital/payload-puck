/**
 * PuckEditorView - React Server Component for Payload Admin
 *
 * This is the admin view that wraps the Puck editor within Payload's admin layout.
 * It fetches page data server-side and passes it to the client component.
 *
 * Registered as a custom view via config.admin.components.views
 */
import type { AdminViewProps } from 'payload';
export interface PuckEditorViewProps extends AdminViewProps {
}
/**
 * Server Component that renders the Puck editor within Payload admin
 *
 * URL pattern: /admin/puck-editor/:collection/:id
 */
export declare function PuckEditorView({ initPageResult, params, searchParams, }: PuckEditorViewProps): Promise<import("react/jsx-runtime").JSX.Element>;
export default PuckEditorView;
//# sourceMappingURL=PuckEditorView.d.ts.map