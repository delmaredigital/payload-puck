/**
 * FlexAlignmentField - Icon toggle buttons for flexbox alignment properties
 *
 * Provides two specialized fields:
 * - JustifyContentField: Controls main-axis distribution (horizontal in row, vertical in column)
 * - AlignItemsField: Controls cross-axis alignment (vertical in row, horizontal in column)
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch';
interface JustifyContentFieldProps {
    value: JustifyContent | null;
    onChange: (value: JustifyContent | null) => void;
    label?: string;
    readOnly?: boolean;
    defaultValue?: JustifyContent;
}
interface AlignItemsFieldProps {
    value: AlignItems | null;
    onChange: (value: AlignItems | null) => void;
    label?: string;
    readOnly?: boolean;
    defaultValue?: AlignItems;
}
declare function JustifyContentFieldInner({ value, onChange, label, readOnly, defaultValue, }: JustifyContentFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const JustifyContentField: React.MemoExoticComponent<typeof JustifyContentFieldInner>;
declare function AlignItemsFieldInner({ value, onChange, label, readOnly, defaultValue, }: AlignItemsFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const AlignItemsField: React.MemoExoticComponent<typeof AlignItemsFieldInner>;
interface CreateJustifyContentFieldConfig {
    label?: string;
    defaultValue?: JustifyContent;
}
interface CreateAlignItemsFieldConfig {
    label?: string;
    defaultValue?: AlignItems;
}
/**
 * Creates a Puck field configuration for flex justify-content control
 *
 * @example
 * ```ts
 * fields: {
 *   justifyContent: createJustifyContentField({ label: 'Justify Content' }),
 * }
 * ```
 */
export declare function createJustifyContentField(config?: CreateJustifyContentFieldConfig): CustomField<JustifyContent | null>;
/**
 * Creates a Puck field configuration for flex align-items control
 *
 * @example
 * ```ts
 * fields: {
 *   alignItems: createAlignItemsField({ label: 'Align Items' }),
 * }
 * ```
 */
export declare function createAlignItemsField(config?: CreateAlignItemsFieldConfig): CustomField<AlignItems | null>;
export {};
//# sourceMappingURL=FlexAlignmentField.d.ts.map