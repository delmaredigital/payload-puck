'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
/**
 * Loading indicator shown while the Puck editor is being loaded
 *
 * Used as the fallback for dynamic import with ssr: false
 */
export function LoadingState({ message = 'Loading editor...' }) {
    return (_jsx("div", { className: "h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: message })] }) }));
}
//# sourceMappingURL=LoadingState.js.map