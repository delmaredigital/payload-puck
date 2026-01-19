import { type PaddingValue, type DimensionsValue, type BackgroundValue, type AnimationValue, type TransformValue, type ColorValue } from '../fields/shared';
interface AccordionItemData {
    title: string;
    content: string;
    defaultOpen: boolean;
}
export interface AccordionClientProps {
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
export declare function AccordionClient({ items, allowMultiple, textColor, margin, background, dimensions, transform, animation, customPadding, }: AccordionClientProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AccordionClient.d.ts.map