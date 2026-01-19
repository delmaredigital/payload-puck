/**
 * Card Component - Puck Configuration
 *
 * Content card with image, heading, and text.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BackgroundValue, type BorderValue, type DimensionsValue, type AnimationValue, type TransformValue } from '../../fields/shared';
import { type Alignment } from '../../fields/AlignmentField';
import type { MediaReference } from '../../fields/MediaField';
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
export declare const CardConfig: ComponentConfig;
//# sourceMappingURL=Card.d.ts.map