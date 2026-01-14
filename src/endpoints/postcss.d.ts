/**
 * Ambient type declarations for optional PostCSS/Tailwind peer dependencies
 * These modules are dynamically imported at runtime from the consumer's project
 */

declare module 'postcss' {
  const postcss: (plugins?: unknown[]) => {
    process: (css: string, options?: { from?: string }) => Promise<{ css: string }>
  }
  export default postcss
}

declare module '@tailwindcss/postcss' {
  const tailwindcss: unknown
  export default tailwindcss
}

declare module 'tailwindcss' {
  const tailwindcss: unknown
  export default tailwindcss
}
