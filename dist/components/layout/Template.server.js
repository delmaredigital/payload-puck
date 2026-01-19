import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn, dimensionsValueToCSS, marginValueToCSS, paddingValueToCSS, responsiveValueToCSS, visibilityValueToCSS, } from '../../fields/shared';
// Simple ID generator for server-side rendering
let idCounter = 0;
function generateUniqueId() {
    return `t${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
// =============================================================================
// Default Props
// =============================================================================
const defaultProps = {
    content: [],
    templateId: null,
    dimensions: null,
    customPadding: null,
    margin: null,
    visibility: null,
};
// =============================================================================
// Component Configuration (Server-safe)
// =============================================================================
export const TemplateServerConfig = {
    label: 'Template',
    fields: {
        // In server config, templateId is just for reference (no loading UI)
        templateId: {
            type: 'text',
            label: 'Template ID',
        },
        content: {
            type: 'slot',
        },
    },
    defaultProps,
    render: ({ content: Content, dimensions, customPadding, margin, visibility }) => {
        // Generate unique IDs for CSS targeting (server-safe)
        const uniqueId = generateUniqueId();
        const wrapperClass = `puck-template-${uniqueId}`;
        const contentClass = `puck-template-content-${uniqueId}`;
        // Collect all media query CSS
        const mediaQueries = [];
        // Build wrapper styles
        const wrapperStyles = {};
        // Add padding with responsive support
        const paddingResult = responsiveValueToCSS(customPadding, (v) => ({ padding: paddingValueToCSS(v) }), wrapperClass);
        Object.assign(wrapperStyles, paddingResult.baseStyles);
        if (paddingResult.mediaQueryCSS) {
            mediaQueries.push(paddingResult.mediaQueryCSS);
        }
        // Add margin with responsive support
        const marginResult = responsiveValueToCSS(margin, (v) => ({ margin: marginValueToCSS(v) }), wrapperClass);
        Object.assign(wrapperStyles, marginResult.baseStyles);
        if (marginResult.mediaQueryCSS) {
            mediaQueries.push(marginResult.mediaQueryCSS);
        }
        // Visibility media queries
        const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass);
        if (visibilityCSS) {
            mediaQueries.push(visibilityCSS);
        }
        // Use dimensions with responsive support
        const dimensionsResult = responsiveValueToCSS(dimensions, dimensionsValueToCSS, contentClass);
        if (dimensionsResult.mediaQueryCSS) {
            mediaQueries.push(dimensionsResult.mediaQueryCSS);
        }
        // Combine all media queries
        const allMediaQueryCSS = mediaQueries.join('\n');
        // Type assertion for Puck slot content
        const ContentSlot = Content;
        // Content is a slot component that Puck provides
        // It renders all the nested components within this template
        return (_jsxs(_Fragment, { children: [allMediaQueryCSS && _jsx("style", { children: allMediaQueryCSS }), _jsx("div", { className: cn('template-wrapper', wrapperClass), style: Object.keys(wrapperStyles).length > 0 ? wrapperStyles : undefined, children: _jsx(ContentSlot, { className: contentClass, style: dimensionsResult.baseStyles }) })] }));
    },
};
//# sourceMappingURL=Template.server.js.map