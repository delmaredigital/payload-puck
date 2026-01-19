import type { Plugin as PuckPlugin } from '@puckeditor/core';
import type { PromptEditorPluginOptions } from '../types.js';
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
export declare function createPromptEditorPlugin(options?: PromptEditorPluginOptions): PuckPlugin;
//# sourceMappingURL=promptEditorPlugin.d.ts.map