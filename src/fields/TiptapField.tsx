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

import React, { useCallback, memo, useState, useRef, useEffect } from 'react'
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
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconLink,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconBlockquote,
  IconCode,
  IconClearFormatting,
  IconPalette,
  IconTextSize,
  IconX,
  IconChevronDown,
  IconSuperscript,
  IconSubscript,
  IconSeparatorHorizontal,
  IconCornerDownLeft,
  IconLetterP,
} from '@tabler/icons-react'
import { cn } from '../lib/utils'
import './tiptap-styles.css'
import './richtext-output.css'

// =============================================================================
// Injected Editor Styles
// These are injected directly to ensure styles load regardless of bundler config
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
.tiptap-editor blockquote { border-left: 4px solid #e5e7eb !important; padding-left: 1em !important; margin: 1em 0 !important; font-style: italic !important; }
.tiptap-editor p { margin: 0 0 1em 0; }
.tiptap-editor p:last-child { margin-bottom: 0; }
`

// Inject styles once when module loads
if (typeof document !== 'undefined') {
  const styleId = 'tiptap-editor-injected-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = TIPTAP_EDITOR_STYLES
    document.head.appendChild(style)
    console.log('[TipTap] Injected editor styles')
  }

  // Debug: Check if CSS file was loaded
  const stylesheets = Array.from(document.styleSheets)
  const hasTiptapCSS = stylesheets.some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule =>
        rule.cssText?.includes('.tiptap-editor h1')
      )
    } catch { return false }
  })
  console.log('[TipTap] CSS file loaded:', hasTiptapCSS)
}

// =============================================================================
// Reusable Tailwind Class Constants
// =============================================================================

const ICON_SIZE = 'w-[18px] h-[18px]'
const TOOLBAR_BUTTON = 'h-7 w-7 p-0 flex-shrink-0'
const TOOLBAR_DIVIDER = 'w-px h-6 bg-gray-300 mx-1 flex-shrink-0'

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
// Color Palette - Organized by Category
// =============================================================================

// Special "inherit" color means remove any color styling, inherit from parent
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

// Highlight colors (background)
const HIGHLIGHT_COLORS = [
  { hex: '#fef08a', label: 'Yellow' },
  { hex: '#bbf7d0', label: 'Green' },
  { hex: '#bfdbfe', label: 'Blue' },
  { hex: '#fecaca', label: 'Red' },
  { hex: '#e9d5ff', label: 'Purple' },
  { hex: '#fed7aa', label: 'Orange' },
]

// Font size options - expanded preset sizes
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

// Font size units for custom input
const FONT_SIZE_UNITS = ['px', 'rem', 'em'] as const

// =============================================================================
// Standalone UI Components (no external dependencies)
// =============================================================================

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
  className = '',
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex items-center justify-center rounded transition-colors',
        TOOLBAR_BUTTON,
        isActive && 'bg-gray-200',
        !isActive && 'bg-transparent',
        className
      )}
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close if a color input has focus (native color picker popup is open)
      // The native picker is rendered outside our DOM, so clicks in it would
      // otherwise trigger a close since they're not contained in dropdownRef
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
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        className={cn(
          'inline-flex items-center justify-center rounded transition-colors',
          TOOLBAR_BUTTON,
          isActive && 'bg-gray-200',
          !isActive && 'bg-transparent'
        )}
      >
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]">
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

function DropdownItem({
  onClick,
  children,
  className = '',
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors
        flex items-center
        ${className}
      `}
    >
      {children}
    </button>
  )
}

function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1 text-xs text-gray-500 font-medium">
      {children}
    </div>
  )
}

function DropdownSeparator() {
  return <div className="h-px bg-gray-200 my-1" />
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
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 w-80"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">URL</label>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (url) {
                onSetLink(url)
                setUrl('')
              }
            }}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Add Link
          </button>
          <button
            type="button"
            onClick={() => {
              onRemoveLink()
              setUrl('')
            }}
            className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-md"
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
// Each editor instance needs its own extension instances to avoid
// "duplicate extension" warnings when multiple editors exist on the page.
// =============================================================================

function createTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      // Enable strikethrough from StarterKit
      strike: {},
      // Horizontal rule and hard break are included by default
      horizontalRule: {},
      hardBreak: {},
      // Configure StarterKit's built-in Link and Underline (v3+)
      // These are included in StarterKit by default, so we configure them here
      // instead of adding duplicate extensions
      link: {
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
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
    Highlight.configure({
      multicolor: true,
    }),
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

  // Use a ref to store the onChange callback to avoid recreating the editor
  // when onChange reference changes (which happens on every Puck render)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Stable onUpdate handler that uses the ref
  const handleUpdate = useCallback(({ editor }: { editor: ReturnType<typeof useEditor> }) => {
    if (editor) {
      const html = editor.getHTML()
      onChangeRef.current(html)
    }
  }, [])

  // Note: The "duplicate extension" warning is a known Tiptap limitation with React Strict Mode
  // and multiple editor instances. It doesn't affect functionality.
  // See: https://github.com/ueberdosis/tiptap/issues/2890
  const editor = useEditor({
    extensions: createTiptapExtensions(),
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: handleUpdate,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  })

  // Use useEditorState to subscribe to formatting state changes.
  // This is the official TipTap pattern for reactive toolbar buttons with shouldRerenderOnTransaction: false.
  // See: https://tiptap.dev/docs/guides/performance
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

  // Debug: Log editor element info
  useEffect(() => {
    if (editor) {
      const editorEl = editor.view.dom as HTMLElement
      console.log('[TipTap Debug] Editor element:', {
        className: editorEl.className,
        tagName: editorEl.tagName,
        hasH1: editorEl.querySelector('h1') !== null,
      })
      // Check computed styles on a heading if present
      const h1 = editorEl.querySelector('h1')
      if (h1) {
        const styles = window.getComputedStyle(h1)
        console.log('[TipTap Debug] H1 computed styles:', {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
        })
      }
      const ul = editorEl.querySelector('ul')
      if (ul) {
        const styles = window.getComputedStyle(ul)
        console.log('[TipTap Debug] UL computed styles:', {
          listStyleType: styles.listStyleType,
          paddingLeft: styles.paddingLeft,
        })
      }
    }
  }, [editor, value])

  if (!editor) {
    return (
      <div className="puck-field">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        )}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="min-h-[200px] p-4 text-gray-400">Loading editor...</div>
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
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      <div className="border rounded-lg bg-white">
        {/* Toolbar - wraps into multiple rows on narrow screens */}
        {!readOnly && (
          <div className="border-b bg-gray-50 flex items-center flex-wrap gap-1 p-2">
            {/* Text Style */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={formattingState?.isBold}
              title="Bold"
            >
              <IconBold className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={formattingState?.isItalic}
              title="Italic"
            >
              <IconItalic className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={formattingState?.isUnderline}
              title="Underline"
            >
              <IconUnderline className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={formattingState?.isStrike}
              title="Strikethrough"
            >
              <IconStrikethrough className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={formattingState?.isSuperscript}
              title="Superscript"
            >
              <IconSuperscript className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={formattingState?.isSubscript}
              title="Subscript"
            >
              <IconSubscript className={ICON_SIZE} />
            </ToolbarButton>

            <div className={TOOLBAR_DIVIDER} />

            {/* Headings Dropdown */}
            <ToolbarDropdown
              trigger={
                <span className="flex items-center gap-0.5">
                  {formattingState?.isH1 ? <IconH1 className={ICON_SIZE} /> :
                   formattingState?.isH2 ? <IconH2 className={ICON_SIZE} /> :
                   formattingState?.isH3 ? <IconH3 className={ICON_SIZE} /> :
                   formattingState?.isH4 ? <IconH4 className={ICON_SIZE} /> :
                   formattingState?.isH5 ? <IconH5 className={ICON_SIZE} /> :
                   formattingState?.isH6 ? <IconH6 className={ICON_SIZE} /> :
                   <IconLetterP className={ICON_SIZE} />}
                  <IconChevronDown className="w-3 h-3" />
                </span>
              }
              title="Text Type"
              isActive={formattingState?.isH1 || formattingState?.isH2 || formattingState?.isH3 || formattingState?.isH4 || formattingState?.isH5 || formattingState?.isH6}
            >
              {(close) => (
                <>
                  <DropdownItem onClick={() => { editor.chain().focus().setParagraph().run(); close(); }}>
                    <IconLetterP className={cn(ICON_SIZE, 'mr-2')} />
                    Paragraph
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); close(); }}>
                    <IconH1 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-bold text-lg">Heading 1</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); close(); }}>
                    <IconH2 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-bold text-base">Heading 2</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); close(); }}>
                    <IconH3 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-semibold">Heading 3</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 4 }).run(); close(); }}>
                    <IconH4 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-semibold text-sm">Heading 4</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 5 }).run(); close(); }}>
                    <IconH5 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-semibold text-xs">Heading 5</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => { editor.chain().focus().toggleHeading({ level: 6 }).run(); close(); }}>
                    <IconH6 className={cn(ICON_SIZE, 'mr-2')} />
                    <span className="font-semibold text-xs text-gray-600">Heading 6</span>
                  </DropdownItem>
                </>
              )}
            </ToolbarDropdown>

            <div className={TOOLBAR_DIVIDER} />

            {/* Font Size */}
            <ToolbarDropdown
              trigger={<IconTextSize className={ICON_SIZE} />}
              title="Font Size"
            >
              {(close) => (
                <>
                  <DropdownLabel>Presets</DropdownLabel>
                  <div className="grid grid-cols-3 gap-1 px-2 pb-2">
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
                        className="px-2 py-1.5 text-xs rounded border border-gray-200 hover:bg-gray-100 transition-colors text-center"
                        title={size.px}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                  <DropdownSeparator />
                  <div className="p-2">
                    <DropdownLabel>Custom Size</DropdownLabel>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        placeholder="16"
                        min="8"
                        max="200"
                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      <select
                        className="px-1 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue="px"
                      >
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
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </ToolbarDropdown>

            <div className={TOOLBAR_DIVIDER} />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={formattingState?.isBulletList}
              title="Bullet List"
            >
              <IconList className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={formattingState?.isOrderedList}
              title="Numbered List"
            >
              <IconListNumbers className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={formattingState?.isBlockquote}
              title="Blockquote"
            >
              <IconBlockquote className={ICON_SIZE} />
            </ToolbarButton>

            <div className={TOOLBAR_DIVIDER} />

            {/* Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={formattingState?.isAlignLeft}
              title="Align Left"
            >
              <IconAlignLeft className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={formattingState?.isAlignCenter}
              title="Align Center"
            >
              <IconAlignCenter className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={formattingState?.isAlignRight}
              title="Align Right"
            >
              <IconAlignRight className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={formattingState?.isAlignJustify}
              title="Justify"
            >
              <IconAlignJustified className={ICON_SIZE} />
            </ToolbarButton>

            <div className={TOOLBAR_DIVIDER} />

            {/* Link */}
            <div className="relative flex-shrink-0">
              <ToolbarButton
                onClick={() => setIsLinkPopoverOpen(!isLinkPopoverOpen)}
                isActive={formattingState?.isLink}
                title="Add Link"
              >
                <IconLink className={ICON_SIZE} />
              </ToolbarButton>
              <LinkPopover
                isOpen={isLinkPopoverOpen}
                onClose={() => setIsLinkPopoverOpen(false)}
                onSetLink={setLink}
                onRemoveLink={removeLink}
              />
            </div>

            {/* Text Color */}
            <ToolbarDropdown
              trigger={<IconPalette className={ICON_SIZE} />}
              title="Text Color"
            >
              {(close) => (
                <>
                  {/* Theme (Auto) option - removes color to inherit from parent */}
                  <DropdownItem onClick={() => { editor.chain().focus().unsetColor().run(); close(); }}>
                    <span
                      className="w-4 h-4 rounded mr-2 border border-gray-300 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #fff 50%, #1f2937 50%)' }}
                    />
                    {THEME_COLOR.label}
                  </DropdownItem>
                  <DropdownSeparator />

                  {/* Color categories */}
                  {COLOR_CATEGORIES.map((category) => (
                    <div key={category.label}>
                      <DropdownLabel>{category.label}</DropdownLabel>
                      <div className="grid grid-cols-5 gap-1 px-2 pb-2">
                        {category.colors.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => { editor.chain().focus().setColor(color.hex).run(); close(); }}
                            className="w-6 h-6 rounded border border-gray-200 cursor-pointer transition-transform duration-100 hover:scale-110"
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <DropdownSeparator />

                  {/* Custom color picker */}
                  <div className="p-2">
                    <DropdownLabel>Custom Color</DropdownLabel>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        // Show current text color (default to black if none set)
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        // onInput fires while dragging - apply color live
                        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                        // Let dropdown close naturally via click-outside detection
                        className="w-8 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                        title="Pick any color"
                      />
                      <span className="text-xs text-gray-500">Pick any color</span>
                    </div>
                  </div>
                </>
              )}
            </ToolbarDropdown>

            {/* Highlight (background color) */}
            <ToolbarDropdown
              trigger={<IconHighlight className={ICON_SIZE} />}
              title="Highlight"
              isActive={formattingState?.isHighlight}
            >
              {(close) => (
                <>
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => { editor.chain().focus().toggleHighlight({ color: color.hex }).run(); close(); }}
                        className="w-8 h-6 rounded border border-gray-200 cursor-pointer transition-transform duration-100 hover:scale-110"
                        style={{ backgroundColor: color.hex }}
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

            <div className={TOOLBAR_DIVIDER} />

            {/* Insert Elements */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <IconSeparatorHorizontal className={ICON_SIZE} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHardBreak().run()}
              title="Hard Break (Shift+Enter)"
            >
              <IconCornerDownLeft className={ICON_SIZE} />
            </ToolbarButton>

            <div className={TOOLBAR_DIVIDER} />

            {/* Clear Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear Formatting"
            >
              <IconClearFormatting className={ICON_SIZE} />
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
              className={cn(
                'inline-flex items-center rounded transition-colors text-xs h-7 px-2 gap-1 flex-shrink-0',
                showSource && 'bg-gray-200',
                !showSource && 'bg-transparent'
              )}
            >
              <IconCode className={ICON_SIZE} />
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
            className="w-full min-h-[200px] p-4 font-mono text-sm border-0 resize-y focus:outline-none"
            placeholder="Edit HTML source..."
          />
        ) : (
          <div className="min-h-[200px] bg-white">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders when Puck updates state.
// This is critical for maintaining editor focus during typing.
export const TiptapField = memo(TiptapFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for Tiptap rich text editing
 */
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
