/**
 * PaddingField - Custom Puck field for 4-sided padding/margin control
 *
 * This component provides:
 * - 4 number inputs for top/right/bottom/left
 * - Link/unlink toggle button (when linked, all values sync)
 * - Unit selector (px, rem)
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { PaddingValue } from './shared';
interface PaddingFieldProps {
    value: PaddingValue | null;
    onChange: (value: PaddingValue | null) => void;
    label?: string;
    readOnly?: boolean;
    showUnits?: boolean;
}
declare function PaddingFieldInner({ value, onChange, label, readOnly, showUnits, }: PaddingFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const PaddingField: React.MemoExoticComponent<typeof PaddingFieldInner>;
/**
 * Creates a Puck field configuration for padding/spacing
 */
export declare function createPaddingField(config: {
    label?: string;
    showUnits?: boolean;
}): CustomField<PaddingValue | null>;
export {};
//# sourceMappingURL=PaddingField.d.ts.map