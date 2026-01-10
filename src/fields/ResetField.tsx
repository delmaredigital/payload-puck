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
import type { CustomField } from '@measured/puck'
import { createUsePuck } from '@measured/puck'
import type { Data } from '@measured/puck'
import { RefreshCw } from 'lucide-react'

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

/**
 * Recursively update a component's props in Puck data structure
 */
function updateComponentInData(
  data: Data,
  componentId: string,
  newProps: Record<string, unknown>
): Data {
  const updateItem = (item: { type: string; props: Record<string, unknown> }) => {
    if (item.props?.id === componentId) {
      return {
        ...item,
        props: {
          ...newProps,
          id: componentId,
        },
      }
    }
    return item
  }

  const updatedContent = data.content.map(updateItem)

  const updatedZones: Record<string, Array<{ type: string; props: Record<string, unknown> }>> = {}
  if (data.zones) {
    for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
      updatedZones[zoneName] = (zoneContent as Array<{ type: string; props: Record<string, unknown> }>).map(updateItem)
    }
  }

  return {
    ...data,
    content: updatedContent,
    zones: Object.keys(updatedZones).length > 0 ? updatedZones : data.zones,
  }
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
  config: CreateResetFieldConfig<T>
): CustomField<unknown> {
  const ResetFieldWrapper = ({ readOnly }: { readOnly?: boolean }) => {
    const appState = usePuck((s) => s.appState)
    const dispatch = usePuck((s) => s.dispatch)
    const selectedItem = usePuck((s) => s.selectedItem)

    const handleReset = useCallback(() => {
      if (!selectedItem?.props?.id) {
        console.warn('ResetField: No selected item found')
        return
      }

      const componentId = selectedItem.props.id as string

      const updatedData = updateComponentInData(
        appState.data,
        componentId,
        config.defaultProps as unknown as Record<string, unknown>
      )

      dispatch({
        type: 'setData',
        data: updatedData,
      })
    }, [appState.data, dispatch, selectedItem])

    return (
      <ResetField
        onClick={handleReset}
        label={config.label}
        disabled={readOnly}
      />
    )
  }

  return {
    type: 'custom',
    render: ({ readOnly }) => <ResetFieldWrapper readOnly={readOnly} />,
  }
}
