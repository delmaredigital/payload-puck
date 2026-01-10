'use client'

/**
 * TransformField - Custom Puck field for CSS transforms
 *
 * This component provides:
 * - Live preview of transform effect
 * - Rotate slider (-360 to 360)
 * - Scale X/Y with link/unlink toggle
 * - Skew X/Y sliders
 * - Translate X/Y inputs with unit selector
 * - Transform origin 3x3 grid selector
 * - Collapsible 3D section (perspective, rotateX, rotateY)
 */

import React, { useCallback, memo, useState, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import {
  Link,
  Unlink,
  RotateCw,
  Maximize2,
  X,
  ChevronDown,
  ChevronRight,
  Box,
} from 'lucide-react'
import type { TransformValue, TransformOrigin } from './shared'
import { DEFAULT_TRANSFORM, transformValueToCSS } from './shared'

// =============================================================================
// Types
// =============================================================================

interface TransformFieldProps {
  value: TransformValue | null
  onChange: (value: TransformValue | null) => void
  label?: string
  readOnly?: boolean
}

type TranslateUnit = 'px' | 'rem' | '%'

// =============================================================================
// Styles
// =============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  preview: {
    height: '96px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-150)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as CSSProperties,
  previewBox: {
    width: '48px',
    height: '48px',
    backgroundColor: 'var(--theme-elevation-800)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--theme-bg)',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'transform 0.2s',
  } as CSSProperties,
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
  } as CSSProperties,
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  sectionLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
  } as CSSProperties,
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-elevation-700)',
    cursor: 'pointer',
  } as CSSProperties,
  linkButtonActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
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
    gap: '12px',
  } as CSSProperties,
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  sliderLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  sliderValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  slider: {
    width: '100%',
    height: '6px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  translateRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  select: {
    height: '28px',
    width: '64px',
    padding: '0 8px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  inputLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  input: {
    height: '32px',
    padding: '0 8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
  } as CSSProperties,
  originGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    width: 'fit-content',
  } as CSSProperties,
  originButton: {
    width: '24px',
    height: '24px',
    padding: 0,
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-50)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  originButtonActive: {
    width: '24px',
    height: '24px',
    padding: 0,
    border: '1px solid var(--theme-elevation-800)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  originDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-elevation-400)',
  } as CSSProperties,
  originDotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--theme-bg)',
  } as CSSProperties,
  originRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as CSSProperties,
  originLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    textTransform: 'capitalize',
  } as CSSProperties,
  collapsible: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
    overflow: 'hidden',
  } as CSSProperties,
  collapsibleHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    border: 'none',
    backgroundColor: 'var(--theme-elevation-50)',
    cursor: 'pointer',
  } as CSSProperties,
  collapsibleTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  collapsibleContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid var(--theme-elevation-150)',
  } as CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  checkboxLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
}

// =============================================================================
// Origin Grid Component
// =============================================================================

interface OriginGridProps {
  value: TransformOrigin
  onChange: (origin: TransformOrigin) => void
  disabled?: boolean
}

const ORIGIN_POSITIONS: TransformOrigin[] = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
]

