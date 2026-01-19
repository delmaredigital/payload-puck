'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ResetField - Custom Puck field for resetting component to defaults
 *
 * This field renders a reset button that clears all customizations
 * and restores the component to its default state.
 *
 * Uses Puck's usePuck hook and dispatch to properly update component data.
 */
import { memo, useCallback } from 'react';
import { createUsePuck } from '@puckeditor/core';
import { RefreshCw } from 'lucide-react';
// Create usePuck hook for accessing editor state
const usePuck = createUsePuck();
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '6px 12px',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};
// =============================================================================
// ResetField Component
// =============================================================================
function ResetFieldInner({ onClick, label = 'Reset to defaults', disabled, }) {
    return (_jsx("div", { className: "puck-field", style: styles.container, children: _jsxs("button", { type: "button", onClick: onClick, disabled: disabled, style: {
                ...styles.button,
                ...(disabled ? styles.buttonDisabled : {}),
            }, onMouseOver: (e) => {
                if (!disabled) {
                    e.currentTarget.style.color = 'var(--theme-error-500)';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }
            }, onMouseOut: (e) => {
                e.currentTarget.style.color = 'var(--theme-elevation-500)';
                e.currentTarget.style.backgroundColor = 'transparent';
            }, children: [_jsx(RefreshCw, { style: { width: '14px', height: '14px' } }), label] }) }));
}
export const ResetField = memo(ResetFieldInner);
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Recursively update a component's props in Puck data structure
 */
function updateComponentInData(data, componentId, newProps) {
    const updateItem = (item) => {
        if (item.props?.id === componentId) {
            return {
                ...item,
                props: {
                    ...newProps,
                    id: componentId,
                },
            };
        }
        return item;
    };
    const updatedContent = data.content.map(updateItem);
    const updatedZones = {};
    if (data.zones) {
        for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
            updatedZones[zoneName] = zoneContent.map(updateItem);
        }
    }
    return {
        ...data,
        content: updatedContent,
        zones: Object.keys(updatedZones).length > 0 ? updatedZones : data.zones,
    };
}
/**
 * Creates a Puck field configuration for a reset button
 */
export function createResetField(config) {
    const ResetFieldWrapper = ({ readOnly }) => {
        const appState = usePuck((s) => s.appState);
        const dispatch = usePuck((s) => s.dispatch);
        const selectedItem = usePuck((s) => s.selectedItem);
        const handleReset = useCallback(() => {
            if (!selectedItem?.props?.id) {
                console.warn('ResetField: No selected item found');
                return;
            }
            const componentId = selectedItem.props.id;
            const updatedData = updateComponentInData(appState.data, componentId, config.defaultProps);
            dispatch({
                type: 'setData',
                data: updatedData,
            });
        }, [appState.data, dispatch, selectedItem]);
        return (_jsx(ResetField, { onClick: handleReset, label: config.label, disabled: readOnly }));
    };
    return {
        type: 'custom',
        render: ({ readOnly }) => _jsx(ResetFieldWrapper, { readOnly: readOnly }),
    };
}
//# sourceMappingURL=ResetField.js.map