/**
 * ColorPickerField - Custom Puck field for selecting colors with opacity
 *
 * This component provides a color picker with:
 * - Native color input for visual picking
 * - Hex input for direct entry
 * - Opacity slider (0-100%)
 * - Preview swatch
 * - Optional preset color swatches
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { ColorValue } from './shared';
interface ColorPickerFieldProps {
    value: ColorValue | null;
    onChange: (value: ColorValue | null) => void;
    label?: string;
    readOnly?: boolean;
    showOpacity?: boolean;
    presets?: Array<{
        hex: string;
        label: string;
    }>;
}
/**
 * Converts hex + opacity to rgba CSS string
 */
export declare function colorToRgba(hex: string, opacity: number): string;
declare function ColorPickerFieldInner({ value, onChange, label, readOnly, showOpacity, presets, }: ColorPickerFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const ColorPickerField: React.MemoExoticComponent<typeof ColorPickerFieldInner>;
/**
 * Creates a Puck field configuration for color selection
 */
export declare function createColorPickerField(config: {
    label?: string;
    showOpacity?: boolean;
    presets?: Array<{
        hex: string;
        label: string;
    }>;
}): CustomField<ColorValue | null>;
export {};
//# sourceMappingURL=ColorPickerField.d.ts.map