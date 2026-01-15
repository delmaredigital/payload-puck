'use client'

import type { Plugin as PuckPlugin } from '@puckeditor/core'
import { Sparkles } from 'lucide-react'
import type { PromptEditorPluginOptions } from '../types.js'
import { PromptEditorPanel } from './PromptEditorPanel.js'

/**
 * Creates a Puck plugin for managing AI prompts in the editor
 *
 * This plugin adds an "AI Prompts" panel to the Puck plugin rail where users
 * can view, create, edit, and delete example prompts without writing code.
 *
 * @example Basic usage
 * ```tsx
 * import { createPromptEditorPlugin } from '@delmaredigital/payload-puck/ai'
 *
 * const promptEditorPlugin = createPromptEditorPlugin()
 *
 * <PuckEditor plugins={[aiPlugin, promptEditorPlugin]} />
 * ```
 *
 * @example With custom options
 * ```tsx
 * const promptEditorPlugin = createPromptEditorPlugin({
 *   apiEndpoint: '/api/puck/ai-prompts',
 *   canEdit: true,
 *   canCreate: true,
 *   canDelete: false, // Disable delete for non-admins
 * })
 * ```
 */
export function createPromptEditorPlugin(
  options: PromptEditorPluginOptions = {}
): PuckPlugin {
  const {
    apiEndpoint = '/api/puck/ai-prompts',
    canEdit = true,
    canCreate = true,
    canDelete = true,
  } = options

  return {
    name: 'prompt-editor',
    label: 'AI Prompts',
    icon: <Sparkles size={16} />,
    render: () => (
      <PromptEditorPanel
        apiEndpoint={apiEndpoint}
        canEdit={canEdit}
        canCreate={canCreate}
        canDelete={canDelete}
      />
    ),
  }
}
