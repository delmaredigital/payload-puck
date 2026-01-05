'use client'

/**
 * ResponsiveVisibilityField - Show/hide elements at different breakpoints
 *
 * Provides a compact visual interface for toggling element visibility
 * at each breakpoint (base, sm, md, lg, xl). Similar to Divi/Elementor
 * visibility controls.
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceLaptop,
  IconDeviceDesktop,
  IconDevices,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'
import type { Breakpoint, VisibilityValue } from './shared'
import { BREAKPOINTS, DEFAULT_VISIBILITY } from './shared'

// =============================================================================
// Types
// =============================================================================

interface ResponsiveVisibilityFieldProps {
  value: VisibilityValue | null
  onChange: (value: VisibilityValue | null) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Breakpoint Icons
// =============================================================================

const BREAKPOINT_ICONS: Record<Breakpoint, React.ComponentType<{ className?: string }>> = {
  base: IconDevices,
  sm: IconDeviceMobile,
  md: IconDeviceTablet,
  lg: IconDeviceLaptop,
  xl: IconDeviceDesktop,
}

// =============================================================================
// Visibility Toggle Button
// =============================================================================

interface VisibilityToggleProps {
  breakpoint: Breakpoint
  label: string
  minWidth: number | null
  isVisible: boolean
  isInherited: boolean
  onClick: () => void
  disabled?: boolean
}

function VisibilityToggle({
  breakpoint,
  label,
  minWidth,
  isVisible,
  isInherited,
  onClick,
  disabled,
}: VisibilityToggleProps) {
  const DeviceIcon = BREAKPOINT_ICONS[breakpoint]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${label}${minWidth ? ` (${minWidth}px+)` : ''}: ${isVisible ? 'Visible' : 'Hidden'}${isInherited ? ' (inherited)' : ''}`}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-md transition-all flex-1 min-w-[52px]',
        isVisible
          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30'
          : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30',
        isInherited && 'opacity-60',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <DeviceIcon className="h-4 w-4" />
      <span className="text-[10px] font-medium">{label}</span>
      {/* Visibility icon overlay */}
      <div className="absolute top-1 right-1">
        {isVisible ? (
          <IconEye className="h-3 w-3" />
        ) : (
          <IconEyeOff className="h-3 w-3" />
        )}
      </div>
      {/* Inherited indicator */}
      {isInherited && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground">
          •
        </span>
      )}
    </button>
  )
}

// =============================================================================
// ResponsiveVisibilityField Component
// =============================================================================

function ResponsiveVisibilityFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: ResponsiveVisibilityFieldProps) {
  // Get effective visibility for a breakpoint (with cascade)
  const getEffectiveVisibility = useCallback(
    (breakpoint: Breakpoint): { visible: boolean; inherited: boolean } => {
      const val = value ?? DEFAULT_VISIBILITY

      if (breakpoint === 'base') {
        return { visible: val.base, inherited: false }
      }

      // Check if this breakpoint has an explicit value
      const explicitValue = val[breakpoint]
      if (explicitValue !== undefined) {
        return { visible: explicitValue, inherited: false }
      }

      // Cascade down to find the nearest defined value
      const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'base']
      const currentIndex = breakpointOrder.indexOf(breakpoint)

      for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i]
        const bpValue = val[bp]
        if (bpValue !== undefined) {
          return { visible: bpValue, inherited: true }
        }
      }

      return { visible: val.base, inherited: true }
    },
    [value]
  )

  // Toggle visibility for a breakpoint
  const toggleVisibility = useCallback(
    (breakpoint: Breakpoint) => {
      const current = getEffectiveVisibility(breakpoint)
      const newVisible = !current.visible

      if (breakpoint === 'base') {
        onChange({
          ...(value ?? DEFAULT_VISIBILITY),
          base: newVisible,
        })
      } else {
        // For non-base breakpoints, set explicit override
        const newValue: VisibilityValue = {
          ...(value ?? DEFAULT_VISIBILITY),
          [breakpoint]: newVisible,
        }
        onChange(newValue)
      }
    },
    [value, onChange, getEffectiveVisibility]
  )

  // Count how many breakpoints have explicit overrides
  const overrideCount = value
    ? (['sm', 'md', 'lg', 'xl'] as Breakpoint[]).filter((bp) => value[bp] !== undefined).length
    : 0

  // Check if any breakpoint is hidden
  const hasHiddenBreakpoints = BREAKPOINTS.some((bp) => {
    const { visible } = getEffectiveVisibility(bp.key)
    return !visible
  })

  return (
    <div className="puck-field space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            {overrideCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {overrideCount} override{overrideCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        {hasHiddenBreakpoints && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <IconEyeOff className="h-3 w-3" />
            Hidden
          </span>
        )}
      </div>

      {/* Visibility Grid */}
      <div className="flex gap-1">
        {BREAKPOINTS.map((bp) => {
          const { visible, inherited } = getEffectiveVisibility(bp.key)
          return (
            <VisibilityToggle
              key={bp.key}
              breakpoint={bp.key}
              label={bp.label}
              minWidth={bp.minWidth}
              isVisible={visible}
              isInherited={inherited}
              onClick={() => toggleVisibility(bp.key)}
              disabled={readOnly}
            />
          )
        })}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Click to toggle visibility. Changes cascade to larger breakpoints.
      </p>
    </div>
  )
}

export const ResponsiveVisibilityField = memo(ResponsiveVisibilityFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateResponsiveVisibilityFieldConfig {
  label?: string
}

/**
 * Creates a Puck custom field for responsive visibility control.
 *
 * @example
 * ```ts
 * fields: {
 *   visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
 * }
 * ```
 */
export function createResponsiveVisibilityField(
  config: CreateResponsiveVisibilityFieldConfig = {}
): CustomField<VisibilityValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <ResponsiveVisibilityField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
