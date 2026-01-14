/**
 * Shared Puck Field Definitions
 *
 * Reusable field configurations and CSS utility maps for Puck components.
 * These ensure consistency across all components.
 */

import type { Field } from '@puckeditor/core'
import type React from 'react'

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Combines class names, filtering out falsy values
 * A simple alternative to clsx/classnames for bundling purposes
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// =============================================================================
// Custom Style Types
// =============================================================================

export interface ColorValue {
  hex: string
  opacity?: number
}

export interface PaddingValue {
  top: number
  right: number
  bottom: number
  left: number
  unit: 'px' | 'rem' | 'em' | '%'
  /** Whether all sides are linked (sync together). Defaults to true if not set. */
  linked?: boolean
}

export interface BorderValue {
  style: 'none' | 'solid' | 'dashed' | 'dotted'
  width: number
  color: ColorValue | null
  radius: number
  sides: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
}

export interface WidthValue {
  mode: 'full' | 'contained' | 'custom'
  maxWidth: number
  unit: 'px' | 'rem' | '%' | 'vw'
  alignment: 'left' | 'center' | 'right'
}

// =============================================================================
// Dimensions Types (Enhanced Width + Height)
// =============================================================================

export type DimensionsUnit = 'px' | 'rem' | '%' | 'vw' | 'vh'
export type DimensionsMode = 'full' | 'contained' | 'custom'
export type ContentAlignment = 'left' | 'center' | 'right'

/**
 * Represents a single dimension constraint (min or max for width or height)
 */
export interface DimensionConstraint {
  value: number
  unit: DimensionsUnit
  enabled: boolean
}

/**
 * Full dimensions configuration value - replaces/extends WidthValue
 * Supports min/max constraints for both width and height
 */
export interface DimensionsValue {
  /** Width mode: full (100%), contained (centered max-width), or custom */
  mode: DimensionsMode
  /** Content alignment within the container */
  alignment: ContentAlignment
  /** Minimum width constraint (optional) */
  minWidth?: DimensionConstraint | null
  /** Maximum width constraint (required for backward compat) */
  maxWidth: DimensionConstraint
  /** Minimum height constraint (optional) */
  minHeight?: DimensionConstraint | null
  /** Maximum height constraint (optional) */
  maxHeight?: DimensionConstraint | null
  /** UI state: whether advanced mode is expanded */
  advancedMode?: boolean
}

/**
 * Type guard to detect legacy WidthValue format
 */
export function isLegacyWidthValue(value: unknown): value is WidthValue {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.maxWidth === 'number' &&
    typeof v.unit === 'string' &&
    typeof v.mode === 'string' &&
    !('minWidth' in v) &&
    !('minHeight' in v) &&
    !('maxHeight' in v)
  )
}

/**
 * Migrate legacy WidthValue to new DimensionsValue format
 */
export function migrateWidthValue(legacy: WidthValue): DimensionsValue {
  return {
    mode: legacy.mode,
    alignment: legacy.alignment,
    maxWidth: {
      value: legacy.maxWidth,
      unit: legacy.unit,
      enabled: true,
    },
    advancedMode: false,
  }
}

// =============================================================================
// Background Types
// =============================================================================

export interface GradientStop {
  color: ColorValue
  position: number // 0-100%
}

export interface GradientValue {
  type: 'linear' | 'radial'
  angle: number // 0-360 for linear
  stops: GradientStop[]
  radialShape?: 'circle' | 'ellipse'
  radialPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Gradient mask for fading images to transparent
 */
export interface GradientMask {
  enabled: boolean
  direction:
    | 'to-top'
    | 'to-bottom'
    | 'to-left'
    | 'to-right'
    | 'to-top-left'
    | 'to-top-right'
    | 'to-bottom-left'
    | 'to-bottom-right'
    | 'from-center' // Radial gradient from center outward
  startOpacity: number // 0-100, typically 100 (fully visible)
  endOpacity: number // 0-100, typically 0 (fully transparent)
  startPosition: number // 0-100%, where fade begins
  endPosition: number // 0-100%, where fade ends
}

export interface BackgroundImageValue {
  media: import('./MediaField').MediaReference | null
  size: 'cover' | 'contain' | 'auto'
  position:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  attachment: 'scroll' | 'fixed'
  /** Overall image opacity 0-100 (default 100) */
  opacity?: number
  /** Gradient mask for fade to transparent effect */
  mask?: GradientMask
}

/**
 * Overlay layer for images (Divi-style)
 * Renders a color or gradient on top of the background image
 */
export interface BackgroundOverlay {
  enabled: boolean
  type: 'solid' | 'gradient'
  solid?: ColorValue | null
  gradient?: GradientValue | null
}

export interface BackgroundValue {
  type: 'none' | 'solid' | 'gradient' | 'image'
  solid?: ColorValue | null
  gradient?: GradientValue | null
  image?: BackgroundImageValue | null
  /** Overlay layer, only used when type === 'image' */
  overlay?: BackgroundOverlay | null
}

// =============================================================================
// Visibility Field
// =============================================================================

export const visibilityField: Field = {
  type: 'select',
  label: 'Visibility',
  options: [
    { label: 'Always Visible', value: 'always' },
    { label: 'Authenticated Users Only', value: 'authenticatedOnly' },
    { label: 'Guests Only', value: 'guestOnly' },
  ],
}

// =============================================================================
// Button Style Field
// =============================================================================

export const buttonStyleField: Field = {
  type: 'select',
  label: 'Button Style',
  options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Outline', value: 'outline' },
    { label: 'Ghost', value: 'ghost' },
    { label: 'Link', value: 'link' },
  ],
}

// =============================================================================
// Button Variant Field
// =============================================================================

export const buttonVariantField: Field = {
  type: 'select',
  label: 'Button Variant',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Destructive', value: 'destructive' },
    { label: 'Outline', value: 'outline' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Ghost', value: 'ghost' },
    { label: 'Link', value: 'link' },
  ],
}

// =============================================================================
// Button Size Field
// =============================================================================

export const buttonSizeField: Field = {
  type: 'select',
  label: 'Size',
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Default', value: 'default' },
    { label: 'Large', value: 'lg' },
    { label: 'Icon', value: 'icon' },
  ],
}

// =============================================================================
// Background Color Field (Preset Palette)
// =============================================================================

export const backgroundColorField: Field = {
  type: 'select',
  label: 'Background Color',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Background', value: 'background' },
    { label: 'Card', value: 'card' },
    { label: 'Muted', value: 'muted' },
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Accent', value: 'accent' },
  ],
}

// =============================================================================
// Text Color Field (Preset Palette)
// =============================================================================

export const textColorField: Field = {
  type: 'select',
  label: 'Text Color',
  options: [
    { label: 'Theme (Auto)', value: 'default' },
    { label: 'Foreground', value: 'foreground' },
    { label: 'Muted', value: 'muted-foreground' },
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary-foreground' },
  ],
}

// =============================================================================
// Gap/Spacing Field
// =============================================================================

export const gapField: Field = {
  type: 'select',
  label: 'Gap',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Extra Small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
    { label: '2XL', value: '2xl' },
  ],
}

