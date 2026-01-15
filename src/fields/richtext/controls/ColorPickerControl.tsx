'use client'

/**
 * ColorPickerControl - Text color control for Puck RichText toolbar
 *
 * A dropdown color picker with:
 * - Native color input
 * - Hex input with validation
 * - Opacity slider (RGBA support)
 * - Theme color presets
 * - "Theme Color (Auto)" option for dark/light mode adaptation
 */

import React, { useState, useRef, useCallback, type CSSProperties } from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { useTheme } from '../../../theme'
import { parseColor, normalizeHex, hexToRgba, controlStyles } from './shared'
import { DropdownPortal } from './DropdownPortal'
import type { Editor } from '@tiptap/react'

interface ColorPickerControlProps {
  editor: Editor
  currentColor: string | undefined
}

export function ColorPickerControl({ editor, currentColor }: ColorPickerControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleColorChange = useCallback(
    (color: string | null) => {
      if (color) {
        editor.chain().focus().setColor(color).run()
      } else {
        editor.chain().focus().unsetColor().run()
      }
    },
    [editor]
  )

  const close = useCallback(() => setIsOpen(false), [])

  const hasColor = Boolean(currentColor)

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Text Color"
        style={{
          ...controlStyles.dropdownTrigger,
          ...(hasColor ? controlStyles.dropdownTriggerActive : {}),
        }}
      >
        <Palette style={controlStyles.icon} />
        <ChevronDown style={{ width: '12px', height: '12px' }} />
        {/* Color indicator */}
        {currentColor && (
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '3px',
              borderRadius: '1px',
              backgroundColor: currentColor,
            }}
          />
        )}
      </button>

      <DropdownPortal isOpen={isOpen} onClose={close} triggerRef={triggerRef} minWidth={260}>
        <ColorPickerPanel
          currentColor={currentColor}
          onColorChange={handleColorChange}
          onClose={close}
          mode="text"
        />
      </DropdownPortal>
    </div>
  )
}

// =============================================================================
// Color Picker Panel (shared between text and highlight)
// =============================================================================

interface ColorPickerPanelProps {
  currentColor: string | undefined
  onColorChange: (color: string | null) => void
  onClose: () => void
  mode: 'text' | 'highlight'
  showOpacity?: boolean
}

export function ColorPickerPanel({
  currentColor,
  onColorChange,
  onClose,
  mode,
  showOpacity = true,
}: ColorPickerPanelProps) {
  const theme = useTheme()
  const presets = theme.colorPresets
  const parsed = parseColor(currentColor)

  const [hex, setHex] = useState(parsed.hex)
  const [hexInput, setHexInput] = useState(parsed.hex)
  const [opacity, setOpacity] = useState(parsed.opacity)
  const [hoverTheme, setHoverTheme] = useState(false)

  // Apply color (converts to rgba if opacity < 100)
  const applyColor = useCallback(
    (h: string, o: number) => {
      if (o < 100) {
        onColorChange(hexToRgba(h, o))
      } else {
        onColorChange(h)
      }
    },
    [onColorChange]
  )

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHex = e.target.value
      setHex(newHex)
      setHexInput(newHex)
      applyColor(newHex, opacity)
    },
    [opacity, applyColor]
  )

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      setHexInput(input)
      const normalized = normalizeHex(input)
      if (normalized) {
        setHex(normalized)
        applyColor(normalized, opacity)
      }
    },
    [opacity, applyColor]
  )

  const handleHexInputBlur = useCallback(() => {
    setHexInput(hex)
  }, [hex])

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newOpacity = parseInt(e.target.value, 10)
      setOpacity(newOpacity)
      applyColor(hex, newOpacity)
    },
    [hex, applyColor]
  )

  const handlePresetClick = useCallback(
    (preset: { hex: string; label: string }) => {
      setHex(preset.hex)
      setHexInput(preset.hex)
      setOpacity(100)
      applyColor(preset.hex, 100)
      onClose()
    },
    [applyColor, onClose]
  )

  const handleClearColor = useCallback(() => {
    onColorChange(null)
    onClose()
  }, [onColorChange, onClose])

  const previewColor = hexToRgba(hex, opacity)

  return (
    <div style={controlStyles.colorPickerContainer as CSSProperties}>
      {/* Theme/Auto color option */}
      <button
        type="button"
        onClick={handleClearColor}
        onMouseEnter={() => setHoverTheme(true)}
        onMouseLeave={() => setHoverTheme(false)}
        style={{
          ...controlStyles.colorPickerThemeButton,
          ...(hoverTheme ? { backgroundColor: 'var(--puck-color-grey-01)' } : {}),
        }}
      >
        <span style={controlStyles.colorPickerThemeSwatch} />
        {mode === 'text' ? 'Theme Color (Auto)' : 'Remove Highlight'}
      </button>

      {/* Color picker row: native picker + hex input + preview */}
      <div style={controlStyles.colorPickerRow}>
        <input
          type="color"
          value={hex}
          onChange={handleColorInputChange}
          style={controlStyles.colorPickerInput}
          title="Pick a color"
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          placeholder="#000000"
          style={controlStyles.colorPickerHexInput}
        />
        <div
          style={controlStyles.colorPickerPreview as CSSProperties}
          title={`${hex} at ${opacity}% opacity`}
        >
          <div style={controlStyles.colorPickerCheckerboard as CSSProperties} />
          <div
            style={{ ...(controlStyles.colorPickerOverlay as CSSProperties), backgroundColor: previewColor }}
          />
        </div>
      </div>

      {/* Opacity slider */}
      {showOpacity && (
        <div style={controlStyles.colorPickerOpacitySection as CSSProperties}>
          <div style={controlStyles.colorPickerOpacityHeader}>
            <label style={controlStyles.colorPickerOpacityLabel}>Opacity</label>
            <span style={controlStyles.colorPickerOpacityValue}>{opacity}%</span>
          </div>
          <div style={controlStyles.colorPickerOpacitySlider as CSSProperties}>
            <div style={controlStyles.colorPickerCheckerboard as CSSProperties} />
            <div
              style={{
                ...(controlStyles.colorPickerOverlay as CSSProperties),
                background: `linear-gradient(to right, transparent 0%, ${hex} 100%)`,
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={handleOpacityChange}
              style={controlStyles.colorPickerOpacityInputRange as CSSProperties}
            />
            <div
              style={{
                ...(controlStyles.colorPickerOpacityThumb as CSSProperties),
                left: `calc(${opacity}% - 2px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Preset swatches */}
      {presets.length > 0 && (
        <div>
          <div style={controlStyles.colorPickerPresetsLabel}>Presets</div>
          <div style={controlStyles.colorPickerPresetsGrid as CSSProperties}>
            {presets.map((preset) => {
              const isSelected = hex.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    ...(isSelected
                      ? controlStyles.colorPickerPresetButtonSelected
                      : controlStyles.colorPickerPresetButton),
                    backgroundColor: preset.hex,
                  }}
                  title={preset.label}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
