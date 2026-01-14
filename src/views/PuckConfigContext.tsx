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

import { createContext, useContext, type ReactNode } from 'react'
import type { Config as PuckConfig } from '@puckeditor/core'
import type { LayoutDefinition } from '../layouts/index.js'
import type { ThemeConfig } from '../theme/index.js'

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
  editorStylesheets,
  editorCss,
  children,
}: PuckConfigProviderProps) {
  return (
    <PuckConfigContext.Provider value={{ config, layouts, theme, editorStylesheets, editorCss }}>
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
