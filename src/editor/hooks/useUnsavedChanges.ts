'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean
  markClean: () => void
  markDirty: () => void
}

/**
 * Hook to track unsaved changes and warn before navigation
 *
 * Registers a beforeunload handler to prevent accidental navigation
 * when there are unsaved changes.
 *
 * @example
 * ```tsx
 * const { hasUnsavedChanges, markClean, markDirty } = useUnsavedChanges()
 *
 * const handleChange = () => {
 *   markDirty()
 * }
 *
 * const handleSave = async () => {
 *   await save()
 *   markClean()
 * }
 * ```
 */
export function useUnsavedChanges(): UseUnsavedChangesReturn {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Use a ref to track the latest value for the beforeunload handler
  // This ensures the handler always checks the current value, not a stale closure
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges)
  hasUnsavedChangesRef.current = hasUnsavedChanges

  // Register beforeunload handler once (uses ref for latest value)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault()
        // Modern browsers ignore custom messages but still show a warning
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const markClean = useCallback(() => {
    hasUnsavedChangesRef.current = false // Update ref immediately for beforeunload
    setHasUnsavedChanges(false)
  }, [])

  const markDirty = useCallback(() => {
    hasUnsavedChangesRef.current = true // Update ref immediately for beforeunload
    setHasUnsavedChanges(true)
  }, [])

  return {
    hasUnsavedChanges,
    markClean,
    markDirty,
  }
}
