'use client'

/**
 * TransformField - Custom Puck field for CSS transforms
 *
 * This component provides:
 * - Live preview of transform effect
 * - Rotate slider (-360 to 360)
 * - Scale X/Y with link/unlink toggle
 * - Skew X/Y sliders
 * - Translate X/Y inputs with unit selector
 * - Transform origin 3x3 grid selector
 * - Collapsible 3D section (perspective, rotateX, rotateY)
 */

import React, { useCallback, memo, useState } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconLink,
  IconLinkOff,
  IconRotate,
  IconResize,
  IconX,
  IconChevronDown,
  IconChevronRight,
  Icon3dCubeSphere,
} from '@tabler/icons-react'
import type { TransformValue, TransformOrigin } from './shared'
import { DEFAULT_TRANSFORM, transformValueToCSS } from './shared'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
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

interface TransformFieldProps {
  value: TransformValue | null
  onChange: (value: TransformValue | null) => void
  label?: string
  readOnly?: boolean
}

type TranslateUnit = 'px' | 'rem' | '%'

// =============================================================================
// Origin Grid Component
// =============================================================================

interface OriginGridProps {
  value: TransformOrigin
  onChange: (origin: TransformOrigin) => void
  disabled?: boolean
}

const ORIGIN_POSITIONS: Array<{ value: TransformOrigin; row: number; col: number }> = [
  { value: 'top-left', row: 0, col: 0 },
  { value: 'top', row: 0, col: 1 },
  { value: 'top-right', row: 0, col: 2 },
  { value: 'left', row: 1, col: 0 },
  { value: 'center', row: 1, col: 1 },
  { value: 'right', row: 1, col: 2 },
  { value: 'bottom-left', row: 2, col: 0 },
  { value: 'bottom', row: 2, col: 1 },
  { value: 'bottom-right', row: 2, col: 2 },
]

