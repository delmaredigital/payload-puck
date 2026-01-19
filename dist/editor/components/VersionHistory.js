'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { History, Loader2, Check, RotateCcw, X, ChevronDown, } from 'lucide-react';
// Shared styles
const styles = {
    container: {
        position: 'relative',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        padding: '6px 12px',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        border: '1px solid var(--theme-elevation-200)',
        cursor: 'pointer',
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
        width: '12px',
        height: '12px',
        marginLeft: '4px',
        flexShrink: 0,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '4px',
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
        width: '320px',
        maxHeight: '400px',
        overflow: 'hidden',
    },
    header: {
        borderBottom: '1px solid var(--theme-elevation-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
    },
    headerTitle: {
        fontWeight: 500,
        fontSize: '14px',
        color: 'var(--theme-elevation-900)',
    },
    closeButton: {
        color: 'var(--theme-elevation-400)',
        transition: 'color 0.15s',
        padding: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    content: {
        maxHeight: '340px',
        overflowY: 'auto',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
    },
    loadingIcon: {
        width: '20px',
        height: '20px',
        color: 'var(--theme-elevation-400)',
        animation: 'spin 1s linear infinite',
    },
    errorText: {
        fontSize: '14px',
        color: 'var(--theme-error-600)',
        padding: '16px',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: '14px',
        color: 'var(--theme-elevation-500)',
        padding: '16px',
        textAlign: 'center',
    },
    listContainer: {
        padding: '8px',
    },
    versionItem: {
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        gap: '12px',
    },
    versionInfo: {
        flex: 1,
        minWidth: 0,
    },
    versionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    versionDate: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-900)',
    },
    badgeCurrent: {
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '9999px',
        padding: '2px 8px',
        backgroundColor: 'var(--theme-elevation-100)',
        color: 'var(--theme-elevation-700)',
    },
    badgePublished: {
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '9999px',
        padding: '2px 8px',
        backgroundColor: 'var(--theme-success-100)',
        color: 'var(--theme-success-700)',
    },
    autosaveText: {
        fontSize: '12px',
        color: 'var(--theme-elevation-400)',
    },
    versionDetails: {
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        marginTop: '2px',
    },
    restoreButton: {
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--theme-elevation-700)',
        transition: 'color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        flexShrink: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    restoreButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    checkIcon: {
        width: '16px',
        height: '16px',
        color: 'var(--theme-elevation-400)',
        flexShrink: 0,
    },
};
/**
 * Version history dropdown for the Puck editor
 *
 * Shows a list of previous versions with the ability to restore them.
 */
export const VersionHistory = memo(function VersionHistory({ pageId, apiEndpoint = '/api/puck/pages', onRestore, disabled, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [versions, setVersions] = useState([]);
    const [error, setError] = useState(null);
    const [isAvailable, setIsAvailable] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const dropdownRef = useRef(null);
    // Check if versions endpoint is available on mount
    useEffect(() => {
        async function checkAvailability() {
            try {
                const response = await fetch(`${apiEndpoint}/${pageId}/versions?limit=1`, {
                    method: 'GET',
                });
                setIsAvailable(response.status !== 404);
            }
            catch {
                setIsAvailable(false);
            }
        }
        checkAvailability();
    }, [apiEndpoint, pageId]);
    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Fetch versions when dropdown opens
    const fetchVersions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}/versions?limit=20`);
            if (!response.ok) {
                throw new Error('Failed to fetch versions');
            }
            const data = await response.json();
            setVersions(data.docs || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load versions');
            console.error('Error fetching versions:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, pageId]);
    // Fetch versions when opening
    useEffect(() => {
        if (isOpen) {
            fetchVersions();
        }
    }, [isOpen, fetchVersions]);
    // Handle version restore
    const handleRestore = useCallback(async (version) => {
        if (!confirm(`Restore this version from ${formatDate(version.updatedAt)}? This will overwrite current changes.`)) {
            return;
        }
        setIsRestoring(true);
        try {
            const response = await fetch(`${apiEndpoint}/${pageId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId: version.id }),
            });
            if (!response.ok) {
                throw new Error('Failed to restore version');
            }
            onRestore?.(version);
            setIsOpen(false);
            window.location.reload();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restore version');
            console.error('Error restoring version:', err);
        }
        finally {
            setIsRestoring(false);
        }
    }, [apiEndpoint, pageId, onRestore]);
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
    // Don't render if versions endpoint is not available or still checking
    if (isAvailable !== true) {
        return null;
    }
    return (_jsxs("div", { ref: dropdownRef, style: styles.container, children: [_jsxs("button", { type: "button", onClick: () => setIsOpen(!isOpen), disabled: disabled, style: {
                    ...styles.button,
                    ...(disabled ? styles.buttonDisabled : {}),
                }, children: [_jsx(History, { style: styles.icon }), "History", _jsx(ChevronDown, { style: styles.iconSmall })] }), isOpen && (_jsxs("div", { style: styles.dropdown, children: [_jsxs("div", { style: styles.header, children: [_jsx("span", { style: styles.headerTitle, children: "Version History" }), _jsx("button", { type: "button", onClick: () => setIsOpen(false), style: styles.closeButton, children: _jsx(X, { style: { width: '16px', height: '16px' } }) })] }), _jsx("div", { style: styles.content, children: isLoading ? (_jsx("div", { style: styles.loadingContainer, children: _jsx(Loader2, { style: styles.loadingIcon }) })) : error ? (_jsx("div", { style: styles.errorText, children: error })) : versions.length === 0 ? (_jsx("div", { style: styles.emptyText, children: "No version history available" })) : (_jsx("div", { style: styles.listContainer, children: versions.map((version, index) => (_jsxs("div", { style: {
                                    ...styles.versionItem,
                                    backgroundColor: hoveredIndex === index ? 'var(--theme-elevation-50)' : 'transparent',
                                }, onMouseEnter: () => setHoveredIndex(index), onMouseLeave: () => setHoveredIndex(null), children: [_jsxs("div", { style: styles.versionInfo, children: [_jsxs("div", { style: styles.versionHeader, children: [_jsx("span", { style: styles.versionDate, children: formatDate(version.updatedAt) }), index === 0 && (_jsx("span", { style: styles.badgeCurrent, children: "Current" })), version.version._status === 'published' && (_jsx("span", { style: styles.badgePublished, children: "Published" })), version.autosave && (_jsx("span", { style: styles.autosaveText, title: "Autosaved", children: "(auto)" }))] }), _jsxs("div", { style: styles.versionDetails, children: [formatTime(version.updatedAt), version.version.title && (_jsxs("span", { children: [" \u00B7 ", version.version.title] }))] })] }), index > 0 && (_jsxs("button", { type: "button", onClick: () => handleRestore(version), disabled: isRestoring, style: {
                                            ...styles.restoreButton,
                                            ...(isRestoring ? styles.restoreButtonDisabled : {}),
                                        }, children: [isRestoring ? (_jsx(Loader2, { style: { width: '12px', height: '12px', animation: 'spin 1s linear infinite' } })) : (_jsx(RotateCcw, { style: { width: '12px', height: '12px' } })), "Restore"] })), index === 0 && (_jsx("span", { style: { flexShrink: 0 }, children: _jsx(Check, { style: styles.checkIcon }) }))] }, version.id))) })) })] }))] }));
});
//# sourceMappingURL=VersionHistory.js.map