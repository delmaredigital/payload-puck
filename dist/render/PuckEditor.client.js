'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Puck } from '@puckeditor/core';
import { useCallback, useState } from 'react';
import '@puckeditor/core/puck.css';
/**
 * Client-side Puck visual editor component
 *
 * This component wraps the Puck editor for use in Next.js applications.
 * It must be used in a client component ('use client').
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { PuckEditor } from '@delmaredigital/payload-puck/render'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export function PageEditor({ page }) {
 *   const handleSave = async (data) => {
 *     await fetch(`/api/pages/${page.id}`, {
 *       method: 'PATCH',
 *       body: JSON.stringify({ puckData: data }),
 *     })
 *   }
 *
 *   return (
 *     <PuckEditor
 *       config={editorConfig}
 *       initialData={page.puckData}
 *       onSave={handleSave}
 *     />
 *   )
 * }
 * ```
 */
export function PuckEditor({ config, initialData, onSave, onChange, publishUrl, headerActions, showPublishButton = true, }) {
    const [isSaving, setIsSaving] = useState(false);
    const handlePublish = useCallback(async (data) => {
        if (!onSave)
            return;
        setIsSaving(true);
        try {
            await onSave(data);
            if (publishUrl) {
                window.location.href = publishUrl;
            }
        }
        catch (error) {
            console.error('Error saving page:', error);
        }
        finally {
            setIsSaving(false);
        }
    }, [onSave, publishUrl]);
    // Default empty data
    const defaultData = {
        root: { props: {} },
        content: [],
        zones: {},
    };
    return (_jsx(Puck, { config: config, data: initialData || defaultData, onPublish: showPublishButton ? handlePublish : undefined, onChange: onChange, overrides: {
            headerActions: ({ children }) => (_jsxs(_Fragment, { children: [isSaving && (_jsx("span", { className: "text-sm text-gray-500 mr-4", children: "Saving..." })), headerActions, children] })),
        } }));
}
//# sourceMappingURL=PuckEditor.client.js.map