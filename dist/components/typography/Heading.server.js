import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Heading Component - Server-Safe Puck Configuration
 *
 * H1-H6 headings with customizable styling.
 * This version excludes field definitions for server-side rendering.
 */
import { createElement } from 'react';
import { headingLevelMap, alignmentMap, cn, marginValueToCSS, paddingValueToCSS, colorValueToCSS, dimensionsValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
const defaultProps = {
    text: 'Heading Text',
    level: 'h2',
    alignment: null,
    textColor: null,
    dimensions: null,
    animation: null,
    margin: null,
    customPadding: null,
};
export const HeadingConfig = {
    label: 'Heading',
    defaultProps,
    render: ({ text, level, alignment, textColor, dimensions, animation, margin, customPadding }) => {
        const tag = level || 'h2';
        const alignmentValue = alignment ?? 'left';
        const classes = cn(headingLevelMap[level] || headingLevelMap.h2, alignmentMap[alignmentValue] || alignmentMap.left);
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
        const headingElement = createElement(tag, { className: classes, style: Object.keys(style).length > 0 ? style : undefined }, text);
        return (_jsx(AnimatedWrapper, { animation: animation, children: headingElement }));
    },
};
//# sourceMappingURL=Heading.server.js.map