function OriginGrid({ value, onChange, disabled }: OriginGridProps) {
  return (
    <div style={styles.originGrid}>
      {ORIGIN_POSITIONS.map((origin) => {
        const isActive = value === origin
        return (
          <button
            key={origin}
            type="button"
            onClick={() => onChange(origin)}
            disabled={disabled}
            style={{
              ...(isActive ? styles.originButtonActive : styles.originButton),
              ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            title={origin.replace('-', ' ')}
          >
            <span style={isActive ? styles.originDotActive : styles.originDot} />
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Slider Input Component
// =============================================================================

interface SliderInputProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
  label?: string
  unit?: string
}

function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  label,
  unit = '',
}: SliderInputProps) {
  return (
    <div style={styles.sliderGroup as CSSProperties}>
      {label && (
        <div style={styles.sliderHeader}>
          <label style={styles.sliderLabel as CSSProperties}>{label}</label>
          <span style={styles.sliderValue}>{value}{unit}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          ...styles.slider,
          ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        }}
      />
    </div>
  )
}

// =============================================================================
// TransformField Component
// =============================================================================

function TransformFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: TransformFieldProps) {
  const [show3D, setShow3D] = useState(value?.enable3D ?? false)

  // Use default if no value
  const currentValue = value || DEFAULT_TRANSFORM

  // Handle individual value changes
  const handleChange = useCallback(
    <K extends keyof TransformValue>(key: K, newValue: TransformValue[K]) => {
      onChange({
        ...currentValue,
        [key]: newValue,
      })
    },
    [currentValue, onChange]
  )

  // Handle scale change with locking
  const handleScaleChange = useCallback(
    (axis: 'scaleX' | 'scaleY', newValue: number) => {
      if (currentValue.scaleLocked) {
        onChange({
          ...currentValue,
          scaleX: newValue,
          scaleY: newValue,
        })
      } else {
        onChange({
          ...currentValue,
          [axis]: newValue,
        })
      }
    },
    [currentValue, onChange]
  )

  // Handle scale lock toggle
  const handleScaleLockToggle = useCallback(() => {
    if (!currentValue.scaleLocked) {
      // When locking, sync both to X value
      onChange({
        ...currentValue,
        scaleLocked: true,
        scaleY: currentValue.scaleX,
      })
    } else {
      onChange({
        ...currentValue,
        scaleLocked: false,
      })
    }
  }, [currentValue, onChange])

  // Handle 3D toggle
  const handle3DToggle = useCallback(
    (enabled: boolean) => {
      setShow3D(enabled)
      onChange({
        ...currentValue,
        enable3D: enabled,
      })
    },
    [currentValue, onChange]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Get preview styles
  const previewStyles = transformValueToCSS(currentValue) || {}

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>{label}</label>
        )}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            style={styles.clearButton}
            title="Reset transform"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Live Preview */}
      <div style={styles.preview}>
        <div style={{ ...styles.previewBox, ...previewStyles }}>
          Aa
        </div>
      </div>

      {/* Rotate */}
      <div style={styles.section as CSSProperties}>
        <div style={styles.sectionTitle}>
          <RotateCw style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
          <label style={styles.sectionLabel}>Rotate</label>
        </div>
        <SliderInput
          value={currentValue.rotate}
          onChange={(v) => handleChange('rotate', v)}
          min={-360}
          max={360}
          disabled={readOnly}
          unit="deg"
        />
      </div>

      {/* Scale */}
      <div style={styles.section as CSSProperties}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            <Maximize2 style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
            <label style={styles.sectionLabel}>Scale</label>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={handleScaleLockToggle}
              style={currentValue.scaleLocked ? styles.linkButtonActive : styles.linkButton}
              title={currentValue.scaleLocked ? 'Click to unlink X and Y scale' : 'Click to link X and Y scale'}
            >
              {currentValue.scaleLocked ? (
                <Link style={{ width: '12px', height: '12px' }} />
              ) : (
                <Unlink style={{ width: '12px', height: '12px' }} />
              )}
            </button>
          )}
        </div>

        <div style={currentValue.scaleLocked ? {} : styles.grid}>
          <SliderInput
            label={currentValue.scaleLocked ? 'Scale' : 'Scale X'}
            value={currentValue.scaleX}
            onChange={(v) => handleScaleChange('scaleX', v)}
            min={0.1}
            max={3}
            step={0.1}
            disabled={readOnly}
          />
          {!currentValue.scaleLocked && (
            <SliderInput
              label="Scale Y"
              value={currentValue.scaleY}
              onChange={(v) => handleScaleChange('scaleY', v)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={readOnly}
            />
          )}
        </div>
      </div>

      {/* Skew */}
      <div style={styles.section as CSSProperties}>
        <label style={styles.sectionLabel}>Skew</label>
        <div style={styles.grid}>
          <SliderInput
            label="Skew X"
            value={currentValue.skewX}
            onChange={(v) => handleChange('skewX', v)}
            min={-45}
            max={45}
            disabled={readOnly}
            unit="deg"
          />
          <SliderInput
            label="Skew Y"
            value={currentValue.skewY}
            onChange={(v) => handleChange('skewY', v)}
            min={-45}
            max={45}
            disabled={readOnly}
            unit="deg"
          />
        </div>
      </div>

      {/* Translate */}
      <div style={styles.section as CSSProperties}>
        <div style={styles.translateRow}>
          <label style={styles.sectionLabel}>Translate</label>
          <select
            value={currentValue.translateUnit}
            onChange={(e) => handleChange('translateUnit', e.target.value as TranslateUnit)}
            disabled={readOnly}
            style={styles.select}
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
            <option value="%">%</option>
          </select>
        </div>
        <div style={styles.grid}>
          <div style={styles.inputGroup as CSSProperties}>
            <label style={styles.inputLabel as CSSProperties}>X</label>
            <input
              type="number"
              value={currentValue.translateX}
              onChange={(e) => handleChange('translateX', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup as CSSProperties}>
            <label style={styles.inputLabel as CSSProperties}>Y</label>
            <input
              type="number"
              value={currentValue.translateY}
              onChange={(e) => handleChange('translateY', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Transform Origin */}
      <div style={styles.section as CSSProperties}>
        <label style={styles.sectionLabel}>Transform Origin</label>
        <div style={styles.originRow}>
          <OriginGrid
            value={currentValue.origin}
            onChange={(v) => handleChange('origin', v)}
            disabled={readOnly}
          />
          <span style={styles.originLabel}>
            {currentValue.origin.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* 3D Section (Collapsible) */}
      <div style={styles.collapsible}>
        <button
          type="button"
          onClick={() => setShow3D(!show3D)}
          style={styles.collapsibleHeader}
        >
          <div style={styles.collapsibleTitle}>
            <Box style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
            <label style={styles.sectionLabel}>3D Transforms</label>
          </div>
          {show3D ? (
            <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
          ) : (
            <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
          )}
        </button>

        {show3D && (
          <div style={styles.collapsibleContent as CSSProperties}>
            {/* Enable 3D checkbox */}
            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                id="enable3d"
                checked={currentValue.enable3D}
                onChange={(e) => handle3DToggle(e.target.checked)}
                disabled={readOnly}
                style={styles.checkbox}
              />
              <label htmlFor="enable3d" style={styles.checkboxLabel}>
                Enable 3D Transforms
              </label>
            </div>

            {currentValue.enable3D && (
              <>
                {/* Perspective */}
                <div style={styles.inputGroup as CSSProperties}>
                  <label style={styles.inputLabel as CSSProperties}>
                    Perspective (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={2000}
                    value={currentValue.perspective ?? 1000}
                    onChange={(e) => handleChange('perspective', parseInt(e.target.value, 10) || 1000)}
                    disabled={readOnly}
                    style={styles.input}
                  />
                </div>

                {/* Rotate X/Y */}
                <div style={styles.grid}>
                  <SliderInput
                    label="Rotate X"
                    value={currentValue.rotateX ?? 0}
                    onChange={(v) => handleChange('rotateX', v)}
                    min={-180}
                    max={180}
                    disabled={readOnly}
                    unit="deg"
                  />
                  <SliderInput
                    label="Rotate Y"
                    value={currentValue.rotateY ?? 0}
                    onChange={(v) => handleChange('rotateY', v)}
                    min={-180}
                    max={180}
                    disabled={readOnly}
                    unit="deg"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const TransformField = memo(TransformFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for CSS transforms
 */
export function createTransformField(config: {
  label?: string
}): CustomField<TransformValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <TransformField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
