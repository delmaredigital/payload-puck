'use client'

/**
 * FlexAlignmentField - Icon toggle buttons for flexbox alignment properties
 *
 * Provides two specialized fields:
 * - JustifyContentField: Controls main-axis distribution (horizontal in row, vertical in column)
 * - AlignItemsField: Controls cross-axis alignment (vertical in row, horizontal in column)
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalDistributeCenter,
  GripHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  MoveVertical,
  X,
} from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch'

interface JustifyContentFieldProps {
  value: JustifyContent | null
  onChange: (value: JustifyContent | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: JustifyContent
}

interface AlignItemsFieldProps {
  value: AlignItems | null
  onChange: (value: AlignItems | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: AlignItems
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
// JustifyContentField Component
// =============================================================================

function JustifyContentFieldInner({
  value,
  onChange,
  label = 'Justify Content',
  readOnly,
  defaultValue = 'flex-start',
}: JustifyContentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((justifyContent: JustifyContent) => {
    onChange(justifyContent)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as JustifyContent, icon: AlignLeft, title: 'Start' },
    { value: 'center' as JustifyContent, icon: AlignCenter, title: 'Center' },
    { value: 'flex-end' as JustifyContent, icon: AlignRight, title: 'End' },
    { value: 'space-between' as JustifyContent, icon: AlignHorizontalDistributeCenter, title: 'Space Between' },
    { value: 'space-around' as JustifyContent, icon: GripHorizontal, title: 'Space Around' },
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

export const JustifyContentField = memo(JustifyContentFieldInner)

// =============================================================================
// AlignItemsField Component
// =============================================================================

function AlignItemsFieldInner({
  value,
  onChange,
  label = 'Align Items',
  readOnly,
  defaultValue = 'center',
}: AlignItemsFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignItems: AlignItems) => {
    onChange(alignItems)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as AlignItems, icon: AlignStartVertical, title: 'Start' },
    { value: 'center' as AlignItems, icon: AlignCenterVertical, title: 'Center' },
    { value: 'flex-end' as AlignItems, icon: AlignEndVertical, title: 'End' },
    { value: 'stretch' as AlignItems, icon: MoveVertical, title: 'Stretch' },
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

export const AlignItemsField = memo(AlignItemsFieldInner)

// =============================================================================
// Field Configuration Factories
// =============================================================================

interface CreateJustifyContentFieldConfig {
  label?: string
  defaultValue?: JustifyContent
}

interface CreateAlignItemsFieldConfig {
  label?: string
  defaultValue?: AlignItems
}

/**
 * Creates a Puck field configuration for flex justify-content control
 *
 * @example
 * ```ts
 * fields: {
 *   justifyContent: createJustifyContentField({ label: 'Justify Content' }),
 * }
 * ```
 */
export function createJustifyContentField(
  config: CreateJustifyContentFieldConfig = {}
): CustomField<JustifyContent | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <JustifyContentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}

/**
 * Creates a Puck field configuration for flex align-items control
 *
 * @example
 * ```ts
 * fields: {
 *   alignItems: createAlignItemsField({ label: 'Align Items' }),
 * }
 * ```
 */
export function createAlignItemsField(
  config: CreateAlignItemsFieldConfig = {}
): CustomField<AlignItems | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <AlignItemsField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
