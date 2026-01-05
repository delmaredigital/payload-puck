'use client'

/**
 * AlignmentField - Icon toggle buttons for text/content alignment
 *
 * Replaces select dropdowns with intuitive icon toggles for
 * left, center, right alignment.
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconLayoutAlignLeft,
  IconLayoutAlignCenter,
  IconLayoutAlignRight,
  IconX,
} from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

// =============================================================================
// Types
// =============================================================================

export type Alignment = 'left' | 'center' | 'right'

interface AlignmentFieldProps {
  value: Alignment | null
  onChange: (value: Alignment | null) => void
  label?: string
  readOnly?: boolean
  /** Default value when cleared or initially null */
  defaultValue?: Alignment
}

// =============================================================================
// AlignmentField Component
// =============================================================================

function AlignmentFieldInner({
  value,
  onChange,
  label = 'Alignment',
  readOnly,
  defaultValue = 'left',
}: AlignmentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignment: Alignment) => {
    onChange(alignment)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const alignments = [
    { value: 'left' as Alignment, icon: IconLayoutAlignLeft, title: 'Align left' },
    { value: 'center' as Alignment, icon: IconLayoutAlignCenter, title: 'Align center' },
    { value: 'right' as Alignment, icon: IconLayoutAlignRight, title: 'Align right' },
  ]

  return (
    <div className="puck-field space-y-2">
      {/* Header with label and clear */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Alignment toggle buttons */}
      <div className="flex gap-1">
        {alignments.map(({ value: alignment, icon: Icon, title }) => {
          const isActive = currentValue === alignment
          return (
            <Button
              key={alignment}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="icon"
              onClick={() => handleChange(alignment)}
              disabled={readOnly}
              className={cn(
                "h-8 w-8",
                isActive && "bg-primary hover:bg-primary/90"
              )}
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export const AlignmentField = memo(AlignmentFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateAlignmentFieldConfig {
  label?: string
  defaultValue?: Alignment
}

/**
 * Creates a Puck field configuration for alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   alignment: createAlignmentField({ label: 'Text Alignment' }),
 * }
 * ```
 */
export function createAlignmentField(
  config: CreateAlignmentFieldConfig = {}
): CustomField<Alignment | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <AlignmentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
