/**
 * Grid Component - Puck Configuration
 *
 * CSS Grid layout following official Puck demo patterns.
 * Responsive: stacks on mobile (flex column), grid on desktop (md+).
 * Uses Tailwind classes for layout, inline styles for dynamic user values.
 *
 * Supports both preset options and advanced custom styling:
 * - Background: unified BackgroundField (solid, gradient, or image)
 * - Advanced: customPadding, customWidth, border
 *
 * Responsive Controls:
 * - gap: Different gap at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type BorderValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type ResponsiveValue, type VisibilityValue } from '../../fields/shared';
export type GridSemanticElement = 'div' | 'ul' | 'ol';
export interface GridProps {
    content: unknown;
    semanticElement: GridSemanticElement;
    numColumns: number;
    gap: number;
    background: BackgroundValue | null;
    customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null;
    border: BorderValue | null;
    margin: ResponsiveValue<PaddingValue> | PaddingValue | null;
    animation: AnimationValue | null;
    visibility: VisibilityValue | null;
}
export declare const GridConfig: ComponentConfig;
//# sourceMappingURL=Grid.d.ts.map