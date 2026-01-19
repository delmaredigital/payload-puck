/**
 * VerticalAlignmentField - Icon toggle buttons for vertical/self alignment
 *
 * Used for grid item self-alignment (e.g., in TextImageSplit)
 * Controls how an item aligns itself within its grid/flex cell.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
export type VerticalAlignment = 'flex-start' | 'center' | 'flex-end';
interface VerticalAlignmentFieldProps {
    value: VerticalAlignment | null;
    onChange: (value: VerticalAlignment | null) => void;
    label?: string;
    readOnly?: boolean;
    defaultValue?: VerticalAlignment;
}
declare function VerticalAlignmentFieldInner({ value, onChange, label, readOnly, defaultValue, }: VerticalAlignmentFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const VerticalAlignmentField: React.MemoExoticComponent<typeof VerticalAlignmentFieldInner>;
interface CreateVerticalAlignmentFieldConfig {
    label?: string;
    defaultValue?: VerticalAlignment;
}
/**
 * Creates a Puck field configuration for vertical/self alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   verticalAlignment: createVerticalAlignmentField({ label: 'Vertical Alignment' }),
 * }
 * ```
 */
export declare function createVerticalAlignmentField(config?: CreateVerticalAlignmentFieldConfig): CustomField<VerticalAlignment | null>;
export {};
//# sourceMappingURL=VerticalAlignmentField.d.ts.map