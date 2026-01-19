import { jsx as _jsx } from "react/jsx-runtime";
import { textSizeMap, alignmentMap, cn, marginValueToCSS, paddingValueToCSS, colorValueToCSS, dimensionsValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
const defaultProps = {
    content: 'Enter your text here...',
    size: 'base',
    alignment: null,
    textColor: null,
    dimensions: null,
    animation: null,
    margin: null,
    customPadding: null,
};
export const TextConfig = {
    label: 'Text',
    defaultProps,
    render: ({ content, size, alignment, textColor, dimensions, animation, margin, customPadding }) => {
        const dimensionsStyles = dimensions ? dimensionsValueToCSS(dimensions) : undefined;
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
        // Apply text color from ColorValue
        const colorCSS = colorValueToCSS(textColor);
        if (colorCSS) {
            style.color = colorCSS;
        }
        const alignmentValue = alignment ?? 'left';
        return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("p", { className: cn(textSizeMap[size] || textSizeMap.base, alignmentMap[alignmentValue] || alignmentMap.left), style: Object.keys(style).length > 0 ? style : undefined, children: content }) }));
    },
};
//# sourceMappingURL=Text.server.js.map