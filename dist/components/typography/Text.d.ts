/**
 * Text Component - Puck Configuration
 *
 * Simple paragraph text with customizable styling.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type ColorValue, type DimensionsValue, type AnimationValue } from '../../fields/shared';
import { type Alignment } from '../../fields/AlignmentField';
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
export declare const TextConfig: ComponentConfig;
//# sourceMappingURL=Text.d.ts.map