import type { AdminViewProps, Locale } from 'payload'
import type { TreeNode, FolderDocument, PageDocument } from '../types.js'
import { PageTreeClient } from './PageTreeClient.js'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { getVisibleEntities } from '@payloadcms/ui/shared'

interface PageTreeViewProps extends AdminViewProps {
  collections?: string[]
  folderSlug?: string
}

interface BuildTreeOptions {
  collections: string[]
}

/**
 * Build tree structure from folders and pages
 * Note: IDs are prefixed with 'folder-' or 'page-' to ensure uniqueness
 * since folders and pages come from different collections and may have the same numeric ID
 */
function buildTreeStructure(
  folders: FolderDocument[],
  pages: Array<PageDocument & { _collection?: string }>,
  options: BuildTreeOptions,
): TreeNode[] {
  // Create a map of folder IDs to their tree nodes
  // Key is the raw folder ID (without prefix) for easy lookup
  const folderMap = new Map<string, TreeNode>()

  // First pass: create folder nodes
  for (const folder of folders) {
    const rawId = String(folder.id)
    const treeId = `folder-${rawId}` // Prefix for unique tree keys
    const parentRawId = getFolderIdAsString(folder.folder)
    folderMap.set(rawId, {
      id: treeId,
      type: 'folder',
      name: folder.name,
      pathSegment: folder.pathSegment,
      children: [],
      pageCount: 0,
      folderId: parentRawId ? `folder-${parentRawId}` : null,
      sortOrder: folder.sortOrder ?? 0,
      // Store raw ID for API calls
      rawId: rawId,
    })
  }

  // Second pass: build folder hierarchy and count pages
  const rootFolders: TreeNode[] = []

  for (const folder of folders) {
    const rawId = String(folder.id)
    const node = folderMap.get(rawId)!
    const parentRawId = getFolderIdAsString(folder.folder)

    if (parentRawId && folderMap.has(parentRawId)) {
      const parent = folderMap.get(parentRawId)!
      parent.children.push(node)
    } else {
      rootFolders.push(node)
    }
  }

  // Create page nodes and add to folders or root
  const rootPages: TreeNode[] = []

  for (const page of pages) {
    const rawId = String(page.id)
    const treeId = `page-${rawId}` // Prefix for unique tree keys
    const folderRawId = getFolderIdAsString(page.folder)
    const pageNode: TreeNode = {
      id: treeId,
      type: 'page',
      name: page.title || `Page ${page.id}`,
      slug: page.slug,
      status: page._status,
      children: [],
      pageCount: 0,
      folderId: folderRawId ? `folder-${folderRawId}` : null,
      sortOrder: page.sortOrder ?? 0,
      collection: page._collection || options.collections[0],
      // Store raw ID for API calls
      rawId: rawId,
    }

    if (folderRawId && folderMap.has(folderRawId)) {
      const folder = folderMap.get(folderRawId)!
      folder.children.push(pageNode)
      // Update page counts up the tree
      updatePageCounts(folder, folderMap)
    } else {
      rootPages.push(pageNode)
    }
  }

  // Sort folders and pages within each level by sortOrder, then name
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      // First by sortOrder
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      // Then folders first, then pages
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      // Then alphabetically by name
      return a.name.localeCompare(b.name)
    })
    // Recursively sort children
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children)
      }
    }
  }

  const tree = [...rootFolders, ...rootPages]
  sortNodes(tree)

  return tree
}

/**
 * Update page counts for a folder and all its ancestors
 */
function updatePageCounts(
  node: TreeNode,
  folderMap: Map<string, TreeNode>,
) {
  node.pageCount += 1

  if (node.folderId && folderMap.has(node.folderId)) {
    updatePageCounts(folderMap.get(node.folderId)!, folderMap)
  }
}

/**
 * Extract folder ID from potentially populated field as string
 */
function getFolderIdAsString(
  folder: number | string | FolderDocument | null | undefined,
): string | null {
  if (!folder) return null
  if (typeof folder === 'object') return String(folder.id)
  return String(folder)
}

export async function PageTreeView({
  initPageResult,
  params,
  searchParams,
}: PageTreeViewProps) {
  // Get payload instance from initPageResult
  const { req } = initPageResult
  const { payload } = req

  // Get admin route from config
  const adminRoute = req.payload.config.routes?.admin || '/admin'

  // These would typically come from plugin config stored in adminViewProps
  // For now, use defaults
  const folderSlug = 'payload-folders'
  const collections = ['pages']

  // Fetch all folders
  let folders: FolderDocument[] = []
  try {
    const result = await payload.find({
      collection: folderSlug as 'payload-folders',
      limit: 0,
      depth: 1,
    })
    folders = result.docs as unknown as FolderDocument[]
  } catch (error) {
    console.error('[payload-page-tree] Error fetching folders:', error)
  }

  // Fetch pages from all configured collections
  let allPages: Array<PageDocument & { _collection?: string }> = []
  for (const collectionSlug of collections) {
    try {
      const result = await payload.find({
        collection: collectionSlug as 'pages',
        limit: 0,
        depth: 0,
      })
      // Add collection slug to each page for context menu actions
      const pagesWithCollection = (result.docs as unknown as PageDocument[]).map(page => ({
        ...page,
        _collection: collectionSlug,
      }))
      allPages = [...allPages, ...pagesWithCollection]
    } catch (error) {
      console.error(
        `[payload-page-tree] Error fetching ${collectionSlug}:`,
        error,
      )
    }
  }

  // Build tree structure
  const treeData = buildTreeStructure(folders, allPages, { collections })

  // Get visible entities for the sidebar navigation
  const visibleEntities = getVisibleEntities({ req })

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={req.locale as Locale | undefined}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <div
          style={{
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--theme-elevation-800)',
              margin: 0,
            }}
          >
            Page Tree
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--theme-elevation-500)',
              marginTop: '4px',
            }}
          >
            View and navigate your page hierarchy
          </p>
        </div>

        <PageTreeClient treeData={treeData} collections={collections} adminRoute={adminRoute} />
      </div>
    </DefaultTemplate>
  )
}

export default PageTreeView
