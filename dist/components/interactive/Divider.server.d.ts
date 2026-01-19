/**
 * Divider Component - Server-safe Puck Configuration
 *
 * Horizontal line separator with customizable style.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
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
export declare const DividerConfig: ComponentConfig<DividerProps>;
//# sourceMappingURL=Divider.server.d.ts.map