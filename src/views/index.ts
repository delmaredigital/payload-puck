/**
 * Views module - Payload admin view components
 */

// Server component (RSC)
export { PuckEditorView } from './PuckEditorView.js'
export type { PuckEditorViewProps } from './PuckEditorView.js'

// Client components
export { PuckEditorClient } from './PuckEditorClient.js'
export type { PuckEditorClientProps } from './PuckEditorClient.js'

// Context
export { PuckConfigProvider, usePuckConfig } from './PuckConfigContext.js'
export type { PuckConfigProviderProps, PuckConfigContextValue } from './PuckConfigContext.js'
