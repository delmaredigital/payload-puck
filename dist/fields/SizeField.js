'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SizeField - Custom Puck field for button/element sizing
 *
 * Provides preset size options (sm, default, lg) with a "custom" mode
 * that reveals detailed controls for height, padding, and font size.
 */
import { useCallback, memo } from 'react';
import { X } from 'lucide-react';
// Re-export types and utilities from shared.ts for backward compatibility
// These are defined in shared.ts to be server-safe
export { sizeValueToCSS, getSizeClasses, } from './shared';
// =============================================================================
// Default Values
// =============================================================================
const DEFAULT_VALUE = {
    mode: 'default',
};
const CUSTOM_DEFAULTS = {
    height: 40,
    paddingX: 16,
    paddingY: 8,
    fontSize: 14,
    unit: 'px',
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
    buttonGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    buttonActive: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    customPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    unitRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    unitLabel: {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--theme-elevation-500)',
        flexShrink: 0,
    },
    unitButtons: {
        display: 'flex',
        gap: '4px',
    },
    unitButton: {
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    unitButtonActive: {
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    inputGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
    },
    inputLabel: {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--theme-elevation-500)',
    },
    input: {
        width: '100%',
        minWidth: 0,
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        boxSizing: 'border-box',
    },
    summary: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        fontFamily: 'monospace',
        paddingTop: '4px',
        borderTop: '1px solid var(--theme-elevation-100)',
    },
};
// =============================================================================
// SizeField Component
// =============================================================================
function SizeFieldInner({ value, onChange, label = 'Size', readOnly, showHeight = true, showFontSize = true, }) {
    const currentValue = value || DEFAULT_VALUE;
    const handleModeChange = useCallback((mode) => {
        if (mode === 'custom') {
            onChange({
                mode,
                ...CUSTOM_DEFAULTS,
            });
        }
        else {
            onChange({ mode });
        }
    }, [onChange]);
    const handleValueChange = useCallback((field, val) => {
        onChange({
            ...currentValue,
            [field]: val,
        });
    }, [currentValue, onChange]);
    const handleUnitChange = useCallback((unit) => {
        onChange({
            ...currentValue,
            unit,
        });
    }, [currentValue, onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const presets = [
        { mode: 'sm', label: 'SM' },
        { mode: 'default', label: 'Default' },
        { mode: 'lg', label: 'LG' },
        { mode: 'custom', label: 'Custom' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.buttonGroup, children: presets.map(({ mode, label: modeLabel }) => {
                    const isActive = currentValue.mode === mode;
                    return (_jsx("button", { type: "button", onClick: () => handleModeChange(mode), disabled: readOnly, style: isActive ? styles.buttonActive : styles.button, children: modeLabel }, mode));
                }) }), currentValue.mode === 'custom' && (_jsxs("div", { style: styles.customPanel, children: [_jsxs("div", { style: styles.unitRow, children: [_jsx("label", { style: styles.unitLabel, children: "Unit:" }), _jsx("div", { style: styles.unitButtons, children: ['px', 'rem'].map((unit) => {
                                    const isActive = (currentValue.unit || 'px') === unit;
                                    return (_jsx("button", { type: "button", onClick: () => handleUnitChange(unit), disabled: readOnly, style: isActive ? styles.unitButtonActive : styles.unitButton, children: unit }, unit));
                                }) })] }), _jsxs("div", { style: styles.inputGrid, children: [showHeight && (_jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Height" }), _jsx("input", { type: "number", min: 0, value: currentValue.height ?? CUSTOM_DEFAULTS.height, onChange: (e) => handleValueChange('height', parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input })] })), showFontSize && (_jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Font Size" }), _jsx("input", { type: "number", min: 0, value: currentValue.fontSize ?? CUSTOM_DEFAULTS.fontSize, onChange: (e) => handleValueChange('fontSize', parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input })] })), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Padding X" }), _jsx("input", { type: "number", min: 0, value: currentValue.paddingX ?? CUSTOM_DEFAULTS.paddingX, onChange: (e) => handleValueChange('paddingX', parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, children: "Padding Y" }), _jsx("input", { type: "number", min: 0, value: currentValue.paddingY ?? CUSTOM_DEFAULTS.paddingY, onChange: (e) => handleValueChange('paddingY', parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input })] })] }), _jsxs("div", { style: styles.summary, children: [showHeight && `h: ${currentValue.height ?? CUSTOM_DEFAULTS.height}${currentValue.unit || 'px'}`, showHeight && ' | ', `p: ${currentValue.paddingY ?? CUSTOM_DEFAULTS.paddingY}${currentValue.unit || 'px'} ${currentValue.paddingX ?? CUSTOM_DEFAULTS.paddingX}${currentValue.unit || 'px'}`, showFontSize && ` | font: ${currentValue.fontSize ?? CUSTOM_DEFAULTS.fontSize}${currentValue.unit || 'px'}`] })] }))] }));
}
export const SizeField = memo(SizeFieldInner);
/**
 * Creates a Puck field configuration for size control
 */
export function createSizeField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(SizeField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, showHeight: config.showHeight, showFontSize: config.showFontSize })),
    };
}
//# sourceMappingURL=SizeField.js.map