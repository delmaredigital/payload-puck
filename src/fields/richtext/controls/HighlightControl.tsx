'use client'

/**
 * HighlightControl - Text highlight control for Puck RichText toolbar
 *
 * A dropdown color picker for text highlighting with:
 * - Native color input
 * - Hex input with validation
 * - Opacity slider (RGBA support)
 * - Theme color presets
 * - Remove highlight option
 */

import React, { useState, useRef, useCallback } from 'react'
import { Highlighter, ChevronDown } from 'lucide-react'
import { controlStyles } from './shared'
import { ColorPickerPanel } from './ColorPickerControl'
import { DropdownPortal } from './DropdownPortal'
import type { Editor } from '@tiptap/react'

interface HighlightControlProps {
  editor: Editor
  currentColor: string | undefined
  isActive: boolean
}

export function HighlightControl({ editor, currentColor, isActive }: HighlightControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleColorChange = useCallback(
    (color: string | null) => {
      if (color) {
        editor.chain().focus().setHighlight({ color }).run()
      } else {
        editor.chain().focus().unsetHighlight().run()
      }
    },
    [editor]
  )

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Highlight"
        style={{
          ...controlStyles.dropdownTrigger,
          ...(isActive ? controlStyles.dropdownTriggerActive : {}),
        }}
      >
        <Highlighter style={controlStyles.icon} />
        <ChevronDown style={{ width: '12px', height: '12px' }} />
        {/* Highlight color indicator */}
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
          mode="highlight"
        />
      </DropdownPortal>
    </div>
  )
}
