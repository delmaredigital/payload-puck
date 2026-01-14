'use client'

/**
 * TiptapField - Rich Text Editor Field for Puck
 *
 * A custom Puck field that provides WYSIWYG rich text editing using Tiptap.
 * Outputs HTML content that can be rendered with dangerouslySetInnerHTML.
 *
 * Features:
 * - Theme-aware "inherit" color option for text that adapts to dark/light mode
 * - Expanded color palette organized by category
 * - Strikethrough and highlight text styling
 * - Font size options (small, normal, large, extra large)
 * - Full toolbar with all formatting options
 * - HTML source view/edit mode
 */

import React, { useCallback, memo, useState, useRef, useEffect, type CSSProperties } from 'react'
import type { CustomField } from '@puckeditor/core'
import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Extension } from '@tiptap/core'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Code,
  RemoveFormatting,
  Palette,
  ALargeSmall,
  X,
  ChevronDown,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Minus,
  CornerDownLeft,
  Pilcrow,
} from 'lucide-react'
import { useTheme } from '../theme'
import './tiptap-styles.css'
import './richtext-output.css'

// =============================================================================
// Injected Editor Styles
// =============================================================================

const TIPTAP_EDITOR_STYLES = `
.tiptap-editor h1 { font-size: 2em !important; font-weight: 700 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h2 { font-size: 1.5em !important; font-weight: 700 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h3 { font-size: 1.25em !important; font-weight: 600 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h4 { font-size: 1.1em !important; font-weight: 600 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h5 { font-size: 1em !important; font-weight: 600 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h6 { font-size: 0.9em !important; font-weight: 600 !important; margin: 1em 0 0.5em 0; }
.tiptap-editor h1:first-child, .tiptap-editor h2:first-child, .tiptap-editor h3:first-child,
.tiptap-editor h4:first-child, .tiptap-editor h5:first-child, .tiptap-editor h6:first-child { margin-top: 0; }
.tiptap-editor ul, .tiptap-editor ol { padding-left: 1.5em !important; margin: 0 0 1em 0; }
.tiptap-editor ul { list-style-type: disc !important; }
.tiptap-editor ol { list-style-type: decimal !important; }
.tiptap-editor li { margin: 0.25em 0; }
.tiptap-editor li p { margin: 0; }
.tiptap-editor blockquote { border-left: 4px solid var(--theme-elevation-200) !important; padding-left: 1em !important; margin: 1em 0 !important; font-style: italic !important; }
.tiptap-editor p { margin: 0 0 1em 0; }
.tiptap-editor p:last-child { margin-bottom: 0; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`

// Inject styles once when module loads
if (typeof document !== 'undefined') {
  const styleId = 'tiptap-editor-injected-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = TIPTAP_EDITOR_STYLES
    document.head.appendChild(style)
  }
}

// =============================================================================
// Styles
// =============================================================================

