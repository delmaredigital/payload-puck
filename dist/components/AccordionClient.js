'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AccordionClient - Client component for accordion interactivity
 *
 * This is the actual interactive accordion that uses useState.
 * Imported by the server-safe AccordionConfig to enable client-side expansion.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { marginValueToCSS, paddingValueToCSS, dimensionsValueToCSS, backgroundValueToCSS, transformValueToCSS, colorValueToCSS, cn, } from '../fields/shared';
import { AnimatedWrapper } from './AnimatedWrapper';
// Accordion Item Component
function AccordionItem({ item, isOpen, onToggle, textColorCSS, }) {
    const textStyle = textColorCSS ? { color: textColorCSS } : {};
    return (_jsxs("div", { className: "border-b border-border last:border-b-0", children: [_jsxs("button", { type: "button", onClick: onToggle, className: "flex w-full items-center justify-between py-4 px-4 text-left font-medium transition-all hover:bg-muted/50 text-foreground", style: textStyle, children: [_jsx("span", { children: item.title }), _jsx(ChevronDown, { className: cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180') })] }), _jsx("div", { className: cn('overflow-hidden transition-all duration-200', isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'), children: _jsx("div", { className: "px-4 pb-4 text-muted-foreground", style: textColorCSS ? { color: textColorCSS } : undefined, children: item.content }) })] }));
}
export function AccordionClient({ items, allowMultiple, textColor, margin, background, dimensions, transform, animation, customPadding, }) {
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
    const marginCSS = marginValueToCSS(margin);
    const paddingCSS = paddingValueToCSS(customPadding);
    const transformStyles = transformValueToCSS(transform);
    const style = {
        ...dimensionsStyles,
        ...(marginCSS ? { margin: marginCSS } : {}),
        ...(paddingCSS ? { padding: paddingCSS } : {}),
        ...transformStyles,
    };
    if (!items || items.length === 0) {
        return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("div", { style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: accordionClasses, style: accordionStyle, children: _jsx("div", { className: "p-4 text-center text-muted-foreground", children: "No accordion items. Add items in the editor." }) }) }) }));
    }
    return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("div", { style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: accordionClasses, style: accordionStyle, children: items.map((item, index) => (_jsx(AccordionItem, { item: item, isOpen: openItems.has(index), onToggle: () => handleToggle(index), textColorCSS: textColorCSS }, index))) }) }) }));
}
//# sourceMappingURL=AccordionClient.js.map