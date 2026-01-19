/**
 * Next.js Configuration Wrapper for Puck CSS
 *
 * Compiles CSS at build time using the project's PostCSS/Tailwind configuration.
 * This ensures the editor iframe styles work in production (Vercel, etc.) where
 * source files aren't available at runtime.
 *
 * @example
 * ```js
 * // next.config.js
 * import { withPuckCSS } from '@delmaredigital/payload-puck/next'
 * import { withPayload } from '@payloadcms/next/withPayload'
 *
 * export default withPuckCSS({
 *   cssInput: 'src/app/(frontend)/globals.css',
 * })(withPayload(nextConfig))
 * ```
 */
import type { NextConfig } from 'next';
/**
 * Options for the withPuckCSS wrapper
 */
export interface WithPuckCSSOptions {
    /**
     * Path to the source CSS file (relative to project root)
     * @example 'src/app/(frontend)/globals.css'
     */
    cssInput: string;
    /**
     * Output path for compiled CSS (relative to public/)
     * @default 'puck-editor-styles.css'
     */
    cssOutput?: string;
    /**
     * Whether to skip compilation in development
     * @default true
     */
    skipInDev?: boolean;
}
/**
 * Default output filename for compiled CSS
 */
export declare const PUCK_CSS_OUTPUT_DEFAULT = "puck-editor-styles.css";
/**
 * Next.js configuration wrapper that compiles Puck editor CSS at build time
 *
 * @param options - Configuration options
 * @returns A function that wraps your Next.js config
 *
 * @example
 * ```js
 * import { withPuckCSS } from '@delmaredigital/payload-puck/next'
 *
 * export default withPuckCSS({
 *   cssInput: 'src/app/(frontend)/globals.css',
 * })(nextConfig)
 * ```
 */
export declare function withPuckCSS(options: WithPuckCSSOptions): (nextConfig: NextConfig) => NextConfig;
/**
 * Get the URL path for the compiled CSS file
 * Use this in your plugin configuration
 */
export declare function getPuckCSSPath(cssOutput?: string): string;
//# sourceMappingURL=index.d.ts.map