const styles = {
  icon: {
    width: '18px',
    height: '18px',
  } as CSSProperties,
  iconSmall: {
    width: '12px',
    height: '12px',
  } as CSSProperties,
  toolbarButton: {
    height: '28px',
    width: '28px',
    padding: 0,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.15s',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  } as CSSProperties,
  toolbarButtonActive: {
    backgroundColor: 'var(--theme-elevation-200)',
  } as CSSProperties,
  toolbarDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--theme-elevation-300)',
    margin: '0 4px',
    flexShrink: 0,
  } as CSSProperties,
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
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
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    fontWeight: 500,
  } as CSSProperties,
  dropdownSeparator: {
    height: '1px',
    backgroundColor: 'var(--theme-elevation-200)',
    margin: '4px 0',
  } as CSSProperties,
  linkPopover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: 'var(--theme-bg)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
    padding: '12px',
    width: '320px',
  } as CSSProperties,
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  } as CSSProperties,
  buttonPrimary: {
    padding: '6px 12px',
    backgroundColor: 'var(--theme-elevation-900)',
    color: 'var(--theme-bg)',
    fontSize: '14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  buttonSecondary: {
    padding: '6px 12px',
    color: 'var(--theme-elevation-600)',
    fontSize: '14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  } as CSSProperties,
  fieldContainer: {
    // puck-field class
  } as CSSProperties,
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--theme-elevation-700)',
    marginBottom: '8px',
  } as CSSProperties,
  editorWrapper: {
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '8px',
    backgroundColor: 'var(--theme-bg)',
    overflow: 'hidden',
  } as CSSProperties,
  toolbar: {
    borderBottom: '1px solid var(--theme-elevation-200)',
    backgroundColor: 'var(--theme-elevation-50)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '4px',
    padding: '8px',
  } as CSSProperties,
  editorContent: {
    minHeight: '200px',
    backgroundColor: 'var(--theme-bg)',
  } as CSSProperties,
  sourceTextarea: {
    width: '100%',
    minHeight: '200px',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: 'none',
    resize: 'vertical',
    outline: 'none',
  } as CSSProperties,
  fontSizeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(55px, 1fr))',
    gap: '4px',
    padding: '0 8px 8px',
  } as CSSProperties,
  fontSizeButton: {
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-200)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.15s',
  } as CSSProperties,
  customSizeInput: {
    width: '64px',
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    outline: 'none',
  } as CSSProperties,
  customSizeSelect: {
    padding: '4px',
    fontSize: '14px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '4px',
    outline: 'none',
  } as CSSProperties,
  customSizeApply: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: 'var(--theme-elevation-900)',
    color: 'var(--theme-bg)',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  sourceButton: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.15s',
    fontSize: '12px',
    height: '28px',
    padding: '0 8px',
    gap: '4px',
    flexShrink: 0,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  } as CSSProperties,
  loadingState: {
    minHeight: '200px',
    padding: '16px',
    color: 'var(--theme-elevation-400)',
  } as CSSProperties,
  // Color picker styles
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
    border: '1px solid var(--theme-elevation-200)',
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
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '6px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    outline: 'none',
  } as CSSProperties,
  colorPickerPreview: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-200)',
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
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  colorPickerOpacityValue: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'var(--theme-elevation-500)',
  } as CSSProperties,
  colorPickerOpacitySlider: {
    position: 'relative',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden',
    border: '1px solid var(--theme-elevation-200)',
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
    border: '1px solid var(--theme-elevation-400)',
    borderRadius: '2px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    pointerEvents: 'none',
  } as CSSProperties,
  colorPickerPresetsLabel: {
    fontSize: '11px',
    color: 'var(--theme-elevation-500)',
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
    border: '1px solid var(--theme-elevation-200)',
    outline: 'none',
    transition: 'transform 0.1s',
  } as CSSProperties,
  colorPickerPresetButtonSelected: {
    width: '22px',
    height: '22px',
    padding: 0,
    borderRadius: '4px',
    cursor: 'pointer',
    border: '2px solid var(--theme-elevation-800)',
    outline: '2px solid var(--theme-elevation-200)',
    outlineOffset: '1px',
  } as CSSProperties,
  colorPickerThemeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--theme-elevation-700)',
    transition: 'background-color 0.15s',
  } as CSSProperties,
  colorPickerThemeSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-300)',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #fff 50%, #1f2937 50%)',
  } as CSSProperties,
}

// =============================================================================
// Types
// =============================================================================

interface TiptapFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Font Size Extension
// =============================================================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run()
        },
    }
  },
})

// =============================================================================
// Color Utilities
// =============================================================================

/**
 * Validates and normalizes a hex color string
 */
function normalizeHex(hex: string): string {
  let clean = hex.replace(/^#/, '')
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('')
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return ''
  }
  return `#${clean.toLowerCase()}`
}

/**
 * Converts hex + opacity to rgba CSS string
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace(/^#/, '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
}

/**
 * Parses a color string (hex or rgba) and returns hex + opacity
 */
