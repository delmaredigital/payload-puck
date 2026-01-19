/**
 * AlignmentField - Icon toggle buttons for text/content alignment
 *
 * Replaces select dropdowns with intuitive icon toggles for
 * left, center, right alignment.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
export type Alignment = 'left' | 'center' | 'right';
interface AlignmentFieldProps {
    value: Alignment | null;
    onChange: (value: Alignment | null) => void;
    label?: string;
    readOnly?: boolean;
    /** Default value when cleared or initially null */
    defaultValue?: Alignment;
}
declare function AlignmentFieldInner({ value, onChange, label, readOnly, defaultValue, }: AlignmentFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const AlignmentField: React.MemoExoticComponent<typeof AlignmentFieldInner>;
interface CreateAlignmentFieldConfig {
    label?: string;
    defaultValue?: Alignment;
}
/**
 * Creates a Puck field configuration for alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   alignment: createAlignmentField({ label: 'Text Alignment' }),
 * }
 * ```
 */
export declare function createAlignmentField(config?: CreateAlignmentFieldConfig): CustomField<Alignment | null>;
export {};
//# sourceMappingURL=AlignmentField.d.ts.map