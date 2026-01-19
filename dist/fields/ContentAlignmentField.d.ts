/**
 * ContentAlignmentField - Visual 3x3 grid selector for content positioning
 *
 * A d-pad style control for selecting content alignment within a container.
 * Works with both Flexbox (justify-content + align-items) and Grid (place-content).
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
/** Horizontal alignment */
export type HorizontalAlign = 'start' | 'center' | 'end';
/** Vertical alignment */
export type VerticalAlign = 'start' | 'center' | 'end';
/** Combined alignment position (9 positions) */
export interface ContentAlignmentValue {
    horizontal: HorizontalAlign;
    vertical: VerticalAlign;
}
/** Position labels for accessibility */
export type PositionLabel = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
interface ContentAlignmentFieldProps {
    value: ContentAlignmentValue | null;
    onChange: (value: ContentAlignmentValue | null) => void;
    label?: string;
    readOnly?: boolean;
    /** Default alignment when null */
    defaultValue?: ContentAlignmentValue;
}
declare function ContentAlignmentFieldInner({ value, onChange, label, readOnly, defaultValue, }: ContentAlignmentFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const ContentAlignmentField: React.MemoExoticComponent<typeof ContentAlignmentFieldInner>;
/**
 * Convert ContentAlignmentValue to Flexbox CSS properties
 * Use this when the container is display: flex
 */
export declare function alignmentToFlexCSS(alignment: ContentAlignmentValue | null | undefined): React.CSSProperties;
/**
 * Convert ContentAlignmentValue to Grid CSS properties
 * Use this when the container is display: grid
 */
export declare function alignmentToGridCSS(alignment: ContentAlignmentValue | null | undefined): React.CSSProperties;
/**
 * Convert ContentAlignmentValue to place-self CSS for grid items
 * Use this on individual items within a grid
 */
export declare function alignmentToPlaceSelfCSS(alignment: ContentAlignmentValue | null | undefined): React.CSSProperties;
/**
 * Get Tailwind classes for alignment
 * Returns both justify-* and items-* classes
 */
export declare function alignmentToTailwind(alignment: ContentAlignmentValue | null | undefined): string;
interface CreateContentAlignmentFieldConfig {
    label?: string;
    defaultValue?: ContentAlignmentValue;
}
/**
 * Creates a Puck field configuration for content alignment
 *
 * @example
 * ```ts
 * fields: {
 *   contentAlignment: createContentAlignmentField({ label: 'Align Content' }),
 * }
 * ```
 */
export declare function createContentAlignmentField(config?: CreateContentAlignmentFieldConfig): CustomField<ContentAlignmentValue | null>;
export {};
//# sourceMappingURL=ContentAlignmentField.d.ts.map