import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn, dimensionsValueToCSS, marginValueToCSS, paddingValueToCSS, borderValueToCSS, backgroundValueToCSS, responsiveValueToCSS, visibilityValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
// Simple ID generator for server-side rendering
let idCounter = 0;
function generateUniqueId() {
    return `s${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
// Default section padding - standard vertical spacing for sections
const DEFAULT_SECTION_PADDING = {
    top: 48,
    right: 0,
    bottom: 48,
    left: 0,
    unit: 'px',
    linked: false,
};
// Default content dimensions - 1200px max-width centered
const DEFAULT_CONTENT_DIMENSIONS = {
    mode: 'contained',
    alignment: 'center',
    maxWidth: { value: 1200, unit: 'px', enabled: true },
};
// Default content padding with standard horizontal spacing
const DEFAULT_CONTENT_PADDING = {
    top: 0,
    right: 16,
    bottom: 0,
    left: 16,
    unit: 'px',
    linked: false,
};
const defaultProps = {
    id: '',
    content: [],
    semanticElement: 'section',
    // Section layer defaults - padding gives sections proper spacing
    sectionBackground: null,
    sectionBorder: null,
    sectionPadding: { xs: DEFAULT_SECTION_PADDING },
    sectionMargin: null,
    // Content layer defaults - 1200px max-width so two-layer design is immediately visible
    contentDimensions: { xs: DEFAULT_CONTENT_DIMENSIONS },
    contentBackground: null,
    contentBorder: null,
    contentPadding: { xs: DEFAULT_CONTENT_PADDING },
    // Other
    animation: null,
    visibility: null,
};
export const SectionConfig = {
    label: 'Section',
    fields: {
        content: { type: 'slot' },
    },
    defaultProps,
    render: ({ id, content: Content, semanticElement = 'section', sectionBackground, sectionBorder, sectionPadding, sectionMargin, contentDimensions, contentBackground, contentBorder, contentPadding, animation, visibility, }) => {
        // Dynamic element based on semanticElement prop
        const Wrapper = semanticElement;
        // Generate unique IDs for CSS targeting (server-safe)
        const uniqueId = generateUniqueId();
        const sectionClass = `puck-section-${uniqueId}`;
        const contentClass = `puck-section-content-${uniqueId}`;
        // Collect all media query CSS
        const mediaQueries = [];
        // === Section layer styles (outer, full-width) ===
        const sectionBackgroundStyles = backgroundValueToCSS(sectionBackground);
        const sectionStyles = {
            ...sectionBackgroundStyles,
        };
        // Section border
        const sectionBorderStyles = borderValueToCSS(sectionBorder);
        if (sectionBorderStyles) {
            Object.assign(sectionStyles, sectionBorderStyles);
        }
        // Section padding with responsive support
        const sectionPaddingResult = responsiveValueToCSS(sectionPadding, (v) => ({ padding: paddingValueToCSS(v) }), sectionClass);
        Object.assign(sectionStyles, sectionPaddingResult.baseStyles);
        if (sectionPaddingResult.mediaQueryCSS) {
            mediaQueries.push(sectionPaddingResult.mediaQueryCSS);
        }
        // Section margin with responsive support
        const sectionMarginResult = responsiveValueToCSS(sectionMargin, (v) => ({ margin: marginValueToCSS(v) }), sectionClass);
        Object.assign(sectionStyles, sectionMarginResult.baseStyles);
        if (sectionMarginResult.mediaQueryCSS) {
            mediaQueries.push(sectionMarginResult.mediaQueryCSS);
        }
        // Visibility media queries
        const visibilityCSS = visibilityValueToCSS(visibility, sectionClass);
        if (visibilityCSS) {
            mediaQueries.push(visibilityCSS);
        }
        // === Content layer styles (inner, constrained) ===
        const contentBackgroundStyles = backgroundValueToCSS(contentBackground);
        const contentStyles = {
            ...contentBackgroundStyles,
        };
        // Content dimensions with responsive support
        const contentDimensionsResult = responsiveValueToCSS(contentDimensions, dimensionsValueToCSS, contentClass);
        Object.assign(contentStyles, contentDimensionsResult.baseStyles);
        if (contentDimensionsResult.mediaQueryCSS) {
            mediaQueries.push(contentDimensionsResult.mediaQueryCSS);
        }
        // Check if minHeight is set - if so, we need flex layout to make slot expand
        const hasMinHeight = (() => {
            if (!contentDimensions)
                return false;
            // Check if it's a responsive value
            if (typeof contentDimensions === 'object' && 'xs' in contentDimensions) {
                const responsiveDims = contentDimensions;
                return Object.values(responsiveDims).some((v) => {
                    if (!v || typeof v !== 'object')
                        return false;
                    const dim = v;
                    return dim.minHeight?.enabled && dim.minHeight?.value > 0;
                });
            }
            // Non-responsive value
            const dim = contentDimensions;
            return dim.minHeight?.enabled && dim.minHeight?.value > 0;
        })();
        // Add flex layout when minHeight is set to make content stretch
        if (hasMinHeight) {
            contentStyles.display = 'flex';
            contentStyles.flexDirection = 'column';
        }
        // Content border
        const contentBorderStyles = borderValueToCSS(contentBorder);
        if (contentBorderStyles) {
            Object.assign(contentStyles, contentBorderStyles);
        }
        // Content padding with responsive support
        const contentPaddingResult = responsiveValueToCSS(contentPadding, (v) => ({ padding: paddingValueToCSS(v) }), contentClass);
        Object.assign(contentStyles, contentPaddingResult.baseStyles);
        if (contentPaddingResult.mediaQueryCSS) {
            mediaQueries.push(contentPaddingResult.mediaQueryCSS);
        }
        const sectionClasses = cn('relative w-full', sectionClass);
        const contentClasses = cn('relative z-10', contentClass);
        // Check if we have any content styling
        const hasContentStyles = Object.keys(contentStyles).length > 0;
        // Combine all media queries
        const allMediaQueryCSS = mediaQueries.join('\n');
        // Type assertion for Puck slot content
        const ContentSlot = Content;
        // When minHeight is set, wrap Content to ensure slot expands
        const renderContent = () => {
            if (hasMinHeight) {
                return (_jsx("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }, children: _jsx(ContentSlot, { style: { flex: 1 } }) }));
            }
            return _jsx(ContentSlot, {});
        };
        return (_jsxs(AnimatedWrapper, { animation: animation, children: [allMediaQueryCSS && _jsx("style", { children: allMediaQueryCSS }), _jsx(Wrapper, { id: id || undefined, className: sectionClasses, style: sectionStyles, children: hasContentStyles ? (_jsx("div", { className: contentClasses, style: contentStyles, children: renderContent() })) : (_jsx(ContentSlot, { className: contentClasses })) })] }));
    },
};
//# sourceMappingURL=Section.server.js.map