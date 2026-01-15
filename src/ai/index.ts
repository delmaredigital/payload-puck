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

// =============================================================================
// Server-side exports (API route factories)
// =============================================================================

export { createPuckAiApiRoutes } from './createAiApiRoutes.js'
export { createAiGenerate } from './createAiGenerate.js'
export {
  createPromptApiRoutes,
  createPromptApiRoutesWithId,
  type PromptApiRoutesConfig,
} from './plugins/promptApiRoutes.js'

// =============================================================================
// Client-side exports (plugins)
// =============================================================================

export { createAiPlugin } from './createAiPlugin.js'
export { createPromptEditorPlugin } from './plugins/promptEditorPlugin.js'
export { PromptEditorPanel } from './plugins/PromptEditorPanel.js'
export { createContextEditorPlugin } from './plugins/contextEditorPlugin.js'
export { ContextEditorPanel } from './plugins/ContextEditorPanel.js'

// =============================================================================
// Client-side exports (hooks)
// =============================================================================

export {
  useAiPrompts,
  dispatchPromptsUpdated,
  AI_PROMPTS_UPDATED_EVENT,
} from './hooks/useAiPrompts.js'

export {
  useAiContext,
  dispatchContextUpdated,
  AI_CONTEXT_UPDATED_EVENT,
  type UseAiContextOptions,
  type UseAiContextReturn,
} from './hooks/useAiContext.js'

// =============================================================================
// AI Tools
// =============================================================================

export {
  createPayloadTools,
  createTool,
  type PayloadToolsConfig,
} from './tools/index.js'

// =============================================================================
// Configuration utilities
// =============================================================================

export { injectAiConfig, hasAiConfig } from './utils/injectAiConfig.js'

// Legacy exports for backward compatibility
export {
  defaultComponentAiConfig,
  minimalComponentAiConfig,
} from './presets/componentAiDefaults.js'

// New comprehensive AI config exports
export {
  comprehensiveComponentAiConfig,
  pagePatternSystemContext,
  pagePatternContext,
  componentFieldReference,
  allComponents,
  componentNames,
  // Individual instruction modules for advanced usage
  typographyInstructions,
  layoutInstructions,
  interactiveInstructions,
  mediaInstructions,
} from './presets/index.js'

// =============================================================================
// Type exports
// =============================================================================

export type {
  // Tool types
  AiTool,
  AiToolContext,
  // Configuration types
  AiOptions,
  AiFieldConfig,
  AiComponentConfig,
  // API route types
  PuckAiRoutesConfig,
  PuckAiRouteHandlers,
  // Generation types
  AiGenerateConfig,
  AiGenerateOptions,
  AiGenerateFunction,
  // Plugin types
  AiPluginOptions,
  AiExamplePrompt,
  PromptEditorPluginOptions,
  // Config injection types
  ComponentAiOverrides,
  // Prompt types
  AiPrompt,
  // Context types
  AiContext,
  ContextEditorPluginOptions,
  // Plugin system types
  PuckPluginAiConfig,
} from './types.js'
