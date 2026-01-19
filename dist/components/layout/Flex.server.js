import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn, dimensionsValueToCSS, marginValueToCSS, paddingValueToCSS, borderValueToCSS, backgroundValueToCSS, responsiveValueToCSS, visibilityValueToCSS, justifyContentMap, alignItemsMap, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
// Simple ID generator for server-side rendering
let idCounter = 0;
function generateUniqueId() {
    return `f${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
// Tailwind class mappings for flex properties
const flexDirectionMap = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
};
const flexWrapMap = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
};
const defaultProps = {
    content: [],
    semanticElement: 'div',
    direction: 'row',
    justifyContent: null,
    alignItems: null,
    gap: 24,
    wrap: 'wrap',
    background: null,
    customPadding: null,
    margin: null,
    dimensions: null,
    border: null,
    animation: null,
    visibility: null,
};
export const FlexConfig = {
    label: 'Flex',
    fields: {
        content: { type: 'slot' },
    },
    defaultProps,
    render: ({ content: Content, semanticElement = 'div', direction, justifyContent, alignItems, gap, wrap, background, customPadding, margin, dimensions, border, animation, visibility, }) => {
        // Dynamic element based on semanticElement prop
        const Wrapper = semanticElement;
        // Generate unique IDs for CSS targeting (server-safe)
        const uniqueId = generateUniqueId();
        const wrapperClass = `puck-flex-${uniqueId}`;
        const contentClass = `puck-flex-content-${uniqueId}`;
        // Collect all media query CSS
        const mediaQueries = [];
        // Generate styles from BackgroundValue
        const backgroundStyles = backgroundValueToCSS(background);
        // Build wrapper styles
        const wrapperStyles = {
            ...backgroundStyles,
        };
        // Add padding with responsive support
        const paddingResult = responsiveValueToCSS(customPadding, (v) => ({ padding: paddingValueToCSS(v) }), wrapperClass);
        Object.assign(wrapperStyles, paddingResult.baseStyles);
        if (paddingResult.mediaQueryCSS) {
            mediaQueries.push(paddingResult.mediaQueryCSS);
        }
        // Add border if set
        const borderStyles = borderValueToCSS(border);
        if (borderStyles) {
            Object.assign(wrapperStyles, borderStyles);
        }
        // Apply margin with responsive support
        const marginResult = responsiveValueToCSS(margin, (v) => ({ margin: marginValueToCSS(v) }), wrapperClass);
        Object.assign(wrapperStyles, marginResult.baseStyles);
        if (marginResult.mediaQueryCSS) {
            mediaQueries.push(marginResult.mediaQueryCSS);
        }
        // Use dimensions with responsive support
        const dimensionsResult = responsiveValueToCSS(dimensions, dimensionsValueToCSS, contentClass);
        // Visibility media queries
        const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass);
        if (visibilityCSS) {
            mediaQueries.push(visibilityCSS);
        }
        // Build Tailwind classes for flex layout
        // [&>*]:min-w-0 prevents flex children from overflowing (CSS best practice)
        const contentClasses = cn('flex w-full min-h-[50px]', flexDirectionMap[direction], justifyContent && justifyContentMap[justifyContent], alignItems && alignItemsMap[alignItems], flexWrapMap[wrap], '[&>*]:min-w-0', contentClass);
        // Dynamic styles that need inline (user-controlled values)
        const contentStyles = {
            gap,
            ...dimensionsResult.baseStyles,
        };
        if (dimensionsResult.mediaQueryCSS) {
            mediaQueries.push(dimensionsResult.mediaQueryCSS);
        }
        // Combine all media queries
        const allMediaQueryCSS = mediaQueries.join('\n');
        // Type assertion for Puck slot content - cast to any to avoid complex React type issues
        const ContentSlot = Content;
        return (_jsxs(AnimatedWrapper, { animation: animation, children: [allMediaQueryCSS && _jsx("style", { children: allMediaQueryCSS }), _jsx(Wrapper, { className: wrapperClass, style: wrapperStyles, children: _jsx(ContentSlot, { className: contentClasses, style: contentStyles }) })] }));
    },
};
//# sourceMappingURL=Flex.server.js.map