// =============================================================================
// Shadow Field
// =============================================================================

export const shadowField: Field = {
  type: 'select',
  label: 'Shadow',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
    { label: '2XL', value: '2xl' },
  ],
}

// =============================================================================
// Spacer Height Field
// =============================================================================

export const spacerHeightField: Field = {
  type: 'select',
  label: 'Height',
  options: [
    { label: 'Extra Small (8px)', value: 'xs' },
    { label: 'Small (16px)', value: 'sm' },
    { label: 'Medium (32px)', value: 'md' },
    { label: 'Large (48px)', value: 'lg' },
    { label: 'Extra Large (64px)', value: 'xl' },
    { label: '2XL (96px)', value: '2xl' },
    { label: '3XL (128px)', value: '3xl' },
  ],
}

// =============================================================================
// Heading Level Field
// =============================================================================

export const headingLevelField: Field = {
  type: 'select',
  label: 'Heading Level',
  options: [
    { label: 'H1', value: 'h1' },
    { label: 'H2', value: 'h2' },
    { label: 'H3', value: 'h3' },
    { label: 'H4', value: 'h4' },
    { label: 'H5', value: 'h5' },
    { label: 'H6', value: 'h6' },
  ],
}

// =============================================================================
// Text Size Field
// =============================================================================

export const textSizeField: Field = {
  type: 'select',
  label: 'Text Size',
  options: [
    { label: 'Extra Small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Base', value: 'base' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
    { label: '2XL', value: '2xl' },
  ],
}

// =============================================================================
// Aspect Ratio Field
// =============================================================================

export const aspectRatioField: Field = {
  type: 'select',
  label: 'Aspect Ratio',
  options: [
    { label: 'Auto', value: 'auto' },
    { label: 'Square (1:1)', value: 'square' },
    { label: 'Video (16:9)', value: 'video' },
    { label: 'Portrait (3:4)', value: 'portrait' },
    { label: 'Landscape (4:3)', value: 'landscape' },
    { label: 'Wide (21:9)', value: 'wide' },
  ],
}

// =============================================================================
// Divider Style Field
// =============================================================================

export const dividerStyleField: Field = {
  type: 'select',
  label: 'Style',
  options: [
    { label: 'Solid', value: 'solid' },
    { label: 'Dashed', value: 'dashed' },
    { label: 'Dotted', value: 'dotted' },
  ],
}

// =============================================================================
// Border Radius Field
// =============================================================================

export const borderRadiusField: Field = {
  type: 'select',
  label: 'Border Radius',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
    { label: '2XL', value: '2xl' },
    { label: 'Full', value: 'full' },
  ],
}

// =============================================================================
// Columns Count Field
// =============================================================================

export const columnsCountField: Field = {
  type: 'select',
  label: 'Columns',
  options: [
    { label: '1 Column', value: '1' },
    { label: '2 Columns', value: '2' },
    { label: '3 Columns', value: '3' },
    { label: '4 Columns', value: '4' },
    { label: '5 Columns', value: '5' },
    { label: '6 Columns', value: '6' },
  ],
}

// =============================================================================
// Flex Direction Field
// =============================================================================

export const flexDirectionField: Field = {
  type: 'select',
  label: 'Direction',
  options: [
    { label: 'Row (Horizontal)', value: 'row' },
    { label: 'Column (Vertical)', value: 'column' },
    { label: 'Row Reverse', value: 'row-reverse' },
    { label: 'Column Reverse', value: 'column-reverse' },
  ],
}

// =============================================================================
// Flex Wrap Field
// =============================================================================

export const flexWrapField: Field = {
  type: 'select',
  label: 'Wrap',
  options: [
    { label: 'No Wrap', value: 'nowrap' },
    { label: 'Wrap', value: 'wrap' },
    { label: 'Wrap Reverse', value: 'wrap-reverse' },
  ],
}

// =============================================================================
// CSS Class Mappings
// =============================================================================

/**
 * Maps alignment values to Tailwind classes
 */
export const alignmentMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

/**
 * Maps background color values to Tailwind classes
 */
export const bgColorMap: Record<string, string> = {
  none: '',
  background: 'bg-background',
  card: 'bg-card',
  muted: 'bg-muted',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
}

/**
 * Maps text color values to Tailwind classes
 */
export const textColorMap: Record<string, string> = {
  default: 'text-inherit',
  foreground: 'text-foreground',
  'muted-foreground': 'text-muted-foreground',
  primary: 'text-primary',
  'secondary-foreground': 'text-secondary-foreground',
}

/**
 * Maps gap values to Tailwind classes
 */
export const gapMap: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
}

/**
 * Maps shadow values to Tailwind classes
 */
export const shadowMap: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
}

/**
 * Maps spacer height values to Tailwind classes
 */
export const spacerHeightMap: Record<string, string> = {
  xs: 'h-2',
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
  '2xl': 'h-24',
  '3xl': 'h-32',
}

/**
 * Maps heading level to Tailwind classes
 */
export const headingLevelMap: Record<string, string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  h6: 'text-base md:text-lg font-medium',
}

/**
 * Maps text size to Tailwind classes
 */
export const textSizeMap: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

/**
 * Maps aspect ratio to Tailwind classes
 */
export const aspectRatioMap: Record<string, string> = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[21/9]',
}

/**
 * Maps divider style to Tailwind classes
 */
export const dividerStyleMap: Record<string, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}

/**
 * Maps border radius to Tailwind classes
 */
export const borderRadiusMap: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

/**
 * Maps columns count to Tailwind grid classes (responsive)
 */
export const columnsCountMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  '6': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

/**
 * Maps flex direction to Tailwind classes
 */
export const flexDirectionMap: Record<string, string> = {
  row: 'flex-row',
  column: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'column-reverse': 'flex-col-reverse',
}

/**
 * Maps justify content to Tailwind classes
 * Supports both short (start) and full (flex-start) values
 */
export const justifyContentMap: Record<string, string> = {
  start: 'justify-start',
  'flex-start': 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'flex-end': 'justify-end',
  between: 'justify-between',
  'space-between': 'justify-between',
  around: 'justify-around',
  'space-around': 'justify-around',
  evenly: 'justify-evenly',
  'space-evenly': 'justify-evenly',
}

/**
 * Maps align items to Tailwind classes
 * Supports both short (start) and full (flex-start) values
 */
export const alignItemsMap: Record<string, string> = {
  start: 'items-start',
  'flex-start': 'items-start',
  center: 'items-center',
  end: 'items-end',
  'flex-end': 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

/**
 * Maps self-alignment to Tailwind classes (for grid/flex item alignment)
 * Used by components like TextImageSplit for vertical self-alignment
 */
export const selfAlignmentMap: Record<string, string> = {
  start: 'self-start',
  'flex-start': 'self-start',
  center: 'self-center',
  end: 'self-end',
  'flex-end': 'self-end',
  stretch: 'self-stretch',
  auto: 'self-auto',
}

/**
 * Maps flex wrap to Tailwind classes
 */
export const flexWrapMap: Record<string, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
}

// =============================================================================
// Custom Style Value Utilities
// =============================================================================

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '')
  if (clean.length !== 6) return null

  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null

  return { r, g, b }
}

