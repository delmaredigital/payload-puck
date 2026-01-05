'use client'

/**
 * MarginField - Custom Puck field for component margin/spacing control
 *
 * Similar to PaddingField but specifically for outer margin.
 * Provides:
 * - 4 number inputs for top/right/bottom/left
 * - Link/unlink toggle button (when linked, all values sync)
 * - Unit selector (px, rem)
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { IconLink, IconLinkOff } from '@tabler/icons-react'
import type { PaddingValue } from './shared'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

// Re-use PaddingValue type for margin (same structure)
export type MarginValue = PaddingValue

// =============================================================================
// Types
// =============================================================================

type SpacingUnit = 'px' | 'rem' | 'em' | '%'

interface MarginFieldProps {
  value: MarginValue | null
  onChange: (value: MarginValue | null) => void
  label?: string
  readOnly?: boolean
  showUnits?: boolean
}

// =============================================================================
// Default Value
// =============================================================================

const DEFAULT_VALUE: MarginValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
}

// =============================================================================
// MarginField Component
// =============================================================================

function MarginFieldInner({
  value,
  onChange,
  label,
  readOnly,
  showUnits = true,
}: MarginFieldProps) {
  // Use default if no value
  const currentValue = value || DEFAULT_VALUE

  // Use explicit linked state from value, default to true if not set
  const isLinked = currentValue.linked ?? true

  // Handle individual side change
  const handleSideChange = useCallback((
    side: 'top' | 'right' | 'bottom' | 'left',
    newValue: number
  ) => {
    if (isLinked) {
      // When linked, update all sides
      onChange({
        ...currentValue,
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
        linked: true,
      })
    } else {
      // When unlinked, update only the specific side
      onChange({
        ...currentValue,
        [side]: newValue,
        linked: false,
      })
    }
  }, [currentValue, onChange, isLinked])

  // Handle link toggle
  const handleLinkToggle = useCallback(() => {
    if (isLinked) {
      // Unlinking - keep current values but mark as unlinked
      onChange({
        ...currentValue,
        linked: false,
      })
    } else {
      // Linking - set all sides to the top value and mark as linked
      onChange({
        ...currentValue,
        top: currentValue.top,
        right: currentValue.top,
        bottom: currentValue.top,
        left: currentValue.top,
        linked: true,
      })
    }
  }, [currentValue, onChange, isLinked])

  // Handle unit change
  const handleUnitChange = useCallback((unit: SpacingUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  // Render a single side input - compact horizontal layout
  const renderSideInput = (
    side: 'top' | 'right' | 'bottom' | 'left',
    sideLabel: string
  ) => (
    <div className="flex items-center gap-2">
      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide w-6 text-right flex-shrink-0">
        {sideLabel.charAt(0)}
      </Label>
      <Input
        type="number"
        min={0}
        value={currentValue[side]}
        onChange={(e) => handleSideChange(side, parseInt(e.target.value, 10) || 0)}
        disabled={readOnly}
        className="h-7 text-center text-sm font-mono w-full px-1 py-0"
      />
    </div>
  )

  return (
    <div className="puck-field flex flex-col gap-3">
      {/* Header with label and link toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <Label className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}
        {/* Link/Unlink toggle button */}
        {!readOnly && (
          <Button
            type="button"
            variant={isLinked ? 'default' : 'outline'}
            size="icon"
            onClick={handleLinkToggle}
            className={cn(
              "h-7 w-7",
              isLinked ? "" : "text-muted-foreground"
            )}
            title={isLinked ? 'Click to unlink (set sides individually)' : 'Click to link (all sides same value)'}
          >
            {isLinked ? (
              <IconLink className="h-4 w-4" />
            ) : (
              <IconLinkOff className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Compact 2x2 grid layout */}
      <div className="bg-muted/50 rounded-md grid grid-cols-2 gap-2 p-2">
        {renderSideInput('top', 'Top')}
        {renderSideInput('right', 'Right')}
        {renderSideInput('bottom', 'Bottom')}
        {renderSideInput('left', 'Left')}
      </div>

      {/* Unit selector and summary */}
      {showUnits && !readOnly && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Unit:</Label>
            <div className="flex gap-1">
              {(['px', 'rem'] as SpacingUnit[]).map((unit) => {
                const isActive = currentValue.unit === unit
                return (
                  <Button
                    key={unit}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUnitChange(unit)}
                    className={cn(
                      "text-xs font-mono h-7 px-2.5",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {unit}
                  </Button>
                )
              })}
            </div>
          </div>
          {/* Current value summary */}
          <span className="text-xs text-muted-foreground font-mono">
            {isLinked
              ? `${currentValue.top}${currentValue.unit}`
              : `${currentValue.top} ${currentValue.right} ${currentValue.bottom} ${currentValue.left}${currentValue.unit}`
            }
          </span>
        </div>
      )}
    </div>
  )
}

export const MarginField = memo(MarginFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for margin/spacing
 */
export function createMarginField(config: {
  label?: string
  showUnits?: boolean
}): CustomField<MarginValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <MarginField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showUnits={config.showUnits}
      />
    ),
  }
}
