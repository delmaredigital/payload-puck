'use client'

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

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Config as PuckConfig, Plugin as PuckPlugin } from '@puckeditor/core'
import type { LayoutDefinition } from '../layouts/index.js'
import type { ThemeConfig } from '../theme/index.js'
import type { PuckIntegration } from '../config/merge.js'

export interface PuckConfigContextValue {
  /**
   * The Puck configuration with component definitions
   */
  config: PuckConfig | null
  /**
   * Layout definitions for the editor preview
   */
  layouts?: LayoutDefinition[]
  /**
   * Theme configuration for component styling
   */
  theme?: ThemeConfig
  /**
   * Additional Puck plugins to use in the editor.
   * These plugins will be merged with the default plugins (heading analyzer, version history).
   * Use this to add custom plugin rail panels for your specific use cases.
   *
   * @example
   * ```tsx
   * import { createGalleryPickerPlugin } from '@/puck/plugins'
   *
   * <PuckConfigProvider
   *   config={editorConfig}
   *   plugins={[createGalleryPickerPlugin()]}
   * >
   * ```
   */
  plugins?: PuckPlugin[]
  /** Bundles of components, categories and editor plugins. Keep the array stable. */
  integrations?: readonly PuckIntegration[]
  /**
   * Stylesheet URLs to inject into the editor iframe.
   * Use this to provide your frontend CSS (Tailwind, CSS variables, etc.)
   * that header/footer components need for proper styling.
   *
   * @example
   * ```tsx
   * <PuckConfigProvider
   *   config={editorConfig}
   *   editorStylesheets={['/editor-styles.css']}
   * >
   * ```
   */
  editorStylesheets?: string[]
  /**
   * Raw CSS to inject into the editor iframe.
   * Useful for CSS variables or small style overrides.
   *
   * @example
   * ```tsx
   * <PuckConfigProvider
   *   config={editorConfig}
   *   editorCss=":root { --primary: blue; }"
   * >
   * ```
   */
  editorCss?: string
}

const PuckConfigContext = createContext<PuckConfigContextValue>({
  config: null,
})

export interface PuckConfigProviderProps {
  /**
   * The Puck configuration with component definitions
   */
  config: PuckConfig
  /**
   * Layout definitions for the editor preview
   */
  layouts?: LayoutDefinition[]
  /**
   * Theme configuration for component styling
   */
  theme?: ThemeConfig
  /**
   * Additional Puck plugins to use in the editor.
   * These plugins will be merged with the default plugins (heading analyzer, version history).
   * Use this to add custom plugin rail panels for your specific use cases.
   *
   * @example
   * ```tsx
   * import { createGalleryPickerPlugin } from '@/puck/plugins'
   *
   * <PuckConfigProvider
   *   config={editorConfig}
   *   plugins={[createGalleryPickerPlugin()]}
   * >
   * ```
   */
  plugins?: PuckPlugin[]
  /** Bundles of components, categories and editor plugins. Keep the array stable. */
  integrations?: readonly PuckIntegration[]
  /**
   * Stylesheet URLs to inject into the editor iframe.
   * Use this to provide your frontend CSS (Tailwind, CSS variables, etc.)
   * that header/footer components need for proper styling.
   *
   * @example
   * ```tsx
   * <PuckConfigProvider
   *   config={editorConfig}
   *   editorStylesheets={['/editor-styles.css']}
   * >
   * ```
   */
  editorStylesheets?: string[]
  /**
   * Raw CSS to inject into the editor iframe.
   * Useful for CSS variables or small style overrides.
   *
   * @example
   * ```tsx
   * <PuckConfigProvider
   *   config={editorConfig}
   *   editorCss=":root { --primary: blue; }"
   * >
   * ```
   */
  editorCss?: string
  /**
   * Children to render
   */
  children: ReactNode
}

/**
 * Provider component that makes Puck configuration available to the editor
 */
export function PuckConfigProvider({
  config,
  layouts,
  theme,
  plugins,
  integrations,
  editorStylesheets,
  editorCss,
  children,
}: PuckConfigProviderProps) {
  // Memoize context value to prevent unnecessary re-renders of consumers
  // when the provider re-renders but the values haven't changed
  const contextValue = useMemo<PuckConfigContextValue>(
    () => ({ config, layouts, theme, plugins, integrations, editorStylesheets, editorCss }),
    [config, layouts, theme, plugins, integrations, editorStylesheets, editorCss]
  )

  return (
    <PuckConfigContext.Provider value={contextValue}>
      {children}
    </PuckConfigContext.Provider>
  )
}

/**
 * Hook to access the Puck configuration
 *
 * @throws If used outside of a PuckConfigProvider
 */
export function usePuckConfig(): PuckConfigContextValue {
  const context = useContext(PuckConfigContext)
  return context
}

export default PuckConfigContext
