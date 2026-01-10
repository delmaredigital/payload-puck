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

import React, { useCallback, memo, useState, type CSSProperties } from 'react'
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
// Styles
// =============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  modeGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  } as CSSProperties,
  modeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  modeButtonActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  controlsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
  } as CSSProperties,
  sectionLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  presetGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as CSSProperties,
  presetButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  } as CSSProperties,
  presetButton: {
    height: '28px',
    padding: '0 12px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  presetButtonActive: {
    height: '28px',
    padding: '0 12px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as CSSProperties,
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  } as CSSProperties,
  input: {
    flex: 1,
    minWidth: '80px',
    height: '32px',
    padding: '0 8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  unitGroup: {
    display: 'flex',
    flexShrink: 0,
    gap: '4px',
  } as CSSProperties,
  unitButton: {
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  unitButtonActive: {
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  } as CSSProperties,
  alignGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  alignLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    flexShrink: 0,
  } as CSSProperties,
  alignButtons: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  alignButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  alignButtonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  alignButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  summary: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    fontFamily: 'monospace',
  } as CSSProperties,
  advancedToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '8px 12px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  constraintRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    minWidth: '90px',
  } as CSSProperties,
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  checkboxText: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  constraintInput: {
    flex: 1,
    minWidth: '60px',
    height: '28px',
    padding: '0 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  smallUnitButton: {
    height: '28px',
    padding: '0 10px',
    fontSize: '10px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  smallUnitButtonActive: {
    height: '28px',
    padding: '0 10px',
    fontSize: '10px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  constraintsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  constraintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '4px',
  } as CSSProperties,
}

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onToggle(e.target.checked)
    },
    [onToggle]
  )

  return (
    <div style={styles.constraintRow}>
      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={handleToggle}
          disabled={disabled}
          style={styles.checkbox}
        />
        <span style={styles.checkboxText}>{label}</span>
      </label>

      <input
        type="number"
        min={0}
        value={isEnabled ? value : ''}
        onChange={handleValueChange}
        disabled={disabled || !isEnabled}
        placeholder={placeholder}
        style={{
          ...styles.constraintInput,
          ...(disabled || !isEnabled ? { opacity: 0.5 } : {}),
        }}
      />

      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        {units.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => handleUnitChange(u)}
            disabled={disabled || !isEnabled}
            style={{
              ...(unit === u && isEnabled ? styles.smallUnitButtonActive : styles.smallUnitButton),
              ...(disabled || !isEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
          >
            {u}
          </button>
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
  const currentValue = value || DEFAULT_VALUE
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

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header with label and clear */}
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>{label}</label>
        )}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            title="Reset to default"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Width Mode Selector */}
      <div style={styles.modeGroup as CSSProperties}>
        {modeConfig.map(({ mode, icon: Icon, label: modeLabel, title }) => {
          const isActive = currentValue.mode === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              disabled={readOnly}
              style={isActive ? styles.modeButtonActive : styles.modeButton}
              title={title}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              {modeLabel}
            </button>
          )
        })}
      </div>

      {/* Width Controls */}
      {showWidthControls && (
        <div style={styles.controlsPanel as CSSProperties}>
          {/* Preset Quick Selects */}
          <div style={styles.presetGroup as CSSProperties}>
            <label style={styles.sectionLabel as CSSProperties}>Presets</label>
            <div style={styles.presetButtons}>
              {WIDTH_PRESETS.map((preset) => {
                const isActive =
                  currentValue.maxWidth.value === preset.value &&
                  currentValue.maxWidth.unit === 'px' &&
                  currentValue.maxWidth.enabled
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    disabled={readOnly}
                    style={isActive ? styles.presetButtonActive : styles.presetButton}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Simple Mode: Just Max Width */}
          {!advancedMode && (
            <div style={styles.inputGroup as CSSProperties}>
              <label style={styles.sectionLabel as CSSProperties}>Max Width</label>
              <div style={styles.inputRow}>
                <input
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
                  style={styles.input}
                />
                <div style={styles.unitGroup}>
                  {WIDTH_UNITS.map((unit) => {
                    const isActive = currentValue.maxWidth.unit === unit
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() =>
                          handleMaxWidthChange({
                            ...currentValue.maxWidth,
                            unit,
                          })
                        }
                        disabled={readOnly}
                        style={isActive ? styles.unitButtonActive : styles.unitButton}
                      >
                        {unit}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Mode */}
          {advancedMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Width Constraints */}
              <div style={styles.constraintsSection as CSSProperties}>
                <label style={styles.sectionLabel as CSSProperties}>
                  Width Constraints
                </label>
                <div style={styles.constraintsList as CSSProperties}>
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
                <div style={styles.constraintsSection as CSSProperties}>
                  <label style={styles.sectionLabel as CSSProperties}>
                    Height Constraints
                  </label>
                  <div style={styles.constraintsList as CSSProperties}>
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
        <div style={styles.controlsPanel as CSSProperties}>
          <label style={styles.sectionLabel as CSSProperties}>
            Height Constraints
          </label>
          <div style={styles.constraintsList as CSSProperties}>
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
      <div style={styles.footer}>
        {/* Alignment */}
        <div style={styles.alignGroup}>
          <label style={styles.alignLabel}>Align:</label>
          <div style={styles.alignButtons}>
            {alignmentConfig.map(({ alignment, icon: Icon, title }) => {
              const isActive = currentValue.alignment === alignment
              const isDisabled = readOnly || currentValue.mode === 'full'
              return (
                <button
                  key={alignment}
                  type="button"
                  onClick={() => handleAlignmentChange(alignment)}
                  disabled={isDisabled}
                  style={{
                    ...(isActive ? styles.alignButtonActive : styles.alignButton),
                    ...(isDisabled ? styles.alignButtonDisabled : {}),
                  }}
                  title={title}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Value Summary */}
        <span style={styles.summary}>
          {getDimensionsSummary(currentValue)}
        </span>
      </div>

      {/* Advanced Toggle */}
      {(showHeightControls || showMinControls) && (
        <button
          type="button"
          onClick={handleAdvancedToggle}
          disabled={readOnly}
          style={styles.advancedToggle}
        >
          {advancedMode ? (
            <>
              <ChevronUp style={{ width: '14px', height: '14px', marginRight: '4px' }} />
              Hide Advanced
            </>
          ) : (
            <>
              <ChevronDown style={{ width: '14px', height: '14px', marginRight: '4px' }} />
              Show Advanced
            </>
          )}
        </button>
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
