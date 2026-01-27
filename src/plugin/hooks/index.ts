/**
 * Puck Plugin Hooks
 *
 * Reusable Payload hooks for Puck-enabled collections.
 */

export {
  createIsHomepageUniqueHook,
  unsetHomepage,
  HomepageConflictError,
  type IsHomepageUniqueHookOptions,
  type ExistingHomepageInfo,
} from './isHomepageUnique.js'