function parseColor(color: string | undefined): { hex: string; opacity: number } {
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
// Font Sizes
// =============================================================================

const FONT_SIZES = [
  { label: 'XS', value: '0.75rem', px: '12px' },
  { label: 'Small', value: '0.875rem', px: '14px' },
  { label: 'Normal', value: null, px: '16px' },
  { label: 'Medium', value: '1.125rem', px: '18px' },
  { label: 'Large', value: '1.25rem', px: '20px' },
  { label: 'XL', value: '1.5rem', px: '24px' },
  { label: '2XL', value: '1.875rem', px: '30px' },
  { label: '3XL', value: '2.25rem', px: '36px' },
  { label: '4XL', value: '3rem', px: '48px' },
]

const FONT_SIZE_UNITS = ['px', 'rem', 'em'] as const

// =============================================================================
// UI Components
// =============================================================================

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.toolbarButton,
        ...(isActive ? styles.toolbarButtonActive : {}),
        ...(hovered && !isActive ? { backgroundColor: 'var(--theme-elevation-100)' } : {}),
      }}
    >
      {children}
    </button>
  )
}

function ToolbarDropdown({
  trigger,
  children,
  title,
  isActive,
}: {
  trigger: React.ReactNode
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
  title: string
  isActive?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const activeElement = document.activeElement
      if (activeElement?.tagName === 'INPUT' && (activeElement as HTMLInputElement).type === 'color') {
        return
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && menuRef.current && dropdownRef.current) {
      const menu = menuRef.current
      const trigger = dropdownRef.current
      const triggerRect = trigger.getBoundingClientRect()
      const menuWidth = menu.offsetWidth
      const viewportWidth = window.innerWidth

      // Check if dropdown would overflow right edge of viewport
      const wouldOverflowRight = triggerRect.left + menuWidth > viewportWidth - 16
      setAlignRight(wouldOverflowRight)
    }
  }, [isOpen])

  const dropdownStyle: CSSProperties = {
    ...styles.dropdown,
    left: alignRight ? 'auto' : 0,
    right: alignRight ? 0 : 'auto',
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...styles.toolbarButton,
          ...(isActive ? styles.toolbarButtonActive : {}),
          ...(hovered && !isActive ? { backgroundColor: 'var(--theme-elevation-100)' } : {}),
        }}
      >
        {trigger}
      </button>
      {isOpen && (
        <div ref={menuRef} style={dropdownStyle}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

function DropdownItem({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.dropdownItem,
        ...(hovered ? { backgroundColor: 'var(--theme-elevation-100)' } : {}),
      }}
    >
      {children}
    </button>
  )
}

function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <div style={styles.dropdownLabel}>{children}</div>
}

function DropdownSeparator() {
  return <div style={styles.dropdownSeparator} />
}

// =============================================================================
// Tiptap Color Picker Component
// =============================================================================

interface TiptapColorPickerProps {
  currentColor: string | undefined
  onColorChange: (color: string | null) => void
  onClose: () => void
  showOpacity?: boolean
  mode?: 'text' | 'highlight'
}

