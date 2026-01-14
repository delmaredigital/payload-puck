import { Render } from '@puckeditor/core'
import type { Config as PuckConfig, Data as PuckData } from '@puckeditor/core'
import { baseConfig } from '../config'
import { LayoutWrapper, getLayout, DEFAULT_LAYOUTS, type LayoutDefinition, type PageOverrides } from '../layouts'
import type { BackgroundValue } from '../fields/shared'

export interface PageRendererProps {
  /**
   * Puck data to render
   */
  data: PuckData

  /**
   * Puck configuration to use
   * @default baseConfig
   */
  config?: PuckConfig

  /**
   * Optional wrapper component (takes precedence over layout)
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>

  /**
   * Optional className for the wrapper
   */
  className?: string

  /**
   * Available layouts for this page
   * @default DEFAULT_LAYOUTS
   */
  layouts?: LayoutDefinition[]
}

/**
 * Renders a Puck page using the provided data and configuration
 *
 * @example
 * ```tsx
 * import { PageRenderer } from '@delmaredigital/payload-puck/render'
 * import { baseConfig } from '@delmaredigital/payload-puck/config'
 * import { ThemeProvider } from '@delmaredigital/payload-puck/theme'
 *
 * export default async function Page({ params }) {
 *   const page = await getPage(params.slug)
 *
 *   // Wrap with ThemeProvider if using theming
 *   return (
 *     <ThemeProvider theme={myTheme}>
 *       <PageRenderer data={page.puckData} config={baseConfig} />
 *     </ThemeProvider>
 *   )
 * }
 * ```
 */
export function PageRenderer({
  data,
  config = baseConfig,
  wrapper: Wrapper,
  className,
  layouts = DEFAULT_LAYOUTS,
}: PageRendererProps) {
  // Handle empty or invalid data
  if (!data || !data.content) {
    return (
      <div className={className}>
        <p>No content available</p>
      </div>
    )
  }

  const content = <Render config={config} data={data} />

  // Extract root props for page-level settings
  const rootProps = data.root?.props as {
    pageLayout?: string
    showHeader?: 'default' | 'show' | 'hide'
    showFooter?: 'default' | 'show' | 'hide'
    pageBackground?: BackgroundValue | null
    pageMaxWidth?: string
  } | undefined

  // Build page overrides from root props
  const overrides: PageOverrides = {
    showHeader: rootProps?.showHeader,
    showFooter: rootProps?.showFooter,
    background: rootProps?.pageBackground,
    maxWidth: rootProps?.pageMaxWidth,
  }

  // Build the component tree
  let result = content

  // Custom wrapper takes precedence
  if (Wrapper) {
    result = <Wrapper>{result}</Wrapper>
  } else {
    // Apply layout from puck root props
    const pageLayout = rootProps?.pageLayout
    const layout = pageLayout ? getLayout(layouts, pageLayout) : undefined

    if (layout) {
      result = (
        <LayoutWrapper layout={layout} className={className} overrides={overrides}>
          {result}
        </LayoutWrapper>
      )
    } else if (className || overrides.background) {
      // No layout but has background or className - use LayoutWrapper without layout
      result = (
        <LayoutWrapper className={className} overrides={overrides}>
          {result}
        </LayoutWrapper>
      )
    }
  }

  return result
}
