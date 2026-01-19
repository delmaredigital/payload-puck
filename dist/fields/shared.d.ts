/**
 * Shared Puck Field Definitions
 *
 * Reusable field configurations and CSS utility maps for Puck components.
 * These ensure consistency across all components.
 */
import type { Field } from '@puckeditor/core';
import type React from 'react';
/**
 * Combines class names, filtering out falsy values
 * A simple alternative to clsx/classnames for bundling purposes
 */
export declare function cn(...classes: (string | boolean | undefined | null)[]): string;
export interface ColorValue {
    hex: string;
    opacity?: number;
}
export interface PaddingValue {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'px' | 'rem' | 'em' | '%';
    /** Whether all sides are linked (sync together). Defaults to true if not set. */
    linked?: boolean;
}
export interface BorderValue {
    style: 'none' | 'solid' | 'dashed' | 'dotted';
    width: number;
    color: ColorValue | null;
    radius: number;
    sides: {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    };
}
export interface WidthValue {
    mode: 'full' | 'contained' | 'custom';
    maxWidth: number;
    unit: 'px' | 'rem' | '%' | 'vw';
    alignment: 'left' | 'center' | 'right';
}
export type DimensionsUnit = 'px' | 'rem' | '%' | 'vw' | 'vh';
export type DimensionsMode = 'full' | 'contained' | 'custom';
export type ContentAlignment = 'left' | 'center' | 'right';
/**
 * Represents a single dimension constraint (min or max for width or height)
 */
export interface DimensionConstraint {
    value: number;
    unit: DimensionsUnit;
    enabled: boolean;
}
/**
 * Full dimensions configuration value - replaces/extends WidthValue
 * Supports min/max constraints for both width and height
 */
export interface DimensionsValue {
    /** Width mode: full (100%), contained (centered max-width), or custom */
    mode: DimensionsMode;
    /** Content alignment within the container */
    alignment: ContentAlignment;
    /** Minimum width constraint (optional) */
    minWidth?: DimensionConstraint | null;
    /** Maximum width constraint (required for backward compat) */
    maxWidth: DimensionConstraint;
    /** Minimum height constraint (optional) */
    minHeight?: DimensionConstraint | null;
    /** Maximum height constraint (optional) */
    maxHeight?: DimensionConstraint | null;
    /** UI state: whether advanced mode is expanded */
    advancedMode?: boolean;
}
/**
 * Type guard to detect legacy WidthValue format
 */
export declare function isLegacyWidthValue(value: unknown): value is WidthValue;
/**
 * Migrate legacy WidthValue to new DimensionsValue format
 */
export declare function migrateWidthValue(legacy: WidthValue): DimensionsValue;
export interface GradientStop {
    color: ColorValue;
    position: number;
}
export interface GradientValue {
    type: 'linear' | 'radial';
    angle: number;
    stops: GradientStop[];
    radialShape?: 'circle' | 'ellipse';
    radialPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}
/**
 * Gradient mask for fading images to transparent
 */
export interface GradientMask {
    enabled: boolean;
    direction: 'to-top' | 'to-bottom' | 'to-left' | 'to-right' | 'to-top-left' | 'to-top-right' | 'to-bottom-left' | 'to-bottom-right' | 'from-center';
    startOpacity: number;
    endOpacity: number;
    startPosition: number;
    endPosition: number;
}
export interface BackgroundImageValue {
    media: import('./MediaField').MediaReference | null;
    size: 'cover' | 'contain' | 'auto';
    position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    attachment: 'scroll' | 'fixed';
    /** Overall image opacity 0-100 (default 100) */
    opacity?: number;
    /** Gradient mask for fade to transparent effect */
    mask?: GradientMask;
}
/**
 * Overlay layer for images (Divi-style)
 * Renders a color or gradient on top of the background image
 */
export interface BackgroundOverlay {
    enabled: boolean;
    type: 'solid' | 'gradient';
    solid?: ColorValue | null;
    gradient?: GradientValue | null;
}
export interface BackgroundValue {
    type: 'none' | 'solid' | 'gradient' | 'image';
    solid?: ColorValue | null;
    gradient?: GradientValue | null;
    image?: BackgroundImageValue | null;
    /** Overlay layer, only used when type === 'image' */
    overlay?: BackgroundOverlay | null;
}
export declare const visibilityField: Field;
export declare const buttonStyleField: Field;
export declare const buttonVariantField: Field;
export declare const buttonSizeField: Field;
export declare const backgroundColorField: Field;
export declare const textColorField: Field;
export declare const gapField: Field;
export declare const shadowField: Field;
export declare const spacerHeightField: Field;
export declare const headingLevelField: Field;
export declare const textSizeField: Field;
export declare const aspectRatioField: Field;
export declare const dividerStyleField: Field;
export declare const borderRadiusField: Field;
export declare const columnsCountField: Field;
export declare const flexDirectionField: Field;
export declare const flexWrapField: Field;
/**
 * Maps alignment values to Tailwind classes
 */
