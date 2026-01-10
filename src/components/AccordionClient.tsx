'use client'

/**
 * AccordionClient - Client component for accordion interactivity
 *
 * This is the actual interactive accordion that uses useState.
 * Imported by the server-safe AccordionConfig to enable client-side expansion.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  marginValueToCSS,
  paddingValueToCSS,
  dimensionsValueToCSS,
  backgroundValueToCSS,
  transformValueToCSS,
  colorValueToCSS,
  cn,
  type PaddingValue,
  type DimensionsValue,
  type BackgroundValue,
  type AnimationValue,
  type TransformValue,
  type ColorValue,
} from '../fields/shared'
import { AnimatedWrapper } from './AnimatedWrapper'

interface AccordionItemData {
  title: string
  content: string
  defaultOpen: boolean
}

export interface AccordionClientProps {
  items: AccordionItemData[]
  allowMultiple: boolean
  textColor: ColorValue | null
  margin: PaddingValue | null
  background: BackgroundValue | null
  dimensions: DimensionsValue | null
  transform: TransformValue | null
  animation: AnimationValue | null
  customPadding: PaddingValue | null
}

// Accordion Item Component
function AccordionItem({
  item,
  isOpen,
  onToggle,
  textColorCSS,
}: {
  item: AccordionItemData
  isOpen: boolean
  onToggle: () => void
  textColorCSS?: string
}) {
  const textStyle: React.CSSProperties = textColorCSS ? { color: textColorCSS } : {}

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 px-4 text-left font-medium transition-all hover:bg-muted/50 text-foreground"
        style={textStyle}
      >
        <span>{item.title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div
          className="px-4 pb-4 text-muted-foreground"
          style={textColorCSS ? { color: textColorCSS } : undefined}
        >
          {item.content}
        </div>
      </div>
    </div>
  )
}

export function AccordionClient({
  items,
  allowMultiple,
  textColor,
  margin,
  background,
  dimensions,
  transform,
  animation,
  customPadding,
}: AccordionClientProps) {
  // Initialize open states from defaultOpen values
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const initialOpen = new Set<number>()
    items?.forEach((item, index) => {
      if (item.defaultOpen) {
        initialOpen.add(index)
      }
    })
    return initialOpen
  })

  const handleToggle = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        if (!allowMultiple) {
          newSet.clear()
        }
        newSet.add(index)
      }
      return newSet
    })
  }

  const textColorCSS = colorValueToCSS(textColor)
  const dimensionsStyles = dimensionsValueToCSS(dimensions)

  // Theme-aware classes - uses CSS variables for colors
  const accordionClasses = 'rounded-lg border border-border overflow-hidden bg-card'

  const backgroundStyles = backgroundValueToCSS(background)
  // Only apply background styles if explicitly set, otherwise let bg-card handle it
  const accordionStyle: React.CSSProperties = backgroundStyles && Object.keys(backgroundStyles).length > 0
    ? backgroundStyles
    : {}

  const marginCSS = marginValueToCSS(margin)
  const paddingCSS = paddingValueToCSS(customPadding)
  const transformStyles = transformValueToCSS(transform)

  const style: React.CSSProperties = {
    ...dimensionsStyles,
    ...(marginCSS ? { margin: marginCSS } : {}),
    ...(paddingCSS ? { padding: paddingCSS } : {}),
    ...transformStyles,
  }

  if (!items || items.length === 0) {
    return (
      <AnimatedWrapper animation={animation}>
        <div style={Object.keys(style).length > 0 ? style : undefined}>
          <div className={accordionClasses} style={accordionStyle}>
            <div className="p-4 text-center text-muted-foreground">
              No accordion items. Add items in the editor.
            </div>
          </div>
        </div>
      </AnimatedWrapper>
    )
  }

  return (
    <AnimatedWrapper animation={animation}>
      <div style={Object.keys(style).length > 0 ? style : undefined}>
        <div className={accordionClasses} style={accordionStyle}>
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openItems.has(index)}
              onToggle={() => handleToggle(index)}
              textColorCSS={textColorCSS}
            />
          ))}
        </div>
      </div>
    </AnimatedWrapper>
  )
}
