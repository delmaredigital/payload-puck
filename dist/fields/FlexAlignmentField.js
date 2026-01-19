'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * FlexAlignmentField - Icon toggle buttons for flexbox alignment properties
 *
 * Provides two specialized fields:
 * - JustifyContentField: Controls main-axis distribution (horizontal in row, vertical in column)
 * - AlignItemsField: Controls cross-axis alignment (vertical in row, horizontal in column)
 */
import { useCallback, memo } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignHorizontalDistributeCenter, GripHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, MoveVertical, X, } from 'lucide-react';
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
        gap: '4px',
    },
    button: {
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
    buttonActive: {
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
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};
// =============================================================================
// JustifyContentField Component
// =============================================================================
function JustifyContentFieldInner({ value, onChange, label = 'Justify Content', readOnly, defaultValue = 'flex-start', }) {
    const currentValue = value ?? defaultValue;
    const handleChange = useCallback((justifyContent) => {
        onChange(justifyContent);
    }, [onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const options = [
        { value: 'flex-start', icon: AlignLeft, title: 'Start' },
        { value: 'center', icon: AlignCenter, title: 'Center' },
        { value: 'flex-end', icon: AlignRight, title: 'End' },
        { value: 'space-between', icon: AlignHorizontalDistributeCenter, title: 'Space Between' },
        { value: 'space-around', icon: GripHorizontal, title: 'Space Around' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.buttonGroup, children: options.map(({ value: optionValue, icon: Icon, title }) => {
                    const isActive = currentValue === optionValue;
                    return (_jsx("button", { type: "button", onClick: () => handleChange(optionValue), disabled: readOnly, style: {
                            ...(isActive ? styles.buttonActive : styles.button),
                            ...(readOnly ? styles.buttonDisabled : {}),
                        }, title: title, children: _jsx(Icon, { style: { width: '16px', height: '16px' } }) }, optionValue));
                }) })] }));
}
export const JustifyContentField = memo(JustifyContentFieldInner);
// =============================================================================
// AlignItemsField Component
// =============================================================================
function AlignItemsFieldInner({ value, onChange, label = 'Align Items', readOnly, defaultValue = 'center', }) {
    const currentValue = value ?? defaultValue;
    const handleChange = useCallback((alignItems) => {
        onChange(alignItems);
    }, [onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const options = [
        { value: 'flex-start', icon: AlignStartVertical, title: 'Start' },
        { value: 'center', icon: AlignCenterVertical, title: 'Center' },
        { value: 'flex-end', icon: AlignEndVertical, title: 'End' },
        { value: 'stretch', icon: MoveVertical, title: 'Stretch' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.buttonGroup, children: options.map(({ value: optionValue, icon: Icon, title }) => {
                    const isActive = currentValue === optionValue;
                    return (_jsx("button", { type: "button", onClick: () => handleChange(optionValue), disabled: readOnly, style: {
                            ...(isActive ? styles.buttonActive : styles.button),
                            ...(readOnly ? styles.buttonDisabled : {}),
                        }, title: title, children: _jsx(Icon, { style: { width: '16px', height: '16px' } }) }, optionValue));
                }) })] }));
}
export const AlignItemsField = memo(AlignItemsFieldInner);
/**
 * Creates a Puck field configuration for flex justify-content control
 *
 * @example
 * ```ts
 * fields: {
 *   justifyContent: createJustifyContentField({ label: 'Justify Content' }),
 * }
 * ```
 */
export function createJustifyContentField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(JustifyContentField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue })),
    };
}
/**
 * Creates a Puck field configuration for flex align-items control
 *
 * @example
 * ```ts
 * fields: {
 *   alignItems: createAlignItemsField({ label: 'Align Items' }),
 * }
 * ```
 */
export function createAlignItemsField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(AlignItemsField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue })),
    };
}
//# sourceMappingURL=FlexAlignmentField.js.map