export declare const alignmentMap: Record<string, string>;
/**
 * Maps background color values to Tailwind classes
 */
export declare const bgColorMap: Record<string, string>;
/**
 * Maps text color values to Tailwind classes
 */
export declare const textColorMap: Record<string, string>;
/**
 * Maps gap values to Tailwind classes
 */
export declare const gapMap: Record<string, string>;
/**
 * Maps shadow values to Tailwind classes
 */
export declare const shadowMap: Record<string, string>;
/**
 * Maps spacer height values to Tailwind classes
 */
export declare const spacerHeightMap: Record<string, string>;
/**
 * Maps heading level to Tailwind classes
 */
export declare const headingLevelMap: Record<string, string>;
/**
 * Maps text size to Tailwind classes
 */
export declare const textSizeMap: Record<string, string>;
/**
 * Maps aspect ratio to Tailwind classes
 */
export declare const aspectRatioMap: Record<string, string>;
/**
 * Maps divider style to Tailwind classes
 */
export declare const dividerStyleMap: Record<string, string>;
/**
 * Maps border radius to Tailwind classes
 */
export declare const borderRadiusMap: Record<string, string>;
/**
 * Maps columns count to Tailwind grid classes (responsive)
 */
export declare const columnsCountMap: Record<string, string>;
/**
 * Maps flex direction to Tailwind classes
 */
export declare const flexDirectionMap: Record<string, string>;
/**
 * Maps justify content to Tailwind classes
 * Supports both short (start) and full (flex-start) values
 */
export declare const justifyContentMap: Record<string, string>;
/**
 * Maps align items to Tailwind classes
 * Supports both short (start) and full (flex-start) values
 */
export declare const alignItemsMap: Record<string, string>;
/**
 * Maps self-alignment to Tailwind classes (for grid/flex item alignment)
 * Used by components like TextImageSplit for vertical self-alignment
 */
export declare const selfAlignmentMap: Record<string, string>;
/**
 * Maps flex wrap to Tailwind classes
 */
export declare const flexWrapMap: Record<string, string>;
/**
 * Convert ColorValue to CSS rgba string
 */
export declare function colorValueToCSS(color: ColorValue | null | undefined): string | undefined;
/**
 * Convert PaddingValue to CSS padding string
 */
export declare function paddingValueToCSS(padding: PaddingValue | null | undefined): string | undefined;
/**
 * Convert PaddingValue to CSS margin string (same structure, different property)
 */
export declare function marginValueToCSS(margin: PaddingValue | null | undefined): string | undefined;
/**
 * Convert BorderValue to CSS properties object
 */
export declare function borderValueToCSS(border: BorderValue | null | undefined): React.CSSProperties | undefined;
/**
 * Convert WidthValue to CSS properties object
 */
export declare function widthValueToCSS(width: WidthValue | null | undefined): React.CSSProperties | undefined;
/**
 * Convert DimensionsValue to CSS properties object
 * Handles both legacy WidthValue and new DimensionsValue formats
 */
export declare function dimensionsValueToCSS(dimensions: DimensionsValue | WidthValue | null | undefined): React.CSSProperties | undefined;
/**
 * Get human-readable summary of dimensions
 */
export declare function getDimensionsSummary(dim: DimensionsValue | null | undefined): string;
/**
 * Combined style generator for layout components
 */
export declare function getCustomStyleObject(options: {
    backgroundColor?: ColorValue | null;
    textColor?: ColorValue | null;
    padding?: PaddingValue | null;
    margin?: PaddingValue | null;
    border?: BorderValue | null;
    width?: WidthValue | null;
}): React.CSSProperties;
/**
 * Convert GradientValue to CSS gradient string
 */
export declare function gradientValueToCSS(gradient: GradientValue | null | undefined): string;
/**
 * Result of background CSS conversion
 * Includes both styles and metadata for consumer components
 */
export interface BackgroundCSSResult {
    /** CSS properties to apply directly */
    styles: React.CSSProperties;
    /** Image opacity (0-1) - consumer should apply via wrapper if needed */
    imageOpacity?: number;
}
/**
 * Convert BackgroundValue to CSS properties object
 * Returns both styles and metadata for advanced features like image opacity
 */
export declare function backgroundValueToCSS(bg: BackgroundValue | null | undefined): React.CSSProperties;
/**
 * Get image opacity from BackgroundValue (for consumer wrapper components)
 * Returns undefined if no image or opacity is 100%
 */
