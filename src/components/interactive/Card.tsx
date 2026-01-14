/**
 * Card Component - Puck Configuration
 *
 * Content card with image, heading, and text.
 */

import type { ComponentConfig } from '@puckeditor/core'
import {
  shadowField,
  shadowMap,
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  backgroundValueToCSS,
  borderValueToCSS,
  dimensionsValueToCSS,
  transformValueToCSS,
  type PaddingValue,
  type BackgroundValue,
  type BorderValue,
  type DimensionsValue,
  type AnimationValue,
  type TransformValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createResetField } from '../../fields/ResetField'
import { createBackgroundField } from '../../fields/BackgroundField'
import { createBorderField } from '../../fields/BorderField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createAlignmentField, type Alignment } from '../../fields/AlignmentField'
import { createAnimationField } from '../../fields/AnimationField'
import { createTransformField } from '../../fields/TransformField'
import type { MediaReference } from '../../fields/MediaField'

// Default content padding for card (replaces hardcoded p-4)
const DEFAULT_CONTENT_PADDING: PaddingValue = {
  top: 16,
  right: 16,
  bottom: 16,
  left: 16,
  unit: 'px',
  linked: true,
}

export interface CardProps {
  image: MediaReference | null
  heading: string
  text: string
  link: string
  openInNewTab: boolean
  shadow: string
  margin: PaddingValue | null
  background: BackgroundValue | null
  border: BorderValue | null
  dimensions: DimensionsValue | null
  alignment: Alignment | null
  transform: TransformValue | null
  animation: AnimationValue | null
  contentPadding: PaddingValue | null // Renamed from customPadding for clarity
}

const defaultProps: CardProps = {
  image: null,
  heading: 'Card Heading',
  text: 'Card description text goes here.',
  link: '',
  openInNewTab: false,
  shadow: 'md',
  margin: null,
  background: null,
  border: null,
  dimensions: null,
  alignment: null,
  transform: null,
  animation: null,
  contentPadding: DEFAULT_CONTENT_PADDING, // Default 16px padding, visible in editor
}

export const CardConfig: ComponentConfig = {
  label: 'Card',
  fields: {
    _reset: createResetField({ defaultProps }),
    image: {
      type: 'object',
      label: 'Image',
      objectFields: {
        id: { type: 'text', label: 'Media ID' },
        url: { type: 'text', label: 'URL' },
        alt: { type: 'text', label: 'Alt Text' },
      },
    },
    heading: {
      type: 'text',
      label: 'Heading',
    },
    text: {
      type: 'textarea',
      label: 'Text',
    },
    link: {
      type: 'text',
      label: 'Link URL',
    },
    openInNewTab: {
      type: 'radio',
      label: 'Open in New Tab',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    shadow: shadowField,
    background: createBackgroundField({ label: 'Background' }),
    border: createBorderField({ label: 'Border' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    alignment: createAlignmentField({ label: 'Alignment' }),
    transform: createTransformField({ label: 'Transform' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    contentPadding: createPaddingField({ label: 'Content Padding' }),
  },
  defaultProps,
  render: ({ image, heading, text, link, openInNewTab, shadow, background, dimensions, alignment, margin, border, transform, animation, contentPadding }) => {
    // Check if border has radius, if so don't apply rounded-lg
    const hasBorderRadius = border?.radius && border.radius > 0
    const cardClasses = cn(
      'overflow-hidden transition-all bg-card',
      !hasBorderRadius && 'rounded-lg',
      shadowMap[shadow] || '',
      link && 'hover:shadow-lg cursor-pointer'
    )

    // Wrapper style for margin, dimensions, alignment, transform, animation
    const wrapperStyle: React.CSSProperties = {}
    const marginCSS = marginValueToCSS(margin)
    if (marginCSS) {
      wrapperStyle.margin = marginCSS
    }
    const dimensionsStyles = dimensionsValueToCSS(dimensions)
    if (dimensionsStyles) {
      Object.assign(wrapperStyle, dimensionsStyles)
    }
    const transformStyles = transformValueToCSS(transform)
    if (transformStyles) {
      Object.assign(wrapperStyle, transformStyles)
    }

    // Alignment classes for wrapper
    const alignmentValue = alignment ?? 'left'
    const alignmentClasses = cn(
      'flex',
      alignmentValue === 'left' && 'justify-start',
      alignmentValue === 'center' && 'justify-center',
      alignmentValue === 'right' && 'justify-end'
    )

    // Card background styles from BackgroundValue
    const backgroundStyles = backgroundValueToCSS(background)
    const cardStyle: React.CSSProperties = {
      ...backgroundStyles,
    }
    // Note: bg-card class handles default background (theme-aware)
    // Apply border to card
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) {
      Object.assign(cardStyle, borderStyles)
    }

    // Content section style with configurable padding
    const contentStyle: React.CSSProperties = {}
    const contentPaddingCSS = paddingValueToCSS(contentPadding)
    if (contentPaddingCSS) {
      contentStyle.padding = contentPaddingCSS
    }

    const cardContent = (
      <div className={cardClasses} style={cardStyle}>
        {/* Image */}
        {image?.url ? (
          <div className="relative aspect-video w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt || heading || ''}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}

        {/* Content */}
        <div style={contentStyle}>
          {heading && (
            <h3 className="text-lg font-semibold text-foreground mb-2">{heading}</h3>
          )}
          {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
      </div>
    )

    if (link) {
      return (
        <AnimatedWrapper animation={animation}>
          <div className={alignmentClasses}>
            <a
              href={link}
              target={openInNewTab ? '_blank' : undefined}
              rel={openInNewTab ? 'noopener noreferrer' : undefined}
              className="block"
              style={wrapperStyle}
            >
              {cardContent}
            </a>
          </div>
        </AnimatedWrapper>
      )
    }

    return (
      <AnimatedWrapper animation={animation}>
        <div className={alignmentClasses}>
          <div style={wrapperStyle}>{cardContent}</div>
        </div>
      </AnimatedWrapper>
    )
  },
}
