'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, memo, useEffect } from 'react';
import { X, ExternalLink, AlertTriangle, } from 'lucide-react';
import { PageRenderer } from '../../render/PageRenderer.js';
// Styles
const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        backgroundColor: 'var(--theme-bg)',
    },
    controlPanel: {
        position: 'fixed',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-end',
    },
    controlCard: {
        backgroundColor: 'var(--theme-bg)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--theme-elevation-200)',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-bg)',
        backgroundColor: 'var(--theme-elevation-900)',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        border: 'none',
        cursor: 'pointer',
    },
    viewButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        color: 'var(--theme-elevation-600)',
        backgroundColor: 'transparent',
        borderRadius: '6px',
        transition: 'background-color 0.15s, color 0.15s',
        border: 'none',
        cursor: 'pointer',
    },
    unsavedBadge: {
        backgroundColor: 'var(--theme-warning-100)',
        color: 'var(--theme-warning-700)',
        padding: '6px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    content: {
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'var(--theme-bg)',
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--theme-elevation-500)',
    },
    // Navigation dialog styles
    dialogOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContainer: {
        backgroundColor: 'var(--theme-bg)',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '448px',
        width: '100%',
        margin: '0 16px',
        overflow: 'hidden',
    },
    dialogHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--theme-elevation-200)',
        backgroundColor: 'var(--theme-warning-50)',
    },
    dialogIconWrapper: {
        flexShrink: 0,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-warning-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogTitle: {
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--theme-elevation-900)',
        margin: 0,
    },
    dialogSubtitle: {
        fontSize: '14px',
        color: 'var(--theme-elevation-500)',
        margin: 0,
    },
    dialogBody: {
        padding: '16px 20px',
    },
    dialogBodyText: {
        fontSize: '14px',
        color: 'var(--theme-elevation-700)',
        margin: 0,
        marginBottom: '8px',
    },
    dialogUrl: {
        fontSize: '14px',
        fontFamily: 'monospace',
        backgroundColor: 'var(--theme-elevation-100)',
        padding: '8px 12px',
        borderRadius: '4px',
        color: 'var(--theme-elevation-800)',
        wordBreak: 'break-all',
    },
    dialogWarning: {
        fontSize: '14px',
        color: 'var(--theme-warning-600)',
        marginTop: '12px',
        fontWeight: 500,
    },
    dialogFooter: {
        padding: '16px 20px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderTop: '1px solid var(--theme-elevation-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    buttonSecondary: {
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-700)',
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        cursor: 'pointer',
    },
    buttonPrimary: {
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-bg)',
        backgroundColor: 'var(--theme-elevation-900)',
        border: 'none',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        cursor: 'pointer',
    },
    buttonDanger: {
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-error-700)',
        backgroundColor: 'var(--theme-error-50)',
        border: '1px solid var(--theme-error-200)',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        cursor: 'pointer',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    icon: {
        width: '16px',
        height: '16px',
    },
};
/**
 * Full-screen preview modal with client-side rendering
 *
 * Renders the current editor data directly using PageRenderer.
 * Links prompt for confirmation before navigating (with option to save first).
 *
 * Features:
 * - Zero consumer setup required
 * - Shows current editor state (including unsaved changes)
 * - Interactive elements (accordions, hover states) still work
 * - Links show confirmation dialog before navigating
 */