export declare function getBackgroundImageOpacity(bg: BackgroundValue | null | undefined): number | undefined;
/**
 * Check if any custom style values are set
 */
export declare function hasCustomStyles(options: {
    backgroundColor?: ColorValue | null;
    textColor?: ColorValue | null;
    padding?: PaddingValue | null;
    margin?: PaddingValue | null;
    border?: BorderValue | null;
    width?: WidthValue | null;
}): boolean;
export type TransformOrigin = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export interface TransformValue {
    rotate: number;
    scaleX: number;
    scaleY: number;
    scaleLocked: boolean;
    skewX: number;
    skewY: number;
    translateX: number;
    translateY: number;
    translateUnit: 'px' | 'rem' | '%';
    origin: TransformOrigin;
    enable3D: boolean;
    perspective?: number;
    rotateX?: number;
    rotateY?: number;
}
/**
 * Default transform value
 */
export declare const DEFAULT_TRANSFORM: TransformValue;
/**
 * Convert TransformValue to CSS properties object
 */
export declare function transformValueToCSS(transform: TransformValue | null | undefined): React.CSSProperties | undefined;
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Responsive value that can have different values at different breakpoints.
 * Uses mobile-first approach: xs is the required base, larger breakpoints inherit upward.
 * sm/md/lg/xl are optional overrides that apply at their breakpoint and above.
 */
export interface ResponsiveValue<T> {
    xs: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
}
/**
 * Breakpoint configuration with labels and pixel values
 */
export declare const BREAKPOINTS: Array<{
    key: Breakpoint;
    label: string;
    minWidth: number | null;
}>;
/**
 * Type guard to check if a value is a ResponsiveValue (has breakpoint structure)
 * Checks for the required xs property which indicates mobile-first responsive value
 */
export declare function isResponsiveValue<T>(value: unknown): value is ResponsiveValue<T>;
/**
 * Converts React.CSSProperties to a CSS string for use in style tags
 */
export declare function cssPropertiesToString(styles: React.CSSProperties): string;
/**
 * Result of converting a responsive value to CSS
 */
