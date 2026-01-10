'use client'

import { useState } from 'react'
import type { NodeRendererProps } from 'react-arborist'
import type { TreeNode as TreeNodeType } from '../types.js'
import { useContextMenu } from './ContextMenu.js'

interface TreeNodeProps extends NodeRendererProps<TreeNodeType> {
  adminRoute: string
  onAction: (nodeId: string, action: string) => void
}

export function TreeNode({ node, style, dragHandle, adminRoute, onAction }: TreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { openMenu } = useContextMenu()
  const data = node.data
  const isFolder = data.type === 'folder'

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't handle if editing
    if (node.isEditing) return

    switch (e.key) {
      case 'Enter':
        // Enter opens the page for editing (pages only)
        if (!isFolder && data.collection) {
          e.preventDefault()
          const editId = data.rawId || data.id.replace(/^page-/, '')
          window.open(`${adminRoute}/collections/${data.collection}/${editId}`, '_blank')
        }
        break
      case 'F2':
        // F2 triggers rename
        e.preventDefault()
        node.edit()
        break
      case 'Delete':
      case 'Backspace':
        // Delete triggers delete action
        e.preventDefault()
        onAction(data.id, 'delete')
        break
      case ' ':
        // Space toggles expand/collapse for folders
        if (isFolder) {
          e.preventDefault()
          node.toggle()
        }
        break
    }
  }

  return (
    <div
      ref={dragHandle}
      tabIndex={0}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        cursor: 'pointer',
        borderRadius: '4px',
        backgroundColor: node.isSelected
          ? 'var(--theme-elevation-100)'
          : isHovered
            ? 'var(--theme-elevation-50)'
            : 'transparent',
        transition: 'background-color 0.1s ease',
        outline: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => node.isInternal && node.toggle()}
      onDoubleClick={() => {
        if (!isFolder && data.collection) {
          // Use rawId (database ID) for admin URLs, not the prefixed tree ID
          const editId = data.rawId || data.id.replace(/^page-/, '')
          window.open(`${adminRoute}/collections/${data.collection}/${editId}`, '_blank')
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        openMenu(e, data)
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Expand/collapse arrow for folders */}
      {isFolder && (
        <span
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={(e) => {
            e.stopPropagation()
            node.toggle()
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: node.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              opacity: node.children?.length ? 1 : 0.3,
            }}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      )}

      {/* Spacer for pages (to align with folders) */}
      {!isFolder && <span style={{ width: '16px', flexShrink: 0 }} />}

      {/* Icon */}
      {isFolder ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={node.isOpen ? 'var(--theme-elevation-200)' : 'none'}
          stroke="var(--theme-elevation-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--theme-elevation-400)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}

      {/* Name (editable when node.isEditing) */}
      {node.isEditing ? (
        <input
          type="text"
          defaultValue={data.name}
          autoFocus
          style={{
            flex: 1,
            padding: '2px 6px',
            border: '1px solid var(--theme-elevation-300)',
            borderRadius: '3px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
          }}
          onBlur={(e) => {
            node.submit(e.currentTarget.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              node.submit(e.currentTarget.value)
            } else if (e.key === 'Escape') {
              node.reset()
            }
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            color: 'var(--theme-elevation-800)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.name}
        </span>
      )}

      {/* Status badge for pages */}
      {!isFolder && data.status && (
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor:
              data.status === 'published'
                ? 'var(--theme-success-100, #dcfce7)'
                : 'var(--theme-elevation-100)',
            color:
              data.status === 'published'
                ? 'var(--theme-success-600, #16a34a)'
                : 'var(--theme-elevation-500)',
            flexShrink: 0,
          }}
        >
          {data.status}
        </span>
      )}

      {/* Page count for folders */}
      {isFolder && data.pageCount > 0 && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--theme-elevation-400)',
            flexShrink: 0,
          }}
        >
          {data.pageCount}
        </span>
      )}

      {/* Hover actions */}
      {isHovered && !node.isEditing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {/* Edit button */}
          {!isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                const editId = data.rawId || data.id.replace(/^page-/, '')
                window.open(`${adminRoute}/collections/${data.collection}/${editId}`, '_blank')
              }}
              style={{
                padding: '4px',
                border: 'none',
                borderRadius: '4px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Edit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--theme-elevation-500)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          {/* View on site button */}
          {!isFolder && data.slug && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(`/${data.slug}`, '_blank')
              }}
              style={{
                padding: '4px',
                border: 'none',
                borderRadius: '4px',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="View on site"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--theme-elevation-500)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAction(String(data.id), 'delete')
            }}
            style={{
              padding: '4px',
              border: 'none',
              borderRadius: '4px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--theme-error-500, #ef4444)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default TreeNode