export const PreviewModal = memo(function PreviewModal({ isOpen, onClose, data, pageTitle, onOpenInNewTab, layouts, hasUnsavedChanges = false, onSave, isSaving = false, editorStylesheets, editorCss, }) {
    // Navigation confirmation state
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [viewButtonHovered, setViewButtonHovered] = useState(false);
    // Inject stylesheets into document head when modal is open
    useEffect(() => {
        if (!isOpen)
            return;
        const injectedElements = [];
        // Inject external stylesheets
        if (editorStylesheets && editorStylesheets.length > 0) {
            editorStylesheets.forEach((href, index) => {
                const linkId = `puck-preview-stylesheet-${index}`;
                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link');
                    link.id = linkId;
                    link.rel = 'stylesheet';
                    link.href = href;
                    document.head.appendChild(link);
                    injectedElements.push(link);
                }
            });
        }
        // Inject custom CSS
        if (editorCss) {
            const styleId = 'puck-preview-custom-css';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = editorCss;
                document.head.appendChild(style);
                injectedElements.push(style);
            }
        }
        // Cleanup: remove injected elements when modal closes
        return () => {
            injectedElements.forEach((el) => el.remove());
        };
    }, [isOpen, editorStylesheets, editorCss]);
    // Handle escape key
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (pendingNavigation) {
                    setPendingNavigation(null);
                }
                else {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, pendingNavigation, onClose]);
    // Intercept link clicks
    const handleContentClick = useCallback((e) => {
        const target = e.target;
        const anchor = target.closest('a');
        if (anchor) {
            const href = anchor.getAttribute('href');
            // Allow hash-only links (scroll to section on same page)
            if (href?.startsWith('#') && !href.includes('/')) {
                return;
            }
            // Block navigation and show confirmation
            e.preventDefault();
            e.stopPropagation();
            if (href) {
                setPendingNavigation(href);
            }
        }
    }, []);
    // Handle navigation after confirmation
    const handleNavigate = useCallback((saveFirst) => {
        if (!pendingNavigation)
            return;
        const navigate = () => {
            setIsNavigating(true);
            onClose();
            window.location.href = pendingNavigation;
        };
        if (saveFirst && onSave) {
            onSave().then(navigate).catch(() => {
                setIsNavigating(false);
            });
        }
        else {
            navigate();
        }
    }, [pendingNavigation, onClose, onSave]);
    // Cancel navigation
    const handleCancelNavigation = useCallback(() => {
        setPendingNavigation(null);
    }, []);
    if (!isOpen)
        return null;
    return (_jsxs("div", { style: styles.overlay, children: [_jsxs("div", { style: styles.controlPanel, children: [_jsxs("div", { style: styles.controlCard, children: [_jsxs("button", { type: "button", onClick: onClose, style: styles.closeButton, title: "Close preview (Esc)", children: [_jsx(X, { style: styles.icon }), "Close Preview"] }), onOpenInNewTab && (_jsxs("button", { type: "button", onClick: onOpenInNewTab, style: {
                                    ...styles.viewButton,
                                    ...(viewButtonHovered ? {
                                        backgroundColor: 'var(--theme-elevation-100)',
                                        color: 'var(--theme-elevation-900)',
                                    } : {}),
                                }, onMouseEnter: () => setViewButtonHovered(true), onMouseLeave: () => setViewButtonHovered(false), title: "Open published page in new tab", children: [_jsx(ExternalLink, { style: styles.icon }), "View Page"] }))] }), hasUnsavedChanges && (_jsx("div", { style: styles.unsavedBadge, children: "Unsaved changes" }))] }), _jsx("div", { style: styles.content, onClickCapture: handleContentClick, children: data ? (_jsx(PageRenderer, { data: data, layouts: layouts })) : (_jsx("div", { style: styles.emptyState, children: "No content to preview" })) }), pendingNavigation && (_jsx("div", { style: styles.dialogOverlay, children: _jsxs("div", { style: styles.dialogContainer, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: styles.dialogHeader, children: [_jsx("div", { style: styles.dialogIconWrapper, children: _jsx(AlertTriangle, { style: { width: '20px', height: '20px', color: 'var(--theme-warning-600)' } }) }), _jsxs("div", { children: [_jsx("h3", { style: styles.dialogTitle, children: "Navigate away?" }), _jsx("p", { style: styles.dialogSubtitle, children: "This will close the preview" })] })] }), _jsxs("div", { style: styles.dialogBody, children: [_jsx("p", { style: styles.dialogBodyText, children: "You're about to navigate to:" }), _jsx("p", { style: styles.dialogUrl, children: pendingNavigation }), hasUnsavedChanges && (_jsx("p", { style: styles.dialogWarning, children: "You have unsaved changes that will be lost." }))] }), _jsx("div", { style: styles.dialogFooter, children: _jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", onClick: handleCancelNavigation, disabled: isNavigating || isSaving, style: {
                                            ...styles.buttonSecondary,
                                            ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                                        }, children: "Cancel" }), hasUnsavedChanges && onSave && (_jsx("button", { type: "button", onClick: () => handleNavigate(true), disabled: isNavigating || isSaving, style: {
                                            ...styles.buttonPrimary,
                                            ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                                        }, children: isSaving ? 'Saving...' : 'Save & Navigate' })), _jsx("button", { type: "button", onClick: () => handleNavigate(false), disabled: isNavigating || isSaving, style: {
                                            ...(hasUnsavedChanges ? styles.buttonDanger : styles.buttonPrimary),
                                            ...((isNavigating || isSaving) ? styles.buttonDisabled : {}),
                                        }, children: isNavigating ? 'Navigating...' : hasUnsavedChanges ? 'Navigate without saving' : 'Navigate' })] }) })] }) }))] }));
});
//# sourceMappingURL=PreviewModal.js.map