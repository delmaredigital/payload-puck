'use client'

/**
 * ResponsiveField - Generic wrapper for breakpoint-specific field overrides
 *
 * This component wraps any existing field to provide responsive overrides
 * at different breakpoints (base, sm, md, lg, xl). It uses sparse storage,
 * only storing values for breakpoints that have explicit overrides.
 */

import React, { useState, useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceLaptop,
  IconDeviceDesktop,
  IconDevices,
  IconX,
} from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'
import type { Breakpoint, ResponsiveValue } from './shared'
import { BREAKPOINTS } from './shared'

// =============================================================================
// Types
// =============================================================================

interface ResponsiveFieldProps<T> {
  value: ResponsiveValue<T> | null
  onChange: (value: ResponsiveValue<T> | null) => void
  label?: string
  readOnly?: boolean
  /** Render function for the inner field */
  renderInnerField: (props: {
    value: T | null
    onChange: (v: T | null) => void
    readOnly?: boolean
  }) => React.ReactNode
  /** Default value for the base breakpoint */
  defaultValue?: T
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
// Breakpoint Tab Button
// =============================================================================

interface BreakpointTabProps {
  breakpoint: Breakpoint
  label: string
  minWidth: number | null
  isActive: boolean
  hasOverride: boolean
  onClick: () => void
  disabled?: boolean
}

function BreakpointTab({
  breakpoint,
  label,
  minWidth,
  isActive,
  hasOverride,
  onClick,
  disabled,
}: BreakpointTabProps) {
  const Icon = BREAKPOINT_ICONS[breakpoint]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={minWidth ? `${label} (${minWidth}px+)` : label}
      className={cn(
        'relative flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex-1',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
      {/* Override indicator dot */}
      {hasOverride && !isActive && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  )
}

// =============================================================================
// ResponsiveField Component
// =============================================================================

function ResponsiveFieldInner<T>({
  value,
  onChange,
  label,
  readOnly,
  renderInnerField,
  defaultValue,
}: ResponsiveFieldProps<T>) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('base')

  // Get the current value for the active breakpoint
  // Falls back through the cascade: active -> smaller breakpoints -> base -> default
  const getCurrentValue = useCallback((): T | null => {
    if (!value) return defaultValue ?? null

    // For base, just return base value
    if (activeBreakpoint === 'base') {
      return value.base ?? defaultValue ?? null
    }

    // For other breakpoints, return explicit override if set
    const override = value[activeBreakpoint]
    if (override !== undefined) {
      return override
    }

    // Otherwise cascade down to find the nearest defined value
    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'base']
    const activeIndex = breakpointOrder.indexOf(activeBreakpoint)

    for (let i = activeIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i]
      const val = value[bp]
      if (val !== undefined) {
        return val
      }
    }

    return defaultValue ?? null
  }, [value, activeBreakpoint, defaultValue])

  // Check if a breakpoint has an explicit override
  const hasOverride = useCallback(
    (breakpoint: Breakpoint): boolean => {
      if (!value) return false
      if (breakpoint === 'base') return value.base !== undefined
      return value[breakpoint] !== undefined
    },
    [value]
  )

  // Handle value change for the active breakpoint
  const handleInnerChange = useCallback(
    (newValue: T | null) => {
      if (activeBreakpoint === 'base') {
        // Base is required, so we always set it
        if (newValue === null && defaultValue !== undefined) {
          onChange({ ...value, base: defaultValue } as ResponsiveValue<T>)
        } else if (newValue !== null) {
          onChange({ ...value, base: newValue } as ResponsiveValue<T>)
        }
      } else {
        // For other breakpoints, set the override
        if (newValue === null) {
          // Remove the override
          const newResponsive = { ...value } as ResponsiveValue<T>
          delete newResponsive[activeBreakpoint]
          onChange(newResponsive)
        } else {
          // Ensure base exists
          const base = value?.base ?? defaultValue
          if (base === undefined) return
          onChange({
            ...value,
            base,
            [activeBreakpoint]: newValue,
          } as ResponsiveValue<T>)
        }
      }
    },
    [value, onChange, activeBreakpoint, defaultValue]
  )

