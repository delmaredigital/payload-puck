'use client'

/**
 * AlignmentField - Icon toggle buttons for text/content alignment
 *
 * Replaces select dropdowns with intuitive icon toggles for
 * left, center, right alignment.
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
} from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export type Alignment = 'left' | 'center' | 'right'

interface AlignmentFieldProps {
  value: Alignment | null
  onChange: (value: Alignment | null) => void
  label?: string
  readOnly?: boolean
  /** Default value when cleared or initially null */
  defaultValue?: Alignment
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
// AlignmentField Component
// =============================================================================

function AlignmentFieldInner({
  value,
  onChange,
  label = 'Alignment',
  readOnly,
  defaultValue = 'left',
}: AlignmentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignment: Alignment) => {
    onChange(alignment)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const alignments = [
    { value: 'left' as Alignment, icon: AlignLeft, title: 'Align left' },
    { value: 'center' as Alignment, icon: AlignCenter, title: 'Align center' },
    { value: 'right' as Alignment, icon: AlignRight, title: 'Align right' },
  ]

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header with label and clear */}
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

      {/* Alignment toggle buttons */}
      <div style={styles.buttonGroup}>
        {alignments.map(({ value: alignment, icon: Icon, title }) => {
          const isActive = currentValue === alignment
          return (
            <button
              key={alignment}
              type="button"
              onClick={() => handleChange(alignment)}
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

export const AlignmentField = memo(AlignmentFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateAlignmentFieldConfig {
  label?: string
  defaultValue?: Alignment
}

/**
 * Creates a Puck field configuration for alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   alignment: createAlignmentField({ label: 'Text Alignment' }),
 * }
 * ```
 */
export function createAlignmentField(
  config: CreateAlignmentFieldConfig = {}
): CustomField<Alignment | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <AlignmentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
