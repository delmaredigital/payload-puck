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

import React, { useCallback, memo, type CSSProperties } from 'react'
import type { CustomField } from '@measured/puck'
import { X } from 'lucide-react'
import type {
  BackgroundValue,
  BackgroundImageValue,
  ColorValue,
  GradientValue,
  GradientMask,
  BackgroundOverlay,
} from './shared'
import { backgroundValueToCSS, getBackgroundImageOpacity } from './shared'
import { ColorPickerField } from './ColorPickerField'
import { MediaField, type MediaReference } from './MediaField'
import { GradientEditor } from './GradientEditor'

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
  tabContainer: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    backgroundColor: 'var(--theme-elevation-50)',
    borderRadius: '8px',
  } as CSSProperties,
  tabButton: {
    flex: 1,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--theme-elevation-500)',
    cursor: 'pointer',
  } as CSSProperties,
  tabButtonActive: {
    flex: 1,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'var(--theme-elevation-800)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
  } as CSSProperties,
  tabButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  previewContainer: {
    position: 'relative',
    height: '64px',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-150)',
    overflow: 'hidden',
  } as CSSProperties,
  previewEmpty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    backgroundColor: 'var(--theme-elevation-50)',
  } as CSSProperties,
  checkerboard: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
  } as CSSProperties,
  contentContainer: {
    minHeight: '100px',
  } as CSSProperties,
  emptyContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '96px',
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  imageOptionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as CSSProperties,
  optionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '8px',
    borderTop: '1px solid var(--theme-elevation-150)',
  } as CSSProperties,
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  optionLabel: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    width: '80px',
    flexShrink: 0,
  } as CSSProperties,
  optionLabelSmall: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    width: '48px',
    flexShrink: 0,
  } as CSSProperties,
  select: {
    flex: 1,
    height: '32px',
    padding: '0 8px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  selectSmall: {
    flex: 1,
    minWidth: 0,
    height: '28px',
    padding: '0 8px',
    fontSize: '12px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  slider: {
    flex: 1,
    minWidth: 0,
    height: '6px',
    accentColor: 'var(--theme-elevation-800)',
    cursor: 'pointer',
  } as CSSProperties,
  sliderValue: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
    width: '32px',
    textAlign: 'right',
    flexShrink: 0,
  } as CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
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
  } as CSSProperties,
  maskSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '24px',
  } as CSSProperties,
  overlaySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '12px',
  } as CSSProperties,
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
      style={{
        ...(active ? styles.tabButtonActive : styles.tabButton),
        ...(disabled ? styles.tabButtonDisabled : {}),
      }}
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
    <div style={styles.previewContainer as CSSProperties}>
      {/* Checkerboard background for transparency preview */}
      {hasBackground && <div style={styles.checkerboard as CSSProperties} />}

      {/* Background layer */}
      {hasBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...style,
            opacity: imageOpacity !== undefined ? imageOpacity : 1,
          } as CSSProperties}
        />
      )}

      {!hasBackground && (
        <div style={styles.previewEmpty}>No background</div>
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
    <div style={styles.imageOptionsContainer as CSSProperties}>
      {/* Media Picker */}
      <MediaField
        value={value.media}
        onChange={handleMediaChange}
        readOnly={readOnly}
        apiEndpoint={apiEndpoint}
      />

      {/* Image Options - only show when image is selected */}
      {value.media && (
        <div style={styles.optionsSection as CSSProperties}>
          {/* Opacity */}
          <div style={styles.optionRow}>
            <label style={styles.optionLabel}>Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={handleOpacityChange}
              disabled={readOnly}
              style={styles.slider}
            />
            <span style={styles.sliderValue as CSSProperties}>{opacity}%</span>
          </div>

          {/* Size */}
          <div style={styles.optionRow}>
            <label style={styles.optionLabel}>Size</label>
            <select
              value={value.size}
              onChange={(e) => handleSizeChange(e.target.value as BackgroundImageValue['size'])}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {/* Position */}
          <div style={styles.optionRow}>
            <label style={styles.optionLabel}>Position</label>
            <select
              value={value.position}
              onChange={(e) => handlePositionChange(e.target.value as BackgroundImageValue['position'])}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          {/* Repeat */}
          <div style={styles.optionRow}>
            <label style={styles.optionLabel}>Repeat</label>
            <select
              value={value.repeat}
              onChange={(e) => handleRepeatChange(e.target.value as BackgroundImageValue['repeat'])}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat X</option>
              <option value="repeat-y">Repeat Y</option>
            </select>
          </div>

          {/* Attachment */}
          <div style={styles.optionRow}>
            <label style={styles.optionLabel}>Attachment</label>
            <select
              value={value.attachment}
              onChange={(e) => handleAttachmentChange(e.target.value as BackgroundImageValue['attachment'])}
              disabled={readOnly}
              style={styles.select}
            >
              <option value="scroll">Scroll</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          {/* Fade to Transparent (Gradient Mask) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' } as CSSProperties}>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={maskEnabled}
                onChange={(e) => handleMaskToggle(e.target.checked)}
                disabled={readOnly}
                style={styles.checkbox}
              />
              <span style={styles.checkboxLabel}>Fade to transparent</span>
            </label>

            {maskEnabled && (
              <div style={styles.maskSection as CSSProperties}>
                {/* Direction */}
                <div style={styles.optionRow}>
                  <label style={styles.optionLabelSmall}>Dir</label>
                  <select
                    value={value.mask?.direction || 'to-bottom'}
                    onChange={(e) => handleMaskDirectionChange(e.target.value as GradientMask['direction'])}
                    disabled={readOnly}
                    style={styles.selectSmall}
                  >
                    <option value="to-top">To Top</option>
                    <option value="to-bottom">To Bottom</option>
                    <option value="to-left">To Left</option>
                    <option value="to-right">To Right</option>
                    <option value="to-top-left">To Top Left</option>
                    <option value="to-top-right">To Top Right</option>
                    <option value="to-bottom-left">To Bottom Left</option>
                    <option value="to-bottom-right">To Bottom Right</option>
                    <option value="from-center">From Center (Radial)</option>
                  </select>
                </div>

                {/* Start Position */}
                <div style={styles.optionRow}>
                  <label style={styles.optionLabelSmall}>Start</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value.mask?.startPosition ?? 0}
                    onChange={handleMaskStartPositionChange}
                    disabled={readOnly}
                    style={styles.slider}
                  />
                  <span style={styles.sliderValue as CSSProperties}>
                    {value.mask?.startPosition ?? 0}%
                  </span>
                </div>

                {/* End Position */}
                <div style={styles.optionRow}>
                  <label style={styles.optionLabelSmall}>End</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value.mask?.endPosition ?? 100}
                    onChange={handleMaskEndPositionChange}
                    disabled={readOnly}
                    style={styles.slider}
                  />
                  <span style={styles.sliderValue as CSSProperties}>
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
    <div className="puck-field" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {label && <label style={styles.label}>{label}</label>}
        {value && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear background"
            style={styles.clearButton}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Preview */}
      <BackgroundPreview value={currentValue} />

      {/* Type Tabs */}
      <div style={styles.tabContainer}>
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
      <div style={styles.contentContainer}>
        {currentType === 'none' && (
          <div style={styles.emptyContent}>No background selected</div>
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
          <div style={styles.imageOptionsContainer as CSSProperties}>
            <ImageOptions
              value={currentValue.image || DEFAULT_IMAGE}
              onChange={handleImageChange}
              readOnly={readOnly}
              apiEndpoint={apiEndpoint}
            />

            {/* Overlay Section - only show when image is selected */}
            {currentValue.image?.media && (
              <div style={styles.overlaySection as CSSProperties}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={overlayEnabled}
                    onChange={(e) => handleOverlayToggle(e.target.checked)}
                    disabled={readOnly}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxLabel}>Enable overlay</span>
                </label>

                {overlayEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' } as CSSProperties}>
                    {/* Overlay Type Toggle */}
                    <div style={styles.tabContainer}>
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
