'use client'

/**
 * VerticalAlignmentField - Icon toggle buttons for vertical/self alignment
 *
 * Used for grid item self-alignment (e.g., in TextImageSplit)
 * Controls how an item aligns itself within its grid/flex cell.
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  IconLayoutAlignTop,
  IconLayoutAlignMiddle,
  IconLayoutAlignBottom,
  IconX,
} from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

// =============================================================================
// Types
// =============================================================================

export type VerticalAlignment = 'flex-start' | 'center' | 'flex-end'

interface VerticalAlignmentFieldProps {
  value: VerticalAlignment | null
  onChange: (value: VerticalAlignment | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: VerticalAlignment
}

// =============================================================================
// VerticalAlignmentField Component
// =============================================================================

function VerticalAlignmentFieldInner({
  value,
  onChange,
  label = 'Vertical Alignment',
  readOnly,
  defaultValue = 'center',
}: VerticalAlignmentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignment: VerticalAlignment) => {
    onChange(alignment)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as VerticalAlignment, icon: IconLayoutAlignTop, title: 'Top' },
    { value: 'center' as VerticalAlignment, icon: IconLayoutAlignMiddle, title: 'Center' },
    { value: 'flex-end' as VerticalAlignment, icon: IconLayoutAlignBottom, title: 'Bottom' },
  ]

  return (
    <div className="puck-field space-y-2">
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

      <div className="flex gap-1">
        {options.map(({ value: optionValue, icon: Icon, title }) => {
          const isActive = currentValue === optionValue
          return (
            <Button
              key={optionValue}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="icon"
              onClick={() => handleChange(optionValue)}
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

export const VerticalAlignmentField = memo(VerticalAlignmentFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateVerticalAlignmentFieldConfig {
  label?: string
  defaultValue?: VerticalAlignment
}

/**
 * Creates a Puck field configuration for vertical/self alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   verticalAlignment: createVerticalAlignmentField({ label: 'Vertical Alignment' }),
 * }
 * ```
 */
export function createVerticalAlignmentField(
  config: CreateVerticalAlignmentFieldConfig = {}
): CustomField<VerticalAlignment | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <VerticalAlignmentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
