/**
 * Spacer Component - Puck Configuration
 *
 * Simple spacing component for adding vertical or horizontal space.
 * Uses Tailwind classes for layout and sizing from predefined options.
 *
 * Responsive Controls:
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type VisibilityValue } from '../../fields/shared';
export interface SpacerProps {
    size: string;
    direction: 'vertical' | 'horizontal' | 'both';
    visibility: VisibilityValue | null;
}
export declare const SpacerConfig: ComponentConfig;
//# sourceMappingURL=Spacer.d.ts.map