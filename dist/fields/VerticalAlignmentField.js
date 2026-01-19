'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VerticalAlignmentField - Icon toggle buttons for vertical/self alignment
 *
 * Used for grid item self-alignment (e.g., in TextImageSplit)
 * Controls how an item aligns itself within its grid/flex cell.
 */
import { useCallback, memo } from 'react';
import { AlignStartVertical, AlignCenterVertical, AlignEndVertical, X, } from 'lucide-react';
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
// VerticalAlignmentField Component
// =============================================================================
function VerticalAlignmentFieldInner({ value, onChange, label = 'Vertical Alignment', readOnly, defaultValue = 'center', }) {
    const currentValue = value ?? defaultValue;
    const handleChange = useCallback((alignment) => {
        onChange(alignment);
    }, [onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const options = [
        { value: 'flex-start', icon: AlignStartVertical, title: 'Top' },
        { value: 'center', icon: AlignCenterVertical, title: 'Center' },
        { value: 'flex-end', icon: AlignEndVertical, title: 'Bottom' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.buttonGroup, children: options.map(({ value: optionValue, icon: Icon, title }) => {
                    const isActive = currentValue === optionValue;
                    return (_jsx("button", { type: "button", onClick: () => handleChange(optionValue), disabled: readOnly, style: {
                            ...(isActive ? styles.buttonActive : styles.button),
                            ...(readOnly ? styles.buttonDisabled : {}),
                        }, title: title, children: _jsx(Icon, { style: { width: '16px', height: '16px' } }) }, optionValue));
                }) })] }));
}
export const VerticalAlignmentField = memo(VerticalAlignmentFieldInner);
/**
 * Creates a Puck field configuration for vertical/self alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   verticalAlignment: createVerticalAlignmentField({ label: 'Vertical Alignment' }),
 * }
 * ```
 */
export function createVerticalAlignmentField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(VerticalAlignmentField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue })),
    };
}
//# sourceMappingURL=VerticalAlignmentField.js.map