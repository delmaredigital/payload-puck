# Migration Plan: Custom TipTap → Puck Native RichText

## Overview

Migrate from custom `TiptapField` implementation to Puck's native `richtext` field type while preserving all advanced features (colors, font sizes, superscript/subscript, etc.) via official extension points.

## Benefits of Migration

- **Inline canvas editing** via `contentEditable: true`
- **Native Puck integration** - proper field type, not custom hack
- **Simpler codebase** - delete ~1500 lines of custom field code
- **Future-proof** - Puck updates benefit you automatically
- **Better UX** - edit text directly in canvas, not just sidebar/modal

---

## Phase 1: Extract Reusable Pieces

### 1.1 Extract FontSize Extension
**File:** `src/fields/richtext/extensions/FontSize.ts`

Your custom FontSize extension is already well-built. Extract it to a standalone file:

```typescript
// src/fields/richtext/extensions/FontSize.ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ''),
          renderHTML: (attributes) => {
            if (!attributes.fontSize) return {}
            return { style: `font-size: ${attributes.fontSize}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})
```

### 1.2 Extract Color Picker Component
**File:** `src/fields/richtext/controls/ColorPickerControl.tsx`

Extract your `TiptapColorPicker` as a standalone toolbar control:

```typescript
// src/fields/richtext/controls/ColorPickerControl.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useTheme } from '../../../theme'
import type { Editor } from '@tiptap/react'

interface ColorPickerControlProps {
  editor: Editor
  currentColor: string | undefined
  mode?: 'text' | 'highlight'
}

export function ColorPickerControl({ editor, currentColor, mode = 'text' }: ColorPickerControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useTheme()
  // ... rest of your color picker logic
  // On color change:
  // - text mode: editor.chain().focus().setColor(color).run()
  // - highlight mode: editor.chain().focus().setHighlight({ color }).run()
}
```

### 1.3 Extract Font Size Control
**File:** `src/fields/richtext/controls/FontSizeControl.tsx`

```typescript
// src/fields/richtext/controls/FontSizeControl.tsx
'use client'

import React, { useState } from 'react'
import { ALargeSmall } from 'lucide-react'
import type { Editor } from '@tiptap/react'

const FONT_SIZES = [
  { label: 'XS', value: '0.75rem' },
  { label: 'Small', value: '0.875rem' },
  { label: 'Normal', value: null },
  { label: 'Medium', value: '1.125rem' },
  { label: 'Large', value: '1.25rem' },
  { label: 'XL', value: '1.5rem' },
  { label: '2XL', value: '1.875rem' },
  { label: '3XL', value: '2.25rem' },
  { label: '4XL', value: '3rem' },
]

interface FontSizeControlProps {
  editor: Editor
  currentSize: string | undefined
}

export function FontSizeControl({ editor, currentSize }: FontSizeControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  // ... dropdown with presets + custom input
  // On size change: editor.chain().focus().setFontSize(size).run()
}
```

---

## Phase 2: Create RichText Field Factory

### 2.1 Create the Field Configuration
**File:** `src/fields/richtext/createRichTextField.tsx`

```typescript
// src/fields/richtext/createRichTextField.tsx
'use client'

import React from 'react'
import { RichTextMenu } from '@puckeditor/core'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Highlighter } from 'lucide-react'

import { FontSize } from './extensions/FontSize'
import { ColorPickerControl } from './controls/ColorPickerControl'
import { FontSizeControl } from './controls/FontSizeControl'
import { HighlightControl } from './controls/HighlightControl'

import type { Field } from '@puckeditor/core'

interface CreateRichTextFieldOptions {
  label?: string
  /** Enable inline editing on canvas (default: false) */
  contentEditable?: boolean
  /** Initial height for sidebar editor (default: 192) */
  initialHeight?: number
  /** Heading levels to allow (default: [1, 2, 3, 4, 5, 6]) */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[]
  /** Enable font size control (default: true) */
  fontSize?: boolean
  /** Enable text color control (default: true) */
  textColor?: boolean
  /** Enable highlight control (default: true) */
  highlight?: boolean
  /** Enable superscript/subscript (default: true) */
  superscript?: boolean
  subscript?: boolean
}

