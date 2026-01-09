'use client'

/**
 * DimensionsField - Unified Puck field for width and height constraints
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Min/max width controls
 * - Min/max height controls
 * - Content alignment (left, center, right)
 * - Progressive disclosure (simple vs advanced mode)
 * - Preset quick-select buttons for common widths
 */

import React, { useCallback, memo, useState } from 'react'
import type { CustomField } from '@measured/puck'
import {
  X,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  MoveHorizontal,
  Square,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  DimensionsValue,
  DimensionConstraint,
  DimensionsUnit,
  DimensionsMode,
  ContentAlignment,
} from './shared'
import { getDimensionsSummary } from './shared'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { cn } from '../lib/utils'

// =============================================================================
// Types
// =============================================================================

interface DimensionsFieldProps {
  value: DimensionsValue | null
  onChange: (value: DimensionsValue | null) => void
  label?: string
  readOnly?: boolean
  /** Show height controls (default: true) */
  showHeightControls?: boolean
  /** Show min controls in advanced mode (default: true) */
  showMinControls?: boolean
  /** Start with advanced mode expanded (default: false) */
  defaultAdvancedMode?: boolean
}

// =============================================================================
// Default Values
// =============================================================================

// Default represents "unconfigured" state - full width with no constraints
const DEFAULT_VALUE: DimensionsValue = {
  mode: 'full',
  alignment: 'center',
  maxWidth: {
    value: 0,
    unit: 'px',
    enabled: false,
  },
  advancedMode: false,
}

const WIDTH_PRESETS = [
  { label: 'Narrow', value: 680 },
  { label: 'Medium', value: 960 },
  { label: 'Wide', value: 1200 },
  { label: 'XL', value: 1440 },
]

const WIDTH_UNITS: DimensionsUnit[] = ['px', 'rem', '%', 'vw']
const HEIGHT_UNITS: DimensionsUnit[] = ['px', 'rem', '%', 'vh']

// =============================================================================
// ConstraintInput Sub-component
// =============================================================================

interface ConstraintInputProps {
  label: string
  constraint: DimensionConstraint | null | undefined
  onChange: (constraint: DimensionConstraint) => void
  onToggle: (enabled: boolean) => void
  units: DimensionsUnit[]
  disabled?: boolean
  placeholder?: string
}

