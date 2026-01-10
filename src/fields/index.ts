/**
 * Custom Puck fields for the visual editor
 *
 * These fields provide enhanced editing experiences for specific content types.
 */

// Shared field definitions
export * from './shared'

// Custom field components
export { MediaField, createMediaField } from './MediaField'
export type { MediaReference } from './MediaField'

export { ColorPickerField, createColorPickerField, colorToRgba } from './ColorPickerField'

export { TiptapField, createTiptapField } from './TiptapField'

export { TiptapModal } from './TiptapModal'
export { TiptapModalField, createTiptapModalField } from './TiptapModalField'

export { PaddingField, createPaddingField } from './PaddingField'

export { MarginField, createMarginField } from './MarginField'
export type { MarginValue } from './MarginField'

export { BorderField, createBorderField } from './BorderField'

export { WidthField, createWidthField } from './WidthField'

export { DimensionsField, createDimensionsField } from './DimensionsField'
export {
  dimensionsValueToCSS,
  getDimensionsSummary,
  isLegacyWidthValue,
  migrateWidthValue,
} from './shared'
export type {
  DimensionsValue,
  DimensionConstraint,
  DimensionsUnit,
  DimensionsMode,
  ContentAlignment,
} from './shared'

export {
  LockedTextField,
  LockedRadioField,
  createLockedTextField,
  createLockedRadioField,
  lockedSlugField,
  lockedHomepageField,
} from './LockedField'

export { AlignmentField, createAlignmentField } from './AlignmentField'
export type { Alignment } from './AlignmentField'

export {
  JustifyContentField,
  AlignItemsField,
  createJustifyContentField,
  createAlignItemsField,
} from './FlexAlignmentField'
export type { JustifyContent, AlignItems } from './FlexAlignmentField'

export { VerticalAlignmentField, createVerticalAlignmentField } from './VerticalAlignmentField'
export type { VerticalAlignment } from './VerticalAlignmentField'

export { SizeField, createSizeField, sizeValueToCSS, getSizeClasses } from './SizeField'
export type { SizeValue, SizeMode, SizeUnit } from './SizeField'

export { GradientEditor } from './GradientEditor'

export { BackgroundField, createBackgroundField } from './BackgroundField'
export type {
  BackgroundValue,
  BackgroundImageValue,
  BackgroundOverlay,
  GradientValue,
  GradientStop,
  GradientMask,
} from './shared'
export { backgroundValueToCSS, gradientValueToCSS, getBackgroundImageOpacity } from './shared'

export { ResponsiveField, createResponsiveField } from './ResponsiveField'
export type { Breakpoint, ResponsiveValue, VisibilityValue, ResponsiveCSSResult } from './shared'
export {
  BREAKPOINTS,
  isResponsiveValue,
  responsiveValueToCSS,
  cssPropertiesToString,
  visibilityValueToCSS,
  DEFAULT_VISIBILITY,
} from './shared'

export {
  ResponsiveVisibilityField,
  createResponsiveVisibilityField,
} from './ResponsiveVisibilityField'

export { AnimationField, createAnimationField } from './AnimationField'
export type {
  AnimationValue,
  EasingFunction,
  AdvancedEasingFunction,
  EntranceAnimation,
  AnimationOrigin,
  AnimationCategory,
  StaggerConfig,
  StaggerDirection,
} from './shared'
export {
  animationValueToCSS,
  getEntranceAnimationStyles,
  getAnimationCSSVariables,
  getDefaultEasingForAnimation,
  getRelevantIntensityControls,
  getStaggerDelay,
  generateStaggerStyles,
  EASING_CSS_MAP,
  ANIMATION_CATEGORIES,
  DEFAULT_ANIMATION,
} from './shared'

export { TransformField, createTransformField } from './TransformField'
export type { TransformValue, TransformOrigin } from './shared'
export { transformValueToCSS, DEFAULT_TRANSFORM } from './shared'

