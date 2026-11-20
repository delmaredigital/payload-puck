'use client'

/**
 * ResetField - Custom Puck field for resetting component to defaults
 *
 * This field renders a reset button that clears all customizations
 * and restores the component to its default state.
 *
 * Uses Puck's usePuck hook and dispatch to properly update component data.
 */

import React, { memo, useCallback, type CSSProperties } from 'react'
import type { CustomField } from '@puckeditor/core'
import { createUsePuck } from '@puckeditor/core'
import { RefreshCw } from 'lucide-react'
import { VISIBILITY_PROP } from '../visibility/core.js'

// Create usePuck hook for accessing editor state
const usePuck = createUsePuck()

// =============================================================================
// Types
// =============================================================================

interface ResetFieldProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

// =============================================================================
// Styles
// =============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
}

// =============================================================================
// ResetField Component
// =============================================================================

function ResetFieldInner({
  onClick,
  label = 'Reset to defaults',
  disabled,
}: ResetFieldProps) {
  return (
    <div className="puck-field" style={styles.container}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          ...styles.button,
          ...(disabled ? styles.buttonDisabled : {}),
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.color = 'var(--theme-error-500)'
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = 'var(--theme-elevation-500)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <RefreshCw style={{ width: '14px', height: '14px' }} />
        {label}
      </button>
    </div>
  )
}

export const ResetField = memo(ResetFieldInner)

// =============================================================================
// Helper Functions
// =============================================================================

type FieldLike = { type?: string; arrayFields?: Record<string, FieldLike>; objectFields?: Record<string, FieldLike> }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

/** Whether a field is a slot, or holds one at any depth. */
function holdsSlot(field: FieldLike | undefined): boolean {
  if (!field) return false
  if (field.type === 'slot') return true
  if (field.type === 'array') return Object.values(field.arrayFields ?? {}).some(holdsSlot)
  if (field.type === 'object') return Object.values(field.objectFields ?? {}).some(holdsSlot)
  return false
}

/**
 * Puts the block's current content back into reset props: a slot keeps its
 * blocks; an array field holding slots keeps its items (resetting them would
 * drop what's inside); an object field holding slots resets its other
 * settings and keeps its slots.
 */
function keepContent(
  next: Record<string, unknown>,
  current: Record<string, unknown>,
  fields: Record<string, FieldLike | undefined>,
): Record<string, unknown> {
  const out = { ...next }
  for (const [name, field] of Object.entries(fields)) {
    if (!holdsSlot(field) || !(name in current)) continue
    if (field!.type === 'object' && isRecord(current[name])) {
      out[name] = keepContent(isRecord(next[name]) ? next[name] : {}, current[name], field!.objectFields ?? {})
    } else {
      out[name] = current[name]
    }
  }
  return out
}

/**
 * Props a reset leaves the block with: its defaults, keeping whether it is
 * shown or hidden (that is not a style choice the reset should undo) and
 * everything inside its slots, at any depth (`fields` says where they are).
 *
 * Slots come from the block type's config fields, as Puck reads them: Puck
 * 0.24 doesn't treat a slot added only by `resolveFields` as a slot (it isn't
 * rendered or indexed as one), so Reset resets that prop like any other.
 */
export function resetProps(
  defaultProps: Record<string, unknown>,
  currentProps: Record<string, unknown>,
  fields: Record<string, FieldLike | undefined> = {},
): Record<string, unknown> {
  const { [VISIBILITY_PROP]: _ignored, ...defaults } = defaultProps
  const reset = keepContent(defaults, currentProps, fields)
  if (VISIBILITY_PROP in currentProps) reset[VISIBILITY_PROP] = currentProps[VISIBILITY_PROP]
  return reset
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateResetFieldConfig<T> {
  label?: string
  defaultProps: T
}

/**
 * Creates a Puck field configuration for a reset button
 */
export function createResetField<T extends object>(
  { label, defaultProps }: CreateResetFieldConfig<T>
): CustomField<unknown> {
  const ResetFieldWrapper = ({ readOnly }: { readOnly?: boolean }) => {
    const dispatch = usePuck((s) => s.dispatch)
    const getSelectorForId = usePuck((s) => s.getSelectorForId)
    const selectedItem = usePuck((s) => s.selectedItem)
    const config = usePuck((s) => s.config)

    // Replaces just this block, wherever it is (top level or inside a slot),
    // as one undo step
    const handleReset = useCallback(() => {
      const componentId = selectedItem?.props?.id as string | undefined
      const selector = componentId ? getSelectorForId(componentId) : undefined
      if (!selectedItem || !componentId || !selector) {
        console.warn('ResetField: No selected item found')
        return
      }

      dispatch({
        type: 'replace',
        destinationIndex: selector.index,
        destinationZone: selector.zone!,
        data: {
          type: selectedItem.type,
          props: {
            ...resetProps(
              defaultProps as unknown as Record<string, unknown>,
              selectedItem.props,
              (config.components[selectedItem.type]?.fields ?? {}) as Record<string, FieldLike | undefined>,
            ),
            id: componentId,
          },
        },
      })
    }, [config, dispatch, getSelectorForId, selectedItem])

    return (
      <ResetField
        onClick={handleReset}
        label={label}
        disabled={readOnly}
      />
    )
  }

  return {
    type: 'custom',
    render: ({ readOnly }) => <ResetFieldWrapper readOnly={readOnly} />,
  }
}
