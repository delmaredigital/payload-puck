import type { NextRequest } from 'next/server'
import type { Config as PuckConfig, Data as PuckData } from '@puckeditor/core'
import type { SanitizedConfig } from 'payload'
import type { PuckApiAuthHooks, AuthenticatedUser } from '../api/types.js'

// =============================================================================
// AI Tool Types
// =============================================================================

/**
 * Tool definition for AI agent
 *
 * Tools enable the AI to query your system for information,
 * executing functions directly on your server.
 *
 * @example
 * ```typescript
 * import { z } from 'zod'
 *
 * const getProducts: AiTool = {
 *   description: 'Get a list of products',
 *   inputSchema: z.object({
 *     category: z.enum(['consumer', 'business']),
 *   }),
 *   execute: async ({ category }) => {
 *     return await payload.find({ collection: 'products', where: { category } })
 *   },
 * }
 * ```
 */
/**
 * Context passed to tool execution
 * Contains the Payload instance for database operations
 */
export interface AiToolContext {
  /**
   * Payload CMS instance for database operations
   */
  payload: import('payload').Payload
  /**
   * The authenticated user making the request
   */
  user?: import('payload').User
}

export interface AiTool<TInput = unknown, TOutput = unknown> {
  /**
   * A description that the agent will use to understand how to use this tool
   */
  description: string
  /**
   * The shape of the parameters provided to the execute function.
   * Must be a Zod object schema.
   */
  inputSchema: import('zod').ZodObject<any>
  /**
   * The execution function for the tool.
   * Will receive parameters provided by the agent that match the inputSchema.
   * The second parameter is optional execution context containing the Payload instance
   * (available when using createPuckPlugin with auto-registered endpoints).
   */
  execute: (params: TInput, context?: AiToolContext) => Promise<TOutput> | TOutput
  /**
   * Optional name for the tool
   */
  name?: string
  /**
   * Controls how the tool interacts with the AI agent.
   * - "auto": Agent decides when to use the tool (default)
   * - "preload": Tool result is fetched before generation starts
   * - "inline": Tool runs inline during generation
   */
  mode?: 'auto' | 'preload' | 'inline'
  /**
   * Optional output schema for the tool's return value.
   * Must be a Zod schema.
   */
  outputSchema?: import('zod').ZodTypeAny
}

// =============================================================================
// AI Configuration Types
// =============================================================================

/**
 * AI-specific configuration options for the server-side handler
 */
export interface AiOptions {
  /**
   * System context and instructions for the AI agent.
   * Guides the AI's behavior and output.
   *
   * @example
   * ```typescript
   * context: `## Overview
   * We are Google. You help us build Google landing pages.
   *
   * ## Brand Guidelines
   * Our brand colors are:
   * - #4285F4 (primary)
   * - #DB4437
   *
   * ## Tone of Voice
   * - American English
   * - Professional but friendly`
   * ```
   */
  context?: string
  /**
   * Custom tools that enable the AI to execute server-side functions.
   * Tools allow the agent to query your database, fetch external data, etc.
   */
  tools?: Record<string, AiTool>
  /**
   * Custom Puck Cloud API key.
   * Defaults to PUCK_API_KEY environment variable.
   */
  apiKey?: string
  /**
   * Custom Puck Cloud host URL
   */
  host?: string
  /**
   * Callback invoked when AI generation finishes.
   * Provides usage metrics for cost tracking and analytics.
   *
   * @example
   * ```typescript
   * onFinish: ({ totalCost, tokenUsage }) => {
   *   console.log(`Used ${tokenUsage.totalTokens} tokens, cost: ${totalCost}`)
   * }
   * ```
   */
  onFinish?: (result: {
    totalCost: number
    tokenUsage: {
      inputTokens: number | undefined
      outputTokens: number | undefined
      totalTokens: number | undefined
      reasoningTokens?: number | undefined
      cachedInputTokens?: number | undefined
    }
  }) => void
}

