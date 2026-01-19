/**
 * Button Component - Server-safe Puck Configuration
 *
 * CTA button with customizable styling and link support.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type ColorValue, type BorderValue, type AnimationValue, type TransformValue, type SizeValue } from '../../fields/shared';
import type { Alignment } from '../../fields/AlignmentField';
export interface ButtonProps {
    text: string;
    link: string;
    variant: string;
    size: SizeValue | null;
    openInNewTab: string;
    margin: PaddingValue | null;
    customBackgroundColor: ColorValue | null;
    customTextColor: ColorValue | null;
    customBorder: BorderValue | null;
    alignment: Alignment | null;
    transform: TransformValue | null;
    animation: AnimationValue | null;
    customPadding: PaddingValue | null;
}
export declare const ButtonConfig: ComponentConfig<ButtonProps>;
//# sourceMappingURL=Button.server.d.ts.map