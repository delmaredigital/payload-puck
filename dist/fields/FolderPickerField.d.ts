import type { CustomField } from '@puckeditor/core';
interface FolderPickerFieldProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    folderSlug?: string;
}
export declare function FolderPickerField({ value, onChange, label, folderSlug, }: FolderPickerFieldProps): import("react/jsx-runtime").JSX.Element;
/**
 * Creates a Puck field configuration for folder selection
 */
export declare function createFolderPickerField(config?: {
    label?: string;
    folderSlug?: string;
}): CustomField<string | null>;
export {};
//# sourceMappingURL=FolderPickerField.d.ts.map