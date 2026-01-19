import type { CustomField } from '@puckeditor/core';
interface SlugPreviewFieldProps {
    value: string;
    label?: string;
    hint?: string;
}
export declare function SlugPreviewField({ value, label, hint, }: SlugPreviewFieldProps): import("react/jsx-runtime").JSX.Element;
/**
 * Creates a Puck field configuration for slug preview
 */
export declare function createSlugPreviewField(config?: {
    label?: string;
    hint?: string;
}): CustomField<string>;
export {};
//# sourceMappingURL=SlugPreviewField.d.ts.map