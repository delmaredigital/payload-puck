'use client'

import type { DefaultCellComponentProps } from 'payload'

/**
 * Props for configuring the EditWithPuckCell component
 */
export interface EditWithPuckCellConfig {
  /**
   * Collection slug for building the editor URL
   * @default 'pages'
   */
  collectionSlug?: string
  /**
   * Custom editor path pattern
   * Use {id} as placeholder for the document ID
   * @default '/admin/puck/{collectionSlug}/{id}/edit'
   */
  editorPathPattern?: string
}

/**
 * Pencil/Edit icon component
 */
function PuckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  )
}

/**
 * Custom cell component that renders an "Edit with Puck" button in list views
 *
 * Add this to a UI field in your collection to show the visual editor button
 * in the list view table.
 *
 * @example
 * ```ts
 * // In your collection config:
 * {
 *   name: 'puckEdit',
 *   type: 'ui',
 *   admin: {
 *     components: {
 *       Cell: '@delmaredigital/payload-puck/admin#EditWithPuckCell',
 *     },
 *     custom: {
 *       collectionSlug: 'pages',
 *     },
 *   },
 * }
 * ```
 */
export const EditWithPuckCell: React.FC<DefaultCellComponentProps> = ({
  rowData,
  field,
  collectionSlug: contextCollectionSlug,
}) => {
  // Get document ID from row data
  const id = rowData?.id as string | undefined

  // Get custom config from field
  const customConfig = (field as any)?.custom as EditWithPuckCellConfig | undefined
  const collectionSlug = customConfig?.collectionSlug || contextCollectionSlug || 'pages'

  if (!id) {
    return null
  }

  // Build editor URL
  const editorPath = customConfig?.editorPathPattern
    ? customConfig.editorPathPattern.replace('{id}', id).replace('{collectionSlug}', collectionSlug)
    : `/admin/puck/${collectionSlug}/${id}/edit`

  return (
    <a
      href={editorPath}
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        backgroundColor: '#2563eb',
        color: '#fff',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: 500,
        gap: '4px',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb'
      }}
      title="Edit with Puck Visual Editor"
    >
      <PuckIcon size={14} />
      <span>Visual Editor</span>
    </a>
  )
}

export default EditWithPuckCell
