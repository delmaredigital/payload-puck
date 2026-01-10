'use client'

/**
 * WidthField - Custom Puck field for flexible width control
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Custom max-width input with unit selector (px, %, rem, vw)
 * - Content alignment (left, center, right)
 * - Preset quick-select buttons for common widths
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
  Container,
  SlidersHorizontal,
} from 'lucide-react'
import type { WidthValue } from './shared'

// =============================================================================
// Types
// =============================================================================

type WidthUnit = 'px' | 'rem' | '%' | 'vw'
type WidthMode = 'full' | 'contained' | 'custom'
type ContentAlignment = 'left' | 'center' | 'right'

interface WidthFieldProps {
  value: WidthValue | null
  onChange: (value: WidthValue | null) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Default Value
// =============================================================================

const DEFAULT_VALUE: WidthValue = {
  mode: 'contained',
  maxWidth: 1200,
  unit: 'px',
  alignment: 'center',
}

// =============================================================================
// Preset Widths
// =============================================================================

const WIDTH_PRESETS = [
  { label: 'Narrow', value: 680 },
  { label: 'Medium', value: 960 },
  { label: 'Wide', value: 1200 },
  { label: 'XL', value: 1440 },
]

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
}

// =============================================================================
// WidthField Component
// =============================================================================

function WidthFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: WidthFieldProps) {
  const currentValue = value || DEFAULT_VALUE

  const handleModeChange = useCallback((mode: WidthMode) => {
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
  }, [currentValue, onChange])

  const handleMaxWidthChange = useCallback((maxWidth: number) => {
    onChange({
      ...currentValue,
      maxWidth,
    })
  }, [currentValue, onChange])

  const handleUnitChange = useCallback((unit: WidthUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  const handleAlignmentChange = useCallback((alignment: ContentAlignment) => {
    onChange({
      ...currentValue,
      alignment,
    })
  }, [currentValue, onChange])

  const handlePresetSelect = useCallback((presetValue: number) => {
    onChange({
      ...currentValue,
      mode: 'contained',
      maxWidth: presetValue,
      unit: 'px',
    })
  }, [currentValue, onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const modeConfig = [
    { mode: 'full' as WidthMode, icon: MoveHorizontal, label: 'Full', title: 'Full width (100%)' },
    { mode: 'contained' as WidthMode, icon: Container, label: 'Contain', title: 'Contained (centered with max-width)' },
    { mode: 'custom' as WidthMode, icon: SlidersHorizontal, label: 'Custom', title: 'Custom width settings' },
  ]

  const alignmentConfig = [
    { alignment: 'left' as ContentAlignment, icon: AlignLeft, title: 'Align left' },
    { alignment: 'center' as ContentAlignment, icon: AlignCenter, title: 'Align center' },
    { alignment: 'right' as ContentAlignment, icon: AlignRight, title: 'Align right' },
  ]

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
      <div style={styles.modeGroup}>
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

      {/* Max Width Controls */}
      {currentValue.mode !== 'full' && (
        <div style={styles.controlsPanel as CSSProperties}>
          {/* Preset Quick Selects */}
          <div style={styles.presetGroup as CSSProperties}>
            <label style={styles.sectionLabel as CSSProperties}>Presets</label>
            <div style={styles.presetButtons}>
              {WIDTH_PRESETS.map((preset) => {
                const isActive = currentValue.maxWidth === preset.value && currentValue.unit === 'px'
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

          {/* Custom Width Input */}
          <div style={styles.inputGroup as CSSProperties}>
            <label style={styles.sectionLabel as CSSProperties}>Max Width</label>
            <div style={styles.inputRow}>
              <input
                type="number"
                min={0}
                value={currentValue.maxWidth}
                onChange={(e) => handleMaxWidthChange(parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                style={styles.input}
              />
              <div style={styles.unitGroup}>
                {(['px', '%', 'rem', 'vw'] as WidthUnit[]).map((unit) => {
                  const isActive = currentValue.unit === unit
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleUnitChange(unit)}
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
        </div>
      )}

      {/* Alignment Controls */}
      <div style={styles.footer}>
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
        {/* Current value summary */}
        <span style={styles.summary}>
          {currentValue.mode === 'full'
            ? '100%'
            : `${currentValue.maxWidth}${currentValue.unit}`
          }
        </span>
      </div>
    </div>
  )
}

export const WidthField = memo(WidthFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for width control
 */
export function createWidthField(config: {
  label?: string
}): CustomField<WidthValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <WidthField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
