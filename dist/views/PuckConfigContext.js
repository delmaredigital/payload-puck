'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PuckConfigContext - Context for providing Puck configuration to the editor
 *
 * Since Puck configs contain React components, they cannot be serialized
 * from server to client. This context allows the consuming application
 * to provide the config at the client level.
 *
 * @example
 * ```tsx
 * // In your app's layout or provider setup:
 * import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
 * import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
 *
 * export function Providers({ children }) {
 *   return (
 *     <PuckConfigProvider config={editorConfig}>
 *       {children}
 *     </PuckConfigProvider>
 *   )
 * }
 * ```
 */
import { createContext, useContext, useMemo } from 'react';
const PuckConfigContext = createContext({
    config: null,
});
/**
 * Provider component that makes Puck configuration available to the editor
 */
export function PuckConfigProvider({ config, layouts, theme, editorStylesheets, editorCss, children, }) {
    // Memoize context value to prevent unnecessary re-renders of consumers
    // when the provider re-renders but the values haven't changed
    const contextValue = useMemo(() => ({ config, layouts, theme, editorStylesheets, editorCss }), [config, layouts, theme, editorStylesheets, editorCss]);
    return (_jsx(PuckConfigContext.Provider, { value: contextValue, children: children }));
}
/**
 * Hook to access the Puck configuration
 *
 * @throws If used outside of a PuckConfigProvider
 */
export function usePuckConfig() {
    const context = useContext(PuckConfigContext);
    return context;
}
export default PuckConfigContext;
//# sourceMappingURL=PuckConfigContext.js.map