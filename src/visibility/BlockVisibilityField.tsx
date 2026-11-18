'use client'

/**
 * Sidebar control for a block's visibility: Shown / Hidden, plus optional
 * per-screen-size hiding.
 */

import { memo, type CSSProperties } from 'react'
import { FieldLabel } from '@puckeditor/core'
import {
  SCREEN_SIZES,
  readBlockVisibility,
  resolveVisibility,
  setBlockHidden,
  setBlockHiddenOn,
  type BlockVisibility,
  type ScreenSize,
} from './core.js'

export const VISIBILITY_STRINGS = {
  label: 'Visibility',
  shown: 'Shown',
  hidden: 'Hidden',
  hideOn: { phone: 'Hide on phone', tablet: 'Hide on tablet', desktop: 'Hide on desktop' } satisfies Record<ScreenSize, string>,
  hiddenHelp: 'Hidden blocks stay in the editor but are left out of the live page.',
  sizesHelp: "Hiding on a screen size only hides it from view. The content is still in the page's HTML.",
  hideAction: 'Hide block',
  showAction: 'Show block',
} as const

const styles = {
  segments: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    padding: '3px',
    borderRadius: '6px',
    background: 'var(--puck-color-grey-11, #f5f5f5)',
  } as CSSProperties,
  segment: {
    padding: '6px 8px',
    border: 'none',
    borderRadius: '4px',
    background: 'transparent',
    color: 'var(--puck-color-grey-04, #5a5a5a)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,
  segmentActive: {
    background: 'var(--puck-color-white, #fff)',
    color: 'var(--puck-color-black, #000)',
    boxShadow: '0 1px 2px rgba(0,0,0,.12)',
  } as CSSProperties,
  sizes: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' } as CSSProperties,
  size: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' } as CSSProperties,
  help: { margin: '8px 0 0', fontSize: '12px', lineHeight: 1.4, color: 'var(--puck-color-grey-05, #767676)' } as CSSProperties,
}

export interface BlockVisibilityControlProps {
  value: unknown
  onChange: (value: BlockVisibility | undefined) => void
  readOnly?: boolean
  /** Offer per-screen-size hiding. Off for email, where it isn't reliable. */
  screenSizes?: boolean
}

function BlockVisibilityControlInner({ value, onChange, readOnly, screenSizes = true }: BlockVisibilityControlProps) {
  const stored = readBlockVisibility({ _visibility: value })
  const { hidden, hideOn } = resolveVisibility(stored)

  const segment = (label: string, active: boolean, next: boolean) => (
    <button
      type="button"
      aria-pressed={active}
      disabled={readOnly}
      onClick={() => !active && onChange(setBlockHidden(stored, next))}
      style={{ ...styles.segment, ...(active ? styles.segmentActive : {}) }}
    >
      {label}
    </button>
  )

  return (
    <FieldLabel label={VISIBILITY_STRINGS.label} el="div" readOnly={readOnly}>
      <div role="group" aria-label={VISIBILITY_STRINGS.label} style={styles.segments}>
        {segment(VISIBILITY_STRINGS.shown, !hidden, false)}
        {segment(VISIBILITY_STRINGS.hidden, hidden, true)}
      </div>
      {hidden && <p style={styles.help}>{VISIBILITY_STRINGS.hiddenHelp}</p>}
      {screenSizes && !hidden && (
        <>
          <div style={styles.sizes}>
            {SCREEN_SIZES.map((size) => (
              <label key={size} style={styles.size}>
                <input
                  type="checkbox"
                  checked={hideOn.includes(size)}
                  disabled={readOnly}
                  onChange={(event) => onChange(setBlockHiddenOn(stored, size, event.target.checked))}
                />
                {VISIBILITY_STRINGS.hideOn[size]}
              </label>
            ))}
          </div>
          <p style={styles.help}>{VISIBILITY_STRINGS.sizesHelp}</p>
        </>
      )}
    </FieldLabel>
  )
}

export const BlockVisibilityControl = memo(BlockVisibilityControlInner)
