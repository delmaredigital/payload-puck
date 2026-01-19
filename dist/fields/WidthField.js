'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * WidthField - Custom Puck field for flexible width control
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Custom max-width input with unit selector (px, %, rem, vw)
 * - Content alignment (left, center, right)
 * - Preset quick-select buttons for common widths
 */
import { useCallback, memo } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, MoveHorizontal, Container, SlidersHorizontal, } from 'lucide-react';
// =============================================================================
// Default Value
// =============================================================================
const DEFAULT_VALUE = {
    mode: 'contained',
    maxWidth: 1200,
    unit: 'px',
    alignment: 'center',
};
// =============================================================================
// Preset Widths
// =============================================================================
const WIDTH_PRESETS = [
    { label: 'Narrow', value: 680 },
    { label: 'Medium', value: 960 },
    { label: 'Wide', value: 1200 },
    { label: 'XL', value: 1440 },
];
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
    modeGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
    },
    modeButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    modeButtonActive: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    controlsPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
    },
    sectionLabel: {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--theme-elevation-500)',
    },
    presetGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    presetButtons: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
    },
    presetButton: {
        height: '28px',
        padding: '0 12px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    presetButtonActive: {
        height: '28px',
        padding: '0 12px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    input: {
        flex: 1,
        minWidth: '80px',
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    unitGroup: {
        display: 'flex',
        flexShrink: 0,
        gap: '4px',
    },
    unitButton: {
        height: '32px',
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
        height: '32px',
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
    },
    alignGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    alignLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        flexShrink: 0,
    },
    alignButtons: {
        display: 'flex',
        gap: '4px',
    },
    alignButton: {
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
    alignButtonActive: {
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
    alignButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    summary: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        fontFamily: 'monospace',
    },
};
// =============================================================================
// WidthField Component
// =============================================================================
function WidthFieldInner({ value, onChange, label, readOnly, }) {
    const currentValue = value || DEFAULT_VALUE;
    const handleModeChange = useCallback((mode) => {
        if (mode === 'full') {
            onChange({
                ...currentValue,
                mode,
                alignment: 'center',
            });
        }
        else {
            onChange({
                ...currentValue,
                mode,
            });
        }
    }, [currentValue, onChange]);
    const handleMaxWidthChange = useCallback((maxWidth) => {
        onChange({
            ...currentValue,
            maxWidth,
        });
    }, [currentValue, onChange]);
    const handleUnitChange = useCallback((unit) => {
        onChange({
            ...currentValue,
            unit,
        });
    }, [currentValue, onChange]);
    const handleAlignmentChange = useCallback((alignment) => {
        onChange({
            ...currentValue,
            alignment,
        });
    }, [currentValue, onChange]);
    const handlePresetSelect = useCallback((presetValue) => {
        onChange({
            ...currentValue,
            mode: 'contained',
            maxWidth: presetValue,
            unit: 'px',
        });
    }, [currentValue, onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const modeConfig = [
        { mode: 'full', icon: MoveHorizontal, label: 'Full', title: 'Full width (100%)' },
        { mode: 'contained', icon: Container, label: 'Contain', title: 'Contained (centered with max-width)' },
        { mode: 'custom', icon: SlidersHorizontal, label: 'Custom', title: 'Custom width settings' },
    ];
    const alignmentConfig = [
        { alignment: 'left', icon: AlignLeft, title: 'Align left' },
        { alignment: 'center', icon: AlignCenter, title: 'Align center' },
        { alignment: 'right', icon: AlignRight, title: 'Align right' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsx("label", { style: styles.label, children: label })), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.modeGroup, children: modeConfig.map(({ mode, icon: Icon, label: modeLabel, title }) => {
                    const isActive = currentValue.mode === mode;
                    return (_jsxs("button", { type: "button", onClick: () => handleModeChange(mode), disabled: readOnly, style: isActive ? styles.modeButtonActive : styles.modeButton, title: title, children: [_jsx(Icon, { style: { width: '14px', height: '14px' } }), modeLabel] }, mode));
                }) }), currentValue.mode !== 'full' && (_jsxs("div", { style: styles.controlsPanel, children: [_jsxs("div", { style: styles.presetGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Presets" }), _jsx("div", { style: styles.presetButtons, children: WIDTH_PRESETS.map((preset) => {
                                    const isActive = currentValue.maxWidth === preset.value && currentValue.unit === 'px';
                                    return (_jsx("button", { type: "button", onClick: () => handlePresetSelect(preset.value), disabled: readOnly, style: isActive ? styles.presetButtonActive : styles.presetButton, children: preset.label }, preset.value));
                                }) })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Max Width" }), _jsxs("div", { style: styles.inputRow, children: [_jsx("input", { type: "number", min: 0, value: currentValue.maxWidth, onChange: (e) => handleMaxWidthChange(parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input }), _jsx("div", { style: styles.unitGroup, children: ['px', '%', 'rem', 'vw'].map((unit) => {
                                            const isActive = currentValue.unit === unit;
                                            return (_jsx("button", { type: "button", onClick: () => handleUnitChange(unit), disabled: readOnly, style: isActive ? styles.unitButtonActive : styles.unitButton, children: unit }, unit));
                                        }) })] })] })] })), _jsxs("div", { style: styles.footer, children: [_jsxs("div", { style: styles.alignGroup, children: [_jsx("label", { style: styles.alignLabel, children: "Align:" }), _jsx("div", { style: styles.alignButtons, children: alignmentConfig.map(({ alignment, icon: Icon, title }) => {
                                    const isActive = currentValue.alignment === alignment;
                                    const isDisabled = readOnly || currentValue.mode === 'full';
                                    return (_jsx("button", { type: "button", onClick: () => handleAlignmentChange(alignment), disabled: isDisabled, style: {
                                            ...(isActive ? styles.alignButtonActive : styles.alignButton),
                                            ...(isDisabled ? styles.alignButtonDisabled : {}),
                                        }, title: title, children: _jsx(Icon, { style: { width: '14px', height: '14px' } }) }, alignment));
                                }) })] }), _jsx("span", { style: styles.summary, children: currentValue.mode === 'full'
                            ? '100%'
                            : `${currentValue.maxWidth}${currentValue.unit}` })] })] }));
}
export const WidthField = memo(WidthFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for width control
 */
export function createWidthField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(WidthField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly })),
    };
}
//# sourceMappingURL=WidthField.js.map