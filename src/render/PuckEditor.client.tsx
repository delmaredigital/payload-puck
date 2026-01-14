'use client'

import { Puck, type Config as PuckConfig, type Data as PuckData } from '@puckeditor/core'
import { useCallback, useState } from 'react'
import '@puckeditor/core/puck.css'

export interface PuckEditorProps {
  /**
   * Puck configuration with components and settings
   */
  config: PuckConfig

  /**
   * Initial Puck data to load
   */
  initialData?: PuckData

  /**
   * Callback when data is saved
   */
  onSave?: (data: PuckData) => void | Promise<void>

  /**
   * Callback when data changes
   */
  onChange?: (data: PuckData) => void

  /**
   * URL to redirect to after publishing
   */
  publishUrl?: string

  /**
   * Header actions to render in the editor header
   */
  headerActions?: React.ReactNode

  /**
   * Whether to show the publish button
   * @default true
   */
  showPublishButton?: boolean
}

/**
 * Client-side Puck visual editor component
 *
 * This component wraps the Puck editor for use in Next.js applications.
 * It must be used in a client component ('use client').
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { PuckEditor } from '@delmaredigital/payload-puck/render'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export function PageEditor({ page }) {
 *   const handleSave = async (data) => {
 *     await fetch(`/api/pages/${page.id}`, {
 *       method: 'PATCH',
 *       body: JSON.stringify({ puckData: data }),
 *     })
 *   }
 *
 *   return (
 *     <PuckEditor
 *       config={editorConfig}
 *       initialData={page.puckData}
 *       onSave={handleSave}
 *     />
 *   )
 * }
 * ```
 */
export function PuckEditor({
  config,
  initialData,
  onSave,
  onChange,
  publishUrl,
  headerActions,
  showPublishButton = true,
}: PuckEditorProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handlePublish = useCallback(
    async (data: PuckData) => {
      if (!onSave) return

      setIsSaving(true)
      try {
        await onSave(data)
        if (publishUrl) {
          window.location.href = publishUrl
        }
      } catch (error) {
        console.error('Error saving page:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [onSave, publishUrl]
  )

  // Default empty data
  const defaultData: PuckData = {
    root: { props: {} },
    content: [],
    zones: {},
  }

  return (
    <Puck
      config={config}
      data={initialData || defaultData}
      onPublish={showPublishButton ? handlePublish : undefined}
      onChange={onChange}
      overrides={{
        headerActions: ({ children }) => (
          <>
            {isSaving && (
              <span className="text-sm text-gray-500 mr-4">Saving...</span>
            )}
            {headerActions}
            {children}
          </>
        ),
      }}
    />
  )
}
