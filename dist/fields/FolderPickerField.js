'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * FolderPickerField - Custom Puck field for folder selection
 *
 * Integrates with @delmaredigital/payload-page-tree to allow
 * selecting folders from within the Puck editor.
 */
import { useState, useEffect } from 'react';
import { Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
// =============================================================================
// Folder Path Hook
// =============================================================================
/**
 * Fetches the folder path for display
 */
function useFolderPath(folderId, folderSlug = 'payload-folders') {
    const [folderPath, setFolderPath] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!folderId) {
            setFolderPath(null);
            return;
        }
        async function fetchPath() {
            setLoading(true);
            try {
                // Fetch folder and build path by traversing parents
                const response = await fetch(`/api/${folderSlug}/${folderId}?depth=2`);
                if (!response.ok) {
                    setFolderPath(null);
                    return;
                }
                const folder = await response.json();
                const pathParts = [];
                // Build path from folder hierarchy
                let current = folder;
                while (current) {
                    if (current.pathSegment || current.name) {
                        pathParts.unshift(current.pathSegment || current.name);
                    }
                    current = current.folder;
                }
                setFolderPath(pathParts.length > 0 ? `/${pathParts.join('/')}` : null);
            }
            catch (error) {
                console.error('Error fetching folder path:', error);
                setFolderPath(null);
            }
            finally {
                setLoading(false);
            }
        }
        fetchPath();
    }, [folderId, folderSlug]);
    return { folderPath, loading };
}
/**
 * Fetches all folders for the tree
 */
