/**
 * Spacer Component - Server-safe Puck Configuration
 *
 * Simple spacing component for adding vertical or horizontal space.
 * Uses Tailwind classes for layout and sizing from predefined options.
 *
 * This is a server-safe version with NO fields property.
 * For the full editor version with fields, use Spacer.tsx
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
export declare const SpacerConfig: ComponentConfig<SpacerProps>;
//# sourceMappingURL=Spacer.server.d.ts.map