/**
 * Convert ColorValue to CSS rgba string
 */
export function colorValueToCSS(color: ColorValue | null | undefined): string | undefined {
  if (!color?.hex) return undefined

  const rgb = hexToRgb(color.hex)
  if (!rgb) return color.hex

  const opacity = (color.opacity ?? 100) / 100

  if (opacity === 1) {
    return color.hex
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Convert PaddingValue to CSS padding string
 */
export function paddingValueToCSS(padding: PaddingValue | null | undefined): string | undefined {
  if (!padding) return undefined

  const { top, right, bottom, left, unit } = padding

  if (top === right && right === bottom && bottom === left) {
    return `${top}${unit}`
  }

  if (top === bottom && left === right) {
    return `${top}${unit} ${right}${unit}`
  }

  if (left === right) {
    return `${top}${unit} ${right}${unit} ${bottom}${unit}`
  }

  return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`
}

/**
 * Convert PaddingValue to CSS margin string (same structure, different property)
 */
export function marginValueToCSS(margin: PaddingValue | null | undefined): string | undefined {
  if (!margin) return undefined

  const { top, right, bottom, left, unit } = margin

  if (top === right && right === bottom && bottom === left) {
    return `${top}${unit}`
  }

  if (top === bottom && left === right) {
    return `${top}${unit} ${right}${unit}`
  }

  if (left === right) {
    return `${top}${unit} ${right}${unit} ${bottom}${unit}`
  }

  return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`
}

/**
 * Convert BorderValue to CSS properties object
 */
export function borderValueToCSS(border: BorderValue | null | undefined): React.CSSProperties | undefined {
  if (!border || border.style === 'none') return undefined

  const color = colorValueToCSS(border.color) || '#000000'
  const style: React.CSSProperties = {}

  if (border.sides.top) {
    style.borderTopWidth = `${border.width}px`
    style.borderTopStyle = border.style
    style.borderTopColor = color
  }

  if (border.sides.right) {
    style.borderRightWidth = `${border.width}px`
    style.borderRightStyle = border.style
    style.borderRightColor = color
  }

  if (border.sides.bottom) {
    style.borderBottomWidth = `${border.width}px`
    style.borderBottomStyle = border.style
    style.borderBottomColor = color
  }

  if (border.sides.left) {
    style.borderLeftWidth = `${border.width}px`
    style.borderLeftStyle = border.style
    style.borderLeftColor = color
  }

  if (border.radius > 0) {
    style.borderRadius = `${border.radius}px`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

/**
 * Convert WidthValue to CSS properties object
 */
export function widthValueToCSS(width: WidthValue | null | undefined): React.CSSProperties | undefined {
  if (!width) return undefined

  const style: React.CSSProperties = {}

  if (width.mode === 'full') {
    style.width = '100%'
    style.maxWidth = '100%'
  } else {
    style.maxWidth = `${width.maxWidth}${width.unit}`
    style.width = '100%'
  }

  switch (width.alignment) {
    case 'left':
      style.marginLeft = '0'
      style.marginRight = 'auto'
      break
    case 'center':
      style.marginLeft = 'auto'
      style.marginRight = 'auto'
      break
    case 'right':
      style.marginLeft = 'auto'
      style.marginRight = '0'
      break
  }

  return style
}

/**
 * Convert DimensionsValue to CSS properties object
 * Handles both legacy WidthValue and new DimensionsValue formats
 */
export function dimensionsValueToCSS(
  dimensions: DimensionsValue | WidthValue | null | undefined
): React.CSSProperties | undefined {
  if (!dimensions) return undefined

  // Handle legacy WidthValue format
  if (isLegacyWidthValue(dimensions)) {
    return widthValueToCSS(dimensions)
  }

  const dim = dimensions as DimensionsValue
  const style: React.CSSProperties = {}

  // Width handling based on mode
  if (dim.mode === 'full') {
    style.width = '100%'
    style.maxWidth = '100%'
  } else {
    style.width = '100%'

    // Max Width (required)
    if (dim.maxWidth?.enabled !== false && dim.maxWidth?.value > 0) {
      style.maxWidth = `${dim.maxWidth.value}${dim.maxWidth.unit}`
    }

    // Min Width (optional)
    if (dim.minWidth?.enabled && dim.minWidth.value > 0) {
      style.minWidth = `${dim.minWidth.value}${dim.minWidth.unit}`
    }
  }

  // Height handling (applies to all modes)
  if (dim.minHeight?.enabled && dim.minHeight.value > 0) {
    style.minHeight = `${dim.minHeight.value}${dim.minHeight.unit}`
  }

  if (dim.maxHeight?.enabled && dim.maxHeight.value > 0) {
    style.maxHeight = `${dim.maxHeight.value}${dim.maxHeight.unit}`
  }

  // Alignment (via margin)
  switch (dim.alignment) {
    case 'left':
      style.marginLeft = '0'
      style.marginRight = 'auto'
      break
    case 'center':
      style.marginLeft = 'auto'
      style.marginRight = 'auto'
      break
    case 'right':
      style.marginLeft = 'auto'
      style.marginRight = '0'
      break
  }

  return style
}

/**
 * Get human-readable summary of dimensions
 */
export function getDimensionsSummary(dim: DimensionsValue | null | undefined): string {
  if (!dim) return 'auto'

  if (dim.mode === 'full') return '100%'

  const parts: string[] = []

  if (dim.maxWidth?.enabled && dim.maxWidth.value > 0) {
    parts.push(`max: ${dim.maxWidth.value}${dim.maxWidth.unit}`)
  }

  if (dim.minWidth?.enabled && dim.minWidth.value > 0) {
    parts.push(`min: ${dim.minWidth.value}${dim.minWidth.unit}`)
  }

  if (dim.maxHeight?.enabled && dim.maxHeight.value > 0) {
    parts.push(`h-max: ${dim.maxHeight.value}${dim.maxHeight.unit}`)
  }

  if (dim.minHeight?.enabled && dim.minHeight.value > 0) {
    parts.push(`h-min: ${dim.minHeight.value}${dim.minHeight.unit}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'auto'
}

/**
 * Combined style generator for layout components
 */
export function getCustomStyleObject(options: {
  backgroundColor?: ColorValue | null
  textColor?: ColorValue | null
  padding?: PaddingValue | null
  margin?: PaddingValue | null
  border?: BorderValue | null
  width?: WidthValue | null
}): React.CSSProperties {
  const style: React.CSSProperties = {}

  const bgColor = colorValueToCSS(options.backgroundColor)
  if (bgColor) {
    style.backgroundColor = bgColor
  }

  const txtColor = colorValueToCSS(options.textColor)
  if (txtColor) {
    style.color = txtColor
  }

  const paddingCSS = paddingValueToCSS(options.padding)
  if (paddingCSS) {
    style.padding = paddingCSS
  }

  const marginCSS = marginValueToCSS(options.margin)
  if (marginCSS) {
    style.margin = marginCSS
  }

  const borderCSS = borderValueToCSS(options.border)
  if (borderCSS) {
    Object.assign(style, borderCSS)
  }

  const widthCSS = widthValueToCSS(options.width)
  if (widthCSS) {
    Object.assign(style, widthCSS)
  }

  return style
}

/**
 * Convert GradientValue to CSS gradient string
 */
export function gradientValueToCSS(gradient: GradientValue | null | undefined): string {
  if (!gradient?.stops || gradient.stops.length === 0) {
    return 'transparent'
  }

  // Sort stops by position
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position)

  // Convert stops to CSS format
  const stopsCSS = sortedStops
    .map((stop) => {
      const color = colorValueToCSS(stop.color) || 'transparent'
      return `${color} ${stop.position}%`
    })
    .join(', ')

  if (gradient.type === 'radial') {
    const shape = gradient.radialShape || 'circle'
    const position = gradient.radialPosition || 'center'
    return `radial-gradient(${shape} at ${position}, ${stopsCSS})`
  }

  // Linear gradient
  return `linear-gradient(${gradient.angle}deg, ${stopsCSS})`
}

/**
 * Convert position value to CSS background-position
 */
function positionToCSS(
  position: BackgroundImageValue['position'] | undefined
): string {
  const positionMap: Record<NonNullable<BackgroundImageValue['position']>, string> = {
    center: 'center',
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
  }
  return position ? positionMap[position] || 'center' : 'center'
}

/**
 * Convert GradientMask direction to CSS gradient direction
 */
function maskDirectionToCSS(direction: GradientMask['direction']): string {
  const directionMap: Record<GradientMask['direction'], string> = {
    'to-top': 'to top',
    'to-bottom': 'to bottom',
    'to-left': 'to left',
    'to-right': 'to right',
    'to-top-left': 'to top left',
    'to-top-right': 'to top right',
    'to-bottom-left': 'to bottom left',
    'to-bottom-right': 'to bottom right',
    'from-center': 'radial', // Not used for linear, handled separately in maskToCSS
  }
  return directionMap[direction] || 'to bottom'
}

/**
 * Convert GradientMask to CSS mask-image string
 */
function maskToCSS(mask: GradientMask): string {
  const startAlpha = (mask.startOpacity ?? 100) / 100
  const endAlpha = (mask.endOpacity ?? 0) / 100

  // Handle radial gradient for "from-center"
  if (mask.direction === 'from-center') {
    return `radial-gradient(circle at center, rgba(0,0,0,${startAlpha}) ${mask.startPosition}%, rgba(0,0,0,${endAlpha}) ${mask.endPosition}%)`
  }

  // Linear gradient for directional fades
  const direction = maskDirectionToCSS(mask.direction)
  return `linear-gradient(${direction}, rgba(0,0,0,${startAlpha}) ${mask.startPosition}%, rgba(0,0,0,${endAlpha}) ${mask.endPosition}%)`
}

/**
 * Result of background CSS conversion
 * Includes both styles and metadata for consumer components
 */
export interface BackgroundCSSResult {
  /** CSS properties to apply directly */
  styles: React.CSSProperties
  /** Image opacity (0-1) - consumer should apply via wrapper if needed */
  imageOpacity?: number
}

/**
 * Convert BackgroundValue to CSS properties object
 * Returns both styles and metadata for advanced features like image opacity
 */
export function backgroundValueToCSS(
  bg: BackgroundValue | null | undefined
): React.CSSProperties {
  if (!bg || bg.type === 'none') {
    return {}
  }

  const style: React.CSSProperties = {}

  switch (bg.type) {
    case 'solid':
      if (bg.solid?.hex) {
        style.backgroundColor = colorValueToCSS(bg.solid)
      }
      break

    case 'gradient':
      if (bg.gradient && bg.gradient.stops && bg.gradient.stops.length > 0) {
        style.background = gradientValueToCSS(bg.gradient)
      }
      break

    case 'image':
      if (bg.image?.media?.url) {
        const imageUrl = bg.image.media.url
        const size = bg.image.size || 'cover'
        const position = positionToCSS(bg.image.position)
        const repeat = bg.image.repeat || 'no-repeat'
        const attachment = bg.image.attachment || 'scroll'

        // Check if overlay is enabled
        if (bg.overlay?.enabled) {
          // Layer overlay on top of image using CSS multiple backgrounds
          // Use only backgroundImage to avoid shorthand/longhand conflicts
          const overlayCSS =
            bg.overlay.type === 'solid'
              ? colorValueToCSS(bg.overlay.solid)
              : gradientValueToCSS(bg.overlay.gradient)

          // CSS background layering: first layer is on top
          // For solid color overlay, we need to use a gradient to make it a proper layer
          if (bg.overlay.type === 'solid' && overlayCSS) {
            style.backgroundImage = `linear-gradient(${overlayCSS}, ${overlayCSS}), url(${imageUrl})`
          } else {
            style.backgroundImage = `${overlayCSS}, url(${imageUrl})`
          }
          // Use comma-separated values for each layer
          style.backgroundSize = `auto, ${size}`
          style.backgroundPosition = `center, ${position}`
          style.backgroundRepeat = `no-repeat, ${repeat}`
          style.backgroundAttachment = `scroll, ${attachment}`
        } else {
          // No overlay, just the image
          style.backgroundImage = `url(${imageUrl})`
          style.backgroundSize = size
          style.backgroundPosition = position
          style.backgroundRepeat = repeat
          style.backgroundAttachment = attachment
        }

        // Apply gradient mask if enabled
        if (bg.image.mask?.enabled) {
          const maskCSS = maskToCSS(bg.image.mask)
          style.maskImage = maskCSS
          // Webkit prefix for Safari support
          ;(style as Record<string, string>).WebkitMaskImage = maskCSS
        }
      }
      break
  }

  return style
}

/**
 * Get image opacity from BackgroundValue (for consumer wrapper components)
 * Returns undefined if no image or opacity is 100%
 */
export function getBackgroundImageOpacity(
  bg: BackgroundValue | null | undefined
): number | undefined {
  if (!bg || bg.type !== 'image' || !bg.image) return undefined
  const opacity = bg.image.opacity ?? 100
  return opacity < 100 ? opacity / 100 : undefined
}

/**
 * Check if any custom style values are set
 */
export function hasCustomStyles(options: {
  backgroundColor?: ColorValue | null
  textColor?: ColorValue | null
  padding?: PaddingValue | null
  margin?: PaddingValue | null
  border?: BorderValue | null
  width?: WidthValue | null
}): boolean {
  return !!(
    options.backgroundColor?.hex ||
    options.textColor?.hex ||
    options.padding ||
    options.margin ||
    (options.border && options.border.style !== 'none') ||
    options.width
  )
}

// =============================================================================
// Transform Types
// =============================================================================

export type TransformOrigin =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export interface TransformValue {
  rotate: number // -360 to 360
  scaleX: number // 0.1 to 3
  scaleY: number // 0.1 to 3
  scaleLocked: boolean // When true, X and Y sync
  skewX: number // -45 to 45
  skewY: number // -45 to 45
  translateX: number
  translateY: number
  translateUnit: 'px' | 'rem' | '%'
  origin: TransformOrigin

  // Optional 3D
  enable3D: boolean
  perspective?: number // 100-2000px
  rotateX?: number // -180 to 180
  rotateY?: number // -180 to 180
}

/**
 * Default transform value
 */
export const DEFAULT_TRANSFORM: TransformValue = {
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  scaleLocked: true,
  skewX: 0,
  skewY: 0,
  translateX: 0,
  translateY: 0,
  translateUnit: 'px',
  origin: 'center',
  enable3D: false,
  perspective: 1000,
  rotateX: 0,
  rotateY: 0,
}

/**
 * Convert TransformOrigin to CSS transform-origin value
 */
function transformOriginToCSS(origin: TransformOrigin): string {
  const originMap: Record<TransformOrigin, string> = {
    center: 'center',
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
  }
  return originMap[origin] || 'center'
}

/**
 * Convert TransformValue to CSS properties object
 */
export function transformValueToCSS(
  transform: TransformValue | null | undefined
): React.CSSProperties | undefined {
  if (!transform) return undefined

  const style: React.CSSProperties = {}
  const transforms: string[] = []

  // Handle 3D perspective
  if (transform.enable3D && transform.perspective) {
    style.perspective = `${transform.perspective}px`
  }

  // Build transform string
  // Translate
  if (transform.translateX !== 0 || transform.translateY !== 0) {
    transforms.push(
      `translate(${transform.translateX}${transform.translateUnit}, ${transform.translateY}${transform.translateUnit})`
    )
  }

  // Rotate (2D)
  if (transform.rotate !== 0) {
    transforms.push(`rotate(${transform.rotate}deg)`)
  }

  // 3D rotations
  if (transform.enable3D) {
    if (transform.rotateX && transform.rotateX !== 0) {
      transforms.push(`rotateX(${transform.rotateX}deg)`)
    }
    if (transform.rotateY && transform.rotateY !== 0) {
      transforms.push(`rotateY(${transform.rotateY}deg)`)
    }
  }

  // Scale
  if (transform.scaleX !== 1 || transform.scaleY !== 1) {
    if (transform.scaleX === transform.scaleY) {
      transforms.push(`scale(${transform.scaleX})`)
    } else {
      transforms.push(`scale(${transform.scaleX}, ${transform.scaleY})`)
    }
  }

  // Skew
  if (transform.skewX !== 0 || transform.skewY !== 0) {
    if (transform.skewX !== 0 && transform.skewY !== 0) {
      transforms.push(`skew(${transform.skewX}deg, ${transform.skewY}deg)`)
    } else if (transform.skewX !== 0) {
      transforms.push(`skewX(${transform.skewX}deg)`)
    } else {
      transforms.push(`skewY(${transform.skewY}deg)`)
    }
  }

  // Apply transform if we have any
  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
  }

  // Transform origin
  if (transform.origin !== 'center') {
    style.transformOrigin = transformOriginToCSS(transform.origin)
  }

  // Add transform-style for 3D
  if (transform.enable3D) {
    style.transformStyle = 'preserve-3d'
  }

  return Object.keys(style).length > 0 ? style : undefined
}

// =============================================================================
// Responsive Field Types
// =============================================================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Responsive value that can have different values at different breakpoints.
 * Uses mobile-first approach: xs is the required base, larger breakpoints inherit upward.
 * sm/md/lg/xl are optional overrides that apply at their breakpoint and above.
 */
export interface ResponsiveValue<T> {
  xs: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

/**
 * Breakpoint configuration with labels and pixel values
 */
export const BREAKPOINTS: Array<{
  key: Breakpoint
  label: string
  minWidth: number | null
}> = [
  { key: 'xs', label: 'XS', minWidth: null },
  { key: 'sm', label: 'SM', minWidth: 640 },
  { key: 'md', label: 'MD', minWidth: 768 },
  { key: 'lg', label: 'LG', minWidth: 1024 },
  { key: 'xl', label: 'XL', minWidth: 1280 },
]

// =============================================================================
// Responsive CSS Helpers
// =============================================================================

/**
 * Type guard to check if a value is a ResponsiveValue (has breakpoint structure)
 * Checks for the required xs property which indicates mobile-first responsive value
 */
export function isResponsiveValue<T>(value: unknown): value is ResponsiveValue<T> {
  if (!value || typeof value !== 'object') return false
  return 'xs' in value
}

/**
 * Converts a camelCase property name to kebab-case CSS property
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * Converts React.CSSProperties to a CSS string for use in style tags
 */
export function cssPropertiesToString(styles: React.CSSProperties): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ')
}

/**
 * Result of converting a responsive value to CSS
 */
export interface ResponsiveCSSResult {
  /** Base styles to apply as inline styles */
  baseStyles: React.CSSProperties
  /** CSS media queries to render in a <style> tag */
  mediaQueryCSS: string
}

/**
 * Converts a ResponsiveValue to CSS with media queries.
 * Works with any value type that has a CSS converter function.
 *
 * @param value - The responsive or non-responsive value
 * @param converter - Function to convert the value type to CSSProperties
 * @param uniqueId - Unique class name for targeting in media queries
 * @returns Object with baseStyles (inline) and mediaQueryCSS (for <style> tag)
 *
 * @example
 * ```tsx
 * const { baseStyles, mediaQueryCSS } = responsiveValueToCSS(
 *   dimensions,
 *   dimensionsValueToCSS,
 *   'container-abc123'
 * )
 *
 * return (
 *   <>
 *     {mediaQueryCSS && <style>{mediaQueryCSS}</style>}
 *     <div className="container-abc123" style={baseStyles}>...</div>
 *   </>
 * )
 * ```
 */
export function responsiveValueToCSS<T>(
  value: ResponsiveValue<T> | T | null | undefined,
  converter: (v: T) => React.CSSProperties | undefined,
  uniqueId: string
): ResponsiveCSSResult {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return { baseStyles: {}, mediaQueryCSS: '' }
  }

  // If not responsive (single value), return as base styles only (can use inline)
  if (!isResponsiveValue<T>(value)) {
    const styles = converter(value as T)
    return {
      baseStyles: styles || {},
      mediaQueryCSS: '',
    }
  }

  // For responsive values, we need to put ALL styles in the <style> tag
  // This is because inline styles have higher specificity than media queries,
  // so media queries can't override inline styles. By putting everything
  // in the style tag, CSS cascade works properly.
  const cssRules: string[] = []

  BREAKPOINTS.forEach((bp) => {
    const bpValue = value[bp.key]
    if (bpValue === undefined) return

    const cssProps = converter(bpValue)
    if (!cssProps) return

    const styleString = cssPropertiesToString(cssProps)
    if (!styleString) return

    if (bp.key === 'xs') {
      // Base styles go without media query
      cssRules.push(`.${uniqueId} { ${styleString} }`)
    } else {
      // Breakpoint overrides go in media queries
      cssRules.push(
        `@media (min-width: ${bp.minWidth}px) { .${uniqueId} { ${styleString} } }`
      )
    }
  })

  // Return empty baseStyles - everything goes through the style tag
  return { baseStyles: {}, mediaQueryCSS: cssRules.join('\n') }
}

/**
 * Visibility value for show/hide per breakpoint
 */
export interface VisibilityValue {
  /** XS (extra small) visibility - true = visible, false = hidden (default: true) */
  xs: boolean
  /** Small screens (640px+) */
  sm?: boolean
  /** Override for medium screens (768px+) */
  md?: boolean
  /** Override for large screens (1024px+) */
  lg?: boolean
  /** Override for extra large screens (1280px+) */
  xl?: boolean
}

/**
 * Default visibility value (visible at all breakpoints)
 */
export const DEFAULT_VISIBILITY: VisibilityValue = {
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
}

/**
 * Converts a VisibilityValue to CSS with display: none media queries.
 * Each breakpoint is independent - generates targeted media queries for hidden breakpoints.
 *
 * @param visibility - The visibility settings per breakpoint
 * @param uniqueId - Unique class name for targeting in media queries
 * @returns CSS media queries string for hiding at specific breakpoints
 */
export function visibilityValueToCSS(
  visibility: VisibilityValue | null | undefined,
  uniqueId: string
): string {
  if (!visibility) return ''

  const mediaQueries: string[] = []

  // Breakpoint min-widths for range calculations
  const breakpointWidths: Record<Breakpoint, number | null> = {
    xs: null, // 0px
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  }

  // Get next breakpoint's min-width for max-width calculation
  const getNextBreakpointWidth = (bp: Breakpoint): number | null => {
    const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']
    const index = order.indexOf(bp)
    if (index === -1 || index === order.length - 1) return null
    return breakpointWidths[order[index + 1]]
  }

  // XS (0 to 639px)
  if (visibility.xs === false) {
    const nextWidth = getNextBreakpointWidth('xs')
    if (nextWidth) {
      mediaQueries.push(`@media (max-width: ${nextWidth - 1}px) { .${uniqueId} { display: none; } }`)
    } else {
      mediaQueries.push(`.${uniqueId} { display: none; }`)
    }
  }

  // Other breakpoints (sm, md, lg, xl)
  BREAKPOINTS.slice(1).forEach((bp) => {
    if (visibility[bp.key] === false) {
      const minWidth = breakpointWidths[bp.key]
      const maxWidth = getNextBreakpointWidth(bp.key)

      if (minWidth && maxWidth) {
        // Range query (e.g., sm: 640-767px)
        mediaQueries.push(
          `@media (min-width: ${minWidth}px) and (max-width: ${maxWidth - 1}px) { .${uniqueId} { display: none; } }`
        )
      } else if (minWidth) {
        // Last breakpoint (xl: 1280px+)
        mediaQueries.push(
          `@media (min-width: ${minWidth}px) { .${uniqueId} { display: none; } }`
        )
      }
    }
  })

  return mediaQueries.join('\n')
}

// =============================================================================
// Animation Types
// =============================================================================

/** Standard CSS easing functions */
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

/** Advanced easing with spring/bounce effects via cubic-bezier approximations */
export type AdvancedEasingFunction =
  | EasingFunction
  | 'spring'
  | 'spring-gentle'
  | 'bounce'
  | 'bounce-in'
  | 'bounce-out'
  | 'back-in'
  | 'back-out'
  | 'back-in-out'
  | 'elastic'

/** Map advanced easing to CSS cubic-bezier values */
export const EASING_CSS_MAP: Record<AdvancedEasingFunction, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'spring-gentle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'bounce-in': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'back-in': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'back-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'back-in-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
}

/** Transform origin for animations (3x3 grid) */
export type AnimationOrigin =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

/** Stagger direction for child animations */
export type StaggerDirection = 'forward' | 'reverse' | 'center' | 'edges'

/** Configuration for staggered child animations */
export interface StaggerConfig {
  enabled: boolean
  /** Delay between each child element (ms) */
  delay: number
  /** Maximum total delay to prevent very long animations */
  maxDelay?: number
  /** Direction of stagger effect */
  direction: StaggerDirection
}

/** Animation categories for UI organization */
export type AnimationCategory =
  | 'fade'
  | 'scale'
  | 'slide'
  | 'blur'
  | 'rotate'
  | 'bounce'
  | 'flip'
  | 'zoom'

/**
 * Extended entrance animation presets (27 total)
 * Organized by category for the UI dropdown
 */
export type EntranceAnimation =
  // None
  | 'none'
  // Fade (6)
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-scale'
  // Scale (4)
  | 'scale-in'
  | 'scale-up'
  | 'scale-down'
  | 'scale-out'
  // Slide (4)
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  // Blur (3)
  | 'blur-in'
  | 'blur-up'
  | 'blur-down'
  // Rotate (3)
  | 'rotate-in'
  | 'rotate-up'
  | 'rotate-down'
  // Bounce (3)
  | 'bounce-in'
  | 'bounce-up'
  | 'bounce-down'
  // Flip (2)
  | 'flip-x'
  | 'flip-y'
  // Zoom (2)
  | 'zoom-in'
  | 'zoom-out'

/**
 * Animation presets organized by category for UI
 */
export const ANIMATION_CATEGORIES: Array<{
  category: AnimationCategory | 'none'
  label: string
  animations: EntranceAnimation[]
}> = [
  { category: 'none', label: 'None', animations: ['none'] },
  { category: 'fade', label: 'Fade', animations: ['fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'fade-scale'] },
  { category: 'scale', label: 'Scale', animations: ['scale-in', 'scale-up', 'scale-down', 'scale-out'] },
  { category: 'slide', label: 'Slide', animations: ['slide-up', 'slide-down', 'slide-left', 'slide-right'] },
  { category: 'blur', label: 'Blur', animations: ['blur-in', 'blur-up', 'blur-down'] },
  { category: 'rotate', label: 'Rotate', animations: ['rotate-in', 'rotate-up', 'rotate-down'] },
  { category: 'bounce', label: 'Bounce', animations: ['bounce-in', 'bounce-up', 'bounce-down'] },
  { category: 'flip', label: 'Flip', animations: ['flip-x', 'flip-y'] },
  { category: 'zoom', label: 'Zoom', animations: ['zoom-in', 'zoom-out'] },
]

export interface AnimationValue {
  mode: 'preset' | 'custom'

  // Preset mode
  entrance?: EntranceAnimation
  entranceDuration?: number // ms
  entranceDelay?: number // ms

  // Intensity controls (context-aware based on animation type)
  /** Distance for translate animations (8-200px) */
  distance?: number
  /** Starting scale for scale animations (0.1-2) */
  scaleFrom?: number
  /** Rotation angle for rotate animations (-180 to 180deg) */
  rotateAngle?: number
  /** Blur amount for blur animations (0-50px) */
  blurAmount?: number

  // Transform origin (affects scale/rotate)
  origin?: AnimationOrigin

  // Advanced easing
  easing?: AdvancedEasingFunction

  // Stagger for child elements
  stagger?: StaggerConfig

  // Custom transition mode
  duration?: number // 0-2000ms
  delay?: number // 0-2000ms

  // Scroll trigger
  triggerOnScroll?: boolean
  triggerThreshold?: number // 0-1
  triggerOnce?: boolean
  /** Margin around viewport for earlier/later triggering (e.g., "0px 0px -100px 0px") */
  triggerMargin?: string
}

// =============================================================================
// Animation CSS Utilities
// =============================================================================

/**
 * Convert AnimationOrigin to CSS transform-origin value
 */
function animationOriginToCSS(origin: AnimationOrigin | undefined): string {
  if (!origin) return 'center'
  const originMap: Record<AnimationOrigin, string> = {
    center: 'center',
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
  }
  return originMap[origin] || 'center'
}

/**
 * Convert AnimationValue to CSS transition property (for custom mode)
 * Returns undefined for preset mode - use getEntranceAnimationStyles instead
 */
export function animationValueToCSS(anim: AnimationValue | null): React.CSSProperties | undefined {
  if (!anim || anim.mode !== 'custom') return undefined

  const duration = anim.duration ?? 300
  const delay = anim.delay ?? 0
  const easing = anim.easing ?? 'ease'
  const easingCSS = EASING_CSS_MAP[easing] || 'ease'

  return {
    transition: `all ${duration}ms ${easingCSS} ${delay}ms`,
    transitionProperty: 'opacity, transform, filter, background-color, color, border-color, box-shadow',
  }
}

/**
 * Get initial and animate styles for entrance animations
 * Returns inline CSS style objects that work without Tailwind compilation
 * Supports all 27 animation presets with customizable intensity
 */
export function getEntranceAnimationStyles(anim: AnimationValue | null): {
  initial: React.CSSProperties
  animate: React.CSSProperties
  duration: number
  delay: number
  easing: string
  origin: string
} {
  const defaultResult = {
    initial: {} as React.CSSProperties,
    animate: {} as React.CSSProperties,
    duration: 500,
    delay: 0,
    easing: 'ease',
    origin: 'center',
  }

  if (!anim || anim.mode !== 'preset' || anim.entrance === 'none') {
    return defaultResult
  }

  const duration = anim.entranceDuration ?? 500
  const delay = anim.entranceDelay ?? 0
  const easing = EASING_CSS_MAP[anim.easing ?? 'ease'] || 'ease'
  const origin = animationOriginToCSS(anim.origin)

  // Intensity values with defaults
  const distance = anim.distance ?? 24 // px
  const scaleFrom = anim.scaleFrom ?? 0.9
  const rotateAngle = anim.rotateAngle ?? 15 // degrees
  const blurAmount = anim.blurAmount ?? 8 // px

  // Build animation styles based on preset
  const entrance = anim.entrance ?? 'none'

  let initial: React.CSSProperties = {}
  let animate: React.CSSProperties = {}

  switch (entrance) {
    // ==================== FADE (6) ====================
    case 'fade-in':
      initial = { opacity: 0 }
      animate = { opacity: 1 }
      break

    case 'fade-up':
      initial = { opacity: 0, transform: `translateY(${distance}px)` }
      animate = { opacity: 1, transform: 'translateY(0)' }
      break

    case 'fade-down':
      initial = { opacity: 0, transform: `translateY(-${distance}px)` }
      animate = { opacity: 1, transform: 'translateY(0)' }
      break

    case 'fade-left':
      initial = { opacity: 0, transform: `translateX(${distance}px)` }
      animate = { opacity: 1, transform: 'translateX(0)' }
      break

    case 'fade-right':
      initial = { opacity: 0, transform: `translateX(-${distance}px)` }
      animate = { opacity: 1, transform: 'translateX(0)' }
      break

    case 'fade-scale':
      initial = { opacity: 0, transform: `scale(${scaleFrom})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    // ==================== SCALE (4) ====================
    case 'scale-in':
      initial = { opacity: 0, transform: `scale(${scaleFrom})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    case 'scale-up':
      initial = { opacity: 0, transform: `scale(${scaleFrom}) translateY(${distance}px)` }
      animate = { opacity: 1, transform: 'scale(1) translateY(0)' }
      break

    case 'scale-down':
      initial = { opacity: 0, transform: `scale(${scaleFrom}) translateY(-${distance}px)` }
      animate = { opacity: 1, transform: 'scale(1) translateY(0)' }
      break

    case 'scale-out':
      // Scales from larger to normal
      initial = { opacity: 0, transform: `scale(${2 - scaleFrom})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    // ==================== SLIDE (4) ====================
    case 'slide-up':
      initial = { transform: `translateY(${distance}px)` }
      animate = { transform: 'translateY(0)' }
      break

    case 'slide-down':
      initial = { transform: `translateY(-${distance}px)` }
      animate = { transform: 'translateY(0)' }
      break

    case 'slide-left':
      initial = { transform: `translateX(${distance}px)` }
      animate = { transform: 'translateX(0)' }
      break

    case 'slide-right':
      initial = { transform: `translateX(-${distance}px)` }
      animate = { transform: 'translateX(0)' }
      break

    // ==================== BLUR (3) ====================
    case 'blur-in':
      initial = { opacity: 0, filter: `blur(${blurAmount}px)` }
      animate = { opacity: 1, filter: 'blur(0)' }
      break

    case 'blur-up':
      initial = { opacity: 0, filter: `blur(${blurAmount}px)`, transform: `translateY(${distance}px)` }
      animate = { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }
      break

    case 'blur-down':
      initial = { opacity: 0, filter: `blur(${blurAmount}px)`, transform: `translateY(-${distance}px)` }
      animate = { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }
      break

    // ==================== ROTATE (3) ====================
    case 'rotate-in':
      initial = { opacity: 0, transform: `rotate(${rotateAngle}deg) scale(${scaleFrom})` }
      animate = { opacity: 1, transform: 'rotate(0) scale(1)' }
      break

    case 'rotate-up':
      initial = { opacity: 0, transform: `rotate(${rotateAngle}deg) translateY(${distance}px)` }
      animate = { opacity: 1, transform: 'rotate(0) translateY(0)' }
      break

    case 'rotate-down':
      initial = { opacity: 0, transform: `rotate(-${rotateAngle}deg) translateY(-${distance}px)` }
      animate = { opacity: 1, transform: 'rotate(0) translateY(0)' }
      break

    // ==================== BOUNCE (3) ====================
    // These use spring/bounce easing by default for the effect
    case 'bounce-in':
      initial = { opacity: 0, transform: `scale(${scaleFrom * 0.8})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    case 'bounce-up':
      initial = { opacity: 0, transform: `translateY(${distance * 1.5}px)` }
      animate = { opacity: 1, transform: 'translateY(0)' }
      break

    case 'bounce-down':
      initial = { opacity: 0, transform: `translateY(-${distance * 1.5}px)` }
      animate = { opacity: 1, transform: 'translateY(0)' }
      break

    // ==================== FLIP (2) ====================
    // Flip uses perspective in transform for proper 3D effect
    // Starts from -90deg (tilted back) so the flip motion is visible
    case 'flip-x':
      initial = {
        transform: 'perspective(1000px) rotateX(-90deg)',
        opacity: 0.2,
        backfaceVisibility: 'hidden',
      }
      animate = {
        transform: 'perspective(1000px) rotateX(0deg)',
        opacity: 1,
        backfaceVisibility: 'hidden',
      }
      break

    case 'flip-y':
      initial = {
        transform: 'perspective(1000px) rotateY(-90deg)',
        opacity: 0.2,
        backfaceVisibility: 'hidden',
      }
      animate = {
        transform: 'perspective(1000px) rotateY(0deg)',
        opacity: 1,
        backfaceVisibility: 'hidden',
      }
      break

    // ==================== ZOOM (2) ====================
    case 'zoom-in':
      // Starts small, zooms to full size
      initial = { opacity: 0, transform: `scale(${scaleFrom * 0.5})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    case 'zoom-out':
      // Starts large, zooms down to full size
      initial = { opacity: 0, transform: `scale(${2.5 - scaleFrom})` }
      animate = { opacity: 1, transform: 'scale(1)' }
      break

    default:
      break
  }

  return {
    initial,
    animate,
    duration,
    delay,
    easing,
    origin,
  }
}

/**
 * Get default easing for animation category
 * Bounce animations default to bounce easing, etc.
 */
export function getDefaultEasingForAnimation(entrance: EntranceAnimation): AdvancedEasingFunction {
  if (entrance.startsWith('bounce-')) return 'bounce'
  if (entrance.startsWith('flip-')) return 'back-out'
  if (entrance.startsWith('zoom-')) return 'ease-out'
  return 'ease'
}

/**
 * Get CSS custom properties for animation timing
 * Useful for CSS-only animations with custom properties
 */
export function getAnimationCSSVariables(anim: AnimationValue | null): Record<string, string> {
  if (!anim) return {}

  const isPreset = anim.mode === 'preset'
  const duration = isPreset ? (anim.entranceDuration ?? 500) : (anim.duration ?? 300)
  const delay = isPreset ? (anim.entranceDelay ?? 0) : (anim.delay ?? 0)
  const easing = anim.easing ?? 'ease'
  const easingCSS = EASING_CSS_MAP[easing] || 'ease'

  return {
    '--animation-duration': `${duration}ms`,
    '--animation-delay': `${delay}ms`,
    '--animation-easing': easingCSS,
  }
}

/**
 * Generate stagger delay for a specific child index
 * Accounts for direction (forward, reverse, center, edges)
 */
export function getStaggerDelay(config: StaggerConfig, index: number, totalChildren: number): number {
  if (!config.enabled || totalChildren <= 1) return 0

  let effectiveIndex: number

  switch (config.direction) {
    case 'forward':
      effectiveIndex = index
      break
    case 'reverse':
      effectiveIndex = totalChildren - 1 - index
      break
    case 'center': {
      // Center starts from middle, animates outward
      const center = (totalChildren - 1) / 2
      effectiveIndex = Math.abs(index - center)
      break
    }
    case 'edges': {
      // Edges starts from outside, animates inward
      const center = (totalChildren - 1) / 2
      effectiveIndex = center - Math.abs(index - center)
      break
    }
    default:
      effectiveIndex = index
  }

  const delay = effectiveIndex * config.delay

  // Cap at max delay if specified
  if (config.maxDelay && delay > config.maxDelay) {
    return config.maxDelay
  }

  return delay
}

/**
 * Generate CSS styles for staggered children
 * Returns an object with CSS custom properties for each child
 */
export function generateStaggerStyles(
  config: StaggerConfig | undefined,
  totalChildren: number
): React.CSSProperties[] {
  if (!config?.enabled || totalChildren <= 1) {
    return Array(totalChildren).fill({})
  }

  return Array.from({ length: totalChildren }, (_, i) => {
    const delay = getStaggerDelay(config, i, totalChildren)
    return {
      '--stagger-delay': `${delay}ms`,
      transitionDelay: `${delay}ms`,
    } as React.CSSProperties
  })
}

/**
 * Check which intensity controls are relevant for an animation type
 */
export function getRelevantIntensityControls(entrance: EntranceAnimation): {
  showDistance: boolean
  showScale: boolean
  showRotate: boolean
  showBlur: boolean
} {
  const hasTranslate = [
    'fade-up', 'fade-down', 'fade-left', 'fade-right',
    'scale-up', 'scale-down',
    'slide-up', 'slide-down', 'slide-left', 'slide-right',
    'blur-up', 'blur-down',
    'rotate-up', 'rotate-down',
    'bounce-up', 'bounce-down',
  ].includes(entrance)

  const hasScale = [
    'fade-scale',
    'scale-in', 'scale-up', 'scale-down', 'scale-out',
    'rotate-in',
    'bounce-in',
    'zoom-in', 'zoom-out',
  ].includes(entrance)

  const hasRotate = [
    'rotate-in', 'rotate-up', 'rotate-down',
  ].includes(entrance)

  const hasBlur = [
    'blur-in', 'blur-up', 'blur-down',
  ].includes(entrance)

  return {
    showDistance: hasTranslate,
    showScale: hasScale,
    showRotate: hasRotate,
    showBlur: hasBlur,
  }
}

/**
 * Default animation value
 */
export const DEFAULT_ANIMATION: AnimationValue = {
  mode: 'preset',
  entrance: 'none',
  entranceDuration: 500,
  entranceDelay: 0,
  distance: 24,
  scaleFrom: 0.9,
  rotateAngle: 15,
  blurAmount: 8,
  origin: 'center',
  easing: 'ease',
  triggerOnScroll: true,
  triggerThreshold: 0.1,
  triggerOnce: true,
}

// =============================================================================
// Layout Components Disallow List (prevent recursion in slots)
// =============================================================================

export const layoutComponentsDisallow = [
  'Container',
  'Flex',
  'Grid',
  'Section',
]

// =============================================================================
// Size Field Types and Utilities (Server-safe)
// =============================================================================

export type SizeMode = 'sm' | 'default' | 'lg' | 'custom'
export type SizeUnit = 'px' | 'rem'

export interface SizeValue {
  mode: SizeMode
  /** Height in units (only used when mode === 'custom') */
  height?: number
  /** Horizontal padding in units (only used when mode === 'custom') */
  paddingX?: number
  /** Vertical padding in units (only used when mode === 'custom') */
  paddingY?: number
  /** Font size in units (only used when mode === 'custom') */
  fontSize?: number
  /** Unit for all values */
  unit?: SizeUnit
}

/**
 * Convert SizeValue to CSS properties (only for custom mode)
 * Server-safe utility for Button and other components
 */
export function sizeValueToCSS(size: SizeValue | null | undefined): React.CSSProperties | undefined {
  if (!size || size.mode !== 'custom') return undefined

  const unit = size.unit || 'px'
  const style: React.CSSProperties = {}

  if (size.height != null) {
    style.height = `${size.height}${unit}`
  }

  if (size.paddingX != null || size.paddingY != null) {
    const py = size.paddingY ?? 0
    const px = size.paddingX ?? 0
    style.padding = `${py}${unit} ${px}${unit}`
  }

  if (size.fontSize != null) {
    style.fontSize = `${size.fontSize}${unit}`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

/**
 * Get Tailwind size classes for preset modes
 * Returns empty string for custom mode (CSS properties handle that)
 * Server-safe utility for Button and other components
 */
export function getSizeClasses(size: SizeValue | null | undefined, sizeMap: Record<string, string>): string {
  if (!size) return sizeMap.default || ''
  if (size.mode === 'custom') return ''
  return sizeMap[size.mode] || sizeMap.default || ''
}

