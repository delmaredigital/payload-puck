'use client'

/**
 * SizeField - Custom Puck field for button/element sizing
 *
 * Provides preset size options (sm, default, lg) with a "custom" mode
 * that reveals detailed controls for height, padding, and font size.
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { X } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export type SizeMode = 'sm' | 'default' | 'lg' | 'custom'
export type SizeUnit = 'px' | 'rem'

export interface SizeValue {
  mode: SizeMode
  /** Height in units (only used when mode === 'custom') */
  height?: number
  /** Horizontal padding in units (only used when mode === 'custom') */
  paddingX?: number
  /** Vertical padding in units (only used when mode === 'custom') */
  paddingY?: number
  /** Font size in units (only used when mode === 'custom') */
  fontSize?: number
  /** Unit for all values */
  unit?: SizeUnit
}

interface SizeFieldProps {
  value: SizeValue | null
  onChange: (value: SizeValue | null) => void
  label?: string
  readOnly?: boolean
  /** Show height input (default: true) */
  showHeight?: boolean
  /** Show font size input (default: true) */
  showFontSize?: boolean
}

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_VALUE: SizeValue = {
  mode: 'default',
}

const CUSTOM_DEFAULTS: Required<Omit<SizeValue, 'mode'>> = {
  height: 40,
  paddingX: 16,
  paddingY: 8,
  fontSize: 14,
  unit: 'px',
}

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
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  buttonActive: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  customPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
  } as CSSProperties,
  unitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  unitLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
    flexShrink: 0,
  } as CSSProperties,
  unitButtons: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  unitButton: {
    height: '28px',
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
    height: '28px',
    padding: '0 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  inputLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  input: {
    height: '32px',
    padding: '0 8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  summary: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    fontFamily: 'monospace',
    paddingTop: '4px',
    borderTop: '1px solid var(--theme-elevation-100)',
  } as CSSProperties,
}

// =============================================================================
// SizeField Component
// =============================================================================

function SizeFieldInner({
  value,
  onChange,
  label = 'Size',
  readOnly,
  showHeight = true,
  showFontSize = true,
}: SizeFieldProps) {
  const currentValue = value || DEFAULT_VALUE

  const handleModeChange = useCallback((mode: SizeMode) => {
    if (mode === 'custom') {
      onChange({
        mode,
        ...CUSTOM_DEFAULTS,
      })
    } else {
      onChange({ mode })
    }
  }, [onChange])

  const handleValueChange = useCallback((
    field: 'height' | 'paddingX' | 'paddingY' | 'fontSize',
    val: number
  ) => {
    onChange({
      ...currentValue,
      [field]: val,
    })
  }, [currentValue, onChange])

  const handleUnitChange = useCallback((unit: SizeUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const presets = [
    { mode: 'sm' as SizeMode, label: 'SM' },
    { mode: 'default' as SizeMode, label: 'Default' },
    { mode: 'lg' as SizeMode, label: 'LG' },
    { mode: 'custom' as SizeMode, label: 'Custom' },
  ]

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header with label and clear */}
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
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

      {/* Size mode selector */}
      <div style={styles.buttonGroup}>
        {presets.map(({ mode, label: modeLabel }) => {
          const isActive = currentValue.mode === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              disabled={readOnly}
              style={isActive ? styles.buttonActive : styles.button}
            >
              {modeLabel}
            </button>
          )
        })}
      </div>

      {/* Custom size controls */}
      {currentValue.mode === 'custom' && (
        <div style={styles.customPanel as CSSProperties}>
          {/* Unit selector */}
          <div style={styles.unitRow}>
            <label style={styles.unitLabel as CSSProperties}>Unit:</label>
            <div style={styles.unitButtons}>
              {(['px', 'rem'] as SizeUnit[]).map((unit) => {
                const isActive = (currentValue.unit || 'px') === unit
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

          {/* Numeric inputs */}
          <div style={styles.inputGrid}>
            {showHeight && (
              <div style={styles.inputGroup as CSSProperties}>
                <label style={styles.inputLabel as CSSProperties}>Height</label>
                <input
                  type="number"
                  min={0}
                  value={currentValue.height ?? CUSTOM_DEFAULTS.height}
                  onChange={(e) => handleValueChange('height', parseInt(e.target.value, 10) || 0)}
                  disabled={readOnly}
                  style={styles.input}
                />
              </div>
            )}

            {showFontSize && (
              <div style={styles.inputGroup as CSSProperties}>
                <label style={styles.inputLabel as CSSProperties}>Font Size</label>
                <input
                  type="number"
                  min={0}
                  value={currentValue.fontSize ?? CUSTOM_DEFAULTS.fontSize}
                  onChange={(e) => handleValueChange('fontSize', parseInt(e.target.value, 10) || 0)}
                  disabled={readOnly}
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.inputGroup as CSSProperties}>
              <label style={styles.inputLabel as CSSProperties}>Padding X</label>
              <input
                type="number"
                min={0}
                value={currentValue.paddingX ?? CUSTOM_DEFAULTS.paddingX}
                onChange={(e) => handleValueChange('paddingX', parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup as CSSProperties}>
              <label style={styles.inputLabel as CSSProperties}>Padding Y</label>
              <input
                type="number"
                min={0}
                value={currentValue.paddingY ?? CUSTOM_DEFAULTS.paddingY}
                onChange={(e) => handleValueChange('paddingY', parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                style={styles.input}
              />
            </div>
          </div>

          {/* Preview summary */}
          <div style={styles.summary}>
            {showHeight && `h: ${currentValue.height ?? CUSTOM_DEFAULTS.height}${currentValue.unit || 'px'}`}
            {showHeight && ' | '}
            {`p: ${currentValue.paddingY ?? CUSTOM_DEFAULTS.paddingY}${currentValue.unit || 'px'} ${currentValue.paddingX ?? CUSTOM_DEFAULTS.paddingX}${currentValue.unit || 'px'}`}
            {showFontSize && ` | font: ${currentValue.fontSize ?? CUSTOM_DEFAULTS.fontSize}${currentValue.unit || 'px'}`}
          </div>
        </div>
      )}
    </div>
  )
}

export const SizeField = memo(SizeFieldInner)

// =============================================================================
// CSS Helper
// =============================================================================

/**
 * Convert SizeValue to CSS properties object
 */
export function sizeValueToCSS(size: SizeValue | null | undefined): React.CSSProperties | undefined {
  if (!size || size.mode !== 'custom') return undefined

  const unit = size.unit || 'px'
  const style: React.CSSProperties = {}

  if (size.height != null) {
    style.height = `${size.height}${unit}`
  }

  if (size.paddingX != null || size.paddingY != null) {
    const py = size.paddingY ?? 0
    const px = size.paddingX ?? 0
    style.padding = `${py}${unit} ${px}${unit}`
  }

  if (size.fontSize != null) {
    style.fontSize = `${size.fontSize}${unit}`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

/**
 * Get Tailwind classes for preset size modes
 */
export function getSizeClasses(size: SizeValue | null | undefined, sizeMap: Record<string, string>): string {
  if (!size) return sizeMap.default || ''
  if (size.mode === 'custom') return ''
  return sizeMap[size.mode] || sizeMap.default || ''
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateSizeFieldConfig {
  label?: string
  showHeight?: boolean
  showFontSize?: boolean
}

/**
 * Creates a Puck field configuration for size control
 */
export function createSizeField(
  config: CreateSizeFieldConfig = {}
): CustomField<SizeValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <SizeField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showHeight={config.showHeight}
        showFontSize={config.showFontSize}
      />
    ),
  }
}
