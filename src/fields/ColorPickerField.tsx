'use client'

/**
 * ColorPickerField - Custom Puck field for selecting colors with opacity
 *
 * This component provides a color picker with:
 * - Native color input for visual picking
 * - Hex input for direct entry
 * - Opacity slider (0-100%)
 * - Preview swatch
 * - Optional preset color swatches
 */

import React, { useState, useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { X } from 'lucide-react'
import type { ColorValue } from './shared'
import { useTheme } from '../theme'

// =============================================================================
// Types
// =============================================================================

interface ColorPickerFieldProps {
  value: ColorValue | null
  onChange: (value: ColorValue | null) => void
  label?: string
  readOnly?: boolean
  showOpacity?: boolean
  presets?: Array<{ hex: string; label: string }>
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates and normalizes a hex color string
 */
function normalizeHex(hex: string): string {
  let clean = hex.replace(/^#/, '')

  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('')
  }

  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return ''
  }

  return `#${clean.toLowerCase()}`
}

/**
 * Converts hex + opacity to rgba CSS string
 */
export function colorToRgba(hex: string, opacity: number): string {
  const clean = hex.replace(/^#/, '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
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
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,
  colorInput: {
    width: '40px',
    height: '40px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
    cursor: 'pointer',
  } as CSSProperties,
  hexInput: {
    flex: 1,
    height: '40px',
    padding: '0 12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  previewSwatch: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-150)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  } as CSSProperties,
  checkerboard: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    backgroundColor: '#f0f0f0',
  } as CSSProperties,
  colorOverlay: {
    position: 'absolute',
    inset: 0,
  } as CSSProperties,
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
    flexShrink: 0,
  } as CSSProperties,
  opacitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  opacityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  opacityLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  opacityValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  opacitySlider: {
    position: 'relative',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid var(--theme-elevation-150)',
  } as CSSProperties,
  opacityInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    margin: 0,
  } as CSSProperties,
  opacityThumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: 'white',
    border: '1px solid var(--theme-elevation-400)',
    borderRadius: '2px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  } as CSSProperties,
  presetsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  presetsLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  presetsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  } as CSSProperties,
  presetButton: {
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid var(--theme-elevation-150)',
    outline: 'none',
  } as CSSProperties,
  presetButtonSelected: {
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    border: '2px solid var(--theme-elevation-800)',
    outline: '2px solid var(--theme-elevation-300)',
    outlineOffset: '2px',
  } as CSSProperties,
}

// =============================================================================
// ColorPickerField Component
// =============================================================================

function ColorPickerFieldInner({
  value,
  onChange,
  label,
  readOnly,
  showOpacity = true,
  presets,
}: ColorPickerFieldProps) {
  // Use theme presets if none provided
  const theme = useTheme()
  const resolvedPresets = presets ?? theme.colorPresets
  const [hexInput, setHexInput] = useState(value?.hex || '')

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    onChange({
      hex: newHex,
      opacity: value?.opacity ?? 100,
    })
    setHexInput(newHex)
  }, [onChange, value?.opacity])

  const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setHexInput(input)

    const normalized = normalizeHex(input)
    if (normalized) {
      onChange({
        hex: normalized,
        opacity: value?.opacity ?? 100,
      })
    }
  }, [onChange, value?.opacity])

  const handleHexInputBlur = useCallback(() => {
    if (value?.hex) {
      setHexInput(value.hex)
    }
  }, [value?.hex])

  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value, 10)
    if (value?.hex) {
      onChange({
        hex: value.hex,
        opacity: newOpacity,
      })
    }
  }, [onChange, value?.hex])

  const handlePresetClick = useCallback((preset: { hex: string; label: string }) => {
    onChange({
      hex: preset.hex,
      opacity: value?.opacity ?? 100,
    })
    setHexInput(preset.hex)
  }, [onChange, value?.opacity])

  const handleClear = useCallback(() => {
    onChange(null)
    setHexInput('')
  }, [onChange])

  const previewColor = value?.hex
    ? colorToRgba(value.hex, value.opacity ?? 100)
    : 'transparent'

  return (
    <div className="puck-field" style={styles.container}>
      {label && (
        <label style={styles.label}>
          {label}
        </label>
      )}

      {/* Color picker and hex input row */}
      <div style={styles.row}>
        {/* Native color picker */}
        <input
          type="color"
          value={value?.hex || '#000000'}
          onChange={handleColorChange}
          disabled={readOnly}
          style={{
            ...styles.colorInput,
            ...(readOnly ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
          }}
        />

        {/* Hex input */}
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          placeholder="#000000"
          disabled={readOnly}
          style={styles.hexInput}
        />

        {/* Preview swatch with checkerboard for transparency */}
        <div
          style={styles.previewSwatch as CSSProperties}
          title={value?.hex ? `${value.hex} at ${value.opacity ?? 100}% opacity` : 'No color selected'}
        >
          <div style={styles.checkerboard as CSSProperties} />
          <div style={{ ...styles.colorOverlay as CSSProperties, backgroundColor: previewColor }} />
        </div>

        {/* Clear button */}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear color"
            style={styles.clearButton}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Opacity slider */}
      {showOpacity && value?.hex && (
        <div style={styles.opacitySection as CSSProperties}>
          <div style={styles.opacityHeader}>
            <label style={styles.opacityLabel}>Opacity</label>
            <span style={styles.opacityValue}>{value.opacity ?? 100}%</span>
          </div>
          {/* Custom opacity slider with checkerboard + color gradient */}
          <div style={styles.opacitySlider as CSSProperties}>
            {/* Checkerboard background */}
            <div style={styles.checkerboard as CSSProperties} />
            {/* Color gradient from transparent to solid */}
            <div
              style={{
                ...styles.colorOverlay as CSSProperties,
                background: `linear-gradient(to right, transparent 0%, ${value.hex} 100%)`,
              }}
            />
            {/* Range input overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={value.opacity ?? 100}
              onChange={handleOpacityChange}
              disabled={readOnly}
              style={{
                ...styles.opacityInput as CSSProperties,
                ...(readOnly ? { cursor: 'not-allowed' } : {}),
              }}
            />
            {/* Thumb indicator */}
            <div
              style={{
                ...styles.opacityThumb as CSSProperties,
                left: `calc(${value.opacity ?? 100}% - 2px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Preset swatches */}
      {resolvedPresets.length > 0 && !readOnly && (
        <div style={styles.presetsSection as CSSProperties}>
          <label style={styles.presetsLabel}>Presets</label>
          <div style={styles.presetsGrid}>
            {resolvedPresets.map((preset) => {
              const isSelected = value?.hex?.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    ...(isSelected ? styles.presetButtonSelected : styles.presetButton),
                    backgroundColor: preset.hex,
                  }}
                  title={preset.label}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export const ColorPickerField = memo(ColorPickerFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for color selection
 */
export function createColorPickerField(config: {
  label?: string
  showOpacity?: boolean
  presets?: Array<{ hex: string; label: string }>
}): CustomField<ColorValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <ColorPickerField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showOpacity={config.showOpacity}
        presets={config.presets}
      />
    ),
  }
}