// =============================================================================
// AI Field Configuration
// =============================================================================

/**
 * AI configuration for a Puck field
 *
 * Add to any field's configuration to control how the AI generates content for it.
 *
 * @example
 * ```typescript
 * fields: {
 *   title: {
 *     type: 'text',
 *     ai: {
 *       instructions: 'Always use sentence case',
 *       required: true,
 *     },
 *   },
 * }
 * ```
 */
export interface AiFieldConfig {
  /**
   * Instructions for the AI when generating this field's value
   */
  instructions?: string
  /**
   * Whether this field is required for AI generation
   * (even if not present in defaultProps)
   */
  required?: boolean
  /**
   * Exclude this field from AI generation.
   * Useful for fields like media library references that AI can't populate.
   */
  exclude?: boolean
  /**
   * Custom JSON schema for the field.
   * Required for 'custom', 'external', or user-defined fields
   * where Puck AI cannot automatically infer the schema.
   */
  schema?: {
    type: string
    [key: string]: unknown
  }
  /**
   * Bind this field to a named tool. The tool runs during generation
   * and its result populates this field deterministically.
   *
   * @example
   * ```typescript
   * fields: {
   *   src: {
   *     type: 'text',
   *     ai: { bind: 'getImageUrl' },
   *   },
   * }
   * ```
   */
  bind?: string
  /**
   * Whether this field's value should be streamed during AI generation.
   */
  stream?: boolean
}

/**
 * AI configuration for a Puck component
 *
 * @example
 * ```typescript
 * const HeadingConfig = {
 *   ai: {
 *     instructions: 'Always place this at the top of sections',
 *   },
 *   fields: { ... },
 *   render: ({ title }) => <h1>{title}</h1>,
 * }
 * ```
 */
export interface AiComponentConfig {
  /**
   * Instructions for the AI when using this component
   */
  instructions?: string
  /**
   * Exclude this component from AI generation.
   * The component remains available for manual use in the editor.
   */
  exclude?: boolean
  /**
   * Controls which components are allowed/disallowed in the default slot zone
   * during AI generation.
   */
  defaultZone?: { allow?: string[]; disallow?: string[]; disabled?: boolean }
  /**
   * @deprecated Removed in Puck AI 0.4. Use field-level `schema` on `AiFieldConfig` instead.
   */
  schema?: {
    type: 'object'
    parameters: Record<string, { type: string; [key: string]: unknown }>
    required?: string[]
  }
}

// =============================================================================
// API Routes Configuration
// =============================================================================

/**
 * Configuration for Puck AI API routes
 *
 * @example
 * ```typescript
 * // app/api/puck/[...all]/route.ts
 * import { createPuckAiApiRoutes } from '@delmaredigital/payload-puck/ai'
 *
 * export const POST = createPuckAiApiRoutes({
 *   payloadConfig: config,
 *   auth: {
 *     authenticate: async (request) => {
 *       // Your auth implementation
 *     },
 *   },
 *   ai: {
 *     context: 'We are Acme Corp. You build our landing pages.',
 *   },
 * })
 * ```
 */
export interface PuckAiRoutesConfig {
  /**
   * Payload configuration - import from @payload-config
   */
  payloadConfig: Promise<SanitizedConfig>
  /**
   * Authentication hooks (reuses existing pattern from API routes)
   */
  auth: PuckApiAuthHooks
  /**
   * AI-specific options
   */
  ai?: AiOptions
  /**
   * Custom error handler for logging/monitoring
   */
  onError?: (error: unknown, context: { operation: string; request: NextRequest }) => void
}

/**
 * Route handlers returned by createPuckAiApiRoutes
 */
export interface PuckAiRouteHandlers {
  POST: (request: NextRequest) => Promise<Response>
}

// =============================================================================
// Headless Generation Configuration
// =============================================================================

