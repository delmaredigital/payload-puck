'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ContentAlignmentField - Visual 3x3 grid selector for content positioning
 *
 * A d-pad style control for selecting content alignment within a container.
 * Works with both Flexbox (justify-content + align-items) and Grid (place-content).
 */
import { useCallback, memo } from 'react';
import { X } from 'lucide-react';
// =============================================================================
// Constants
// =============================================================================
const DEFAULT_ALIGNMENT = {
    horizontal: 'center',
    vertical: 'center',
};
/** Grid positions in order (row by row) */
const POSITIONS = [
    { h: 'start', v: 'start', label: 'top-left' },
    { h: 'center', v: 'start', label: 'top-center' },
    { h: 'end', v: 'start', label: 'top-right' },
    { h: 'start', v: 'center', label: 'center-left' },
    { h: 'center', v: 'center', label: 'center' },
    { h: 'end', v: 'center', label: 'center-right' },
    { h: 'start', v: 'end', label: 'bottom-left' },
    { h: 'center', v: 'end', label: 'bottom-center' },
    { h: 'end', v: 'end', label: 'bottom-right' },
];
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
    gridContainer: {
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 28px)',
        gridTemplateRows: 'repeat(3, 28px)',
        gap: '3px',
        padding: '4px',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-150)',
    },
    cell: {
        width: '28px',
        height: '28px',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
    },
    cellActive: {
        width: '28px',
        height: '28px',
        border: '2px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
    },
    cellHover: {
        borderColor: 'var(--theme-elevation-400)',
        backgroundColor: 'var(--theme-elevation-50)',
    },
    cellDisabled: {
        cursor: 'not-allowed',
        opacity: 0.5,
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-elevation-400)',
    },
    dotActive: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-bg)',
    },
    preview: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
    },
};
// =============================================================================
// ContentAlignmentField Component
// =============================================================================
function ContentAlignmentFieldInner({ value, onChange, label = 'Content Alignment', readOnly, defaultValue = DEFAULT_ALIGNMENT, }) {
    const currentValue = value || defaultValue;
    const handleCellClick = useCallback((horizontal, vertical) => {
        if (readOnly)
            return;
        onChange({ horizontal, vertical });
    }, [onChange, readOnly]);
    const handleClear = useCallback(() => {
        onChange(null);
    }, [onChange]);
    const isActive = (h, v) => currentValue.horizontal === h && currentValue.vertical === v;
    // Human-readable label for current position
    const getPositionLabel = (h, v) => {
        const vLabel = v === 'start' ? 'Top' : v === 'end' ? 'Bottom' : 'Middle';
        const hLabel = h === 'start' ? 'Left' : h === 'end' ? 'Right' : 'Center';
        if (h === 'center' && v === 'center')
            return 'Center';
        return `${vLabel} ${hLabel}`;
    };
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("label", { style: styles.label, children: label }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClear, style: styles.clearButton, title: "Reset to default", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), _jsx("div", { style: styles.gridContainer, children: _jsx("div", { style: styles.grid, children: POSITIONS.map(({ h, v, label: posLabel }) => {
                        const active = isActive(h, v);
                        return (_jsx("button", { type: "button", onClick: () => handleCellClick(h, v), disabled: readOnly, style: {
                                ...(active ? styles.cellActive : styles.cell),
                                ...(readOnly ? styles.cellDisabled : {}),
                            }, title: getPositionLabel(h, v), "aria-label": getPositionLabel(h, v), "aria-pressed": active, children: _jsx("span", { style: active ? styles.dotActive : styles.dot }) }, posLabel));
                    }) }) }), _jsx("div", { style: styles.preview, children: getPositionLabel(currentValue.horizontal, currentValue.vertical) })] }));
}
export const ContentAlignmentField = memo(ContentAlignmentFieldInner);
// =============================================================================
// CSS Helper Utilities
// =============================================================================
/**
 * Convert ContentAlignmentValue to Flexbox CSS properties
 * Use this when the container is display: flex
 */
export function alignmentToFlexCSS(alignment) {
    if (!alignment)
        return {};
    const justifyMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
    };
    const alignMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
    };
    return {
        justifyContent: justifyMap[alignment.horizontal],
        alignItems: alignMap[alignment.vertical],
    };
}
/**
 * Convert ContentAlignmentValue to Grid CSS properties
 * Use this when the container is display: grid
 */
export function alignmentToGridCSS(alignment) {
    if (!alignment)
        return {};
    const map = {
        start: 'start',
        center: 'center',
        end: 'end',
    };
    return {
        justifyContent: map[alignment.horizontal],
        alignContent: map[alignment.vertical],
    };
}
/**
 * Convert ContentAlignmentValue to place-self CSS for grid items
 * Use this on individual items within a grid
 */
export function alignmentToPlaceSelfCSS(alignment) {
    if (!alignment)
        return {};
    const map = {
        start: 'start',
        center: 'center',
        end: 'end',
    };
    return {
        placeSelf: `${map[alignment.vertical]} ${map[alignment.horizontal]}`,
    };
}
/**
 * Get Tailwind classes for alignment
 * Returns both justify-* and items-* classes
 */
export function alignmentToTailwind(alignment) {
    if (!alignment)
        return '';
    const justifyMap = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
    };
    const alignMap = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
    };
    return `${justifyMap[alignment.horizontal]} ${alignMap[alignment.vertical]}`;
}
/**
 * Creates a Puck field configuration for content alignment
 *
 * @example
 * ```ts
 * fields: {
 *   contentAlignment: createContentAlignmentField({ label: 'Align Content' }),
 * }
 * ```
 */
export function createContentAlignmentField(config = {}) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(ContentAlignmentField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, defaultValue: config.defaultValue })),
    };
}
//# sourceMappingURL=ContentAlignmentField.js.map