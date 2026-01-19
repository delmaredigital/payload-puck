/**
 * Template Component - Server-safe Configuration
 *
 * A reusable template container for rendering nested components.
 * This server-safe version excludes the TemplateField (which requires client-side APIs).
 *
 * For the full editor experience with template loading, use Template.tsx
 *
 * Responsive Controls:
 * - dimensions: Different dimensions at different breakpoints
 * - customPadding: Different padding at different breakpoints
 * - margin: Different margins at different breakpoints
 * - visibility: Show/hide at different breakpoints
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue, type ResponsiveValue, type VisibilityValue } from '../../fields/shared';
export interface TemplateProps {
    /** Slot for nested components */
    content: unknown;
    /** ID of the currently loaded template (for tracking only) */
    templateId: string | null;
    /** Responsive dimensions */
    dimensions: ResponsiveValue<DimensionsValue> | DimensionsValue | null;
    /** Responsive padding */
    customPadding: ResponsiveValue<PaddingValue> | PaddingValue | null;
    /** Responsive margin */
    margin: ResponsiveValue<PaddingValue> | PaddingValue | null;
    /** Responsive visibility */
    visibility: VisibilityValue | null;
}
export declare const TemplateServerConfig: ComponentConfig;
//# sourceMappingURL=Template.server.d.ts.map