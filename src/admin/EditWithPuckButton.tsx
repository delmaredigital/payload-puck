'use client'

import type { UIFieldClientComponent } from 'payload'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * Props for EditWithPuckButton when used standalone
 */
export interface EditWithPuckButtonProps {
  /**
   * Document ID to edit
   */
  id?: string
  /**
   * Collection slug
   * @default 'pages'
   */
  collectionSlug?: string
  /**
   * Custom path pattern for the Puck editor
   * Use {id} as placeholder for the document ID
   * @default '/pages/{id}/edit'
   */
  editorPathPattern?: string
  /**
   * Button label
   * @default 'Edit with Puck'
   */
  label?: string
  /**
   * Whether to show as icon only
   * @default false
   */
  iconOnly?: boolean
}

/**
 * Pencil/Edit icon component
 */
function PuckIcon({ size = 18 }: { size?: number }) {
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
 * Edit with Puck button for use in Payload admin document edit views
 *
 * Links to a Puck editor page outside of Payload admin. Configure the
 * `editorPathPattern` to match your editor route.
 *
 * @example
 * ```tsx
 * // In your Payload collection config:
 * {
 *   name: 'puckEdit',
 *   type: 'ui',
 *   admin: {
 *     position: 'sidebar',
 *     components: {
 *       Field: '@delmaredigital/payload-puck/admin/client#EditWithPuckButton',
 *     },
 *     custom: {
 *       editorPathPattern: '/pages/{id}/edit', // Your editor route
 *       label: 'Visual Editor',
 *     },
 *   },
 * }
 * ```
 */
export const EditWithPuckButton: UIFieldClientComponent = (props) => {
  // Get document context from Payload
  const { id } = useDocumentInfo()

  // Extract custom props passed via field config
  const customProps = (props as any)?.field?.custom as EditWithPuckButtonProps | undefined
  const label = customProps?.label || 'Edit with Puck'
  const iconOnly = customProps?.iconOnly || false

  // Build editor URL from pattern (default: /pages/{id}/edit)
  const pattern = customProps?.editorPathPattern || '/pages/{id}/edit'
  const editorPath = pattern.replace('{id}', String(id))

  if (!id) {
    return null
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <a
        href={editorPath}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: iconOnly ? '8px' : '10px 16px',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb'
        }}
        title={iconOnly ? label : undefined}
      >
        <PuckIcon size={iconOnly ? 20 : 18} />
        {!iconOnly && label}
      </a>
    </div>
  )
}

/**
 * Standalone version of the button that doesn't rely on Payload context
 */
export function EditWithPuckLink({
  id,
  editorPathPattern = '/pages/{id}/edit',
  label = 'Edit with Puck',
  iconOnly = false,
}: EditWithPuckButtonProps & { id: string }) {
  const path = editorPathPattern.replace('{id}', id)

  return (
    <a
      href={path}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: iconOnly ? '8px' : '10px 16px',
        backgroundColor: '#2563eb',
        color: '#fff',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1d4ed8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb'
      }}
      title={iconOnly ? label : undefined}
    >
      <PuckIcon size={iconOnly ? 20 : 18} />
      {!iconOnly && label}
    </a>
  )
}

export default EditWithPuckButton
