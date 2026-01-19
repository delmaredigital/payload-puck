/**
 * ResponsiveVisibilityField - Show/hide elements at different breakpoints
 *
 * Provides a compact visual interface for toggling element visibility
 * at each breakpoint (xs, sm, md, lg, xl). Simple independent toggles
 * like Elementor/Divi - each breakpoint is just on or off.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { VisibilityValue } from './shared';
interface ResponsiveVisibilityFieldProps {
    value: VisibilityValue | null;
    onChange: (value: VisibilityValue | null) => void;
    label?: string;
    readOnly?: boolean;
}
declare function ResponsiveVisibilityFieldInner({ value, onChange, label, readOnly, }: ResponsiveVisibilityFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const ResponsiveVisibilityField: React.MemoExoticComponent<typeof ResponsiveVisibilityFieldInner>;
interface CreateResponsiveVisibilityFieldConfig {
    label?: string;
}
/**
 * Creates a Puck custom field for responsive visibility control.
 *
 * @example
 * ```ts
 * fields: {
 *   visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
 * }
 * ```
 */
export declare function createResponsiveVisibilityField(config?: CreateResponsiveVisibilityFieldConfig): CustomField<VisibilityValue | null>;
export {};
//# sourceMappingURL=ResponsiveVisibilityField.d.ts.map