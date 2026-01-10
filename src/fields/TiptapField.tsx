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
import type { CustomField } from '@measured/puck'
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
  colorSwatch: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-200)',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  } as CSSProperties,
  highlightSwatch: {
    width: '32px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-200)',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  } as CSSProperties,
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px',
    padding: '0 8px 8px',
  } as CSSProperties,
  highlightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    padding: '8px',
  } as CSSProperties,
  fontSizeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
// Color Palette
// =============================================================================

const THEME_COLOR = { label: 'Theme (Auto)', value: 'inherit' }

const COLOR_CATEGORIES = [
  {
    label: 'Brand',
    colors: [
      { hex: '#2563eb', label: 'Blue 600' },
      { hex: '#3b82f6', label: 'Blue 500' },
      { hex: '#60a5fa', label: 'Blue 400' },
      { hex: '#0d9488', label: 'Teal 600' },
    ],
  },
  {
    label: 'Grays',
    colors: [
      { hex: '#000000', label: 'Black' },
      { hex: '#374151', label: 'Gray 700' },
      { hex: '#6b7280', label: 'Gray 500' },
      { hex: '#9ca3af', label: 'Gray 400' },
      { hex: '#ffffff', label: 'White' },
    ],
  },
  {
    label: 'Colors',
    colors: [
      { hex: '#dc2626', label: 'Red' },
      { hex: '#ea580c', label: 'Orange' },
      { hex: '#f59e0b', label: 'Amber' },
      { hex: '#16a34a', label: 'Green' },
      { hex: '#0891b2', label: 'Cyan' },
      { hex: '#7c3aed', label: 'Violet' },
      { hex: '#db2777', label: 'Pink' },
    ],
  },
]

const HIGHLIGHT_COLORS = [
  { hex: '#fef08a', label: 'Yellow' },
  { hex: '#bbf7d0', label: 'Green' },
  { hex: '#bfdbfe', label: 'Blue' },
  { hex: '#fecaca', label: 'Red' },
  { hex: '#e9d5ff', label: 'Purple' },
  { hex: '#fed7aa', label: 'Orange' },
]

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
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        <div style={styles.dropdown}>
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

  if (!isOpen) return null

  return (
    <div ref={popoverRef} style={styles.linkPopover}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
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
                <>
                  <DropdownItem onClick={() => { editor.chain().focus().unsetColor().run(); close(); }}>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        marginRight: '8px',
                        border: '1px solid var(--theme-elevation-300)',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, #fff 50%, #1f2937 50%)',
                      }}
                    />
                    {THEME_COLOR.label}
                  </DropdownItem>
                  <DropdownSeparator />
                  {COLOR_CATEGORIES.map((category) => (
                    <div key={category.label}>
                      <DropdownLabel>{category.label}</DropdownLabel>
                      <div style={styles.colorGrid}>
                        {category.colors.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => { editor.chain().focus().setColor(color.hex).run(); close(); }}
                            style={{ ...styles.colorSwatch, backgroundColor: color.hex }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <DropdownSeparator />
                  <div style={{ padding: '8px' }}>
                    <DropdownLabel>Custom Color</DropdownLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="color"
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                        style={{ width: '32px', height: '32px', padding: 0, border: '1px solid var(--theme-elevation-200)', borderRadius: '4px', cursor: 'pointer' }}
                        title="Pick any color"
                      />
                      <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>Pick any color</span>
                    </div>
                  </div>
                </>
              )}
            </ToolbarDropdown>

            {/* Highlight */}
            <ToolbarDropdown trigger={<Highlighter style={styles.icon} />} title="Highlight" isActive={formattingState?.isHighlight}>
              {(close) => (
                <>
                  <div style={styles.highlightGrid}>
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => { editor.chain().focus().toggleHighlight({ color: color.hex }).run(); close(); }}
                        style={{ ...styles.highlightSwatch, backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <DropdownItem onClick={() => { editor.chain().focus().unsetHighlight().run(); close(); }}>
                    Remove Highlight
                  </DropdownItem>
                </>
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
