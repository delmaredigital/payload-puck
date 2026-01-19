import { jsx as _jsx } from "react/jsx-runtime";
import { dividerStyleField, dividerStyleMap, cn, marginValueToCSS, paddingValueToCSS, colorValueToCSS, dimensionsValueToCSS, transformValueToCSS, } from '../../fields/shared';
import { AnimatedWrapper } from '../AnimatedWrapper';
import { createMarginField } from '../../fields/MarginField';
import { createPaddingField } from '../../fields/PaddingField';
import { createColorPickerField } from '../../fields/ColorPickerField';
import { createDimensionsField } from '../../fields/DimensionsField';
import { createAnimationField } from '../../fields/AnimationField';
import { createTransformField } from '../../fields/TransformField';
import { createResetField } from '../../fields/ResetField';
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
    style: 'solid',
    color: null,
    margin: null,
    dimensions: null,
    transform: null,
    animation: null,
    customPadding: DEFAULT_PADDING, // Default 16px horizontal padding, visible in editor
};
export const DividerConfig = {
    label: 'Divider',
    fields: {
        _reset: createResetField({ defaultProps }),
        style: dividerStyleField,
        color: createColorPickerField({ label: 'Color' }),
        dimensions: createDimensionsField({ label: 'Dimensions' }),
        transform: createTransformField({ label: 'Transform' }),
        animation: createAnimationField({ label: 'Animation' }),
        // Spacing (grouped at bottom)
        margin: createMarginField({ label: 'Margin' }),
        customPadding: createPaddingField({ label: 'Padding' }),
    },
    defaultProps,
    render: ({ style, color, dimensions, margin, transform, animation, customPadding }) => {
        const dimensionsStyles = dimensionsValueToCSS(dimensions);
        const wrapperStyle = {
            ...dimensionsStyles,
        };
        const marginCSS = marginValueToCSS(margin);
        if (marginCSS) {
            wrapperStyle.margin = marginCSS;
        }
        const paddingCSS = paddingValueToCSS(customPadding);
        if (paddingCSS) {
            wrapperStyle.padding = paddingCSS;
        }
        const transformStyles = transformValueToCSS(transform);
        if (transformStyles) {
            Object.assign(wrapperStyle, transformStyles);
        }
        // Only set color if explicitly provided, otherwise use CSS variable
        const customColor = colorValueToCSS(color);
        const hrStyle = customColor
            ? { borderColor: customColor }
            : undefined;
        return (_jsx(AnimatedWrapper, { animation: animation, children: _jsx("div", { style: Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined, children: _jsx("hr", { className: cn('border-t border-border', dividerStyleMap[style] || dividerStyleMap.solid), style: hrStyle }) }) }));
    },
};
//# sourceMappingURL=Divider.js.map