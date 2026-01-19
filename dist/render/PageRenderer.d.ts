import type { Config as PuckConfig, Data as PuckData } from '@puckeditor/core';
import { type LayoutDefinition } from '../layouts';
export interface PageRendererProps {
    /**
     * Puck data to render
     */
    data: PuckData;
    /**
     * Puck configuration to use
     * @default baseConfig
     */
    config?: PuckConfig;
    /**
     * Optional wrapper component (takes precedence over layout)
     */
    wrapper?: React.ComponentType<{
        children: React.ReactNode;
    }>;
    /**
     * Optional className for the wrapper
     */
    className?: string;
    /**
     * Available layouts for this page
     * @default DEFAULT_LAYOUTS
     */
    layouts?: LayoutDefinition[];
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
export declare function PageRenderer({ data, config, wrapper: Wrapper, className, layouts, }: PageRendererProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PageRenderer.d.ts.map