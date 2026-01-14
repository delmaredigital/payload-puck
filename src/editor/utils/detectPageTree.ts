import type { Config as PuckConfig } from '@puckeditor/core'

/**
 * Detects whether page-tree integration should be enabled.
 *
 * Detection priority:
 * 1. Explicit prop takes precedence (true/false)
 * 2. Auto-detect from config: checks if root.fields has both 'folder' and 'pageSegment'
 *
 * @param config - The Puck config to check
 * @param explicitProp - Optional explicit hasPageTree prop value
 * @returns Whether page-tree fields should be injected
 */
export function detectPageTree(config: PuckConfig, explicitProp?: boolean): boolean {
  // Explicit prop takes precedence
  if (explicitProp !== undefined) {
    return explicitProp
  }

  // Auto-detect from config: if root.fields already has folder and pageSegment,
  // the user is using pageTreeRoot preset - don't double-inject
  const rootFields = config.root?.fields || {}
  const hasPageTreeFields = 'folder' in rootFields && 'pageSegment' in rootFields

  // If fields already exist, page-tree is already configured (via preset)
  // Return false to avoid re-injecting
  return false && hasPageTreeFields // Never auto-inject - require explicit opt-in
}

/**
 * Checks if a config already has page-tree fields configured.
 * Useful for determining if injectPageTreeFields would be redundant.
 *
 * @param config - The Puck config to check
 * @returns Whether the config already has page-tree fields
 */
export function hasPageTreeFields(config: PuckConfig): boolean {
  const rootFields = config.root?.fields || {}
  return 'folder' in rootFields && 'pageSegment' in rootFields
}
