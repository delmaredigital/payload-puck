'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * GradientEditor - Component for editing gradient values
 *
 * This component provides:
 * - Type selector (linear/radial toggle)
 * - Angle slider for linear gradients (0-360)
 * - Shape and position selectors for radial gradients
 * - Gradient stops list with color pickers and position sliders
 * - Add/remove stop buttons
 * - Visual gradient preview bar
 */
import { useCallback, memo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { colorValueToCSS } from './shared';
// =============================================================================
// Default Values
// =============================================================================
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
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    preview: {
        height: '48px',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-150)',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    label: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        width: '48px',
        flexShrink: 0,
    },
    buttonGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
    },
    button: {
        height: '28px',
        padding: '0 12px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    buttonActive: {
        height: '28px',
        padding: '0 12px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    slider: {
        flex: 1,
        height: '6px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    sliderValue: {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: 'var(--theme-elevation-500)',
        width: '40px',
        textAlign: 'right',
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
    stopsHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: '24px',
        padding: '0 8px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    stopsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    stopItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    stopRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    colorPicker: {
        width: '28px',
        height: '28px',
        padding: 0,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        cursor: 'pointer',
        flexShrink: 0,
    },
    hexInput: {
        width: '80px',
        minWidth: 0,
        height: '28px',
        padding: '0 6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    swatch: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        border: '1px solid var(--theme-elevation-150)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
    },
    checkerboard: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    },
    colorOverlay: {
        position: 'absolute',
        inset: 0,
    },
    spacer: {
        flex: 1,
        minWidth: 0,
    },
    deleteButton: {
        padding: '4px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
        flexShrink: 0,
    },
    stopLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        width: '48px',
        flexShrink: 0,
    },
    rangeSlider: {
        flex: 1,
        height: '6px',
        minWidth: 0,
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    rangeValue: {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: 'var(--theme-elevation-500)',
        width: '32px',
        textAlign: 'right',
        flexShrink: 0,
    },
};
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Generates CSS gradient string for preview
 */