function TiptapColorPicker({
  currentColor,
  onColorChange,
  onClose,
  showOpacity = true,
  mode = 'text',
}: TiptapColorPickerProps) {
  const theme = useTheme()
  const presets = theme.colorPresets
  const parsed = parseColor(currentColor)

  const [hex, setHex] = useState(parsed.hex)
  const [hexInput, setHexInput] = useState(parsed.hex)
  const [opacity, setOpacity] = useState(parsed.opacity)
  const [hoverTheme, setHoverTheme] = useState(false)

  // Apply color to editor (converts to rgba if opacity < 100)
  const applyColor = useCallback((h: string, o: number) => {
    if (o < 100) {
      onColorChange(hexToRgba(h, o))
    } else {
      onColorChange(h)
    }
  }, [onColorChange])

  const handleColorInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHex(newHex)
    setHexInput(newHex)
    applyColor(newHex, opacity)
  }, [opacity, applyColor])

  const handleHexInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setHexInput(input)
    const normalized = normalizeHex(input)
    if (normalized) {
      setHex(normalized)
      applyColor(normalized, opacity)
    }
  }, [opacity, applyColor])

  const handleHexInputBlur = useCallback(() => {
    setHexInput(hex)
  }, [hex])

  const handleOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value, 10)
    setOpacity(newOpacity)
    applyColor(hex, newOpacity)
  }, [hex, applyColor])

  const handlePresetClick = useCallback((preset: { hex: string; label: string }) => {
    setHex(preset.hex)
    setHexInput(preset.hex)
    setOpacity(100)
    applyColor(preset.hex, 100)
    onClose()
  }, [applyColor, onClose])

  const handleClearColor = useCallback(() => {
    onColorChange(null)
    onClose()
  }, [onColorChange, onClose])

  const previewColor = hexToRgba(hex, opacity)

  return (
    <div style={styles.colorPickerContainer as CSSProperties}>
      {/* Theme/Auto color option */}
      <button
        type="button"
        onClick={handleClearColor}
        onMouseEnter={() => setHoverTheme(true)}
        onMouseLeave={() => setHoverTheme(false)}
        style={{
          ...styles.colorPickerThemeButton,
          ...(hoverTheme ? { backgroundColor: 'var(--theme-elevation-50)' } : {}),
        }}
      >
        <span style={styles.colorPickerThemeSwatch} />
        {mode === 'text' ? 'Theme Color (Auto)' : 'Remove Highlight'}
      </button>

      {/* Color picker row: native picker + hex input + preview */}
      <div style={styles.colorPickerRow}>
        <input
          type="color"
          value={hex}
          onChange={handleColorInputChange}
          style={styles.colorPickerInput}
          title="Pick a color"
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          placeholder="#000000"
          style={styles.colorPickerHexInput}
        />
        <div
          style={styles.colorPickerPreview as CSSProperties}
          title={`${hex} at ${opacity}% opacity`}
        >
          <div style={styles.colorPickerCheckerboard as CSSProperties} />
          <div style={{ ...styles.colorPickerOverlay as CSSProperties, backgroundColor: previewColor }} />
        </div>
      </div>

      {/* Opacity slider */}
      {showOpacity && (
        <div style={styles.colorPickerOpacitySection as CSSProperties}>
          <div style={styles.colorPickerOpacityHeader}>
            <label style={styles.colorPickerOpacityLabel}>Opacity</label>
            <span style={styles.colorPickerOpacityValue}>{opacity}%</span>
          </div>
          <div style={styles.colorPickerOpacitySlider as CSSProperties}>
            <div style={styles.colorPickerCheckerboard as CSSProperties} />
            <div
              style={{
                ...styles.colorPickerOverlay as CSSProperties,
                background: `linear-gradient(to right, transparent 0%, ${hex} 100%)`,
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={handleOpacityChange}
              style={styles.colorPickerOpacityInputRange as CSSProperties}
            />
            <div
              style={{
                ...styles.colorPickerOpacityThumb as CSSProperties,
                left: `calc(${opacity}% - 2px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Preset swatches */}
      {presets.length > 0 && (
        <div>
          <div style={styles.colorPickerPresetsLabel}>Presets</div>
          <div style={styles.colorPickerPresetsGrid}>
            {presets.map((preset) => {
              const isSelected = hex.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    ...(isSelected ? styles.colorPickerPresetButtonSelected : styles.colorPickerPresetButton),
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

function LinkPopover({
  isOpen,
  onClose,
  onSetLink,
  onRemoveLink,
}: {
  isOpen: boolean
  onClose: () => void
  onSetLink: (url: string) => void
  onRemoveLink: () => void
}) {
  const [url, setUrl] = useState('')
  const [alignRight, setAlignRight] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Calculate position when opened
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const popover = popoverRef.current
      const rect = popover.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      // Check if would overflow right
      const wouldOverflowRight = rect.right > viewportWidth - 16
      setAlignRight(wouldOverflowRight)
    }
  }, [isOpen])

  if (!isOpen) return null

  const popoverStyle: CSSProperties = {
    ...styles.linkPopover,
    left: alignRight ? 'auto' : 0,
    right: alignRight ? 0 : 'auto',
  }

  return (
    <div ref={popoverRef} style={popoverStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--theme-elevation-700)' }}>URL</label>
        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (url) {
                onSetLink(url)
                setUrl('')
              }
            }
          }}
          style={styles.input}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              if (url) {
                onSetLink(url)
                setUrl('')
              }
            }}
            style={styles.buttonPrimary}
          >
            Add Link
          </button>
          <button
            type="button"
            onClick={() => {
              onRemoveLink()
              setUrl('')
            }}
            style={styles.buttonSecondary}
          >
            Remove Link
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Tiptap Extensions Factory
// =============================================================================

function createTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      strike: {},
      horizontalRule: {},
      hardBreak: {},
      link: {
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: var(--theme-elevation-700); text-decoration: underline;',
        },
      },
      underline: {},
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontSize,
    Superscript,
    Subscript,
  ]
}

// =============================================================================
// TiptapField Component
// =============================================================================

function TiptapFieldInner({ value, onChange, label, readOnly }: TiptapFieldProps) {
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [sourceContent, setSourceContent] = useState(value)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handleUpdate = useCallback(({ editor }: { editor: ReturnType<typeof useEditor> }) => {
    if (editor) {
      const html = editor.getHTML()
      onChangeRef.current(html)
    }
  }, [])

  const editor = useEditor({
    extensions: createTiptapExtensions(),
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[200px] p-4',
        style: 'min-height: 200px; padding: 16px; outline: none;',
      },
    },
    onUpdate: handleUpdate,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  })

  const formattingState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null
      return {
        isBold: e.isActive('bold'),
        isItalic: e.isActive('italic'),
        isUnderline: e.isActive('underline'),
        isStrike: e.isActive('strike'),
        isH1: e.isActive('heading', { level: 1 }),
        isH2: e.isActive('heading', { level: 2 }),
        isH3: e.isActive('heading', { level: 3 }),
        isH4: e.isActive('heading', { level: 4 }),
        isH5: e.isActive('heading', { level: 5 }),
        isH6: e.isActive('heading', { level: 6 }),
        isBulletList: e.isActive('bulletList'),
        isOrderedList: e.isActive('orderedList'),
        isBlockquote: e.isActive('blockquote'),
        isAlignLeft: e.isActive({ textAlign: 'left' }),
        isAlignCenter: e.isActive({ textAlign: 'center' }),
        isAlignRight: e.isActive({ textAlign: 'right' }),
        isAlignJustify: e.isActive({ textAlign: 'justify' }),
        isLink: e.isActive('link'),
        isHighlight: e.isActive('highlight'),
        isSuperscript: e.isActive('superscript'),
        isSubscript: e.isActive('subscript'),
      }
    },
  })

  if (!editor) {
    return (
      <div className="puck-field">
        {label && <label style={styles.label}>{label}</label>}
        <div style={styles.editorWrapper}>
          <div style={styles.loadingState}>Loading editor...</div>
        </div>
      </div>
    )
  }

  const setLink = (url: string) => {
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setIsLinkPopoverOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setIsLinkPopoverOpen(false)
  }

  return (
    <div className="puck-field">
      {label && <label style={styles.label}>{label}</label>}

      <div style={styles.editorWrapper}>
        {/* Toolbar */}
        {!readOnly && (
          <div style={styles.toolbar}>
            {/* Text Style */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={formattingState?.isBold} title="Bold">
              <Bold style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={formattingState?.isItalic} title="Italic">
              <Italic style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={formattingState?.isUnderline} title="Underline">
              <Underline style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={formattingState?.isStrike} title="Strikethrough">
              <Strikethrough style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={formattingState?.isSuperscript} title="Superscript">
              <SuperscriptIcon style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={formattingState?.isSubscript} title="Subscript">
              <SubscriptIcon style={styles.icon} />
            </ToolbarButton>

            <div style={styles.toolbarDivider} />

            {/* Headings Dropdown */}
            <ToolbarDropdown
              trigger={
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {formattingState?.isH1 ? <Heading1 style={styles.icon} /> :
                   formattingState?.isH2 ? <Heading2 style={styles.icon} /> :
                   formattingState?.isH3 ? <Heading3 style={styles.icon} /> :
                   formattingState?.isH4 ? <Heading4 style={styles.icon} /> :
                   formattingState?.isH5 ? <Heading5 style={styles.icon} /> :
                   formattingState?.isH6 ? <Heading6 style={styles.icon} /> :
                   <Pilcrow style={styles.icon} />}
                  <ChevronDown style={styles.iconSmall} />
                </span>
              }
              title="Text Type"
              isActive={formattingState?.isH1 || formattingState?.isH2 || formattingState?.isH3 || formattingState?.isH4 || formattingState?.isH5 || formattingState?.isH6}
            >
              {(close) => (
                <>
                  <DropdownItem onClick={() => { editor.chain().focus().setParagraph().run(); close(); }}>
                    <Pilcrow style={{ ...styles.icon, marginRight: '8px' }} />
                    Paragraph
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); close(); }}>
                    <Heading1 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>Heading 1</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); close(); }}>
                    <Heading2 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>Heading 2</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); close(); }}>
                    <Heading3 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 600 }}>Heading 3</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 4 }).run(); close(); }}>
                    <Heading4 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Heading 4</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 5 }).run(); close(); }}>
                    <Heading5 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>Heading 5</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 6 }).run(); close(); }}>
                    <Heading6 style={{ ...styles.icon, marginRight: '8px' }} />
                    <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--theme-elevation-600)' }}>Heading 6</span>
                  </DropdownItem>
                </>
              )}
            </ToolbarDropdown>

            <div style={styles.toolbarDivider} />

            {/* Font Size */}
            <ToolbarDropdown trigger={<ALargeSmall style={styles.icon} />} title="Font Size">
              {(close) => (
                <>
                  <DropdownLabel>Presets</DropdownLabel>
                  <div style={styles.fontSizeGrid}>
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size.label}
                        type="button"
                        onClick={() => {
                          if (size.value) {
                            editor.chain().focus().setFontSize(size.value).run()
                          } else {
                            editor.chain().focus().unsetFontSize().run()
                          }
                          close()
                        }}
                        style={styles.fontSizeButton}
                        title={size.px}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                  <DropdownSeparator />
                  <div style={{ padding: '8px' }}>
                    <DropdownLabel>Custom Size</DropdownLabel>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      <input
                        type="number"
                        placeholder="16"
                        min="8"
                        max="200"
                        style={styles.customSizeInput}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            const value = input.value
                            const unit = (input.nextElementSibling as HTMLSelectElement)?.value || 'px'
                            if (value) {
                              editor.chain().focus().setFontSize(`${value}${unit}`).run()
                              close()
                            }
                          }
                        }}
                      />
                      <select style={styles.customSizeSelect} defaultValue="px">
                        {FONT_SIZE_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={(e) => {
                          const container = (e.target as HTMLElement).parentElement
                          const input = container?.querySelector('input') as HTMLInputElement
                          const select = container?.querySelector('select') as HTMLSelectElement
                          const value = input?.value
                          const unit = select?.value || 'px'
                          if (value) {
                            editor.chain().focus().setFontSize(`${value}${unit}`).run()
                            close()
                          }
                        }}
                        style={styles.customSizeApply}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </ToolbarDropdown>

            <div style={styles.toolbarDivider} />

            {/* Lists */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={formattingState?.isBulletList} title="Bullet List">
              <List style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={formattingState?.isOrderedList} title="Numbered List">
              <ListOrdered style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={formattingState?.isBlockquote} title="Blockquote">
              <Quote style={styles.icon} />
            </ToolbarButton>

            <div style={styles.toolbarDivider} />

            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={formattingState?.isAlignLeft} title="Align Left">
              <AlignLeft style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={formattingState?.isAlignCenter} title="Align Center">
              <AlignCenter style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={formattingState?.isAlignRight} title="Align Right">
              <AlignRight style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={formattingState?.isAlignJustify} title="Justify">
              <AlignJustify style={styles.icon} />
            </ToolbarButton>

            <div style={styles.toolbarDivider} />

            {/* Link */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ToolbarButton onClick={() => setIsLinkPopoverOpen(!isLinkPopoverOpen)} isActive={formattingState?.isLink} title="Add Link">
                <Link style={styles.icon} />
              </ToolbarButton>
              <LinkPopover
                isOpen={isLinkPopoverOpen}
                onClose={() => setIsLinkPopoverOpen(false)}
                onSetLink={setLink}
                onRemoveLink={removeLink}
              />
            </div>

            {/* Text Color */}
            <ToolbarDropdown trigger={<Palette style={styles.icon} />} title="Text Color">
              {(close) => (
                <TiptapColorPicker
                  currentColor={editor.getAttributes('textStyle').color}
                  onColorChange={(color) => {
                    if (color) {
                      editor.chain().focus().setColor(color).run()
                    } else {
                      editor.chain().focus().unsetColor().run()
                    }
                  }}
                  onClose={close}
                  showOpacity={true}
                  mode="text"
                />
              )}
            </ToolbarDropdown>

            {/* Highlight */}
            <ToolbarDropdown trigger={<Highlighter style={styles.icon} />} title="Highlight" isActive={formattingState?.isHighlight}>
              {(close) => (
                <TiptapColorPicker
                  currentColor={editor.getAttributes('highlight').color}
                  onColorChange={(color) => {
                    if (color) {
                      editor.chain().focus().setHighlight({ color }).run()
                    } else {
                      editor.chain().focus().unsetHighlight().run()
                    }
                  }}
                  onClose={close}
                  showOpacity={true}
                  mode="highlight"
                />
              )}
            </ToolbarDropdown>

            <div style={styles.toolbarDivider} />

            {/* Insert Elements */}
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
              <Minus style={styles.icon} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHardBreak().run()} title="Hard Break (Shift+Enter)">
              <CornerDownLeft style={styles.icon} />
            </ToolbarButton>

            <div style={styles.toolbarDivider} />

            {/* Clear Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting">
              <RemoveFormatting style={styles.icon} />
            </ToolbarButton>

            {/* View Source */}
            <button
              type="button"
              onClick={() => {
                if (showSource) {
                  editor.commands.setContent(sourceContent)
                  onChange(sourceContent)
                } else {
                  setSourceContent(editor.getHTML())
                }
                setShowSource(!showSource)
              }}
              title="View Source"
              style={{
                ...styles.sourceButton,
                ...(showSource ? styles.toolbarButtonActive : {}),
              }}
            >
              <Code style={styles.icon} />
              Source
            </button>
          </div>
        )}

        {/* Editor or Source View */}
        {showSource ? (
          <textarea
            value={sourceContent}
            onChange={(e) => {
              setSourceContent(e.target.value)
              onChange(e.target.value)
            }}
            style={styles.sourceTextarea}
            placeholder="Edit HTML source..."
          />
        ) : (
          <div style={styles.editorContent}>
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  )
}

export const TiptapField = memo(TiptapFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

export function createTiptapField(config: {
  label?: string
  placeholder?: string
}): CustomField<string> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ name, value, onChange, readOnly }) => (
      <TiptapField
        key={`tiptap-${name}`}
        value={value || ''}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
