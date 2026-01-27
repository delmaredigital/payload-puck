/**
 * Card Component - Server-safe Puck Configuration
 *
 * Content card with image, heading, and text.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */

import type { ComponentConfig } from '@puckeditor/core'
import {
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
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'
import type { MediaReference } from '../../fields/MediaField.js'
import type { Alignment } from '../../fields/AlignmentField.js'

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
  contentPadding: PaddingValue | null
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
  contentPadding: DEFAULT_CONTENT_PADDING, // Default 16px padding
}

export const CardConfig: ComponentConfig<CardProps> = {
  label: 'Card',
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
