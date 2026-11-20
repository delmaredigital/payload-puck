/**
 * Puck Data Validation Utilities
 *
 * Provides validation functions for ensuring Puck data structures are well-formed.
 */

import type { ComponentData, Config } from '@puckeditor/core'
import type { PuckPageData, PuckRootProps } from '../types/index.js'
import { isRecord, slotsInBlock } from './slots.js'

// =============================================================================
// Validation Result Types
// =============================================================================

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Options for validation
 */
export interface ValidationOptions {
  /**
   * Whether to validate that all content items have IDs
   * @default true
   */
  requireContentIds?: boolean

  /**
   * Whether to validate root props
   * @default true
   */
  validateRoot?: boolean

  /**
   * Required root prop fields
   * @default ['title']
   */
  requiredRootProps?: string[]

  /**
   * Allowed component types (if specified, unknown types will be flagged)
   */
  allowedComponentTypes?: string[]

  /**
   * Whether to treat unknown component types as errors (vs warnings)
   * @default false
   */
  strictComponentTypes?: boolean

  /**
   * The Puck config, when available. Nested blocks are then found exactly,
   * from each block type's slot fields; without it they are found by shape
   * (arrays of items with a string `type` and a `props` object).
   */
  config?: Config
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * A nested block, told apart from other values by shape: a string `type` AND
 * a `props` object. A `type` alone isn't enough: link lists
 * (`{ type: 'internal', href }`) and rich-text node trees
 * (`{ type: 'paragraph', children }`) have one too.
 */
function looksLikeBlock(value: unknown): boolean {
  return isRecord(value) && typeof value.type === 'string' && isRecord(value.props)
}

/**
 * Whether an array holds blocks, by shape: every item has a string `type` and
 * at least one is block-shaped. So a broken block among real ones is still
 * checked (and reported), while lists of typed values with no `props` at all
 * (links, rich-text nodes) are left alone.
 */
function isBlockList(value: unknown[]): boolean {
  return value.length > 0 &&
    value.every((item) => isRecord(item) && typeof item.type === 'string') &&
    value.some(looksLikeBlock)
}

/**
 * Where a block's nested blocks are: from the config's slot fields when the
 * config knows the type (exact), else every array of block-shaped items
 * found in its props (by shape).
 */
function nestedBlockLists(
  block: Record<string, unknown>,
  config: Config | undefined,
): { path: string; value: unknown }[] {
  const props = block.props as Record<string, unknown>
  if (config) {
    // With a config nothing is guessed: a type it doesn't know has no slots
    // (and validatePuckData reports the type as unknown)
    if (typeof block.type !== 'string' || !config.components[block.type]) return []
    return slotsInBlock(block as unknown as ComponentData, config).map((slot) => ({ path: slot.path, value: slot.value }))
  }
  const lists: { path: string; value: unknown }[] = []
  const find = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      if (isBlockList(value)) lists.push({ path, value })
      else value.forEach((item, index) => find(item, `${path}[${index}]`))
    } else if (isRecord(value)) {
      for (const [key, item] of Object.entries(value)) find(item, path ? `${path}.${key}` : key)
    }
  }
  find(props, '')
  return lists
}

/** A block with a type and props, whose nested blocks are too. */
function isWellFormedBlock(item: unknown, config?: Config): boolean {
  if (!isRecord(item) || typeof item.type !== 'string' || !isRecord(item.props)) return false
  return nestedBlockLists(item, config).every(({ value }) =>
    value === undefined || (Array.isArray(value) && value.every((child) => isWellFormedBlock(child, config))))
}

/**
 * Type guard to check if a value is a valid PuckPageData structure.
 * Performs basic structural validation.
 */
