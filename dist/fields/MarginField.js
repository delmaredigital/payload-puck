'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MarginField - Custom Puck field for component margin/spacing control
 *
 * Similar to PaddingField but specifically for outer margin.
 * Provides:
 * - 4 number inputs for top/right/bottom/left
 * - Link/unlink toggle button (when linked, all values sync)
 * - Unit selector (px, rem)
 */
import { useCallback, memo } from 'react';
import { Link, Unlink } from 'lucide-react';
// =============================================================================
// Default Value
// =============================================================================
const DEFAULT_VALUE = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: 'px',
    linked: true,
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
    linkButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        padding: 0,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    linkButtonActive: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        padding: 0,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '8px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '6px',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    inputLabel: {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--theme-elevation-500)',
        width: '24px',
        textAlign: 'right',
        flexShrink: 0,
    },
    input: {
        height: '28px',
        width: '100%',
        padding: '0 4px',
        textAlign: 'center',
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
    },
    unitGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    unitLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    unitButtons: {
        display: 'flex',
        gap: '4px',
    },
    unitButton: {
        height: '28px',
        padding: '0 10px',
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
        padding: '0 10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
    summary: {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: 'var(--theme-elevation-500)',
    },
};
// =============================================================================
// MarginField Component
// =============================================================================
function MarginFieldInner({ value, onChange, label, readOnly, showUnits = true, }) {
    // Use default if no value
    const currentValue = value || DEFAULT_VALUE;
    // Use explicit linked state from value, default to true if not set
    const isLinked = currentValue.linked ?? true;
    // Handle individual side change
    const handleSideChange = useCallback((side, newValue) => {
        if (isLinked) {
            // When linked, update all sides
            onChange({
                ...currentValue,
                top: newValue,
                right: newValue,
                bottom: newValue,
                left: newValue,
                linked: true,
            });
        }
        else {
            // When unlinked, update only the specific side
            onChange({
                ...currentValue,
                [side]: newValue,
                linked: false,
            });
        }
    }, [currentValue, onChange, isLinked]);
    // Handle link toggle
    const handleLinkToggle = useCallback(() => {
        if (isLinked) {
            // Unlinking - keep current values but mark as unlinked
            onChange({
                ...currentValue,
                linked: false,
            });
        }
        else {
            // Linking - set all sides to the top value and mark as linked
            onChange({
                ...currentValue,
                top: currentValue.top,
                right: currentValue.top,
                bottom: currentValue.top,
                left: currentValue.top,
                linked: true,
            });
        }
    }, [currentValue, onChange, isLinked]);
    // Handle unit change
    const handleUnitChange = useCallback((unit) => {
        onChange({
            ...currentValue,
            unit,
        });
    }, [currentValue, onChange]);
    // Render a single side input - compact horizontal layout
    const renderSideInput = (side, sideLabel) => (_jsxs("div", { style: styles.inputRow, children: [_jsx("label", { style: styles.inputLabel, children: sideLabel.charAt(0) }), _jsx("input", { type: "number", min: 0, value: currentValue[side], onChange: (e) => handleSideChange(side, parseInt(e.target.value, 10) || 0), disabled: readOnly, style: styles.input })] }));
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsx("label", { style: styles.label, children: label })), !readOnly && (_jsx("button", { type: "button", onClick: handleLinkToggle, style: isLinked ? styles.linkButtonActive : styles.linkButton, title: isLinked ? 'Click to unlink (set sides individually)' : 'Click to link (all sides same value)', children: isLinked ? (_jsx(Link, { style: { width: '16px', height: '16px' } })) : (_jsx(Unlink, { style: { width: '16px', height: '16px' } })) }))] }), _jsxs("div", { style: styles.grid, children: [renderSideInput('top', 'Top'), renderSideInput('right', 'Right'), renderSideInput('bottom', 'Bottom'), renderSideInput('left', 'Left')] }), showUnits && !readOnly && (_jsxs("div", { style: styles.footer, children: [_jsxs("div", { style: styles.unitGroup, children: [_jsx("label", { style: styles.unitLabel, children: "Unit:" }), _jsx("div", { style: styles.unitButtons, children: ['px', 'rem'].map((unit) => {
                                    const isActive = currentValue.unit === unit;
                                    return (_jsx("button", { type: "button", onClick: () => handleUnitChange(unit), style: isActive ? styles.unitButtonActive : styles.unitButton, children: unit }, unit));
                                }) })] }), _jsx("span", { style: styles.summary, children: isLinked
                            ? `${currentValue.top}${currentValue.unit}`
                            : `${currentValue.top} ${currentValue.right} ${currentValue.bottom} ${currentValue.left}${currentValue.unit}` })] }))] }));
}
export const MarginField = memo(MarginFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for margin/spacing
 */
export function createMarginField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(MarginField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, showUnits: config.showUnits })),
    };
}
//# sourceMappingURL=MarginField.js.map