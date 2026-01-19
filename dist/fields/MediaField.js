'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * MediaField - Custom Puck field for selecting Payload CMS media
 *
 * This component provides a media picker that integrates with Payload's
 * media collection, allowing users to browse and select images.
 */
import { useState, useEffect, useCallback, memo } from 'react';
import { Image, X, Search, Loader2, Upload, AlertCircle, Link } from 'lucide-react';
// =============================================================================
// Styles
// =============================================================================
const styles = {
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-700)',
        marginBottom: '8px',
    },
    previewContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
    },
    imagePreview: {
        position: 'relative',
    },
    previewImage: {
        width: '96px',
        height: '96px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-200)',
    },
    removeButton: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        padding: '4px',
        backgroundColor: 'var(--theme-error-500)',
        color: 'white',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        opacity: 0,
        transition: 'opacity 0.15s',
    },
    placeholder: {
        width: '96px',
        height: '96px',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: '6px',
        border: '1px dashed var(--theme-elevation-300)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    buttonOutline: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 12px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-700)',
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
    },
    buttonGhost: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 12px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-error-600)',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
    },
    buttonPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-bg)',
        backgroundColor: 'var(--theme-elevation-900)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    urlDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--theme-elevation-500)',
        marginTop: '8px',
    },
    // Dialog styles
    dialogOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogContent: {
        backgroundColor: 'var(--theme-bg)',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        margin: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    dialogHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid var(--theme-elevation-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
    },
    dialogTitle: {
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--theme-elevation-900)',
        margin: 0,
    },
    closeButton: {
        padding: '4px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--theme-elevation-500)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--theme-elevation-200)',
        padding: '0 20px',
        flexShrink: 0,
    },
    tabButton: {
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: 'transparent',
        border: 'none',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'transparent',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
        color: 'var(--theme-elevation-500)',
    },
    tabButtonActive: {
        color: 'var(--theme-elevation-900)',
        borderBottomColor: 'var(--theme-elevation-900)',
    },
    searchContainer: {
        padding: '16px 20px',
        position: 'relative',
        flexShrink: 0,
    },
    searchInput: {
        width: '100%',
        padding: '8px 12px 8px 40px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '6px',
        outline: 'none',
    },
    searchIcon: {
        position: 'absolute',
        left: '32px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--theme-elevation-400)',
        pointerEvents: 'none',
    },
    contentArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
    },
    mediaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '12px',
    },
    mediaItem: {
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden',
        borderRadius: '6px',
        border: '2px solid var(--theme-elevation-200)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        backgroundColor: 'var(--theme-elevation-100)',
    },
    mediaItemSelected: {
        borderColor: 'var(--theme-elevation-900)',
        boxShadow: '0 0 0 2px var(--theme-elevation-200)',
    },
    mediaItemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    mediaItemAlt: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        fontSize: '12px',
        padding: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    loadMoreContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '16px',
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--theme-elevation-500)',
    },
    skeleton: {
        backgroundColor: 'var(--theme-elevation-200)',
        borderRadius: '6px',
        aspectRatio: '1',
        animation: 'pulse 2s infinite',
    },
    uploadContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        padding: '20px',
    },
    uploadPreview: {
        width: '100%',
        maxWidth: '448px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    uploadImageContainer: {
        position: 'relative',
        aspectRatio: '16/9',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    uploadImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    uploadMeta: {
        fontSize: '14px',
        color: 'var(--theme-elevation-500)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    errorBox: {
        padding: '12px',
        backgroundColor: 'var(--theme-error-50)',
        border: '1px solid var(--theme-error-200)',
        borderRadius: '6px',
        color: 'var(--theme-error-700)',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
    },
    actionsRow: {
        display: 'flex',
        gap: '8px',
    },
    dropZone: {
        textAlign: 'center',
    },
    dropZoneIcon: {
        width: '64px',
        height: '64px',
        color: 'var(--theme-elevation-300)',
        margin: '0 auto 16px',
    },
    hiddenInput: {
        display: 'none',
    },
    urlContainer: {
        width: '100%',
        maxWidth: '448px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    urlIntro: {
        textAlign: 'center',
        marginBottom: '24px',
    },
    urlIcon: {
        width: '48px',
        height: '48px',
        color: 'var(--theme-elevation-400)',
        margin: '0 auto 8px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    inputLabel: {
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-700)',
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: '6px',
        outline: 'none',
    },
    previewLoading: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--theme-elevation-100)',
    },
    icon: {
        width: '16px',
        height: '16px',
    },
    iconSmall: {
        width: '12px',
        height: '12px',
        flexShrink: 0,
    },
};
// =============================================================================
// Utility Functions
// =============================================================================
function formatFileSize(bytes) {
    if (!bytes)
        return 'Unknown';
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
// =============================================================================
// MediaField Component
// =============================================================================
function MediaFieldInner({ value, onChange, label, readOnly, apiEndpoint = '/api/media', }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('browse');
    const [hoveredItem, setHoveredItem] = useState(null);
    const [previewHovered, setPreviewHovered] = useState(false);
    const [uploadState, setUploadState] = useState({
        file: null,
        preview: null,
        uploading: false,
        error: null,
    });
    const [urlState, setUrlState] = useState({
        url: '',
        loading: false,
        error: null,
        previewLoaded: false,
    });
    // Fetch media from Payload API
    const fetchMedia = useCallback(async (searchTerm = '', pageNum = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: '24',
                page: pageNum.toString(),
                sort: '-createdAt',
            });
            params.set('where[mimeType][contains]', 'image');
            if (searchTerm) {
                params.set('where[alt][contains]', searchTerm);
            }
            const response = await fetch(`${apiEndpoint}?${params}`);
            if (!response.ok)
                throw new Error('Failed to fetch media');
            const data = await response.json();
            const items = (data.docs || []).map((doc) => ({
                id: doc.id,
                url: doc.url || '',
                alt: doc.alt || '',
                filename: doc.filename || '',
                width: doc.width,
                height: doc.height,
                mimeType: doc.mimeType || '',
            }));
            if (pageNum === 1) {
                setMediaList(items);
            }
            else {
                setMediaList((prev) => [...prev, ...items]);
            }
            setHasMore(data.hasNextPage || false);
        }
        catch (error) {
            console.error('Error fetching media:', error);
        }
        finally {
            setLoading(false);
        }
    }, [apiEndpoint]);
    // Load media when dialog opens
    useEffect(() => {
        if (isOpen) {
            setPage(1);
            fetchMedia(searchQuery, 1);
        }
    }, [isOpen, fetchMedia, searchQuery]);
    // Handle search with debounce
    useEffect(() => {
        if (!isOpen)
            return;
        const timer = setTimeout(() => {
            setPage(1);
            fetchMedia(searchQuery, 1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, isOpen, fetchMedia]);
    // Handle media selection
    const handleSelect = (item) => {
        onChange({
            id: item.id,
            url: item.url,
            alt: item.alt,
            width: item.width,
            height: item.height,
        });
        setIsOpen(false);
    };
    // Handle remove
    const handleRemove = () => {
        onChange(null);
    };
    // Load more
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMedia(searchQuery, nextPage);
    };
    // Reset upload state
    const resetUploadState = useCallback(() => {
        setUploadState((prev) => {
            if (prev.preview)
                URL.revokeObjectURL(prev.preview);
            return { file: null, preview: null, uploading: false, error: null };
        });
    }, []);
    // Reset URL state
    const resetUrlState = useCallback(() => {
        setUrlState({ url: '', loading: false, error: null, previewLoaded: false });
    }, []);
    // Handle URL submission
    const handleUrlSubmit = useCallback(() => {
        const url = urlState.url.trim();
        if (!url) {
            setUrlState((prev) => ({ ...prev, error: 'Please enter a URL' }));
            return;
        }
        try {
            new URL(url);
        }
        catch {
            setUrlState((prev) => ({ ...prev, error: 'Please enter a valid URL' }));
            return;
        }
        onChange({
            id: `external-${Date.now()}`,
            url: url,
            alt: '',
        });
        setIsOpen(false);
        resetUrlState();
    }, [urlState.url, onChange, resetUrlState]);
    const handleUrlPreviewLoad = useCallback(() => {
        setUrlState((prev) => ({ ...prev, previewLoaded: true, error: null }));
    }, []);
    const handleUrlPreviewError = useCallback(() => {
        setUrlState((prev) => ({
            ...prev,
            previewLoaded: false,
            error: 'Unable to load image from this URL',
        }));
    }, []);
    // Handle file selection
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            setUploadState((prev) => ({ ...prev, error: 'Only image files are allowed' }));
            return;
        }
        setUploadState((prev) => {
            if (prev.preview)
                URL.revokeObjectURL(prev.preview);
            return prev;
        });
        const preview = URL.createObjectURL(file);
        setUploadState({ file, preview, uploading: false, error: null });
    }, []);
    // Handle upload
    const handleUpload = useCallback(async () => {
        if (!uploadState.file)
            return;
        setUploadState((prev) => ({ ...prev, uploading: true, error: null }));
        try {
            const formData = new FormData();
            formData.append('file', uploadState.file);
            const altText = uploadState.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            formData.append('alt', altText);
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(error.message || error.errors?.[0]?.message || 'Upload failed');
            }
            const data = await response.json();
            const doc = data.doc || data;
            onChange({
                id: doc.id,
                url: doc.url,
                alt: doc.alt,
                width: doc.width,
                height: doc.height,
            });
            setIsOpen(false);
            resetUploadState();
        }
        catch (error) {
            setUploadState((prev) => ({
                ...prev,
                uploading: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            }));
        }
    }, [uploadState.file, apiEndpoint, onChange, resetUploadState]);
    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        setIsOpen(false);
        resetUploadState();
        resetUrlState();
        setActiveTab('browse');
    }, [resetUploadState, resetUrlState]);
    // Handle escape key
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleDialogClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleDialogClose]);
    return (_jsxs("div", { className: "puck-field", children: [label && _jsx("label", { style: styles.label, children: label }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("div", { style: styles.previewContainer, children: [value?.url ? (_jsxs("div", { style: styles.imagePreview, onMouseEnter: () => setPreviewHovered(true), onMouseLeave: () => setPreviewHovered(false), children: [_jsx("img", { src: value.url, alt: value.alt || '', style: styles.previewImage }), !readOnly && (_jsx("button", { type: "button", onClick: handleRemove, style: {
                                            ...styles.removeButton,
                                            opacity: previewHovered ? 1 : 0,
                                        }, "aria-label": "Remove image", children: _jsx(X, { style: styles.iconSmall }) }))] })) : (_jsx("div", { style: styles.placeholder, children: _jsx(Image, { style: { width: '32px', height: '32px', color: 'var(--theme-elevation-400)' } }) })), !readOnly && (_jsxs("div", { style: styles.actionsColumn, children: [_jsx("button", { type: "button", onClick: () => setIsOpen(true), style: styles.buttonOutline, children: value ? 'Change Image' : 'Select Image' }), value && (_jsx("button", { type: "button", onClick: handleRemove, style: styles.buttonGhost, children: "Remove" }))] }))] }), value?.url && (_jsxs("div", { style: styles.urlDisplay, children: [_jsx(Link, { style: styles.iconSmall }), _jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }, title: value.url, children: value.url })] }))] }), isOpen && (_jsx("div", { style: styles.dialogOverlay, onClick: handleDialogClose, children: _jsxs("div", { style: styles.dialogContent, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { style: styles.dialogHeader, children: [_jsx("h2", { style: styles.dialogTitle, children: "Select Media" }), _jsx("button", { type: "button", onClick: handleDialogClose, style: styles.closeButton, children: _jsx(X, { style: styles.icon }) })] }), _jsxs("div", { style: styles.tabBar, children: [_jsx("button", { type: "button", onClick: () => setActiveTab('browse'), style: {
                                        ...styles.tabButton,
                                        ...(activeTab === 'browse' ? styles.tabButtonActive : {}),
                                    }, children: "Browse Library" }), _jsx("button", { type: "button", onClick: () => setActiveTab('upload'), style: {
                                        ...styles.tabButton,
                                        ...(activeTab === 'upload' ? styles.tabButtonActive : {}),
                                    }, children: "Upload New" }), _jsx("button", { type: "button", onClick: () => setActiveTab('url'), style: {
                                        ...styles.tabButton,
                                        ...(activeTab === 'url' ? styles.tabButtonActive : {}),
                                    }, children: "From URL" })] }), activeTab === 'browse' && (_jsxs("div", { style: styles.searchContainer, children: [_jsx(Search, { style: styles.searchIcon }), _jsx("input", { type: "text", placeholder: "Search by alt text...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: styles.searchInput })] })), _jsx("div", { style: styles.contentArea, children: activeTab === 'browse' ? (
                            /* Browse Tab */
                            loading && mediaList.length === 0 ? (_jsx("div", { style: styles.mediaGrid, children: [...Array(8)].map((_, i) => (_jsx("div", { style: styles.skeleton }, i))) })) : mediaList.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No images found" })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: styles.mediaGrid, children: mediaList.map((item) => (_jsxs("button", { type: "button", onClick: () => handleSelect(item), onMouseEnter: () => setHoveredItem(item.id), onMouseLeave: () => setHoveredItem(null), style: {
                                                ...styles.mediaItem,
                                                ...(value?.id === item.id ? styles.mediaItemSelected : {}),
                                                ...(hoveredItem === item.id ? { borderColor: 'var(--theme-elevation-600)' } : {}),
                                            }, children: [_jsx("img", { src: item.url, alt: item.alt || item.filename || '', style: styles.mediaItemImage, loading: "lazy" }), item.alt && (_jsx("div", { style: styles.mediaItemAlt, children: item.alt }))] }, item.id))) }), hasMore && (_jsx("div", { style: styles.loadMoreContainer, children: _jsx("button", { type: "button", onClick: handleLoadMore, disabled: loading, style: {
                                                ...styles.buttonOutline,
                                                ...(loading ? styles.buttonDisabled : {}),
                                            }, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { style: { ...styles.icon, marginRight: '8px', animation: 'spin 1s linear infinite' } }), "Loading..."] })) : ('Load More') }) }))] }))) : activeTab === 'upload' ? (
                            /* Upload Tab */
                            _jsx("div", { style: styles.uploadContainer, children: uploadState.preview ? (_jsxs("div", { style: styles.uploadPreview, children: [_jsx("div", { style: styles.uploadImageContainer, children: _jsx("img", { src: uploadState.preview, alt: "Preview", style: styles.uploadImage }) }), _jsxs("div", { style: styles.uploadMeta, children: [_jsxs("p", { children: [_jsx("span", { style: { fontWeight: 500 }, children: "Filename:" }), " ", uploadState.file?.name] }), _jsxs("p", { children: [_jsx("span", { style: { fontWeight: 500 }, children: "Size:" }), " ", formatFileSize(uploadState.file?.size)] })] }), uploadState.error && (_jsxs("div", { style: styles.errorBox, children: [_jsx(AlertCircle, { style: { ...styles.icon, flexShrink: 0, marginTop: '2px' } }), _jsx("span", { children: uploadState.error })] })), _jsxs("div", { style: styles.actionsRow, children: [_jsx("button", { type: "button", onClick: handleUpload, disabled: uploadState.uploading, style: {
                                                        ...styles.buttonPrimary,
                                                        ...(uploadState.uploading ? styles.buttonDisabled : {}),
                                                    }, children: uploadState.uploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { style: { ...styles.icon, marginRight: '8px', animation: 'spin 1s linear infinite' } }), "Uploading..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { style: { ...styles.icon, marginRight: '8px' } }), "Upload & Select"] })) }), _jsx("button", { type: "button", onClick: resetUploadState, disabled: uploadState.uploading, style: {
                                                        ...styles.buttonOutline,
                                                        ...(uploadState.uploading ? styles.buttonDisabled : {}),
                                                    }, children: "Cancel" })] })] })) : (_jsxs("div", { style: styles.dropZone, children: [_jsx(Image, { style: styles.dropZoneIcon }), _jsxs("label", { style: { cursor: 'pointer' }, children: [_jsx("span", { style: styles.buttonPrimary, children: "Select Image" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileSelect, style: styles.hiddenInput })] }), _jsx("p", { style: { marginTop: '8px', fontSize: '14px', color: 'var(--theme-elevation-500)' }, children: "Select an image file to upload" }), uploadState.error && (_jsx("div", { style: { ...styles.errorBox, marginTop: '16px' }, children: uploadState.error }))] })) })) : activeTab === 'url' ? (
                            /* URL Tab */
                            _jsx("div", { style: styles.uploadContainer, children: _jsxs("div", { style: styles.urlContainer, children: [_jsxs("div", { style: styles.urlIntro, children: [_jsx(Link, { style: styles.urlIcon }), _jsx("p", { style: { fontSize: '14px', color: 'var(--theme-elevation-500)' }, children: "Enter an image URL from an external source" })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { style: styles.inputLabel, htmlFor: "image-url", children: "Image URL" }), _jsx("input", { id: "image-url", type: "url", placeholder: "https://example.com/image.jpg", value: urlState.url, onChange: (e) => setUrlState((prev) => ({
                                                        ...prev,
                                                        url: e.target.value,
                                                        error: null,
                                                        previewLoaded: false,
                                                    })), onKeyDown: (e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleUrlSubmit();
                                                        }
                                                    }, style: styles.input })] }), urlState.url && !urlState.error && (_jsxs("div", { style: styles.uploadImageContainer, children: [_jsx("img", { src: urlState.url, alt: "Preview", style: styles.uploadImage, onLoad: handleUrlPreviewLoad, onError: handleUrlPreviewError }), !urlState.previewLoaded && (_jsx("div", { style: styles.previewLoading, children: _jsx(Loader2, { style: { width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: 'var(--theme-elevation-400)' } }) }))] })), urlState.error && (_jsxs("div", { style: styles.errorBox, children: [_jsx(AlertCircle, { style: { ...styles.icon, flexShrink: 0, marginTop: '2px' } }), _jsx("span", { children: urlState.error })] })), _jsxs("div", { style: styles.actionsRow, children: [_jsxs("button", { type: "button", onClick: handleUrlSubmit, disabled: !urlState.url || urlState.loading, style: {
                                                        ...styles.buttonPrimary,
                                                        ...((!urlState.url || urlState.loading) ? styles.buttonDisabled : {}),
                                                    }, children: [_jsx(Link, { style: { ...styles.icon, marginRight: '8px' } }), "Use This URL"] }), urlState.url && (_jsx("button", { type: "button", onClick: resetUrlState, style: styles.buttonOutline, children: "Clear" }))] })] }) })) : null })] }) }))] }));
}
// Memoize to prevent unnecessary re-renders
export const MediaField = memo(MediaFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for media selection
 */
export function createMediaField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(MediaField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, apiEndpoint: config.apiEndpoint })),
    };
}
//# sourceMappingURL=MediaField.js.map