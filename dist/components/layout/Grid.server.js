import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn, dimensionsValueToCSS, marginValueToCSS, paddingValueToCSS, borderValueToCSS, backgroundValueToCSS, responsiveValueToCSS, visibilityValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
// Simple ID generator for server-side rendering
let idCounter = 0;
function generateUniqueId() {
    return `g${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
const defaultProps = {
    content: [],
    semanticElement: 'div',
    numColumns: 3,
    gap: 24,
    background: null,
    customPadding: null,
    dimensions: null,
    border: null,
    margin: null,
    animation: null,
    visibility: null,
};
export const GridConfig = {
    label: 'Grid',
    fields: {
        content: { type: 'slot' },
    },
    defaultProps,
    render: ({ content: Content, semanticElement = 'div', numColumns, gap, background, customPadding, dimensions, border, margin, animation, visibility, }) => {
        // Dynamic element based on semanticElement prop
        const Wrapper = semanticElement;
        // Generate unique IDs for CSS targeting (server-safe)
        const uniqueId = generateUniqueId();
        const wrapperClass = `puck-grid-${uniqueId}`;
        const contentClass = `puck-grid-content-${uniqueId}`;
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
        // Add margin with responsive support
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
        // Tailwind classes for responsive grid: flex column on mobile, grid on md+
        const contentClasses = cn('flex flex-col w-full', 'md:grid', contentClass);
        // Dynamic styles that need inline (user-controlled values: gap, columns)
        const contentStyles = {
            gap,
            ...dimensionsResult.baseStyles,
        };
        if (dimensionsResult.mediaQueryCSS) {
            mediaQueries.push(dimensionsResult.mediaQueryCSS);
        }
        // Grid template columns must be inline since numColumns is dynamic
        const gridStyles = {
            ...contentStyles,
            '--grid-cols': numColumns,
        };
        // Combine all media queries
        const allMediaQueryCSS = mediaQueries.join('\n');
        // Type assertion for Puck slot content - cast to any to avoid complex React type issues
        const ContentSlot = Content;
        return (_jsxs(AnimatedWrapper, { animation: animation, children: [allMediaQueryCSS && _jsx("style", { children: allMediaQueryCSS }), _jsxs(Wrapper, { className: wrapperClass, style: wrapperStyles, children: [_jsx(ContentSlot, { className: contentClasses, style: gridStyles }), _jsx("style", { children: `
            @media (min-width: 768px) {
              .flex.md\\:grid {
                grid-template-columns: repeat(var(--grid-cols), 1fr);
              }
            }
          ` })] })] }));
    },
};
//# sourceMappingURL=Grid.server.js.map