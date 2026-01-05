'use client'

/**
 * TiptapModalField - Custom Puck field with embedded editor + modal option
 *
 * Shows the full TipTap editor embedded in the sidebar for quick edits,
 * with an "Expand" button to open a full-screen modal for focused editing.
 */

import React, { useState, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { TiptapField } from './TiptapField'
import { TiptapModal } from './TiptapModal'
import { IconArrowsMaximize } from '@tabler/icons-react'

interface TiptapModalFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

function TiptapModalFieldInner({ value, onChange, label }: TiptapModalFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      {/* Header with label and expand button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        {label && (
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '4px 8px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
            e.currentTarget.style.borderColor = '#9ca3af'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = '#d1d5db'
          }}
          title="Open full-screen editor"
        >
          <IconArrowsMaximize size={14} />
          Expand
        </button>
      </div>

      {/* Embedded TipTap editor */}
      <TiptapField value={value || ''} onChange={onChange} />

      {/* Modal for full-screen editing */}
      <TiptapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value || ''}
        onChange={onChange}
        title="Edit Rich Text"
      />
    </div>
  )
}

export const TiptapModalField = memo(TiptapModalFieldInner)

/**
 * Creates a Puck field configuration for TipTap editing with modal option
 */
export function createTiptapModalField(config: { label?: string } = {}): CustomField<string> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange }) => (
      <TiptapModalField value={value || ''} onChange={onChange} label={config.label} />
    ),
  }
}
