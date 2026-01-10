'use client'

/**
 * GradientEditor - Component for editing gradient values
 *
 * This component provides:
 * - Type selector (linear/radial toggle)
 * - Angle slider for linear gradients (0-360)
 * - Shape and position selectors for radial gradients
 * - Gradient stops list with color pickers and position sliders
 * - Add/remove stop buttons
 * - Visual gradient preview bar
 */

import React, { useCallback, memo, useState, type CSSProperties } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { GradientValue, GradientStop, ColorValue } from './shared'
import { colorValueToCSS } from './shared'

// =============================================================================
// Types
// =============================================================================

interface GradientEditorProps {
  value: GradientValue | null
  onChange: (value: GradientValue) => void
  readOnly?: boolean
}

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_GRADIENT: GradientValue = {
  type: 'linear',
  angle: 90,
  stops: [
    { color: { hex: '#000000', opacity: 100 }, position: 0 },
    { color: { hex: '#ffffff', opacity: 100 }, position: 100 },
  ],
  radialShape: 'circle',
  radialPosition: 'center',
}

// =============================================================================
// Styles
// =============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  preview: {
    height: '48px',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-150)',
  } as CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  label: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    width: '48px',
    flexShrink: 0,
  } as CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  button: {
    height: '28px',
    padding: '0 12px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  buttonActive: {
    height: '28px',
    padding: '0 12px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  slider: {
    flex: 1,
    height: '6px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  sliderValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
    width: '40px',
    textAlign: 'right',
  } as CSSProperties,
  select: {
    flex: 1,
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  stopsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '24px',
    padding: '0 8px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  stopsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as CSSProperties,
  stopItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
    overflow: 'hidden',
  } as CSSProperties,
  stopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  colorPicker: {
    width: '28px',
    height: '28px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    cursor: 'pointer',
    flexShrink: 0,
  } as CSSProperties,
  hexInput: {
    width: '80px',
    minWidth: 0,
    height: '28px',
    padding: '0 6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  swatch: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-150)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  } as CSSProperties,
  checkerboard: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
  } as CSSProperties,
  colorOverlay: {
    position: 'absolute',
    inset: 0,
  } as CSSProperties,
  spacer: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  deleteButton: {
    padding: '4px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
    flexShrink: 0,
  } as CSSProperties,
  stopLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    width: '48px',
    flexShrink: 0,
  } as CSSProperties,
  rangeSlider: {
    flex: 1,
    height: '6px',
    minWidth: 0,
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  rangeValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
    width: '32px',
    textAlign: 'right',
    flexShrink: 0,
  } as CSSProperties,
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generates CSS gradient string for preview
 */
function getGradientPreviewCSS(gradient: GradientValue): string {
  if (!gradient.stops || gradient.stops.length === 0) {
    return 'linear-gradient(90deg, #ccc 0%, #999 100%)'
  }

  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position)
  const stopsCSS = sortedStops
    .map((stop) => {
      const color = colorValueToCSS(stop.color) || 'transparent'
      return `${color} ${stop.position}%`
    })
    .join(', ')

  if (gradient.type === 'radial') {
    const shape = gradient.radialShape || 'circle'
    const position = gradient.radialPosition || 'center'
    return `radial-gradient(${shape} at ${position}, ${stopsCSS})`
  }

  return `linear-gradient(${gradient.angle}deg, ${stopsCSS})`
}

// =============================================================================
// GradientStopEditor Component
// =============================================================================

interface GradientStopEditorProps {
  stop: GradientStop
  index: number
  canDelete: boolean
  onColorChange: (index: number, color: ColorValue) => void
  onPositionChange: (index: number, position: number) => void
  onDelete: (index: number) => void
  readOnly?: boolean
}

function GradientStopEditorInner({
  stop,
  index,
  canDelete,
  onColorChange,
  onPositionChange,
  onDelete,
  readOnly,
}: GradientStopEditorProps) {
  const [hexInput, setHexInput] = useState(stop.color.hex)

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHex = e.target.value
      setHexInput(newHex)
      onColorChange(index, { ...stop.color, hex: newHex })
    },
    [index, stop.color, onColorChange]
  )

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      setHexInput(input)

      // Validate hex format
      const clean = input.replace(/^#/, '')
      if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
        onColorChange(index, { ...stop.color, hex: `#${clean.toLowerCase()}` })
      }
    },
    [index, stop.color, onColorChange]
  )

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newOpacity = parseInt(e.target.value, 10)
      onColorChange(index, { ...stop.color, opacity: newOpacity })
    },
    [index, stop.color, onColorChange]
  )

  const handlePositionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPosition = parseInt(e.target.value, 10)
      onPositionChange(index, Math.max(0, Math.min(100, newPosition)))
    },
    [index, onPositionChange]
  )

  const previewColor = colorValueToCSS(stop.color) || 'transparent'
  const opacity = stop.color.opacity ?? 100

  return (
    <div style={styles.stopItem as CSSProperties}>
      {/* Row 1: Color picker + hex input + preview swatch + delete */}
      <div style={styles.stopRow}>
        {/* Color picker */}
        <input
          type="color"
          value={stop.color.hex}
          onChange={handleColorPickerChange}
          disabled={readOnly}
          style={styles.colorPicker}
        />

        {/* Hex input */}
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          placeholder="#000000"
          disabled={readOnly}
          style={styles.hexInput}
        />

        {/* Preview swatch with checkerboard for transparency */}
        <div
          style={styles.swatch as CSSProperties}
          title={`${previewColor} at ${opacity}% opacity`}
        >
          <div style={styles.checkerboard as CSSProperties} />
          <div style={{ ...styles.colorOverlay as CSSProperties, backgroundColor: previewColor }} />
        </div>

        {/* Spacer */}
        <div style={styles.spacer} />

        {/* Delete button */}
        {canDelete && !readOnly && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            style={styles.deleteButton}
            title="Remove stop"
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Row 2: Position slider */}
      <div style={styles.stopRow}>
        <label style={styles.stopLabel}>Pos</label>
        <input
          type="range"
          min="0"
          max="100"
          value={stop.position}
          onChange={handlePositionChange}
          disabled={readOnly}
          style={styles.rangeSlider}
        />
        <span style={styles.rangeValue as CSSProperties}>
          {stop.position}%
        </span>
      </div>

      {/* Row 3: Opacity slider */}
      <div style={styles.stopRow}>
        <label style={styles.stopLabel}>Alpha</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={handleOpacityChange}
          disabled={readOnly}
          style={styles.rangeSlider}
        />
        <span style={styles.rangeValue as CSSProperties}>
          {opacity}%
        </span>
      </div>
    </div>
  )
}

