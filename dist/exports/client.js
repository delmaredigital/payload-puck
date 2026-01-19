'use client';
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
// Main editor component
export { PuckEditor } from '../editor/PuckEditor.js';
// Context (optional - for multi-editor apps sharing config)
export { PuckConfigProvider, usePuckConfig } from '../views/PuckConfigContext.js';
// Admin components
export { EditWithPuckButton, EditWithPuckLink } from '../admin/EditWithPuckButton.js';
// Page-tree utilities
export { injectPageTreeFields } from '../editor/utils/injectPageTreeFields.js';
export { detectPageTree, hasPageTreeFields } from '../editor/utils/detectPageTree.js';
//# sourceMappingURL=client.js.map