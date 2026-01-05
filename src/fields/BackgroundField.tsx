'use client'

/**
 * BackgroundField - Custom Puck field for unified background selection
 *
 * This component provides a tabbed interface for selecting:
 * - None: No background
 * - Solid: Single color with opacity
 * - Gradient: Linear or radial gradients with multiple stops
 * - Image: Background image from media library with sizing options
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { IconX } from '@tabler/icons-react'
import type {
  BackgroundValue,
  BackgroundImageValue,
  ColorValue,
  GradientValue,
  GradientMask,
  BackgroundOverlay,
} from './shared'
import { backgroundValueToCSS, colorValueToCSS, getBackgroundImageOpacity } from './shared'
import { ColorPickerField } from './ColorPickerField'
import { MediaField, type MediaReference } from './MediaField'
import { GradientEditor } from './GradientEditor'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
import { cn } from '../lib/utils'

// =============================================================================
// Types
// =============================================================================

type BackgroundType = 'none' | 'solid' | 'gradient' | 'image'

interface BackgroundFieldProps {
  value: BackgroundValue | null
  onChange: (value: BackgroundValue | null) => void
  label?: string
  readOnly?: boolean
  apiEndpoint?: string
  showOpacity?: boolean
  colorPresets?: Array<{ hex: string; label: string }>
}

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_VALUE: BackgroundValue = {
  type: 'none',
  solid: null,
  gradient: null,
  image: null,
}

const DEFAULT_GRADIENT: GradientValue = {
  type: 'linear',
  angle: 90,
  stops: [
    { color: { hex: '#000000', opacity: 100 }, position: 0 },
    { color: { hex: '#ffffff', opacity: 100 }, position: 100 },
  ],
  radialShape: 'circle',
  radialPosition: 'center',
}

const DEFAULT_IMAGE: BackgroundImageValue = {
  media: null,
  size: 'cover',
  position: 'center',
  repeat: 'no-repeat',
  attachment: 'scroll',
  opacity: 100,
  mask: undefined,
}

const DEFAULT_MASK: GradientMask = {
  enabled: false,
  direction: 'to-bottom',
  startOpacity: 100,
  endOpacity: 0,
  startPosition: 0,
  endPosition: 100,
}

const DEFAULT_OVERLAY: BackgroundOverlay = {
  enabled: false,
  type: 'solid',
  solid: { hex: '#000000', opacity: 50 },
  gradient: null,
}

// =============================================================================
// Tab Button Component
// =============================================================================

interface TabButtonProps {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

function TabButton({ active, onClick, disabled, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex-1',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

// =============================================================================
// Background Preview Component
// =============================================================================

interface BackgroundPreviewProps {
  value: BackgroundValue
}

function BackgroundPreview({ value }: BackgroundPreviewProps) {
  const style = backgroundValueToCSS(value)
  const imageOpacity = getBackgroundImageOpacity(value)
  const hasBackground = value.type !== 'none' && Object.keys(style).length > 0

  return (
    <div
      className={cn(
        'relative h-16 rounded-md border border-input overflow-hidden',
        !hasBackground && 'bg-muted'
      )}
    >
      {/* Checkerboard background for transparency preview */}
      {hasBackground && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
          }}
        />
      )}

      {/* Background layer */}
      {hasBackground && (
        <div
          className="absolute inset-0"
          style={{
            ...style,
            opacity: imageOpacity !== undefined ? imageOpacity : 1,
          }}
        />
      )}

      {!hasBackground && (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
          No background
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Image Options Component
// =============================================================================

interface ImageOptionsProps {
  value: BackgroundImageValue
  onChange: (value: BackgroundImageValue) => void
  readOnly?: boolean
  apiEndpoint?: string
}

function ImageOptionsInner({ value, onChange, readOnly, apiEndpoint }: ImageOptionsProps) {
  const handleMediaChange = useCallback(
    (media: MediaReference | null) => {
      onChange({ ...value, media })
    },
    [value, onChange]
  )

  const handleSizeChange = useCallback(
    (size: BackgroundImageValue['size']) => {
      onChange({ ...value, size })
    },
    [value, onChange]
  )

  const handlePositionChange = useCallback(
    (position: BackgroundImageValue['position']) => {
      onChange({ ...value, position })
    },
    [value, onChange]
  )

  const handleRepeatChange = useCallback(
    (repeat: BackgroundImageValue['repeat']) => {
      onChange({ ...value, repeat })
    },
    [value, onChange]
  )

  const handleAttachmentChange = useCallback(
    (attachment: BackgroundImageValue['attachment']) => {
      onChange({ ...value, attachment })
    },
    [value, onChange]
  )

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const opacity = parseInt(e.target.value, 10)
      onChange({ ...value, opacity })
    },
    [value, onChange]
  )

  const handleMaskToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({ ...value, mask: { ...DEFAULT_MASK, enabled: true } })
      } else {
        onChange({ ...value, mask: undefined })
      }
    },
    [value, onChange]
  )

  const handleMaskDirectionChange = useCallback(
    (direction: GradientMask['direction']) => {
      const currentMask = value.mask || DEFAULT_MASK
      onChange({ ...value, mask: { ...currentMask, direction, enabled: true } })
    },
    [value, onChange]
  )

  const handleMaskStartPositionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const startPosition = parseInt(e.target.value, 10)
      const currentMask = value.mask || DEFAULT_MASK
      onChange({ ...value, mask: { ...currentMask, startPosition, enabled: true } })
    },
    [value, onChange]
  )

  const handleMaskEndPositionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const endPosition = parseInt(e.target.value, 10)
      const currentMask = value.mask || DEFAULT_MASK
      onChange({ ...value, mask: { ...currentMask, endPosition, enabled: true } })
    },
    [value, onChange]
  )

  const opacity = value.opacity ?? 100
  const maskEnabled = value.mask?.enabled ?? false

  return (
    <div className="space-y-4">
      {/* Media Picker */}
      <MediaField
        value={value.media}
        onChange={handleMediaChange}
        readOnly={readOnly}
        apiEndpoint={apiEndpoint}
      />

      {/* Image Options - only show when image is selected */}
      {value.media && (
        <div className="space-y-3 pt-2 border-t border-border">
          {/* Opacity */}
          <div className="flex items-center gap-2 min-w-0">
            <Label className="text-xs text-muted-foreground w-16 flex-shrink-0">Opacity</Label>
            <div className="flex-1 min-w-0">
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={handleOpacityChange}
                disabled={readOnly}
                className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono w-8 text-right flex-shrink-0">
              {opacity}%
            </span>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-20">Size</Label>
            <Select
              value={value.size}
              onValueChange={(v) => handleSizeChange(v as BackgroundImageValue['size'])}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-20">Position</Label>
            <Select
              value={value.position}
              onValueChange={(v) => handlePositionChange(v as BackgroundImageValue['position'])}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repeat */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-20">Repeat</Label>
            <Select
              value={value.repeat}
              onValueChange={(v) => handleRepeatChange(v as BackgroundImageValue['repeat'])}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-repeat">No Repeat</SelectItem>
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="repeat-x">Repeat X</SelectItem>
                <SelectItem value="repeat-y">Repeat Y</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachment */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-20">Attachment</Label>
            <Select
              value={value.attachment}
              onValueChange={(v) => handleAttachmentChange(v as BackgroundImageValue['attachment'])}
              disabled={readOnly}
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fade to Transparent (Gradient Mask) */}
          <div className="space-y-2 pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={maskEnabled}
                onCheckedChange={handleMaskToggle}
                disabled={readOnly}
              />
              <span className="text-xs text-muted-foreground">Fade to transparent</span>
            </label>

            {maskEnabled && (
              <div className="space-y-2 pl-6">
                {/* Direction */}
                <div className="flex items-center gap-2 min-w-0">
                  <Label className="text-xs text-muted-foreground w-12 flex-shrink-0">Dir</Label>
                  <Select
                    value={value.mask?.direction || 'to-bottom'}
                    onValueChange={(v) => handleMaskDirectionChange(v as GradientMask['direction'])}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-top">To Top</SelectItem>
                      <SelectItem value="to-bottom">To Bottom</SelectItem>
                      <SelectItem value="to-left">To Left</SelectItem>
                      <SelectItem value="to-right">To Right</SelectItem>
                      <SelectItem value="to-top-left">To Top Left</SelectItem>
                      <SelectItem value="to-top-right">To Top Right</SelectItem>
                      <SelectItem value="to-bottom-left">To Bottom Left</SelectItem>
                      <SelectItem value="to-bottom-right">To Bottom Right</SelectItem>
                      <SelectItem value="from-center">From Center (Radial)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Position */}
                <div className="flex items-center gap-2 min-w-0">
                  <Label className="text-xs text-muted-foreground w-12 flex-shrink-0">Start</Label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value.mask?.startPosition ?? 0}
                      onChange={handleMaskStartPositionChange}
                      disabled={readOnly}
                      className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-8 text-right flex-shrink-0">
                    {value.mask?.startPosition ?? 0}%
                  </span>
                </div>

                {/* End Position */}
                <div className="flex items-center gap-2 min-w-0">
                  <Label className="text-xs text-muted-foreground w-12 flex-shrink-0">End</Label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value.mask?.endPosition ?? 100}
                      onChange={handleMaskEndPositionChange}
                      disabled={readOnly}
                      className="w-full h-1.5 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-8 text-right flex-shrink-0">
                    {value.mask?.endPosition ?? 100}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ImageOptions = memo(ImageOptionsInner)

// =============================================================================
// BackgroundField Component
// =============================================================================

function BackgroundFieldInner({
  value,
  onChange,
  label,
  readOnly,
  apiEndpoint = '/api/media',
  showOpacity = true,
  colorPresets,
}: BackgroundFieldProps) {
  const currentValue = value || DEFAULT_VALUE
  const currentType = currentValue.type

  // Handle type change
  const handleTypeChange = useCallback(
    (type: BackgroundType) => {
      const newValue: BackgroundValue = {
        ...currentValue,
        type,
      }

      // Initialize defaults for the new type if needed
      if (type === 'gradient' && !newValue.gradient) {
        newValue.gradient = DEFAULT_GRADIENT
      }
      if (type === 'image' && !newValue.image) {
        newValue.image = DEFAULT_IMAGE
      }

      onChange(newValue)
    },
    [currentValue, onChange]
  )

  // Handle solid color change
  const handleSolidChange = useCallback(
    (solid: ColorValue | null) => {
      onChange({ ...currentValue, solid })
    },
    [currentValue, onChange]
  )

  // Handle gradient change
  const handleGradientChange = useCallback(
    (gradient: GradientValue) => {
      onChange({ ...currentValue, gradient })
    },
    [currentValue, onChange]
  )

  // Handle image change
  const handleImageChange = useCallback(
    (image: BackgroundImageValue) => {
      onChange({ ...currentValue, image })
    },
    [currentValue, onChange]
  )

  // Handle overlay toggle
  const handleOverlayToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        onChange({ ...currentValue, overlay: { ...DEFAULT_OVERLAY, enabled: true } })
      } else {
        onChange({ ...currentValue, overlay: { ...DEFAULT_OVERLAY, enabled: false } })
      }
    },
    [currentValue, onChange]
  )

  // Handle overlay type change
  const handleOverlayTypeChange = useCallback(
    (type: 'solid' | 'gradient') => {
      const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY
      onChange({
        ...currentValue,
        overlay: {
          ...currentOverlay,
          type,
          enabled: true,
          // Initialize gradient if switching to gradient and not set
          gradient:
            type === 'gradient' && !currentOverlay.gradient ? DEFAULT_GRADIENT : currentOverlay.gradient,
        },
      })
    },
    [currentValue, onChange]
  )

  // Handle overlay solid color change
  const handleOverlaySolidChange = useCallback(
    (solid: ColorValue | null) => {
      const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY
      onChange({
        ...currentValue,
        overlay: { ...currentOverlay, solid, enabled: true },
      })
    },
    [currentValue, onChange]
  )

  // Handle overlay gradient change
  const handleOverlayGradientChange = useCallback(
    (gradient: GradientValue) => {
      const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY
      onChange({
        ...currentValue,
        overlay: { ...currentOverlay, gradient, enabled: true },
      })
    },
    [currentValue, onChange]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const overlayEnabled = currentValue.overlay?.enabled ?? false
  const overlayType = currentValue.overlay?.type ?? 'solid'

  return (
    <div className="puck-field space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <Label className="block text-sm font-medium text-foreground">{label}</Label>
        )}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear background"
            className="flex items-center justify-center w-6 h-6 rounded border-none bg-transparent cursor-pointer text-muted-foreground hover:bg-accent hover:text-destructive"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview */}
      <BackgroundPreview value={currentValue} />

      {/* Type Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        <TabButton
          active={currentType === 'none'}
          onClick={() => handleTypeChange('none')}
          disabled={readOnly}
        >
          None
        </TabButton>
        <TabButton
          active={currentType === 'solid'}
          onClick={() => handleTypeChange('solid')}
          disabled={readOnly}
        >
          Solid
        </TabButton>
        <TabButton
          active={currentType === 'gradient'}
          onClick={() => handleTypeChange('gradient')}
          disabled={readOnly}
        >
          Gradient
        </TabButton>
        <TabButton
          active={currentType === 'image'}
          onClick={() => handleTypeChange('image')}
          disabled={readOnly}
        >
          Image
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {currentType === 'none' && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            No background selected
          </div>
        )}

        {currentType === 'solid' && (
          <ColorPickerField
            value={currentValue.solid || null}
            onChange={handleSolidChange}
            readOnly={readOnly}
            showOpacity={showOpacity}
            presets={colorPresets}
          />
        )}

        {currentType === 'gradient' && (
          <GradientEditor
            value={currentValue.gradient || null}
            onChange={handleGradientChange}
            readOnly={readOnly}
          />
        )}

        {currentType === 'image' && (
          <div className="space-y-4">
            <ImageOptions
              value={currentValue.image || DEFAULT_IMAGE}
              onChange={handleImageChange}
              readOnly={readOnly}
              apiEndpoint={apiEndpoint}
            />

            {/* Overlay Section - only show when image is selected */}
            {currentValue.image?.media && (
              <div className="space-y-3 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={overlayEnabled}
                    onCheckedChange={handleOverlayToggle}
                    disabled={readOnly}
                  />
                  <span className="text-xs text-muted-foreground">Enable overlay</span>
                </label>

                {overlayEnabled && (
                  <div className="space-y-3">
                    {/* Overlay Type Toggle */}
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                      <TabButton
                        active={overlayType === 'solid'}
                        onClick={() => handleOverlayTypeChange('solid')}
                        disabled={readOnly}
                      >
                        Solid Color
                      </TabButton>
                      <TabButton
                        active={overlayType === 'gradient'}
                        onClick={() => handleOverlayTypeChange('gradient')}
                        disabled={readOnly}
                      >
                        Gradient
                      </TabButton>
                    </div>

                    {/* Overlay Editor */}
                    {overlayType === 'solid' ? (
                      <ColorPickerField
                        value={currentValue.overlay?.solid || null}
                        onChange={handleOverlaySolidChange}
                        readOnly={readOnly}
                        showOpacity={true}
                      />
                    ) : (
                      <GradientEditor
                        value={currentValue.overlay?.gradient || null}
                        onChange={handleOverlayGradientChange}
                        readOnly={readOnly}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const BackgroundField = memo(BackgroundFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for background selection
 */
export function createBackgroundField(config: {
  label?: string
  apiEndpoint?: string
  showOpacity?: boolean
  colorPresets?: Array<{ hex: string; label: string }>
} = {}): CustomField<BackgroundValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <BackgroundField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        apiEndpoint={config.apiEndpoint}
        showOpacity={config.showOpacity}
        colorPresets={config.colorPresets}
      />
    ),
  }
}
