/**
 * Styles Endpoint Handler
 *
 * Compiles and serves CSS for the editor iframe.
 * Uses the consumer's PostCSS/Tailwind installation via peer dependencies.
 */

import type { PayloadHandler } from 'payload'
import { readFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'

// Cache compiled CSS in memory with file modification time tracking
interface CssCache {
  css: string
  mtime: number
}

const cssCache = new Map<string, CssCache>()

/**
 * Compile CSS using PostCSS with Tailwind
 * Automatically detects Tailwind v4 vs v3
 * Uses dynamic imports to avoid bundling these optional peer dependencies
 */
async function compileCss(css: string, filePath: string): Promise<string> {
  try {
    // Dynamic import to use consumer's PostCSS installation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let postcss: any
    try {
      postcss = (await import(/* webpackIgnore: true */ 'postcss')).default
    } catch {
      console.warn(
        '[payload-puck] PostCSS not found. CSS will not be processed. Install postcss as a dependency.'
      )
      return css
    }

    // Try Tailwind v4 first (@tailwindcss/postcss)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let processor: any
    try {
      const tailwindcss = (
        await import(/* webpackIgnore: true */ '@tailwindcss/postcss')
      ).default
      processor = postcss([tailwindcss])
    } catch {
      // Fall back to Tailwind v3 (tailwindcss)
      try {
        const tailwindcss = (
          await import(/* webpackIgnore: true */ 'tailwindcss')
        ).default
        processor = postcss([tailwindcss])
      } catch {
        // No Tailwind available - just return the CSS as-is
        console.warn(
          '[payload-puck] No Tailwind CSS installation found. CSS will not be processed.'
        )
        return css
      }
    }

    const result = await processor.process(css, { from: filePath })
    return result.css
  } catch (error) {
    console.error('[payload-puck] CSS compilation error:', error)
    throw error
  }
}

/**
 * Creates a handler that serves compiled CSS for the editor iframe
 *
 * @param cssFilePath - Path to CSS file relative to project root
 * @returns PayloadHandler that serves compiled CSS
 */
export function createStylesHandler(cssFilePath: string): PayloadHandler {
  return async () => {
    try {
      const fullPath = join(process.cwd(), cssFilePath)

      // Check if file exists
      if (!existsSync(fullPath)) {
        console.error(`[payload-puck] CSS file not found: ${fullPath}`)
        return new Response(`/* CSS file not found: ${cssFilePath} */`, {
          status: 404,
          headers: {
            'Content-Type': 'text/css',
          },
        })
      }

      // Get file modification time for cache invalidation
      const stats = statSync(fullPath)
      const mtime = stats.mtimeMs

      // Check cache
      const cached = cssCache.get(cssFilePath)
      if (cached && cached.mtime === mtime) {
        return new Response(cached.css, {
          headers: {
            'Content-Type': 'text/css',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Puck-Cache': 'hit',
          },
        })
      }

      // Read and compile CSS
      const rawCss = readFileSync(fullPath, 'utf-8')
      const compiledCss = await compileCss(rawCss, fullPath)

      // Update cache
      cssCache.set(cssFilePath, { css: compiledCss, mtime })

      return new Response(compiledCss, {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Puck-Cache': 'miss',
        },
      })
    } catch (error) {
      console.error('[payload-puck] Styles endpoint error:', error)
      return new Response(
        `/* Error compiling CSS: ${error instanceof Error ? error.message : 'Unknown error'} */`,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/css',
          },
        }
      )
    }
  }
}

/**
 * Helper constant for the styles endpoint URL
 */
export const PUCK_STYLES_ENDPOINT = '/api/puck/styles'
