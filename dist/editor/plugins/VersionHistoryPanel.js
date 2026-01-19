'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, memo } from 'react';
import { createUsePuck } from '@puckeditor/core';
import { Loader2, Check, RotateCcw, AlertCircle } from 'lucide-react';
// Create usePuck hook for accessing editor state and dispatch
const usePuck = createUsePuck();
// Panel styles using Puck's CSS variables
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--puck-color-white)',
    },
    header: {
        padding: '16px',
        borderBottom: '1px solid var(--puck-color-grey-09)',
        flexShrink: 0,
    },
    headerTitle: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--puck-color-grey-02)',
        margin: 0,
    },
    headerSubtitle: {
        fontSize: '12px',
        color: 'var(--puck-color-grey-05)',
        marginTop: '4px',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        gap: '12px',
    },
    loadingIcon: {
        width: '24px',
        height: '24px',
        color: 'var(--puck-color-grey-05)',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '14px',
        color: 'var(--puck-color-grey-05)',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px',
        gap: '8px',
    },
    errorIcon: {
        width: '32px',
        height: '32px',
        color: 'var(--puck-color-red-06)',
    },
    errorText: {
        fontSize: '14px',
        color: 'var(--puck-color-red-06)',
        textAlign: 'center',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 16px',
        gap: '8px',
    },
    emptyText: {
        fontSize: '14px',
        color: 'var(--puck-color-grey-05)',
        textAlign: 'center',
    },
    versionItem: {
        borderRadius: '8px',
        transition: 'background-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        gap: '12px',
        marginBottom: '4px',
    },
    versionInfo: {
        flex: 1,
        minWidth: 0,
    },
    versionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    versionDate: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--puck-color-grey-02)',
    },
    badge: {
        fontSize: '11px',
        fontWeight: 500,
        borderRadius: '4px',
        padding: '2px 6px',
    },
    badgeCurrent: {
        backgroundColor: 'var(--puck-color-azure-11)',
        color: 'var(--puck-color-azure-04)',
    },
    badgePublished: {
        backgroundColor: 'var(--puck-color-green-11)',
        color: 'var(--puck-color-green-04)',
    },
    autosaveText: {
        fontSize: '11px',
        color: 'var(--puck-color-grey-06)',
        fontStyle: 'italic',
    },
    versionDetails: {
        fontSize: '12px',
        color: 'var(--puck-color-grey-05)',
        marginTop: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    restoreButton: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--puck-color-grey-04)',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 10px',
        flexShrink: 0,
        background: 'none',
        border: '1px solid var(--puck-color-grey-08)',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    restoreButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    checkIcon: {
        width: '16px',
        height: '16px',
        color: 'var(--puck-color-azure-05)',
        flexShrink: 0,
    },
    successMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: 'var(--puck-color-green-11)',
        borderRadius: '8px',
        marginBottom: '8px',
    },
    successText: {
        fontSize: '13px',
        color: 'var(--puck-color-green-03)',
        fontWeight: 500,
    },
};
/**
 * Version history panel for the Puck plugin rail
 *
 * Displays a list of previous versions with the ability to restore them.
 * Uses Puck's dispatch to update editor state without page reload.
 */
