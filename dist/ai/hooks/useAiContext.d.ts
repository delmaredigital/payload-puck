import type { AiContext } from '../types.js';
/** Event name for context updates */
export declare const AI_CONTEXT_UPDATED_EVENT = "puck:ai-context-updated";
/**
 * Dispatches an event to notify that AI context has been updated
 * Call this after creating, editing, or deleting a context entry
 */
export declare function dispatchContextUpdated(): void;
export interface UseAiContextOptions {
    /**
     * API endpoint to fetch context from
     * @default '/api/puck/ai-context'
     */
    apiEndpoint?: string;
    /**
     * Whether to enable fetching
     * @default true
     */
    enabled?: boolean;
    /**
     * Whether to include disabled entries
     * @default false
     */
    includeDisabled?: boolean;
}
export interface UseAiContextReturn {
    /** Array of context entries */
    context: AiContext[];
    /** Loading state */
    loading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refetch context entries */
    refetch: () => Promise<void>;
    /** Create a new context entry */
    create: (data: Omit<AiContext, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AiContext | null>;
    /** Update an existing context entry */
    update: (id: string, data: Partial<AiContext>) => Promise<AiContext | null>;
    /** Delete a context entry */
    remove: (id: string) => Promise<boolean>;
}
/**
 * Hook to fetch and manage AI context entries client-side
 *
 * When context is updated via the context editor panel, this hook will
 * automatically refetch to stay in sync.
 *
 * @example
 * ```tsx
 * const { context, loading, create, update, remove } = useAiContext()
 *
 * // Create a new context entry
 * await create({ name: 'Brand Guidelines', content: '...', enabled: true })
 *
 * // Update an entry
 * await update(context[0].id, { content: 'Updated content' })
 *
 * // Delete an entry
 * await remove(context[0].id)
 * ```
 */
export declare function useAiContext(options?: UseAiContextOptions): UseAiContextReturn;
//# sourceMappingURL=useAiContext.d.ts.map