/**
 * Container Component - Server-safe Puck Configuration
 *
 * Simple organizational wrapper for grouping content.
 * Uses Puck's slot system for nesting other components.
 *
 * This is a server-safe version with minimal fields (only slot for content).
 * For the full editor version with fields, use Container.tsx
 *
 * For two-layer layouts (full-bleed background with constrained content),
 * use the Section component instead.
 *
 * Responsive Controls:
 * - dimensions: Different max-width/min-height at different breakpoints
 * - padding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BorderValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type ResponsiveValue, type VisibilityValue } from '../../fields/shared';
export type ContainerSemanticElement = 'div' | 'article' | 'aside' | 'section';
export interface ContainerProps {
    content: unknown;
    semanticElement: ContainerSemanticElement;
    visibility: VisibilityValue | null;
    dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null;
    background: BackgroundValue | null;
    border: BorderValue | null;
    padding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    margin: ResponsiveValue<PaddingValue> | PaddingValue | null;
    animation: AnimationValue | null;
}
export declare const ContainerConfig: ComponentConfig;
//# sourceMappingURL=Container.server.d.ts.map