/**
 * Configuration for headless AI page generation
 *
 * @example
 * ```typescript
 * const generatePage = createAiGenerate({
 *   payloadConfig: config,
 *   auth: { authenticate: async (req) => ... },
 *   ai: { context: 'We are Acme Corp...' },
 * })
 *
 * const pageData = await generatePage({
 *   prompt: 'Create a landing page for our new product',
 *   puckConfig: editorConfig,
 * })
 * ```
 */
export interface AiGenerateConfig {
  /**
   * Payload configuration - import from @payload-config
   */
  payloadConfig: Promise<SanitizedConfig>
  /**
   * Authentication hooks
   */
  auth: PuckApiAuthHooks
  /**
   * AI-specific options
   */
  ai?: AiOptions
}

/**
 * Options for a single generation request
 */
export interface AiGenerateOptions {
  /**
   * Natural language prompt for generation
   */
  prompt: string
  /**
   * The Puck configuration with component definitions
   */
  puckConfig: PuckConfig
  /**
   * Optional authenticated user for the generation
   */
  user?: AuthenticatedUser
  /**
   * Existing Puck data to consider when actioning the prompt.
   * Use this to update an existing page rather than create from scratch.
   */
  pageData?: PuckData
}

/**
 * Function returned by createAiGenerate
 */
export type AiGenerateFunction = (options: AiGenerateOptions) => Promise<PuckData>

// =============================================================================
// Client Plugin Configuration
// =============================================================================

/**
 * Example prompt for the AI chat interface
 */
export interface AiExamplePrompt {
  /**
   * Display label for the prompt
   */
  label: string
  /**
   * The actual prompt text
   */
  prompt: string
}

/**
 * Configuration options for the AI plugin
 *
 * @example
 * ```typescript
 * const aiPlugin = createAiPlugin({
 *   host: '/api/puck',
 *   examplePrompts: [
 *     { label: 'Landing page', prompt: 'Create a landing page about dogs' },
 *   ],
 * })
 * ```
 */
export interface AiPluginOptions {
  /**
   * API host for AI requests.
   * @default '/api/puck'
   */
  host?: string
  /**
   * Example prompts to show in the chat interface.
   * Users can click these to quickly send common prompts.
   */
  examplePrompts?: AiExamplePrompt[]
  /**
   * Callback when user submits a prompt
   */
  onSubmit?: (prompt: string) => void
  /**
   * Intercept and modify outgoing AI requests before they are sent.
   * Use this to add custom headers, credentials, or body data.
   *
   * @example
   * ```typescript
   * prepareRequest: (opts) => ({
   *   ...opts,
   *   headers: { ...opts.headers, Authorization: 'Bearer token' },
   *   credentials: 'include',
   * })
   * ```
   */
  prepareRequest?: (opts: {
    body?: {
      chatId?: string
      trigger?: string
      [key: string]: any
    }
    headers?: HeadersInit
    credentials?: RequestCredentials
  }) => any | Promise<any>
  /**
   * Enable automatic scroll tracking during AI generation.
   * When true, the editor scrolls to follow new content as it streams in.
   * @default true (in @puckeditor/plugin-ai 0.4+)
   */
  scrollTracking?: boolean
}

// =============================================================================
// Config Injection Types
// =============================================================================

/**
 * AI configuration overrides for components
 *
 * Used with injectAiConfig to add AI metadata to existing component configs.
 *
 * @example
 * ```typescript
 * const overrides: ComponentAiOverrides = {
 *   Heading: {
 *     ai: {
 *       instructions: 'Use for section titles',
 *     },
 *     fields: {
 *       text: {
 *         ai: { required: true },
 *       },
 *     },
 *   },
 * }
 * ```
 */
export interface ComponentAiOverrides {
  [componentName: string]: {
    ai?: AiComponentConfig
    fields?: {
      [fieldName: string]: {
        ai?: AiFieldConfig
      }
    }
  }
}

// =============================================================================
// Prompt Editor Plugin Types
// =============================================================================

/**
 * A stored AI prompt from the database
 */
