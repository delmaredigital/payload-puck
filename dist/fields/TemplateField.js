'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect, useCallback, memo } from 'react';
import { createUsePuck } from '@puckeditor/core';
import { Loader2, Save, Download, AlertCircle, ChevronUp, X, } from 'lucide-react';
// Create usePuck hook for accessing editor state
const usePuck = createUsePuck();
// =============================================================================
// Styles
// =============================================================================
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theme-elevation-800)',
    },
    selectRow: {
        display: 'flex',
        gap: '8px',
    },
    select: {
        flex: 1,
        height: '36px',
        padding: '0 12px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
        cursor: 'pointer',
    },
    clearButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        padding: 0,
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        color: 'var(--theme-elevation-500)',
        cursor: 'pointer',
    },
    buttonRow: {
        display: 'flex',
        gap: '8px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        flex: 1,
        height: '32px',
        padding: '0 12px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-elevation-700)',
        cursor: 'pointer',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    saveForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        backgroundColor: 'var(--theme-elevation-50)',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    inputLabel: {
        fontSize: '12px',
        color: 'var(--theme-elevation-700)',
    },
    input: {
        height: '32px',
        padding: '0 8px',
        fontSize: '14px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-input-bg)',
        color: 'var(--theme-elevation-800)',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '6px',
        color: 'var(--theme-error-500)',
        fontSize: '12px',
    },
    submitButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        height: '32px',
        padding: '0 12px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid var(--theme-elevation-800)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-800)',
        color: 'var(--theme-bg)',
        cursor: 'pointer',
    },
};
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Get the slot content for the currently selected component.
 */
function getSlotContent(data, componentId, selectedItem) {
    if (selectedItem?.props?.content) {
        const content = selectedItem.props.content;
        if (Array.isArray(content) && content.length > 0) {
            return content;
        }
    }
    if (data.content && Array.isArray(data.content)) {
        for (const item of data.content) {
            const component = item;
            if (component.props?.id === componentId) {
                if (component.props?.content && Array.isArray(component.props.content)) {
                    if (component.props.content.length > 0) {
                        return component.props.content;
                    }
                }
            }
        }
    }
    return [];
}
/**
 * Find and update a component's props in the Puck data tree.
 */
