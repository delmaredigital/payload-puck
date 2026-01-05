import { defineConfig } from 'tsup'
import { writeFileSync, readFileSync } from 'fs'
import { glob } from 'glob'

// External dependencies (not bundled)
const externalDeps = [
  'react',
  'next',
  'next/navigation',
  'payload',
  '@payloadcms/ui',
  '@measured/puck',
  '@measured/puck-plugin-heading-analyzer',
  '@tiptap/core',
  '@tiptap/react',
  '@tiptap/starter-kit',
  '@tiptap/extension-underline',
  '@tiptap/extension-link',
  '@tiptap/extension-text-align',
  '@tiptap/extension-text-style',
  '@tiptap/extension-color',
  '@tiptap/extension-highlight',
  '@payload-config',
]

// Shared configuration
const sharedConfig = {
  format: ['cjs', 'esm'] as const,
  dts: true,
  splitting: false,
  sourcemap: true,
  external: externalDeps,
  treeshake: true,
}

// Server-safe shared config - also externalizes client components
// to prevent hooks from being bundled into server-safe modules
const serverSafeConfig = {
  ...sharedConfig,
  external: [
    ...externalDeps,
    // Internal client modules must be external in server-safe bundles
    // to preserve 'use client' directives and prevent hook errors during SSR
    // Using regex to match any relative import path to these modules
    /\.\.?\/.*AnimatedWrapper/,
    /\.\.?\/.*AccordionClient/,
  ],
}

// Client entry points that need 'use client' directive
// These modules contain React hooks, event handlers, or client-only APIs
// Note: config/index and render/index are NOT included - they're server-safe
// because their render functions are executed on the server by Puck's <Render>
const clientEntries = [
  'dist/config/config.editor',  // Editor has interactive fields
  'dist/components/index',       // Client-side component variants
  'dist/fields/index',           // Custom fields use React hooks
  'dist/editor/index',           // PuckEditor wrapper is client-only
  'dist/admin/client',           // Admin UI components
  'dist/theme/index',            // Theme uses context
  // Internal client components - used by server-safe render functions
  'dist/AnimatedWrapper',
  'dist/AccordionClient',
]

// Add 'use client' directive to client files after build
async function addUseClientDirective() {
  for (const entry of clientEntries) {
    for (const ext of ['.js', '.mjs']) {
      const filePath = `${entry}${ext}`
      try {
        const content = readFileSync(filePath, 'utf-8')
        if (!content.startsWith('"use client"')) {
          writeFileSync(filePath, `"use client";\n${content}`)
        }
      } catch {
        // File might not exist, ignore
      }
    }
  }
}

export default defineConfig([
  // Server-safe entries (no 'use client' directive)
  // These can be imported in React Server Components
  {
    ...serverSafeConfig,
    entry: {
      index: 'src/index.ts',
      'plugin/index': 'src/plugin/index.ts',
      'api/index': 'src/api/index.ts',
      'utils/index': 'src/utils/index.ts',
      'admin/index': 'src/admin/index.ts',
      'layouts/index': 'src/layouts/index.ts',
      // These contain render functions but are server-safe
      // (render functions execute on server via Puck's <Render>)
      'config/index': 'src/config/index.tsx',
      'render/index': 'src/render/index.ts',
    },
    clean: true,
  },
  // Client-only entries (get 'use client' directive added post-build)
  // These use React hooks, context, or other client-only APIs
  {
    ...sharedConfig,
    entry: {
      'config/config.editor': 'src/config/config.editor.tsx',
      'components/index': 'src/components/index.ts',
      'fields/index': 'src/fields/index.ts',
      'editor/index': 'src/editor/index.ts',
      'admin/client': 'src/admin/client.ts',
      'theme/index': 'src/theme/index.ts',
      // Internal client components - separate bundles with 'use client'
      // Paths must match the external import resolution from server-safe bundles:
      // - '../AnimatedWrapper' from dist/config/ or dist/render/ -> dist/AnimatedWrapper.mjs
      // - '../AccordionClient' from dist/config/ or dist/render/ -> dist/AccordionClient.mjs
      'AnimatedWrapper': 'src/components/AnimatedWrapper.tsx',
      'AccordionClient': 'src/components/AccordionClient.tsx',
    },
    clean: false,
    onSuccess: async () => {
      await addUseClientDirective()
      console.log('Added "use client" directive to client entry points')
    },
  },
])
