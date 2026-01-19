'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { marginValueToCSS, paddingValueToCSS, dimensionsValueToCSS, backgroundValueToCSS, transformValueToCSS, colorValueToCSS, cn, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
import { createMarginField } from '../../fields/MarginField';
import { createPaddingField } from '../../fields/PaddingField';
import { createDimensionsField } from '../../fields/DimensionsField';
import { createResetField } from '../../fields/ResetField';
import { createBackgroundField } from '../../fields/BackgroundField';
import { createAnimationField } from '../../fields/AnimationField';
import { createTransformField } from '../../fields/TransformField';
import { createColorPickerField } from '../../fields/ColorPickerField';
// Accordion Item Component
function AccordionItem({ item, isOpen, onToggle, textColorCSS, }) {
    const textStyle = textColorCSS ? { color: textColorCSS } : {};
    return (_jsxs("div", { className: "border-b border-border last:border-b-0", children: [_jsxs("button", { type: "button", onClick: onToggle, className: "flex w-full items-center justify-between py-4 px-4 text-left font-medium transition-all hover:bg-muted/50 text-foreground", style: textStyle, children: [_jsx("span", { children: item.title }), _jsx(ChevronDown, { className: cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180') })] }), _jsx("div", { className: cn('overflow-hidden transition-all duration-200', isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'), children: _jsx("div", { className: "px-4 pb-4 text-muted-foreground", style: textColorCSS ? { color: textColorCSS } : undefined, children: item.content }) })] }));
}
// Main Accordion Render Component
function AccordionRenderer({ items, allowMultiple, textColor, margin, background, dimensions, transform, animation, customPadding, }) {
    // Initialize open states from defaultOpen values
    const [openItems, setOpenItems] = useState(() => {
        const initialOpen = new Set();
        items?.forEach((item, index) => {
            if (item.defaultOpen) {
                initialOpen.add(index);
            }
        });
        return initialOpen;
    });
    const handleToggle = (index) => {
        setOpenItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            }
            else {
                if (!allowMultiple) {
                    newSet.clear();
                }
                newSet.add(index);
            }
            return newSet;
        });
    };
    const textColorCSS = colorValueToCSS(textColor);
    const dimensionsStyles = dimensionsValueToCSS(dimensions);
    // Theme-aware classes - uses CSS variables for colors
    const accordionClasses = 'rounded-lg border border-border overflow-hidden bg-card';
    const backgroundStyles = backgroundValueToCSS(background);
    // Only apply background styles if explicitly set, otherwise let bg-card handle it
    const accordionStyle = backgroundStyles && Object.keys(backgroundStyles).length > 0
        ? backgroundStyles
        : {};
    const style = {
        ...dimensionsStyles,
    };
    const marginCSS = marginValueToCSS(margin);
    if (marginCSS) {
        style.margin = marginCSS;
    }
    const paddingCSS = paddingValueToCSS(customPadding);
    if (paddingCSS) {
        style.padding = paddingCSS;
    }
    const transformStyles = transformValueToCSS(transform);
    if (transformStyles) {
        Object.assign(style, transformStyles);
    }
    if (!items || items.length === 0) {
        return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("div", { style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: accordionClasses, style: accordionStyle, children: _jsx("div", { className: "p-4 text-center text-muted-foreground", children: "No accordion items. Add items in the editor." }) }) }) }));
    }
    return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("div", { style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: accordionClasses, style: accordionStyle, children: items.map((item, index) => (_jsx(AccordionItem, { item: item, isOpen: openItems.has(index), onToggle: () => handleToggle(index), textColorCSS: textColorCSS }, index))) }) }) }));
}
// Default padding with standard horizontal spacing (replaces hardcoded px-4)
const DEFAULT_PADDING = {
    top: 0,
    right: 16,
    bottom: 0,
    left: 16,
    unit: 'px',
    linked: false,
};
const defaultProps = {
    items: [
        {
            title: 'What is this?',
            content: 'This is an accordion component that can expand and collapse.',
            defaultOpen: false,
        },
        {
            title: 'How do I use it?',
            content: 'Click on each item to expand or collapse it.',
            defaultOpen: false,
        },
    ],
    allowMultiple: false,
    textColor: null,
    margin: null,
    background: null,
    dimensions: null,
    transform: null,
    animation: null,
    customPadding: DEFAULT_PADDING, // Default 16px horizontal padding, visible in editor
};
export const AccordionConfig = {
    label: 'Accordion',
    fields: {
        _reset: createResetField({ defaultProps }),
        items: {
            type: 'array',
            label: 'Items',
            arrayFields: {
                title: {
                    type: 'text',
                    label: 'Title',
                },
                content: {
                    type: 'textarea',
                    label: 'Content',
                },
                defaultOpen: {
                    type: 'radio',
                    label: 'Default Open',
                    options: [
                        { label: 'Yes', value: true },
                        { label: 'No', value: false },
                    ],
                },
            },
            defaultItemProps: (index) => ({
                title: `Accordion Item ${index + 1}`,
                content: '',
                defaultOpen: index === 0,
            }),
            getItemSummary: (item) => item.title || 'Untitled',
        },
        allowMultiple: {
            type: 'radio',
            label: 'Allow Multiple Open',
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
            ],
        },
        textColor: createColorPickerField({ label: 'Text Color' }),
        background: createBackgroundField({ label: 'Background' }),
        dimensions: createDimensionsField({ label: 'Dimensions' }),
        transform: createTransformField({ label: 'Transform' }),
        animation: createAnimationField({ label: 'Animation' }),
        // Spacing (grouped at bottom)
        margin: createMarginField({ label: 'Margin' }),
        customPadding: createPaddingField({ label: 'Padding' }),
    },
    defaultProps,
    render: (props) => (_jsx(AccordionRenderer, { items: props.items, allowMultiple: props.allowMultiple, textColor: props.textColor, margin: props.margin, background: props.background, dimensions: props.dimensions, transform: props.transform, animation: props.animation, customPadding: props.customPadding })),
};
//# sourceMappingURL=Accordion.js.map