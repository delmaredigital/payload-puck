'use client'

/**
 * Accordion Component - Puck Configuration
 *
 * Expandable sections with collapsible content.
 * Uses plain HTML/CSS for the accordion behavior.
 * Supports custom margin for spacing control.
 */

import type { ComponentConfig } from '@puckeditor/core'
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
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createResetField } from '../../fields/ResetField'
import { createBackgroundField } from '../../fields/BackgroundField'
import { createAnimationField } from '../../fields/AnimationField'
import { createTransformField } from '../../fields/TransformField'
import { createColorPickerField } from '../../fields/ColorPickerField'

interface AccordionItemData {
  title: string
  content: string
  defaultOpen: boolean
}

interface AccordionRendererProps {
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

// Main Accordion Render Component
function AccordionRenderer({
  items,
  allowMultiple,
  textColor,
  margin,
  background,
  dimensions,
  transform,
  animation,
  customPadding,
}: AccordionRendererProps) {
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

  const style: React.CSSProperties = {
    ...dimensionsStyles,
  }
  const marginCSS = marginValueToCSS(margin)
  if (marginCSS) {
    style.margin = marginCSS
  }
  const paddingCSS = paddingValueToCSS(customPadding)
  if (paddingCSS) {
    style.padding = paddingCSS
  }
  const transformStyles = transformValueToCSS(transform)
  if (transformStyles) {
    Object.assign(style, transformStyles)
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

// Default padding with standard horizontal spacing (replaces hardcoded px-4)
const DEFAULT_PADDING: PaddingValue = {
  top: 0,
  right: 16,
  bottom: 0,
  left: 16,
  unit: 'px',
  linked: false,
}

export interface AccordionProps {
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

const defaultProps: AccordionProps = {
  items: [
    {
      title: 'What is this?',
      content: 'This is an accordion component that can expand and collapse.',
      defaultOpen: false,
    },
    {
      title: 'How do I use it?',
      content: 'Click on each item to expand or collapse it.',
      defaultOpen: false,
    },
  ],
  allowMultiple: false,
  textColor: null,
  margin: null,
  background: null,
  dimensions: null,
  transform: null,
  animation: null,
  customPadding: DEFAULT_PADDING, // Default 16px horizontal padding, visible in editor
}

export const AccordionConfig: ComponentConfig = {
  label: 'Accordion',
  fields: {
    _reset: createResetField({ defaultProps }),
    items: {
      type: 'array',
      label: 'Items',
      arrayFields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        content: {
          type: 'textarea',
          label: 'Content',
        },
        defaultOpen: {
          type: 'radio',
          label: 'Default Open',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
      },
      defaultItemProps: (index: number) => ({
        title: `Accordion Item ${index + 1}`,
        content: '',
        defaultOpen: index === 0,
      }),
      getItemSummary: (item: AccordionItemData) => item.title || 'Untitled',
    },
    allowMultiple: {
      type: 'radio',
      label: 'Allow Multiple Open',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    textColor: createColorPickerField({ label: 'Text Color' }),
    background: createBackgroundField({ label: 'Background' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    transform: createTransformField({ label: 'Transform' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: (props) => (
    <AccordionRenderer
      items={props.items}
      allowMultiple={props.allowMultiple}
      textColor={props.textColor}
      margin={props.margin}
      background={props.background}
      dimensions={props.dimensions}
      transform={props.transform}
      animation={props.animation}
      customPadding={props.customPadding}
    />
  ),
}
