'use client'

/**
 * Dropdown - Renders dropdown content using Radix Popover for proper focus management
 *
 * Uses @radix-ui/react-popover which provides:
 * - Proper focus management that integrates with Puck's dirty state tracking
 * - Automatic close on escape and click outside
 * - Focus restoration to trigger element on close
 *
 * IMPORTANT: Uses data-puck-rte-menu attribute so Puck's blur handler recognizes
 * this dropdown as part of the rich text menu. Without this, clicking the dropdown
 * causes the editor to blur, clearing currentRichText state and breaking all menu
 * controls (including native Puck ones like HeadingSelect).
 */

import React, { type ReactNode } from 'react'
import {
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
  Portal as PopoverPortal,
  Content as PopoverContent,
} from '@radix-ui/react-popover'

interface DropdownProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  children: ReactNode
  minWidth?: number
}

export function Dropdown({ isOpen, onOpenChange, trigger, children, minWidth = 160 }: DropdownProps) {
  return (
    <PopoverRoot open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          align="start"
          sideOffset={4}
          style={{
            backgroundColor: 'var(--puck-color-white)',
            border: '1px solid var(--puck-color-grey-09)',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 99999,
            minWidth,
          }}
          data-puck-rte-menu
        >
          {children}
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}

// Keep the old export name for backwards compatibility during migration
export { Dropdown as DropdownPortal }
