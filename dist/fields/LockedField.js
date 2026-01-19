'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * LockedField - Custom Puck field wrapper that prevents accidental edits
 *
 * Wraps a field with a lock/unlock toggle. When locked, the field is read-only.
 * Click the lock icon to toggle editing.
 *
 * Exports:
 * - LockedTextField: A text input with lock/unlock functionality
 * - LockedRadioField: A radio button group with lock/unlock functionality
 * - createLockedTextField: Factory for Puck field configuration
 * - createLockedRadioField: Factory for Puck field configuration
 */
import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
// =============================================================================
// LockedTextField Component
// =============================================================================
export function LockedTextField({ value, onChange, label, placeholder, warningMessage, }) {
    const [isLocked, setIsLocked] = useState(true);
    return (_jsxs("div", { className: "puck-field", children: [_jsxs("div", { className: "puck-field-header", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }, children: [label && (_jsx("label", { style: { fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)' }, children: label })), _jsx("button", { type: "button", onClick: () => setIsLocked(!isLocked), style: {
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: isLocked ? 'var(--puck-color-grey-05)' : 'var(--puck-color-azure-04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                        }, title: isLocked ? 'Click to unlock' : 'Click to lock', children: isLocked ? (_jsx(Lock, { size: 14 })) : (_jsx(Unlock, { size: 14 })) })] }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: "text", value: value || '', onChange: (e) => onChange(e.target.value), disabled: isLocked, placeholder: placeholder, style: {
                            width: '100%',
                            padding: '8px 12px',
                            paddingRight: isLocked ? '32px' : '12px',
                            fontSize: '14px',
                            border: '1px solid var(--puck-color-grey-09)',
                            borderRadius: '6px',
                            background: isLocked ? 'var(--puck-color-grey-11)' : 'var(--puck-color-white)',
                            color: isLocked ? 'var(--puck-color-grey-05)' : 'var(--puck-color-grey-04)',
                            cursor: isLocked ? 'not-allowed' : 'text',
                            outline: 'none',
                            transition: 'all 0.15s ease',
                        } }), isLocked && (_jsx(Lock, { size: 14, style: {
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--puck-color-grey-07)',
                        } }))] }), !isLocked && warningMessage && (_jsxs("p", { style: {
                    marginTop: '6px',
                    fontSize: '12px',
                    color: 'var(--puck-color-grey-05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }, children: [_jsx("span", { style: { color: 'var(--puck-color-rose-07)' }, children: "\u26A0" }), warningMessage] }))] }));
}
// =============================================================================
// LockedRadioField Component
// =============================================================================
export function LockedRadioField({ value, onChange, label, options, warningMessage, }) {
    const [isLocked, setIsLocked] = useState(true);
    return (_jsxs("div", { className: "puck-field", children: [_jsxs("div", { className: "puck-field-header", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }, children: [label && (_jsx("label", { style: { fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)' }, children: label })), _jsx("button", { type: "button", onClick: () => setIsLocked(!isLocked), style: {
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: isLocked ? 'var(--puck-color-grey-05)' : 'var(--puck-color-azure-04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                        }, title: isLocked ? 'Click to unlock' : 'Click to lock', children: isLocked ? (_jsx(Lock, { size: 14 })) : (_jsx(Unlock, { size: 14 })) })] }), _jsx("div", { style: {
                    display: 'flex',
                    border: '1px solid var(--puck-color-grey-09)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    opacity: isLocked ? 0.6 : 1,
                    pointerEvents: isLocked ? 'none' : 'auto',
                }, children: options.map((option, index) => (_jsx("button", { type: "button", onClick: () => onChange(option.value), disabled: isLocked, style: {
                        flex: 1,
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: 'none',
                        borderRight: index < options.length - 1 ? '1px solid var(--puck-color-grey-09)' : 'none',
                        background: value === option.value
                            ? 'var(--puck-color-azure-12)'
                            : 'var(--puck-color-white)',
                        color: value === option.value
                            ? 'var(--puck-color-azure-04)'
                            : 'var(--puck-color-grey-05)',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                    }, children: option.label }, String(option.value)))) }), !isLocked && warningMessage && (_jsxs("p", { style: {
                    marginTop: '6px',
                    fontSize: '12px',
                    color: 'var(--puck-color-grey-05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }, children: [_jsx("span", { style: { color: 'var(--puck-color-rose-07)' }, children: "\u26A0" }), warningMessage] }))] }));
}
// =============================================================================
// Field Configuration Factories
// =============================================================================
/**
 * Creates a Puck field configuration for a locked text input
 */
export function createLockedTextField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange }) => (_jsx(LockedTextField, { value: value, onChange: onChange, label: config.label, placeholder: config.placeholder, warningMessage: config.warningMessage })),
    };
}
/**
 * Creates a Puck field configuration for a locked radio button group
 */
export function createLockedRadioField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange }) => (_jsx(LockedRadioField, { value: value, onChange: onChange, label: config.label, options: config.options, warningMessage: config.warningMessage })),
    };
}
// =============================================================================
// Pre-built Field Definitions
// =============================================================================
/**
 * Pre-built locked slug field - prevents accidental URL changes
 *
 * Use in Puck root config:
 * ```tsx
 * root: {
 *   fields: {
 *     slug: lockedSlugField,
 *   }
 * }
 * ```
 */
export const lockedSlugField = createLockedTextField({
    label: 'Slug',
    placeholder: 'page-slug',
    warningMessage: 'Changing may break existing links',
});
/**
 * Pre-built locked isHomepage field - prevents accidental homepage changes
 *
 * Use in Puck root config:
 * ```tsx
 * root: {
 *   fields: {
 *     isHomepage: lockedHomepageField,
 *   }
 * }
 * ```
 */
export const lockedHomepageField = createLockedRadioField({
    label: 'Homepage',
    options: [
        { label: 'No', value: false },
        { label: 'Yes', value: true },
    ],
    warningMessage: 'Only one page can be the homepage',
});
//# sourceMappingURL=LockedField.js.map