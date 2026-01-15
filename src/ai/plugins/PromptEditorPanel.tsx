'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Save, X } from 'lucide-react'
import type { AiPrompt, PromptEditorPluginOptions } from '../types.js'
import { dispatchPromptsUpdated } from '../hooks/useAiPrompts.js'

interface PromptEditorPanelProps extends PromptEditorPluginOptions {}

/**
 * Panel component for managing AI prompts in the Puck editor sidebar
 */
export function PromptEditorPanel({
  apiEndpoint = '/api/puck/ai-prompts',
  canEdit = true,
  canCreate = true,
  canDelete = true,
}: PromptEditorPanelProps) {
  const [prompts, setPrompts] = useState<AiPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<Partial<AiPrompt> | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch prompts on mount
  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(apiEndpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }

      const data = await response.json()
      setPrompts(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  // Save prompt (create or update)
  const handleSave = async () => {
    if (!editingPrompt) return

    try {
      setSaving(true)
      setError(null)

      const isNew = !editingPrompt.id
      const url = isNew ? apiEndpoint : `${apiEndpoint}/${editingPrompt.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editingPrompt.label,
          prompt: editingPrompt.prompt,
          category: editingPrompt.category,
          order: editingPrompt.order,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save prompt')
      }

      setEditingPrompt(null)
      await fetchPrompts()
      // Notify AI plugin to refresh its prompts
      dispatchPromptsUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  // Delete prompt
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      setError(null)
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete prompt')
      }

      await fetchPrompts()
      // Notify AI plugin to refresh its prompts
      dispatchPromptsUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt')
    }
  }

  // Styles
  const styles = {
    container: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      height: '100%',
      overflowY: 'auto' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    title: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--puck-color-grey-01)',
      margin: 0,
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--puck-color-azure-04)',
      backgroundColor: 'var(--puck-color-azure-12)',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    promptItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'var(--puck-color-grey-12)',
      borderRadius: '6px',
      border: '1px solid var(--puck-color-grey-09)',
    },
    promptContent: {
      flex: 1,
      minWidth: 0,
    },
    promptLabel: {
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--puck-color-grey-02)',
      marginBottom: '4px',
    },
    promptText: {
      fontSize: '12px',
      color: 'var(--puck-color-grey-04)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    promptActions: {
      display: 'flex',
      gap: '4px',
    },
    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      padding: 0,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: 'var(--puck-color-grey-05)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      padding: '16px',
      backgroundColor: 'var(--puck-color-grey-11)',
      borderRadius: '6px',
      border: '1px solid var(--puck-color-grey-08)',
    },
    formField: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    },
    formLabel: {
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--puck-color-grey-03)',
    },
    formInput: {
      padding: '8px 12px',
      fontSize: '13px',
      backgroundColor: 'var(--puck-color-white)',
      border: '1px solid var(--puck-color-grey-08)',
      borderRadius: '4px',
      color: 'var(--puck-color-grey-02)',
    },
    formTextarea: {
      padding: '8px 12px',
      fontSize: '13px',
      backgroundColor: 'var(--puck-color-white)',
      border: '1px solid var(--puck-color-grey-08)',
      borderRadius: '4px',
      color: 'var(--puck-color-grey-02)',
      resize: 'vertical' as const,
      minHeight: '80px',
    },
    formActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      color: 'white',
      backgroundColor: 'var(--puck-color-azure-04)',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    cancelButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--puck-color-grey-04)',
      backgroundColor: 'var(--puck-color-grey-10)',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    errorMessage: {
      padding: '12px',
      backgroundColor: 'var(--puck-color-red-11)',
      border: '1px solid var(--puck-color-red-08)',
      borderRadius: '4px',
      color: 'var(--puck-color-red-04)',
      fontSize: '13px',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '24px',
      color: 'var(--puck-color-grey-05)',
      fontSize: '13px',
    },
    loading: {
      textAlign: 'center' as const,
      padding: '24px',
      color: 'var(--puck-color-grey-05)',
      fontSize: '13px',
    },
  }

  // Render loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading prompts...</div>
      </div>
    )
  }

  // Render edit form
  if (editingPrompt) {
    return (
      <div style={styles.container}>
        <div style={styles.form}>
          <div style={styles.formField}>
            <label style={styles.formLabel}>Label</label>
            <input
              type="text"
              style={styles.formInput}
              value={editingPrompt.label || ''}
              onChange={(e) =>
                setEditingPrompt({ ...editingPrompt, label: e.target.value })
              }
              placeholder="e.g., Landing page"
            />
          </div>
          <div style={styles.formField}>
            <label style={styles.formLabel}>Prompt</label>
            <textarea
              style={styles.formTextarea}
              value={editingPrompt.prompt || ''}
              onChange={(e) =>
                setEditingPrompt({ ...editingPrompt, prompt: e.target.value })
              }
              placeholder="e.g., Create a landing page about our product..."
            />
          </div>
          <div style={styles.formField}>
            <label style={styles.formLabel}>Category (optional)</label>
            <input
              type="text"
              style={styles.formInput}
              value={editingPrompt.category || ''}
              onChange={(e) =>
                setEditingPrompt({ ...editingPrompt, category: e.target.value })
              }
              placeholder="e.g., Marketing"
            />
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => setEditingPrompt(null)}
              disabled={saving}
            >
              <X size={14} />
              Cancel
            </button>
            <button
              type="button"
              style={styles.saveButton}
              onClick={handleSave}
              disabled={saving || !editingPrompt.label || !editingPrompt.prompt}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render prompt list
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Example Prompts</h3>
        {canCreate && (
          <button
            type="button"
            style={styles.addButton}
            onClick={() => setEditingPrompt({ label: '', prompt: '' })}
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {prompts.length === 0 ? (
        <div style={styles.emptyState}>
          No prompts yet.
          {canCreate && ' Click "Add" to create one.'}
        </div>
      ) : (
        prompts.map((prompt) => (
          <div key={prompt.id} style={styles.promptItem}>
            <GripVertical
              size={16}
              style={{ color: 'var(--puck-color-grey-07)', cursor: 'grab' }}
            />
            <div style={styles.promptContent}>
              <div style={styles.promptLabel}>{prompt.label}</div>
              <div style={styles.promptText}>{prompt.prompt}</div>
            </div>
            <div style={styles.promptActions}>
              {canEdit && (
                <button
                  type="button"
                  style={styles.iconButton}
                  onClick={() => setEditingPrompt(prompt)}
                  title="Edit prompt"
                >
                  <Pencil size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  style={styles.iconButton}
                  onClick={() => handleDelete(prompt.id)}
                  title="Delete prompt"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
