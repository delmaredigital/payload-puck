/**
 * DimensionsField - Unified Puck field for width and height constraints
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Min/max width controls
 * - Min/max height controls
 * - Content alignment (left, center, right)
 * - Progressive disclosure (simple vs advanced mode)
 * - Preset quick-select buttons for common widths
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { DimensionsValue } from './shared';
interface DimensionsFieldProps {
    value: DimensionsValue | null;
    onChange: (value: DimensionsValue | null) => void;
    label?: string;
    readOnly?: boolean;
    /** Show height controls (default: true) */
    showHeightControls?: boolean;
    /** Show min controls in advanced mode (default: true) */
    showMinControls?: boolean;
    /** Start with advanced mode expanded (default: false) */
    defaultAdvancedMode?: boolean;
}
declare function DimensionsFieldInner({ value, onChange, label, readOnly, showHeightControls, showMinControls, defaultAdvancedMode, }: DimensionsFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const DimensionsField: React.MemoExoticComponent<typeof DimensionsFieldInner>;
interface CreateDimensionsFieldConfig {
    label?: string;
    /** Show height controls (default: true) */
    showHeightControls?: boolean;
    /** Show min controls in advanced mode (default: true) */
    showMinControls?: boolean;
    /** Start with advanced mode expanded (default: false) */
    defaultAdvancedMode?: boolean;
}
/**
 * Creates a Puck field configuration for dimensions control
 */
export declare function createDimensionsField(config?: CreateDimensionsFieldConfig): CustomField<DimensionsValue | null>;
export {};
//# sourceMappingURL=DimensionsField.d.ts.map