export const VersionHistoryPanel = memo(function VersionHistoryPanel({ pageId, apiEndpoint = '/api/puck/pages', onRestoreSuccess, }) {
    const dispatch = usePuck((s) => s.dispatch);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);
    const [versions, setVersions] = useState([]);
    const [error, setError] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Fetch versions on mount
    const fetchVersions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${apiEndpoint}/${pageId}/versions?limit=20`;
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    setError('Version history is not available for this page.');
                }
                else {
                    throw new Error('Failed to fetch versions');
                }
                return;
            }
            const data = await response.json();
            // Handle both 'docs' (our API) and 'versions' (Payload direct) response formats
            setVersions(data.docs || data.versions || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load versions');
            console.error('Error fetching versions:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, pageId]);
    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);
    // Handle version restore
    const handleRestore = useCallback(async (version) => {
        if (!confirm(`Restore this version from ${formatDate(version.updatedAt)}? This will replace your current content.`)) {
            return;
        }
        setIsRestoring(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // Call restore endpoint
            const response = await fetch(`${apiEndpoint}/${pageId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId: version.id }),
            });
            if (!response.ok) {
                throw new Error('Failed to restore version');
            }
            const result = await response.json();
            const restoredDoc = result.doc;
            // Update Puck editor state with restored data
            if (restoredDoc?.puckData) {
                dispatch({
                    type: 'setData',
                    data: restoredDoc.puckData,
                });
            }
            // Show success message
            setSuccessMessage(`Restored version from ${formatDate(version.updatedAt)}`);
            setTimeout(() => setSuccessMessage(null), 3000);
            // Notify parent to mark as clean
            onRestoreSuccess?.();
            // Refresh version list
            fetchVersions();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restore version');
            console.error('Error restoring version:', err);
        }
        finally {
            setIsRestoring(false);
        }
    }, [apiEndpoint, pageId, dispatch, onRestoreSuccess, fetchVersions]);
    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    // Format time for display
    function formatTime(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return (_jsxs("div", { style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("h3", { style: styles.headerTitle, children: "Version History" }), !isLoading && !error && versions.length > 0 && (_jsxs("div", { style: styles.headerSubtitle, children: [versions.length, " version", versions.length !== 1 ? 's' : '', " available"] }))] }), _jsxs("div", { style: styles.content, children: [successMessage && (_jsxs("div", { style: styles.successMessage, children: [_jsx(Check, { style: { width: '16px', height: '16px', color: 'var(--puck-color-green-04)' } }), _jsx("span", { style: styles.successText, children: successMessage })] })), isLoading ? (_jsxs("div", { style: styles.loadingContainer, children: [_jsx(Loader2, { style: styles.loadingIcon }), _jsx("span", { style: styles.loadingText, children: "Loading versions..." })] })) : error ? (_jsxs("div", { style: styles.errorContainer, children: [_jsx(AlertCircle, { style: styles.errorIcon }), _jsx("div", { style: styles.errorText, children: error })] })) : versions.length === 0 ? (_jsx("div", { style: styles.emptyContainer, children: _jsxs("div", { style: styles.emptyText, children: ["No version history available yet.", _jsx("br", {}), "Versions are created when you save or publish."] }) })) : (versions.map((version, index) => (_jsxs("div", { style: {
                            ...styles.versionItem,
                            backgroundColor: hoveredIndex === index ? 'var(--puck-color-grey-11)' : 'transparent',
                        }, onMouseEnter: () => setHoveredIndex(index), onMouseLeave: () => setHoveredIndex(null), children: [_jsxs("div", { style: styles.versionInfo, children: [_jsxs("div", { style: styles.versionHeader, children: [_jsx("span", { style: styles.versionDate, children: formatDate(version.updatedAt) }), index === 0 && (_jsx("span", { style: { ...styles.badge, ...styles.badgeCurrent }, children: "Current" })), version.version._status === 'published' && (_jsx("span", { style: { ...styles.badge, ...styles.badgePublished }, children: "Published" })), version.autosave && (_jsx("span", { style: styles.autosaveText, children: "auto" }))] }), _jsxs("div", { style: styles.versionDetails, children: [formatTime(version.updatedAt), version.version.title && (_jsxs("span", { children: [" \u00B7 ", version.version.title] }))] })] }), index > 0 && (_jsxs("button", { type: "button", onClick: () => handleRestore(version), disabled: isRestoring, style: {
                                    ...styles.restoreButton,
                                    ...(isRestoring ? styles.restoreButtonDisabled : {}),
                                }, onMouseEnter: (e) => {
                                    if (!isRestoring) {
                                        e.currentTarget.style.backgroundColor = 'var(--puck-color-grey-10)';
                                        e.currentTarget.style.borderColor = 'var(--puck-color-grey-07)';
                                    }
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--puck-color-grey-08)';
                                }, children: [isRestoring ? (_jsx(Loader2, { style: { width: '14px', height: '14px', animation: 'spin 1s linear infinite' } })) : (_jsx(RotateCcw, { style: { width: '14px', height: '14px' } })), "Restore"] })), index === 0 && (_jsx(Check, { style: styles.checkIcon }))] }, version.id))))] })] }));
});
//# sourceMappingURL=VersionHistoryPanel.js.map