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

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconX,
  IconBorderTop,
  IconBorderRight,
  IconBorderBottom,
  IconBorderLeft,
} from '@tabler/icons-react'
import { ColorPickerField } from './ColorPickerField'
import type { BorderValue, ColorValue } from './shared'
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
  const handleStyleChange = useCallback((newStyle: BorderStyle) => {
    onChange({
      ...currentValue,
      style: newStyle,
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

  return (
    <div className="puck-field space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <Label className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Clear border"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Border preview */}
      <div
        className="h-16 bg-muted/50 rounded flex items-center justify-center"
        style={{
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
        <span className="text-xs text-muted-foreground">Preview</span>
      </div>

      {/* Width and Style row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Width */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Width (px)</Label>
          <Input
            type="number"
            min={0}
            max={20}
            value={currentValue.width}
            onChange={handleWidthChange}
            disabled={readOnly}
            className="h-8 text-sm font-mono"
          />
        </div>

        {/* Style */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Style</Label>
          <Select
            value={currentValue.style}
            onValueChange={(val) => handleStyleChange(val as BorderStyle)}
            disabled={readOnly}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Radius */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Radius (px)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={currentValue.radius}
          onChange={handleRadiusChange}
          disabled={readOnly}
          className="h-8 text-sm font-mono"
        />
      </div>

      {/* Color */}
      <div className="space-y-1">
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
      </div>

      {/* Per-side toggles */}
      {!readOnly && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Sides</Label>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant={currentValue.sides.top ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleSideToggle('top')}
              className={cn(
                "h-8 w-8",
                currentValue.sides.top && "bg-primary hover:bg-primary/90"
              )}
              title="Top border"
            >
              <IconBorderTop className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={currentValue.sides.right ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleSideToggle('right')}
              className={cn(
                "h-8 w-8",
                currentValue.sides.right && "bg-primary hover:bg-primary/90"
              )}
              title="Right border"
            >
              <IconBorderRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={currentValue.sides.bottom ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleSideToggle('bottom')}
              className={cn(
                "h-8 w-8",
                currentValue.sides.bottom && "bg-primary hover:bg-primary/90"
              )}
              title="Bottom border"
            >
              <IconBorderBottom className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={currentValue.sides.left ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleSideToggle('left')}
              className={cn(
                "h-8 w-8",
                currentValue.sides.left && "bg-primary hover:bg-primary/90"
              )}
              title="Left border"
            >
              <IconBorderLeft className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
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
