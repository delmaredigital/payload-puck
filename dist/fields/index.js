/**
 * Custom Puck fields for the visual editor
 *
 * These fields provide enhanced editing experiences for specific content types.
 */
// Shared field definitions
export * from './shared';
// Custom field components
export { MediaField, createMediaField } from './MediaField';
export { ColorPickerField, createColorPickerField, colorToRgba } from './ColorPickerField';
// =============================================================================
// RichText Field
// Uses Puck's native richtext with custom TipTap extensions for colors, sizes, etc.
// =============================================================================
export { createRichTextField, fullRichTextField, minimalRichTextField, sidebarRichTextField, 
// Extensions for advanced customization
FontSize, 
// Controls for custom menu building
ColorPickerControl, ColorPickerPanel, FontSizeControl, HighlightControl, 
// Utilities
normalizeHex, hexToRgba, parseColor, FONT_SIZES, FONT_SIZE_UNITS, controlStyles, } from './richtext';
export { PaddingField, createPaddingField } from './PaddingField';
export { MarginField, createMarginField } from './MarginField';
export { BorderField, createBorderField } from './BorderField';
export { WidthField, createWidthField } from './WidthField';
export { DimensionsField, createDimensionsField } from './DimensionsField';
export { dimensionsValueToCSS, getDimensionsSummary, isLegacyWidthValue, migrateWidthValue, } from './shared';
export { LockedTextField, LockedRadioField, createLockedTextField, createLockedRadioField, lockedSlugField, lockedHomepageField, } from './LockedField';
export { AlignmentField, createAlignmentField } from './AlignmentField';
export { JustifyContentField, AlignItemsField, createJustifyContentField, createAlignItemsField, } from './FlexAlignmentField';
export { VerticalAlignmentField, createVerticalAlignmentField } from './VerticalAlignmentField';
export { ContentAlignmentField, createContentAlignmentField, alignmentToFlexCSS, alignmentToGridCSS, alignmentToPlaceSelfCSS, alignmentToTailwind, } from './ContentAlignmentField';
export { SizeField, createSizeField, sizeValueToCSS, getSizeClasses } from './SizeField';
export { GradientEditor } from './GradientEditor';
export { BackgroundField, createBackgroundField } from './BackgroundField';
export { backgroundValueToCSS, gradientValueToCSS, getBackgroundImageOpacity } from './shared';
export { ResponsiveField, createResponsiveField } from './ResponsiveField';
export { BREAKPOINTS, isResponsiveValue, responsiveValueToCSS, cssPropertiesToString, visibilityValueToCSS, DEFAULT_VISIBILITY, } from './shared';
export { ResponsiveVisibilityField, createResponsiveVisibilityField, } from './ResponsiveVisibilityField';
export { AnimationField, createAnimationField } from './AnimationField';
export { animationValueToCSS, getEntranceAnimationStyles, getAnimationCSSVariables, getDefaultEasingForAnimation, getRelevantIntensityControls, getStaggerDelay, generateStaggerStyles, EASING_CSS_MAP, ANIMATION_CATEGORIES, DEFAULT_ANIMATION, } from './shared';
export { TransformField, createTransformField } from './TransformField';
export { transformValueToCSS, DEFAULT_TRANSFORM } from './shared';
// =============================================================================
// Legacy CSS Utilities (Deprecated)
// =============================================================================
/**
 * @deprecated No longer needed. RichText component now uses Tailwind Typography's
 * `prose` class for styling. Install @tailwindcss/typography instead.
 */
export const RICHTEXT_OUTPUT_CSS = '';
/**
 * @deprecated No longer needed. RichText component now uses Tailwind Typography's
 * `prose` class for styling. Install @tailwindcss/typography instead.
 */
export function injectRichtextStyles() {
    console.warn('injectRichtextStyles() is deprecated. RichText now uses Tailwind Typography. ' +
        'Install @tailwindcss/typography and use the `prose` class instead.');
}
// =============================================================================
// Page-Tree Integration Fields
// =============================================================================
export { FolderPickerField, createFolderPickerField } from './FolderPickerField';
export { PageSegmentField, createPageSegmentField, LockedPageSegmentField, createLockedPageSegmentField, } from './PageSegmentField';
export { SlugPreviewField, createSlugPreviewField } from './SlugPreviewField';
//# sourceMappingURL=index.js.map