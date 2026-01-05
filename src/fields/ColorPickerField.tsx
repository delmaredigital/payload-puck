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

import React, { useState, useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { IconX } from '@tabler/icons-react'
import type { ColorValue } from './shared'
import { useTheme } from '../theme'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

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
    <div className="puck-field space-y-3">
      {label && (
        <Label className="block text-foreground">
          {label}
        </Label>
      )}

      {/* Color picker and hex input row */}
      <div className="flex items-center gap-3">
        {/* Native color picker */}
        <div className="relative">
          <input
            type="color"
            value={value?.hex || '#000000'}
            onChange={handleColorChange}
            disabled={readOnly}
            className="w-10 h-10 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{ padding: 0 }}
          />
        </div>

        {/* Hex input */}
        <div className="flex-1">
          <Input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            placeholder="#000000"
            disabled={readOnly}
            className="font-mono text-sm"
          />
        </div>

        {/* Preview swatch with checkerboard for transparency */}
        <div
          className="w-10 h-10 rounded-md border border-input flex-shrink-0 relative overflow-hidden"
          title={value?.hex ? `${value.hex} at ${value.opacity ?? 100}% opacity` : 'No color selected'}
        >
          {/* Checkerboard background (always visible for transparency) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              backgroundColor: '#f0f0f0',
            }}
          />
          {/* Color overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: previewColor }}
          />
        </div>

        {/* Clear button */}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear color"
            className="flex items-center justify-center w-8 h-8 rounded border-none bg-transparent cursor-pointer text-muted-foreground flex-shrink-0 hover:bg-accent hover:text-destructive"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Opacity slider */}
      {showOpacity && value?.hex && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <span className="text-xs text-muted-foreground font-mono">{value.opacity ?? 100}%</span>
          </div>
          {/* Custom opacity slider with checkerboard + color gradient */}
          <div className="relative h-3 rounded-md overflow-hidden border border-input">
            {/* Checkerboard background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                backgroundColor: '#f0f0f0',
              }}
            />
            {/* Color gradient from transparent to solid */}
            <div
              className="absolute inset-0"
              style={{
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              style={{ margin: 0 }}
            />
            {/* Thumb indicator */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white border border-gray-400 rounded-sm shadow-sm pointer-events-none"
              style={{
                left: `calc(${value.opacity ?? 100}% - 2px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Preset swatches */}
      {resolvedPresets.length > 0 && !readOnly && (
        <div>
          <Label className="block text-xs mt-1 mb-2 text-muted-foreground">
            Presets
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {resolvedPresets.map((preset) => {
              const isSelected = value?.hex?.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "w-6 h-6 rounded cursor-pointer p-0 outline-none border",
                    isSelected
                      ? "border-2 border-ring ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "border-border"
                  )}
                  style={{ backgroundColor: preset.hex }}
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
