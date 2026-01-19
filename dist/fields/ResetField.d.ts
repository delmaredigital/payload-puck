/**
 * ResetField - Custom Puck field for resetting component to defaults
 *
 * This field renders a reset button that clears all customizations
 * and restores the component to its default state.
 *
 * Uses Puck's usePuck hook and dispatch to properly update component data.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
interface ResetFieldProps {
    onClick: () => void;
    label?: string;
    disabled?: boolean;
}
declare function ResetFieldInner({ onClick, label, disabled, }: ResetFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const ResetField: React.MemoExoticComponent<typeof ResetFieldInner>;
interface CreateResetFieldConfig<T> {
    label?: string;
    defaultProps: T;
}
/**
 * Creates a Puck field configuration for a reset button
 */
export declare function createResetField<T extends object>(config: CreateResetFieldConfig<T>): CustomField<unknown>;
export {};
//# sourceMappingURL=ResetField.d.ts.map