const GradientStopEditor = memo(GradientStopEditorInner)

// =============================================================================
// GradientEditor Component
// =============================================================================

function GradientEditorInner({ value, onChange, readOnly }: GradientEditorProps) {
  const currentValue = value || DEFAULT_GRADIENT

  // Handle gradient type change
  const handleTypeChange = useCallback(
    (type: 'linear' | 'radial') => {
      onChange({ ...currentValue, type })
    },
    [currentValue, onChange]
  )

  // Handle angle change
  const handleAngleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const angle = parseInt(e.target.value, 10)
      onChange({ ...currentValue, angle })
    },
    [currentValue, onChange]
  )

  // Handle radial shape change
  const handleRadialShapeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...currentValue, radialShape: e.target.value as 'circle' | 'ellipse' })
    },
    [currentValue, onChange]
  )

  // Handle radial position change
  const handleRadialPositionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...currentValue, radialPosition: e.target.value as GradientValue['radialPosition'] })
    },
    [currentValue, onChange]
  )

  // Handle stop color change
  const handleStopColorChange = useCallback(
    (index: number, color: ColorValue) => {
      const newStops = [...currentValue.stops]
      newStops[index] = { ...newStops[index], color }
      onChange({ ...currentValue, stops: newStops })
    },
    [currentValue, onChange]
  )

  // Handle stop position change
  const handleStopPositionChange = useCallback(
    (index: number, position: number) => {
      const newStops = [...currentValue.stops]
      newStops[index] = { ...newStops[index], position }
      onChange({ ...currentValue, stops: newStops })
    },
    [currentValue, onChange]
  )

  // Handle add stop
  const handleAddStop = useCallback(() => {
    const newPosition = currentValue.stops.length > 0 ? 50 : 0
    const newStop: GradientStop = {
      color: { hex: '#888888', opacity: 100 },
      position: newPosition,
    }
    onChange({ ...currentValue, stops: [...currentValue.stops, newStop] })
  }, [currentValue, onChange])

  // Handle delete stop
  const handleDeleteStop = useCallback(
    (index: number) => {
      const newStops = currentValue.stops.filter((_, i) => i !== index)
      onChange({ ...currentValue, stops: newStops })
    },
    [currentValue, onChange]
  )

  const previewCSS = getGradientPreviewCSS(currentValue)
  const canDeleteStops = currentValue.stops.length > 2

  return (
    <div style={styles.container as CSSProperties}>
      {/* Gradient Preview */}
      <div style={{ ...styles.preview, background: previewCSS }} />

      {/* Type Selector */}
      <div style={styles.row}>
        <label style={styles.label}>Type</label>
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => handleTypeChange('linear')}
            disabled={readOnly}
            style={currentValue.type === 'linear' ? styles.buttonActive : styles.button}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('radial')}
            disabled={readOnly}
            style={currentValue.type === 'radial' ? styles.buttonActive : styles.button}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Linear Options: Angle */}
      {currentValue.type === 'linear' && (
        <div style={styles.row}>
          <label style={styles.label}>Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={currentValue.angle}
            onChange={handleAngleChange}
            disabled={readOnly}
            style={styles.slider}
          />
          <span style={styles.sliderValue as CSSProperties}>
            {currentValue.angle}deg
          </span>
        </div>
      )}

      {/* Radial Options: Shape & Position */}
      {currentValue.type === 'radial' && (
        <>
          <div style={styles.row}>
            <label style={styles.label}>Shape</label>
            <select
              value={currentValue.radialShape || 'circle'}
              onChange={handleRadialShapeChange}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="circle">Circle</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Position</label>
            <select
              value={currentValue.radialPosition || 'center'}
              onChange={handleRadialPositionChange}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* Color Stops */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={styles.stopsHeader}>
          <label style={styles.label}>Color Stops</label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddStop}
              style={styles.addButton}
            >
              <Plus style={{ width: '12px', height: '12px' }} />
              Add Stop
            </button>
          )}
        </div>
        <div style={styles.stopsList as CSSProperties}>
          {currentValue.stops.map((stop, index) => (
            <GradientStopEditor
              key={index}
              stop={stop}
              index={index}
              canDelete={canDeleteStops}
              onColorChange={handleStopColorChange}
              onPositionChange={handleStopPositionChange}
              onDelete={handleDeleteStop}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const GradientEditor = memo(GradientEditorInner)
