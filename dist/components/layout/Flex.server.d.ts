/**
 * Flex Component - Server-safe Puck Configuration
 *
 * Flexbox layout following official Puck demo patterns.
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * This is a server-safe version with NO fields property (only slot for content).
 * For the full editor version with fields, use Flex.tsx
 *
 * Responsive Controls:
 * - dimensions: Different dimensions at different breakpoints
 * - customPadding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BorderValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type ResponsiveValue, type VisibilityValue } from '../../fields/shared';
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch';
export type FlexSemanticElement = 'div' | 'nav' | 'ul' | 'ol' | 'aside' | 'section';
export interface FlexProps {
    content: unknown;
    semanticElement: FlexSemanticElement;
    direction: 'row' | 'column';
    justifyContent: JustifyContent | null;
    alignItems: AlignItems | null;
    gap: number;
    wrap: 'wrap' | 'nowrap';
    background: BackgroundValue | null;
    customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    margin: ResponsiveValue<PaddingValue> | PaddingValue | null;
    dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null;
    border: BorderValue | null;
    animation: AnimationValue | null;
    visibility: VisibilityValue | null;
}
export declare const FlexConfig: ComponentConfig;
//# sourceMappingURL=Flex.server.d.ts.map