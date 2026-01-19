import { jsx as _jsx } from "react/jsx-runtime";
import parse from 'html-react-parser';
import { cn, marginValueToCSS, paddingValueToCSS, dimensionsValueToCSS, colorValueToCSS, alignmentMap, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
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
    content: '<p>Enter your content here...</p>',
    alignment: null,
    textColor: null,
    dimensions: null,
    animation: null,
    margin: null,
    customPadding: DEFAULT_PADDING, // Default 16px horizontal padding
};
export const RichTextConfig = {
    label: 'Rich Text',
    defaultProps,
    render: ({ content, alignment, textColor, dimensions, animation, margin, customPadding }) => {
        const dimensionsStyles = dimensions ? dimensionsValueToCSS(dimensions) : undefined;
        const style = {
            ...dimensionsStyles,
        };
        const marginCSS = marginValueToCSS(margin);
        if (marginCSS) {
            style.margin = marginCSS;
        }
        const customPaddingCSS = paddingValueToCSS(customPadding);
        if (customPaddingCSS) {
            style.padding = customPaddingCSS;
        }
        // Apply text color from ColorValue
        const colorCSS = colorValueToCSS(textColor);
        if (colorCSS) {
            style.color = colorCSS;
        }
        const alignmentValue = alignment ?? 'left';
        const alignmentClass = alignmentMap[alignmentValue] || alignmentMap.left;
        // Handle empty content - check for null/undefined or empty string
        const isEmpty = !content || (typeof content === 'string' && (content === '' || content === '<p></p>'));
        // Parse HTML strings to React elements, pass through React elements as-is
        const renderedContent = isEmpty
            ? _jsx("p", { children: _jsx("em", { children: "No content available" }) })
            : typeof content === 'string'
                ? parse(content)
                : content;
        return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("section", { className: cn('relative overflow-hidden', alignmentClass), style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: "prose dark:prose-invert max-w-none", children: renderedContent }) }) }));
    },
};
//# sourceMappingURL=RichText.server.js.map