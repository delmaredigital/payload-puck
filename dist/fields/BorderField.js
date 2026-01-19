'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * BorderField - Custom Puck field for border styling
 *
 * This component provides:
 * - Border width input (px)
 * - Border color picker (reuses ColorPickerField)
 * - Border radius input
 * - Border style selector (solid, dashed, dotted, none)
 * - Per-side toggles (top, right, bottom, left)
 */
import { useCallback, memo } from 'react';
import { X, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, } from 'lucide-react';
import { ColorPickerField } from './ColorPickerField';
// =============================================================================
// Default Value
// =============================================================================
const DEFAULT_VALUE = {
    width: 1,
    color: { hex: '#e5e7eb', opacity: 100 }, // gray-200
    radius: 0,
    style: 'solid',
    sides: {
        top: true,
        right: true,
        bottom: true,
        left: true,
    },
};
// =============================================================================
// Border Style Options
// =============================================================================
const BORDER_STYLES = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'none', label: 'None' },
];
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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
    preview: {
        height: '64px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewText: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    inputLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    input: {
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    select: {
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    sidesSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    sidesLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    sidesButtons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    sideButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: 0,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    sideButtonActive: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: 0,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    sidesInfo: {
        fontSize: '10px',
        color: 'var(--theme-elevation-500)',
        textAlign: 'center',
    },
};
// =============================================================================
// BorderField Component
// =============================================================================
function BorderFieldInner({ value, onChange, label, readOnly, }) {
    // Use default if no value
    const currentValue = value || DEFAULT_VALUE;
    // Handle width change
    const handleWidthChange = useCallback((e) => {
        const newWidth = parseInt(e.target.value, 10) || 0;
        onChange({
            ...currentValue,
            width: Math.max(0, newWidth),
        });
    }, [currentValue, onChange]);
    // Handle color change
    const handleColorChange = useCallback((newColor) => {
        onChange({
            ...currentValue,
            color: newColor || { hex: '#000000', opacity: 100 },
        });
    }, [currentValue, onChange]);
    // Handle radius change
    const handleRadiusChange = useCallback((e) => {
        const newRadius = parseInt(e.target.value, 10) || 0;
        onChange({
            ...currentValue,
            radius: Math.max(0, newRadius),
        });
    }, [currentValue, onChange]);
    // Handle style change
    const handleStyleChange = useCallback((e) => {
        onChange({
            ...currentValue,
            style: e.target.value,
        });
    }, [currentValue, onChange]);
    // Handle side toggle
    const handleSideToggle = useCallback((side) => {
        onChange({
            ...currentValue,
            sides: {
                ...currentValue.sides,
                [side]: !currentValue.sides[side],
            },
        });
    }, [currentValue, onChange]);
    // Handle clear
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    // Check if all sides are enabled
    const allSidesEnabled = currentValue.sides.top &&
        currentValue.sides.right &&
        currentValue.sides.bottom &&
        currentValue.sides.left;
    const sideConfig = [
        { side: 'top', icon: ArrowUp, title: 'Top border' },
        { side: 'right', icon: ArrowRight, title: 'Right border' },
        { side: 'bottom', icon: ArrowDown, title: 'Bottom border' },
        { side: 'left', icon: ArrowLeft, title: 'Left border' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsx("label", { style: styles.label, children: label })), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Clear border", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: {
                    ...styles.preview,
                    borderWidth: currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
                    borderStyle: currentValue.style,
                    borderColor: currentValue.color?.hex || '#000000',
                    borderRadius: `${currentValue.radius}px`,
                    borderTopWidth: currentValue.sides.top && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
                    borderRightWidth: currentValue.sides.right && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
                    borderBottomWidth: currentValue.sides.bottom && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
                    borderLeftWidth: currentValue.sides.left && currentValue.style !== 'none' ? `${currentValue.width}px` : 0,
                    opacity: (currentValue.color?.opacity ?? 100) / 100,
                }, children: _jsx("span", { style: styles.previewText, children: "Preview" }) }), _jsxs("div", { style: styles.grid, children: [_jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Width (px)" }), _jsx("input", { type: "number", min: 0, max: 20, value: currentValue.width, onChange: handleWidthChange, disabled: readOnly, style: styles.input })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Style" }), _jsx("select", { value: currentValue.style, onChange: handleStyleChange, disabled: readOnly, style: styles.select, children: BORDER_STYLES.map((style) => (_jsx("option", { value: style.value, children: style.label }, style.value))) })] })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Radius (px)" }), _jsx("input", { type: "number", min: 0, max: 100, value: currentValue.radius, onChange: handleRadiusChange, disabled: readOnly, style: styles.input })] }), _jsx(ColorPickerField, { value: currentValue.color, onChange: handleColorChange, label: "Color", readOnly: readOnly, showOpacity: true, presets: [
                    { hex: '#000000', label: 'Black' },
                    { hex: '#374151', label: 'Gray 700' },
                    { hex: '#6b7280', label: 'Gray 500' },
                    { hex: '#d1d5db', label: 'Gray 300' },
                    { hex: '#e5e7eb', label: 'Gray 200' },
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#ef4444', label: 'Red' },
                ] }), !readOnly && (_jsxs("div", { style: styles.sidesSection, children: [_jsx("label", { style: styles.sidesLabel, children: "Sides" }), _jsx("div", { style: styles.sidesButtons, children: sideConfig.map(({ side, icon: Icon, title }) => {
                            const isActive = currentValue.sides[side];
                            return (_jsx("button", { type: "button", onClick: () => handleSideToggle(side), style: isActive ? styles.sideButtonActive : styles.sideButton, title: title, children: _jsx(Icon, { style: { width: '16px', height: '16px' } }) }, side));
                        }) }), _jsx("p", { style: styles.sidesInfo, children: allSidesEnabled ? 'All sides' : 'Custom sides' })] }))] }));
}
export const BorderField = memo(BorderFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for border styling
 */
export function createBorderField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(BorderField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly })),
    };
}
//# sourceMappingURL=BorderField.js.map