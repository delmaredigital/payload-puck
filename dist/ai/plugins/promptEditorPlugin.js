'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Sparkles } from 'lucide-react';
import { PromptEditorPanel } from './PromptEditorPanel.js';
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
export function createPromptEditorPlugin(options = {}) {
    const { apiEndpoint = '/api/puck/ai-prompts', canEdit = true, canCreate = true, canDelete = true, } = options;
    return {
        name: 'prompt-editor',
        label: 'AI Prompts',
        icon: _jsx(Sparkles, { size: 16 }),
        render: () => (_jsx(PromptEditorPanel, { apiEndpoint: apiEndpoint, canEdit: canEdit, canCreate: canCreate, canDelete: canDelete })),
    };
}
//# sourceMappingURL=promptEditorPlugin.js.map