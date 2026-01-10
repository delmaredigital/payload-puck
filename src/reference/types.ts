export interface PageTreePluginConfig {
  /**
   * Collections to add folder-based slugs to
   * @example ['pages']
   */
  collections: string[]

  /**
   * Custom slug for the folders collection
   * @default 'payload-folders'
   */
  folderSlug?: string

  /**
   * Field name for the URL path segment on folders
   * @default 'pathSegment'
   */
  segmentFieldName?: string

  /**
   * Field name for the page's own URL segment
   * @default 'pageSegment'
   */
  pageSegmentFieldName?: string

  /**
   * Disable the plugin while preserving schema for migrations
   * @default false
   */
  disabled?: boolean

  /**
   * Admin view configuration
   */
  adminView?: {
    /**
     * Enable the Page Tree admin view
     * @default true
     */
    enabled?: boolean
    /**
     * Navigation label for the Page Tree link
     * @default 'Page Tree'
     */
    navLabel?: string
    /**
     * Path for the Page Tree view
     * @default '/page-tree'
     */
    path?: string
  }
}

/**
 * Tree node for displaying folders and pages (react-arborist compatible)
 */
export interface TreeNode {
  /** Unique ID for react-arborist (prefixed: 'folder-1' or 'page-1') */
  id: string
  /** Raw database ID without prefix (for API calls) */
  rawId?: string
  type: 'folder' | 'page'
  name: string
  slug?: string
  pathSegment?: string
  status?: 'draft' | 'published'
  children: TreeNode[]
  pageCount: number
  folderId?: string | null
  sortOrder: number
  collection?: string
}

/**
 * Page document with minimal fields for tree view
 */
export interface PageDocument {
  id: number | string
  title?: string
  slug?: string
  folder?: number | string | FolderDocument | null
  _status?: 'draft' | 'published'
  sortOrder?: number
}

export interface FolderDocument {
  id: number | string
  name: string
  pathSegment?: string
  folder?: number | string | FolderDocument | null
  sortOrder?: number
}

/**
 * Move operation payload
 */
export interface MovePayload {
  type: 'page' | 'folder'
  id: string
  newParentId: string | null
  newIndex: number
}

/**
 * Reorder operation payload
 */
export interface ReorderPayload {
  type: 'page' | 'folder'
  items: Array<{ id: string; sortOrder: number }>
}

/**
 * Create operation payload
 */
export interface CreatePayload {
  type: 'page' | 'folder'
  parentId: string | null
  name: string
  collection?: string
}

/**
 * Context menu action types
 */
export type ContextMenuAction =
  | 'edit'
  | 'rename'
  | 'duplicate'
  | 'delete'
  | 'newPage'
  | 'newFolder'
  | 'viewOnSite'
  | 'publish'
  | 'unpublish'
  | 'expandAll'
  | 'collapseAll'
