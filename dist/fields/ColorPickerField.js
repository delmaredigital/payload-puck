'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ColorPickerField - Custom Puck field for selecting colors with opacity
 *
 * This component provides a color picker with:
 * - Native color input for visual picking
 * - Hex input for direct entry
 * - Opacity slider (0-100%)
 * - Preview swatch
 * - Optional preset color swatches
 */
import { useState, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../theme';
// =============================================================================
// Utility Functions
// =============================================================================
/**
 * Validates and normalizes a hex color string
 */
function normalizeHex(hex) {
    let clean = hex.replace(/^#/, '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
        return '';
    }
    return `#${clean.toLowerCase()}`;
}
/**
 * Converts hex + opacity to rgba CSS string
 */
export function colorToRgba(hex, opacity) {
    const clean = hex.replace(/^#/, '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-800)',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    colorInput: {
        width: '40px',
        height: '40px',
        padding: 0,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    hexInput: {
        flex: '1 1 80px',
        minWidth: 0,
        height: '40px',
        padding: '0 12px',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    previewSwatch: {
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-150)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
    },
    checkerboard: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(45deg, #d0d0d0 25%, transparent 25%), linear-gradient(-45deg, #d0d0d0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d0d0d0 75%), linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)',
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        backgroundColor: '#f0f0f0',
    },
    colorOverlay: {
        position: 'absolute',
        inset: 0,
    },
    clearButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: 0,
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
        flexShrink: 0,
    },
    opacitySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    opacityHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    opacityLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    opacityValue: {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: 'var(--theme-elevation-500)',
    },
    opacitySlider: {
        position: 'relative',
        height: '12px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--theme-elevation-150)',
    },
    opacityInput: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
        margin: 0,
    },
    opacityThumb: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: 'white',
        border: '1px solid var(--theme-elevation-400)',
        borderRadius: '2px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        pointerEvents: 'none',
    },
    presetsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    presetsLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    presetsGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
    },
    presetButton: {
        width: '24px',
        height: '24px',
        padding: 0,
        borderRadius: '4px',
        cursor: 'pointer',
        border: '1px solid var(--theme-elevation-150)',
        outline: 'none',
    },
    presetButtonSelected: {
        width: '24px',
        height: '24px',
        padding: 0,
        borderRadius: '4px',
        cursor: 'pointer',
        border: '2px solid var(--theme-elevation-800)',
        outline: '2px solid var(--theme-elevation-300)',
        outlineOffset: '2px',
    },
};
// =============================================================================
// ColorPickerField Component
// =============================================================================
function ColorPickerFieldInner({ value, onChange, label, readOnly, showOpacity = true, presets, }) {
    // Use theme presets if none provided
    const theme = useTheme();
    const resolvedPresets = presets ?? theme.colorPresets;
    const [hexInput, setHexInput] = useState(value?.hex || '');
    const handleColorChange = useCallback((e) => {
        const newHex = e.target.value;
        onChange({
            hex: newHex,
            opacity: value?.opacity ?? 100,
        });
        setHexInput(newHex);
    }, [onChange, value?.opacity]);
    const handleHexInputChange = useCallback((e) => {
        const input = e.target.value;
        setHexInput(input);
        const normalized = normalizeHex(input);
        if (normalized) {
            onChange({
                hex: normalized,
                opacity: value?.opacity ?? 100,
            });
        }
    }, [onChange, value?.opacity]);
    const handleHexInputBlur = useCallback(() => {
        if (value?.hex) {
            setHexInput(value.hex);
        }
    }, [value?.hex]);
    const handleOpacityChange = useCallback((e) => {
        const newOpacity = parseInt(e.target.value, 10);
        if (value?.hex) {
            onChange({
                hex: value.hex,
                opacity: newOpacity,
            });
        }
    }, [onChange, value?.hex]);
    const handlePresetClick = useCallback((preset) => {
        onChange({
            hex: preset.hex,
            opacity: value?.opacity ?? 100,
        });
        setHexInput(preset.hex);
    }, [onChange, value?.opacity]);
    const handleClear = useCallback(() => {
        onChange(null);
        setHexInput('');
    }, [onChange]);
    const previewColor = value?.hex
        ? colorToRgba(value.hex, value.opacity ?? 100)
        : 'transparent';
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [label && (_jsx("label", { style: styles.label, children: label })), _jsxs("div", { style: styles.row, children: [_jsx("input", { type: "color", value: value?.hex || '#000000', onChange: handleColorChange, disabled: readOnly, style: {
                            ...styles.colorInput,
                            ...(readOnly ? { cursor: 'not-allowed', opacity: 0.5 } : {}),
                        } }), _jsx("input", { type: "text", value: hexInput, onChange: handleHexInputChange, onBlur: handleHexInputBlur, placeholder: "#000000", disabled: readOnly, style: styles.hexInput }), _jsxs("div", { style: styles.previewSwatch, title: value?.hex ? `${value.hex} at ${value.opacity ?? 100}% opacity` : 'No color selected', children: [_jsx("div", { style: styles.checkerboard }), _jsx("div", { style: { ...styles.colorOverlay, backgroundColor: previewColor } })] }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, title: "Clear color", style: styles.clearButton, children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), showOpacity && value?.hex && (_jsxs("div", { style: styles.opacitySection, children: [_jsxs("div", { style: styles.opacityHeader, children: [_jsx("label", { style: styles.opacityLabel, children: "Opacity" }), _jsxs("span", { style: styles.opacityValue, children: [value.opacity ?? 100, "%"] })] }), _jsxs("div", { style: styles.opacitySlider, children: [_jsx("div", { style: styles.checkerboard }), _jsx("div", { style: {
                                    ...styles.colorOverlay,
                                    background: `linear-gradient(to right, transparent 0%, ${value.hex} 100%)`,
                                } }), _jsx("input", { type: "range", min: "0", max: "100", value: value.opacity ?? 100, onChange: handleOpacityChange, disabled: readOnly, style: {
                                    ...styles.opacityInput,
                                    ...(readOnly ? { cursor: 'not-allowed' } : {}),
                                } }), _jsx("div", { style: {
                                    ...styles.opacityThumb,
                                    left: `calc(${value.opacity ?? 100}% - 2px)`,
                                } })] })] })), resolvedPresets.length > 0 && !readOnly && (_jsxs("div", { style: styles.presetsSection, children: [_jsx("label", { style: styles.presetsLabel, children: "Presets" }), _jsx("div", { style: styles.presetsGrid, children: resolvedPresets.map((preset) => {
                            const isSelected = value?.hex?.toLowerCase() === preset.hex.toLowerCase();
                            return (_jsx("button", { type: "button", onClick: () => handlePresetClick(preset), style: {
                                    ...(isSelected ? styles.presetButtonSelected : styles.presetButton),
                                    backgroundColor: preset.hex,
                                }, title: preset.label }, preset.hex));
                        }) })] }))] }));
}
export const ColorPickerField = memo(ColorPickerFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for color selection
 */
export function createColorPickerField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(ColorPickerField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, showOpacity: config.showOpacity, presets: config.presets })),
    };
}
//# sourceMappingURL=ColorPickerField.js.map