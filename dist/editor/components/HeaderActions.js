'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useCallback } from 'react';
import { createUsePuck } from '@puckeditor/core';
import { ArrowLeft, Save, ExternalLink, Loader2, Check, MousePointerClick, MousePointer, Upload, AlertTriangle, Eye, } from 'lucide-react';
import { VersionHistory } from './VersionHistory.js';
import { PreviewModeToggle } from './PreviewModeToggle.js';
import { VERSION } from '../../version.js';
// Create usePuck hook for accessing editor state
const usePuck = createUsePuck();
// Shared styles
const styles = {
    buttonBase: {
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '6px',
        transition: 'background-color 0.15s, border-color 0.15s',
        cursor: 'pointer',
        border: 'none',
    },
    buttonSecondary: {
        padding: '6px 12px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        border: '1px solid var(--theme-elevation-200)',
    },
    buttonPrimary: {
        padding: '6px 12px',
        backgroundColor: 'var(--theme-elevation-900)',
        color: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-900)',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    icon: {
        width: '16px',
        height: '16px',
        marginRight: '4px',
        flexShrink: 0,
    },
    iconSmall: {
        width: '14px',
        height: '14px',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
    },
    badgePublished: {
        backgroundColor: 'var(--theme-success-100)',
        color: 'var(--theme-success-700)',
        border: '1px solid var(--theme-success-200)',
    },
    badgeUnpublished: {
        backgroundColor: 'var(--theme-warning-100)',
        color: 'var(--theme-warning-700)',
        border: '1px solid var(--theme-warning-200)',
    },
    badgeDraft: {
        backgroundColor: 'var(--theme-elevation-100)',
        color: 'var(--theme-elevation-600)',
        border: '1px solid var(--theme-elevation-200)',
    },
    statusText: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap',
    },
    unsavedText: {
        fontSize: '12px',
        color: 'var(--theme-warning-600)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
    },
    versionText: {
        fontSize: '10px',
        color: 'var(--theme-elevation-400)',
        fontFamily: 'monospace',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        padding: '4px 8px',
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
    },
    errorButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: 'var(--theme-error-50)',
        border: '1px solid var(--theme-error-200)',
        borderRadius: '6px',
        color: 'var(--theme-error-700)',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'var(--theme-bg)',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '448px',
        width: '100%',
        margin: '0 16px',
        overflow: 'hidden',
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--theme-elevation-150)',
        backgroundColor: 'var(--theme-error-50)',
    },
    modalIconWrapper: {
        flexShrink: 0,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--theme-error-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--theme-elevation-900)',
        margin: 0,
    },
    modalSubtitle: {
        fontSize: '14px',
        color: 'var(--theme-elevation-500)',
        margin: 0,
    },
    modalBody: {
        padding: '16px 20px',
    },
    modalBodyText: {
        fontSize: '14px',
        color: 'var(--theme-elevation-700)',
        margin: 0,
    },
    modalFooter: {
        padding: '16px 20px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderTop: '1px solid var(--theme-elevation-150)',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    toggleContainer: {
        display: 'flex',
        gap: '4px',
    },
    toggleButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '4px',
        transition: 'background-color 0.15s',
        padding: '6px 10px',
        cursor: 'pointer',
    },
    toggleActive: {
        backgroundColor: 'var(--theme-elevation-900)',
        color: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-900)',
    },
    toggleInactive: {
        backgroundColor: 'var(--theme-elevation-100)',
        color: 'var(--theme-elevation-500)',
        border: '1px solid var(--theme-elevation-200)',
    },
};
/**
 * Custom header actions component for the Puck editor
 *
 * Provides standard actions: Back, Edit/Interactive toggle, View Page, Save Draft
 * Also displays save status and last saved time.
 */
