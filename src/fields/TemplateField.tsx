'use client'

/**
 * TemplateField - Custom Puck field for saving/loading template content
 *
 * This component provides a template picker that:
 * - Fetches templates from the puck-templates Payload collection
 * - Shows a dropdown to select a template
 * - Has a "Save as template" button to save current slot content
 * - When a template is selected, loads the saved components into the slot
 *
 * Uses Puck's usePuck hook to access and modify component slot data.
 */

import React, { useState, useEffect, useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import { createUsePuck } from '@measured/puck'
import type { Data } from '@measured/puck'
import {
  IconTemplate,
  IconLoader2,
  IconDeviceFloppy,
  IconDownload,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from '@tabler/icons-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

// Create usePuck hook for accessing editor state
const usePuck = createUsePuck()

// =============================================================================
// Types
// =============================================================================

interface TemplateItem {
  id: string
  name: string
  description?: string
  category?: string
  content: unknown[]
  updatedAt?: string
}

interface TemplateFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  readOnly?: boolean
  apiEndpoint?: string
}

interface SaveFormState {
  expanded: boolean
  name: string
  description: string
  category: string
  saving: boolean
  error: string | null
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the slot content for the currently selected component.
 * In Puck v0.20+ with the slots API, slot content is stored directly
 * in the component's props.content array.
 */
function getSlotContent(
  data: Data,
  componentId: string,
  selectedItem: { type: string; props: Record<string, unknown> } | null
): unknown[] {
  // With Puck v0.20+ slots API, content is stored directly in the component's props
  if (selectedItem?.props?.content) {
    const content = selectedItem.props.content
    if (Array.isArray(content) && content.length > 0) {
      return content
    }
  }

  // Also search in data.content for the component
  if (data.content && Array.isArray(data.content)) {
    for (const item of data.content) {
      const component = item as { type: string; props: { id?: string; content?: unknown[] } }
      if (component.props?.id === componentId) {
        if (component.props?.content && Array.isArray(component.props.content)) {
          if (component.props.content.length > 0) {
            return component.props.content
          }
        }
      }
    }
  }

  return []
}

/**
 * Find and update a component's props in the Puck data tree.
 * Recursively searches through content and zones.
 */
function updateComponentInData(
  data: Data,
  componentId: string,
  propsToMerge: Record<string, unknown>
): Data {
  // Helper to update components in an array
  const updateInArray = (
    items: Array<{ type: string; props: Record<string, unknown> }>
  ): Array<{ type: string; props: Record<string, unknown> }> => {
    return items.map((item) => {
      if (item.props?.id === componentId) {
        return {
          ...item,
          props: {
            ...item.props,
            ...propsToMerge,
          },
        }
      }
      // Recursively check nested content (slots)
      if (item.props?.content && Array.isArray(item.props.content)) {
        return {
          ...item,
          props: {
            ...item.props,
            content: updateInArray(item.props.content as Array<{ type: string; props: Record<string, unknown> }>),
          },
        }
      }
      return item
    })
  }

  // Update content array
  const updatedContent = data.content
    ? updateInArray(data.content as Array<{ type: string; props: Record<string, unknown> }>)
    : []

  // Update zones
  const updatedZones: Record<string, Array<{ type: string; props: Record<string, unknown> }>> = {}
  if (data.zones) {
    for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
      updatedZones[zoneName] = updateInArray(
        zoneContent as Array<{ type: string; props: Record<string, unknown> }>
      )
    }
  }

  return {
    ...data,
    content: updatedContent,
    zones: updatedZones,
  }
}

// =============================================================================
// TemplateField Component
// =============================================================================

function TemplateFieldInner({
  value,
  onChange,
  label = 'Template',
  readOnly,
  apiEndpoint = '/api/puck-templates',
}: TemplateFieldProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveForm, setSaveForm] = useState<SaveFormState>({
    expanded: false,
    name: '',
    description: '',
    category: '',
    saving: false,
    error: null,
  })

  // Puck state access
  const appState = usePuck((s) => s.appState)
  const dispatch = usePuck((s) => s.dispatch)
  const selectedItem = usePuck((s) => s.selectedItem)
  const getSelectorForId = usePuck((s) => s.getSelectorForId)

  // Get current component ID
  const componentId = selectedItem?.props?.id as string | undefined

  // Fetch templates from Payload API
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: '100',
        sort: '-updatedAt',
      })

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      const items: TemplateItem[] = (data.docs || []).map(
        (doc: Record<string, unknown>) => ({
          id: doc.id as string,
          name: doc.name as string,
          description: doc.description as string | undefined,
          category: doc.category as string | undefined,
          content: doc.content as unknown[],
          updatedAt: doc.updatedAt as string | undefined,
        })
      )

      setTemplates(items)
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  // Load templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Handle template selection - load content into slot
  const handleTemplateSelect = useCallback(
    async (templateId: string) => {
      if (!componentId || !selectedItem) return

      // Find the selected template (compare as strings to handle UUID vs SERIAL ID types)
      const template = templates.find((t) => String(t.id) === String(templateId))
      if (!template) return

      setLoadingTemplate(true)
      try {
        // Get the component's selector (index and zone) for atomic replace
        const selector = getSelectorForId(componentId)

        if (selector) {
          // Use atomic 'replace' action - much more efficient than setData
          // This only updates this specific component instead of the entire data tree
          dispatch({
            type: 'replace',
            destinationIndex: selector.index,
            destinationZone: selector.zone,
            data: {
              type: selectedItem.type,
              props: {
                ...selectedItem.props,
                content: template.content,
                templateId: templateId,
              },
            },
          })
        } else {
          // Fallback to setData if selector not found (shouldn't happen normally)
          const updatedData = updateComponentInData(
            appState.data,
            componentId,
            { content: template.content, templateId: templateId }
          )
          dispatch({
            type: 'setData',
            data: updatedData,
          })
        }

        // Also call onChange to ensure field state is in sync
        onChange(templateId)
      } catch (err) {
        console.error('Error loading template:', err)
        setError('Failed to load template')
      } finally {
        setLoadingTemplate(false)
      }
    },
    [componentId, selectedItem, templates, getSelectorForId, appState.data, dispatch, onChange]
  )

  // Handle clearing template selection
  const handleClearTemplate = useCallback(() => {
    onChange(null)
  }, [onChange])

  // Toggle save form
  const handleToggleSaveForm = useCallback(() => {
    setSaveForm((prev) => ({
      ...prev,
      expanded: !prev.expanded,
      error: null,
    }))
  }, [])

  // Close save form
  const handleCloseSaveForm = useCallback(() => {
    setSaveForm({
      expanded: false,
      name: '',
      description: '',
      category: '',
      saving: false,
      error: null,
    })
  }, [])

  // Save current slot content as a new template
  const handleSaveTemplate = useCallback(async () => {
    if (!componentId) return

    const name = saveForm.name.trim()
    if (!name) {
      setSaveForm((prev) => ({
        ...prev,
        error: 'Please enter a template name',
      }))
      return
    }

    setSaveForm((prev) => ({ ...prev, saving: true, error: null }))

    try {
      // Get current slot content (using slots API - content is in props.content)
      const content = getSlotContent(appState.data, componentId, selectedItem)

      if (content.length === 0) {
        throw new Error('No content to save. Add components to the template first.')
      }

      // Save to Payload
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: saveForm.description.trim() || undefined,
          category: saveForm.category.trim() || undefined,
          content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || errorData.errors?.[0]?.message || 'Failed to save template'
        )
      }

      const data = await response.json()
      const doc = data.doc || data

      // Create the new template object
      const newTemplate: TemplateItem = {
        id: doc.id as string,
        name: doc.name as string,
        description: doc.description as string | undefined,
        category: doc.category as string | undefined,
        content: doc.content as unknown[],
        updatedAt: doc.updatedAt as string | undefined,
      }

      // Add to local templates list
      setTemplates((prev) => [newTemplate, ...prev])

      // Close form
      handleCloseSaveForm()

      // Use a small delay to ensure state has updated before selecting
      setTimeout(() => {
        onChange(newTemplate.id)
      }, 50)
    } catch (err) {
      console.error('Error saving template:', err)
      setSaveForm((prev) => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save template',
      }))
    }
  }, [componentId, appState.data, selectedItem, apiEndpoint, saveForm, onChange, handleCloseSaveForm])

  // Get selected template name for display (compare as strings for type safety)
  const selectedTemplate = templates.find((t) => String(t.id) === String(value))

  // Group templates by category
  const categorizedTemplates = templates.reduce<Record<string, TemplateItem[]>>(
    (acc, template) => {
      const category = template.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(template)
      return acc
    },
    {}
  )

  return (
    <div className="puck-field space-y-3">
      {label && (
        <Label className="block text-sm font-medium text-foreground">
          {label}
        </Label>
      )}

      {/* Template Selector - Native select to avoid portal conflicts */}
      <div className="flex gap-2">
        <select
          value={value || ''}
          onChange={(e) => e.target.value && handleTemplateSelect(e.target.value)}
          disabled={readOnly || loading || loadingTemplate}
          className={cn(
            'flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <option value="">
            {loading ? 'Loading...' : loadingTemplate ? 'Loading template...' : 'Select a template'}
          </option>
          {Object.entries(categorizedTemplates).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {value && !readOnly && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearTemplate}
            title="Clear selection"
            className="text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSaveForm}
            className="flex-1 gap-1.5"
            disabled={loading || saveForm.saving}
          >
            {saveForm.expanded ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconDeviceFloppy className="h-4 w-4" />
            )}
            {saveForm.expanded ? 'Cancel' : 'Save as Template'}
          </Button>

          {value && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect(value)}
              className="gap-1.5"
              disabled={loadingTemplate}
            >
              {loadingTemplate ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconDownload className="h-4 w-4" />
              )}
              Reload
            </Button>
          )}
        </div>
      )}

      {/* Inline Save Form */}
      {saveForm.expanded && (
        <div className="space-y-3 p-3 border border-border rounded-md bg-muted/30">
          <div className="space-y-1.5">
            <Label htmlFor="template-name" className="text-xs">
              Template Name *
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., Hero Section with CTA"
              value={saveForm.name}
              onChange={(e) =>
                setSaveForm((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={saveForm.saving}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-description" className="text-xs">
              Description
            </Label>
            <Input
              id="template-description"
              placeholder="Optional description..."
              value={saveForm.description}
              onChange={(e) =>
                setSaveForm((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={saveForm.saving}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-category" className="text-xs">
              Category
            </Label>
            <Input
              id="template-category"
              placeholder="e.g., Hero, Footer, CTA"
              value={saveForm.category}
              onChange={(e) =>
                setSaveForm((prev) => ({ ...prev, category: e.target.value }))
              }
              disabled={saveForm.saving}
              className="h-8 text-sm"
            />
          </div>

          {saveForm.error && (
            <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-xs flex items-start gap-2">
              <IconAlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{saveForm.error}</span>
            </div>
          )}

          <Button
            onClick={handleSaveTemplate}
            disabled={saveForm.saving}
            size="sm"
            className="w-full gap-1.5"
          >
            {saveForm.saving ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-start gap-2">
          <IconAlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const TemplateField = memo(TemplateFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for template selection
 *
 * @example
 * ```ts
 * const TemplateConfig: ComponentConfig = {
 *   fields: {
 *     templateId: createTemplateField({ label: 'Template' }),
 *     content: { type: 'slot' },
 *   },
 * }
 * ```
 */
export function createTemplateField(config: {
  label?: string
  apiEndpoint?: string
}): CustomField<string | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <TemplateField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        apiEndpoint={config.apiEndpoint}
      />
    ),
  }
}