function ConstraintInput({
  label,
  constraint,
  onChange,
  onToggle,
  units,
  disabled,
  placeholder = '0',
}: ConstraintInputProps) {
  const isEnabled = constraint?.enabled ?? false
  const value = constraint?.value ?? 0
  const unit = constraint?.unit ?? 'px'

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10) || 0
      onChange({
        value: newValue,
        unit,
        enabled: isEnabled,
      })
    },
    [unit, isEnabled, onChange]
  )

  const handleUnitChange = useCallback(
    (newUnit: DimensionsUnit) => {
      onChange({
        value,
        unit: newUnit,
        enabled: isEnabled,
      })
    },
    [value, isEnabled, onChange]
  )

  const handleToggle = useCallback(
    (checked: boolean) => {
      onToggle(checked)
    },
    [onToggle]
  )

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 cursor-pointer min-w-[90px]">
        <Checkbox
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </label>

      <Input
        type="number"
        min={0}
        value={isEnabled ? value : ''}
        onChange={handleValueChange}
        disabled={disabled || !isEnabled}
        placeholder={placeholder}
        className="h-7 text-xs font-mono flex-1 min-w-[60px]"
      />

      <div className="flex gap-0.5 flex-shrink-0">
        {units.map((u) => (
          <Button
            key={u}
            type="button"
            variant={unit === u && isEnabled ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleUnitChange(u)}
            disabled={disabled || !isEnabled}
            className={cn(
              'text-[10px] font-mono h-7 px-2.5',
              unit === u && isEnabled && 'bg-primary hover:bg-primary/90'
            )}
          >
            {u}
          </Button>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// DimensionsField Component
// =============================================================================

function DimensionsFieldInner({
  value,
  onChange,
  label,
  readOnly,
  showHeightControls = true,
  showMinControls = true,
  defaultAdvancedMode = false,
}: DimensionsFieldProps) {
  // Use default if no value
  const currentValue = value || DEFAULT_VALUE

  // Local state for advanced mode toggle
  const [advancedMode, setAdvancedMode] = useState(
    currentValue.advancedMode ?? defaultAdvancedMode
  )

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: DimensionsMode) => {
      if (mode === 'full') {
        onChange({
          ...currentValue,
          mode,
          alignment: 'center',
        })
      } else {
        onChange({
          ...currentValue,
          mode,
        })
      }
    },
    [currentValue, onChange]
  )

  // Handle max width value change
  const handleMaxWidthChange = useCallback(
    (constraint: DimensionConstraint) => {
      onChange({
        ...currentValue,
        maxWidth: constraint,
      })
    },
    [currentValue, onChange]
  )

  // Handle max width toggle
  const handleMaxWidthToggle = useCallback(
    (enabled: boolean) => {
      onChange({
        ...currentValue,
        maxWidth: {
          ...currentValue.maxWidth,
          enabled,
        },
      })
    },
    [currentValue, onChange]
  )

  // Handle min width change
  const handleMinWidthChange = useCallback(
    (constraint: DimensionConstraint) => {
      onChange({
        ...currentValue,
        minWidth: constraint,
      })
    },
    [currentValue, onChange]
  )

  // Handle min width toggle
  const handleMinWidthToggle = useCallback(
    (enabled: boolean) => {
      onChange({
        ...currentValue,
        minWidth: enabled
          ? { value: currentValue.minWidth?.value ?? 0, unit: currentValue.minWidth?.unit ?? 'px', enabled: true }
          : { ...currentValue.minWidth!, enabled: false },
      })
    },
    [currentValue, onChange]
  )

  // Handle min height change
  const handleMinHeightChange = useCallback(
    (constraint: DimensionConstraint) => {
      onChange({
        ...currentValue,
        minHeight: constraint,
      })
    },
    [currentValue, onChange]
  )

  // Handle min height toggle
  const handleMinHeightToggle = useCallback(
    (enabled: boolean) => {
      onChange({
        ...currentValue,
        minHeight: enabled
          ? { value: currentValue.minHeight?.value ?? 0, unit: currentValue.minHeight?.unit ?? 'px', enabled: true }
          : currentValue.minHeight ? { ...currentValue.minHeight, enabled: false } : null,
      })
    },
    [currentValue, onChange]
  )

  // Handle max height change
  const handleMaxHeightChange = useCallback(
    (constraint: DimensionConstraint) => {
      onChange({
        ...currentValue,
        maxHeight: constraint,
      })
    },
    [currentValue, onChange]
  )

  // Handle max height toggle
  const handleMaxHeightToggle = useCallback(
    (enabled: boolean) => {
      onChange({
        ...currentValue,
        maxHeight: enabled
          ? { value: currentValue.maxHeight?.value ?? 0, unit: currentValue.maxHeight?.unit ?? 'px', enabled: true }
          : currentValue.maxHeight ? { ...currentValue.maxHeight, enabled: false } : null,
      })
    },
    [currentValue, onChange]
  )

  // Handle alignment change
  const handleAlignmentChange = useCallback(
    (alignment: ContentAlignment) => {
      onChange({
        ...currentValue,
        alignment,
      })
    },
    [currentValue, onChange]
  )

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (presetValue: number) => {
      onChange({
        ...currentValue,
        mode: 'contained',
        maxWidth: {
          value: presetValue,
          unit: 'px',
          enabled: true,
        },
      })
    },
    [currentValue, onChange]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Handle advanced mode toggle
  const handleAdvancedToggle = useCallback(() => {
    const newAdvancedMode = !advancedMode
    setAdvancedMode(newAdvancedMode)
    // Only persist advancedMode if there's already a value set
    // This prevents materializing defaults when user is just exploring the UI
    if (value !== null) {
      onChange({
        ...currentValue,
        advancedMode: newAdvancedMode,
      })
    }
  }, [advancedMode, currentValue, onChange, value])

  // Mode labels
  const modeConfig = [
    { mode: 'full' as DimensionsMode, icon: MoveHorizontal, label: 'Full', title: 'Full width (100%)' },
    { mode: 'contained' as DimensionsMode, icon: Square, label: 'Contain', title: 'Contained (centered with max-width)' },
    { mode: 'custom' as DimensionsMode, icon: SlidersHorizontal, label: 'Custom', title: 'Custom width settings' },
  ]

  const alignmentConfig = [
    { alignment: 'left' as ContentAlignment, icon: AlignStartHorizontal, title: 'Align left' },
    { alignment: 'center' as ContentAlignment, icon: AlignCenterHorizontal, title: 'Align center' },
    { alignment: 'right' as ContentAlignment, icon: AlignEndHorizontal, title: 'Align right' },
  ]

  const showWidthControls = currentValue.mode !== 'full'
  const hasHeightConstraints = showHeightControls && (advancedMode || currentValue.minHeight?.enabled || currentValue.maxHeight?.enabled)

  return (
    <div className="puck-field space-y-3">
      {/* Header with label and clear */}
      <div className="flex items-center justify-between">
        {label && (
          <Label className="text-sm font-medium text-foreground">{label}</Label>
        )}
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Width Mode Selector */}
      <div className="flex flex-wrap gap-1">
        {modeConfig.map(({ mode, icon: Icon, label: modeLabel, title }) => {
          const isActive = currentValue.mode === mode
          return (
            <Button
              key={mode}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleModeChange(mode)}
              disabled={readOnly}
              className={cn('text-xs gap-1', isActive && 'bg-primary hover:bg-primary/90')}
              title={title}
            >
              <Icon className="h-3.5 w-3.5" />
              {modeLabel}
            </Button>
          )
        })}
      </div>

      {/* Width Controls */}
      {showWidthControls && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-md">
          {/* Preset Quick Selects */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Presets
            </Label>
            <div className="flex flex-wrap gap-1">
              {WIDTH_PRESETS.map((preset) => {
                const isActive =
                  currentValue.maxWidth.value === preset.value &&
                  currentValue.maxWidth.unit === 'px' &&
                  currentValue.maxWidth.enabled
                return (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePresetSelect(preset.value)}
                    disabled={readOnly}
                    className={cn('text-xs h-7 px-3', isActive && 'bg-primary hover:bg-primary/90')}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Simple Mode: Just Max Width */}
          {!advancedMode && (
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Max Width
              </Label>
              <div className="flex items-center flex-wrap gap-2">
                <Input
                  type="number"
                  min={0}
                  value={currentValue.maxWidth.value}
                  onChange={(e) =>
                    handleMaxWidthChange({
                      ...currentValue.maxWidth,
                      value: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  disabled={readOnly}
                  className="h-8 text-sm font-mono flex-1 min-w-[80px]"
                />
                <div className="flex flex-shrink-0 gap-1">
                  {WIDTH_UNITS.map((unit) => {
                    const isActive = currentValue.maxWidth.unit === unit
                    return (
                      <Button
                        key={unit}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          handleMaxWidthChange({
                            ...currentValue.maxWidth,
                            unit,
                          })
                        }
                        disabled={readOnly}
                        className={cn(
                          'text-xs font-mono h-8 px-3',
                          isActive && 'bg-primary hover:bg-primary/90'
                        )}
                      >
                        {unit}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Mode */}
          {advancedMode && (
            <div className="space-y-4">
              {/* Width Constraints */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Width Constraints
                </Label>
                <div className="space-y-2 pl-1">
                  {showMinControls && (
                    <ConstraintInput
                      label="Min Width"
                      constraint={currentValue.minWidth}
                      onChange={handleMinWidthChange}
                      onToggle={handleMinWidthToggle}
                      units={WIDTH_UNITS}
                      disabled={readOnly}
                    />
                  )}
                  <ConstraintInput
                    label="Max Width"
                    constraint={currentValue.maxWidth}
                    onChange={handleMaxWidthChange}
                    onToggle={handleMaxWidthToggle}
                    units={WIDTH_UNITS}
                    disabled={readOnly}
                  />
                </div>
              </div>

              {/* Height Constraints */}
              {showHeightControls && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Height Constraints
                  </Label>
                  <div className="space-y-2 pl-1">
                    {showMinControls && (
                      <ConstraintInput
                        label="Min Height"
                        constraint={currentValue.minHeight}
                        onChange={handleMinHeightChange}
                        onToggle={handleMinHeightToggle}
                        units={HEIGHT_UNITS}
                        disabled={readOnly}
                      />
                    )}
                    <ConstraintInput
                      label="Max Height"
                      constraint={currentValue.maxHeight}
                      onChange={handleMaxHeightChange}
                      onToggle={handleMaxHeightToggle}
                      units={HEIGHT_UNITS}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Height Constraints for Full Mode (still allow height constraints) */}
      {!showWidthControls && showHeightControls && advancedMode && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-md">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Height Constraints
          </Label>
          <div className="space-y-2 pl-1">
            {showMinControls && (
              <ConstraintInput
                label="Min Height"
                constraint={currentValue.minHeight}
                onChange={handleMinHeightChange}
                onToggle={handleMinHeightToggle}
                units={HEIGHT_UNITS}
                disabled={readOnly}
              />
            )}
            <ConstraintInput
              label="Max Height"
              constraint={currentValue.maxHeight}
              onChange={handleMaxHeightChange}
              onToggle={handleMaxHeightToggle}
              units={HEIGHT_UNITS}
              disabled={readOnly}
            />
          </div>
        </div>
      )}

      {/* Footer: Alignment + Summary + Advanced Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Alignment */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground flex-shrink-0">Align:</Label>
          <div className="flex gap-1">
            {alignmentConfig.map(({ alignment, icon: Icon, title }) => {
              const isActive = currentValue.alignment === alignment
              const isDisabled = readOnly || currentValue.mode === 'full'
              return (
                <Button
                  key={alignment}
                  type="button"
                  variant={isActive ? 'default' : 'secondary'}
                  size="icon"
                  onClick={() => handleAlignmentChange(alignment)}
                  disabled={isDisabled}
                  className={cn('h-8 w-8', isActive && 'bg-primary hover:bg-primary/90')}
                  title={title}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              )
            })}
          </div>
        </div>

        {/* Value Summary */}
        <span className="text-xs text-muted-foreground font-mono">
          {getDimensionsSummary(currentValue)}
        </span>
      </div>

      {/* Advanced Toggle */}
      {(showHeightControls || showMinControls) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdvancedToggle}
          disabled={readOnly}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {advancedMode ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Hide Advanced
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
              Show Advanced
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export const DimensionsField = memo(DimensionsFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateDimensionsFieldConfig {
  label?: string
  /** Show height controls (default: true) */
  showHeightControls?: boolean
  /** Show min controls in advanced mode (default: true) */
  showMinControls?: boolean
  /** Start with advanced mode expanded (default: false) */
  defaultAdvancedMode?: boolean
}

/**
 * Creates a Puck field configuration for dimensions control
 */
export function createDimensionsField(
  config: CreateDimensionsFieldConfig = {}
): CustomField<DimensionsValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <DimensionsField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showHeightControls={config.showHeightControls}
        showMinControls={config.showMinControls}
        defaultAdvancedMode={config.defaultAdvancedMode}
      />
    ),
  }
}
