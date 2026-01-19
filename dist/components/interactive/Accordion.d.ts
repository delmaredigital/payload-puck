/**
 * Accordion Component - Puck Configuration
 *
 * Expandable sections with collapsible content.
 * Uses plain HTML/CSS for the accordion behavior.
 * Supports custom margin for spacing control.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { type PaddingValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type TransformValue, type ColorValue } from '../../fields/shared';
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
export declare const AccordionConfig: ComponentConfig;
export {};
//# sourceMappingURL=Accordion.d.ts.map