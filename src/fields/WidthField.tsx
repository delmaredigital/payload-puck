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

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconX,
  IconLayoutAlignLeft,
  IconLayoutAlignCenter,
  IconLayoutAlignRight,
  IconArrowsHorizontal,
  IconContainer,
  IconAdjustments,
} from '@tabler/icons-react'
import type { WidthValue } from './shared'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

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
// WidthField Component
// =============================================================================

function WidthFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: WidthFieldProps) {
  // Use default if no value
  const currentValue = value || DEFAULT_VALUE

  // Handle mode change
  const handleModeChange = useCallback((mode: WidthMode) => {
    if (mode === 'full') {
      onChange({
        ...currentValue,
        mode,
        alignment: 'center', // Full width typically centered
      })
    } else {
      onChange({
        ...currentValue,
        mode,
      })
    }
  }, [currentValue, onChange])

  // Handle max width change
  const handleMaxWidthChange = useCallback((maxWidth: number) => {
    onChange({
      ...currentValue,
      maxWidth,
    })
  }, [currentValue, onChange])

  // Handle unit change
  const handleUnitChange = useCallback((unit: WidthUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  // Handle alignment change
  const handleAlignmentChange = useCallback((alignment: ContentAlignment) => {
    onChange({
      ...currentValue,
      alignment,
    })
  }, [currentValue, onChange])

  // Handle preset selection
  const handlePresetSelect = useCallback((presetValue: number) => {
    onChange({
      ...currentValue,
      mode: 'contained',
      maxWidth: presetValue,
      unit: 'px',
    })
  }, [currentValue, onChange])

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Mode button labels (shorter for space)
  const modeLabels: Record<WidthMode, string> = {
    full: 'Full',
    contained: 'Contain',
    custom: 'Custom',
  }

  return (
    <div className="puck-field space-y-3">
      {/* Header with label and clear */}
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
            title="Reset to default"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Width Mode Selector - segmented control */}
      <div className="flex flex-wrap gap-1">
        {([
          { mode: 'full' as WidthMode, icon: IconArrowsHorizontal, title: 'Full width (100%)' },
          { mode: 'contained' as WidthMode, icon: IconContainer, title: 'Contained (centered with max-width)' },
          { mode: 'custom' as WidthMode, icon: IconAdjustments, title: 'Custom width settings' },
        ]).map(({ mode, icon: Icon, title }) => {
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
                "text-xs gap-1",
                isActive && "bg-primary hover:bg-primary/90"
              )}
              title={title}
            >
              <Icon className="h-3.5 w-3.5" />
              {modeLabels[mode]}
            </Button>
          )
        })}
      </div>

      {/* Max Width Controls (shown for contained and custom modes) */}
      {currentValue.mode !== 'full' && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-md">
          {/* Preset Quick Selects */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Presets</Label>
            <div className="flex flex-wrap gap-1">
              {WIDTH_PRESETS.map((preset) => {
                const isActive = currentValue.maxWidth === preset.value && currentValue.unit === 'px'
                return (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePresetSelect(preset.value)}
                    disabled={readOnly}
                    className={cn(
                      "text-xs h-7 px-3",
                      isActive && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Custom Width Input */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Max Width</Label>
            <div className="flex items-center flex-wrap gap-2">
              <Input
                type="number"
                min={0}
                value={currentValue.maxWidth}
                onChange={(e) => handleMaxWidthChange(parseInt(e.target.value, 10) || 0)}
                disabled={readOnly}
                className="h-8 text-sm font-mono flex-1 min-w-[80px]"
              />
              {/* Unit Selector */}
              <div className="flex flex-shrink-0 gap-1">
                {(['px', '%', 'rem', 'vw'] as WidthUnit[]).map((unit) => {
                  const isActive = currentValue.unit === unit
                  return (
                    <Button
                      key={unit}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUnitChange(unit)}
                      disabled={readOnly}
                      className={cn(
                        "text-xs font-mono h-8 px-2",
                        isActive && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {unit}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground flex-shrink-0">Align:</Label>
          <div className="flex gap-1">
            {([
              { alignment: 'left' as ContentAlignment, icon: IconLayoutAlignLeft, title: 'Align left' },
              { alignment: 'center' as ContentAlignment, icon: IconLayoutAlignCenter, title: 'Align center' },
              { alignment: 'right' as ContentAlignment, icon: IconLayoutAlignRight, title: 'Align right' },
            ]).map(({ alignment, icon: Icon, title }) => {
              const isActive = currentValue.alignment === alignment
              const isDisabled = readOnly || currentValue.mode === 'full'
              return (
                <Button
                  key={alignment}
                  type="button"
                  variant={isActive ? 'default' : 'secondary'}
                  size="icon"
                  onClick={() => handleAlignmentChange(alignment)}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8",
                    isActive && "bg-primary hover:bg-primary/90"
                  )}
                  title={title}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              )
            })}
          </div>
        </div>
        {/* Current value summary */}
        <span className="text-xs text-muted-foreground font-mono">
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
