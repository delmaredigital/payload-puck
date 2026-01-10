'use client'

/**
 * AnimationField - Custom Puck field for transition and entrance animation controls
 *
 * Provides comprehensive animation configuration with:
 * - 27 preset entrance animations organized by category
 * - Customizable intensity (distance, scale, rotate, blur)
 * - Transform origin control
 * - Advanced easing options (including spring/bounce)
 * - Scroll trigger settings
 * - Stagger support for child elements
 */

import React, { useCallback, memo, useState, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import type {
  AnimationValue,
  AdvancedEasingFunction,
  EntranceAnimation,
  AnimationOrigin,
  StaggerDirection,
} from './shared'
import {
  ANIMATION_CATEGORIES,
  DEFAULT_ANIMATION,
  getRelevantIntensityControls,
  getDefaultEasingForAnimation,
} from './shared'

// =============================================================================
// Types
// =============================================================================

interface AnimationFieldProps {
  value: AnimationValue | null
  onChange: (value: AnimationValue | null) => void
  label?: string
  readOnly?: boolean
  /** Whether to show stagger controls (for container components) */
  showStagger?: boolean
}

// =============================================================================
// Easing Options
// =============================================================================

const EASING_OPTIONS: Array<{ value: AdvancedEasingFunction; label: string; group: string }> = [
  // Standard
  { value: 'linear', label: 'Linear', group: 'Standard' },
  { value: 'ease', label: 'Ease', group: 'Standard' },
  { value: 'ease-in', label: 'Ease In', group: 'Standard' },
  { value: 'ease-out', label: 'Ease Out', group: 'Standard' },
  { value: 'ease-in-out', label: 'Ease In Out', group: 'Standard' },
  // Spring/Bounce
  { value: 'spring', label: 'Spring', group: 'Spring' },
  { value: 'spring-gentle', label: 'Spring Gentle', group: 'Spring' },
  { value: 'bounce', label: 'Bounce', group: 'Spring' },
  { value: 'bounce-in', label: 'Bounce In', group: 'Spring' },
  { value: 'bounce-out', label: 'Bounce Out', group: 'Spring' },
  // Back
  { value: 'back-in', label: 'Back In', group: 'Back' },
  { value: 'back-out', label: 'Back Out', group: 'Back' },
  { value: 'back-in-out', label: 'Back In Out', group: 'Back' },
  // Elastic
  { value: 'elastic', label: 'Elastic', group: 'Elastic' },
]

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
  sectionLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  select: {
    width: '100%',
    height: '36px',
    padding: '0 8px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  selectSmall: {
    width: '100%',
    height: '32px',
    padding: '0 8px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  controlsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '6px',
  } as CSSProperties,
  collapsibleContainer: {
    border: '1px solid var(--theme-elevation-100)',
    borderRadius: '6px',
    overflow: 'hidden',
  } as CSSProperties,
  collapsibleHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--theme-elevation-50)',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  collapsibleTitle: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  collapsibleContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
  } as CSSProperties,
  sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  sliderValue: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  slider: {
    width: '100%',
    height: '6px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  sliderDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  } as CSSProperties,
  originGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    width: '96px',
  } as CSSProperties,
  originButton: {
    width: '28px',
    height: '28px',
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
    width: '28px',
    height: '28px',
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
  originDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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
    fontSize: '14px',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  helpText: {
    fontSize: '10px',
    color: 'var(--theme-elevation-500)',
    marginTop: '-8px',
  } as CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as CSSProperties,
}

// =============================================================================
// Collapsible Section Component
// =============================================================================

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={styles.collapsibleContainer}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={styles.collapsibleHeader}
      >
        <span style={styles.collapsibleTitle}>{title}</span>
        {isOpen ? (
          <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--theme-elevation-500)' }} />
        ) : (
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--theme-elevation-500)' }} />
        )}
      </button>
      {isOpen && <div style={styles.collapsibleContent as CSSProperties}>{children}</div>}
    </div>
  )
}

// =============================================================================
// Origin Grid Component
// =============================================================================

interface OriginGridProps {
  value: AnimationOrigin
  onChange: (value: AnimationOrigin) => void
  disabled?: boolean
}

