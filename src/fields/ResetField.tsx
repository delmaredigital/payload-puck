'use client'

/**
 * ResetField - Custom Puck field for resetting component to defaults
 *
 * This field renders a reset button that clears all customizations
 * and restores the component to its default state.
 *
 * Uses Puck's usePuck hook and dispatch to properly update component data.
 */

import React, { memo, useCallback } from 'react'
import type { CustomField } from '@measured/puck'
import { createUsePuck } from '@measured/puck'
import type { Data } from '@measured/puck'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '../components/ui/button'

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
// ResetField Component
// =============================================================================

function ResetFieldInner({
  onClick,
  label = 'Reset to defaults',
  disabled,
}: ResetFieldProps) {
  return (
    <div className="puck-field">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
      >
        <IconRefresh className="h-3.5 w-3.5" />
        {label}
      </Button>
    </div>
  )
}

export const ResetField = memo(ResetFieldInner)

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Recursively update a component's props in Puck data structure
 * Handles both root content and nested zones/slots
 */
function updateComponentInData(
  data: Data,
  componentId: string,
  newProps: Record<string, unknown>
): Data {
  // Helper to update a single item
  const updateItem = (item: { type: string; props: Record<string, unknown> }) => {
    if (item.props?.id === componentId) {
      return {
        ...item,
        props: {
          ...newProps,
          id: componentId, // Always preserve the ID
        },
      }
    }
    return item
  }

  // Update root content array
  const updatedContent = data.content.map(updateItem)

  // Update zones (for nested components in slots)
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
  /** Label for the reset button */
  label?: string
  /** Default props to reset to */
  defaultProps: T
}

/**
 * Creates a Puck field configuration for a reset button
 *
 * Place this as the first field in a component to add a reset button
 * at the top of the property panel.
 *
 * @example
 * ```ts
 * const defaultProps = { text: 'Click Me', variant: 'default' }
 *
 * const ButtonConfig: ComponentConfig = {
 *   fields: {
 *     _reset: createResetField({ defaultProps }),
 *     text: { type: 'text', label: 'Button Text' },
 *     // ... other fields
 *   },
 *   defaultProps,
 * }
 * ```
 */
export function createResetField<T extends object>(
  config: CreateResetFieldConfig<T>
): CustomField<unknown> {
  // We need to create a wrapper component to use the usePuck hook
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

      // Update the component's props in the data
      const updatedData = updateComponentInData(
        appState.data,
        componentId,
        config.defaultProps as unknown as Record<string, unknown>
      )

      // Dispatch the data update
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
