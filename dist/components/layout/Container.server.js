import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dimensionsValueToCSS, borderValueToCSS, paddingValueToCSS, marginValueToCSS, backgroundValueToCSS, responsiveValueToCSS, visibilityValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
// Simple ID generator for server-side rendering
let idCounter = 0;
function generateUniqueId() {
    return `c${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
const defaultProps = {
    content: [],
    semanticElement: 'div',
    visibility: null,
    dimensions: null,
    background: null,
    border: null,
    padding: null,
    margin: null,
    animation: null,
};
export const ContainerConfig = {
    label: 'Container',
    fields: {
        content: { type: 'slot' },
    },
    defaultProps,
    render: ({ content: Content, semanticElement = 'div', visibility, dimensions, background, border, padding, margin, animation, }) => {
        // Dynamic element based on semanticElement prop
        const Wrapper = semanticElement;
        // Generate unique ID for CSS targeting (server-safe)
        const uniqueId = generateUniqueId();
        const containerClass = `puck-container-${uniqueId}`;
        // Collect all media query CSS
        const mediaQueries = [];
        // Build container styles
        const containerStyles = {};
        // Background
        const backgroundStyles = backgroundValueToCSS(background);
        if (backgroundStyles) {
            Object.assign(containerStyles, backgroundStyles);
        }
        // Border
        const borderStyles = borderValueToCSS(border);
        if (borderStyles) {
            Object.assign(containerStyles, borderStyles);
        }
        // Dimensions with responsive support
        const dimensionsResult = responsiveValueToCSS(dimensions, dimensionsValueToCSS, containerClass);
        Object.assign(containerStyles, dimensionsResult.baseStyles);
        if (dimensionsResult.mediaQueryCSS) {
            mediaQueries.push(dimensionsResult.mediaQueryCSS);
        }
        // Check if minHeight is set - if so, we need flex layout to make slot expand
        const hasMinHeight = (() => {
            if (!dimensions)
                return false;
            // Check if it's a responsive value
            if (typeof dimensions === 'object' && 'xs' in dimensions) {
                const responsiveDims = dimensions;
                return Object.values(responsiveDims).some((v) => {
                    if (!v || typeof v !== 'object')
                        return false;
                    const dim = v;
                    return dim.minHeight?.enabled && dim.minHeight?.value > 0;
                });
            }
            // Non-responsive value
            const dim = dimensions;
            return dim.minHeight?.enabled && dim.minHeight?.value > 0;
        })();
        // Add flex layout when minHeight is set to make content stretch
        if (hasMinHeight) {
            containerStyles.display = 'flex';
            containerStyles.flexDirection = 'column';
        }
        // Padding with responsive support
        const paddingResult = responsiveValueToCSS(padding, (v) => ({ padding: paddingValueToCSS(v) }), containerClass);
        Object.assign(containerStyles, paddingResult.baseStyles);
        if (paddingResult.mediaQueryCSS) {
            mediaQueries.push(paddingResult.mediaQueryCSS);
        }
        // Margin with responsive support
        const marginResult = responsiveValueToCSS(margin, (v) => ({ margin: marginValueToCSS(v) }), containerClass);
        Object.assign(containerStyles, marginResult.baseStyles);
        if (marginResult.mediaQueryCSS) {
            mediaQueries.push(marginResult.mediaQueryCSS);
        }
        // Visibility media queries
        const visibilityCSS = visibilityValueToCSS(visibility, containerClass);
        if (visibilityCSS) {
            mediaQueries.push(visibilityCSS);
        }
        // Combine all media queries
        const allMediaQueryCSS = mediaQueries.join('\n');
        // Check if we have any styling
        const hasStyles = Object.keys(containerStyles).length > 0;
        // Type assertion for Puck slot content
        const ContentSlot = Content;
        // When minHeight is set, wrap Content to ensure slot expands
        const renderContent = () => {
            if (hasMinHeight) {
                return (_jsx("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }, children: _jsx(ContentSlot, { style: { flex: 1 } }) }));
            }
            return _jsx(ContentSlot, {});
        };
        return (_jsxs(AnimatedWrapper, { animation: animation, children: [allMediaQueryCSS && _jsx("style", { children: allMediaQueryCSS }), hasStyles ? (_jsx(Wrapper, { className: containerClass, style: containerStyles, children: renderContent() })) : (_jsx(ContentSlot, { className: containerClass }))] }));
    },
};
//# sourceMappingURL=Container.server.js.map