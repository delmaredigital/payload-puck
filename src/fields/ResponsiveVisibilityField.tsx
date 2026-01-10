'use client'

/**
 * ResponsiveVisibilityField - Show/hide elements at different breakpoints
 *
 * Provides a compact visual interface for toggling element visibility
 * at each breakpoint (xs, sm, md, lg, xl). Simple independent toggles
 * like Elementor/Divi - each breakpoint is just on or off.
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Eye,
  EyeOff,
} from 'lucide-react'
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

const BREAKPOINT_ICONS: Record<Breakpoint, React.ComponentType<{ className?: string; style?: CSSProperties }>> = {
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
    gap: '8px',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  warningBadge: {
    fontSize: '12px',
    color: 'var(--theme-warning-500)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as CSSProperties,
  toggleGrid: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  toggleButton: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '8px',
    borderRadius: '6px',
    flex: 1,
    minWidth: '52px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid',
  } as CSSProperties,
  toggleVisible: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'rgb(16, 185, 129)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  } as CSSProperties,
  toggleHidden: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'rgb(239, 68, 68)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  } as CSSProperties,
  toggleDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  toggleLabel: {
    fontSize: '10px',
    fontWeight: 500,
  } as CSSProperties,
  toggleIcon: {
    position: 'absolute',
    top: '4px',
    right: '4px',
  } as CSSProperties,
  helpText: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
}

// =============================================================================
// Visibility Toggle Button
// =============================================================================

interface VisibilityToggleProps {
  breakpoint: Breakpoint
  label: string
  minWidth: number | null
  isVisible: boolean
  onClick: () => void
  disabled?: boolean
}

function VisibilityToggle({
  breakpoint,
  label,
  minWidth,
  isVisible,
  onClick,
  disabled,
}: VisibilityToggleProps) {
  const DeviceIcon = BREAKPOINT_ICONS[breakpoint]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${label}${minWidth ? ` (${minWidth}px+)` : ''}: ${isVisible ? 'Visible' : 'Hidden'}`}
      style={{
        ...styles.toggleButton,
        ...(isVisible ? styles.toggleVisible : styles.toggleHidden),
        ...(disabled ? styles.toggleDisabled : {}),
      }}
    >
      <DeviceIcon style={{ width: '16px', height: '16px' }} />
      <span style={styles.toggleLabel}>{label}</span>
      <div style={styles.toggleIcon as CSSProperties}>
        {isVisible ? (
          <Eye style={{ width: '12px', height: '12px' }} />
        ) : (
          <EyeOff style={{ width: '12px', height: '12px' }} />
        )}
      </div>
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
  // Get visibility for a breakpoint (simple lookup, no cascade)
  const getVisibility = useCallback(
    (breakpoint: Breakpoint): boolean => {
      const val = value ?? DEFAULT_VISIBILITY
      // All breakpoints have explicit values, default to true if undefined
      return val[breakpoint] ?? true
    },
    [value]
  )

  // Toggle visibility for a breakpoint (simple toggle, no cascade)
  const toggleVisibility = useCallback(
    (breakpoint: Breakpoint) => {
      const currentVisible = getVisibility(breakpoint)
      const newValue: VisibilityValue = {
        ...(value ?? DEFAULT_VISIBILITY),
        [breakpoint]: !currentVisible,
      }
      onChange(newValue)
    },
    [value, onChange, getVisibility]
  )

  // Check if any breakpoint is hidden
  const hasHiddenBreakpoints = BREAKPOINTS.some((bp) => !getVisibility(bp.key))

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>{label}</label>
        )}
        {hasHiddenBreakpoints && (
          <span style={styles.warningBadge}>
            <EyeOff style={{ width: '12px', height: '12px' }} />
            Partially hidden
          </span>
        )}
      </div>

      {/* Visibility Grid */}
      <div style={styles.toggleGrid}>
        {BREAKPOINTS.map((bp) => (
          <VisibilityToggle
            key={bp.key}
            breakpoint={bp.key}
            label={bp.label}
            minWidth={bp.minWidth}
            isVisible={getVisibility(bp.key)}
            onClick={() => toggleVisibility(bp.key)}
            disabled={readOnly}
          />
        ))}
      </div>

      {/* Help text */}
      <p style={styles.helpText}>
        Toggle visibility per screen size. Each breakpoint is independent.
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