export const HeaderActions = memo(function HeaderActions({ children, onBack, onPreview, onSave, onPublish, onUnpublish, isSaving, hasUnsavedChanges, lastSaved, documentStatus, wasPublished, actionsStart, actionsEnd, showSaveDraft = true, showViewPage = true, showInteractiveToggle = false, showPreviewButton = true, onOpenPreview, showVersionHistory = true, pageId, apiEndpoint = '/api/puck/pages', saveError, onDismissError, showPreviewDarkModeToggle = false, previewDarkMode = false, onPreviewDarkModeChange, }) {
    const appState = usePuck((s) => s.appState);
    const dispatch = usePuck((s) => s.dispatch);
    const isInteractive = appState.ui.previewMode === 'interactive';
    const togglePreviewMode = useCallback(() => {
        dispatch({
            type: 'setUi',
            ui: {
                previewMode: isInteractive ? 'edit' : 'interactive',
            },
        });
    }, [dispatch, isInteractive]);
    const handleSaveClick = useCallback(() => {
        onSave(appState.data);
    }, [onSave, appState.data]);
    const handlePublishClick = useCallback(() => {
        if (onPublish) {
            onPublish(appState.data);
        }
    }, [onPublish, appState.data]);
    return (_jsxs(_Fragment, { children: [actionsStart, _jsxs("button", { type: "button", onClick: onBack, style: { ...styles.buttonBase, ...styles.buttonSecondary }, children: [_jsx(ArrowLeft, { style: styles.icon }), "Back"] }), _jsxs("span", { style: styles.versionText, children: ["v", VERSION] }), documentStatus && (() => {
                const isPublished = documentStatus === 'published';
                const hasUnpublishedChanges = documentStatus === 'draft' && wasPublished;
                let badgeLabel;
                let badgeStyle;
                if (isPublished) {
                    badgeLabel = 'Published';
                    badgeStyle = { ...styles.badge, ...styles.badgePublished };
                }
                else if (hasUnpublishedChanges) {
                    badgeLabel = 'Unpublished Changes';
                    badgeStyle = { ...styles.badge, ...styles.badgeUnpublished };
                }
                else {
                    badgeLabel = 'Draft';
                    badgeStyle = { ...styles.badge, ...styles.badgeDraft };
                }
                return _jsx("span", { style: badgeStyle, children: badgeLabel });
            })(), showInteractiveToggle && (_jsxs("div", { style: styles.toggleContainer, children: [_jsxs("button", { type: "button", onClick: () => isInteractive && togglePreviewMode(), style: {
                            ...styles.toggleButton,
                            ...(!isInteractive ? styles.toggleActive : styles.toggleInactive),
                        }, children: [_jsx(MousePointer, { style: styles.iconSmall }), "Edit"] }), _jsxs("button", { type: "button", onClick: () => !isInteractive && togglePreviewMode(), style: {
                            ...styles.toggleButton,
                            ...(isInteractive ? styles.toggleActive : styles.toggleInactive),
                        }, children: [_jsx(MousePointerClick, { style: styles.iconSmall }), "Interactive"] })] })), showPreviewDarkModeToggle && onPreviewDarkModeChange && (_jsx(PreviewModeToggle, { isDarkMode: previewDarkMode, onToggle: onPreviewDarkModeChange, disabled: isSaving })), lastSaved && !saveError && (_jsxs("span", { style: styles.statusText, children: [_jsx(Check, { style: { width: '12px', height: '12px', flexShrink: 0 } }), "Saved ", lastSaved.toLocaleTimeString()] })), hasUnsavedChanges && !saveError && (_jsx("span", { style: styles.unsavedText, children: "Unsaved" })), saveError && (_jsxs("button", { type: "button", onClick: () => { }, style: styles.errorButton, children: [_jsx(AlertTriangle, { style: { width: '16px', height: '16px', color: 'var(--theme-error-500)', flexShrink: 0 } }), "Error"] })), saveError && (_jsx("div", { style: styles.modalOverlay, onClick: onDismissError, children: _jsxs("div", { style: styles.modalContainer, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: styles.modalHeader, children: [_jsx("div", { style: styles.modalIconWrapper, children: _jsx(AlertTriangle, { style: { width: '20px', height: '20px', color: 'var(--theme-error-600)' } }) }), _jsxs("div", { children: [_jsx("h3", { style: styles.modalTitle, children: "Save Failed" }), _jsx("p", { style: styles.modalSubtitle, children: "Unable to save your changes" })] })] }), _jsx("div", { style: styles.modalBody, children: _jsx("p", { style: styles.modalBodyText, children: saveError }) }), _jsx("div", { style: styles.modalFooter, children: _jsx("button", { type: "button", onClick: onDismissError, style: { ...styles.buttonBase, ...styles.buttonPrimary }, children: "Close" }) })] }) })), showPreviewButton && onOpenPreview && (_jsxs("button", { type: "button", onClick: onOpenPreview, disabled: isSaving, style: {
                    ...styles.buttonBase,
                    ...styles.buttonPrimary,
                    ...(isSaving ? styles.buttonDisabled : {}),
                }, children: [_jsx(Eye, { style: styles.icon }), "Preview"] })), showViewPage && (_jsxs("button", { type: "button", onClick: onPreview, style: { ...styles.buttonBase, ...styles.buttonSecondary }, children: [_jsx(ExternalLink, { style: styles.icon }), "View"] })), showVersionHistory && pageId && (_jsx(VersionHistory, { pageId: pageId, apiEndpoint: apiEndpoint, disabled: isSaving })), showSaveDraft && (_jsxs("button", { type: "button", onClick: handleSaveClick, disabled: isSaving || !hasUnsavedChanges, style: {
                    ...styles.buttonBase,
                    ...styles.buttonSecondary,
                    ...((isSaving || !hasUnsavedChanges) ? styles.buttonDisabled : {}),
                }, children: [isSaving ? (_jsx(Loader2, { style: { ...styles.icon, animation: 'spin 1s linear infinite' } })) : (_jsx(Save, { style: styles.icon })), "Save"] })), onPublish && (_jsxs("button", { type: "button", onClick: handlePublishClick, disabled: isSaving, style: {
                    ...styles.buttonBase,
                    ...styles.buttonPrimary,
                    ...(isSaving ? styles.buttonDisabled : {}),
                }, children: [isSaving ? (_jsx(Loader2, { style: { ...styles.icon, animation: 'spin 1s linear infinite' } })) : (_jsx(Upload, { style: styles.icon })), "Publish"] })), onUnpublish && documentStatus === 'published' && (_jsx("button", { type: "button", onClick: onUnpublish, disabled: isSaving, style: {
                    ...styles.linkButton,
                    ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                }, children: "Unpublish" })), actionsEnd, !onPublish && children] }));
});
//# sourceMappingURL=HeaderActions.js.map