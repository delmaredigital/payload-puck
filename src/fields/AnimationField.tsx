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

import React, { useCallback, memo, useState } from 'react'
import type { CustomField } from '@measured/puck'
import { IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
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
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
import { cn } from '../lib/utils'

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
    <div className="border border-border/50 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {isOpen ? (
          <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-3 space-y-3">{children}</div>}
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
    <div className="grid grid-cols-3 gap-1 w-24">
      {origins.map((origin) => (
        <button
          key={origin}
          type="button"
          onClick={() => onChange(origin)}
          disabled={disabled}
          className={cn(
            'w-7 h-7 rounded border transition-colors',
            value === origin
              ? 'bg-primary border-primary'
              : 'bg-muted/50 border-border hover:bg-muted hover:border-border/80',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={origin.replace('-', ' ')}
        >
          <span
            className={cn(
              'block w-2 h-2 rounded-full mx-auto',
              value === origin ? 'bg-primary-foreground' : 'bg-muted-foreground/40'
            )}
          />
        </button>
      ))}
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
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="puck-field space-y-3">
      {/* Header with label and clear */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Animation Type Select (grouped by category) */}
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Animation
        </Label>
        <Select
          value={currentValue.entrance || 'none'}
          onValueChange={(v) => handleEntranceChange(v as EntranceAnimation)}
          disabled={readOnly}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select animation">
              {formatAnimationLabel(currentValue.entrance || 'none')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_CATEGORIES.map(({ category, label: catLabel, animations }, idx) => (
              <SelectGroup key={category}>
                <SelectLabel
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70',
                    'px-2 py-1.5 bg-muted/50',
                    idx > 0 && 'mt-1 border-t border-border/50'
                  )}
                >
                  {catLabel}
                </SelectLabel>
                {animations.map((anim) => (
                  <SelectItem key={anim} value={anim}>
                    {formatAnimationLabel(anim)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Only show controls if animation is not 'none' */}
      {currentValue.entrance && currentValue.entrance !== 'none' && (
        <>
          {/* Timing Controls */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-md">
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
            <div className="flex items-center justify-center">
              <OriginGrid
                value={currentValue.origin ?? 'center'}
                onChange={(v) => updateField('origin', v)}
                disabled={readOnly}
              />
            </div>
          </CollapsibleSection>

          {/* Easing */}
          <CollapsibleSection title="Easing">
            <Select
              value={currentValue.easing || 'ease'}
              onValueChange={(v) => updateField('easing', v as AdvancedEasingFunction)}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select easing" />
              </SelectTrigger>
              <SelectContent>
                {['Standard', 'Spring', 'Back', 'Elastic'].map((group, idx) => (
                  <SelectGroup key={group}>
                    <SelectLabel
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70',
                        'px-2 py-1.5 bg-muted/50',
                        idx > 0 && 'mt-1 border-t border-border/50'
                      )}
                    >
                      {group}
                    </SelectLabel>
                    {EASING_OPTIONS.filter(e => e.group === group).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-2">
              Spring and bounce easings create overshoot effects
            </p>
          </CollapsibleSection>

          {/* Scroll Trigger */}
          <CollapsibleSection title="Scroll Trigger" defaultOpen>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trigger-on-scroll"
                  checked={currentValue.triggerOnScroll ?? true}
                  onCheckedChange={(checked) => updateField('triggerOnScroll', !!checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="trigger-on-scroll" className="text-sm cursor-pointer">
                  Trigger on scroll
                </Label>
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
                  <p className="text-[10px] text-muted-foreground -mt-2">
                    Element visibility % before animation triggers
                  </p>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="animate-once"
                      checked={currentValue.triggerOnce ?? true}
                      onCheckedChange={(checked) => updateField('triggerOnce', !!checked)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="animate-once" className="text-sm cursor-pointer">
                      Animate only once
                    </Label>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Stagger Controls (only for container components) */}
          {showStagger && (
            <CollapsibleSection title="Stagger Children">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stagger-enabled"
                    checked={currentValue.stagger?.enabled ?? false}
                    onCheckedChange={(checked) => updateStagger({ enabled: !!checked })}
                    disabled={readOnly}
                  />
                  <Label htmlFor="stagger-enabled" className="text-sm cursor-pointer">
                    Enable stagger
                  </Label>
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

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Direction
                      </Label>
                      <Select
                        value={currentValue.stagger?.direction ?? 'forward'}
                        onValueChange={(v) => updateStagger({ direction: v as StaggerDirection })}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="forward">Forward</SelectItem>
                          <SelectItem value="reverse">Reverse</SelectItem>
                          <SelectItem value="center">From Center</SelectItem>
                          <SelectItem value="edges">From Edges</SelectItem>
                        </SelectContent>
                      </Select>
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
