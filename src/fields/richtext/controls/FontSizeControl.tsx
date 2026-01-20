'use client'

/**
 * FontSizeControl - Font size control for Puck RichText toolbar
 *
 * A dropdown with:
 * - 9 preset sizes (XS to 4XL)
 * - Custom size input with px/rem/em unit selection
 */

import React, { useState, useCallback, type CSSProperties } from 'react'
import { ALargeSmall, ChevronDown } from 'lucide-react'
import { FONT_SIZES, FONT_SIZE_UNITS, controlStyles } from './shared'
import { Dropdown } from './DropdownPortal'
import type { Editor } from '@tiptap/react'

interface FontSizeControlProps {
  editor: Editor
  currentSize: string | undefined
}

export function FontSizeControl({ editor, currentSize }: FontSizeControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [customUnit, setCustomUnit] = useState<'px' | 'rem' | 'em'>('px')

  const handlePresetClick = useCallback(
    (value: string | null) => {
      if (value) {
        editor.chain().focus().setFontSize(value).run()
      } else {
        editor.chain().focus().unsetFontSize().run()
      }
      setIsOpen(false)
    },
    [editor]
  )

  const handleCustomApply = useCallback(() => {
    if (customValue) {
      const size = `${customValue}${customUnit}`
      editor.chain().focus().setFontSize(size).run()
      setIsOpen(false)
      setCustomValue('')
    }
  }, [editor, customValue, customUnit])

  const handleCustomKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleCustomApply()
      }
    },
    [handleCustomApply]
  )

  // Find current preset label if any
  const currentPreset = FONT_SIZES.find((s) => s.value === currentSize)
  const hasCustomSize = currentSize && !currentPreset

  const trigger = (
    <button
      type="button"
      title="Font Size"
      style={{
        ...controlStyles.dropdownTrigger,
        ...(currentSize ? controlStyles.dropdownTriggerActive : {}),
      }}
    >
      <ALargeSmall style={controlStyles.icon} />
      <ChevronDown style={{ width: '12px', height: '12px' }} />
    </button>
  )

  return (
    <div style={{ position: 'relative' }}>
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen} trigger={trigger} minWidth={200}>
        {/* Preset label */}
        <div style={controlStyles.dropdownLabel}>Presets</div>

        {/* Preset grid */}
        <div style={controlStyles.fontSizeGrid as CSSProperties}>
          {FONT_SIZES.map((size) => {
            const isActive = size.value === currentSize || (!size.value && !currentSize)
            return (
              <button
                key={size.label}
                type="button"
                onClick={() => handlePresetClick(size.value)}
                title={size.px}
                style={{
                  ...controlStyles.fontSizeButton,
                  ...(isActive ? controlStyles.fontSizeButtonActive : {}),
                }}
              >
                {size.label}
              </button>
            )
          })}
        </div>

        {/* Custom size input */}
        <div style={controlStyles.customSizeRow as CSSProperties}>
          <input
            type="number"
            placeholder="16"
            min="8"
            max="200"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            style={controlStyles.customSizeInput}
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'px' | 'rem' | 'em')}
            style={controlStyles.customSizeSelect}
          >
            {FONT_SIZE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleCustomApply} style={controlStyles.customSizeApply}>
            Apply
          </button>
        </div>

        {/* Show current custom size if any */}
        {hasCustomSize && (
          <div
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--puck-color-grey-05)',
              borderTop: '1px solid var(--puck-color-grey-03)',
            }}
          >
            Current: {currentSize}
          </div>
        )}
      </Dropdown>
    </div>
  )
}
