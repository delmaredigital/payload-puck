/**
 * Image Component - Server-safe Puck Configuration
 *
 * Standalone image block with optional link wrapper.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */

import type { ComponentConfig } from '@puckeditor/core'
import {
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
} from '../../fields/shared.js'
import { AnimatedWrapper } from '../AnimatedWrapper.js'
import type { MediaReference } from '../../fields/MediaField.js'
import type { Alignment } from '../../fields/AlignmentField.js'

// Default padding with standard spacing (replaces hardcoded py-4 px-4)
const DEFAULT_PADDING: PaddingValue = {
  top: 16,
  right: 16,
  bottom: 16,
  left: 16,
  unit: 'px',
  linked: true,
}

// Simple ID generator for server-side rendering
let idCounter = 0
function generateUniqueId(): string {
  return `i${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`
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
  customPadding: DEFAULT_PADDING, // Default 16px padding
  visibility: null,
}

export const ImageConfig: ComponentConfig<ImageProps> = {
  label: 'Image',
  defaultProps,
  render: ({ image, alt, aspectRatio, link, openInNewTab, dimensions, alignment, margin, border, transform, animation, customPadding, visibility }) => {
    // Generate unique ID for CSS targeting (server-safe)
    const uniqueId = generateUniqueId()
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
