'use client'

/**
 * createRichTextField - Factory for enhanced Puck richtext fields
 *
 * Creates a Puck native richtext field with additional features:
 * - Text color with opacity (RGBA)
 * - Highlight with multicolor support
 * - Font size (9 presets + custom)
 * - Superscript and subscript
 * - Theme color presets integration
 *
 * Uses Puck's official extension points (tiptap.extensions, tiptap.selector, renderMenu)
 * for native integration with contentEditable support.
 */

import React from 'react'
import { RichTextMenu } from '@puckeditor/core'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import HighlightExtension from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Superscript as SuperscriptIcon, Subscript as SubscriptIcon } from 'lucide-react'

import { FontSize } from './extensions/FontSize.js'
import { ColorPickerControl } from './controls/ColorPickerControl.js'
import { FontSizeControl } from './controls/FontSizeControl.js'
import { HighlightControl } from './controls/HighlightControl.js'

import type { Editor } from '@tiptap/react'

// =============================================================================
// Types
// =============================================================================

export interface CreateRichTextFieldOptions {
  /** Field label shown in sidebar */
  label?: string

  /**
   * Enable inline editing on canvas.
   * When true, users can edit text directly in the preview.
   * @default false
   */
  contentEditable?: boolean

  /**
   * Initial height for sidebar editor (ignored if contentEditable is true)
   * @default 192
   */
  initialHeight?: number | string

  /**
   * Heading levels to allow
   * @default [1, 2, 3, 4, 5, 6]
   */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[]

  /**
   * Enable font size control
   * @default true
   */
  fontSize?: boolean

  /**
   * Enable text color control
   * @default true
   */
  textColor?: boolean

  /**
   * Enable highlight control
   * @default true
   */
  highlight?: boolean

  /**
   * Enable superscript
   * @default true
   */
  superscript?: boolean

  /**
   * Enable subscript
   * @default true
   */
  subscript?: boolean

  /**
   * Enable code blocks (in addition to inline code)
   * @default true
   */
  codeBlock?: boolean

  /**
   * Enable blockquotes
   * @default true
   */
  blockquote?: boolean
}

// =============================================================================
// Custom Editor State Interface
// =============================================================================

interface CustomEditorState {
  // Text color
  currentColor: string | undefined
  // Highlight
  highlightColor: string | undefined
  isHighlight: boolean
  // Font size
  currentFontSize: string | undefined
  // Superscript/Subscript
  isSuperscript: boolean
  isSubscript: boolean
  canSuperscript: boolean
  canSubscript: boolean
}


// =============================================================================
// Factory Function
// =============================================================================

/**
 * Creates a Puck richtext field with enhanced features.
 *
 * @example
 * ```tsx
 * const myConfig: ComponentConfig = {
 *   fields: {
 *     content: createRichTextField({
 *       label: 'Content',
 *       contentEditable: true,
 *     }),
 *   },
 *   // ...
 * }
 * ```
 */
