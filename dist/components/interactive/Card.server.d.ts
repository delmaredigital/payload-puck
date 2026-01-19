/**
 * Card Component - Server-safe Puck Configuration
 *
 * Content card with image, heading, and text.
 * This version contains only the render function and types - no fields.
 * Safe for use in server components.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BackgroundValue, type BorderValue, type DimensionsValue, type AnimationValue, type TransformValue } from '../../fields/shared';
import type { MediaReference } from '../../fields/MediaField';
import type { Alignment } from '../../fields/AlignmentField';
export interface CardProps {
    image: MediaReference | null;
    heading: string;
    text: string;
    link: string;
    openInNewTab: boolean;
    shadow: string;
    margin: PaddingValue | null;
    background: BackgroundValue | null;
    border: BorderValue | null;
    dimensions: DimensionsValue | null;
    alignment: Alignment | null;
    transform: TransformValue | null;
    animation: AnimationValue | null;
    contentPadding: PaddingValue | null;
}
export declare const CardConfig: ComponentConfig<CardProps>;
//# sourceMappingURL=Card.server.d.ts.map