/**
 * Template Component - Puck Configuration
 *
 * A reusable template container that allows saving and loading
 * pre-configured component arrangements from the Payload CMS.
 *
 * Use this component to:
 * - Create reusable page sections
 * - Save common component patterns as templates
 * - Quickly load pre-built layouts
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
    /** ID of the currently loaded template (or null if none) */
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
export declare const TemplateConfig: ComponentConfig;
//# sourceMappingURL=Template.d.ts.map