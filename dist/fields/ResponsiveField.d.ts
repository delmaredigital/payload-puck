/**
 * ResponsiveField - Generic wrapper for breakpoint-specific field overrides
 *
 * This component wraps any existing field to provide responsive overrides
 * at different breakpoints (xs, sm, md, lg, xl). It uses sparse storage,
 * only storing values for breakpoints that have explicit overrides.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { ResponsiveValue } from './shared';
interface ResponsiveFieldProps<T> {
    value: ResponsiveValue<T> | null;
    onChange: (value: ResponsiveValue<T> | null) => void;
    label?: string;
    readOnly?: boolean;
    /** Render function for the inner field */
    renderInnerField: (props: {
        value: T | null;
        onChange: (v: T | null) => void;
        readOnly?: boolean;
    }) => React.ReactNode;
    /** Default value for the xs breakpoint */
    defaultValue?: T;
}
export declare const ResponsiveField: <T>(props: ResponsiveFieldProps<T>) => React.ReactElement;
interface CreateResponsiveFieldConfig<T> {
    label?: string;
    innerField: (config: {
        label?: string;
    }) => CustomField<T | null>;
    defaultValue?: T;
}
/**
 * Creates a responsive wrapper around any Puck custom field.
 */
export declare function createResponsiveField<T>(config: CreateResponsiveFieldConfig<T>): CustomField<ResponsiveValue<T> | null>;
export {};
//# sourceMappingURL=ResponsiveField.d.ts.map