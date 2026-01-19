'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AlignmentField - Icon toggle buttons for text/content alignment
 *
 * Replaces select dropdowns with intuitive icon toggles for
 * left, center, right alignment.
 */
import { useCallback, memo } from 'react';
import { AlignLeft, AlignCenter, AlignRight, X, } from 'lucide-react';
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
        flexWrap: 'wrap',
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
// AlignmentField Component
// =============================================================================
function AlignmentFieldInner({ value, onChange, label = 'Alignment', readOnly, defaultValue = 'left', }) {
    const currentValue = value ?? defaultValue;
    const handleChange = useCallback((alignment) => {
        onChange(alignment);
    }, [onChange]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const alignments = [
        { value: 'left', icon: AlignLeft, title: 'Align left' },
        { value: 'center', icon: AlignCenter, title: 'Align center' },
        { value: 'right', icon: AlignRight, title: 'Align right' },
    ];
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.buttonGroup, children: alignments.map(({ value: alignment, icon: Icon, title }) => {
                    const isActive = currentValue === alignment;
                    return (_jsx("button", { type: "button", onClick: () => handleChange(alignment), disabled: readOnly, style: {
                            ...(isActive ? styles.buttonActive : styles.button),
                            ...(readOnly ? styles.buttonDisabled : {}),
                        }, title: title, children: _jsx(Icon, { style: { width: '16px', height: '16px' } }) }, alignment));
                }) })] }));
}
export const AlignmentField = memo(AlignmentFieldInner);
/**
 * Creates a Puck field configuration for alignment control
 *
 * @example
 * ```ts
 * fields: {
 *   alignment: createAlignmentField({ label: 'Text Alignment' }),
 * }
 * ```
 */
export function createAlignmentField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(AlignmentField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue })),
    };
}
//# sourceMappingURL=AlignmentField.js.map