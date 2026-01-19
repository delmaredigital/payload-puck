/**
 * Client component exports for Payload admin and custom UIs
 *
 * These components require 'use client' and can use React hooks.
 * Import via: '@delmaredigital/payload-puck/client'
 *
 * @example
 * ```tsx
 * import { PuckEditor, PuckConfigProvider } from '@delmaredigital/payload-puck/client'
 * ```
 */
export { PuckEditor } from '../editor/PuckEditor.js';
export type { PuckEditorProps } from '../editor/PuckEditor.js';
export { PuckConfigProvider, usePuckConfig } from '../views/PuckConfigContext.js';
export type { PuckConfigProviderProps, PuckConfigContextValue } from '../views/PuckConfigContext.js';
export { EditWithPuckButton, EditWithPuckLink } from '../admin/EditWithPuckButton.js';
export type { EditWithPuckButtonProps } from '../admin/EditWithPuckButton.js';
export { injectPageTreeFields } from '../editor/utils/injectPageTreeFields.js';
export { detectPageTree, hasPageTreeFields } from '../editor/utils/detectPageTree.js';
//# sourceMappingURL=client.d.ts.map