export function createRichTextField(options: CreateRichTextFieldOptions = {}) {
  const {
    label,
    contentEditable = false,
    initialHeight = 192,
    headingLevels = [1, 2, 3, 4, 5, 6],
    fontSize = true,
    textColor = true,
    highlight = true,
    superscript = true,
    subscript = true,
    codeBlock = true,
    blockquote = true,
  } = options

  // Build custom TipTap extensions array
  // Using any[] to avoid complex union types with TipTap extensions
  const customExtensions: any[] = [TextStyle]

  if (textColor) {
    customExtensions.push(Color)
  }

  if (highlight) {
    customExtensions.push(HighlightExtension.configure({ multicolor: true }))
  }

  if (fontSize) {
    customExtensions.push(FontSize)
  }

  if (superscript) {
    customExtensions.push(Superscript)
  }

  if (subscript) {
    customExtensions.push(Subscript)
  }

  return {
    type: 'richtext' as const,
    label,

    // Puck richtext options
    contentEditable,
    initialHeight,

    // Configure built-in extensions
    // Note: Puck expects `false` to disable or config object to customize
    // Omitting a key or setting to `undefined` means "use default" (enabled)
    options: {
      heading: { levels: headingLevels },
      codeBlock: codeBlock ? undefined : (false as const),
      blockquote: blockquote ? undefined : (false as const),
    },

    // Add our custom TipTap extensions
    tiptap: {
      extensions: customExtensions,

      // Expose custom state for our controls
      // Cast to any because Puck's types expect Record<string, boolean> but we need strings for colors/sizes
      selector: ((ctx: { editor: Editor | null }) => {
        if (!ctx.editor) {
          return {}
        }
        return {
          // Text color state
          currentColor: ctx.editor.getAttributes('textStyle').color,

          // Highlight state
          highlightColor: ctx.editor.getAttributes('highlight').color,
          isHighlight: ctx.editor.isActive('highlight'),

          // Font size state
          currentFontSize: ctx.editor.getAttributes('textStyle').fontSize,

          // Superscript/Subscript state
          isSuperscript: ctx.editor.isActive('superscript'),
          isSubscript: ctx.editor.isActive('subscript'),
          canSuperscript: ctx.editor.can().toggleSuperscript(),
          canSubscript: ctx.editor.can().toggleSubscript(),
        }
      }) as any,
    },

    // Custom menu with our additional controls
    // Using any types for Puck compatibility - our selector adds custom properties to editorState
    renderMenu: ({ editor, editorState }: { editor: any; editorState: any }) => {
      // Guard against null editor/state during initialization
      if (!editor || !editorState) {
        return null
      }

      return (
        <RichTextMenu>
          {/* Text Formatting - consolidated into one group */}
          <RichTextMenu.Group>
            <RichTextMenu.Bold />
            <RichTextMenu.Italic />
            <RichTextMenu.Underline />
            <RichTextMenu.Strikethrough />
            {superscript && (
              <RichTextMenu.Control
                icon={<SuperscriptIcon size={16} />}
                title="Superscript"
                active={editorState.isSuperscript}
                disabled={!editorState.canSuperscript}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
              />
            )}
            {subscript && (
              <RichTextMenu.Control
                icon={<SubscriptIcon size={16} />}
                title="Subscript"
                active={editorState.isSubscript}
                disabled={!editorState.canSubscript}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
              />
            )}
          </RichTextMenu.Group>

          {/* Structure - Headings, Lists (as select dropdowns to save space) */}
          <RichTextMenu.Group>
            <RichTextMenu.HeadingSelect />
            <RichTextMenu.ListSelect />
            <RichTextMenu.AlignSelect />
          </RichTextMenu.Group>

          {/* Colors and Font Size (custom controls) */}
          <RichTextMenu.Group>
            {fontSize && <FontSizeControl editor={editor} currentSize={editorState.currentFontSize} />}
            {textColor && <ColorPickerControl editor={editor} currentColor={editorState.currentColor} />}
            {highlight && (
              <HighlightControl
                editor={editor}
                currentColor={editorState.highlightColor}
                isActive={editorState.isHighlight}
              />
            )}
          </RichTextMenu.Group>

          {/* Block Elements */}
          <RichTextMenu.Group>
            {blockquote && <RichTextMenu.Blockquote />}
            {codeBlock && <RichTextMenu.CodeBlock />}
            <RichTextMenu.HorizontalRule />
          </RichTextMenu.Group>
        </RichTextMenu>
      )
    },
  }
}

// =============================================================================
// Preset Configurations
// =============================================================================

/**
 * Full-featured richtext field with all enhancements
 */
export const fullRichTextField = createRichTextField({
  contentEditable: true,
  fontSize: true,
  textColor: true,
  highlight: true,
  superscript: true,
  subscript: true,
})

/**
 * Minimal richtext field - structure only, no styling controls
 */
export const minimalRichTextField = createRichTextField({
  contentEditable: true,
  fontSize: false,
  textColor: false,
  highlight: false,
  superscript: false,
  subscript: false,
  headingLevels: [1, 2, 3],
})

/**
 * Sidebar-only richtext field (no inline editing)
 */
export const sidebarRichTextField = createRichTextField({
  contentEditable: false,
  initialHeight: 300,
  fontSize: true,
  textColor: true,
  highlight: true,
})
