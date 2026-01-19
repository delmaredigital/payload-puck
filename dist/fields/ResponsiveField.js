'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ResponsiveField - Generic wrapper for breakpoint-specific field overrides
 *
 * This component wraps any existing field to provide responsive overrides
 * at different breakpoints (xs, sm, md, lg, xl). It uses sparse storage,
 * only storing values for breakpoints that have explicit overrides.
 */
import { useState, useCallback, memo } from 'react';
import { Smartphone, Tablet, Laptop, Monitor, X, } from 'lucide-react';
import { BREAKPOINTS } from './shared';
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
        gap: '12px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-800)',
    },
    overrideBadge: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        backgroundColor: 'var(--theme-elevation-100)',
        padding: '2px 6px',
        borderRadius: '4px',
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
    tabsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '8px',
    },
    tab: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '6px 8px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flex: '1 1 auto',
        minWidth: '52px',
        backgroundColor: 'var(--theme-elevation-100)',
        color: 'var(--theme-elevation-500)',
    },
    tabActive: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '6px 8px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flex: '1 1 auto',
        minWidth: '52px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
    },
    tabDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    overrideIndicator: {
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-elevation-800)',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
    clearOverrideButton: {
        padding: '2px 8px',
        fontSize: '12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    innerFieldContainer: {
        padding: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
    },
};
function BreakpointTab({ breakpoint, label, minWidth, isActive, hasOverride, onClick, disabled, }) {
    const Icon = BREAKPOINT_ICONS[breakpoint];
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, title: minWidth ? `${label} (${minWidth}px+)` : label, style: {
            ...(isActive ? styles.tabActive : styles.tab),
            ...(disabled ? styles.tabDisabled : {}),
        }, children: [_jsx(Icon, { style: { width: '14px', height: '14px' } }), _jsx("span", { children: label }), hasOverride && !isActive && (_jsx("span", { style: styles.overrideIndicator }))] }));
}
// =============================================================================
// ResponsiveField Component
// =============================================================================
function ResponsiveFieldInner({ value, onChange, label, readOnly, renderInnerField, defaultValue, }) {
    const [activeBreakpoint, setActiveBreakpoint] = useState('xs');
    // Get the current value for the active breakpoint
    const getCurrentValue = useCallback(() => {
        if (!value)
            return null;
        if (activeBreakpoint === 'xs') {
            return value.xs ?? defaultValue ?? null;
        }
        const override = value[activeBreakpoint];
        if (override !== undefined) {
            return override;
        }
        const breakpointOrder = ['xl', 'lg', 'md', 'sm', 'xs'];
        const activeIndex = breakpointOrder.indexOf(activeBreakpoint);
        for (let i = activeIndex + 1; i < breakpointOrder.length; i++) {
            const bp = breakpointOrder[i];
            const val = value[bp];
            if (val !== undefined) {
                return val;
            }
        }
        return defaultValue ?? null;
    }, [value, activeBreakpoint, defaultValue]);
    const hasOverride = useCallback((breakpoint) => {
        if (!value)
            return false;
        if (breakpoint === 'xs')
            return false;
        return value[breakpoint] !== undefined;
    }, [value]);
    const getInheritanceSource = useCallback(() => {
        if (!value || activeBreakpoint === 'xs')
            return null;
        if (value[activeBreakpoint] !== undefined)
            return null;
        const breakpointOrder = ['xl', 'lg', 'md', 'sm', 'xs'];
        const activeIndex = breakpointOrder.indexOf(activeBreakpoint);
        for (let i = activeIndex + 1; i < breakpointOrder.length; i++) {
            const bp = breakpointOrder[i];
            if (value[bp] !== undefined) {
                return bp;
            }
        }
        return null;
    }, [value, activeBreakpoint]);
    const handleInnerChange = useCallback((newValue) => {
        if (activeBreakpoint === 'xs') {
            if (newValue === null) {
                onChange(null);
            }
            else {
                onChange({ ...value, xs: newValue });
            }
        }
        else {
            if (newValue === null) {
                if (!value)
                    return;
                const newResponsive = { ...value };
                delete newResponsive[activeBreakpoint];
                onChange(newResponsive);
            }
            else {
                const xs = value?.xs ?? defaultValue;
                if (xs === undefined)
                    return;
                onChange({
                    ...value,
                    xs,
                    [activeBreakpoint]: newValue,
                });
            }
        }
    }, [value, onChange, activeBreakpoint, defaultValue]);
    const handleClearOverride = useCallback(() => {
        if (activeBreakpoint === 'xs' || !value)
            return;
        const newResponsive = { ...value };
        delete newResponsive[activeBreakpoint];
        onChange(newResponsive);
    }, [value, onChange, activeBreakpoint]);
    const handleClearAll = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const currentValue = getCurrentValue();
    const isOverrideBreakpoint = activeBreakpoint !== 'xs';
    const currentHasOverride = hasOverride(activeBreakpoint);
    const inheritanceSource = getInheritanceSource();
    const overrideCount = value
        ? ['sm', 'md', 'lg', 'xl'].filter((bp) => value[bp] !== undefined).length
        : 0;
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [label && (_jsxs("div", { style: styles.labelGroup, children: [_jsx("label", { style: styles.label, children: label }), overrideCount > 0 && (_jsxs("span", { style: styles.overrideBadge, children: [overrideCount, " override", overrideCount !== 1 ? 's' : ''] }))] })), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClearAll, style: styles.clearButton, title: "Clear all values", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.tabsContainer, children: BREAKPOINTS.map((bp) => (_jsx(BreakpointTab, { breakpoint: bp.key, label: bp.label, minWidth: bp.minWidth, isActive: activeBreakpoint === bp.key, hasOverride: hasOverride(bp.key), onClick: () => setActiveBreakpoint(bp.key), disabled: readOnly }, bp.key))) }), _jsxs("div", { style: styles.infoRow, children: [_jsx("span", { children: activeBreakpoint === 'xs' ? ('Extra small screens (0-639px)') : (_jsxs(_Fragment, { children: [BREAKPOINTS.find((bp) => bp.key === activeBreakpoint)?.minWidth, "px and up", !currentHasOverride && inheritanceSource && (_jsxs("span", { style: { color: 'var(--theme-elevation-400)' }, children: [" (inheriting from ", inheritanceSource.toUpperCase(), ")"] }))] })) }), isOverrideBreakpoint && currentHasOverride && !readOnly && (_jsx("button", { type: "button", onClick: handleClearOverride, style: styles.clearOverrideButton, children: "Clear override" }))] }), _jsx("div", { style: styles.innerFieldContainer, children: renderInnerField({
                    value: currentValue,
                    onChange: handleInnerChange,
                    readOnly,
                }) })] }));
}
export const ResponsiveField = memo(ResponsiveFieldInner);
/**
 * Creates a responsive wrapper around any Puck custom field.
 */
export function createResponsiveField(config) {
    const innerFieldConfig = config.innerField({ label: undefined });
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(ResponsiveField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue, renderInnerField: (props) => {
                if (innerFieldConfig.type === 'custom' && innerFieldConfig.render) {
                    return innerFieldConfig.render({
                        field: innerFieldConfig,
                        value: props.value,
                        onChange: props.onChange,
                        readOnly: props.readOnly,
                        name: 'responsive-inner',
                        id: 'responsive-inner',
                    });
                }
                return null;
            } })),
    };
}
//# sourceMappingURL=ResponsiveField.js.map