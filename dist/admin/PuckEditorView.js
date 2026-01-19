'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
/**
 * Ready-to-use Puck editor page component
 *
 * Use this in your own editor page route (e.g., /pages/[id]/edit).
 * It auto-fetches page data from the API and renders the PuckEditor.
 *
 * @example
 * ```tsx
 * // src/app/pages/[id]/edit/page.tsx
 * 'use client'
 *
 * import { PuckEditorView } from '@delmaredigital/payload-puck/editor'
 * import { editorConfig } from '@/puck/config'
 *
 * export default function PageEditor() {
 *   return (
 *     <PuckEditorView
 *       config={editorConfig}
 *       collectionSlug="pages"
 *       apiBasePath="/api/puck"
 *       backUrl="/admin/collections/pages"
 *       previewUrl={(slug) => `/${slug}`}
 *     />
 *   )
 * }
 * ```
 */
export function PuckEditorView({ config, collectionSlug = 'pages', apiBasePath = '/api/puck', backUrl, previewUrl, layoutStyles, layoutKey = 'pageLayout', plugins, onSaveSuccess, onSaveError, }) {
    const params = useParams();
    const searchParams = useSearchParams();
    // Get page ID from route params or search params
    const pageId = params?.id || searchParams?.get('id') || '';
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [PuckEditor, setPuckEditor] = useState(null);
    // Dynamically import PuckEditor to avoid SSR issues
    useEffect(() => {
        import('../editor/PuckEditor').then((mod) => {
            setPuckEditor(() => mod.PuckEditor);
        });
    }, []);
    useEffect(() => {
        async function fetchPage() {
            if (!pageId) {
                setError('No page ID provided');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`${apiBasePath}/${collectionSlug}/${pageId}`);
                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || `Failed to fetch page: ${response.status}`);
                }
                const data = await response.json();
                setPage(data.doc);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
            finally {
                setLoading(false);
            }
        }
        fetchPage();
    }, [pageId, apiBasePath, collectionSlug]);
    const computedBackUrl = backUrl || `/admin/collections/${collectionSlug}`;
    if (loading || !PuckEditor) {
        return (_jsx("div", { style: {
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f0f0f',
                color: '#fff',
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                            width: '32px',
                            height: '32px',
                            border: '3px solid #333',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px',
                        } }), _jsx("p", { style: { color: '#888' }, children: "Loading editor..." }), _jsx("style", { children: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          ` })] }) }));
    }
    if (error) {
        return (_jsx("div", { style: {
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f0f0f',
                color: '#fff',
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("p", { style: { color: '#f87171', marginBottom: '16px' }, children: error }), _jsxs("a", { href: computedBackUrl, style: {
                            color: '#60a5fa',
                            textDecoration: 'underline',
                        }, children: ["Back to ", collectionSlug] })] }) }));
    }
    if (!page) {
        return (_jsx("div", { style: {
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f0f0f',
                color: '#fff',
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("p", { style: { color: '#888', marginBottom: '16px' }, children: "Page not found" }), _jsxs("a", { href: computedBackUrl, style: {
                            color: '#60a5fa',
                            textDecoration: 'underline',
                        }, children: ["Back to ", collectionSlug] })] }) }));
    }
    // Default puck data if none exists
    const initialData = page.puckData || {
        root: {
            props: {
                title: page.title || 'New Page',
            },
        },
        content: [],
        zones: {},
    };
    return (_jsx(PuckEditor, { pageId: page.id, initialData: initialData, config: config, pageTitle: page.title, pageSlug: page.slug, apiEndpoint: `${apiBasePath}/${collectionSlug}`, backUrl: computedBackUrl, previewUrl: previewUrl, layoutStyles: layoutStyles, layoutKey: layoutKey, plugins: plugins, onSaveSuccess: onSaveSuccess, onSaveError: onSaveError, initialStatus: page._status }));
}
export default PuckEditorView;
//# sourceMappingURL=PuckEditorView.js.map