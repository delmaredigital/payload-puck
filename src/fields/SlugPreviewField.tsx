'use client'

/**
 * SlugPreviewField - Custom Puck field for displaying the computed slug
 *
 * Read-only field that shows the auto-generated URL slug.
 * When page-tree is enabled, slug = folderPath + '/' + pageSegment
 */

import React from 'react'
import type { CustomField } from '@measured/puck'
import { Link, Lock } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

interface SlugPreviewFieldProps {
  value: string
  label?: string
  hint?: string
}

// =============================================================================
// SlugPreviewField Component
// =============================================================================

export function SlugPreviewField({
  value,
  label = 'URL Slug',
  hint = 'Auto-generated from folder + page segment',
}: SlugPreviewFieldProps) {
  const displayValue = value ? (value.startsWith('/') ? value : `/${value}`) : '/'

  return (
    <div className="puck-field">
      {/* Label with lock indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <label
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--puck-color-grey-04)',
          }}
        >
          {label}
        </label>
        <Lock size={14} style={{ color: 'var(--puck-color-grey-06)' }} />
      </div>

      {/* Read-only slug display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: 'var(--puck-color-grey-11)',
          border: '1px solid var(--puck-color-grey-09)',
          borderRadius: '6px',
        }}
      >
        <Link size={14} style={{ marginRight: '8px', color: 'var(--puck-color-grey-06)' }} />
        <span
          style={{
            fontSize: '14px',
            color: 'var(--puck-color-grey-05)',
            fontFamily: 'var(--font-mono, monospace)',
            wordBreak: 'break-all',
          }}
        >
          {displayValue}
        </span>
      </div>

      {/* Hint text */}
      <p
        style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--puck-color-grey-06)',
        }}
      >
        {hint}
      </p>
    </div>
  )
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for slug preview
 */
export function createSlugPreviewField(config?: {
  label?: string
  hint?: string
}): CustomField<string> {
  return {
    type: 'custom',
    label: config?.label ?? 'URL Slug',
    render: ({ value }) => (
      <SlugPreviewField
        value={value || ''}
        label={config?.label}
        hint={config?.hint}
      />
    ),
  }
}
