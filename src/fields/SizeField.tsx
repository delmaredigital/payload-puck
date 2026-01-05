'use client'

/**
 * SizeField - Custom Puck field for button/element sizing
 *
 * Provides preset size options (sm, default, lg) with a "custom" mode
 * that reveals detailed controls for height, padding, and font size.
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { IconX } from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

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

  // Handle mode change
  const handleModeChange = useCallback((mode: SizeMode) => {
    if (mode === 'custom') {
      // Initialize custom values when switching to custom
      onChange({
        mode,
        ...CUSTOM_DEFAULTS,
      })
    } else {
      onChange({ mode })
    }
  }, [onChange])

  // Handle numeric value changes
  const handleValueChange = useCallback((
    field: 'height' | 'paddingX' | 'paddingY' | 'fontSize',
    val: number
  ) => {
    onChange({
      ...currentValue,
      [field]: val,
    })
  }, [currentValue, onChange])

  // Handle unit change
  const handleUnitChange = useCallback((unit: SizeUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  // Handle clear
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
    <div className="puck-field space-y-3">
      {/* Header with label and clear */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Size mode selector */}
      <div className="flex flex-wrap gap-1">
        {presets.map(({ mode, label: modeLabel }) => {
          const isActive = currentValue.mode === mode
          return (
            <Button
              key={mode}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleModeChange(mode)}
              disabled={readOnly}
              className={cn(
                "text-xs",
                isActive && "bg-primary hover:bg-primary/90"
              )}
            >
              {modeLabel}
            </Button>
          )
        })}
      </div>

      {/* Custom size controls */}
      {currentValue.mode === 'custom' && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-md">
          {/* Unit selector */}
          <div className="flex items-center gap-2">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground flex-shrink-0">
              Unit:
            </Label>
            <div className="flex gap-1">
              {(['px', 'rem'] as SizeUnit[]).map((unit) => {
                const isActive = (currentValue.unit || 'px') === unit
                return (
                  <Button
                    key={unit}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUnitChange(unit)}
                    disabled={readOnly}
                    className={cn(
                      "text-xs font-mono h-7 px-2",
                      isActive && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {unit}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Numeric inputs */}
          <div className="grid grid-cols-2 gap-2">
            {showHeight && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Height
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={currentValue.height ?? CUSTOM_DEFAULTS.height}
                  onChange={(e) => handleValueChange('height', parseInt(e.target.value, 10) || 0)}
                  disabled={readOnly}
                  className="h-8 text-sm font-mono"
                />
              </div>
            )}

            {showFontSize && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Font Size
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={currentValue.fontSize ?? CUSTOM_DEFAULTS.fontSize}
                  onChange={(e) => handleValueChange('fontSize', parseInt(e.target.value, 10) || 0)}
                  disabled={readOnly}
                  className="h-8 text-sm font-mono"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Padding X
              </Label>
              <Input
                type="number"
                min={0}
                value={currentValue.paddingX ?? CUSTOM_DEFAULTS.paddingX}
                onChange={(e) => handleValueChange('paddingX', parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                className="h-8 text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Padding Y
              </Label>
              <Input
                type="number"
                min={0}
                value={currentValue.paddingY ?? CUSTOM_DEFAULTS.paddingY}
                onChange={(e) => handleValueChange('paddingY', parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>

          {/* Preview summary */}
          <div className="text-xs text-muted-foreground font-mono pt-1 border-t border-border/50">
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
 *
 * For preset modes, returns undefined (use Tailwind classes instead)
 * For custom mode, returns inline styles
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
 * Returns empty string for custom mode (use inline styles instead)
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
 *
 * @example
 * ```ts
 * fields: {
 *   size: createSizeField({ label: 'Button Size' }),
 * }
 * ```
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
