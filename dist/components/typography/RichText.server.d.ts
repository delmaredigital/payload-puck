/**
 * RichText Component - Server-Safe Puck Configuration
 *
 * Rich text content with customizable styling.
 * This version excludes field definitions for server-side rendering.
 *
 * Requires @tailwindcss/typography - uses the `prose` class for styling.
 */
import React from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue, type ColorValue, type AnimationValue } from '../../fields/shared';
import type { Alignment } from '../../fields/AlignmentField';
export interface RichTextProps {
    content: React.ReactNode;
    alignment: Alignment | null;
    textColor: ColorValue | null;
    dimensions: DimensionsValue | null;
    animation: AnimationValue | null;
    margin: PaddingValue | null;
    customPadding: PaddingValue | null;
}
export declare const RichTextConfig: ComponentConfig<RichTextProps>;
//# sourceMappingURL=RichText.server.d.ts.map