/**
 * MarginField - Custom Puck field for component margin/spacing control
 *
 * Similar to PaddingField but specifically for outer margin.
 * Provides:
 * - 4 number inputs for top/right/bottom/left
 * - Link/unlink toggle button (when linked, all values sync)
 * - Unit selector (px, rem)
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { PaddingValue } from './shared';
export type MarginValue = PaddingValue;
interface MarginFieldProps {
    value: MarginValue | null;
    onChange: (value: MarginValue | null) => void;
    label?: string;
    readOnly?: boolean;
    showUnits?: boolean;
}
declare function MarginFieldInner({ value, onChange, label, readOnly, showUnits, }: MarginFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const MarginField: React.MemoExoticComponent<typeof MarginFieldInner>;
/**
 * Creates a Puck field configuration for margin/spacing
 */
export declare function createMarginField(config: {
    label?: string;
    showUnits?: boolean;
}): CustomField<MarginValue | null>;
export {};
//# sourceMappingURL=MarginField.d.ts.map