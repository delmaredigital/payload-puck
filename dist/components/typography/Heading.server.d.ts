/**
 * Heading Component - Server-Safe Puck Configuration
 *
 * H1-H6 headings with customizable styling.
 * This version excludes field definitions for server-side rendering.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type ColorValue, type DimensionsValue, type AnimationValue } from '../../fields/shared';
import type { Alignment } from '../../fields/AlignmentField';
export interface HeadingProps {
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    alignment: Alignment | null;
    textColor: ColorValue | null;
    dimensions: DimensionsValue | null;
    animation: AnimationValue | null;
    margin: PaddingValue | null;
    customPadding: PaddingValue | null;
}
export declare const HeadingConfig: ComponentConfig<HeadingProps>;
//# sourceMappingURL=Heading.server.d.ts.map