function getGradientPreviewCSS(gradient) {
    if (!gradient.stops || gradient.stops.length === 0) {
        return 'linear-gradient(90deg, #ccc 0%, #999 100%)';
    }
    const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
    const stopsCSS = sortedStops
        .map((stop) => {
        const color = colorValueToCSS(stop.color) || 'transparent';
        return `${color} ${stop.position}%`;
    })
        .join(', ');
    if (gradient.type === 'radial') {
        const shape = gradient.radialShape || 'circle';
        const position = gradient.radialPosition || 'center';
        return `radial-gradient(${shape} at ${position}, ${stopsCSS})`;
    }
    return `linear-gradient(${gradient.angle}deg, ${stopsCSS})`;
}
function GradientStopEditorInner({ stop, index, canDelete, onColorChange, onPositionChange, onDelete, readOnly, }) {
    const [hexInput, setHexInput] = useState(stop.color.hex);
    const handleColorPickerChange = useCallback((e) => {
        const newHex = e.target.value;
        setHexInput(newHex);
        onColorChange(index, { ...stop.color, hex: newHex });
    }, [index, stop.color, onColorChange]);
    const handleHexInputChange = useCallback((e) => {
        const input = e.target.value;
        setHexInput(input);
        // Validate hex format
        const clean = input.replace(/^#/, '');
        if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
            onColorChange(index, { ...stop.color, hex: `#${clean.toLowerCase()}` });
        }
    }, [index, stop.color, onColorChange]);
    const handleOpacityChange = useCallback((e) => {
        const newOpacity = parseInt(e.target.value, 10);
        onColorChange(index, { ...stop.color, opacity: newOpacity });
    }, [index, stop.color, onColorChange]);
    const handlePositionChange = useCallback((e) => {
        const newPosition = parseInt(e.target.value, 10);
        onPositionChange(index, Math.max(0, Math.min(100, newPosition)));
    }, [index, onPositionChange]);
    const previewColor = colorValueToCSS(stop.color) || 'transparent';
    const opacity = stop.color.opacity ?? 100;
    return (_jsxs("div", { style: styles.stopItem, children: [_jsxs("div", { style: styles.stopRow, children: [_jsx("input", { type: "color", value: stop.color.hex, onChange: handleColorPickerChange, disabled: readOnly, style: styles.colorPicker }), _jsx("input", { type: "text", value: hexInput, onChange: handleHexInputChange, placeholder: "#000000", disabled: readOnly, style: styles.hexInput }), _jsxs("div", { style: styles.swatch, title: `${previewColor} at ${opacity}% opacity`, children: [_jsx("div", { style: styles.checkerboard }), _jsx("div", { style: { ...styles.colorOverlay, backgroundColor: previewColor } })] }), _jsx("div", { style: styles.spacer }), canDelete && !readOnly && (_jsx("button", { type: "button", onClick: () => onDelete(index), style: styles.deleteButton, title: "Remove stop", children: _jsx(Trash2, { style: { width: '16px', height: '16px' } }) }))] }), _jsxs("div", { style: styles.stopRow, children: [_jsx("label", { style: styles.stopLabel, children: "Pos" }), _jsx("input", { type: "range", min: "0", max: "100", value: stop.position, onChange: handlePositionChange, disabled: readOnly, style: styles.rangeSlider }), _jsxs("span", { style: styles.rangeValue, children: [stop.position, "%"] })] }), _jsxs("div", { style: styles.stopRow, children: [_jsx("label", { style: styles.stopLabel, children: "Alpha" }), _jsx("input", { type: "range", min: "0", max: "100", value: opacity, onChange: handleOpacityChange, disabled: readOnly, style: styles.rangeSlider }), _jsxs("span", { style: styles.rangeValue, children: [opacity, "%"] })] })] }));
}
const GradientStopEditor = memo(GradientStopEditorInner);
// =============================================================================
// GradientEditor Component
// =============================================================================
function GradientEditorInner({ value, onChange, readOnly }) {
    const currentValue = value || DEFAULT_GRADIENT;
    // Handle gradient type change
    const handleTypeChange = useCallback((type) => {
        onChange({ ...currentValue, type });
    }, [currentValue, onChange]);
    // Handle angle change
    const handleAngleChange = useCallback((e) => {
        const angle = parseInt(e.target.value, 10);
        onChange({ ...currentValue, angle });
    }, [currentValue, onChange]);
    // Handle radial shape change
    const handleRadialShapeChange = useCallback((e) => {
        onChange({ ...currentValue, radialShape: e.target.value });
    }, [currentValue, onChange]);
    // Handle radial position change
    const handleRadialPositionChange = useCallback((e) => {
        onChange({ ...currentValue, radialPosition: e.target.value });
    }, [currentValue, onChange]);
    // Handle stop color change
    const handleStopColorChange = useCallback((index, color) => {
        const newStops = [...currentValue.stops];
        newStops[index] = { ...newStops[index], color };
        onChange({ ...currentValue, stops: newStops });
    }, [currentValue, onChange]);
    // Handle stop position change
    const handleStopPositionChange = useCallback((index, position) => {
        const newStops = [...currentValue.stops];
        newStops[index] = { ...newStops[index], position };
        onChange({ ...currentValue, stops: newStops });
    }, [currentValue, onChange]);
    // Handle add stop
    const handleAddStop = useCallback(() => {
        const newPosition = currentValue.stops.length > 0 ? 50 : 0;
        const newStop = {
            color: { hex: '#888888', opacity: 100 },
            position: newPosition,
        };
        onChange({ ...currentValue, stops: [...currentValue.stops, newStop] });
    }, [currentValue, onChange]);
    // Handle delete stop
    const handleDeleteStop = useCallback((index) => {
        const newStops = currentValue.stops.filter((_, i) => i !== index);
        onChange({ ...currentValue, stops: newStops });
    }, [currentValue, onChange]);
    const previewCSS = getGradientPreviewCSS(currentValue);
    const canDeleteStops = currentValue.stops.length > 2;
    return (_jsxs("div", { style: styles.container, children: [_jsx("div", { style: { ...styles.preview, background: previewCSS } }), _jsxs("div", { style: styles.row, children: [_jsx("label", { style: styles.label, children: "Type" }), _jsxs("div", { style: styles.buttonGroup, children: [_jsx("button", { type: "button", onClick: () => handleTypeChange('linear'), disabled: readOnly, style: currentValue.type === 'linear' ? styles.buttonActive : styles.button, children: "Linear" }), _jsx("button", { type: "button", onClick: () => handleTypeChange('radial'), disabled: readOnly, style: currentValue.type === 'radial' ? styles.buttonActive : styles.button, children: "Radial" })] })] }), currentValue.type === 'linear' && (_jsxs("div", { style: styles.row, children: [_jsx("label", { style: styles.label, children: "Angle" }), _jsx("input", { type: "range", min: "0", max: "360", value: currentValue.angle, onChange: handleAngleChange, disabled: readOnly, style: styles.slider }), _jsxs("span", { style: styles.sliderValue, children: [currentValue.angle, "deg"] })] })), currentValue.type === 'radial' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.row, children: [_jsx("label", { style: styles.label, children: "Shape" }), _jsxs("select", { value: currentValue.radialShape || 'circle', onChange: handleRadialShapeChange, disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "circle", children: "Circle" }), _jsx("option", { value: "ellipse", children: "Ellipse" })] })] }), _jsxs("div", { style: styles.row, children: [_jsx("label", { style: styles.label, children: "Position" }), _jsxs("select", { value: currentValue.radialPosition || 'center', onChange: handleRadialPositionChange, disabled: readOnly, style: styles.select, children: [_jsx("option", { value: "center", children: "Center" }), _jsx("option", { value: "top", children: "Top" }), _jsx("option", { value: "bottom", children: "Bottom" }), _jsx("option", { value: "left", children: "Left" }), _jsx("option", { value: "right", children: "Right" })] })] })] })), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("div", { style: styles.stopsHeader, children: [_jsx("label", { style: styles.label, children: "Color Stops" }), !readOnly && (_jsxs("button", { type: "button", onClick: handleAddStop, style: styles.addButton, children: [_jsx(Plus, { style: { width: '12px', height: '12px' } }), "Add Stop"] }))] }), _jsx("div", { style: styles.stopsList, children: currentValue.stops.map((stop, index) => (_jsx(GradientStopEditor, { stop: stop, index: index, canDelete: canDeleteStops, onColorChange: handleStopColorChange, onPositionChange: handleStopPositionChange, onDelete: handleDeleteStop, readOnly: readOnly }, index))) })] })] }));
}
export const GradientEditor = memo(GradientEditorInner);
//# sourceMappingURL=GradientEditor.js.map