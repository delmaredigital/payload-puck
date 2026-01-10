'use client'

/**
 * PaddingField - Custom Puck field for 4-sided padding/margin control
 *
 * This component provides:
 * - 4 number inputs for top/right/bottom/left
 * - Link/unlink toggle button (when linked, all values sync)
 * - Unit selector (px, rem)
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { Link, Unlink } from 'lucide-react'
import type { PaddingValue } from './shared'

// =============================================================================
// Types
// =============================================================================

type SpacingUnit = 'px' | 'rem' | 'em' | '%'

interface PaddingFieldProps {
  value: PaddingValue | null
  onChange: (value: PaddingValue | null) => void
  label?: string
  readOnly?: boolean
  showUnits?: boolean
}

// =============================================================================
// Default Value
// =============================================================================

const DEFAULT_VALUE: PaddingValue = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
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
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  linkButtonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
  } as CSSProperties,
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  inputLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
    width: '24px',
    textAlign: 'right',
    flexShrink: 0,
  } as CSSProperties,
  input: {
    height: '28px',
    width: '100%',
    padding: '0 4px',
    textAlign: 'center',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  } as CSSProperties,
  unitGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  unitLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  unitButtons: {
    display: 'flex',
    gap: '4px',
  } as CSSProperties,
  unitButton: {
    height: '28px',
    padding: '0 10px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  unitButtonActive: {
    height: '28px',
    padding: '0 10px',
    fontSize: '12px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  summary: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
}

// =============================================================================
// PaddingField Component
// =============================================================================

function PaddingFieldInner({
  value,
  onChange,
  label,
  readOnly,
  showUnits = true,
}: PaddingFieldProps) {
  // Use default if no value
  const currentValue = value || DEFAULT_VALUE

  // Use explicit linked state from value, default to true if not set
  const isLinked = currentValue.linked ?? true

  // Handle individual side change
  const handleSideChange = useCallback((
    side: 'top' | 'right' | 'bottom' | 'left',
    newValue: number
  ) => {
    if (isLinked) {
      // When linked, update all sides
      onChange({
        ...currentValue,
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
        linked: true,
      })
    } else {
      // When unlinked, update only the specific side
      onChange({
        ...currentValue,
        [side]: newValue,
        linked: false,
      })
    }
  }, [currentValue, onChange, isLinked])

  // Handle link toggle
  const handleLinkToggle = useCallback(() => {
    if (isLinked) {
      // Unlinking - keep current values but mark as unlinked
      onChange({
        ...currentValue,
        linked: false,
      })
    } else {
      // Linking - set all sides to the top value and mark as linked
      onChange({
        ...currentValue,
        top: currentValue.top,
        right: currentValue.top,
        bottom: currentValue.top,
        left: currentValue.top,
        linked: true,
      })
    }
  }, [currentValue, onChange, isLinked])

  // Handle unit change
  const handleUnitChange = useCallback((unit: SpacingUnit) => {
    onChange({
      ...currentValue,
      unit,
    })
  }, [currentValue, onChange])

  // Render a single side input - compact horizontal layout
  const renderSideInput = (
    side: 'top' | 'right' | 'bottom' | 'left',
    sideLabel: string
  ) => (
    <div style={styles.inputRow}>
      <label style={styles.inputLabel as CSSProperties}>
        {sideLabel.charAt(0)}
      </label>
      <input
        type="number"
        min={0}
        value={currentValue[side]}
        onChange={(e) => handleSideChange(side, parseInt(e.target.value, 10) || 0)}
        disabled={readOnly}
        style={styles.input as CSSProperties}
      />
    </div>
  )

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header with label and link toggle */}
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>
            {label}
          </label>
        )}
        {/* Link/Unlink toggle button */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleLinkToggle}
            style={isLinked ? styles.linkButtonActive : styles.linkButton}
            title={isLinked ? 'Click to unlink (set sides individually)' : 'Click to link (all sides same value)'}
          >
            {isLinked ? (
              <Link style={{ width: '16px', height: '16px' }} />
            ) : (
              <Unlink style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        )}
      </div>

      {/* Compact 2x2 grid layout */}
      <div style={styles.grid}>
        {renderSideInput('top', 'Top')}
        {renderSideInput('right', 'Right')}
        {renderSideInput('bottom', 'Bottom')}
        {renderSideInput('left', 'Left')}
      </div>

      {/* Unit selector and summary */}
      {showUnits && !readOnly && (
        <div style={styles.footer}>
          <div style={styles.unitGroup}>
            <label style={styles.unitLabel}>Unit:</label>
            <div style={styles.unitButtons}>
              {(['px', 'rem'] as SpacingUnit[]).map((unit) => {
                const isActive = currentValue.unit === unit
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleUnitChange(unit)}
                    style={isActive ? styles.unitButtonActive : styles.unitButton}
                  >
                    {unit}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Current value summary */}
          <span style={styles.summary}>
            {isLinked
              ? `${currentValue.top}${currentValue.unit}`
              : `${currentValue.top} ${currentValue.right} ${currentValue.bottom} ${currentValue.left}${currentValue.unit}`
            }
          </span>
        </div>
      )}
    </div>
  )
}

export const PaddingField = memo(PaddingFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for padding/spacing
 */
export function createPaddingField(config: {
  label?: string
  showUnits?: boolean
}): CustomField<PaddingValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <PaddingField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showUnits={config.showUnits}
      />
    ),
  }
}