export interface ResponsiveCSSResult {
    /** Base styles to apply as inline styles */
    baseStyles: React.CSSProperties;
    /** CSS media queries to render in a <style> tag */
    mediaQueryCSS: string;
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
export declare function responsiveValueToCSS<T>(value: ResponsiveValue<T> | T | null | undefined, converter: (v: T) => React.CSSProperties | undefined, uniqueId: string): ResponsiveCSSResult;
/**
 * Visibility value for show/hide per breakpoint
 */
export interface VisibilityValue {
    /** XS (extra small) visibility - true = visible, false = hidden (default: true) */
    xs: boolean;
    /** Small screens (640px+) */
    sm?: boolean;
    /** Override for medium screens (768px+) */
    md?: boolean;
    /** Override for large screens (1024px+) */
    lg?: boolean;
    /** Override for extra large screens (1280px+) */
    xl?: boolean;
}
/**
 * Default visibility value (visible at all breakpoints)
 */
export declare const DEFAULT_VISIBILITY: VisibilityValue;
/**
 * Converts a VisibilityValue to CSS with display: none media queries.
 * Each breakpoint is independent - generates targeted media queries for hidden breakpoints.
 *
 * @param visibility - The visibility settings per breakpoint
 * @param uniqueId - Unique class name for targeting in media queries
 * @returns CSS media queries string for hiding at specific breakpoints
 */
export declare function visibilityValueToCSS(visibility: VisibilityValue | null | undefined, uniqueId: string): string;
/** Standard CSS easing functions */
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
/** Advanced easing with spring/bounce effects via cubic-bezier approximations */
export type AdvancedEasingFunction = EasingFunction | 'spring' | 'spring-gentle' | 'bounce' | 'bounce-in' | 'bounce-out' | 'back-in' | 'back-out' | 'back-in-out' | 'elastic';
/** Map advanced easing to CSS cubic-bezier values */
export declare const EASING_CSS_MAP: Record<AdvancedEasingFunction, string>;
/** Transform origin for animations (3x3 grid) */
export type AnimationOrigin = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/** Stagger direction for child animations */
export type StaggerDirection = 'forward' | 'reverse' | 'center' | 'edges';
/** Configuration for staggered child animations */
export interface StaggerConfig {
    enabled: boolean;
    /** Delay between each child element (ms) */
    delay: number;
    /** Maximum total delay to prevent very long animations */
    maxDelay?: number;
    /** Direction of stagger effect */
    direction: StaggerDirection;
}
/** Animation categories for UI organization */
export type AnimationCategory = 'fade' | 'scale' | 'slide' | 'blur' | 'rotate' | 'bounce' | 'flip' | 'zoom';
/**
 * Extended entrance animation presets (27 total)
 * Organized by category for the UI dropdown
 */
export type EntranceAnimation = 'none' | 'fade-in' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade-scale' | 'scale-in' | 'scale-up' | 'scale-down' | 'scale-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'blur-in' | 'blur-up' | 'blur-down' | 'rotate-in' | 'rotate-up' | 'rotate-down' | 'bounce-in' | 'bounce-up' | 'bounce-down' | 'flip-x' | 'flip-y' | 'zoom-in' | 'zoom-out';
/**
 * Animation presets organized by category for UI
 */
export declare const ANIMATION_CATEGORIES: Array<{
    category: AnimationCategory | 'none';
    label: string;
    animations: EntranceAnimation[];
}>;
export interface AnimationValue {
    mode: 'preset' | 'custom';
    entrance?: EntranceAnimation;
    entranceDuration?: number;
    entranceDelay?: number;
    /** Distance for translate animations (8-200px) */
    distance?: number;
    /** Starting scale for scale animations (0.1-2) */
    scaleFrom?: number;
    /** Rotation angle for rotate animations (-180 to 180deg) */
    rotateAngle?: number;
    /** Blur amount for blur animations (0-50px) */
    blurAmount?: number;
    origin?: AnimationOrigin;
    easing?: AdvancedEasingFunction;
    stagger?: StaggerConfig;
    duration?: number;
    delay?: number;
    triggerOnScroll?: boolean;
    triggerThreshold?: number;
    triggerOnce?: boolean;
    /** Margin around viewport for earlier/later triggering (e.g., "0px 0px -100px 0px") */
    triggerMargin?: string;
}
/**
 * Convert AnimationValue to CSS transition property (for custom mode)
 * Returns undefined for preset mode - use getEntranceAnimationStyles instead
 */
export declare function animationValueToCSS(anim: AnimationValue | null): React.CSSProperties | undefined;
/**
 * Get initial and animate styles for entrance animations
 * Returns inline CSS style objects that work without Tailwind compilation
 * Supports all 27 animation presets with customizable intensity
 */
export declare function getEntranceAnimationStyles(anim: AnimationValue | null): {
    initial: React.CSSProperties;
    animate: React.CSSProperties;
    duration: number;
    delay: number;
    easing: string;
    origin: string;
};
/**
 * Get default easing for animation category
 * Bounce animations default to bounce easing, etc.
 */
export declare function getDefaultEasingForAnimation(entrance: EntranceAnimation): AdvancedEasingFunction;
/**
 * Get CSS custom properties for animation timing
 * Useful for CSS-only animations with custom properties
 */
export declare function getAnimationCSSVariables(anim: AnimationValue | null): Record<string, string>;
/**
 * Generate stagger delay for a specific child index
 * Accounts for direction (forward, reverse, center, edges)
 */
export declare function getStaggerDelay(config: StaggerConfig, index: number, totalChildren: number): number;
/**
 * Generate CSS styles for staggered children
 * Returns an object with CSS custom properties for each child
 */
export declare function generateStaggerStyles(config: StaggerConfig | undefined, totalChildren: number): React.CSSProperties[];
/**
 * Check which intensity controls are relevant for an animation type
 */
export declare function getRelevantIntensityControls(entrance: EntranceAnimation): {
    showDistance: boolean;
    showScale: boolean;
    showRotate: boolean;
    showBlur: boolean;
};
/**
 * Default animation value
 */
export declare const DEFAULT_ANIMATION: AnimationValue;
export declare const layoutComponentsDisallow: string[];
export type SizeMode = 'sm' | 'default' | 'lg' | 'custom';
export type SizeUnit = 'px' | 'rem';
export interface SizeValue {
    mode: SizeMode;
    /** Height in units (only used when mode === 'custom') */
    height?: number;
    /** Horizontal padding in units (only used when mode === 'custom') */
    paddingX?: number;
    /** Vertical padding in units (only used when mode === 'custom') */
    paddingY?: number;
    /** Font size in units (only used when mode === 'custom') */
    fontSize?: number;
    /** Unit for all values */
    unit?: SizeUnit;
}
/**
 * Convert SizeValue to CSS properties (only for custom mode)
 * Server-safe utility for Button and other components
 */
export declare function sizeValueToCSS(size: SizeValue | null | undefined): React.CSSProperties | undefined;
/**
 * Get Tailwind size classes for preset modes
 * Returns empty string for custom mode (CSS properties handle that)
 * Server-safe utility for Button and other components
 */
export declare function getSizeClasses(size: SizeValue | null | undefined, sizeMap: Record<string, string>): string;
//# sourceMappingURL=shared.d.ts.map