'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * BackgroundField - Custom Puck field for unified background selection
 *
 * This component provides a tabbed interface for selecting:
 * - None: No background
 * - Solid: Single color with opacity
 * - Gradient: Linear or radial gradients with multiple stops
 * - Image: Background image from media library with sizing options
 */
import { useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { backgroundValueToCSS, getBackgroundImageOpacity } from './shared';
import { ColorPickerField } from './ColorPickerField';
import { MediaField } from './MediaField';
import { GradientEditor } from './GradientEditor';
// =============================================================================
// Default Values
// =============================================================================
const DEFAULT_VALUE = {
    type: 'none',
    solid: null,
    gradient: null,
    image: null,
};
const DEFAULT_GRADIENT = {
    type: 'linear',
    angle: 90,
    stops: [
        { color: { hex: '#000000', opacity: 100 }, position: 0 },
        { color: { hex: '#ffffff', opacity: 100 }, position: 100 },
    ],
    radialShape: 'circle',
    radialPosition: 'center',
};
const DEFAULT_IMAGE = {
    media: null,
    size: 'cover',
    position: 'center',
    repeat: 'no-repeat',
    attachment: 'scroll',
    opacity: 100,
    mask: undefined,
};
const DEFAULT_MASK = {
    enabled: false,
    direction: 'to-bottom',
    startOpacity: 100,
    endOpacity: 0,
    startPosition: 0,
    endPosition: 100,
};
const DEFAULT_OVERLAY = {
    enabled: false,
    type: 'solid',
    solid: { hex: '#000000', opacity: 50 },
    gradient: null,
};
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-800)',
    },
    clearButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        padding: 0,
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    tabContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '8px',
    },
    tabButton: {
        flex: '1 1 auto',
        minWidth: 0,
        padding: '6px 8px',
        fontSize: '12px',
        fontWeight: 500,
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    tabButtonActive: {
        flex: '1 1 auto',
        minWidth: 0,
        padding: '6px 8px',
        fontSize: '12px',
        fontWeight: 500,
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    tabButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    previewContainer: {
        position: 'relative',
        height: '64px',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-150)',
        overflow: 'hidden',
    },
    previewEmpty: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        backgroundColor: 'var(--theme-elevation-50)',
    },
    checkerboard: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
    },
    contentContainer: {
        minHeight: '100px',
    },
    emptyContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '96px',
        fontSize: '14px',
        color: 'var(--theme-elevation-500)',
    },
    imageOptionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    optionsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '8px',
        borderTop: '1px solid var(--theme-elevation-150)',
    },
    optionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    optionLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        width: '80px',
        flexShrink: 0,
    },
    optionLabelSmall: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        width: '48px',
        flexShrink: 0,
    },
    select: {
        flex: 1,
        height: '32px',
        padding: '0 8px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    selectSmall: {
        flex: 1,
        minWidth: 0,
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    slider: {
        flex: 1,
        minWidth: 0,
        height: '6px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    sliderValue: {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: 'var(--theme-elevation-500)',
        width: '32px',
        textAlign: 'right',
        flexShrink: 0,
    },
    checkboxRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    maskSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingLeft: '24px',
    },
    overlaySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '12px',
    },
};
function TabButton({ active, onClick, disabled, children }) {
    return (_jsx("button", { type: "button", onClick: onClick, disabled: disabled, style: {
            ...(active ? styles.tabButtonActive : styles.tabButton),
            ...(disabled ? styles.tabButtonDisabled : {}),
        }, children: children }));
}
function BackgroundPreview({ value }) {
    const style = backgroundValueToCSS(value);
    const imageOpacity = getBackgroundImageOpacity(value);
    const hasBackground = value.type !== 'none' && Object.keys(style).length > 0;
    return (_jsxs("div", { style: styles.previewContainer, children: [hasBackground && _jsx("div", { style: styles.checkerboard }), hasBackground && (_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    ...style,
                    opacity: imageOpacity !== undefined ? imageOpacity : 1,
                } })), !hasBackground && (_jsx("div", { style: styles.previewEmpty, children: "No background" }))] }));
}
function ImageOptionsInner({ value, onChange, readOnly, apiEndpoint }) {
    const handleMediaChange = useCallback((media) => {
        onChange({ ...value, media });
    }, [value, onChange]);
    const handleSizeChange = useCallback((size) => {
        onChange({ ...value, size });
    }, [value, onChange]);
    const handlePositionChange = useCallback((position) => {
        onChange({ ...value, position });
    }, [value, onChange]);
    const handleRepeatChange = useCallback((repeat) => {
        onChange({ ...value, repeat });
    }, [value, onChange]);
    const handleAttachmentChange = useCallback((attachment) => {
        onChange({ ...value, attachment });
    }, [value, onChange]);
    const handleOpacityChange = useCallback((e) => {
        const opacity = parseInt(e.target.value, 10);
        onChange({ ...value, opacity });
    }, [value, onChange]);
    const handleMaskToggle = useCallback((checked) => {
        if (checked) {
            onChange({ ...value, mask: { ...DEFAULT_MASK, enabled: true } });
        }
        else {
            onChange({ ...value, mask: undefined });
        }
    }, [value, onChange]);
    const handleMaskDirectionChange = useCallback((direction) => {
        const currentMask = value.mask || DEFAULT_MASK;
        onChange({ ...value, mask: { ...currentMask, direction, enabled: true } });
    }, [value, onChange]);
    const handleMaskStartPositionChange = useCallback((e) => {
        const startPosition = parseInt(e.target.value, 10);
        const currentMask = value.mask || DEFAULT_MASK;
        onChange({ ...value, mask: { ...currentMask, startPosition, enabled: true } });
    }, [value, onChange]);
    const handleMaskEndPositionChange = useCallback((e) => {
        const endPosition = parseInt(e.target.value, 10);
        const currentMask = value.mask || DEFAULT_MASK;
        onChange({ ...value, mask: { ...currentMask, endPosition, enabled: true } });
    }, [value, onChange]);
    const opacity = value.opacity ?? 100;
    const maskEnabled = value.mask?.enabled ?? false;
    return (_jsxs("div", { style: styles.imageOptionsContainer, children: [_jsx(MediaField, { value: value.media, onChange: handleMediaChange, readOnly: readOnly, apiEndpoint: apiEndpoint }), value.media && (_jsxs("div", { style: styles.optionsSection, children: [_jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabel, children: "Opacity" }), _jsx("input", { type: "range", min: "0", max: "100", value: opacity, onChange: handleOpacityChange, disabled: readOnly, style: styles.slider }), _jsxs("span", { style: styles.sliderValue, children: [opacity, "%"] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabel, children: "Size" }), _jsxs("select", { value: value.size, onChange: (e) => handleSizeChange(e.target.value), disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "cover", children: "Cover" }), _jsx("option", { value: "contain", children: "Contain" }), _jsx("option", { value: "auto", children: "Auto" })] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabel, children: "Position" }), _jsxs("select", { value: value.position, onChange: (e) => handlePositionChange(e.target.value), disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "center", children: "Center" }), _jsx("option", { value: "top", children: "Top" }), _jsx("option", { value: "bottom", children: "Bottom" }), _jsx("option", { value: "left", children: "Left" }), _jsx("option", { value: "right", children: "Right" }), _jsx("option", { value: "top-left", children: "Top Left" }), _jsx("option", { value: "top-right", children: "Top Right" }), _jsx("option", { value: "bottom-left", children: "Bottom Left" }), _jsx("option", { value: "bottom-right", children: "Bottom Right" })] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabel, children: "Repeat" }), _jsxs("select", { value: value.repeat, onChange: (e) => handleRepeatChange(e.target.value), disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "no-repeat", children: "No Repeat" }), _jsx("option", { value: "repeat", children: "Repeat" }), _jsx("option", { value: "repeat-x", children: "Repeat X" }), _jsx("option", { value: "repeat-y", children: "Repeat Y" })] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabel, children: "Attachment" }), _jsxs("select", { value: value.attachment, onChange: (e) => handleAttachmentChange(e.target.value), disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "scroll", children: "Scroll" }), _jsx("option", { value: "fixed", children: "Fixed" })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }, children: [_jsxs("label", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: maskEnabled, onChange: (e) => handleMaskToggle(e.target.checked), disabled: readOnly, style: styles.checkbox }), _jsx("span", { style: styles.checkboxLabel, children: "Fade to transparent" })] }), maskEnabled && (_jsxs("div", { style: styles.maskSection, children: [_jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabelSmall, children: "Dir" }), _jsxs("select", { value: value.mask?.direction || 'to-bottom', onChange: (e) => handleMaskDirectionChange(e.target.value), disabled: readOnly, style: styles.selectSmall, children: [_jsx("option", { value: "to-top", children: "To Top" }), _jsx("option", { value: "to-bottom", children: "To Bottom" }), _jsx("option", { value: "to-left", children: "To Left" }), _jsx("option", { value: "to-right", children: "To Right" }), _jsx("option", { value: "to-top-left", children: "To Top Left" }), _jsx("option", { value: "to-top-right", children: "To Top Right" }), _jsx("option", { value: "to-bottom-left", children: "To Bottom Left" }), _jsx("option", { value: "to-bottom-right", children: "To Bottom Right" }), _jsx("option", { value: "from-center", children: "From Center (Radial)" })] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabelSmall, children: "Start" }), _jsx("input", { type: "range", min: "0", max: "100", value: value.mask?.startPosition ?? 0, onChange: handleMaskStartPositionChange, disabled: readOnly, style: styles.slider }), _jsxs("span", { style: styles.sliderValue, children: [value.mask?.startPosition ?? 0, "%"] })] }), _jsxs("div", { style: styles.optionRow, children: [_jsx("label", { style: styles.optionLabelSmall, children: "End" }), _jsx("input", { type: "range", min: "0", max: "100", value: value.mask?.endPosition ?? 100, onChange: handleMaskEndPositionChange, disabled: readOnly, style: styles.slider }), _jsxs("span", { style: styles.sliderValue, children: [value.mask?.endPosition ?? 100, "%"] })] })] }))] })] }))] }));
}
const ImageOptions = memo(ImageOptionsInner);
// =============================================================================
// BackgroundField Component
// =============================================================================
function BackgroundFieldInner({ value, onChange, label, readOnly, apiEndpoint = '/api/media', showOpacity = true, colorPresets, }) {
    const currentValue = value || DEFAULT_VALUE;
    const currentType = currentValue.type;
    // Handle type change
    const handleTypeChange = useCallback((type) => {
        const newValue = {
            ...currentValue,
            type,
        };
        // Initialize defaults for the new type if needed
        if (type === 'gradient' && !newValue.gradient) {
            newValue.gradient = DEFAULT_GRADIENT;
        }
        if (type === 'image' && !newValue.image) {
            newValue.image = DEFAULT_IMAGE;
        }
        onChange(newValue);
    }, [currentValue, onChange]);
    // Handle solid color change
    const handleSolidChange = useCallback((solid) => {
        onChange({ ...currentValue, solid });
    }, [currentValue, onChange]);
    // Handle gradient change
    const handleGradientChange = useCallback((gradient) => {
        onChange({ ...currentValue, gradient });
    }, [currentValue, onChange]);
    // Handle image change
    const handleImageChange = useCallback((image) => {
        onChange({ ...currentValue, image });
    }, [currentValue, onChange]);
    // Handle overlay toggle
    const handleOverlayToggle = useCallback((checked) => {
        if (checked) {
            onChange({ ...currentValue, overlay: { ...DEFAULT_OVERLAY, enabled: true } });
        }
        else {
            onChange({ ...currentValue, overlay: { ...DEFAULT_OVERLAY, enabled: false } });
        }
    }, [currentValue, onChange]);
    // Handle overlay type change
    const handleOverlayTypeChange = useCallback((type) => {
        const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY;
        onChange({
            ...currentValue,
            overlay: {
                ...currentOverlay,
                type,
                enabled: true,
                // Initialize gradient if switching to gradient and not set
                gradient: type === 'gradient' && !currentOverlay.gradient ? DEFAULT_GRADIENT : currentOverlay.gradient,
            },
        });
    }, [currentValue, onChange]);
    // Handle overlay solid color change
    const handleOverlaySolidChange = useCallback((solid) => {
        const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY;
        onChange({
            ...currentValue,
            overlay: { ...currentOverlay, solid, enabled: true },
        });
    }, [currentValue, onChange]);
    // Handle overlay gradient change
    const handleOverlayGradientChange = useCallback((gradient) => {
        const currentOverlay = currentValue.overlay || DEFAULT_OVERLAY;
        onChange({
            ...currentValue,
            overlay: { ...currentOverlay, gradient, enabled: true },
        });
    }, [currentValue, onChange]);
    // Handle clear
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const overlayEnabled = currentValue.overlay?.enabled ?? false;
    const overlayType = currentValue.overlay?.type ?? 'solid';
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && _jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, title: "Clear background", style: styles.clearButton, children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx(BackgroundPreview, { value: currentValue }), _jsxs("div", { style: styles.tabContainer, children: [_jsx(TabButton, { active: currentType === 'none', onClick: () => handleTypeChange('none'), disabled: readOnly, children: "None" }), _jsx(TabButton, { active: currentType === 'solid', onClick: () => handleTypeChange('solid'), disabled: readOnly, children: "Solid" }), _jsx(TabButton, { active: currentType === 'gradient', onClick: () => handleTypeChange('gradient'), disabled: readOnly, children: "Gradient" }), _jsx(TabButton, { active: currentType === 'image', onClick: () => handleTypeChange('image'), disabled: readOnly, children: "Image" })] }), _jsxs("div", { style: styles.contentContainer, children: [currentType === 'none' && (_jsx("div", { style: styles.emptyContent, children: "No background selected" })), currentType === 'solid' && (_jsx(ColorPickerField, { value: currentValue.solid || null, onChange: handleSolidChange, readOnly: readOnly, showOpacity: showOpacity, presets: colorPresets })), currentType === 'gradient' && (_jsx(GradientEditor, { value: currentValue.gradient || null, onChange: handleGradientChange, readOnly: readOnly })), currentType === 'image' && (_jsxs("div", { style: styles.imageOptionsContainer, children: [_jsx(ImageOptions, { value: currentValue.image || DEFAULT_IMAGE, onChange: handleImageChange, readOnly: readOnly, apiEndpoint: apiEndpoint }), currentValue.image?.media && (_jsxs("div", { style: styles.overlaySection, children: [_jsxs("label", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: overlayEnabled, onChange: (e) => handleOverlayToggle(e.target.checked), disabled: readOnly, style: styles.checkbox }), _jsx("span", { style: styles.checkboxLabel, children: "Enable overlay" })] }), overlayEnabled && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { style: styles.tabContainer, children: [_jsx(TabButton, { active: overlayType === 'solid', onClick: () => handleOverlayTypeChange('solid'), disabled: readOnly, children: "Solid Color" }), _jsx(TabButton, { active: overlayType === 'gradient', onClick: () => handleOverlayTypeChange('gradient'), disabled: readOnly, children: "Gradient" })] }), overlayType === 'solid' ? (_jsx(ColorPickerField, { value: currentValue.overlay?.solid || null, onChange: handleOverlaySolidChange, readOnly: readOnly, showOpacity: true })) : (_jsx(GradientEditor, { value: currentValue.overlay?.gradient || null, onChange: handleOverlayGradientChange, readOnly: readOnly }))] }))] }))] }))] })] }));
}
export const BackgroundField = memo(BackgroundFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for background selection
 */
export function createBackgroundField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(BackgroundField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, apiEndpoint: config.apiEndpoint, showOpacity: config.showOpacity, colorPresets: config.colorPresets })),
    };
}
//# sourceMappingURL=BackgroundField.js.map