/**
 * Accordion Component - Server-safe Puck Configuration
 *
 * Expandable sections with collapsible content.
 * This version contains only the render function and types - no fields.
 * The render function returns a client component (AccordionClient) that
 * handles the interactive state.
 */
import type { ComponentConfig } from '@puckeditor/core';
import type { PaddingValue, DimensionsValue, BackgroundValue, AnimationValue, TransformValue, ColorValue } from '../../fields/shared';
interface AccordionItemData {
    title: string;
    content: string;
    defaultOpen: boolean;
}
export interface AccordionProps {
    items: AccordionItemData[];
    allowMultiple: boolean;
    textColor: ColorValue | null;
    margin: PaddingValue | null;
    background: BackgroundValue | null;
    dimensions: DimensionsValue | null;
    transform: TransformValue | null;
    animation: AnimationValue | null;
    customPadding: PaddingValue | null;
}
export declare const AccordionConfig: ComponentConfig<AccordionProps>;
export {};
//# sourceMappingURL=Accordion.server.d.ts.map