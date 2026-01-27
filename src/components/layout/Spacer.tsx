/**
 * Spacer Component - Puck Configuration
 *
 * Simple spacing component for adding vertical or horizontal space.
 * Uses Tailwind classes for layout and sizing from predefined options.
 *
 * Responsive Controls:
 * - visibility: Show/hide at different breakpoints
 */

import { useId } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import { cn, visibilityValueToCSS, type VisibilityValue } from '../../fields/shared.js'
import { createResetField } from '../../fields/ResetField.js'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField.js'

const spacingOptions = [
  { label: '8px', value: '8px' },
  { label: '16px', value: '16px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' },
  { label: '48px', value: '48px' },
  { label: '64px', value: '64px' },
  { label: '80px', value: '80px' },
  { label: '96px', value: '96px' },
  { label: '128px', value: '128px' },
]

// Tailwind height classes for predefined spacing options
const heightMap: Record<string, string> = {
  '8px': 'h-2',
  '16px': 'h-4',
  '24px': 'h-6',
  '32px': 'h-8',
  '48px': 'h-12',
  '64px': 'h-16',
  '80px': 'h-20',
  '96px': 'h-24',
  '128px': 'h-32',
}

// Tailwind width classes for predefined spacing options
const widthMap: Record<string, string> = {
  '8px': 'w-2',
  '16px': 'w-4',
  '24px': 'w-6',
  '32px': 'w-8',
  '48px': 'w-12',
  '64px': 'w-16',
  '80px': 'w-20',
  '96px': 'w-24',
  '128px': 'w-32',
}

export interface SpacerProps {
  size: string
  direction: 'vertical' | 'horizontal' | 'both'
  visibility: VisibilityValue | null
}

const defaultProps: SpacerProps = {
  size: '24px',
  direction: 'vertical',
  visibility: null,
}

export const SpacerConfig: ComponentConfig = {
  label: 'Spacer',
  fields: {
    _reset: createResetField({ defaultProps }),
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    size: {
      type: 'select',
      label: 'Size',
      options: spacingOptions,
    },
    direction: {
      type: 'radio',
      label: 'Direction',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Both', value: 'both' },
      ],
    },
  },
  defaultProps,
  render: ({ size, direction, visibility }) => {
    // Generate unique ID for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
    const wrapperClass = `puck-spacer-${uniqueId}`

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)

    const getClasses = (): string => {
      const heightClass = heightMap[size] || 'h-6'
      const widthClass = widthMap[size] || 'w-6'

      if (direction === 'vertical') {
        return `block ${heightClass} w-full`
      }
      if (direction === 'horizontal') {
        return `inline-block ${widthClass} h-full`
      }
      // both
      return `block ${heightClass} ${widthClass}`
    }

    return (
      <>
        {visibilityCSS && <style>{visibilityCSS}</style>}
        <div className={cn(getClasses(), wrapperClass)} aria-hidden="true" />
      </>
    )
  },
}
