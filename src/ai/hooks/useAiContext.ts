'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AiContext } from '../types.js'

/** Event name for context updates */
export const AI_CONTEXT_UPDATED_EVENT = 'puck:ai-context-updated'

/**
 * Dispatches an event to notify that AI context has been updated
 * Call this after creating, editing, or deleting a context entry
 */
export function dispatchContextUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AI_CONTEXT_UPDATED_EVENT))
  }
}

export interface UseAiContextOptions {
  /**
   * API endpoint to fetch context from
   * @default '/api/puck/ai-context'
   */
  apiEndpoint?: string
  /**
   * Whether to enable fetching
   * @default true
   */
  enabled?: boolean
  /**
   * Whether to include disabled entries
   * @default false
   */
  includeDisabled?: boolean
}

export interface UseAiContextReturn {
  /** Array of context entries */
  context: AiContext[]
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Refetch context entries */
  refetch: () => Promise<void>
  /** Create a new context entry */
  create: (data: Omit<AiContext, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AiContext | null>
  /** Update an existing context entry */
  update: (id: string, data: Partial<AiContext>) => Promise<AiContext | null>
  /** Delete a context entry */
  remove: (id: string) => Promise<boolean>
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
export function useAiContext(options: UseAiContextOptions = {}): UseAiContextReturn {
  const {
    apiEndpoint = '/api/puck/ai-context',
    enabled = true,
    includeDisabled = false,
  } = options

  const [context, setContext] = useState<AiContext[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContext = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = includeDisabled ? `${apiEndpoint}?all=true` : apiEndpoint
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch context')
      }

      const data = await response.json()
      setContext(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load context')
      setContext([])
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, enabled, includeDisabled])

  // Create a new context entry
  const create = useCallback(
    async (
      data: Omit<AiContext, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<AiContext | null> => {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create context entry')
        }

        const newEntry = await response.json()
        dispatchContextUpdated()
        return newEntry
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create context entry')
        return null
      }
    },
    [apiEndpoint]
  )

  // Update an existing context entry
  const update = useCallback(
    async (id: string, data: Partial<AiContext>): Promise<AiContext | null> => {
      try {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update context entry')
        }

        const updatedEntry = await response.json()
        dispatchContextUpdated()
        return updatedEntry
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update context entry')
        return null
      }
    },
    [apiEndpoint]
  )

  // Delete a context entry
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete context entry')
        }

        dispatchContextUpdated()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete context entry')
        return false
      }
    },
    [apiEndpoint]
  )

  // Initial fetch
  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  // Listen for context updates
  useEffect(() => {
    if (!enabled) return

    const handleUpdate = () => {
      fetchContext()
    }

    window.addEventListener(AI_CONTEXT_UPDATED_EVENT, handleUpdate)
    return () => {
      window.removeEventListener(AI_CONTEXT_UPDATED_EVENT, handleUpdate)
    }
  }, [enabled, fetchContext])

  return {
    context,
    loading,
    error,
    refetch: fetchContext,
    create,
    update,
    remove,
  }
}
