'use client'

/**
 * BorderField - Custom Puck field for border styling
 *
 * This component provides:
 * - Border width input (px)
 * - Border color picker (reuses ColorPickerField)
 * - Border radius input
 * - Border style selector (solid, dashed, dotted, none)
 * - Per-side toggles (top, right, bottom, left)
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  X,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react'
import { ColorPickerField } from './ColorPickerField'
import type { BorderValue, ColorValue } from './shared'

// =============================================================================
// Types
// =============================================================================

type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted'

interface BorderFieldProps {
  value: BorderValue | null
  onChange: (value: BorderValue | null) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Default Value
// =============================================================================

const DEFAULT_VALUE: BorderValue = {
  width: 1,
  color: { hex: '#e5e7eb', opacity: 100 }, // gray-200
  radius: 0,
  style: 'solid',
  sides: {
    top: true,
    right: true,
    bottom: true,
    left: true,
  },
}

// =============================================================================
// Border Style Options
// =============================================================================

const BORDER_STYLES: Array<{ value: BorderStyle; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'none', label: 'None' },
]

// =============================================================================
// Styles
// =============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  preview: {
    height: '64px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  previewText: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  inputLabel: {
    fontSize: '12px',
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
  select: {
    height: '32px',
    padding: '0 8px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  sidesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  sidesLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  sidesButtons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  } as CSSProperties,
  sideButton: {
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
  sideButtonActive: {
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
  sidesInfo: {
    fontSize: '10px',
    color: 'var(--theme-elevation-500)',
    textAlign: 'center',
  } as CSSProperties,
}

// =============================================================================
// BorderField Component
// =============================================================================

function BorderFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: BorderFieldProps) {
  // Use default if no value
  const currentValue = value || DEFAULT_VALUE

  // Handle width change
  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10) || 0
    onChange({
      ...currentValue,
      width: Math.max(0, newWidth),
    })
  }, [currentValue, onChange])

  // Handle color change
  const handleColorChange = useCallback((newColor: ColorValue | null) => {
    onChange({
      ...currentValue,
      color: newColor || { hex: '#000000', opacity: 100 },
    })
  }, [currentValue, onChange])

  // Handle radius change
  const handleRadiusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value, 10) || 0
    onChange({
      ...currentValue,
      radius: Math.max(0, newRadius),
    })
  }, [currentValue, onChange])

  // Handle style change
  const handleStyleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...currentValue,
      style: e.target.value as BorderStyle,
    })
  }, [currentValue, onChange])

  // Handle side toggle
  const handleSideToggle = useCallback((side: 'top' | 'right' | 'bottom' | 'left') => {
    onChange({
      ...currentValue,
      sides: {
        ...currentValue.sides,
        [side]: !currentValue.sides[side],
      },
    })
  }, [currentValue, onChange])

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Check if all sides are enabled
  const allSidesEnabled = currentValue.sides.top &&
    currentValue.sides.right &&
    currentValue.sides.bottom &&
    currentValue.sides.left

  const sideConfig = [
    { side: 'top' as const, icon: ArrowUp, title: 'Top border' },
    { side: 'right' as const, icon: ArrowRight, title: 'Right border' },
    { side: 'bottom' as const, icon: ArrowDown, title: 'Bottom border' },
    { side: 'left' as const, icon: ArrowLeft, title: 'Left border' },
  ]

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>{label}</label>
        )}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            title="Clear border"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Border preview */}
      <div
        style={{
          ...styles.preview,
          borderWidth: currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
          borderStyle: currentValue.style,
          borderColor: currentValue.color?.hex || '#000000',
          borderRadius: `${currentValue.radius}px`,
          borderTopWidth: currentValue.sides.top && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
          borderRightWidth: currentValue.sides.right && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
          borderBottomWidth: currentValue.sides.bottom && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
          borderLeftWidth: currentValue.sides.left && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
          opacity: (currentValue.color?.opacity ?? 100) / 100,
        }}
      >
        <span style={styles.previewText}>Preview</span>
      </div>

      {/* Width and Style row */}
      <div style={styles.grid}>
        {/* Width */}
        <div style={styles.inputGroup as CSSProperties}>
          <label style={styles.inputLabel}>Width (px)</label>
          <input
            type="number"
            min={0}
            max={20}
            value={currentValue.width}
            onChange={handleWidthChange}
            disabled={readOnly}
            style={styles.input}
          />
        </div>

        {/* Style */}
        <div style={styles.inputGroup as CSSProperties}>
          <label style={styles.inputLabel}>Style</label>
          <select
            value={currentValue.style}
            onChange={handleStyleChange}
            disabled={readOnly}
            style={styles.select}
          >
            {BORDER_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Radius */}
      <div style={styles.inputGroup as CSSProperties}>
        <label style={styles.inputLabel}>Radius (px)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={currentValue.radius}
          onChange={handleRadiusChange}
          disabled={readOnly}
          style={styles.input}
        />
      </div>

      {/* Color */}
      <ColorPickerField
        value={currentValue.color}
        onChange={handleColorChange}
        label="Color"
        readOnly={readOnly}
        showOpacity={true}
        presets={[
          { hex: '#000000', label: 'Black' },
          { hex: '#374151', label: 'Gray 700' },
          { hex: '#6b7280', label: 'Gray 500' },
          { hex: '#d1d5db', label: 'Gray 300' },
          { hex: '#e5e7eb', label: 'Gray 200' },
          { hex: '#3b82f6', label: 'Blue' },
          { hex: '#ef4444', label: 'Red' },
        ]}
      />

      {/* Per-side toggles */}
      {!readOnly && (
        <div style={styles.sidesSection as CSSProperties}>
          <label style={styles.sidesLabel}>Sides</label>
          <div style={styles.sidesButtons}>
            {sideConfig.map(({ side, icon: Icon, title }) => {
              const isActive = currentValue.sides[side]
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => handleSideToggle(side)}
                  style={isActive ? styles.sideButtonActive : styles.sideButton}
                  title={title}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                </button>
              )
            })}
          </div>
          <p style={styles.sidesInfo as CSSProperties}>
            {allSidesEnabled ? 'All sides' : 'Custom sides'}
          </p>
        </div>
      )}
    </div>
  )
}

export const BorderField = memo(BorderFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for border styling
 */
export function createBorderField(config: {
  label?: string
}): CustomField<BorderValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <BorderField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
