'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AiExamplePrompt } from '../types.js'

/** Event name for prompt updates */
export const AI_PROMPTS_UPDATED_EVENT = 'puck:ai-prompts-updated'

/**
 * Dispatches an event to notify that AI prompts have been updated
 * Call this after creating, editing, or deleting a prompt
 */
export function dispatchPromptsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AI_PROMPTS_UPDATED_EVENT))
  }
}

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
export function useAiPrompts(
  apiEndpoint: string = '/api/puck/ai-prompts',
  enabled: boolean = true
): {
  prompts: AiExamplePrompt[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [prompts, setPrompts] = useState<AiExamplePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiEndpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }

      const data = await response.json()
      // Transform API response to AiExamplePrompt format
      const fetchedPrompts: AiExamplePrompt[] = (data.docs || []).map(
        (doc: { label: string; prompt: string }) => ({
          label: doc.label,
          prompt: doc.prompt,
        })
      )
      setPrompts(fetchedPrompts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, enabled])

  // Initial fetch
  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Listen for prompt updates
  useEffect(() => {
    if (!enabled) return

    const handleUpdate = () => {
      fetchPrompts()
    }

    window.addEventListener(AI_PROMPTS_UPDATED_EVENT, handleUpdate)
    return () => {
      window.removeEventListener(AI_PROMPTS_UPDATED_EVENT, handleUpdate)
    }
  }, [enabled, fetchPrompts])

  return { prompts, loading, error, refetch: fetchPrompts }
}
