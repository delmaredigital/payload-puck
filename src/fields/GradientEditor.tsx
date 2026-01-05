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

import React, { useCallback, memo, useState } from 'react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import type { GradientValue, GradientStop, ColorValue } from './shared'
import { colorValueToCSS } from './shared'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { cn } from '../lib/utils'

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
    <div className="space-y-2 p-2 bg-muted/30 rounded-md overflow-hidden">
      {/* Row 1: Color picker + hex input + preview swatch + delete */}
      <div className="flex items-center gap-2">
        {/* Color picker */}
        <input
          type="color"
          value={stop.color.hex}
          onChange={handleColorPickerChange}
          disabled={readOnly}
          className="w-7 h-7 rounded border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
          style={{ padding: 0 }}
        />

        {/* Hex input */}
        <Input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          placeholder="#000000"
          disabled={readOnly}
          className="w-20 min-w-0 h-7 text-xs font-mono px-1.5"
        />

        {/* Preview swatch with checkerboard for transparency */}
        <div
          className="w-7 h-7 rounded border border-input flex-shrink-0 relative overflow-hidden"
          title={`${previewColor} at ${opacity}% opacity`}
        >
          {/* Checkerboard background for transparency preview */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          />
          {/* Color overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: previewColor }} />
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Delete button */}
        {canDelete && !readOnly && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded flex-shrink-0"
            title="Remove stop"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Row 2: Position slider */}
      <div className="flex items-center gap-2 min-w-0">
        <Label className="text-xs text-muted-foreground w-12 flex-shrink-0">Pos</Label>
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max="100"
            value={stop.position}
            onChange={handlePositionChange}
            disabled={readOnly}
            className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono w-8 text-right flex-shrink-0">
          {stop.position}%
        </span>
      </div>

      {/* Row 3: Opacity slider */}
      <div className="flex items-center gap-2 min-w-0">
        <Label className="text-xs text-muted-foreground w-12 flex-shrink-0">Alpha</Label>
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={handleOpacityChange}
            disabled={readOnly}
            className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono w-8 text-right flex-shrink-0">
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
    (shape: 'circle' | 'ellipse') => {
      onChange({ ...currentValue, radialShape: shape })
    },
    [currentValue, onChange]
  )

  // Handle radial position change
  const handleRadialPositionChange = useCallback(
    (position: GradientValue['radialPosition']) => {
      onChange({ ...currentValue, radialPosition: position })
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
    <div className="space-y-4">
      {/* Gradient Preview */}
      <div
        className="h-12 rounded-md border border-input"
        style={{ background: previewCSS }}
      />

      {/* Type Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground w-12">Type</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={currentValue.type === 'linear' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('linear')}
            disabled={readOnly}
            className="text-xs h-7 px-3"
          >
            Linear
          </Button>
          <Button
            type="button"
            variant={currentValue.type === 'radial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('radial')}
            disabled={readOnly}
            className="text-xs h-7 px-3"
          >
            Radial
          </Button>
        </div>
      </div>

      {/* Linear Options: Angle */}
      {currentValue.type === 'linear' && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-12">Angle</Label>
          <input
            type="range"
            min="0"
            max="360"
            value={currentValue.angle}
            onChange={handleAngleChange}
            disabled={readOnly}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">
            {currentValue.angle}deg
          </span>
        </div>
      )}

      {/* Radial Options: Shape & Position */}
      {currentValue.type === 'radial' && (
        <>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-12">Shape</Label>
            <Select
              value={currentValue.radialShape || 'circle'}
              onValueChange={(value) => handleRadialShapeChange(value as 'circle' | 'ellipse')}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-12">Position</Label>
            <Select
              value={currentValue.radialPosition || 'center'}
              onValueChange={(value) =>
                handleRadialPositionChange(value as GradientValue['radialPosition'])
              }
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Color Stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Color Stops</Label>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStop}
              className="h-6 text-xs px-2"
            >
              <IconPlus className="w-3 h-3 mr-1" />
              Add Stop
            </Button>
          )}
        </div>
        <div className="space-y-2">
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
