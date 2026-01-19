import type { CustomField } from '@puckeditor/core';
interface PageSegmentFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}
interface LockedPageSegmentFieldProps extends PageSegmentFieldProps {
    warningMessage?: string;
}
export declare function PageSegmentField({ value, onChange, label, placeholder, }: PageSegmentFieldProps): import("react/jsx-runtime").JSX.Element;
/**
 * Creates a Puck field configuration for page segment editing
 */
export declare function createPageSegmentField(config?: {
    label?: string;
    placeholder?: string;
}): CustomField<string>;
/**
 * PageSegmentField with lock/unlock functionality.
 * Starts locked to prevent accidental URL changes.
 */
export declare function LockedPageSegmentField({ value, onChange, label, placeholder, warningMessage, }: LockedPageSegmentFieldProps): import("react/jsx-runtime").JSX.Element;
/**
 * Creates a Puck field configuration for a locked page segment field.
 * Recommended for page-tree integration to prevent accidental URL changes.
 */
export declare function createLockedPageSegmentField(config?: {
    label?: string;
    placeholder?: string;
    warningMessage?: string;
}): CustomField<string>;
export {};
//# sourceMappingURL=PageSegmentField.d.ts.map