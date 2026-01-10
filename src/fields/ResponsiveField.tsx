'use client'

/**
 * ResponsiveField - Generic wrapper for breakpoint-specific field overrides
 *
 * This component wraps any existing field to provide responsive overrides
 * at different breakpoints (xs, sm, md, lg, xl). It uses sparse storage,
 * only storing values for breakpoints that have explicit overrides.
 */

import React, { useState, useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  X,
} from 'lucide-react'
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
  /** Default value for the xs breakpoint */
  defaultValue?: T
}

// =============================================================================
// Breakpoint Icons
// =============================================================================

const BREAKPOINT_ICONS: Record<Breakpoint, React.ComponentType<{ style?: CSSProperties }>> = {
  xs: Smartphone,
  sm: Smartphone,
  md: Tablet,
  lg: Laptop,
  xl: Monitor,
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  labelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  overrideBadge: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    backgroundColor: 'var(--theme-elevation-100)',
    padding: '2px 6px',
    borderRadius: '4px',
  } as CSSProperties,
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '8px',
  } as CSSProperties,
  tab: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 8px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flex: 1,
    backgroundColor: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  tabActive: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '6px 8px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flex: 1,
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
  } as CSSProperties,
  tabDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  overrideIndicator: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-elevation-800)',
  } as CSSProperties,
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  clearOverrideButton: {
    padding: '2px 8px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  innerFieldContainer: {
    padding: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
  } as CSSProperties,
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
      style={{
        ...(isActive ? styles.tabActive : styles.tab),
        ...(disabled ? styles.tabDisabled : {}),
      }}
    >
      <Icon style={{ width: '14px', height: '14px' }} />
      <span>{label}</span>
      {/* Override indicator dot */}
      {hasOverride && !isActive && (
        <span style={styles.overrideIndicator as CSSProperties} />
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
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('xs')

  // Get the current value for the active breakpoint
  const getCurrentValue = useCallback((): T | null => {
    if (!value) return null

    if (activeBreakpoint === 'xs') {
      return value.xs ?? defaultValue ?? null
    }

    const override = value[activeBreakpoint]
    if (override !== undefined) {
      return override
    }

    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs']
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

  const hasOverride = useCallback(
    (breakpoint: Breakpoint): boolean => {
      if (!value) return false
      if (breakpoint === 'xs') return false
      return value[breakpoint] !== undefined
    },
    [value]
  )

  const getInheritanceSource = useCallback((): Breakpoint | null => {
    if (!value || activeBreakpoint === 'xs') return null
    if (value[activeBreakpoint] !== undefined) return null

    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs']
    const activeIndex = breakpointOrder.indexOf(activeBreakpoint)

    for (let i = activeIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i]
      if (value[bp] !== undefined) {
        return bp
      }
    }

    return null
  }, [value, activeBreakpoint])

  const handleInnerChange = useCallback(
    (newValue: T | null) => {
      if (activeBreakpoint === 'xs') {
        if (newValue === null) {
          onChange(null)
        } else {
          onChange({ ...value, xs: newValue } as ResponsiveValue<T>)
        }
      } else {
        if (newValue === null) {
          if (!value) return
          const newResponsive = { ...value }
          delete newResponsive[activeBreakpoint]
          onChange(newResponsive)
        } else {
          const xs = value?.xs ?? defaultValue
          if (xs === undefined) return
          onChange({
            ...value,
            xs,
            [activeBreakpoint]: newValue,
          } as ResponsiveValue<T>)
        }
      }
    },
    [value, onChange, activeBreakpoint, defaultValue]
  )

  const handleClearOverride = useCallback(() => {
    if (activeBreakpoint === 'xs' || !value) return
    const newResponsive = { ...value }
    delete newResponsive[activeBreakpoint]
    onChange(newResponsive)
  }, [value, onChange, activeBreakpoint])

  const handleClearAll = useCallback(() => {
    onChange(null)
  }, [onChange])

  const currentValue = getCurrentValue()
  const isOverrideBreakpoint = activeBreakpoint !== 'xs'
  const currentHasOverride = hasOverride(activeBreakpoint)
  const inheritanceSource = getInheritanceSource()

  const overrideCount = value
    ? (['sm', 'md', 'lg', 'xl'] as Breakpoint[]).filter((bp) => value[bp] !== undefined).length
    : 0

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label && (
          <div style={styles.labelGroup}>
            <label style={styles.label}>{label}</label>
            {overrideCount > 0 && (
              <span style={styles.overrideBadge}>
                {overrideCount} override{overrideCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClearAll}
            style={styles.clearButton}
            title="Clear all values"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Breakpoint Tabs */}
      <div style={styles.tabsContainer}>
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
      <div style={styles.infoRow}>
        <span>
          {activeBreakpoint === 'xs' ? (
            'Extra small screens (0-639px)'
          ) : (
            <>
              {BREAKPOINTS.find((bp) => bp.key === activeBreakpoint)?.minWidth}px and up
              {!currentHasOverride && inheritanceSource && (
                <span style={{ color: 'var(--theme-elevation-400)' }}> (inheriting from {inheritanceSource.toUpperCase()})</span>
              )}
            </>
          )}
        </span>

        {isOverrideBreakpoint && currentHasOverride && !readOnly && (
          <button
            type="button"
            onClick={handleClearOverride}
            style={styles.clearOverrideButton}
          >
            Clear override
          </button>
        )}
      </div>

      {/* Inner Field */}
      <div style={styles.innerFieldContainer}>
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
  innerField: (config: { label?: string }) => CustomField<T | null>
  defaultValue?: T
}

/**
 * Creates a responsive wrapper around any Puck custom field.
 */
export function createResponsiveField<T>(
  config: CreateResponsiveFieldConfig<T>
): CustomField<ResponsiveValue<T> | null> {
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