  // Clear override for current breakpoint
  const handleClearOverride = useCallback(() => {
    if (activeBreakpoint === 'base' || !value) return

    const newResponsive = { ...value }
    delete newResponsive[activeBreakpoint]
    onChange(newResponsive)
  }, [value, onChange, activeBreakpoint])

  // Clear all values
  const handleClearAll = useCallback(() => {
    onChange(null)
  }, [onChange])

  const currentValue = getCurrentValue()
  const isOverrideBreakpoint = activeBreakpoint !== 'base'
  const currentHasOverride = hasOverride(activeBreakpoint)

  // Count how many breakpoints have overrides (excluding base)
  const overrideCount = value
    ? (['sm', 'md', 'lg', 'xl'] as Breakpoint[]).filter((bp) => value[bp] !== undefined).length
    : 0

  return (
    <div className="puck-field space-y-3">
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
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive"
            title="Clear all values"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Breakpoint Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {BREAKPOINTS.map((bp) => (
          <BreakpointTab
            key={bp.key}
            breakpoint={bp.key}
            label={bp.label}
            minWidth={bp.minWidth}
            isActive={activeBreakpoint === bp.key}
            hasOverride={hasOverride(bp.key)}
            onClick={() => setActiveBreakpoint(bp.key)}
            disabled={readOnly}
          />
        ))}
      </div>

      {/* Active Breakpoint Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {activeBreakpoint === 'base' ? (
            'Default for all screen sizes'
          ) : (
            <>
              {BREAKPOINTS.find((bp) => bp.key === activeBreakpoint)?.minWidth}px and up
              {!currentHasOverride && (
                <span className="text-muted-foreground/60"> (inheriting from base)</span>
              )}
            </>
          )}
        </span>

        {/* Clear Override Button */}
        {isOverrideBreakpoint && currentHasOverride && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearOverride}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear override
          </Button>
        )}
      </div>

      {/* Inner Field */}
      <div className="border border-border rounded-md p-3">
        {renderInnerField({
          value: currentValue,
          onChange: handleInnerChange,
          readOnly,
        })}
      </div>
    </div>
  )
}

export const ResponsiveField = memo(ResponsiveFieldInner) as <T>(
  props: ResponsiveFieldProps<T>
) => React.ReactElement

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateResponsiveFieldConfig<T> {
  label?: string
  /** Factory function that creates the inner field */
  innerField: (config: { label?: string }) => CustomField<T | null>
  /** Default value for base breakpoint */
  defaultValue?: T
}

/**
 * Creates a responsive wrapper around any Puck custom field.
 *
 * The inner field factory is called to get the field configuration,
 * and its render function is used to render the field at each breakpoint.
 *
 * @example
 * ```ts
 * // Create a responsive padding field
 * fields: {
 *   padding: createResponsiveField({
 *     label: 'Padding',
 *     innerField: (config) => createPaddingField(config),
 *     defaultValue: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', linked: true },
 *   }),
 * }
 * ```
 */
export function createResponsiveField<T>(
  config: CreateResponsiveFieldConfig<T>
): CustomField<ResponsiveValue<T> | null> {
  // Get the inner field configuration to access its render function
  const innerFieldConfig = config.innerField({ label: undefined })

  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <ResponsiveField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
        renderInnerField={(props) => {
          // Use the inner field's render function
          if (innerFieldConfig.type === 'custom' && innerFieldConfig.render) {
            return innerFieldConfig.render({
              field: innerFieldConfig,
              value: props.value,
              onChange: props.onChange,
              readOnly: props.readOnly,
              name: 'responsive-inner',
              id: 'responsive-inner',
            })
          }
          return null
        }}
      />
    ),
  }
}