function useFolders(folderSlug = 'payload-folders') {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchCount, setFetchCount] = useState(0);
    const refetch = () => setFetchCount((c) => c + 1);
    useEffect(() => {
        async function fetchFolders() {
            setLoading(true);
            try {
                const response = await fetch(`/api/${folderSlug}?limit=1000&sort=name`);
                if (!response.ok) {
                    setFolders([]);
                    return;
                }
                const data = await response.json();
                const allFolders = data.docs || [];
                // Build tree structure
                const folderMap = new Map();
                const rootFolders = [];
                // First pass: create all nodes
                for (const folder of allFolders) {
                    folderMap.set(folder.id, {
                        id: folder.id,
                        name: folder.name,
                        pathSegment: folder.pathSegment,
                        children: [],
                    });
                }
                // Second pass: build hierarchy
                for (const folder of allFolders) {
                    const node = folderMap.get(folder.id);
                    const parentId = typeof folder.folder === 'object' ? folder.folder?.id : folder.folder;
                    if (parentId && folderMap.has(parentId)) {
                        folderMap.get(parentId).children.push(node);
                    }
                    else {
                        rootFolders.push(node);
                    }
                }
                // Sort children by name
                const sortChildren = (nodes) => {
                    nodes.sort((a, b) => a.name.localeCompare(b.name));
                    for (const node of nodes) {
                        if (node.children?.length) {
                            sortChildren(node.children);
                        }
                    }
                };
                sortChildren(rootFolders);
                setFolders(rootFolders);
            }
            catch (error) {
                console.error('Error fetching folders:', error);
                setFolders([]);
            }
            finally {
                setLoading(false);
            }
        }
        fetchFolders();
    }, [folderSlug, fetchCount]);
    return { folders, loading, refetch };
}
// =============================================================================
// FolderTree Component
// =============================================================================
function FolderTreeItem({ folder, selectedId, onSelect, expandedIds, onToggleExpand, level = 0, }) {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = folder.id === selectedId;
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    paddingLeft: `${8 + level * 16}px`,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? 'var(--puck-color-azure-12)' : 'transparent',
                    transition: 'background-color 0.1s ease',
                }, onClick: () => onSelect(folder.id), onMouseEnter: (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--puck-color-grey-11)';
                    }
                }, onMouseLeave: (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }, children: [hasChildren ? (_jsx("button", { type: "button", onClick: (e) => {
                            e.stopPropagation();
                            onToggleExpand(folder.id);
                        }, style: {
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            color: 'var(--puck-color-grey-05)',
                            display: 'flex',
                            alignItems: 'center',
                        }, children: isExpanded ? _jsx(ChevronDown, { size: 14 }) : _jsx(ChevronRight, { size: 14 }) })) : (_jsx("span", { style: { width: '18px' } })), isExpanded ? (_jsx(FolderOpen, { size: 16, style: { marginRight: '8px', color: 'var(--puck-color-azure-06)' } })) : (_jsx(Folder, { size: 16, style: { marginRight: '8px', color: 'var(--puck-color-grey-05)' } })), _jsx("span", { style: {
                            fontSize: '14px',
                            color: isSelected ? 'var(--puck-color-azure-04)' : 'var(--puck-color-grey-04)',
                            flex: 1,
                        }, children: folder.name }), isSelected && (_jsx(Check, { size: 14, style: { color: 'var(--puck-color-azure-04)' } }))] }), hasChildren && isExpanded && (_jsx("div", { children: folder.children.map((child) => (_jsx(FolderTreeItem, { folder: child, selectedId: selectedId, onSelect: onSelect, expandedIds: expandedIds, onToggleExpand: onToggleExpand, level: level + 1 }, child.id))) }))] }));
}
function FolderTree({ folders, selectedId, onSelect, expandedIds, onToggleExpand, }) {
    if (folders.length === 0) {
        return (_jsx("div", { style: { padding: '16px', textAlign: 'center', color: 'var(--puck-color-grey-05)' }, children: "No folders found" }));
    }
    return (_jsxs("div", { style: { maxHeight: '300px', overflowY: 'auto' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: selectedId === null ? 'var(--puck-color-azure-12)' : 'transparent',
                    borderBottom: '1px solid var(--puck-color-grey-09)',
                    marginBottom: '4px',
                }, onClick: () => onSelect(null), children: [_jsx(Folder, { size: 16, style: { marginRight: '8px', color: 'var(--puck-color-grey-05)' } }), _jsx("span", { style: {
                            fontSize: '14px',
                            color: selectedId === null ? 'var(--puck-color-azure-04)' : 'var(--puck-color-grey-04)',
                            fontStyle: 'italic',
                            flex: 1,
                        }, children: "(No folder - root level)" }), selectedId === null && (_jsx(Check, { size: 14, style: { color: 'var(--puck-color-azure-04)' } }))] }), folders.map((folder) => (_jsx(FolderTreeItem, { folder: folder, selectedId: selectedId, onSelect: onSelect, expandedIds: expandedIds, onToggleExpand: onToggleExpand }, folder.id)))] }));
}
// =============================================================================
// FolderPickerField Component
// =============================================================================
export function FolderPickerField({ value, onChange, label = 'Folder', folderSlug = 'payload-folders', }) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const { folderPath, loading: pathLoading } = useFolderPath(value, folderSlug);
    const { folders, loading: foldersLoading, refetch } = useFolders(folderSlug);
    const handleToggleExpand = (folderId) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            }
            else {
                next.add(folderId);
            }
            return next;
        });
    };
    const handleSelect = (folderId) => {
        onChange(folderId);
        setIsOpen(false);
    };
    const handleOpenDropdown = () => {
        if (!isOpen) {
            // Refetch folders when opening to get any newly created ones
            refetch();
        }
        setIsOpen(!isOpen);
    };
    return (_jsxs("div", { className: "puck-field", style: { position: 'relative' }, children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)', marginBottom: '8px' }, children: label }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: '1px solid var(--puck-color-grey-09)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--puck-color-white)',
                    cursor: 'pointer',
                }, onClick: handleOpenDropdown, children: [_jsx(Folder, { size: 16, style: { marginRight: '8px', color: 'var(--puck-color-grey-05)' } }), _jsx("span", { style: {
                            flex: 1,
                            fontSize: '14px',
                            color: value ? 'var(--puck-color-grey-04)' : 'var(--puck-color-grey-06)',
                            fontStyle: value ? 'normal' : 'italic',
                        }, children: pathLoading ? 'Loading...' : folderPath || '(Root level)' }), _jsx(ChevronDown, { size: 16, style: {
                            color: 'var(--puck-color-grey-05)',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                        } })] }), isOpen && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--puck-color-white)',
                    border: '1px solid var(--puck-color-grey-09)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--puck-color-grey-09)',
                        }, children: [_jsx("span", { style: { fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)' }, children: "Select Folder" }), _jsx("button", { type: "button", onClick: () => setIsOpen(false), style: {
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    color: 'var(--puck-color-grey-05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                }, children: _jsx(X, { size: 16 }) })] }), _jsx("div", { style: { padding: '8px' }, children: foldersLoading ? (_jsx("div", { style: { padding: '16px', textAlign: 'center', color: 'var(--puck-color-grey-05)' }, children: "Loading folders..." })) : (_jsx(FolderTree, { folders: folders, selectedId: value, onSelect: handleSelect, expandedIds: expandedIds, onToggleExpand: handleToggleExpand })) }), _jsx("div", { style: {
                            borderTop: '1px solid var(--puck-color-grey-09)',
                            padding: '8px 12px',
                        }, children: _jsxs("a", { href: "/admin/page-tree", target: "_blank", rel: "noopener noreferrer", style: {
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '13px',
                                color: 'var(--puck-color-azure-05)',
                                textDecoration: 'none',
                            }, onClick: () => setIsOpen(false), children: [_jsx(FolderPlus, { size: 14, style: { marginRight: '6px' } }), "Manage folders"] }) })] }))] }));
}
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for folder selection
 */
export function createFolderPickerField(config) {
    return {
        type: 'custom',
        label: config?.label ?? 'Folder',
        render: ({ value, onChange }) => (_jsx(FolderPickerField, { value: value, onChange: onChange, label: config?.label, folderSlug: config?.folderSlug })),
    };
}
//# sourceMappingURL=FolderPickerField.js.map