function OriginGrid({ value, onChange, disabled }: OriginGridProps) {
  const origins: AnimationOrigin[] = [
    'top-left', 'top', 'top-right',
    'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right',
  ]

  return (
    <div style={styles.originGrid}>
      {origins.map((origin) => {
        const isActive = value === origin
        return (
          <button
            key={origin}
            type="button"
            onClick={() => onChange(origin)}
            disabled={disabled}
            style={{
              ...(isActive ? styles.originButtonActive : styles.originButton),
              ...(disabled ? styles.originDisabled : {}),
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
// Slider Component
// =============================================================================

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  disabled?: boolean
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange, disabled }: SliderRowProps) {
  return (
    <div style={styles.sliderRow as CSSProperties}>
      <div style={styles.sliderHeader}>
        <label style={styles.sectionLabel as CSSProperties}>{label}</label>
        <span style={styles.sliderValue}>{value}{unit}</span>
      </div>
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
          ...(disabled ? styles.sliderDisabled : {}),
        }}
      />
    </div>
  )
}

// =============================================================================
// AnimationField Component
// =============================================================================

function AnimationFieldInner({
  value,
  onChange,
  label = 'Animation',
  readOnly,
  showStagger = false,
}: AnimationFieldProps) {
  const currentValue = value || DEFAULT_ANIMATION

  // Get which intensity controls to show based on animation type
  const intensityControls = getRelevantIntensityControls(currentValue.entrance || 'none')
  const hasIntensityControls = Object.values(intensityControls).some(Boolean)

  // Helpers to update specific fields
  const updateField = useCallback(
    <K extends keyof AnimationValue>(key: K, val: AnimationValue[K]) => {
      onChange({
        ...currentValue,
        [key]: val,
      })
    },
    [currentValue, onChange]
  )

  // Handle entrance animation change - also update default easing
  const handleEntranceChange = useCallback(
    (entrance: EntranceAnimation) => {
      const defaultEasing = getDefaultEasingForAnimation(entrance)
      onChange({
        ...currentValue,
        entrance,
        // Only set default easing if current is 'ease' (not explicitly set)
        easing: currentValue.easing === 'ease' ? defaultEasing : currentValue.easing,
      })
    },
    [currentValue, onChange]
  )

  // Handle stagger config updates
  const updateStagger = useCallback(
    (updates: Partial<NonNullable<AnimationValue['stagger']>>) => {
      onChange({
        ...currentValue,
        stagger: {
          enabled: currentValue.stagger?.enabled ?? false,
          delay: currentValue.stagger?.delay ?? 100,
          direction: currentValue.stagger?.direction ?? 'forward',
          ...currentValue.stagger,
          ...updates,
        },
      })
    },
    [currentValue, onChange]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const thresholdPercent = Math.round((currentValue.triggerThreshold ?? 0.1) * 100)

  // Format animation label
  const formatAnimationLabel = (anim: EntranceAnimation): string => {
    if (anim === 'none') return 'None'
    return anim
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="puck-field" style={styles.container}>
      {/* Header with label and clear */}
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

      {/* Animation Type Select (grouped by category) */}
      <div style={styles.inputGroup as CSSProperties}>
        <label style={styles.sectionLabel as CSSProperties}>Animation</label>
        <select
          value={currentValue.entrance || 'none'}
          onChange={(e) => handleEntranceChange(e.target.value as EntranceAnimation)}
          disabled={readOnly}
          style={styles.select}
        >
          {ANIMATION_CATEGORIES.map(({ category, label: catLabel, animations }) => (
            <optgroup key={category} label={catLabel}>
              {animations.map((anim) => (
                <option key={anim} value={anim}>
                  {formatAnimationLabel(anim)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Only show controls if animation is not 'none' */}
      {currentValue.entrance && currentValue.entrance !== 'none' && (
        <>
          {/* Timing Controls */}
          <div style={styles.controlsPanel as CSSProperties}>
            <SliderRow
              label="Duration"
              value={currentValue.entranceDuration ?? 500}
              min={100}
              max={2000}
              step={50}
              unit="ms"
              onChange={(v) => updateField('entranceDuration', v)}
              disabled={readOnly}
            />
            <SliderRow
              label="Delay"
              value={currentValue.entranceDelay ?? 0}
              min={0}
              max={2000}
              step={50}
              unit="ms"
              onChange={(v) => updateField('entranceDelay', v)}
              disabled={readOnly}
            />
          </div>

          {/* Intensity Controls (context-aware) */}
          {hasIntensityControls && (
            <CollapsibleSection title="Intensity">
              {intensityControls.showDistance && (
                <SliderRow
                  label="Distance"
                  value={currentValue.distance ?? 24}
                  min={8}
                  max={200}
                  step={4}
                  unit="px"
                  onChange={(v) => updateField('distance', v)}
                  disabled={readOnly}
                />
              )}
              {intensityControls.showScale && (
                <SliderRow
                  label="Scale From"
                  value={Math.round((currentValue.scaleFrom ?? 0.9) * 100)}
                  min={10}
                  max={200}
                  step={5}
                  unit="%"
                  onChange={(v) => updateField('scaleFrom', v / 100)}
                  disabled={readOnly}
                />
              )}
              {intensityControls.showRotate && (
                <SliderRow
                  label="Rotation"
                  value={currentValue.rotateAngle ?? 15}
                  min={-180}
                  max={180}
                  step={5}
                  unit="deg"
                  onChange={(v) => updateField('rotateAngle', v)}
                  disabled={readOnly}
                />
              )}
              {intensityControls.showBlur && (
                <SliderRow
                  label="Blur"
                  value={currentValue.blurAmount ?? 8}
                  min={0}
                  max={50}
                  step={1}
                  unit="px"
                  onChange={(v) => updateField('blurAmount', v)}
                  disabled={readOnly}
                />
              )}
            </CollapsibleSection>
          )}

          {/* Transform Origin */}
          <CollapsibleSection title="Transform Origin">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <OriginGrid
                value={currentValue.origin ?? 'center'}
                onChange={(v) => updateField('origin', v)}
                disabled={readOnly}
              />
            </div>
          </CollapsibleSection>

          {/* Easing */}
          <CollapsibleSection title="Easing">
            <select
              value={currentValue.easing || 'ease'}
              onChange={(e) => updateField('easing', e.target.value as AdvancedEasingFunction)}
              disabled={readOnly}
              style={styles.selectSmall}
            >
              {['Standard', 'Spring', 'Back', 'Elastic'].map((group) => (
                <optgroup key={group} label={group}>
                  {EASING_OPTIONS.filter(e => e.group === group).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p style={styles.helpText}>
              Spring and bounce easings create overshoot effects
            </p>
          </CollapsibleSection>

          {/* Scroll Trigger */}
          <CollapsibleSection title="Scroll Trigger" defaultOpen>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' } as CSSProperties}>
              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  id="trigger-on-scroll"
                  checked={currentValue.triggerOnScroll ?? true}
                  onChange={(e) => updateField('triggerOnScroll', e.target.checked)}
                  disabled={readOnly}
                  style={styles.checkbox}
                />
                <label htmlFor="trigger-on-scroll" style={styles.checkboxLabel}>
                  Trigger on scroll
                </label>
              </div>

              {currentValue.triggerOnScroll && (
                <>
                  <SliderRow
                    label="Threshold"
                    value={thresholdPercent}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) => updateField('triggerThreshold', v / 100)}
                    disabled={readOnly}
                  />
                  <p style={styles.helpText}>
                    Element visibility % before animation triggers
                  </p>

                  <div style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="animate-once"
                      checked={currentValue.triggerOnce ?? true}
                      onChange={(e) => updateField('triggerOnce', e.target.checked)}
                      disabled={readOnly}
                      style={styles.checkbox}
                    />
                    <label htmlFor="animate-once" style={styles.checkboxLabel}>
                      Animate only once
                    </label>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Stagger Controls (only for container components) */}
          {showStagger && (
            <CollapsibleSection title="Stagger Children">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' } as CSSProperties}>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="stagger-enabled"
                    checked={currentValue.stagger?.enabled ?? false}
                    onChange={(e) => updateStagger({ enabled: e.target.checked })}
                    disabled={readOnly}
                    style={styles.checkbox}
                  />
                  <label htmlFor="stagger-enabled" style={styles.checkboxLabel}>
                    Enable stagger
                  </label>
                </div>

                {currentValue.stagger?.enabled && (
                  <>
                    <SliderRow
                      label="Delay Between"
                      value={currentValue.stagger?.delay ?? 100}
                      min={50}
                      max={500}
                      step={25}
                      unit="ms"
                      onChange={(v) => updateStagger({ delay: v })}
                      disabled={readOnly}
                    />

                    <SliderRow
                      label="Max Total Delay"
                      value={currentValue.stagger?.maxDelay ?? 2000}
                      min={500}
                      max={5000}
                      step={100}
                      unit="ms"
                      onChange={(v) => updateStagger({ maxDelay: v })}
                      disabled={readOnly}
                    />

                    <div style={styles.inputGroup as CSSProperties}>
                      <label style={styles.sectionLabel as CSSProperties}>Direction</label>
                      <select
                        value={currentValue.stagger?.direction ?? 'forward'}
                        onChange={(e) => updateStagger({ direction: e.target.value as StaggerDirection })}
                        disabled={readOnly}
                        style={styles.selectSmall}
                      >
                        <option value="forward">Forward</option>
                        <option value="reverse">Reverse</option>
                        <option value="center">From Center</option>
                        <option value="edges">From Edges</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>
          )}
        </>
      )}
    </div>
  )
}

export const AnimationField = memo(AnimationFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateAnimationFieldConfig {
  label?: string
  /** Whether to show stagger controls (for container components like Flex, Grid) */
  showStagger?: boolean
}

/**
 * Creates a Puck field configuration for animation control
 *
 * @example
 * ```ts
 * fields: {
 *   animation: createAnimationField({ label: 'Animation' }),
 *   // For containers with child elements:
 *   animation: createAnimationField({ label: 'Animation', showStagger: true }),
 * }
 * ```
 */
export function createAnimationField(config: CreateAnimationFieldConfig = {}): CustomField<AnimationValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <AnimationField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        showStagger={config.showStagger}
      />
    ),
  }
}
