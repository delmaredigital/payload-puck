'use client'

import { useState, useCallback, useRef } from 'react'
import { Tree, type TreeApi } from 'react-arborist'
import Link from 'next/link'
import type { TreeNode as TreeNodeType, ContextMenuAction } from '../types.js'
import { TreeNode } from './TreeNode.js'
import { ContextMenuProvider } from './ContextMenu.js'

interface PageTreeClientProps {
  treeData: TreeNodeType[]
  collections: string[]
  adminRoute: string
}

// Helper to extract raw database ID from prefixed tree ID
function getRawId(node: TreeNodeType): string {
  // If rawId is available, use it; otherwise strip the prefix from id
  if (node.rawId) return node.rawId
  // Remove 'folder-' or 'page-' prefix
  return node.id.replace(/^(folder|page)-/, '')
}

// Helper to extract raw ID from a tree ID string (for parent IDs)
function stripIdPrefix(treeId: string | null): string | null {
  if (!treeId) return null
  return treeId.replace(/^(folder|page)-/, '')
}

export function PageTreeClient({ treeData, collections, adminRoute }: PageTreeClientProps) {
  const [data, setData] = useState(treeData)
  const [search, setSearch] = useState('')
  const treeRef = useRef<TreeApi<TreeNodeType>>(null)

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    return response.json()
  }, [])

  // Handle drag-and-drop move
  const handleMove = useCallback(
    async ({
      dragIds,
      parentId,
      index,
    }: {
      dragIds: string[]
      parentId: string | null
      index: number
    }) => {
      const id = dragIds[0]
      const node = findNode(data, id)
      if (!node) return

      // Optimistic update
      const newData = moveNodeInTree(data, id, parentId, index)
      setData(newData)

      // API call - use raw IDs without prefixes
      try {
        await apiCall('/page-tree/move', {
          method: 'POST',
          body: JSON.stringify({
            type: node.type,
            id: getRawId(node),
            newParentId: stripIdPrefix(parentId),
            newIndex: index,
          }),
        })
      } catch (error) {
        console.error('Move failed:', error)
        // Revert on error
        setData(treeData)
      }
    },
    [data, treeData, apiCall],
  )

  // Handle rename
  const handleRename = useCallback(
    async ({ id, name }: { id: string; name: string }) => {
      const node = findNode(data, id)
      if (!node) return

      // Optimistic update
      const newData = updateNodeInTree(data, id, { name })
      setData(newData)

      // API call - use raw ID without prefix
      try {
        await apiCall('/page-tree/rename', {
          method: 'POST',
          body: JSON.stringify({
            type: node.type,
            id: getRawId(node),
            name,
            collection: node.collection,
          }),
        })
      } catch (error) {
        console.error('Rename failed:', error)
        setData(treeData)
      }
    },
    [data, treeData, apiCall],
  )

  // Handle context menu actions
  const handleContextAction = useCallback(
    async (node: TreeNodeType, action: ContextMenuAction) => {
      const rawId = getRawId(node)

      switch (action) {
        case 'edit':
          if (node.collection) {
            window.open(`${adminRoute}/collections/${node.collection}/${rawId}`, '_blank')
          }
          break

        case 'viewOnSite':
          if (node.slug) {
            window.open(`/${node.slug}`, '_blank')
          }
          break

        case 'rename':
          treeRef.current?.edit(node.id)
          break

        case 'delete':
          if (confirm(`Delete "${node.name}"${node.type === 'folder' ? ' and all its contents' : ''}?`)) {
            try {
              await apiCall(
                `/page-tree/delete?type=${node.type}&id=${rawId}&deleteChildren=true`,
                { method: 'DELETE' },
              )
              const newData = removeNodeFromTree(data, node.id)
              setData(newData)
            } catch (error) {
              console.error('Delete failed:', error)
            }
          }
          break

        case 'duplicate':
          if (node.type === 'page' && node.collection) {
            try {
              const result = await apiCall(
                `/page-tree/duplicate?id=${rawId}&collection=${node.collection}`,
                { method: 'POST' },
              )
              if (result.success) {
                // Refresh the tree
                window.location.reload()
              }
            } catch (error) {
              console.error('Duplicate failed:', error)
            }
          }
          break

        case 'newPage':
          try {
            // Handle 'root' as null (create at root level)
            const pageParentId = node.id === 'root'
              ? null
              : node.type === 'folder' ? rawId : stripIdPrefix(node.folderId ?? null)
            const result = await apiCall('/page-tree/create', {
              method: 'POST',
              body: JSON.stringify({
                type: 'page',
                name: 'New Page',
                parentId: pageParentId,
                collection: collections[0],
              }),
            })
            if (result.success) {
              window.location.reload()
            }
          } catch (error) {
            console.error('Create page failed:', error)
          }
          break

        case 'newFolder':
          try {
            // Handle 'root' as null (create at root level)
            const folderParentId = node.id === 'root'
              ? null
              : node.type === 'folder' ? rawId : stripIdPrefix(node.folderId ?? null)
            const result = await apiCall('/page-tree/create', {
              method: 'POST',
              body: JSON.stringify({
                type: 'folder',
                name: 'New Folder',
                parentId: folderParentId,
              }),
            })
            if (result.success) {
              window.location.reload()
            }
          } catch (error) {
            console.error('Create folder failed:', error)
          }
          break

        case 'publish':
        case 'unpublish':
          if (node.type === 'page' && node.collection) {
            try {
              await apiCall('/page-tree/status', {
                method: 'POST',
                body: JSON.stringify({
                  id: rawId,
                  collection: node.collection,
                  status: action === 'publish' ? 'published' : 'draft',
                }),
              })
              const newData = updateNodeInTree(data, node.id, {
                status: action === 'publish' ? 'published' : 'draft',
              })
              setData(newData)
            } catch (error) {
              console.error('Status update failed:', error)
            }
          }
          break

        case 'expandAll':
          treeRef.current?.openAll()
          break

        case 'collapseAll':
          treeRef.current?.closeAll()
          break
      }
    },
    [data, adminRoute, collections, apiCall],
  )

  // Handle node action from TreeNode component
  const handleNodeAction = useCallback(
    (nodeId: string, action: string) => {
      const node = findNode(data, nodeId)
      if (node) {
        handleContextAction(node, action as ContextMenuAction)
      }
    },
    [data, handleContextAction],
  )

  return (
    <ContextMenuProvider adminRoute={adminRoute} onAction={handleContextAction}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with search and actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '0 4px',
          }}
        >
          {/* Search input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--theme-elevation-400)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search pages and folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'var(--theme-input-bg)',
                color: 'var(--theme-elevation-800)',
                outline: 'none',
              }}
            />
          </div>

          {/* Expand/Collapse buttons */}
          <button
            onClick={() => treeRef.current?.openAll()}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-600)',
            }}
          >
            Expand All
          </button>
          <button
            onClick={() => treeRef.current?.closeAll()}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-600)',
            }}
          >
            Collapse All
          </button>

          {/* New buttons */}
          <button
            onClick={() =>
              handleContextAction(
                { id: 'root', type: 'folder', name: '', children: [], pageCount: 0, sortOrder: 0 },
                'newFolder',
              )
            }
            style={{
              padding: '8px 12px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-elevation-50)',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            New Folder
          </button>
          <button
            onClick={() =>
              handleContextAction(
                { id: 'root', type: 'folder', name: '', children: [], pageCount: 0, sortOrder: 0 },
                'newPage',
              )
            }
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-success-500, #22c55e)',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            New Page
          </button>
        </div>

        {/* Tree content */}
        <div
          style={{
            flex: 1,
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '8px',
            backgroundColor: 'var(--theme-bg)',
            overflow: 'hidden',
          }}
        >
          {data.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--theme-elevation-500)',
              }}
            >
              No pages or folders yet. Create one to get started.
            </div>
          ) : (
            <Tree
              ref={treeRef}
              data={data}
              onMove={handleMove}
              onRename={handleRename}
              searchTerm={search}
              searchMatch={(node, term) =>
                node.data.name.toLowerCase().includes(term.toLowerCase()) ||
                (node.data.slug?.toLowerCase().includes(term.toLowerCase()) ?? false)
              }
              width="100%"
              height={600}
              rowHeight={36}
              indent={24}
              openByDefault={false}
              disableDrag={false}
              disableDrop={false}
            >
              {(props) => (
                <TreeNode {...props} adminRoute={adminRoute} onAction={handleNodeAction} />
              )}
            </Tree>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            fontSize: '12px',
            color: 'var(--theme-elevation-400)',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span>
            <kbd style={kbdStyle}>Enter</kbd> Edit
          </span>
          <span>
            <kbd style={kbdStyle}>F2</kbd> Rename
          </span>
          <span>
            <kbd style={kbdStyle}>Delete</kbd> Delete
          </span>
          <span>
            <kbd style={kbdStyle}>Space</kbd> Toggle
          </span>
          <span>
            <kbd style={kbdStyle}>Arrows</kbd> Navigate
          </span>
          <span>Right-click for more options</span>
        </div>
      </div>
    </ContextMenuProvider>
  )
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 6px',
  backgroundColor: 'var(--theme-elevation-100)',
  borderRadius: '3px',
  fontSize: '11px',
  fontFamily: 'monospace',
}

