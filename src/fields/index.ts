/**
 * Custom Puck fields for the visual editor
 *
 * These fields provide enhanced editing experiences for specific content types.
 */

// Shared field definitions
export * from './shared.js'

// Custom field components
export { MediaField, createMediaField } from './MediaField.js'
export type { MediaReference } from './MediaField.js'

export { ColorPickerField, createColorPickerField, colorToRgba } from './ColorPickerField.js'

// =============================================================================
// RichText Field
// Uses Puck's native richtext with custom TipTap extensions for colors, sizes, etc.
// =============================================================================
export {
  createRichTextField,
  fullRichTextField,
  minimalRichTextField,
  sidebarRichTextField,
  type CreateRichTextFieldOptions,
  // Extensions for advanced customization
  FontSize,
  // Controls for custom menu building
  ColorPickerControl,
  ColorPickerPanel,
  FontSizeControl,
  HighlightControl,
  // Utilities
  normalizeHex,
  hexToRgba,
  parseColor,
  FONT_SIZES,
  FONT_SIZE_UNITS,
  controlStyles,
  type FontSizeUnit,
} from './richtext/index.js'

export { PaddingField, createPaddingField } from './PaddingField.js'

export { MarginField, createMarginField } from './MarginField.js'
export type { MarginValue } from './MarginField.js'

export { BorderField, createBorderField } from './BorderField.js'

export { WidthField, createWidthField } from './WidthField.js'

export { DimensionsField, createDimensionsField } from './DimensionsField.js'
export {
  dimensionsValueToCSS,
  getDimensionsSummary,
  isLegacyWidthValue,
  migrateWidthValue,
} from './shared.js'
export type {
  DimensionsValue,
  DimensionConstraint,
  DimensionsUnit,
  DimensionsMode,
  ContentAlignment,
} from './shared.js'

export {
  LockedTextField,
  LockedRadioField,
  createLockedTextField,
  createLockedRadioField,
  lockedSlugField,
  lockedHomepageField,
} from './LockedField.js'

export { AlignmentField, createAlignmentField } from './AlignmentField.js'
export type { Alignment } from './AlignmentField.js'

export {
  JustifyContentField,
  AlignItemsField,
  createJustifyContentField,
  createAlignItemsField,
} from './FlexAlignmentField.js'
export type { JustifyContent, AlignItems } from './FlexAlignmentField.js'

export { VerticalAlignmentField, createVerticalAlignmentField } from './VerticalAlignmentField.js'
export type { VerticalAlignment } from './VerticalAlignmentField.js'

export {
  ContentAlignmentField,
  createContentAlignmentField,
  alignmentToFlexCSS,
  alignmentToGridCSS,
  alignmentToPlaceSelfCSS,
  alignmentToTailwind,
} from './ContentAlignmentField.js'
export type {
  ContentAlignmentValue,
  HorizontalAlign,
  VerticalAlign,
  PositionLabel,
} from './ContentAlignmentField.js'

export { SizeField, createSizeField, sizeValueToCSS, getSizeClasses } from './SizeField.js'
export type { SizeValue, SizeMode, SizeUnit } from './SizeField.js'

export { GradientEditor } from './GradientEditor.js'

export { BackgroundField, createBackgroundField } from './BackgroundField.js'
export type {
  BackgroundValue,
  BackgroundImageValue,
  BackgroundOverlay,
  GradientValue,
  GradientStop,
  GradientMask,
} from './shared.js'
export { backgroundValueToCSS, gradientValueToCSS, getBackgroundImageOpacity } from './shared.js'

export { ResponsiveField, createResponsiveField } from './ResponsiveField.js'
export type { Breakpoint, ResponsiveValue, VisibilityValue, ResponsiveCSSResult } from './shared.js'
export {
  BREAKPOINTS,
  isResponsiveValue,
  responsiveValueToCSS,
  cssPropertiesToString,
  visibilityValueToCSS,
  DEFAULT_VISIBILITY,
} from './shared.js'

export {
  ResponsiveVisibilityField,
  createResponsiveVisibilityField,
} from './ResponsiveVisibilityField.js'

export { AnimationField, createAnimationField } from './AnimationField.js'
export type {
  AnimationValue,
  EasingFunction,
  AdvancedEasingFunction,
  EntranceAnimation,
  AnimationOrigin,
  AnimationCategory,
  StaggerConfig,
  StaggerDirection,
} from './shared.js'
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
} from './shared.js'

export { TransformField, createTransformField } from './TransformField.js'
export type { TransformValue, TransformOrigin } from './shared.js'
export { transformValueToCSS, DEFAULT_TRANSFORM } from './shared.js'

// =============================================================================
// Legacy CSS Utilities (Deprecated)
// =============================================================================

/**
 * @deprecated No longer needed. RichText component now uses Tailwind Typography's
 * `prose` class for styling. Install @tailwindcss/typography instead.
 */
export const RICHTEXT_OUTPUT_CSS = ''

/**
 * @deprecated No longer needed. RichText component now uses Tailwind Typography's
 * `prose` class for styling. Install @tailwindcss/typography instead.
 */
export function injectRichtextStyles() {
  console.warn(
    'injectRichtextStyles() is deprecated. RichText now uses Tailwind Typography. ' +
      'Install @tailwindcss/typography and use the `prose` class instead.'
  )
}

// =============================================================================
// Page-Tree Integration Fields
// =============================================================================

export { FolderPickerField, createFolderPickerField } from './FolderPickerField.js'
export {
  PageSegmentField,
  createPageSegmentField,
  LockedPageSegmentField,
  createLockedPageSegmentField,
} from './PageSegmentField.js'
export { SlugPreviewField, createSlugPreviewField } from './SlugPreviewField.js'
