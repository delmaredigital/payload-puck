'use client'

/**
 * FolderPickerField - Custom Puck field for folder selection
 *
 * Integrates with @delmaredigital/payload-page-tree to allow
 * selecting folders from within the Puck editor.
 */

import React, { useState, useEffect } from 'react'
import type { CustomField } from '@measured/puck'
import { Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown, Check, X } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

interface FolderNode {
  id: string
  name: string
  pathSegment?: string
  children?: FolderNode[]
}

interface FolderPickerFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  folderSlug?: string
}

interface FolderTreeProps {
  folders: FolderNode[]
  selectedId: string | null
  onSelect: (folderId: string | null) => void
  expandedIds: Set<string>
  onToggleExpand: (folderId: string) => void
  level?: number
}

// =============================================================================
// Folder Path Hook
// =============================================================================

/**
 * Fetches the folder path for display
 */
function useFolderPath(folderId: string | null, folderSlug: string = 'payload-folders') {
  const [folderPath, setFolderPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!folderId) {
      setFolderPath(null)
      return
    }

    async function fetchPath() {
      setLoading(true)
      try {
        // Fetch folder and build path by traversing parents
        const response = await fetch(`/api/${folderSlug}/${folderId}?depth=2`)
        if (!response.ok) {
          setFolderPath(null)
          return
        }

        const folder = await response.json()
        const pathParts: string[] = []

        // Build path from folder hierarchy
        let current = folder
        while (current) {
          if (current.pathSegment || current.name) {
            pathParts.unshift(current.pathSegment || current.name)
          }
          current = current.folder
        }

        setFolderPath(pathParts.length > 0 ? `/${pathParts.join('/')}` : null)
      } catch (error) {
        console.error('Error fetching folder path:', error)
        setFolderPath(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPath()
  }, [folderId, folderSlug])

  return { folderPath, loading }
}

/**
 * Fetches all folders for the tree
 */
function useFolders(folderSlug: string = 'payload-folders') {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchCount, setFetchCount] = useState(0)

  const refetch = () => setFetchCount((c) => c + 1)

  useEffect(() => {
    async function fetchFolders() {
      setLoading(true)
      try {
        const response = await fetch(`/api/${folderSlug}?limit=1000&sort=name`)
        if (!response.ok) {
          setFolders([])
          return
        }

        const data = await response.json()
        const allFolders = data.docs || []

        // Build tree structure
        const folderMap = new Map<string, FolderNode>()
        const rootFolders: FolderNode[] = []

        // First pass: create all nodes
        for (const folder of allFolders) {
          folderMap.set(folder.id, {
            id: folder.id,
            name: folder.name,
            pathSegment: folder.pathSegment,
            children: [],
          })
        }

        // Second pass: build hierarchy
        for (const folder of allFolders) {
          const node = folderMap.get(folder.id)!
          const parentId = typeof folder.folder === 'object' ? folder.folder?.id : folder.folder

          if (parentId && folderMap.has(parentId)) {
            folderMap.get(parentId)!.children!.push(node)
          } else {
            rootFolders.push(node)
          }
        }

        // Sort children by name
        const sortChildren = (nodes: FolderNode[]) => {
          nodes.sort((a, b) => a.name.localeCompare(b.name))
          for (const node of nodes) {
            if (node.children?.length) {
              sortChildren(node.children)
            }
          }
        }
        sortChildren(rootFolders)

        setFolders(rootFolders)
      } catch (error) {
        console.error('Error fetching folders:', error)
        setFolders([])
      } finally {
        setLoading(false)
      }
    }

    fetchFolders()
  }, [folderSlug, fetchCount])

  return { folders, loading, refetch }
}

// =============================================================================
// FolderTree Component
// =============================================================================

