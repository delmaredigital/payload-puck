'use client'

import type { Plugin as PuckPlugin } from '@puckeditor/core'
import { FileText } from 'lucide-react'
import type { ContextEditorPluginOptions } from '../types.js'
import { ContextEditorPanel } from './ContextEditorPanel.js'

/**
 * Creates a Puck plugin for managing AI context in the editor
 *
 * This plugin adds an "AI Context" panel to the Puck plugin rail where users
 * can view, create, edit, and delete business context entries without writing code.
 * Context entries are used by the AI to understand your brand, tone, and requirements.
 *
 * @example Basic usage
 * ```tsx
 * import { createContextEditorPlugin } from '@delmaredigital/payload-puck/ai'
 *
 * const contextEditorPlugin = createContextEditorPlugin()
 *
 * <PuckEditor plugins={[aiPlugin, contextEditorPlugin]} />
 * ```
 *
 * @example With custom options
 * ```tsx
 * const contextEditorPlugin = createContextEditorPlugin({
 *   apiEndpoint: '/api/puck/ai-context',
 *   canEdit: true,
 *   canCreate: true,
 *   canDelete: false, // Disable delete for non-admins
 * })
 * ```
 */
export function createContextEditorPlugin(
  options: ContextEditorPluginOptions = {}
): PuckPlugin {
  const {
    apiEndpoint = '/api/puck/ai-context',
    canEdit = true,
    canCreate = true,
    canDelete = true,
  } = options

  return {
    name: 'context-editor',
    label: 'AI Context',
    icon: <FileText size={16} />,
    render: () => (
      <ContextEditorPanel
        apiEndpoint={apiEndpoint}
        canEdit={canEdit}
        canCreate={canCreate}
        canDelete={canDelete}
      />
    ),
  }
}
