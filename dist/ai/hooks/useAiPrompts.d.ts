import type { AiExamplePrompt } from '../types.js';
/** Event name for prompt updates */
export declare const AI_PROMPTS_UPDATED_EVENT = "puck:ai-prompts-updated";
/**
 * Dispatches an event to notify that AI prompts have been updated
 * Call this after creating, editing, or deleting a prompt
 */
export declare function dispatchPromptsUpdated(): void;
/**
 * Hook to fetch AI prompts client-side with auto-refresh support
 *
 * When prompts are updated via the prompt editor panel, this hook will
 * automatically refetch to stay in sync.
 *
 * @param apiEndpoint - API endpoint to fetch prompts from
 * @param enabled - Whether to enable fetching (default: true)
 * @returns Object with prompts array and loading state
 */
export declare function useAiPrompts(apiEndpoint?: string, enabled?: boolean): {
    prompts: AiExamplePrompt[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useAiPrompts.d.ts.map