/**
 * BackgroundField - Custom Puck field for unified background selection
 *
 * This component provides a tabbed interface for selecting:
 * - None: No background
 * - Solid: Single color with opacity
 * - Gradient: Linear or radial gradients with multiple stops
 * - Image: Background image from media library with sizing options
 */
import React from 'react';
import type { CustomField } from '@puckeditor/core';
import type { BackgroundValue } from './shared';
interface BackgroundFieldProps {
    value: BackgroundValue | null;
    onChange: (value: BackgroundValue | null) => void;
    label?: string;
    readOnly?: boolean;
    apiEndpoint?: string;
    showOpacity?: boolean;
    colorPresets?: Array<{
        hex: string;
        label: string;
    }>;
}
declare function BackgroundFieldInner({ value, onChange, label, readOnly, apiEndpoint, showOpacity, colorPresets, }: BackgroundFieldProps): import("react/jsx-runtime").JSX.Element;
export declare const BackgroundField: React.MemoExoticComponent<typeof BackgroundFieldInner>;
/**
 * Creates a Puck field configuration for background selection
 */
export declare function createBackgroundField(config?: {
    label?: string;
    apiEndpoint?: string;
    showOpacity?: boolean;
    colorPresets?: Array<{
        hex: string;
        label: string;
    }>;
}): CustomField<BackgroundValue | null>;
export {};
//# sourceMappingURL=BackgroundField.d.ts.map