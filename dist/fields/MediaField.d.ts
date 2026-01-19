/**
 * MediaField - Custom Puck field for selecting Payload CMS media
 *
 * This component provides a media picker that integrates with Payload's
 * media collection, allowing users to browse and select images.
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
export interface MediaReference {
    id: string | number;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
}
interface MediaFieldProps {
    value: MediaReference | null;
    onChange: (value: MediaReference | null) => void;
    label?: string;
    readOnly?: boolean;
    apiEndpoint?: string;
}
declare function MediaFieldInner({ value, onChange, label, readOnly, apiEndpoint, }: MediaFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const MediaField: React.MemoExoticComponent<typeof MediaFieldInner>;
/**
 * Creates a Puck field configuration for media selection
 */
export declare function createMediaField(config: {
    label?: string;
    apiEndpoint?: string;
}): CustomField<MediaReference | null>;
export {};
//# sourceMappingURL=MediaField.d.ts.map