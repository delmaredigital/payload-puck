import type { CustomField } from '@puckeditor/core';
interface LockedTextFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    warningMessage?: string;
}
interface LockedRadioFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    options: {
        label: string;
        value: boolean;
    }[];
    warningMessage?: string;
}
export declare function LockedTextField({ value, onChange, label, placeholder, warningMessage, }: LockedTextFieldProps): import("react/jsx-runtime").JSX.Element;
export declare function LockedRadioField({ value, onChange, label, options, warningMessage, }: LockedRadioFieldProps): import("react/jsx-runtime").JSX.Element;
/**
 * Creates a Puck field configuration for a locked text input
 */
export declare function createLockedTextField(config: {
    label?: string;
    placeholder?: string;
    warningMessage?: string;
}): CustomField<string>;
/**
 * Creates a Puck field configuration for a locked radio button group
 */
export declare function createLockedRadioField(config: {
    label?: string;
    options: {
        label: string;
        value: boolean;
    }[];
    warningMessage?: string;
}): CustomField<boolean>;
/**
 * Pre-built locked slug field - prevents accidental URL changes
 *
 * Use in Puck root config:
 * ```tsx
 * root: {
 *   fields: {
 *     slug: lockedSlugField,
 *   }
 * }
 * ```
 */
export declare const lockedSlugField: CustomField<string>;
/**
 * Pre-built locked isHomepage field - prevents accidental homepage changes
 *
 * Use in Puck root config:
 * ```tsx
 * root: {
 *   fields: {
 *     isHomepage: lockedHomepageField,
 *   }
 * }
 * ```
 */
export declare const lockedHomepageField: CustomField<boolean>;
export {};
//# sourceMappingURL=LockedField.d.ts.map