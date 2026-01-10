/**
 * RSC (React Server Component) exports for Payload admin views
 *
 * These components are server-rendered and should be imported via:
 * '@delmaredigital/payload-puck/rsc#ComponentName'
 *
 * @example
 * ```ts
 * // In plugin config:
 * config.admin.components.views = {
 *   puckEditor: {
 *     Component: '@delmaredigital/payload-puck/rsc#PuckEditorView',
 *     path: '/puck-editor/:segments*',
 *   },
 * }
 * ```
 */

export { PuckEditorView } from '../views/PuckEditorView.js'
