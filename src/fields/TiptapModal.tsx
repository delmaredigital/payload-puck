'use client'

/**
 * TiptapModal - Full-screen modal for TipTap rich text editing
 *
 * Used by TiptapModalField to provide a focused editing experience
 * that works within Puck's architecture (sidebar triggers modal).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { TiptapField } from './TiptapField'
import { IconX } from '@tabler/icons-react'

interface TiptapModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onChange: (value: string) => void
  title?: string
}

export function TiptapModal({ isOpen, onClose, value, onChange, title }: TiptapModalProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value when modal opens with new value
  useEffect(() => {
    if (isOpen) {
      setLocalValue(value)
    }
  }, [isOpen, value])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSave = useCallback(() => {
    onChange(localValue)
    onClose()
  }, [localValue, onChange, onClose])

  const handleCancel = useCallback(() => {
    setLocalValue(value) // Reset to original
    onClose()
  }, [value, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCancel()
      }
    },
    [handleCancel]
  )

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '900px',
          height: '80vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            {title || 'Edit Content'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close (Esc)"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Editor */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px 20px',
            minHeight: 0,
          }}
        >
          <TiptapField value={localValue} onChange={setLocalValue} />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
