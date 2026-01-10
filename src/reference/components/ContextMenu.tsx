'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { TreeNode, ContextMenuAction } from '../types.js'

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  node: TreeNode | null
}

interface ContextMenuContextValue {
  state: ContextMenuState
  openMenu: (e: React.MouseEvent, node: TreeNode) => void
  closeMenu: () => void
  onAction: (action: ContextMenuAction) => void
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

export function useContextMenu() {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider')
  }
  return context
}

interface ContextMenuProviderProps {
  children: ReactNode
  adminRoute: string
  onAction: (node: TreeNode, action: ContextMenuAction) => void
}

export function ContextMenuProvider({ children, adminRoute, onAction }: ContextMenuProviderProps) {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    node: null,
  })

  const openMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault()
    setState({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      node,
    })
  }, [])

  const closeMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, node: null }))
  }, [])

  const handleAction = useCallback(
    (action: ContextMenuAction) => {
      if (state.node) {
        onAction(state.node, action)
      }
      closeMenu()
    },
    [state.node, onAction, closeMenu],
  )

  return (
    <ContextMenuContext.Provider value={{ state, openMenu, closeMenu, onAction: handleAction }}>
      {children}
      {state.isOpen && state.node && (
        <ContextMenuOverlay
          x={state.x}
          y={state.y}
          node={state.node}
          adminRoute={adminRoute}
          onAction={handleAction}
          onClose={closeMenu}
        />
      )}
    </ContextMenuContext.Provider>
  )
}

interface ContextMenuOverlayProps {
  x: number
  y: number
  node: TreeNode
  adminRoute: string
  onAction: (action: ContextMenuAction) => void
  onClose: () => void
}

function ContextMenuOverlay({
  x,
  y,
  node,
  adminRoute,
  onAction,
  onClose,
}: ContextMenuOverlayProps) {
  const isFolder = node.type === 'folder'

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          zIndex: 9999,
          minWidth: '180px',
          backgroundColor: 'var(--theme-bg)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '4px 0',
          fontSize: '14px',
        }}
      >
        {isFolder ? (
          <>
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              }
              onClick={() => onAction('newPage')}
            >
              New Page
            </MenuItem>
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              }
              onClick={() => onAction('newFolder')}
            >
              New Folder
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              onClick={() => onAction('rename')}
            >
              Rename
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              }
              onClick={() => onAction('expandAll')}
            >
              Expand All
            </MenuItem>
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              }
              onClick={() => onAction('collapseAll')}
            >
              Collapse All
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              }
              onClick={() => onAction('delete')}
              danger
            >
              Delete
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              onClick={() => onAction('edit')}
            >
              Edit
            </MenuItem>
            {node.slug && (
              <MenuItem
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                }
                onClick={() => onAction('viewOnSite')}
              >
                View on Site
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              }
              onClick={() => onAction('duplicate')}
            >
              Duplicate
            </MenuItem>
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              onClick={() => onAction('rename')}
            >
              Rename
            </MenuItem>
            <MenuDivider />
            {node.status === 'draft' ? (
              <MenuItem
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                }
                onClick={() => onAction('publish')}
              >
                Publish
              </MenuItem>
            ) : (
              <MenuItem
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                }
                onClick={() => onAction('unpublish')}
              >
                Unpublish
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              }
              onClick={() => onAction('delete')}
              danger
            >
              Delete
            </MenuItem>
          </>
        )}
      </div>
    </>
  )
}

interface MenuItemProps {
  children: ReactNode
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
}

function MenuItem({ children, icon, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        color: danger ? 'var(--theme-error-500, #ef4444)' : 'var(--theme-elevation-800)',
        fontSize: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? 'var(--theme-error-50, #fef2f2)'
          : 'var(--theme-elevation-50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {icon && (
        <span
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon}
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}

function MenuDivider() {
  return (
    <div
      style={{
        height: '1px',
        backgroundColor: 'var(--theme-elevation-100)',
        margin: '4px 0',
      }}
    />
  )
}

export default ContextMenuProvider
