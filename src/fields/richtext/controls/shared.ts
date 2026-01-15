/**
 * Shared utilities for RichText controls
 *
 * Color manipulation, font size presets, and common types.
 */

import type { CSSProperties } from 'react'

// =============================================================================
// Font Size Presets
// =============================================================================

export const FONT_SIZES = [
  { label: 'XS', value: '0.75rem', px: '12px' },
  { label: 'Small', value: '0.875rem', px: '14px' },
  { label: 'Normal', value: null, px: '16px' },
  { label: 'Medium', value: '1.125rem', px: '18px' },
  { label: 'Large', value: '1.25rem', px: '20px' },
  { label: 'XL', value: '1.5rem', px: '24px' },
  { label: '2XL', value: '1.875rem', px: '30px' },
  { label: '3XL', value: '2.25rem', px: '36px' },
  { label: '4XL', value: '3rem', px: '48px' },
] as const

export const FONT_SIZE_UNITS = ['px', 'rem', 'em'] as const

export type FontSizeUnit = (typeof FONT_SIZE_UNITS)[number]

// =============================================================================
// Color Utilities
// =============================================================================

/**
 * Validates and normalizes a hex color string
 */
export function normalizeHex(hex: string): string {
  let clean = hex.replace(/^#/, '')
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return ''
  }
  return `#${clean.toLowerCase()}`
}

/**
 * Converts hex + opacity to rgba CSS string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace(/^#/, '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
}

/**
 * Parses a color string (hex or rgba) and returns hex + opacity
 */
export function parseColor(color: string | undefined): { hex: string; opacity: number } {
  if (!color) return { hex: '#000000', opacity: 100 }

  // Handle rgba
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10)
    const g = parseInt(rgbaMatch[2], 10)
    const b = parseInt(rgbaMatch[3], 10)
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    return { hex, opacity: Math.round(a * 100) }
  }

  // Handle hex
  const normalized = normalizeHex(color)
  if (normalized) {
    return { hex: normalized, opacity: 100 }
  }

  return { hex: '#000000', opacity: 100 }
}

// =============================================================================
// Shared Styles
// =============================================================================

export const controlStyles = {
  icon: {
    width: '16px',
    height: '16px',
  } as CSSProperties,

  dropdownTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    height: '28px',
    padding: '0 6px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } as CSSProperties,

  dropdownTriggerActive: {
    color: 'var(--puck-color-azure-04)',
  } as CSSProperties,

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: 'var(--puck-color-white)',
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999, // High z-index to ensure dropdown appears above sidebar content
    minWidth: '160px',
  } as CSSProperties,

  dropdownItem: {
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'background-color 0.15s',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  } as CSSProperties,

  dropdownLabel: {
    padding: '4px 12px',
    fontSize: '11px',
    color: 'var(--puck-color-grey-05)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as CSSProperties,

  dropdownSeparator: {
    height: '1px',
    backgroundColor: 'var(--puck-color-grey-03)',
    margin: '4px 0',
  } as CSSProperties,

  // Color picker specific styles
  colorPickerContainer: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '240px',
  } as CSSProperties,

  colorPickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,

  colorPickerInput: {
    width: '36px',
    height: '36px',
    padding: 0,
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '6px',
    cursor: 'pointer',
    flexShrink: 0,
  } as CSSProperties,

  colorPickerHexInput: {
    flex: 1,
    height: '36px',
    padding: '0 10px',
    fontSize: '13px',
    fontFamily: 'monospace',
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '6px',
    backgroundColor: 'var(--puck-color-white)',
    color: 'var(--puck-color-grey-08)',
    outline: 'none',
  } as CSSProperties,

  colorPickerPreview: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '1px solid var(--puck-color-grey-03)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  } as CSSProperties,

  colorPickerCheckerboard: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    backgroundColor: '#f0f0f0',
  } as CSSProperties,

  colorPickerOverlay: {
    position: 'absolute',
    inset: 0,
  } as CSSProperties,

  colorPickerOpacitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,

  colorPickerOpacityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,

  colorPickerOpacityLabel: {
    fontSize: '11px',
    color: 'var(--puck-color-grey-05)',
  } as CSSProperties,

  colorPickerOpacityValue: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'var(--puck-color-grey-05)',
  } as CSSProperties,

  colorPickerOpacitySlider: {
    position: 'relative',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden',
    border: '1px solid var(--puck-color-grey-03)',
  } as CSSProperties,

  colorPickerOpacityInputRange: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    margin: 0,
  } as CSSProperties,

  colorPickerOpacityThumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: 'white',
    border: '1px solid var(--puck-color-grey-04)',
    borderRadius: '2px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    pointerEvents: 'none',
  } as CSSProperties,

  colorPickerPresetsLabel: {
    fontSize: '11px',
    color: 'var(--puck-color-grey-05)',
    marginBottom: '4px',
  } as CSSProperties,

  colorPickerPresetsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  } as CSSProperties,

  colorPickerPresetButton: {
    width: '22px',
    height: '22px',
    padding: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid var(--puck-color-grey-03)',
    outline: 'none',
    transition: 'transform 0.1s',
  } as CSSProperties,

  colorPickerPresetButtonSelected: {
    width: '22px',
    height: '22px',
    padding: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    border: '2px solid var(--puck-color-grey-08)',
    outline: '2px solid var(--puck-color-grey-03)',
    outlineOffset: '1px',
  } as CSSProperties,

  colorPickerThemeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px',
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--puck-color-grey-07)',
    transition: 'background-color 0.15s',
  } as CSSProperties,

  colorPickerThemeSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '1px solid var(--puck-color-grey-03)',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #fff 50%, #1f2937 50%)',
  } as CSSProperties,

  // Font size specific styles
  fontSizeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    padding: '8px',
  } as CSSProperties,

  fontSizeButton: {
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid var(--puck-color-grey-03)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.15s',
  } as CSSProperties,

  fontSizeButtonActive: {
    backgroundColor: 'var(--puck-color-azure-11)',
    borderColor: 'var(--puck-color-azure-11)',
    color: 'var(--puck-color-azure-04)',
    fontWeight: 500,
  } as CSSProperties,

  customSizeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderTop: '1px solid var(--puck-color-grey-03)',
  } as CSSProperties,

  customSizeInput: {
    width: '60px',
    padding: '6px 8px',
    fontSize: '13px',
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '4px',
    outline: 'none',
  } as CSSProperties,

  customSizeSelect: {
    padding: '6px 4px',
    fontSize: '13px',
    border: '1px solid var(--puck-color-grey-03)',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'var(--puck-color-white)',
  } as CSSProperties,

  customSizeApply: {
    padding: '6px 10px',
    fontSize: '12px',
    backgroundColor: 'var(--puck-color-azure-04)',
    color: 'var(--puck-color-white)',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  } as CSSProperties,
}