export interface AiPrompt {
  id: string
  label: string
  prompt: string
  category?: string
  order?: number
  createdAt: string
  updatedAt: string
}

/**
 * A stored AI context entry from the database
 */
export interface AiContext {
  id: string
  name: string
  content: string
  category?: 'brand' | 'tone' | 'product' | 'industry' | 'technical' | 'patterns' | 'other'
  enabled: boolean
  order?: number
  createdAt: string
  updatedAt: string
}

/**
 * Configuration for the prompt editor plugin
 */
export interface PromptEditorPluginOptions {
  /**
   * API endpoint for prompt CRUD operations
   * @default '/api/puck/ai-prompts'
   */
  apiEndpoint?: string
  /**
   * Whether users can edit prompts in the panel
   * @default true
   */
  canEdit?: boolean
  /**
   * Whether to show the create button
   * @default true
   */
  canCreate?: boolean
  /**
   * Whether to show delete buttons
   * @default true
   */
  canDelete?: boolean
}

/**
 * Configuration for the context editor plugin
 */
export interface ContextEditorPluginOptions {
  /**
   * API endpoint for context CRUD operations
   * @default '/api/puck/ai-context'
   */
  apiEndpoint?: string
  /**
   * Whether users can edit context in the panel
   * @default true
   */
  canEdit?: boolean
  /**
   * Whether to show the create button
   * @default true
   */
  canCreate?: boolean
  /**
   * Whether to show delete buttons
   * @default true
   */
  canDelete?: boolean
}

// =============================================================================
// Plugin System Integration Types
// =============================================================================

/**
 * AI configuration for createPuckPlugin
 */
export interface PuckPluginAiConfig {
  /**
   * Enable AI features
   * @default false
   */
  enabled?: boolean
  /**
   * System context for the AI agent
   */
  context?: string
  /**
   * Custom tools that enable the AI to execute server-side functions.
   * Tools allow the agent to query your database, fetch external data, etc.
   *
   * @example
   * ```typescript
   * import { z } from 'zod'
   *
   * createPuckPlugin({
   *   ai: {
   *     enabled: true,
   *     tools: {
   *       getProducts: {
   *         description: 'Get products from the database',
   *         inputSchema: z.object({ category: z.string() }),
   *         execute: async ({ category }) => {
   *           return await payload.find({ collection: 'products', where: { category } })
   *         },
   *       },
   *     },
   *   },
   * })
   * ```
   */
  tools?: Record<string, AiTool>
  /**
   * Example prompts for the chat interface
   */
  examplePrompts?: AiExamplePrompt[]
  /**
   * Auto-create puck-ai-prompts collection for storing prompts
   * @default false
   */
  promptsCollection?: boolean
  /**
   * Auto-create puck-ai-context collection for dynamic business context.
   * When enabled, context entries can be managed via Payload admin and
   * the Context Editor panel in the Puck editor.
   * @default false
   */
  contextCollection?: boolean
  /**
   * Custom component AI instructions to override or extend defaults.
   * When AI is enabled, built-in component instructions are auto-applied.
   * Use this to customize instructions for your brand/use case.
   *
   * @example
   * ```typescript
   * createPuckPlugin({
   *   ai: {
   *     enabled: true,
   *     componentInstructions: {
   *       Heading: {
   *         ai: { instructions: 'Use our brand voice: professional but approachable' },
   *         fields: {
   *           text: { ai: { instructions: 'Keep under 8 words' } },
   *         },
   *       },
   *     },
   *   },
   * })
   * ```
   */
  componentInstructions?: ComponentAiOverrides
  /**
   * Callback invoked when AI generation finishes.
   * Provides usage metrics for cost tracking and analytics.
   */
  onFinish?: (result: {
    totalCost: number
    tokenUsage: {
      inputTokens: number | undefined
      outputTokens: number | undefined
      totalTokens: number | undefined
      reasoningTokens?: number | undefined
      cachedInputTokens?: number | undefined
    }
  }) => void
}
