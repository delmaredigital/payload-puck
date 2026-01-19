/**
 * Divider Component - Puck Configuration
 *
 * Horizontal line separator with customizable style.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type ColorValue, type DimensionsValue, type AnimationValue, type TransformValue } from '../../fields/shared';
export interface DividerProps {
    style: string;
    color: ColorValue | null;
    margin: PaddingValue | null;
    dimensions: DimensionsValue | null;
    transform: TransformValue | null;
    animation: AnimationValue | null;
    customPadding: PaddingValue | null;
}
export declare const DividerConfig: ComponentConfig;
//# sourceMappingURL=Divider.d.ts.map