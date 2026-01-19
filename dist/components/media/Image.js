import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Image Component - Puck Configuration
 *
 * Standalone image block with optional link wrapper.
 * Server-safe version using standard HTML img element.
 *
 * Responsive Controls:
 * - visibility: Show/hide at different breakpoints
 */
import { useId } from 'react';
import { aspectRatioField, aspectRatioMap, cn, marginValueToCSS, paddingValueToCSS, dimensionsValueToCSS, borderValueToCSS, transformValueToCSS, visibilityValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
import { createMarginField } from '../../fields/MarginField';
import { createPaddingField } from '../../fields/PaddingField';
import { createDimensionsField } from '../../fields/DimensionsField';
import { createBorderField } from '../../fields/BorderField';
import { createMediaField } from '../../fields/MediaField';
import { createAlignmentField } from '../../fields/AlignmentField';
import { createAnimationField } from '../../fields/AnimationField';
import { createTransformField } from '../../fields/TransformField';
import { createResetField } from '../../fields/ResetField';
import { createResponsiveVisibilityField } from '../../fields/ResponsiveVisibilityField';
// Default padding with standard spacing (replaces hardcoded py-4 px-4)
const DEFAULT_PADDING = {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
    unit: 'px',
    linked: true,
};
const defaultProps = {
    image: null,
    alt: '',
    aspectRatio: 'auto',
    link: '',
    openInNewTab: false,
    margin: null,
    border: null,
    dimensions: null,
    alignment: null,
    transform: null,
    animation: null,
    customPadding: DEFAULT_PADDING, // Default 16px padding, visible in editor
    visibility: null,
};
export const ImageConfig = {
    label: 'Image',
    fields: {
        _reset: createResetField({ defaultProps }),
        image: createMediaField({ label: 'Image' }),
        alt: {
            type: 'text',
            label: 'Alt Text Override',
        },
        // Responsive visibility control
        visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
        aspectRatio: aspectRatioField,
        link: {
            type: 'text',
            label: 'Link URL',
        },
        openInNewTab: {
            type: 'radio',
            label: 'Open in New Tab',
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
            ],
        },
        border: createBorderField({ label: 'Border' }),
        dimensions: createDimensionsField({ label: 'Dimensions' }),
        alignment: createAlignmentField({ label: 'Alignment', defaultValue: 'center' }),
        transform: createTransformField({ label: 'Transform' }),
        animation: createAnimationField({ label: 'Animation' }),
        // Spacing (grouped at bottom)
        margin: createMarginField({ label: 'Margin' }),
        customPadding: createPaddingField({ label: 'Padding' }),
    },
    defaultProps,
    render: ({ image, alt, aspectRatio, link, openInNewTab, dimensions, alignment, margin, border, transform, animation, customPadding, visibility }) => {
        // Generate unique ID for CSS targeting
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const uniqueId = useId().replace(/:/g, '');
        const wrapperClass = `puck-image-${uniqueId}`;
        // Visibility media queries
        const visibilityCSS = visibilityValueToCSS(visibility, wrapperClass);
        const dimensionsStyles = dimensionsValueToCSS(dimensions);
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
        const borderStyles = borderValueToCSS(border);
        if (borderStyles) {
            Object.assign(style, borderStyles);
        }
        const transformStyles = transformValueToCSS(transform);
        if (transformStyles) {
            Object.assign(style, transformStyles);
        }
        const alignmentValue = alignment ?? 'center';
        const alignmentClasses = cn('flex', alignmentValue === 'left' && 'justify-start', alignmentValue === 'center' && 'justify-center', alignmentValue === 'right' && 'justify-end');
        // Placeholder if no image
        if (!image?.url) {
            return (_jsxs(AnimatedWrapper, { animation: animation, children: [visibilityCSS && _jsx("style", { children: visibilityCSS }), _jsx("div", { className: wrapperClass, style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: alignmentClasses, children: _jsx("div", { className: cn('relative overflow-hidden rounded-lg w-full max-w-md bg-muted flex items-center justify-center min-h-[200px]', aspectRatioMap[aspectRatio] || ''), children: _jsx("span", { className: "text-muted-foreground", children: "No image selected" }) }) }) })] }));
        }
        // For auto aspect ratio, use natural image dimensions
        // For fixed aspect ratios, use absolute positioning within aspect-ratio container
        // Note: When using aspect ratios in Flex, set a min-width via Dimensions
        const imageElement = aspectRatio === 'auto' ? (_jsx("div", { className: "relative overflow-hidden rounded-lg w-full", children: _jsx("img", { src: image.url, alt: alt || image.alt || '', className: "w-full h-auto object-cover" }) })) : (_jsx("div", { className: cn('relative overflow-hidden rounded-lg w-full', aspectRatioMap[aspectRatio]), children: _jsx("img", { src: image.url, alt: alt || image.alt || '', className: "absolute inset-0 w-full h-full object-cover" }) }));
        const content = link ? (_jsx("a", { href: link, target: openInNewTab ? '_blank' : undefined, rel: openInNewTab ? 'noopener noreferrer' : undefined, className: "block transition-opacity hover:opacity-90", children: imageElement })) : (imageElement);
        return (_jsxs(AnimatedWrapper, { animation: animation, children: [visibilityCSS && _jsx("style", { children: visibilityCSS }), _jsx("div", { className: wrapperClass, style: Object.keys(style).length > 0 ? style : undefined, children: _jsx("div", { className: alignmentClasses, children: content }) })] }));
    },
};
//# sourceMappingURL=Image.js.map