function updateComponentInData(data, componentId, propsToMerge) {
    const updateInArray = (items) => {
        return items.map((item) => {
            if (item.props?.id === componentId) {
                return {
                    ...item,
                    props: {
                        ...item.props,
                        ...propsToMerge,
                    },
                };
            }
            if (item.props?.content && Array.isArray(item.props.content)) {
                return {
                    ...item,
                    props: {
                        ...item.props,
                        content: updateInArray(item.props.content),
                    },
                };
            }
            return item;
        });
    };
    const updatedContent = data.content
        ? updateInArray(data.content)
        : [];
    const updatedZones = {};
    if (data.zones) {
        for (const [zoneName, zoneContent] of Object.entries(data.zones)) {
            updatedZones[zoneName] = updateInArray(zoneContent);
        }
    }
    return {
        ...data,
        content: updatedContent,
        zones: updatedZones,
    };
}
// =============================================================================
// TemplateField Component
// =============================================================================
function TemplateFieldInner({ value, onChange, label = 'Template', readOnly, apiEndpoint = '/api/puck-templates', }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [error, setError] = useState(null);
    const [saveForm, setSaveForm] = useState({
        expanded: false,
        name: '',
        description: '',
        category: '',
        saving: false,
        error: null,
    });
    // Puck state access
    const appState = usePuck((s) => s.appState);
    const dispatch = usePuck((s) => s.dispatch);
    const selectedItem = usePuck((s) => s.selectedItem);
    const getSelectorForId = usePuck((s) => s.getSelectorForId);
    // Get current component ID
    const componentId = selectedItem?.props?.id;
    // Fetch templates from Payload API
    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                limit: '100',
                sort: '-updatedAt',
            });
            const response = await fetch(`${apiEndpoint}?${params}`);
            if (!response.ok)
                throw new Error('Failed to fetch templates');
            const data = await response.json();
            const items = (data.docs || []).map((doc) => ({
                id: doc.id,
                name: doc.name,
                description: doc.description,
                category: doc.category,
                content: doc.content,
                updatedAt: doc.updatedAt,
            }));
            setTemplates(items);
        }
        catch (err) {
            console.error('Error fetching templates:', err);
            setError('Failed to load templates');
        }
        finally {
            setLoading(false);
        }
    }, [apiEndpoint]);
    // Load templates on mount
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);
    // Handle template selection
    const handleTemplateSelect = useCallback(async (templateId) => {
        if (!componentId || !selectedItem)
            return;
        const template = templates.find((t) => String(t.id) === String(templateId));
        if (!template)
            return;
        setLoadingTemplate(true);
        try {
            const selector = getSelectorForId(componentId);
            if (selector) {
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
                });
            }
            else {
                const updatedData = updateComponentInData(appState.data, componentId, { content: template.content, templateId: templateId });
                dispatch({
                    type: 'setData',
                    data: updatedData,
                });
            }
            onChange(templateId);
        }
        catch (err) {
            console.error('Error loading template:', err);
            setError('Failed to load template');
        }
        finally {
            setLoadingTemplate(false);
        }
    }, [componentId, selectedItem, templates, getSelectorForId, appState.data, dispatch, onChange]);
    // Handle clearing template selection
    const handleClearTemplate = useCallback(() => {
        onChange(null);
    }, [onChange]);
    // Toggle save form
    const handleToggleSaveForm = useCallback(() => {
        setSaveForm((prev) => ({
            ...prev,
            expanded: !prev.expanded,
            error: null,
        }));
    }, []);
    // Close save form
    const handleCloseSaveForm = useCallback(() => {
        setSaveForm({
            expanded: false,
            name: '',
            description: '',
            category: '',
            saving: false,
            error: null,
        });
    }, []);
    // Save current slot content as a new template
    const handleSaveTemplate = useCallback(async () => {
        if (!componentId)
            return;
        const name = saveForm.name.trim();
        if (!name) {
            setSaveForm((prev) => ({
                ...prev,
                error: 'Please enter a template name',
            }));
            return;
        }
        setSaveForm((prev) => ({ ...prev, saving: true, error: null }));
        try {
            const content = getSlotContent(appState.data, componentId, selectedItem);
            if (content.length === 0) {
                throw new Error('No content to save. Add components to the template first.');
            }
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
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.errors?.[0]?.message || 'Failed to save template');
            }
            const data = await response.json();
            const doc = data.doc || data;
            const newTemplate = {
                id: doc.id,
                name: doc.name,
                description: doc.description,
                category: doc.category,
                content: doc.content,
                updatedAt: doc.updatedAt,
            };
            setTemplates((prev) => [newTemplate, ...prev]);
            handleCloseSaveForm();
            setTimeout(() => {
                onChange(newTemplate.id);
            }, 50);
        }
        catch (err) {
            console.error('Error saving template:', err);
            setSaveForm((prev) => ({
                ...prev,
                saving: false,
                error: err instanceof Error ? err.message : 'Failed to save template',
            }));
        }
    }, [componentId, appState.data, selectedItem, apiEndpoint, saveForm, onChange, handleCloseSaveForm]);
    // Group templates by category
    const categorizedTemplates = templates.reduce((acc, template) => {
        const category = template.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(template);
        return acc;
    }, {});
    return (_jsxs("div", { className: "puck-field", style: styles.container, children: [label && (_jsx("label", { style: styles.label, children: label })), _jsxs("div", { style: styles.selectRow, children: [_jsxs("select", { value: value || '', onChange: (e) => e.target.value && handleTemplateSelect(e.target.value), disabled: readOnly || loading || loadingTemplate, style: styles.select, children: [_jsx("option", { value: "", children: loading ? 'Loading...' : loadingTemplate ? 'Loading template...' : 'Select a template' }), Object.entries(categorizedTemplates).map(([category, items]) => (_jsx("optgroup", { label: category, children: items.map((template) => (_jsx("option", { value: template.id, children: template.name }, template.id))) }, category)))] }), value && !readOnly && (_jsx("button", { type: "button", onClick: handleClearTemplate, style: styles.clearButton, title: "Clear selection", children: _jsx(X, { style: { width: '16px', height: '16px' } }) }))] }), !readOnly && (_jsxs("div", { style: styles.buttonRow, children: [_jsxs("button", { type: "button", onClick: handleToggleSaveForm, disabled: loading || saveForm.saving, style: {
                            ...styles.button,
                            ...(loading || saveForm.saving ? styles.buttonDisabled : {}),
                        }, children: [saveForm.expanded ? (_jsx(ChevronUp, { style: { width: '16px', height: '16px' } })) : (_jsx(Save, { style: { width: '16px', height: '16px' } })), saveForm.expanded ? 'Cancel' : 'Save as Template'] }), value && (_jsxs("button", { type: "button", onClick: () => handleTemplateSelect(value), disabled: loadingTemplate, style: {
                            ...styles.button,
                            flex: 'none',
                            ...(loadingTemplate ? styles.buttonDisabled : {}),
                        }, children: [loadingTemplate ? (_jsx(Loader2, { style: { width: '16px', height: '16px', animation: 'spin 1s linear infinite' } })) : (_jsx(Download, { style: { width: '16px', height: '16px' } })), "Reload"] }))] })), saveForm.expanded && (_jsxs("div", { style: styles.saveForm, children: [_jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { htmlFor: "template-name", style: styles.inputLabel, children: "Template Name *" }), _jsx("input", { id: "template-name", placeholder: "e.g., Hero Section with CTA", value: saveForm.name, onChange: (e) => setSaveForm((prev) => ({ ...prev, name: e.target.value })), disabled: saveForm.saving, style: styles.input })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { htmlFor: "template-description", style: styles.inputLabel, children: "Description" }), _jsx("input", { id: "template-description", placeholder: "Optional description...", value: saveForm.description, onChange: (e) => setSaveForm((prev) => ({ ...prev, description: e.target.value })), disabled: saveForm.saving, style: styles.input })] }), _jsxs("div", { style: styles.inputGroup, children: [_jsx("label", { htmlFor: "template-category", style: styles.inputLabel, children: "Category" }), _jsx("input", { id: "template-category", placeholder: "e.g., Hero, Footer, CTA", value: saveForm.category, onChange: (e) => setSaveForm((prev) => ({ ...prev, category: e.target.value })), disabled: saveForm.saving, style: styles.input })] }), saveForm.error && (_jsxs("div", { style: styles.errorBox, children: [_jsx(AlertCircle, { style: { width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' } }), _jsx("span", { children: saveForm.error })] })), _jsx("button", { type: "button", onClick: handleSaveTemplate, disabled: saveForm.saving, style: {
                            ...styles.submitButton,
                            ...(saveForm.saving ? styles.buttonDisabled : {}),
                        }, children: saveForm.saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { style: { width: '16px', height: '16px', animation: 'spin 1s linear infinite' } }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { style: { width: '16px', height: '16px' } }), "Save Template"] })) })] })), error && (_jsxs("div", { style: styles.errorBox, children: [_jsx(AlertCircle, { style: { width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' } }), _jsx("span", { children: error })] }))] }));
}
// Memoize to prevent unnecessary re-renders
export const TemplateField = memo(TemplateFieldInner);
// =============================================================================
// Field Configuration Factory
// =============================================================================
/**
 * Creates a Puck field configuration for template selection
 */
export function createTemplateField(config) {
    return {
        type: 'custom',
        label: config.label,
        render: ({ value, onChange, readOnly }) => (_jsx(TemplateField, { value: value, onChange: onChange, label: config.label, readOnly: readOnly, apiEndpoint: config.apiEndpoint })),
    };
}
//# sourceMappingURL=TemplateField.js.map