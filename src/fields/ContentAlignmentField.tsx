'use client'

/**
 * ContentAlignmentField - Visual 3x3 grid selector for content positioning
 *
 * A d-pad style control for selecting content alignment within a container.
 * Works with both Flexbox (justify-content + align-items) and Grid (place-content).
 */

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@puckeditor/core'
import { X } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

/** Horizontal alignment */
export type HorizontalAlign = 'start' | 'center' | 'end'

/** Vertical alignment */
export type VerticalAlign = 'start' | 'center' | 'end'

/** Combined alignment position (9 positions) */
export interface ContentAlignmentValue {
  horizontal: HorizontalAlign
  vertical: VerticalAlign
}

/** Position labels for accessibility */
export type PositionLabel =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

interface ContentAlignmentFieldProps {
  value: ContentAlignmentValue | null
  onChange: (value: ContentAlignmentValue | null) => void
  label?: string
  readOnly?: boolean
  /** Default alignment when null */
  defaultValue?: ContentAlignmentValue
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_ALIGNMENT: ContentAlignmentValue = {
  horizontal: 'center',
  vertical: 'center',
}

/** Grid positions in order (row by row) */
const POSITIONS: Array<{ h: HorizontalAlign; v: VerticalAlign; label: PositionLabel }> = [
  { h: 'start', v: 'start', label: 'top-left' },
  { h: 'center', v: 'start', label: 'top-center' },
  { h: 'end', v: 'start', label: 'top-right' },
  { h: 'start', v: 'center', label: 'center-left' },
  { h: 'center', v: 'center', label: 'center' },
  { h: 'end', v: 'center', label: 'center-right' },
  { h: 'start', v: 'end', label: 'bottom-left' },
  { h: 'center', v: 'end', label: 'bottom-center' },
  { h: 'end', v: 'end', label: 'bottom-right' },
]

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
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  } as CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 28px)',
    gridTemplateRows: 'repeat(3, 28px)',
    gap: '3px',
    padding: '4px',
    backgroundColor: 'var(--theme-elevation-100)',
    borderRadius: '8px',
    border: '1px solid var(--theme-elevation-150)',
  } as CSSProperties,
  cell: {
    width: '28px',
    height: '28px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  } as CSSProperties,
  cellActive: {
    width: '28px',
    height: '28px',
    border: '2px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  } as CSSProperties,
  cellHover: {
    borderColor: 'var(--theme-elevation-400)',
    backgroundColor: 'var(--theme-elevation-50)',
  } as CSSProperties,
  cellDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  } as CSSProperties,
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-elevation-400)',
  } as CSSProperties,
  dotActive: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-bg)',
  } as CSSProperties,
  preview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
}

// =============================================================================
// ContentAlignmentField Component
// =============================================================================

function ContentAlignmentFieldInner({
  value,
  onChange,
  label = 'Content Alignment',
  readOnly,
  defaultValue = DEFAULT_ALIGNMENT,
}: ContentAlignmentFieldProps) {
  const currentValue = value || defaultValue

  const handleCellClick = useCallback(
    (horizontal: HorizontalAlign, vertical: VerticalAlign) => {
      if (readOnly) return
      onChange({ horizontal, vertical })
    },
    [onChange, readOnly]
  )

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const isActive = (h: HorizontalAlign, v: VerticalAlign) =>
    currentValue.horizontal === h && currentValue.vertical === v

  // Human-readable label for current position
  const getPositionLabel = (h: HorizontalAlign, v: VerticalAlign): string => {
    const vLabel = v === 'start' ? 'Top' : v === 'end' ? 'Bottom' : 'Middle'
    const hLabel = h === 'start' ? 'Left' : h === 'end' ? 'Right' : 'Center'
    if (h === 'center' && v === 'center') return 'Center'
    return `${vLabel} ${hLabel}`
  }

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
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

      {/* 3x3 Grid Selector */}
      <div style={styles.gridContainer}>
        <div style={styles.grid}>
          {POSITIONS.map(({ h, v, label: posLabel }) => {
            const active = isActive(h, v)
            return (
              <button
                key={posLabel}
                type="button"
                onClick={() => handleCellClick(h, v)}
                disabled={readOnly}
                style={{
                  ...(active ? styles.cellActive : styles.cell),
                  ...(readOnly ? styles.cellDisabled : {}),
                }}
                title={getPositionLabel(h, v)}
                aria-label={getPositionLabel(h, v)}
                aria-pressed={active}
              >
                <span style={active ? styles.dotActive : styles.dot} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Current position label */}
      <div style={styles.preview}>
        {getPositionLabel(currentValue.horizontal, currentValue.vertical)}
      </div>
    </div>
  )
}

export const ContentAlignmentField = memo(ContentAlignmentFieldInner)

// =============================================================================
// CSS Helper Utilities
// =============================================================================

/**
 * Convert ContentAlignmentValue to Flexbox CSS properties
 * Use this when the container is display: flex
 */
export function alignmentToFlexCSS(
  alignment: ContentAlignmentValue | null | undefined
): React.CSSProperties {
  if (!alignment) return {}

  const justifyMap: Record<HorizontalAlign, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }

  const alignMap: Record<VerticalAlign, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }

  return {
    justifyContent: justifyMap[alignment.horizontal],
    alignItems: alignMap[alignment.vertical],
  }
}

/**
 * Convert ContentAlignmentValue to Grid CSS properties
 * Use this when the container is display: grid
 */
export function alignmentToGridCSS(
  alignment: ContentAlignmentValue | null | undefined
): React.CSSProperties {
  if (!alignment) return {}

  const map: Record<HorizontalAlign | VerticalAlign, string> = {
    start: 'start',
    center: 'center',
    end: 'end',
  }

  return {
    justifyContent: map[alignment.horizontal],
    alignContent: map[alignment.vertical],
  }
}

/**
 * Convert ContentAlignmentValue to place-self CSS for grid items
 * Use this on individual items within a grid
 */
export function alignmentToPlaceSelfCSS(
  alignment: ContentAlignmentValue | null | undefined
): React.CSSProperties {
  if (!alignment) return {}

  const map: Record<HorizontalAlign | VerticalAlign, string> = {
    start: 'start',
    center: 'center',
    end: 'end',
  }

  return {
    placeSelf: `${map[alignment.vertical]} ${map[alignment.horizontal]}`,
  }
}

/**
 * Get Tailwind classes for alignment
 * Returns both justify-* and items-* classes
 */
export function alignmentToTailwind(
  alignment: ContentAlignmentValue | null | undefined
): string {
  if (!alignment) return ''

  const justifyMap: Record<HorizontalAlign, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }

  const alignMap: Record<VerticalAlign, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  }

  return `${justifyMap[alignment.horizontal]} ${alignMap[alignment.vertical]}`
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateContentAlignmentFieldConfig {
  label?: string
  defaultValue?: ContentAlignmentValue
}

/**
 * Creates a Puck field configuration for content alignment
 *
 * @example
 * ```ts
 * fields: {
 *   contentAlignment: createContentAlignmentField({ label: 'Align Content' }),
 * }
 * ```
 */
export function createContentAlignmentField(
  config: CreateContentAlignmentFieldConfig = {}
): CustomField<ContentAlignmentValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <ContentAlignmentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
