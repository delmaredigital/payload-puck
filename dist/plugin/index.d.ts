import type { Field, Plugin } from 'payload';
import type { PuckPluginOptions, PuckAdminConfig } from '../types';
/**
 * Generates the UI field configuration for the Edit with Puck button
 */
declare function generatePuckEditField(collectionSlug: string, adminConfig?: PuckAdminConfig): Field;
/**
 * Creates a Payload plugin that integrates Puck visual page builder
 *
 * This plugin:
 * - Generates a Pages collection with puckData field
 * - Registers the Puck editor as an admin view at /admin/puck-editor/:collection/:id
 * - Adds an "Edit with Puck" button in the admin document view
 * - Optionally registers API endpoints for CRUD operations
 *
 * The Puck editor is fully integrated into Payload's admin UI.
 *
 * @example
 * ```typescript
 * import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'
 *
 * export default buildConfig({
 *   plugins: [
 *     createPuckPlugin({
 *       pagesCollection: 'pages',
 *       access: {
 *         read: () => true,
 *         create: ({ req }) => !!req.user,
 *         update: ({ req }) => !!req.user,
 *         delete: ({ req }) => req.user?.role === 'admin',
 *       },
 *       admin: {
 *         buttonLabel: 'Visual Editor',
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export declare function createPuckPlugin(options?: PuckPluginOptions): Plugin;
export { generatePagesCollection } from './collections/Pages';
export { TemplatesCollection } from '../collections/Templates';
export { getPuckFields, puckDataField, editorVersionField, createEditorVersionField, pageLayoutField, createPageLayoutField, isHomepageField, seoFieldGroup, conversionFieldGroup, } from './fields';
export { generatePuckEditField };
export { PUCK_STYLES_ENDPOINT } from '../endpoints/styles.js';
export type { PuckPluginOptions, PuckAdminConfig } from '../types';
export type { GetPuckFieldsOptions } from './fields/types';
//# sourceMappingURL=index.d.ts.map