export function createRichTextField(options: CreateRichTextFieldOptions = {}): Field {
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
  } = options

  // Build extensions array based on options
  const extensions = [TextStyle]
  if (textColor) extensions.push(Color)
  if (highlight) extensions.push(Highlight.configure({ multicolor: true }))
  if (fontSize) extensions.push(FontSize)
  if (superscript) extensions.push(Superscript)
  if (subscript) extensions.push(Subscript)

  return {
    type: 'richtext',
    label,
    options: {
      contentEditable,
      initialHeight,
      heading: { levels: headingLevels },

      tiptap: {
        extensions,
        selector: ({ editor }) => ({
          // Standard Puck state is auto-included
          // Add custom state for our extensions
          currentColor: editor.getAttributes('textStyle').color,
          currentFontSize: editor.getAttributes('textStyle').fontSize,
          highlightColor: editor.getAttributes('highlight').color,
          isSuperscript: editor.isActive('superscript'),
          isSubscript: editor.isActive('subscript'),
          isHighlight: editor.isActive('highlight'),
          canSuperscript: editor.can().toggleSuperscript(),
          canSubscript: editor.can().toggleSubscript(),
        }),
      },
    },

    renderMenu: ({ editor, editorState }) => (
      <RichTextMenu>
        {/* Text Formatting */}
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

        {/* Headings & Blocks */}
        <RichTextMenu.Group>
          <RichTextMenu.HeadingSelect />
          <RichTextMenu.Blockquote />
          <RichTextMenu.CodeBlock />
        </RichTextMenu.Group>

        {/* Font Size (custom) */}
        {fontSize && (
          <RichTextMenu.Group>
            <FontSizeControl editor={editor} currentSize={editorState.currentFontSize} />
          </RichTextMenu.Group>
        )}

        {/* Lists */}
        <RichTextMenu.Group>
          <RichTextMenu.BulletList />
          <RichTextMenu.OrderedList />
        </RichTextMenu.Group>

        {/* Alignment */}
        <RichTextMenu.Group>
          <RichTextMenu.AlignSelect />
        </RichTextMenu.Group>

        {/* Colors (custom) */}
        <RichTextMenu.Group>
          {textColor && (
            <ColorPickerControl
              editor={editor}
              currentColor={editorState.currentColor}
              mode="text"
            />
          )}
          {highlight && (
            <HighlightControl
              editor={editor}
              currentColor={editorState.highlightColor}
              isActive={editorState.isHighlight}
            />
          )}
        </RichTextMenu.Group>

        {/* Utilities */}
        <RichTextMenu.Group>
          <RichTextMenu.Link />
          <RichTextMenu.HorizontalRule />
        </RichTextMenu.Group>
      </RichTextMenu>
    ),
  }
}
```

---

## Phase 3: Update RichText Component

### 3.1 Update RichText.editor.tsx

```typescript
// src/components/typography/RichText.editor.tsx
'use client'

import React, { useMemo } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import { createRichTextField } from '../../fields/richtext/createRichTextField'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createResetField } from '../../fields/ResetField'
// ... style imports

export interface RichTextEditorProps {
  content: string  // Now Puck's richtext output (HTML string)
  dimensions: DimensionsValue | null
  margin: PaddingValue | null
  customPadding: PaddingValue | null
}

const defaultProps: RichTextEditorProps = {
  content: '<p>Click to start editing...</p>',
  dimensions: null,
  margin: null,
  customPadding: null,
}

function RichTextRender({ content, dimensions, margin, customPadding }: RichTextEditorProps) {
  const style = useMemo(() => {
    // ... same style logic
  }, [dimensions, margin, customPadding])

  return (
    <section className="relative overflow-hidden" style={style}>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  )
}