// Helper functions for tree manipulation

function findNode(nodes: TreeNodeType[], id: string): TreeNodeType | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

function removeNodeFromTree(nodes: TreeNodeType[], id: string): TreeNodeType[] {
  return nodes.filter((node) => {
    if (node.id === id) return false
    node.children = removeNodeFromTree(node.children, id)
    return true
  })
}

function updateNodeInTree(
  nodes: TreeNodeType[],
  id: string,
  updates: Partial<TreeNodeType>,
): TreeNodeType[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates }
    }
    return {
      ...node,
      children: updateNodeInTree(node.children, id, updates),
    }
  })
}

function moveNodeInTree(
  nodes: TreeNodeType[],
  nodeId: string,
  newParentId: string | null,
  index: number,
): TreeNodeType[] {
  // Find and remove the node
  let movedNode: TreeNodeType | null = null
  const withoutNode = removeNodeAndCapture(nodes, nodeId, (n) => {
    movedNode = n
  })

  if (!movedNode) return nodes

  // Store in a const for proper type narrowing
  const nodeToMove: TreeNodeType = movedNode

  // Insert at new location
  if (newParentId === null) {
    // Insert at root level
    const result = [...withoutNode]
    result.splice(index, 0, { ...nodeToMove, folderId: null })
    return result
  }

  // Insert into parent folder
  return insertIntoParent(withoutNode, newParentId, nodeToMove, index)
}

function removeNodeAndCapture(
  nodes: TreeNodeType[],
  id: string,
  capture: (node: TreeNodeType) => void,
): TreeNodeType[] {
  return nodes.filter((node) => {
    if (node.id === id) {
      capture(node)
      return false
    }
    node.children = removeNodeAndCapture(node.children, id, capture)
    return true
  })
}

function insertIntoParent(
  nodes: TreeNodeType[],
  parentId: string,
  nodeToInsert: TreeNodeType,
  index: number,
): TreeNodeType[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const newChildren = [...node.children]
      newChildren.splice(index, 0, { ...nodeToInsert, folderId: parentId })
      return { ...node, children: newChildren }
    }
    return {
      ...node,
      children: insertIntoParent(node.children, parentId, nodeToInsert, index),
    }
  })
}

export default PageTreeClient