// =============================================================================
// CSS Utilities for Consumers
// =============================================================================

/**
 * CSS styles for rendering rich text content on the frontend.
 * Include this in your app's global styles or inject via <style> tag.
 *
 * Usage in Next.js app/layout.tsx:
 * ```tsx
 * import { RICHTEXT_OUTPUT_CSS } from '@delmaredigital/payload-puck/fields'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <style dangerouslySetInnerHTML={{ __html: RICHTEXT_OUTPUT_CSS }} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 */
export const RICHTEXT_OUTPUT_CSS = `
.richtext-output { font-size: 1.125rem; line-height: 1.75; color: inherit; }
.richtext-output h1 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; font-size: 2.25rem; line-height: 1.2; }
.richtext-output h2 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; font-size: 1.875rem; line-height: 1.25; }
.richtext-output h3 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; font-size: 1.5rem; line-height: 1.3; }
.richtext-output h4 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; line-height: 1.35; }
.richtext-output h5, .richtext-output h6 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
.richtext-output h1:first-child, .richtext-output h2:first-child, .richtext-output h3:first-child,
.richtext-output h4:first-child, .richtext-output h5:first-child, .richtext-output h6:first-child { margin-top: 0; }
.richtext-output p { margin-bottom: 1.25rem; }
.richtext-output p:last-child { margin-bottom: 0; }
.richtext-output ul { margin-bottom: 1.25rem; padding-left: 2rem; list-style-type: disc !important; }
.richtext-output ol { margin-bottom: 1.25rem; padding-left: 2rem; list-style-type: decimal !important; }
.richtext-output li { margin-bottom: 0.5rem; }
.richtext-output li::marker { color: currentColor; }
.richtext-output ul ul, .richtext-output ol ul { list-style-type: circle !important; margin-top: 0.5rem; margin-bottom: 0; }
.richtext-output ol ol, .richtext-output ul ol { list-style-type: lower-alpha !important; margin-top: 0.5rem; margin-bottom: 0; }
.richtext-output blockquote { margin: 1.5rem 0; padding-left: 1.5rem; border-left: 4px solid #e5e7eb; font-style: italic; }
.richtext-output a { color: #2563eb; text-decoration: underline; }
.richtext-output a:hover { opacity: 0.8; }
.richtext-output code { background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; }
.richtext-output mark { background-color: #fef08a; padding: 0.125rem 0.25rem; border-radius: 0.125rem; }
.richtext-output s, .richtext-output strike { text-decoration: line-through; }
.richtext-output sup { vertical-align: super; font-size: 0.75em; }
.richtext-output sub { vertical-align: sub; font-size: 0.75em; }
.richtext-output hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
@media (max-width: 768px) {
  .richtext-output { font-size: 1rem; }
  .richtext-output h1 { font-size: 1.875rem; }
  .richtext-output h2 { font-size: 1.5rem; }
  .richtext-output h3 { font-size: 1.25rem; }
}
`

/**
 * Injects rich text output styles into the document head.
 * Call this on the client-side to ensure styles are loaded.
 *
 * Usage:
 * ```tsx
 * 'use client'
 * import { injectRichtextStyles } from '@delmaredigital/payload-puck/fields'
 * import { useEffect } from 'react'
 *
 * export function RichtextStyleProvider() {
 *   useEffect(() => { injectRichtextStyles() }, [])
 *   return null
 * }
 * ```
 */
export function injectRichtextStyles() {
  if (typeof document === 'undefined') return
  const styleId = 'richtext-output-injected-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = RICHTEXT_OUTPUT_CSS
    document.head.appendChild(style)
  }
}

// =============================================================================
// Page-Tree Integration Fields
// =============================================================================

export { FolderPickerField, createFolderPickerField } from './FolderPickerField'
export { PageSegmentField, createPageSegmentField } from './PageSegmentField'
export { SlugPreviewField, createSlugPreviewField } from './SlugPreviewField'
