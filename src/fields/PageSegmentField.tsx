'use client'

/**
 * PageSegmentField - Custom Puck field for page segment editing
 *
 * Provides an editable text field with automatic slugification.
 * Integrates with @delmaredigital/payload-page-tree plugin.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { CustomField } from '@measured/puck'

// =============================================================================
// Slugify Utility
// =============================================================================

/**
 * Converts a string to a URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// =============================================================================
// Types
// =============================================================================

interface PageSegmentFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

// =============================================================================
// PageSegmentField Component
// =============================================================================

export function PageSegmentField({
  value,
  onChange,
  label = 'Page Segment',
  placeholder = 'page-segment',
}: PageSegmentFieldProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Slugify on blur
    const slugified = slugify(localValue)
    setLocalValue(slugified)
    onChange(slugified)
  }, [localValue, onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }, [])

  return (
    <div className="puck-field">
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--puck-color-grey-04)',
          marginBottom: '8px',
        }}
      >
        {label}
      </label>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '14px',
          border: `1px solid ${isFocused ? 'var(--puck-color-azure-06)' : 'var(--puck-color-grey-09)'}`,
          borderRadius: '6px',
          backgroundColor: 'var(--puck-color-white)',
          color: 'var(--puck-color-grey-04)',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
      />

      {/* Helper text */}
      <p
        style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--puck-color-grey-06)',
        }}
      >
        Auto-slugified on blur. Used in URL path.
      </p>
    </div>
  )
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for page segment editing
 */
export function createPageSegmentField(config?: {
  label?: string
  placeholder?: string
}): CustomField<string> {
  return {
    type: 'custom',
    label: config?.label ?? 'Page Segment',
    render: ({ value, onChange }) => (
      <PageSegmentField
        value={value || ''}
        onChange={onChange}
        label={config?.label}
        placeholder={config?.placeholder}
      />
    ),
  }
}
