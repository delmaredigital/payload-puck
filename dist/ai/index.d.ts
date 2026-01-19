/**
 * @delmaredigital/payload-puck/ai
 *
 * AI integration for the Puck visual editor.
 *
 * This module provides:
 * - Server-side API route handlers for Puck AI chat
 * - Headless page generation for programmatic workflows
 * - Client-side AI plugin factory
 * - Prompt editor plugin for managing prompts in the editor
 * - Utilities for adding AI metadata to component configs
 *
 * @example Quick Start
 * ```typescript
 * // 1. Create API route for AI chat
 * // app/api/puck/[...all]/route.ts
 * import { createPuckAiApiRoutes } from '@delmaredigital/payload-puck/ai'
 *
 * export const POST = createPuckAiApiRoutes({
 *   payloadConfig: config,
 *   auth: { authenticate: async (req) => ... },
 *   ai: { context: 'We are Acme Corp...' },
 * })
 *
 * // 2. Enable AI in the editor
 * <PuckEditor enableAi={true} />
 *
 * // Or use the factory for custom prompts
 * import { createAiPlugin } from '@delmaredigital/payload-puck/ai'
 * const aiPlugin = createAiPlugin({ examplePrompts: [...] })
 * <PuckEditor plugins={[aiPlugin]} />
 * ```
 *
 * @packageDocumentation
 */
export { createPuckAiApiRoutes } from './createAiApiRoutes.js';
export { createAiGenerate } from './createAiGenerate.js';
export { createPromptApiRoutes, createPromptApiRoutesWithId, type PromptApiRoutesConfig, } from './plugins/promptApiRoutes.js';
export { createAiPlugin } from './createAiPlugin.js';
export { createPromptEditorPlugin } from './plugins/promptEditorPlugin.js';
export { PromptEditorPanel } from './plugins/PromptEditorPanel.js';
export { createContextEditorPlugin } from './plugins/contextEditorPlugin.js';
export { ContextEditorPanel } from './plugins/ContextEditorPanel.js';
export { useAiPrompts, dispatchPromptsUpdated, AI_PROMPTS_UPDATED_EVENT, } from './hooks/useAiPrompts.js';
export { useAiContext, dispatchContextUpdated, AI_CONTEXT_UPDATED_EVENT, type UseAiContextOptions, type UseAiContextReturn, } from './hooks/useAiContext.js';
export { createPayloadTools, createTool, type PayloadToolsConfig, } from './tools/index.js';
export { injectAiConfig, hasAiConfig } from './utils/injectAiConfig.js';
export { defaultComponentAiConfig, minimalComponentAiConfig, } from './presets/componentAiDefaults.js';
export { comprehensiveComponentAiConfig, pagePatternSystemContext, pagePatternContext, componentFieldReference, allComponents, componentNames, typographyInstructions, layoutInstructions, interactiveInstructions, mediaInstructions, } from './presets/index.js';
export type { AiTool, AiToolContext, AiOptions, AiFieldConfig, AiComponentConfig, PuckAiRoutesConfig, PuckAiRouteHandlers, AiGenerateConfig, AiGenerateOptions, AiGenerateFunction, AiPluginOptions, AiExamplePrompt, PromptEditorPluginOptions, ComponentAiOverrides, AiPrompt, AiContext, ContextEditorPluginOptions, PuckPluginAiConfig, } from './types.js';
//# sourceMappingURL=index.d.ts.map