/**
 * Image Component - Puck Configuration
 *
 * Standalone image block with optional link wrapper.
 * Server-safe version using standard HTML img element.
 *
 * Responsive Controls:
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue, type BorderValue, type AnimationValue, type TransformValue, type VisibilityValue } from '../../fields/shared';
import { type MediaReference } from '../../fields/MediaField';
import { type Alignment } from '../../fields/AlignmentField';
export interface ImageProps {
    image: MediaReference | null;
    alt: string;
    aspectRatio: string;
    link: string;
    openInNewTab: boolean;
    margin: PaddingValue | null;
    border: BorderValue | null;
    dimensions: DimensionsValue | null;
    alignment: Alignment | null;
    transform: TransformValue | null;
    animation: AnimationValue | null;
    customPadding: PaddingValue | null;
    visibility: VisibilityValue | null;
}
export declare const ImageConfig: ComponentConfig;
//# sourceMappingURL=Image.d.ts.map