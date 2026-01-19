/**
 * Image Component - Server-safe Puck Configuration
 *
 * Standalone image block with optional link wrapper.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue, type BorderValue, type AnimationValue, type TransformValue, type VisibilityValue } from '../../fields/shared';
import type { MediaReference } from '../../fields/MediaField';
import type { Alignment } from '../../fields/AlignmentField';
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
export declare const ImageConfig: ComponentConfig<ImageProps>;
//# sourceMappingURL=Image.server.d.ts.map