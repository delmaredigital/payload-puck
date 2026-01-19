'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Save, X, Eye, EyeOff } from 'lucide-react';
import { dispatchContextUpdated } from '../hooks/useAiContext.js';
const CATEGORY_OPTIONS = [
    { label: 'Brand Guidelines', value: 'brand' },
    { label: 'Tone of Voice', value: 'tone' },
    { label: 'Product Information', value: 'product' },
    { label: 'Industry Context', value: 'industry' },
    { label: 'Technical Requirements', value: 'technical' },
    { label: 'Page Patterns', value: 'patterns' },
    { label: 'Other', value: 'other' },
];
/**
 * Panel component for managing AI context in the Puck editor sidebar
 */
export function ContextEditorPanel({ apiEndpoint = '/api/puck/ai-context', canEdit = true, canCreate = true, canDelete = true, }) {
    const [context, setContext] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingContext, setEditingContext] = useState(null);
    const [saving, setSaving] = useState(false);
    // Fetch context on mount (include all, both enabled and disabled)
    const fetchContext = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${apiEndpoint}?all=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch context');
            }
            const data = await response.json();
            setContext(data.docs || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load context');
        }
        finally {
            setLoading(false);
        }
    }, [apiEndpoint]);
    useEffect(() => {
        fetchContext();
    }, [fetchContext]);
    // Save context (create or update)
    const handleSave = async () => {
        if (!editingContext)
            return;
        try {
            setSaving(true);
            setError(null);
            const isNew = !editingContext.id;
            const url = isNew ? apiEndpoint : `${apiEndpoint}/${editingContext.id}`;
            const method = isNew ? 'POST' : 'PATCH';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingContext.name,
                    content: editingContext.content,
                    category: editingContext.category,
                    enabled: editingContext.enabled ?? true,
                    order: editingContext.order ?? 0,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to save context');
            }
            setEditingContext(null);
            await fetchContext();
            dispatchContextUpdated();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save context');
        }
        finally {
            setSaving(false);
        }
    };
    // Toggle enabled state
    const handleToggleEnabled = async (entry) => {
        try {
            setError(null);
            const response = await fetch(`${apiEndpoint}/${entry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !entry.enabled }),
            });
            if (!response.ok) {
                throw new Error('Failed to update context');
            }
            await fetchContext();
            dispatchContextUpdated();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update context');
        }
    };
    // Delete context
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this context entry?'))
            return;
        try {
            setError(null);
            const response = await fetch(`${apiEndpoint}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete context');
            }
            await fetchContext();
            dispatchContextUpdated();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete context');
        }
    };
    // Move context entry up (swap order with previous entry)
    const handleMoveUp = async (entry, index) => {
        if (index === 0)
            return; // Already at top
        try {
            setError(null);
            const prevEntry = context[index - 1];
            // Swap order values
            await Promise.all([
                fetch(`${apiEndpoint}/${entry.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: prevEntry.order }),
                }),
                fetch(`${apiEndpoint}/${prevEntry.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: entry.order }),
                }),
            ]);
            await fetchContext();
            dispatchContextUpdated();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder context');
        }
    };
    // Move context entry down (swap order with next entry)
    const handleMoveDown = async (entry, index) => {
        if (index >= context.length - 1)
            return; // Already at bottom
        try {
            setError(null);
            const nextEntry = context[index + 1];
            // Swap order values
            await Promise.all([
                fetch(`${apiEndpoint}/${entry.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: nextEntry.order }),
                }),
                fetch(`${apiEndpoint}/${nextEntry.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: entry.order }),
                }),
            ]);
            await fetchContext();
            dispatchContextUpdated();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder context');
        }
    };
    // Styles (matching PromptEditorPanel)
    const styles = {
        container: {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            height: '100%',
            overflowY: 'auto',
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
        contextItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--puck-color-grey-12)',
            borderRadius: '6px',
            border: '1px solid var(--puck-color-grey-09)',
        },
        contextItemDisabled: {
            opacity: 0.6,
        },
        contextContent: {
            flex: 1,
            minWidth: 0,
        },
        contextName: {
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--puck-color-grey-02)',
            marginBottom: '2px',
        },
        contextCategory: {
            fontSize: '11px',
            color: 'var(--puck-color-grey-05)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        contextPreview: {
            fontSize: '12px',
            color: 'var(--puck-color-grey-04)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        contextActions: {
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
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--puck-color-grey-11)',
            borderRadius: '6px',
            border: '1px solid var(--puck-color-grey-08)',
        },
        formField: {
            display: 'flex',
            flexDirection: 'column',
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
        formSelect: {
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
            resize: 'vertical',
            minHeight: '120px',
            fontFamily: 'monospace',
        },
        formCheckbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
            textAlign: 'center',
            padding: '24px',
            color: 'var(--puck-color-grey-05)',
            fontSize: '13px',
        },
        loading: {
            textAlign: 'center',
            padding: '24px',
            color: 'var(--puck-color-grey-05)',
            fontSize: '13px',
        },
        helpText: {
            fontSize: '11px',
            color: 'var(--puck-color-grey-05)',
            marginTop: '2px',
        },
    };
    // Render loading state
    if (loading) {
        return (_jsx("div", { style: styles.container, children: _jsx("div", { style: styles.loading, children: "Loading context..." }) }));
    }
    // Render edit form
    if (editingContext) {
        return (_jsx("div", { style: styles.container, children: _jsxs("div", { style: styles.form, children: [_jsxs("div", { style: styles.formField, children: [_jsx("label", { style: styles.formLabel, children: "Name" }), _jsx("input", { type: "text", style: styles.formInput, value: editingContext.name || '', onChange: (e) => setEditingContext({ ...editingContext, name: e.target.value }), placeholder: "e.g., Brand Guidelines" })] }), _jsxs("div", { style: styles.formField, children: [_jsx("label", { style: styles.formLabel, children: "Category" }), _jsxs("select", { style: styles.formSelect, value: editingContext.category || '', onChange: (e) => setEditingContext({
                                    ...editingContext,
                                    category: e.target.value,
                                }), children: [_jsx("option", { value: "", children: "Select a category..." }), CATEGORY_OPTIONS.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value)))] })] }), _jsxs("div", { style: styles.formField, children: [_jsx("label", { style: styles.formLabel, children: "Content" }), _jsx("textarea", { style: styles.formTextarea, value: editingContext.content || '', onChange: (e) => setEditingContext({ ...editingContext, content: e.target.value }), placeholder: "Enter markdown content for the AI to use..." }), _jsx("div", { style: styles.helpText, children: "Use markdown formatting. This content will be included in AI prompts." })] }), _jsx("div", { style: styles.formField, children: _jsxs("label", { style: styles.formCheckbox, children: [_jsx("input", { type: "checkbox", checked: editingContext.enabled ?? true, onChange: (e) => setEditingContext({ ...editingContext, enabled: e.target.checked }) }), _jsx("span", { style: styles.formLabel, children: "Enabled" })] }) }), error && _jsx("div", { style: styles.errorMessage, children: error }), _jsxs("div", { style: styles.formActions, children: [_jsxs("button", { type: "button", style: styles.cancelButton, onClick: () => setEditingContext(null), disabled: saving, children: [_jsx(X, { size: 14 }), "Cancel"] }), _jsxs("button", { type: "button", style: styles.saveButton, onClick: handleSave, disabled: saving || !editingContext.name || !editingContext.content, children: [_jsx(Save, { size: 14 }), saving ? 'Saving...' : 'Save'] })] })] }) }));
    }
    // Render context list
    return (_jsxs("div", { style: styles.container, children: [_jsxs("div", { style: styles.header, children: [_jsx("h3", { style: styles.title, children: "AI Context" }), canCreate && (_jsxs("button", { type: "button", style: styles.addButton, onClick: () => setEditingContext({ name: '', content: '', enabled: true, order: 0 }), children: [_jsx(Plus, { size: 14 }), "Add"] }))] }), error && _jsx("div", { style: styles.errorMessage, children: error }), context.length === 0 ? (_jsxs("div", { style: styles.emptyState, children: ["No context entries yet.", canCreate && ' Click "Add" to create one.'] })) : (context.map((entry, index) => (_jsxs("div", { style: {
                    ...styles.contextItem,
                    ...(entry.enabled ? {} : styles.contextItemDisabled),
                }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px' }, children: [_jsx("button", { type: "button", style: {
                                    ...styles.iconButton,
                                    width: '20px',
                                    height: '20px',
                                    opacity: index === 0 ? 0.3 : 1,
                                    cursor: index === 0 ? 'default' : 'pointer',
                                }, onClick: () => handleMoveUp(entry, index), disabled: index === 0, title: "Move up", children: _jsx(ChevronUp, { size: 14 }) }), _jsx("button", { type: "button", style: {
                                    ...styles.iconButton,
                                    width: '20px',
                                    height: '20px',
                                    opacity: index >= context.length - 1 ? 0.3 : 1,
                                    cursor: index >= context.length - 1 ? 'default' : 'pointer',
                                }, onClick: () => handleMoveDown(entry, index), disabled: index >= context.length - 1, title: "Move down", children: _jsx(ChevronDown, { size: 14 }) })] }), _jsxs("div", { style: styles.contextContent, children: [_jsx("div", { style: styles.contextName, children: entry.name }), entry.category && (_jsx("div", { style: styles.contextCategory, children: CATEGORY_OPTIONS.find((o) => o.value === entry.category)?.label ||
                                    entry.category })), _jsxs("div", { style: styles.contextPreview, children: [entry.content.slice(0, 100), entry.content.length > 100 ? '...' : ''] })] }), _jsxs("div", { style: styles.contextActions, children: [canEdit && (_jsx("button", { type: "button", style: styles.iconButton, onClick: () => handleToggleEnabled(entry), title: entry.enabled ? 'Disable context' : 'Enable context', children: entry.enabled ? _jsx(Eye, { size: 14 }) : _jsx(EyeOff, { size: 14 }) })), canEdit && (_jsx("button", { type: "button", style: styles.iconButton, onClick: () => setEditingContext(entry), title: "Edit context", children: _jsx(Pencil, { size: 14 }) })), canDelete && (_jsx("button", { type: "button", style: styles.iconButton, onClick: () => handleDelete(entry.id), title: "Delete context", children: _jsx(Trash2, { size: 14 }) }))] })] }, entry.id))))] }));
}
//# sourceMappingURL=ContextEditorPanel.js.map