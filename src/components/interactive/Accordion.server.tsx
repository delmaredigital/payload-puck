/**
 * Accordion Component - Server-safe Puck Configuration
 *
 * Expandable sections with collapsible content.
 * This version contains only the render function and types - no fields.
 * The render function returns a client component (AccordionClient) that
 * handles the interactive state.
 */

import type { ComponentConfig } from '@puckeditor/core'
import type {
  PaddingValue,
  DimensionsValue,
  BackgroundValue,
  AnimationValue,
  TransformValue,
  ColorValue,
} from '../../fields/shared.js'
import { AccordionClient } from '../AccordionClient.js'

interface AccordionItemData {
  title: string
  content: string
  defaultOpen: boolean
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
  customPadding: null,
}

export const AccordionConfig: ComponentConfig<AccordionProps> = {
  label: 'Accordion',
  defaultProps,
  render: (props) => (
    <AccordionClient
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
