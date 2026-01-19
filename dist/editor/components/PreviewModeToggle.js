'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '2px',
        backgroundColor: 'var(--puck-color-grey-11, #e8e8e8)',
        borderRadius: '6px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.15s, color 0.15s',
    },
    buttonActive: {
        backgroundColor: 'var(--puck-color-white, #ffffff)',
        color: 'var(--puck-color-grey-02, #3d3d3d)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    buttonInactive: {
        backgroundColor: 'transparent',
        color: 'var(--puck-color-grey-05, #8f8f8f)',
    },
    icon: {
        width: '14px',
        height: '14px',
    },
};
/**
 * Toggle button for switching preview iframe between light/dark modes.
 *
 * This controls the preview content's dark mode independently from the
 * editor UI dark mode. Useful for testing how the page looks in both modes.
 *
 * @example
 * ```tsx
 * const [previewDarkMode, setPreviewDarkMode] = useState(false)
 *
 * <PreviewModeToggle
 *   isDarkMode={previewDarkMode}
 *   onToggle={setPreviewDarkMode}
 * />
 * ```
 */
export const PreviewModeToggle = memo(function PreviewModeToggle({ isDarkMode, onToggle, disabled = false, }) {
    return (_jsxs("div", { style: {
            ...styles.container,
            ...(disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}),
        }, title: "Toggle preview dark/light mode", children: [_jsx("button", { type: "button", onClick: () => onToggle(false), style: {
                    ...styles.button,
                    ...(!isDarkMode ? styles.buttonActive : styles.buttonInactive),
                }, "aria-label": "Light mode preview", "aria-pressed": !isDarkMode, children: _jsx(Sun, { style: styles.icon }) }), _jsx("button", { type: "button", onClick: () => onToggle(true), style: {
                    ...styles.button,
                    ...(isDarkMode ? styles.buttonActive : styles.buttonInactive),
                }, "aria-label": "Dark mode preview", "aria-pressed": isDarkMode, children: _jsx(Moon, { style: styles.icon }) })] }));
});
//# sourceMappingURL=PreviewModeToggle.js.map