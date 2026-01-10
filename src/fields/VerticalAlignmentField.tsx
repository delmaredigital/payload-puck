'use client'

/**
 * VerticalAlignmentField - Icon toggle buttons for vertical/self alignment
 *
 * Used for grid item self-alignment (e.g., in TextImageSplit)
 * Controls how an item aligns itself within its grid/flex cell.
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  X,
} from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export type VerticalAlignment = 'flex-start' | 'center' | 'flex-end'

interface VerticalAlignmentFieldProps {
  value: VerticalAlignment | null
  onChange: (value: VerticalAlignment | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: VerticalAlignment
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
  buttonGroup: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  buttonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
}

// =============================================================================
// VerticalAlignmentField Component
// =============================================================================

function VerticalAlignmentFieldInner({
  value,
  onChange,
  label = 'Vertical Alignment',
  readOnly,
  defaultValue = 'center',
}: VerticalAlignmentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignment: VerticalAlignment) => {
    onChange(alignment)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as VerticalAlignment, icon: AlignStartVertical, title: 'Top' },
    { value: 'center' as VerticalAlignment, icon: AlignCenterVertical, title: 'Center' },
    { value: 'flex-end' as VerticalAlignment, icon: AlignEndVertical, title: 'Bottom' },
  ]

  return (
    <div className="puck-field" style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>
          {label}
        </label>
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            title="Reset to default"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      <div style={styles.buttonGroup}>
        {options.map(({ value: optionValue, icon: Icon, title }) => {
          const isActive = currentValue === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => handleChange(optionValue)}
              disabled={readOnly}
              style={{
                ...(isActive ? styles.buttonActive : styles.button),
                ...(readOnly ? styles.buttonDisabled : {}),
              }}
              title={title}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const VerticalAlignmentField = memo(VerticalAlignmentFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateVerticalAlignmentFieldConfig {
  label?: string
  defaultValue?: VerticalAlignment
}

/**
 * Creates a Puck field configuration for vertical/self alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   verticalAlignment: createVerticalAlignmentField({ label: 'Vertical Alignment' }),
 * }
 * ```
 */
export function createVerticalAlignmentField(
  config: CreateVerticalAlignmentFieldConfig = {}
): CustomField<VerticalAlignment | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <VerticalAlignmentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
