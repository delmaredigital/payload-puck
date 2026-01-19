/**
 * WidthField - Custom Puck field for flexible width control
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Custom max-width input with unit selector (px, %, rem, vw)
 * - Content alignment (left, center, right)
 * - Preset quick-select buttons for common widths
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { WidthValue } from './shared';
interface WidthFieldProps {
    value: WidthValue | null;
    onChange: (value: WidthValue | null) => void;
    label?: string;
    readOnly?: boolean;
}
declare function WidthFieldInner({ value, onChange, label, readOnly, }: WidthFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const WidthField: React.MemoExoticComponent<typeof WidthFieldInner>;
/**
 * Creates a Puck field configuration for width control
 */
export declare function createWidthField(config: {
    label?: string;
}): CustomField<WidthValue | null>;
export {};
//# sourceMappingURL=WidthField.d.ts.map