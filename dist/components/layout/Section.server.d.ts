/**
 * Section Component - Server-safe Puck Configuration
 *
 * Full-width section with two-layer architecture:
 * - Section layer (outer): Full-bleed background, border, padding, margin
 * - Content layer (inner): Constrained content area with max-width, background, border, padding
 *
 * This is a server-safe version with minimal fields (only slot for content).
 * For the full editor version with fields, use Section.tsx
 *
 * Responsive Controls:
 * - contentDimensions: Different max-width/min-height at different breakpoints
 * - sectionPadding: Different section padding at different breakpoints
 * - contentPadding: Different content padding at different breakpoints
 * - sectionMargin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BorderValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type ResponsiveValue, type VisibilityValue } from '../../fields/shared';
export type SemanticElement = 'section' | 'article' | 'aside' | 'nav' | 'div' | 'header' | 'footer' | 'main';
export interface SectionProps {
    id: string;
    content: unknown;
    semanticElement: SemanticElement;
    sectionBackground: BackgroundValue | null;
    sectionBorder: BorderValue | null;
    sectionPadding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    sectionMargin: ResponsiveValue<PaddingValue> | PaddingValue | null;
    contentDimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null;
    contentBackground: BackgroundValue | null;
    contentBorder: BorderValue | null;
    contentPadding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    animation: AnimationValue | null;
    visibility: VisibilityValue | null;
}
export declare const SectionConfig: ComponentConfig;
//# sourceMappingURL=Section.server.d.ts.map