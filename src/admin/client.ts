'use client'

/**
 * @delmaredigital/payload-puck/admin/client
 *
 * Client-side admin components for Payload CMS integration.
 * These are the Field/Cell components used by the plugin.
 *
 * NOTE: For PuckEditorView, import from '@delmaredigital/payload-puck/editor' instead.
 * This separation is necessary to avoid RSC bundling issues with Puck.
 */

// Button components for edit view
export {
  EditWithPuckButton,
  EditWithPuckLink,
  type EditWithPuckButtonProps,
} from './EditWithPuckButton.js'

// Cell component for list view
export { EditWithPuckCell, type EditWithPuckCellConfig } from './EditWithPuckCell.js'