export function isPuckData(data: unknown, config?: Config): data is PuckPageData {
  if (!data || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, unknown>

  // Check root structure
  if (!obj.root || typeof obj.root !== 'object') {
    return false
  }

  const root = obj.root as Record<string, unknown>
  if (!root.props || typeof root.props !== 'object') {
    return false
  }

  // Check content array
  if (!Array.isArray(obj.content)) {
    return false
  }

  // Every block, including those nested in slots at any depth, has a type and props
  if (!obj.content.every((item) => isWellFormedBlock(item, config))) {
    return false
  }

  // Check zones (optional but must be object if present)
  if (obj.zones !== undefined && typeof obj.zones !== 'object') {
    return false
  }

  return true
}

/**
 * Type guard for PuckRootProps
 */
export function isPuckRootProps(props: unknown): props is PuckRootProps {
  if (!props || typeof props !== 'object') {
    return false
  }
  return true
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates that a PuckPageData structure is well-formed.
 * Useful for testing and debugging migration issues.
 *
 * @param data - The data to validate
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const result = validatePuckData(puckData)
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors)
 * }
 * ```
 */
export function validatePuckData(
  data: unknown,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    requireContentIds = true,
    validateRoot = true,
    requiredRootProps = ['title'],
    allowedComponentTypes,
    strictComponentTypes = false,
    config,
  } = options

  const errors: string[] = []
  const warnings: string[] = []

  // Basic type check
  if (!data || typeof data !== 'object') {
    errors.push('Data must be a non-null object')
    return { valid: false, errors, warnings }
  }

  const obj = data as Record<string, unknown>

  // ==========================================================================
  // Validate root structure
  // ==========================================================================

  if (!obj.root || typeof obj.root !== 'object') {
    errors.push('Missing or invalid root object')
  } else if (validateRoot) {
    const root = obj.root as Record<string, unknown>

    if (!root.props || typeof root.props !== 'object') {
      errors.push('Missing root.props object')
    } else {
      const rootProps = root.props as Record<string, unknown>

      // Check required root props
      for (const prop of requiredRootProps) {
        if (rootProps[prop] === undefined || rootProps[prop] === null) {
          errors.push(`Missing required root prop: ${prop}`)
        }
      }

      // Validate pageLayout if present
      if (rootProps.pageLayout !== undefined) {
        if (typeof rootProps.pageLayout !== 'string') {
          errors.push('root.props.pageLayout must be a string')
        }
      }
    }
  }

  // ==========================================================================
  // Validate blocks: top-level content, legacy zones, and every block nested
  // in a slot at any depth (inside array and object props too)
  // ==========================================================================

  const seenIds = new Set<string>()

  const checkBlock = (item: unknown, where: string) => {
    if (!item || typeof item !== 'object') {
      errors.push(`${where} is not an object`)
      return
    }
    const block = item as Record<string, unknown>

    if (!block.type || typeof block.type !== 'string') {
      errors.push(`${where} missing or invalid type`)
    } else if (config && !config.components[block.type]) {
      errors.push(`Unknown component type "${block.type}" at ${where}`)
    } else if (allowedComponentTypes && !allowedComponentTypes.includes(block.type)) {
      const message = `Unknown component type "${block.type}" at ${where}`
      if (strictComponentTypes) errors.push(message)
      else warnings.push(message)
    }

    if (!block.props || typeof block.props !== 'object' || Array.isArray(block.props)) {
      errors.push(`${where} missing props object`)
      return
    }
    const props = block.props as Record<string, unknown>

    if (requireContentIds) {
      if (!props.id || typeof props.id !== 'string') {
        errors.push(`${where} missing or invalid props.id`)
      } else if (seenIds.has(props.id)) {
        warnings.push(`Duplicate content item ID "${props.id}" at ${where}`)
      } else {
        seenIds.add(props.id)
      }
    }

    for (const { path, value } of nestedBlockLists(block, config)) {
      if (value === undefined) continue
      if (!Array.isArray(value)) {
        errors.push(`${where}.props.${path} must be an array of blocks`)
        continue
      }
      value.forEach((item, index) => checkBlock(item, `${where}.props.${path}[${index}]`))
    }
  }

  if (!Array.isArray(obj.content)) {
    errors.push('content must be an array')
  } else {
    obj.content.forEach((item, index) => checkBlock(item, `content[${index}]`))
  }

  if (obj.zones !== undefined) {
    if (typeof obj.zones !== 'object' || obj.zones === null) {
      errors.push('zones must be an object')
    } else {
      for (const [zoneName, zoneContent] of Object.entries(obj.zones as Record<string, unknown>)) {
        if (!Array.isArray(zoneContent)) {
          errors.push(`Zone "${zoneName}" content must be an array`)
          continue
        }
        zoneContent.forEach((item, index) => checkBlock(item, `zones["${zoneName}"][${index}]`))
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates and returns typed PuckPageData, throwing if invalid.
 *
 * @param data - The data to validate
 * @param options - Validation options
 * @returns The validated PuckPageData
 * @throws Error if validation fails
 */
export function assertPuckData(
  data: unknown,
  options?: ValidationOptions
): PuckPageData {
  const result = validatePuckData(data, options)

  if (!result.valid) {
    throw new Error(
      `Invalid Puck data: ${result.errors.join('; ')}`
    )
  }

  return data as PuckPageData
}

/**
 * Safely parses JSON and validates as PuckPageData.
 *
 * @param json - JSON string to parse
 * @param options - Validation options
 * @returns Validation result with parsed data if valid
 */
export function parsePuckDataJson(
  json: string,
  options?: ValidationOptions
): ValidationResult & { data?: PuckPageData } {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch (e) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`],
      warnings: [],
    }
  }

  const result = validatePuckData(parsed, options)

  if (result.valid) {
    return {
      ...result,
      data: parsed as PuckPageData,
    }
  }

  return result
}