function FolderTreeItem({
  folder,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  level = 0,
}: {
  folder: FolderNode
  selectedId: string | null
  onSelect: (folderId: string | null) => void
  expandedIds: Set<string>
  onToggleExpand: (folderId: string) => void
  level?: number
}) {
  const hasChildren = folder.children && folder.children.length > 0
  const isExpanded = expandedIds.has(folder.id)
  const isSelected = folder.id === selectedId

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          paddingLeft: `${8 + level * 16}px`,
          cursor: 'pointer',
          borderRadius: '4px',
          backgroundColor: isSelected ? 'var(--puck-color-azure-12)' : 'transparent',
          transition: 'background-color 0.1s ease',
        }}
        onClick={() => onSelect(folder.id)}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--puck-color-grey-11)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(folder.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'var(--puck-color-grey-05)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span style={{ width: '18px' }} />
        )}

        {/* Folder icon */}
        {isExpanded ? (
          <FolderOpen size={16} style={{ marginRight: '8px', color: 'var(--puck-color-azure-06)' }} />
        ) : (
          <Folder size={16} style={{ marginRight: '8px', color: 'var(--puck-color-grey-05)' }} />
        )}

        {/* Folder name */}
        <span
          style={{
            fontSize: '14px',
            color: isSelected ? 'var(--puck-color-azure-04)' : 'var(--puck-color-grey-04)',
            flex: 1,
          }}
        >
          {folder.name}
        </span>

        {/* Selected indicator */}
        {isSelected && (
          <Check size={14} style={{ color: 'var(--puck-color-azure-04)' }} />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FolderTree({
  folders,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: FolderTreeProps) {
  if (folders.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--puck-color-grey-05)' }}>
        No folders found
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {/* Root option */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          cursor: 'pointer',
          borderRadius: '4px',
          backgroundColor: selectedId === null ? 'var(--puck-color-azure-12)' : 'transparent',
          borderBottom: '1px solid var(--puck-color-grey-09)',
          marginBottom: '4px',
        }}
        onClick={() => onSelect(null)}
      >
        <Folder size={16} style={{ marginRight: '8px', color: 'var(--puck-color-grey-05)' }} />
        <span
          style={{
            fontSize: '14px',
            color: selectedId === null ? 'var(--puck-color-azure-04)' : 'var(--puck-color-grey-04)',
            fontStyle: 'italic',
            flex: 1,
          }}
        >
          (No folder - root level)
        </span>
        {selectedId === null && (
          <Check size={14} style={{ color: 'var(--puck-color-azure-04)' }} />
        )}
      </div>

      {/* Folder tree */}
      {folders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  )
}

// =============================================================================
// FolderPickerField Component
// =============================================================================

export function FolderPickerField({
  value,
  onChange,
  label = 'Folder',
  folderSlug = 'payload-folders',
}: FolderPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const { folderPath, loading: pathLoading } = useFolderPath(value, folderSlug)
  const { folders, loading: foldersLoading, refetch } = useFolders(folderSlug)

  const handleToggleExpand = (folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleSelect = (folderId: string | null) => {
    onChange(folderId)
    setIsOpen(false)
  }

  const handleOpenDropdown = () => {
    if (!isOpen) {
      // Refetch folders when opening to get any newly created ones
      refetch()
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="puck-field" style={{ position: 'relative' }}>
      {/* Label */}
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)', marginBottom: '8px' }}>
        {label}
      </label>

      {/* Current folder display / trigger */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          border: '1px solid var(--puck-color-grey-09)',
          borderRadius: '6px',
          backgroundColor: 'var(--puck-color-white)',
          cursor: 'pointer',
        }}
        onClick={handleOpenDropdown}
      >
        <Folder size={16} style={{ marginRight: '8px', color: 'var(--puck-color-grey-05)' }} />
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            color: value ? 'var(--puck-color-grey-04)' : 'var(--puck-color-grey-06)',
            fontStyle: value ? 'normal' : 'italic',
          }}
        >
          {pathLoading ? 'Loading...' : folderPath || '(Root level)'}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--puck-color-grey-05)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Folder picker dropdown */}
      {isOpen && (
        <div
          style={{
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
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid var(--puck-color-grey-09)',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--puck-color-grey-04)' }}>
              Select Folder
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--puck-color-grey-05)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Folder tree */}
          <div style={{ padding: '8px' }}>
            {foldersLoading ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--puck-color-grey-05)' }}>
                Loading folders...
              </div>
            ) : (
              <FolderTree
                folders={folders}
                selectedId={value}
                onSelect={handleSelect}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
              />
            )}
          </div>

          {/* Create folder link - links to page-tree view where folders can be managed */}
          <div
            style={{
              borderTop: '1px solid var(--puck-color-grey-09)',
              padding: '8px 12px',
            }}
          >
            <a
              href="/admin/page-tree"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: 'var(--puck-color-azure-05)',
                textDecoration: 'none',
              }}
              onClick={() => setIsOpen(false)}
            >
              <FolderPlus size={14} style={{ marginRight: '6px' }} />
              Manage folders
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for folder selection
 */
export function createFolderPickerField(config?: {
  label?: string
  folderSlug?: string
}): CustomField<string | null> {
  return {
    type: 'custom',
    label: config?.label ?? 'Folder',
    render: ({ value, onChange }) => (
      <FolderPickerField
        value={value}
        onChange={onChange}
        label={config?.label}
        folderSlug={config?.folderSlug}
      />
    ),
  }
}