export const RichTextEditorConfig: ComponentConfig = {
  label: 'Rich Text',
  fields: {
    _reset: createResetField({ defaultProps }),
    content: createRichTextField({
      label: 'Content',
      contentEditable: true,  // Enable inline canvas editing!
    }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: RichTextRender,
}
```

---

## Phase 4: File Structure

### New Files to Create:
```
src/fields/richtext/
├── index.ts                          # Re-exports
├── createRichTextField.tsx           # Main factory function
├── extensions/
│   └── FontSize.ts                   # Custom TipTap extension
├── controls/
│   ├── ColorPickerControl.tsx        # Text color dropdown
│   ├── HighlightControl.tsx          # Highlight color dropdown
│   ├── FontSizeControl.tsx           # Font size dropdown
│   └── shared.ts                     # Color utilities (parseColor, hexToRgba, etc.)
└── styles/
    └── richtext-controls.css         # Styles for custom controls (if needed)
```

### Files to Delete (after migration complete):
```
src/fields/TiptapField.tsx            # ~1300 lines - replaced by native
src/fields/TiptapModal.tsx            # ~185 lines - no longer needed
src/fields/TiptapModalField.tsx       # ~107 lines - no longer needed
src/fields/tiptap-styles.css          # Partially - keep output styles
```

### Files to Update:
```
src/fields/index.ts                   # Update exports
src/components/typography/RichText.editor.tsx  # Use new field
```

---

## Phase 5: Implementation Order

### Step 1: Create extension files (no breaking changes)
- [ ] Create `src/fields/richtext/extensions/FontSize.ts`
- [ ] Create `src/fields/richtext/controls/shared.ts` (color utilities)

### Step 2: Create control components (no breaking changes)
- [ ] Create `src/fields/richtext/controls/ColorPickerControl.tsx`
- [ ] Create `src/fields/richtext/controls/FontSizeControl.tsx`
- [ ] Create `src/fields/richtext/controls/HighlightControl.tsx`

### Step 3: Create field factory (no breaking changes)
- [ ] Create `src/fields/richtext/createRichTextField.tsx`
- [ ] Create `src/fields/richtext/index.ts` with exports

### Step 4: Test in isolation
- [ ] Create a test component using `createRichTextField()`
- [ ] Verify all features work: colors, font sizes, superscript, etc.
- [ ] Test `contentEditable` mode

### Step 5: Migrate RichText component
- [ ] Update `RichText.editor.tsx` to use `createRichTextField()`
- [ ] Test thoroughly

### Step 6: Update exports
- [ ] Add `createRichTextField` to `src/fields/index.ts`
- [ ] Update any documentation

### Step 7: Cleanup (after confirming everything works)
- [ ] Delete `TiptapField.tsx`
- [ ] Delete `TiptapModal.tsx`
- [ ] Delete `TiptapModalField.tsx`
- [ ] Remove old exports from `src/fields/index.ts`

---

## Potential Challenges

### 1. RichTextMenu.Control Limitations
`<RichTextMenu.Control>` is just a button. For dropdowns (color picker, font size), you'll need to:
- Build popover/dropdown UI that renders alongside the control
- Handle click-outside to close
- Position correctly in the toolbar

**Solution:** Look at how `<RichTextMenu.HeadingSelect>` works internally, or build standalone dropdown components that work within the menu context.

### 2. Theme Integration
Your current color picker pulls presets from `useTheme()`. This should still work since your control components can use the hook.

### 3. HTML Source Editing
Puck's native field doesn't have source view. If this is critical, you could:
- Add a custom control that opens a modal with raw HTML
- Or accept this as a trade-off (most users don't need it)

### 4. Full-Screen Modal
Lost with native field. Trade-off for gaining `contentEditable`. The inline editing experience should be better anyway.

---

## Testing Checklist

After migration, verify:

- [ ] Bold, italic, underline, strikethrough work
- [ ] All 6 heading levels work
- [ ] Bullet and ordered lists work
- [ ] Text alignment (left, center, right, justify) works
- [ ] Links work
- [ ] Blockquotes work
- [ ] Code blocks work
- [ ] Horizontal rules work
- [ ] **Text color** works with:
  - [ ] Color picker
  - [ ] Hex input
  - [ ] Opacity slider
  - [ ] Theme presets
  - [ ] "Theme Color (Auto)" option
- [ ] **Highlight** works with multicolor support
- [ ] **Font size** works with:
  - [ ] Preset sizes
  - [ ] Custom size input (px/rem/em)
- [ ] **Superscript** works
- [ ] **Subscript** works
- [ ] **contentEditable** mode works (inline canvas editing)
- [ ] Output HTML renders correctly on frontend
- [ ] Dark mode compatibility

---

## Rollback Plan

Keep the old files in place during migration. Only delete after:
1. All features verified working
2. Tested in production-like environment
3. Team sign-off

If issues arise, revert `RichText.editor.tsx` to use `createTiptapModalField()`.
