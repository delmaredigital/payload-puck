/**
 * TransformField - Custom Puck field for CSS transforms
 *
 * This component provides:
 * - Live preview of transform effect
 * - Rotate slider (-360 to 360)
 * - Scale X/Y with link/unlink toggle
 * - Skew X/Y sliders
 * - Translate X/Y inputs with unit selector
 * - Transform origin 3x3 grid selector
 * - Collapsible 3D section (perspective, rotateX, rotateY)
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { TransformValue } from './shared';
interface TransformFieldProps {
    value: TransformValue | null;
    onChange: (value: TransformValue | null) => void;
    label?: string;
    readOnly?: boolean;
}
declare function TransformFieldInner({ value, onChange, label, readOnly, }: TransformFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const TransformField: React.MemoExoticComponent<typeof TransformFieldInner>;
/**
 * Creates a Puck field configuration for CSS transforms
 */
export declare function createTransformField(config: {
    label?: string;
}): CustomField<TransformValue | null>;
export {};
//# sourceMappingURL=TransformField.d.ts.map