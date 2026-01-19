/**
 * Text Component - Server-Safe Puck Configuration
 *
 * Simple paragraph text with customizable styling.
 * This version excludes field definitions for server-side rendering.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type ColorValue, type DimensionsValue, type AnimationValue } from '../../fields/shared';
import type { Alignment } from '../../fields/AlignmentField';
export interface TextProps {
    content: string;
    size: string;
    alignment: Alignment | null;
    textColor: ColorValue | null;
    dimensions: DimensionsValue | null;
    animation: AnimationValue | null;
    margin: PaddingValue | null;
    customPadding: PaddingValue | null;
}
export declare const TextConfig: ComponentConfig<TextProps>;
//# sourceMappingURL=Text.server.d.ts.map