'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ResponsiveVisibilityField - Show/hide elements at different breakpoints
 *
 * Provides a compact visual interface for toggling element visibility
 * at each breakpoint (xs, sm, md, lg, xl). Simple independent toggles
 * like Elementor/Divi - each breakpoint is just on or off.
 */
import { useCallback, memo } from 'react';
import { Smartphone, Tablet, Laptop, Monitor, Eye, EyeOff, } from 'lucide-react';
import { BREAKPOINTS, DEFAULT_VISIBILITY } from './shared';
// =============================================================================
// Breakpoint Icons
// =============================================================================
const BREAKPOINT_ICONS = {
    xs: Smartphone,
    sm: Smartphone,
    md: Tablet,
    lg: Laptop,
    xl: Monitor,
};
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
    warningBadge: {
        fontSize: '12px',
        color: 'var(--theme-warning-500)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    toggleGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
    },
    toggleButton: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '6px 4px',
        borderRadius: '6px',
        flex: '1 1 auto',
        minWidth: '44px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: '1px solid',
    },
    toggleVisible: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: 'rgb(16, 185, 129)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    toggleHidden: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: 'rgb(239, 68, 68)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    toggleDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    toggleLabel: {
        fontSize: '10px',
        fontWeight: 500,
    },
    toggleIcon: {
        position: 'absolute',
        top: '4px',
        right: '4px',
    },
    helpText: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
};
function VisibilityToggle({ breakpoint, label, minWidth, isVisible, onClick, disabled, }) {
    const DeviceIcon = BREAKPOINT_ICONS[breakpoint];
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, title: `${label}${minWidth ? ` (${minWidth}px+)` : ''}: ${isVisible ? 'Visible' : 'Hidden'}`, style: {
            ...styles.toggleButton,
            ...(isVisible ? styles.toggleVisible : styles.toggleHidden),
            ...(disabled ? styles.toggleDisabled : {}),
        }, children: [_jsx(DeviceIcon, { style: { width: '16px', height: '16px' } }), _jsx("span", { style: styles.toggleLabel, children: label }), _jsx("div", { style: styles.toggleIcon, children: isVisible ? (_jsx(Eye, { style: { width: '12px', height: '12px' } })) : (_jsx(EyeOff, { style: { width: '12px', height: '12px' } })) })] }));
}
// =============================================================================
// ResponsiveVisibilityField Component
// =============================================================================
function ResponsiveVisibilityFieldInner({ value, onChange, label, readOnly, }) {
    // Get visibility for a breakpoint (simple lookup, no cascade)
    const getVisibility = useCallback((breakpoint) => {
        const val = value ?? DEFAULT_VISIBILITY;
        // All breakpoints have explicit values, default to true if undefined
        return val[breakpoint] ?? true;
    }, [value]);
    // Toggle visibility for a breakpoint (simple toggle, no cascade)
    const toggleVisibility = useCallback((breakpoint) => {
        const currentVisible = getVisibility(breakpoint);
        const newValue = {
            ...(value ?? DEFAULT_VISIBILITY),
            [breakpoint]: !currentVisible,
        };
        onChange(newValue);
    }, [value, onChange, getVisibility]);
    // Check if any breakpoint is hidden
    const hasHiddenBreakpoints = BREAKPOINTS.some((bp) => !getVisibility(bp.key));
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsx("label", { style: styles.label, children: label })), hasHiddenBreakpoints && (_jsxs("span", { style: styles.warningBadge, children: [_jsx(EyeOff, { style: { width: '12px', height: '12px' } }), "Partially hidden"] }))] }), _jsx("div", { style: styles.toggleGrid, children: BREAKPOINTS.map((bp) => (_jsx(VisibilityToggle, { breakpoint: bp.key, label: bp.label, minWidth: bp.minWidth, isVisible: getVisibility(bp.key), onClick: () => toggleVisibility(bp.key), disabled: readOnly }, bp.key))) }), _jsx("p", { style: styles.helpText, children: "Toggle visibility per screen size. Each breakpoint is independent." })] }));
}
export const ResponsiveVisibilityField = memo(ResponsiveVisibilityFieldInner);
/**
 * Creates a Puck custom field for responsive visibility control.
 *
 * @example
 * ```ts
 * fields: {
 *   visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
 * }
 * ```
 */
export function createResponsiveVisibilityField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(ResponsiveVisibilityField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly })),
    };
}
//# sourceMappingURL=ResponsiveVisibilityField.js.map