/**
 * TemplateField - Custom Puck field for saving/loading template content
 *
 * This component provides a template picker that:
 * - Fetches templates from the puck-templates Payload collection
 * - Shows a dropdown to select a template
 * - Has a "Save as template" button to save current slot content
 * - When a template is selected, loads the saved components into the slot
 *
 * Uses Puck's usePuck hook to access and modify component slot data.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
interface TemplateFieldProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    readOnly?: boolean;
    apiEndpoint?: string;
}
declare function TemplateFieldInner({ value, onChange, label, readOnly, apiEndpoint, }: TemplateFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const TemplateField: React.MemoExoticComponent<typeof TemplateFieldInner>;
/**
 * Creates a Puck field configuration for template selection
 */
export declare function createTemplateField(config: {
    label?: string;
    apiEndpoint?: string;
}): CustomField<string | null>;
export {};
//# sourceMappingURL=TemplateField.d.ts.map