'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * DimensionsField - Unified Puck field for width and height constraints
 *
 * This component provides:
 * - Width mode selector (Full, Contained, Custom)
 * - Min/max width controls
 * - Min/max height controls
 * - Content alignment (left, center, right)
 * - Progressive disclosure (simple vs advanced mode)
 * - Preset quick-select buttons for common widths
 */
import { useCallback, memo, useState } from 'react';
import { X, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, MoveHorizontal, Square, SlidersHorizontal, ChevronDown, ChevronUp, } from 'lucide-react';
import { getDimensionsSummary } from './shared';
// =============================================================================
// Default Values
// =============================================================================
const DEFAULT_VALUE = {
    mode: 'full',
    alignment: 'center',
    maxWidth: {
        value: 0,
        unit: 'px',
        enabled: false,
    },
    advancedMode: false,
};
const WIDTH_PRESETS = [
    { label: 'Narrow', value: 680 },
    { label: 'Medium', value: 960 },
    { label: 'Wide', value: 1200 },
    { label: 'XL', value: 1440 },
];
const WIDTH_UNITS = ['px', 'rem', '%', 'vw'];
const HEIGHT_UNITS = ['px', 'rem', '%', 'vh'];
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
        flex: '1 1 auto',
        minWidth: '50px',
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    presetButtonActive: {
        flex: '1 1 auto',
        minWidth: '50px',
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
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
    advancedToggle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '8px 12px',
        fontSize: '12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    constraintRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        minWidth: '90px',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        accentColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    checkboxText: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    constraintInput: {
        flex: 1,
        minWidth: '60px',
        height: '28px',
        padding: '0 8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    smallUnitButton: {
        height: '28px',
        padding: '0 10px',
        fontSize: '10px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    smallUnitButtonActive: {
        height: '28px',
        padding: '0 10px',
        fontSize: '10px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    constraintsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    constraintsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingLeft: '4px',
    },
};
function ConstraintInput({ label, constraint, onChange, onToggle, units, disabled, placeholder = '0', }) {
    const isEnabled = constraint?.enabled ?? false;
    const value = constraint?.value ?? 0;
    const unit = constraint?.unit ?? 'px';
    const handleValueChange = useCallback((e) => {
        const newValue = parseInt(e.target.value, 10) || 0;
        onChange({
            value: newValue,
            unit,
            enabled: isEnabled,
        });
    }, [unit, isEnabled, onChange]);
    const handleUnitChange = useCallback((newUnit) => {
        onChange({
            value,
            unit: newUnit,
            enabled: isEnabled,
        });
    }, [value, isEnabled, onChange]);
    const handleToggle = useCallback((e) => {
        onToggle(e.target.checked);
    }, [onToggle]);
    return (_jsxs("div", { style: styles.constraintRow, children: [_jsxs("label", { style: styles.checkboxLabel, children: [_jsx("input", { type: "checkbox", checked: isEnabled, onChange: handleToggle, disabled: disabled, style: styles.checkbox }), _jsx("span", { style: styles.checkboxText, children: label })] }), _jsx("input", { type: "number", min: 0, value: isEnabled ? value : '', onChange: handleValueChange, disabled: disabled || !isEnabled, placeholder: placeholder, style: {
                    ...styles.constraintInput,
                    ...(disabled || !isEnabled ? { opacity: 0.5 } : {}),
                } }), _jsx("div", { style: { display: 'flex', gap: '2px', flexShrink: 0 }, children: units.map((u) => (_jsx("button", { type: "button", onClick: () => handleUnitChange(u), disabled: disabled || !isEnabled, style: {
                        ...(unit === u && isEnabled ? styles.smallUnitButtonActive : styles.smallUnitButton),
                        ...(disabled || !isEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                    }, children: u }, u))) })] }));
}
// =============================================================================
// DimensionsField Component
// =============================================================================
function DimensionsFieldInner({ value, onChange, label, readOnly, showHeightControls = true, showMinControls = true, defaultAdvancedMode = false, }) {
    const currentValue = value || DEFAULT_VALUE;
    const [advancedMode, setAdvancedMode] = useState(currentValue.advancedMode ?? defaultAdvancedMode);
    // Handle mode change
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
    // Handle max width value change
    const handleMaxWidthChange = useCallback((constraint) => {
        onChange({
            ...currentValue,
            maxWidth: constraint,
        });
    }, [currentValue, onChange]);
    // Handle max width toggle
    const handleMaxWidthToggle = useCallback((enabled) => {
        onChange({
            ...currentValue,
            maxWidth: {
                ...currentValue.maxWidth,
                enabled,
            },
        });
    }, [currentValue, onChange]);
    // Handle min width change
    const handleMinWidthChange = useCallback((constraint) => {
        onChange({
            ...currentValue,
            minWidth: constraint,
        });
    }, [currentValue, onChange]);
    // Handle min width toggle
    const handleMinWidthToggle = useCallback((enabled) => {
        onChange({
            ...currentValue,
            minWidth: enabled
                ? { value: currentValue.minWidth?.value ?? 0, unit: currentValue.minWidth?.unit ?? 'px', enabled: true }
                : { ...currentValue.minWidth, enabled: false },
        });
    }, [currentValue, onChange]);
    // Handle min height change
    const handleMinHeightChange = useCallback((constraint) => {
        onChange({
            ...currentValue,
            minHeight: constraint,
        });
    }, [currentValue, onChange]);
    // Handle min height toggle
    const handleMinHeightToggle = useCallback((enabled) => {
        onChange({
            ...currentValue,
            minHeight: enabled
                ? { value: currentValue.minHeight?.value ?? 0, unit: currentValue.minHeight?.unit ?? 'px', enabled: true }
                : currentValue.minHeight ? { ...currentValue.minHeight, enabled: false } : null,
        });
    }, [currentValue, onChange]);
    // Handle max height change
    const handleMaxHeightChange = useCallback((constraint) => {
        onChange({
            ...currentValue,
            maxHeight: constraint,
        });
    }, [currentValue, onChange]);
    // Handle max height toggle
    const handleMaxHeightToggle = useCallback((enabled) => {
        onChange({
            ...currentValue,
            maxHeight: enabled
                ? { value: currentValue.maxHeight?.value ?? 0, unit: currentValue.maxHeight?.unit ?? 'px', enabled: true }
                : currentValue.maxHeight ? { ...currentValue.maxHeight, enabled: false } : null,
        });
    }, [currentValue, onChange]);
    // Handle alignment change
    const handleAlignmentChange = useCallback((alignment) => {
        onChange({
            ...currentValue,
            alignment,
        });
    }, [currentValue, onChange]);
    // Handle preset selection
    const handlePresetSelect = useCallback((presetValue) => {
        onChange({
            ...currentValue,
            mode: 'contained',
            maxWidth: {
                value: presetValue,
                unit: 'px',
                enabled: true,
            },
        });
    }, [currentValue, onChange]);
    // Handle clear
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    // Handle advanced mode toggle
    const handleAdvancedToggle = useCallback(() => {
        const newAdvancedMode = !advancedMode;
        setAdvancedMode(newAdvancedMode);
        if (value !== null) {
            onChange({
                ...currentValue,
                advancedMode: newAdvancedMode,
            });
        }
    }, [advancedMode, currentValue, onChange, value]);
    // Mode labels
    const modeConfig = [
        { mode: 'full', icon: MoveHorizontal, label: 'Full', title: 'Full width (100%)' },
        { mode: 'contained', icon: Square, label: 'Contain', title: 'Contained (centered with max-width)' },
        { mode: 'custom', icon: SlidersHorizontal, label: 'Custom', title: 'Custom width settings' },
    ];
    const alignmentConfig = [
        { alignment: 'left', icon: AlignStartHorizontal, title: 'Align left' },
        { alignment: 'center', icon: AlignCenterHorizontal, title: 'Align center' },
        { alignment: 'right', icon: AlignEndHorizontal, title: 'Align right' },
    ];
    const showWidthControls = currentValue.mode !== 'full';
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsx("label", { style: styles.label, children: label })), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.modeGroup, children: modeConfig.map(({ mode, icon: Icon, label: modeLabel, title }) => {
                    const isActive = currentValue.mode === mode;
                    return (_jsxs("button", { type: "button", onClick: () => handleModeChange(mode), disabled: readOnly, style: isActive ? styles.modeButtonActive : styles.modeButton, title: title, children: [_jsx(Icon, { style: { width: '14px', height: '14px' } }), modeLabel] }, mode));
                }) }), showWidthControls && (_jsxs("div", { style: styles.controlsPanel, children: [_jsxs("div", { style: styles.presetGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Presets" }), _jsx("div", { style: styles.presetButtons, children: WIDTH_PRESETS.map((preset) => {
                                    const isActive = currentValue.maxWidth.value === preset.value &&
                                        currentValue.maxWidth.unit === 'px' &&
                                        currentValue.maxWidth.enabled;
                                    return (_jsx("button", { type: "button", onClick: () => handlePresetSelect(preset.value), disabled: readOnly, style: isActive ? styles.presetButtonActive : styles.presetButton, children: preset.label }, preset.value));
                                }) })] }), !advancedMode && (_jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.sectionLabel, children: "Max Width" }), _jsxs("div", { style: styles.inputRow, children: [_jsx("input", { type: "number", min: 0, value: currentValue.maxWidth.value, onChange: (e) => handleMaxWidthChange({
                                            ...currentValue.maxWidth,
                                            value: parseInt(e.target.value, 10) || 0,
                                        }), disabled: readOnly, style: styles.input }), _jsx("div", { style: styles.unitGroup, children: WIDTH_UNITS.map((unit) => {
                                            const isActive = currentValue.maxWidth.unit === unit;
                                            return (_jsx("button", { type: "button", onClick: () => handleMaxWidthChange({
                                                    ...currentValue.maxWidth,
                                                    unit,
                                                }), disabled: readOnly, style: isActive ? styles.unitButtonActive : styles.unitButton, children: unit }, unit));
                                        }) })] })] })), advancedMode && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: styles.constraintsSection, children: [_jsx("label", { style: styles.sectionLabel, children: "Width Constraints" }), _jsxs("div", { style: styles.constraintsList, children: [showMinControls && (_jsx(ConstraintInput, { label: "Min Width", constraint: currentValue.minWidth, onChange: handleMinWidthChange, onToggle: handleMinWidthToggle, units: WIDTH_UNITS, disabled: readOnly })), _jsx(ConstraintInput, { label: "Max Width", constraint: currentValue.maxWidth, onChange: handleMaxWidthChange, onToggle: handleMaxWidthToggle, units: WIDTH_UNITS, disabled: readOnly })] })] }), showHeightControls && (_jsxs("div", { style: styles.constraintsSection, children: [_jsx("label", { style: styles.sectionLabel, children: "Height Constraints" }), _jsxs("div", { style: styles.constraintsList, children: [showMinControls && (_jsx(ConstraintInput, { label: "Min Height", constraint: currentValue.minHeight, onChange: handleMinHeightChange, onToggle: handleMinHeightToggle, units: HEIGHT_UNITS, disabled: readOnly })), _jsx(ConstraintInput, { label: "Max Height", constraint: currentValue.maxHeight, onChange: handleMaxHeightChange, onToggle: handleMaxHeightToggle, units: HEIGHT_UNITS, disabled: readOnly })] })] }))] }))] })), !showWidthControls && showHeightControls && advancedMode && (_jsxs("div", { style: styles.controlsPanel, children: [_jsx("label", { style: styles.sectionLabel, children: "Height Constraints" }), _jsxs("div", { style: styles.constraintsList, children: [showMinControls && (_jsx(ConstraintInput, { label: "Min Height", constraint: currentValue.minHeight, onChange: handleMinHeightChange, onToggle: handleMinHeightToggle, units: HEIGHT_UNITS, disabled: readOnly })), _jsx(ConstraintInput, { label: "Max Height", constraint: currentValue.maxHeight, onChange: handleMaxHeightChange, onToggle: handleMaxHeightToggle, units: HEIGHT_UNITS, disabled: readOnly })] })] })), _jsxs("div", { style: styles.footer, children: [_jsxs("div", { style: styles.alignGroup, children: [_jsx("label", { style: styles.alignLabel, children: "Align:" }), _jsx("div", { style: styles.alignButtons, children: alignmentConfig.map(({ alignment, icon: Icon, title }) => {
                                    const isActive = currentValue.alignment === alignment;
                                    const isDisabled = readOnly || currentValue.mode === 'full';
                                    return (_jsx("button", { type: "button", onClick: () => handleAlignmentChange(alignment), disabled: isDisabled, style: {
                                            ...(isActive ? styles.alignButtonActive : styles.alignButton),
                                            ...(isDisabled ? styles.alignButtonDisabled : {}),
                                        }, title: title, children: _jsx(Icon, { style: { width: '14px', height: '14px' } }) }, alignment));
                                }) })] }), _jsx("span", { style: styles.summary, children: getDimensionsSummary(currentValue) })] }), (showHeightControls || showMinControls) && (_jsx("button", { type: "button", onClick: handleAdvancedToggle, disabled: readOnly, style: styles.advancedToggle, children: advancedMode ? (_jsxs(_Fragment, { children: [_jsx(ChevronUp, { style: { width: '14px', height: '14px', marginRight: '4px' } }), "Hide Advanced"] })) : (_jsxs(_Fragment, { children: [_jsx(ChevronDown, { style: { width: '14px', height: '14px', marginRight: '4px' } }), "Show Advanced"] })) }))] }));
}
export const DimensionsField = memo(DimensionsFieldInner);
/**
 * Creates a Puck field configuration for dimensions control
 */
export function createDimensionsField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(DimensionsField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, showHeightControls: config.showHeightControls, showMinControls: config.showMinControls, defaultAdvancedMode: config.defaultAdvancedMode })),
    };
}
//# sourceMappingURL=DimensionsField.js.map