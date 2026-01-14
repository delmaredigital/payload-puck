/**
 * Image Component - Puck Configuration
 *
 * Standalone image block with optional link wrapper.
 * Server-safe version using standard HTML img element.
 *
 * Responsive Controls:
 * - visibility: Show/hide at different breakpoints
 */

import { useId } from 'react'
import type { ComponentConfig } from '@puckeditor/core'
import {
  aspectRatioField,
  aspectRatioMap,
  cn,
  marginValueToCSS,
  paddingValueToCSS,
  dimensionsValueToCSS,
  borderValueToCSS,
  transformValueToCSS,
  visibilityValueToCSS,
  type PaddingValue,
  type DimensionsValue,
  type BorderValue,
  type AnimationValue,
  type TransformValue,
  type VisibilityValue,
} from '../../fields/shared'
import { AnimatedWrapper } from '../AnimatedWrapper'
import { createMarginField } from '../../fields/MarginField'
import { createPaddingField } from '../../fields/PaddingField'
import { createDimensionsField } from '../../fields/DimensionsField'
import { createBorderField } from '../../fields/BorderField'
import { createMediaField, type MediaReference } from '../../fields/MediaField'
import { createAlignmentField, type Alignment } from '../../fields/AlignmentField'
import { createAnimationField } from '../../fields/AnimationField'
import { createTransformField } from '../../fields/TransformField'
import { createResetField } from '../../fields/ResetField'
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField'

// Default padding with standard spacing (replaces hardcoded py-4 px-4)
const DEFAULT_PADDING: PaddingValue = {
  top: 16,
  right: 16,
  bottom: 16,
  left: 16,
  unit: 'px',
  linked: true,
}

export interface ImageProps {
  image: MediaReference | null
  alt: string
  aspectRatio: string
  link: string
  openInNewTab: boolean
  margin: PaddingValue | null
  border: BorderValue | null
  dimensions: DimensionsValue | null
  alignment: Alignment | null
  transform: TransformValue | null
  animation: AnimationValue | null
  customPadding: PaddingValue | null
  visibility: VisibilityValue | null
}

const defaultProps: ImageProps = {
  image: null,
  alt: '',
  aspectRatio: 'auto',
  link: '',
  openInNewTab: false,
  margin: null,
  border: null,
  dimensions: null,
  alignment: null,
  transform: null,
  animation: null,
  customPadding: DEFAULT_PADDING, // Default 16px padding, visible in editor
  visibility: null,
}

export const ImageConfig: ComponentConfig = {
  label: 'Image',
  fields: {
    _reset: createResetField({ defaultProps }),
    image: createMediaField({ label: 'Image' }),
    alt: {
      type: 'text',
      label: 'Alt Text Override',
    },
    // Responsive visibility control
    visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
    aspectRatio: aspectRatioField,
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
    border: createBorderField({ label: 'Border' }),
    dimensions: createDimensionsField({ label: 'Dimensions' }),
    alignment: createAlignmentField({ label: 'Alignment', defaultValue: 'center' }),
    transform: createTransformField({ label: 'Transform' }),
    animation: createAnimationField({ label: 'Animation' }),
    // Spacing (grouped at bottom)
    margin: createMarginField({ label: 'Margin' }),
    customPadding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps,
  render: ({ image, alt, aspectRatio, link, openInNewTab, dimensions, alignment, margin, border, transform, animation, customPadding, visibility }) => {
    // Generate unique ID for CSS targeting
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uniqueId = useId().replace(/:/g, '')
    const wrapperClass = `puck-image-${uniqueId}`

    // Visibility media queries
    const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass)
    const dimensionsStyles = dimensionsValueToCSS(dimensions)

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
    const borderStyles = borderValueToCSS(border)
    if (borderStyles) {
      Object.assign(style, borderStyles)
    }
    const transformStyles = transformValueToCSS(transform)
    if (transformStyles) {
      Object.assign(style, transformStyles)
    }

    const alignmentValue = alignment ?? 'center'
    const alignmentClasses = cn(
      'flex',
      alignmentValue === 'left' && 'justify-start',
      alignmentValue === 'center' && 'justify-center',
      alignmentValue === 'right' && 'justify-end'
    )

    // Placeholder if no image
    if (!image?.url) {
      return (
        <AnimatedWrapper animation={animation}>
          {visibilityCSS && <style>{visibilityCSS}</style>}
          <div className={wrapperClass} style={Object.keys(style).length > 0 ? style : undefined}>
            <div className={alignmentClasses}>
              <div
                className={cn(
                  'relative overflow-hidden rounded-lg w-full max-w-md bg-muted flex items-center justify-center min-h-[200px]',
                  aspectRatioMap[aspectRatio] || ''
                )}
              >
                <span className="text-muted-foreground">No image selected</span>
              </div>
            </div>
          </div>
        </AnimatedWrapper>
      )
    }

    // For auto aspect ratio, use natural image dimensions
    // For fixed aspect ratios, use absolute positioning within aspect-ratio container
    // Note: When using aspect ratios in Flex, set a min-width via Dimensions
    const imageElement = aspectRatio === 'auto' ? (
      <div className="relative overflow-hidden rounded-lg w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={alt || image.alt || ''}
          className="w-full h-auto object-cover"
        />
      </div>
    ) : (
      <div className={cn('relative overflow-hidden rounded-lg w-full', aspectRatioMap[aspectRatio])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={alt || image.alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    )

    const content = link ? (
      <a
        href={link}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className="block transition-opacity hover:opacity-90"
      >
        {imageElement}
      </a>
    ) : (
      imageElement
    )

    return (
      <AnimatedWrapper animation={animation}>
        {visibilityCSS && <style>{visibilityCSS}</style>}
        <div className={wrapperClass} style={Object.keys(style).length > 0 ? style : undefined}>
          <div className={alignmentClasses}>{content}</div>
        </div>
      </AnimatedWrapper>
    )
  },
}