function OriginGrid({ value, onChange, disabled }: OriginGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 w-fit">
      {ORIGIN_POSITIONS.map(({ value: origin }) => {
        const isActive = value === origin
        return (
          <button
            key={origin}
            type="button"
            onClick={() => onChange(origin)}
            disabled={disabled}
            className={cn(
              'w-6 h-6 rounded border transition-colors',
              isActive
                ? 'bg-primary border-primary'
                : 'bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={origin}
          >
            <span
              className={cn(
                'block w-2 h-2 rounded-full mx-auto',
                isActive ? 'bg-primary-foreground' : 'bg-muted-foreground/30'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Slider Input Component (custom range input)
// =============================================================================

interface SliderInputProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
  label?: string
  unit?: string
}

function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  label,
  unit = '',
}: SliderInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {label}
          </Label>
          <span className="text-xs font-mono text-muted-foreground">
            {value}{unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
          'accent-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  )
}

// =============================================================================
// TransformField Component
// =============================================================================

function TransformFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: TransformFieldProps) {
  const [show3D, setShow3D] = useState(value?.enable3D ?? false)

  // Use default if no value
  const currentValue = value || DEFAULT_TRANSFORM

  // Handle individual value changes
  const handleChange = useCallback(
    <K extends keyof TransformValue>(key: K, newValue: TransformValue[K]) => {
      onChange({
        ...currentValue,
        [key]: newValue,
      })
    },
    [currentValue, onChange]
  )

  // Handle scale change with locking
  const handleScaleChange = useCallback(
    (axis: 'scaleX' | 'scaleY', newValue: number) => {
      if (currentValue.scaleLocked) {
        onChange({
          ...currentValue,
          scaleX: newValue,
          scaleY: newValue,
        })
      } else {
        onChange({
          ...currentValue,
          [axis]: newValue,
        })
      }
    },
    [currentValue, onChange]
  )

  // Handle scale lock toggle
  const handleScaleLockToggle = useCallback(() => {
    if (!currentValue.scaleLocked) {
      // When locking, sync both to X value
      onChange({
        ...currentValue,
        scaleLocked: true,
        scaleY: currentValue.scaleX,
      })
    } else {
      onChange({
        ...currentValue,
        scaleLocked: false,
      })
    }
  }, [currentValue, onChange])

  // Handle 3D toggle
  const handle3DToggle = useCallback(
    (enabled: boolean) => {
      setShow3D(enabled)
      onChange({
        ...currentValue,
        enable3D: enabled,
      })
    },
    [currentValue, onChange]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Get preview styles
  const previewStyles = transformValueToCSS(currentValue) || {}

  return (
    <div className="puck-field space-y-4">
      {/* Header */}
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
            title="Reset transform"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Live Preview */}
      <div className="h-24 bg-muted/30 rounded-md border border-border flex items-center justify-center overflow-hidden">
        <div
          className="w-12 h-12 bg-primary/80 rounded-md flex items-center justify-center text-primary-foreground text-xs font-medium transition-transform duration-200"
          style={previewStyles}
        >
          Aa
        </div>
      </div>

      {/* Rotate */}
      <div className="space-y-2 p-3 bg-muted/30 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <IconRotate className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium">Rotate</Label>
        </div>
        <SliderInput
          value={currentValue.rotate}
          onChange={(v) => handleChange('rotate', v)}
          min={-360}
          max={360}
          disabled={readOnly}
          unit="deg"
        />
      </div>

      {/* Scale */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconResize className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs font-medium">Scale</Label>
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant={currentValue.scaleLocked ? 'default' : 'outline'}
              size="icon-sm"
              onClick={handleScaleLockToggle}
              className="h-6 w-6"
              title={
                currentValue.scaleLocked
                  ? 'Click to unlink X and Y scale'
                  : 'Click to link X and Y scale'
              }
            >
              {currentValue.scaleLocked ? (
                <IconLink className="h-3 w-3" />
              ) : (
                <IconLinkOff className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        <div className={cn('grid gap-3', currentValue.scaleLocked ? 'grid-cols-1' : 'grid-cols-2')}>
          <SliderInput
            label={currentValue.scaleLocked ? 'Scale' : 'Scale X'}
            value={currentValue.scaleX}
            onChange={(v) => handleScaleChange('scaleX', v)}
            min={0.1}
            max={3}
            step={0.1}
            disabled={readOnly}
          />
          {!currentValue.scaleLocked && (
            <SliderInput
              label="Scale Y"
              value={currentValue.scaleY}
              onChange={(v) => handleScaleChange('scaleY', v)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={readOnly}
            />
          )}
        </div>
      </div>

      {/* Skew */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-md">
        <Label className="text-xs font-medium">Skew</Label>
        <div className="grid grid-cols-2 gap-3">
          <SliderInput
            label="Skew X"
            value={currentValue.skewX}
            onChange={(v) => handleChange('skewX', v)}
            min={-45}
            max={45}
            disabled={readOnly}
            unit="deg"
          />
          <SliderInput
            label="Skew Y"
            value={currentValue.skewY}
            onChange={(v) => handleChange('skewY', v)}
            min={-45}
            max={45}
            disabled={readOnly}
            unit="deg"
          />
        </div>
      </div>

      {/* Translate */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-md">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Translate</Label>
          <Select
            value={currentValue.translateUnit}
            onValueChange={(v) => handleChange('translateUnit', v as TranslateUnit)}
            disabled={readOnly}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              X
            </Label>
            <Input
              type="number"
              value={currentValue.translateX}
              onChange={(e) =>
                handleChange('translateX', parseFloat(e.target.value) || 0)
              }
              disabled={readOnly}
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Y
            </Label>
            <Input
              type="number"
              value={currentValue.translateY}
              onChange={(e) =>
                handleChange('translateY', parseFloat(e.target.value) || 0)
              }
              disabled={readOnly}
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Transform Origin */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-md">
        <Label className="text-xs font-medium">Transform Origin</Label>
        <div className="flex items-center gap-4">
          <OriginGrid
            value={currentValue.origin}
            onChange={(v) => handleChange('origin', v)}
            disabled={readOnly}
          />
          <span className="text-xs text-muted-foreground capitalize">
            {currentValue.origin.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* 3D Section (Collapsible) */}
      <div className="border border-border rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setShow3D(!show3D)}
          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon3dCubeSphere className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs font-medium cursor-pointer">3D Transforms</Label>
          </div>
          {show3D ? (
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {show3D && (
          <div className="p-3 space-y-3 border-t border-border">
            {/* Enable 3D checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="enable3d"
                checked={currentValue.enable3D}
                onCheckedChange={(checked) =>
                  handle3DToggle(checked === true)
                }
                disabled={readOnly}
              />
              <Label
                htmlFor="enable3d"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Enable 3D Transforms
              </Label>
            </div>

            {currentValue.enable3D && (
              <>
                {/* Perspective */}
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Perspective (px)
                  </Label>
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    value={currentValue.perspective ?? 1000}
                    onChange={(e) =>
                      handleChange('perspective', parseInt(e.target.value, 10) || 1000)
                    }
                    disabled={readOnly}
                    className="h-8 text-sm font-mono"
                  />
                </div>

                {/* Rotate X/Y */}
                <div className="grid grid-cols-2 gap-3">
                  <SliderInput
                    label="Rotate X"
                    value={currentValue.rotateX ?? 0}
                    onChange={(v) => handleChange('rotateX', v)}
                    min={-180}
                    max={180}
                    disabled={readOnly}
                    unit="deg"
                  />
                  <SliderInput
                    label="Rotate Y"
                    value={currentValue.rotateY ?? 0}
                    onChange={(v) => handleChange('rotateY', v)}
                    min={-180}
                    max={180}
                    disabled={readOnly}
                    unit="deg"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const TransformField = memo(TransformFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for CSS transforms
 */
export function createTransformField(config: {
  label?: string
}): CustomField<TransformValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <TransformField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
