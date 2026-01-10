'use client'

/**
 * Client component exports for Payload admin
 *
 * These components require 'use client' and can use React hooks.
 * Import via: '@delmaredigital/payload-puck/client#ComponentName'
 *
 * @example
 * ```tsx
 * import { PuckConfigProvider, usePuckConfig } from '@delmaredigital/payload-puck/client'
 * ```
 */

// Views
export { PuckEditorClient } from '../views/PuckEditorClient.js'

// Context
export { PuckConfigProvider, usePuckConfig } from '../views/PuckConfigContext.js'
export type { PuckConfigProviderProps, PuckConfigContextValue } from '../views/PuckConfigContext.js'

// Admin components
export { EditWithPuckButton, EditWithPuckLink } from '../admin/EditWithPuckButton.js'
export type { EditWithPuckButtonProps } from '../admin/EditWithPuckButton.js'

// Re-export editor components that might be useful
export { PuckEditorCore } from '../editor/PuckEditorCore.client.js'
export type { PuckEditorCoreProps } from '../editor/PuckEditorCore.client.js'
