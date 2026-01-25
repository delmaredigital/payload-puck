# @delmaredigital/payload-puck

A PayloadCMS plugin for integrating [Puck](https://puckeditor.com) visual page builder. Build pages visually with drag-and-drop components while leveraging Payload's content management capabilities.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdelmaredigital%2Fdd-starter&project-name=my-payload-site&build-command=pnpm%20run%20ci&env=PAYLOAD_SECRET,BETTER_AUTH_SECRET&stores=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Adding to Existing Projects](#adding-to-existing-projects)
- [Styling Setup](#styling-setup)
- [Core Concepts](#core-concepts)
- [Components](#components)
- [Custom Fields](#custom-fields)
- [Building Custom Components](#building-custom-components)
- [Theming](#theming)
- [Layouts](#layouts)
- [Dark Mode Support](#dark-mode-support)
- [Page-Tree Integration](#page-tree-integration)
- [Hybrid Integration](#hybrid-integration)
- [AI Integration](#ai-integration)
- [Advanced Configuration](#advanced-configuration)
- [License](#license)

---

## Installation

### Requirements

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@puckeditor/core` | >= 0.21.0 | Visual editor core |
| `payload` | >= 3.69.0 | CMS backend |
| `@payloadcms/next` | >= 3.69.0 | Payload Next.js integration |
| `next` | >= 15.4.8 | React framework |
| `react` | >= 19.2.1 | UI library |
| `@tailwindcss/typography` | >= 0.5.0 | RichText component styling |

> **Note:** Puck 0.21+ moved from `@measured/puck` to `@puckeditor/core`. This plugin requires the new package scope.

### Install

```bash
pnpm add @delmaredigital/payload-puck @puckeditor/core
```

---

## Quick Start

The plugin integrates directly into Payload's admin UI with minimal configuration. API endpoints and admin views are registered automatically.

### Step 1: Add the Plugin

```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

export default buildConfig({
  plugins: [
    createPuckPlugin({
      pagesCollection: 'pages', // Collection slug (default: 'pages')
    }),
  ],
  // ...
})
```

This automatically:
- Creates a `pages` collection with Puck fields (or adds fields to your existing collection)
- Registers API endpoints at `/api/puck/:collection`
- Adds the Puck editor view at `/admin/puck-editor/:collection/:id`
- Adds "Edit with Puck" buttons to the admin UI

### Step 2: Provide Puck Configuration

Wrap your app with `PuckConfigProvider` to supply the Puck configuration. This makes the config available to the editor via React context.

```typescript
// app/(app)/layout.tsx (covers both admin and frontend)
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PuckConfigProvider config={editorConfig}>
          {children}
        </PuckConfigProvider>
      </body>
    </html>
  )
}
```

> **Tip:** `PuckConfigProvider` also accepts `layouts` and `theme` props. See [Layouts](#layouts) and [Theming](#theming) sections.

> **Note:** For custom editor UIs (outside Payload admin), you can also pass the config directly to `PuckEditor` instead of using the context provider.

**Alternative: Payload Admin Provider (vanilla starter pattern)**

If you're using the vanilla Payload starter structure, you can register the provider via the admin config instead:

```typescript
// src/payload.config.ts
export default buildConfig({
  admin: {
    components: {
      providers: ['@/components/admin/PuckProvider'],
    },
  },
  // ...
})
```

```typescript
// src/components/admin/PuckProvider.tsx
'use client'

import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function PuckProvider({ children }: { children: React.ReactNode }) {
  return <PuckConfigProvider config={editorConfig}>{children}</PuckConfigProvider>
}
```

### Step 3: Create a Frontend Route

The plugin can't auto-create frontend routes (Next.js App Router is file-based), but here's copy-paste ready code:

<details>
<summary><strong>📄 app/(frontend)/[[...slug]]/page.tsx</strong> (click to expand)</summary>

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Fetch page by slug (or homepage if no slug)
// Only returns published pages - unpublished pages will 404
async function getPage(slug?: string[]) {
  const payload = await getPayload({ config })
  const slugPath = slug?.join('/') || ''

  // Try to find by slug, or find homepage
  // Filter for published pages only (_status: 'published')
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { _status: { equals: 'published' } },
        slugPath
          ? { slug: { equals: slugPath } }
          : { isHomepage: { equals: true } },
      ],
    },
    limit: 1,
  })

  return docs[0] || null
}

// Generate metadata from page SEO fields
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) return {}

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
  }
}

// Render the page
export default async function Page({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) notFound()

  return <PageRenderer config={baseConfig} data={page.puckData} />
}
```

</details>

> **Note:** The `[[...slug]]` pattern with double brackets makes the slug optional, so this handles both `/` (homepage) and `/any/path`.

### That's It!

- The plugin registers the editor view at `/admin/puck-editor/:collection/:id`
- "Edit with Puck" buttons appear in the collection list view
- The editor runs inside Payload's admin UI with full navigation
- API endpoints are handled automatically via Payload's endpoint system

### Adding to Existing Projects

> **⚠️ Important:** If you're adding Puck to a project with existing frontend routes, you must update those routes to render Puck content.

When adding Puck to an existing Payload project:

1. ✅ Add the plugin to `payload.config.ts`
2. ✅ Add `PuckConfigProvider` to your admin layout
3. ⚠️ **Update your frontend page templates** to render `puckData`

Without step 3, Puck pages will render blank because your existing routes only look for legacy block fields like `layout` or `hero`.

**Option A: Hybrid Rendering (recommended)**

Use `HybridPageRenderer` to render Puck pages. For new projects, this is all you need:

```typescript
import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'

export default async function Page({ params }) {
  const page = await getPage(params.slug)
  return <HybridPageRenderer page={page} config={baseConfig} />
}
```

If you're migrating an existing site with legacy Payload blocks, provide a `legacyRenderer`:

```typescript
import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { LegacyBlockRenderer } from '@/components/LegacyBlockRenderer'

export default async function Page({ params }) {
  const page = await getPage(params.slug)

  return (
    <HybridPageRenderer
      page={page}
      config={baseConfig}
      legacyRenderer={(blocks) => <LegacyBlockRenderer blocks={blocks} />}
    />
  )
}
```

**Option B: Manual Detection**

Add conditional logic to check `editorVersion`:

```typescript
// Check if page was created with Puck
const isPuckPage = page.editorVersion === 'puck' && page.puckData?.content?.length > 0

if (isPuckPage) {
  return <PageRenderer config={baseConfig} data={page.puckData} />
}

// Fall back to legacy rendering
return <LegacyBlockRenderer blocks={page.layout} />
```

**Option C: Custom Components**

If you have custom Puck components (not just the built-in ones), create a client wrapper:

```typescript
// components/PuckPageRenderer.tsx
'use client'

import { Render } from '@puckeditor/core'
import { myCustomConfig } from '@/puck/config'

export function PuckPageRenderer({ data }) {
  return <Render config={myCustomConfig} data={data} />
}
```

Then use this wrapper in your page template instead of `PageRenderer`.

---

## Styling Setup

### Tailwind Typography (Required)

> Required only if using the RichText component.

The RichText component uses `@tailwindcss/typography`:

```bash
pnpm add @tailwindcss/typography
```

**Tailwind v4:**
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

**Tailwind v3:**
```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('@tailwindcss/typography')],
}
```

### Package Scanning (Required)

> Required if your project uses Tailwind CSS. Ensures component classes are included in your build.

Tell Tailwind to scan the plugin's components:

**Tailwind v4:**
```css
/* Adjust path relative to your CSS file */
@source "../node_modules/@delmaredigital/payload-puck";
```

**Tailwind v3:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@delmaredigital/payload-puck/**/*.{js,mjs,jsx,tsx}',
  ],
}
```

### Theme CSS Variables (Optional)

> Optional - the plugin includes sensible defaults. Define these only to customize colors in rendered content (links, borders, etc).

The plugin uses [shadcn/ui](https://ui.shadcn.com)-style CSS variables. If you don't use shadcn/ui and want to customize colors, define these in your CSS:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

---

## Core Concepts

### Server vs Client Configuration

The plugin provides two configurations for React Server Components:

| Config | Import | Use Case |
|--------|--------|----------|
| `baseConfig` | `@delmaredigital/payload-puck/config` | Server-safe rendering with `PageRenderer` |
| `editorConfig` | `@delmaredigital/payload-puck/config/editor` | Client-side editing with full interactivity |

```typescript
// Server component - use baseConfig
import { baseConfig } from '@delmaredigital/payload-puck/config'
<PageRenderer config={baseConfig} data={page.puckData} />

// PuckConfigProvider - use editorConfig
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
<PuckConfigProvider config={editorConfig}>
```

### Draft System

The editor uses Payload's native draft system. The plugin automatically enables drafts on the pages collection. You can also enable it manually:

```typescript
{
  slug: 'pages',
  versions: {
    drafts: true,
  },
}
```

The editor header provides:
- **Save** - Saves as draft without publishing
- **Publish** - Publishes the page (sets `_status: 'published'`)
- **Unpublish** - Reverts a published page to draft status (appears only when published)

---

## Components

### Layout

| Component | Description |
|-----------|-------------|
| **Container** | Content wrapper with max-width and background |
| **Flex** | Flexible box layout with direction and alignment |
| **Grid** | CSS Grid layout with responsive columns |
| **Section** | Two-layer: full-bleed section + constrained content area |
| **Spacer** | Vertical/horizontal spacing element |
| **Template** | Save/load reusable component arrangements |

### Typography

| Component | Description |
|-----------|-------------|
| **Heading** | H1-H6 headings with size and alignment |
| **Text** | Paragraph text with styling options |
| **RichText** | Puck's native richtext editor with enhancements: font sizes, text colors with opacity, highlights, superscript/subscript, and inline editing on canvas |

### Media & Interactive

| Component | Description |
|-----------|-------------|
| **Image** | Responsive image with alt text |
| **Button** | Styled button/link with variants |
| **Card** | Content card with optional image |
| **Divider** | Horizontal rule with styles |
| **Accordion** | Expandable content sections (first item opens by default) |

### Semantic HTML Elements

Layout components (Section, Flex, Container, Grid) support semantic HTML output for better SEO and accessibility:

| Component | Available Elements |
|-----------|-------------------|
| **Section** | `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `div` |
| **Flex** | `div`, `nav`, `ul`, `ol`, `aside`, `section` |
| **Container** | `div`, `article`, `aside`, `section` |
| **Grid** | `div`, `ul`, `ol` |

Select the appropriate HTML element in the component's sidebar to output semantic markup.

### Responsive Controls

Layout components support per-breakpoint customization:
- **Dimensions** - Width, max-width, height constraints
- **Padding/Margin** - Spacing per breakpoint
- **Visibility** - Show/hide at specific breakpoints
- **Viewport Preview** - Mobile, Tablet, Desktop, and Full Width options

---

## Custom Fields

All fields are imported from `@delmaredigital/payload-puck/fields`.

### Field Reference

| Field | Description |
|-------|-------------|
| **MediaField** | Payload media library integration |
| **RichTextField** | Puck's native richtext with enhancements (colors, font sizes, highlights) |
| **ColorPickerField** | Color picker with opacity and presets |
| **BackgroundField** | Solid colors, gradients, images |
| **PaddingField / MarginField** | Visual spacing editors |
| **BorderField** | Border width, style, color, radius |
| **DimensionsField** | Width/height with constraints |
| **AlignmentField** | Text alignment (left, center, right) |
| **ContentAlignmentField** | Visual 3x3 grid selector for positioning (d-pad style) |
| **SizeField** | Preset sizes (sm, default, lg) with custom mode |
| **AnimationField** | Entrance animations |
| **ResponsiveVisibilityField** | Show/hide per breakpoint |
| **FolderPickerField** | Hierarchical folder selection (page-tree) |
| **PageSegmentField** | URL segment with slugification (page-tree) |
| **SlugPreviewField** | Read-only computed slug (page-tree) |

### Usage Example

```typescript
import { createMediaField, createBackgroundField, backgroundValueToCSS } from '@delmaredigital/payload-puck/fields'

const HeroConfig = {
  fields: {
    image: createMediaField({ label: 'Background Image' }),
    background: createBackgroundField({ label: 'Overlay' }),
  },
  render: ({ image, background }) => (
    <section style={{ background: backgroundValueToCSS(background) }}>
      {/* content */}
    </section>
  ),
}
```

### CSS Helper Functions

```typescript
import {
  backgroundValueToCSS,
  dimensionsValueToCSS,
  animationValueToCSS,
  visibilityValueToCSS,
  alignmentToFlexCSS,
  alignmentToGridCSS,
  sizeValueToCSS,
  getSizeClasses,
} from '@delmaredigital/payload-puck/fields'
```

### ContentAlignmentField Example

The ContentAlignmentField provides a visual 3x3 grid selector for content positioning:

```typescript
import {
  createContentAlignmentField,
  alignmentToFlexCSS,
  alignmentToGridCSS,
} from '@delmaredigital/payload-puck/fields'

const BannerConfig = {
  fields: {
    contentPosition: createContentAlignmentField({ label: 'Content Position' }),
  },
  render: ({ contentPosition }) => (
    <div style={{
      display: 'flex',
      minHeight: '400px',
      ...alignmentToFlexCSS(contentPosition), // Converts to justify-content + align-items
    }}>
      <div>Positioned content</div>
    </div>
  ),
}
```

Helper functions:
- `alignmentToFlexCSS()` - For Flexbox containers (`justify-content` + `align-items`)
- `alignmentToGridCSS()` - For Grid containers (`justify-content` + `align-content`)
- `alignmentToPlaceSelfCSS()` - For individual grid items (`place-self`)
- `alignmentToTailwind()` - Returns Tailwind classes (`justify-* items-*`)

---

## Building Custom Components

The plugin exports individual component configs and field factories for building custom Puck configurations.

### Cherry-Picking Components

Import only the components you need:

```typescript
import {
  SectionConfig,
  HeadingConfig,
  TextConfig,
  ImageConfig,
  ButtonConfig,
} from '@delmaredigital/payload-puck/components'

export const puckConfig: Config = {
  components: {
    Section: SectionConfig,
    Heading: HeadingConfig,
    Text: TextConfig,
    Image: ImageConfig,
    Button: ButtonConfig,
  },
  categories: {
    layout: { components: ['Section'] },
    content: { components: ['Heading', 'Text', 'Image', 'Button'] },
  },
}
```

### Using Field Factories

Build custom components with pre-built fields:

```typescript
import type { ComponentConfig } from '@puckeditor/core'
import {
  createMediaField,
  createBackgroundField,
  createPaddingField,
  backgroundValueToCSS,
  paddingValueToCSS,
} from '@delmaredigital/payload-puck/fields'

export const HeroConfig: ComponentConfig = {
  label: 'Hero',
  fields: {
    image: createMediaField({ label: 'Background Image' }),
    overlay: createBackgroundField({ label: 'Overlay' }),
    padding: createPaddingField({ label: 'Padding' }),
  },
  defaultProps: {
    image: null,
    overlay: null,
    padding: { top: 80, bottom: 80, left: 24, right: 24, unit: 'px', linked: false },
  },
  render: ({ image, overlay, padding }) => (
    <section
      style={{
        background: backgroundValueToCSS(overlay),
        padding: paddingValueToCSS(padding),
      }}
    >
      {/* Hero content */}
    </section>
  ),
}
```

### Server vs Editor Variants

For `PageRenderer` (frontend), components need server-safe configs without React hooks:

```typescript
// Import server variants for PageRenderer
import {
  SectionServerConfig,
  HeadingServerConfig,
  TextServerConfig,
} from '@delmaredigital/payload-puck/components'

<PageRenderer config={{ components: { Section: SectionServerConfig, ... } }} data={page.puckData} />
```

For custom components, create two files:
- `MyComponent.tsx` - Full editor version with fields and interactivity
- `MyComponent.server.tsx` - Server-safe version (no hooks, no 'use client')

### Extending Built-in Configs

Use `extendConfig()` to add custom components:

```typescript
import { extendConfig, fullConfig } from '@delmaredigital/payload-puck/config/editor'
import { HeroConfig } from './components/Hero'

export const puckConfig = extendConfig({
  base: fullConfig,
  components: {
    Hero: HeroConfig,
  },
  categories: {
    custom: { title: 'Custom', components: ['Hero'] },
  },
})
```

> **Note:** Use `fullConfig` from `/config/editor` for extending the editor. For server-side rendering, use `baseConfig` from `/config`.

### Using Custom Config with Provider

After creating your custom config, pass it to `PuckConfigProvider`:

```typescript
// components/admin/PuckProvider.tsx
'use client'
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { puckConfig } from '@/puck/config.editor'
import { siteLayouts } from '@/lib/puck-layouts'

export default function PuckProvider({ children }: { children: React.ReactNode }) {
  return (
    <PuckConfigProvider config={puckConfig} layouts={siteLayouts}>
      {children}
    </PuckConfigProvider>
  )
}
```

**For Payload admin**, register the provider in your Payload config:

```typescript
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
      providers: ['@/components/admin/PuckProvider'],
    },
  },
  // ...
})
```

This is the recommended pattern for Payload apps. The provider wraps only the admin UI, keeping your frontend layout separate.

### Available Field Factories

| Factory | Description |
|---------|-------------|
| `createMediaField()` | Payload media library picker |
| `createBackgroundField()` | Solid, gradient, or image backgrounds |
| `createColorPickerField()` | Color picker with opacity |
| `createPaddingField()` | Visual padding editor |
| `createMarginField()` | Visual margin editor |
| `createBorderField()` | Border styling |
| `createDimensionsField()` | Width/height constraints |
| `createAnimationField()` | Entrance animations |
| `createAlignmentField()` | Text alignment (left, center, right) |
| `createContentAlignmentField()` | Visual 3x3 grid positioning selector |
| `createSizeField()` | Size presets with custom mode |
| `createRichTextField()` | Puck's native richtext with colors, font sizes, highlights |
| `createResponsiveVisibilityField()` | Show/hide per breakpoint |

### CSS Helper Functions

Convert field values to CSS:

```typescript
import {
  backgroundValueToCSS,
  paddingValueToCSS,
  marginValueToCSS,
  borderValueToCSS,
  dimensionsValueToCSS,
  colorValueToCSS,
  alignmentToFlexCSS,
  alignmentToGridCSS,
  sizeValueToCSS,
} from '@delmaredigital/payload-puck/fields'

const style = {
  background: backgroundValueToCSS(props.background),
  padding: paddingValueToCSS(props.padding),
  ...dimensionsValueToCSS(props.dimensions),
  ...alignmentToFlexCSS(props.contentAlignment),
  ...sizeValueToCSS(props.size),
}
```

---

## Theming

Customize button styles, color presets, and focus rings:

```typescript
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { ThemeProvider } from '@delmaredigital/payload-puck/theme'

<ThemeProvider theme={{
  buttonVariants: {
    default: { classes: 'bg-primary text-white hover:bg-primary/90' },
    secondary: { classes: 'bg-secondary text-foreground hover:bg-secondary/90' },
  },
  focusRingColor: 'focus:ring-primary',
  colorPresets: [
    { hex: '#3b82f6', label: 'Brand Blue' },
    { hex: '#10b981', label: 'Success' },
  ],
}}>
  <PageRenderer config={baseConfig} data={page.puckData} />
</ThemeProvider>
```

Access theme values in custom components with `useTheme()`:

```typescript
import { useTheme } from '@delmaredigital/payload-puck/theme'

function CustomButton({ variant }) {
  const theme = useTheme()
  const classes = theme.buttonVariants[variant]?.classes
  return <button className={classes}>...</button>
}
```

---

## Layouts

Define page layouts with headers, footers, and styling:

```typescript
// lib/puck-layouts.ts
import type { LayoutDefinition } from '@delmaredigital/payload-puck/layouts'
import { SiteHeader } from '@/components/header'
import { SiteFooter } from '@/components/footer'

export const siteLayouts: LayoutDefinition[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard page with header and footer',
    maxWidth: '1200px',
    header: SiteHeader,
    footer: SiteFooter,
    stickyHeaderHeight: 80,
  },
  {
    value: 'landing',
    label: 'Landing',
    description: 'Full-width landing page',
    fullWidth: true,
  },
]
```

Pass layouts to the `PuckConfigProvider`:

```typescript
<PuckConfigProvider config={editorConfig} layouts={siteLayouts}>
  {children}
</PuckConfigProvider>
```

And use them with `PageRenderer`:

```typescript
import { LayoutWrapper } from '@delmaredigital/payload-puck/layouts'

const layout = siteLayouts.find(l => l.value === page.puckData?.root?.props?.pageLayout)

<LayoutWrapper layout={layout}>
  <PageRenderer config={baseConfig} data={page.puckData} />
</LayoutWrapper>
```

### Avoiding Double Headers/Footers

When your host app already provides a global header/footer via its root layout (e.g., Next.js `layout.tsx`), use `createRenderLayouts()` to strip them from Puck layouts:

```typescript
import { HybridPageRenderer, createRenderLayouts } from '@delmaredigital/payload-puck/render'
import { siteLayouts } from '@/lib/puck-layouts' // layouts with header/footer for editor

// Strip header/footer for rendering (host app layout provides them)
const renderLayouts = createRenderLayouts(siteLayouts)

export function PageRenderer({ page }) {
  const layout = renderLayouts.find(l => l.value === page.puckData?.root?.props?.pageLayout)

  return (
    <LayoutWrapper layout={layout}>
      <HybridPageRenderer page={page} config={baseConfig} />
    </LayoutWrapper>
  )
}
```

This pattern keeps header/footer in your editor layouts for realistic preview, but avoids double headers when rendering.

---

## Dark Mode Support

The Puck editor automatically detects PayloadCMS dark mode and applies CSS overrides to ensure visibility. It also provides a preview toggle to test how pages look in both light and dark modes.

### How It Works

1. **Editor UI**: Automatically detects dark mode via `.dark` class (PayloadCMS) or `prefers-color-scheme` (OS preference), then injects Puck CSS variable overrides
2. **Preview Iframe**: A sun/moon toggle lets you switch the preview content between light and dark modes independently from the editor UI

### Configuration

Dark mode is enabled by default. You can customize via props on `PuckEditor`:

```typescript
<PuckEditor
  autoDetectDarkMode={true}           // Auto-detect PayloadCMS dark mode (default: true)
  showPreviewDarkModeToggle={true}    // Show light/dark toggle in header (default: true)
  initialPreviewDarkMode={false}      // Start preview in light mode (default: false)
/>
```

### Using Components Directly

For custom editor implementations:

```typescript
import {
  DarkModeStyles,
  PreviewModeToggle,
  useDarkMode,
} from '@delmaredigital/payload-puck/editor'

function CustomEditor() {
  const { isDarkMode, source } = useDarkMode()
  const [previewDark, setPreviewDark] = useState(false)

  return (
    <>
      {/* Inject dark mode CSS overrides when detected */}
      <DarkModeStyles />

      {/* Toggle for preview iframe */}
      <PreviewModeToggle
        isDarkMode={previewDark}
        onToggle={setPreviewDark}
      />

      <Puck ... />
    </>
  )
}
```

### Detecting Theme in Puck Components

If your Puck components need to dynamically adjust JavaScript-controlled styles based on the preview theme (not just CSS), use the `usePuckPreviewTheme()` hook:

```typescript
import { usePuckPreviewTheme } from '@delmaredigital/payload-puck/editor'
import { useEffect, useState } from 'react'

function useDetectTheme() {
  const puckTheme = usePuckPreviewTheme()

  // For frontend (non-editor), read from DOM
  const [domTheme, setDomTheme] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') === 'dark'
      : false
  )

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          setDomTheme(document.documentElement.getAttribute('data-theme') === 'dark')
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  // In editor: use context. On frontend: use DOM.
  return puckTheme !== null ? puckTheme : domTheme
}
```

**Why this is needed:** CSS dark mode variants (like Tailwind's `dark:` classes) work automatically via the `data-theme` attribute. However, if you need to conditionally render different JavaScript values (like overlay colors), those won't update reactively when the preview toggle changes. The context provides reactive updates.

---

## Page-Tree Integration

When `@delmaredigital/payload-page-tree` is detected, the plugin automatically adds folder management to the Puck sidebar.

### How It Works

The plugin checks if your collection has a `pageSegment` field (page-tree's signature). When detected:

1. **Folder Picker** - Select a folder from the hierarchy
2. **Page Segment** - Edit the page's URL segment
3. **Slug Preview** - See the computed slug (folder path + segment)

### Plugin Configuration

```typescript
createPuckPlugin({
  // Auto-detect (default)
  pageTreeIntegration: undefined,

  // Explicitly enable with custom config
  pageTreeIntegration: {
    folderSlug: 'payload-folders',
    pageSegmentFieldName: 'pageSegment',
  },

  // Explicitly disable
  pageTreeIntegration: false,
})
```

### Custom Editor UI

For custom editor implementations outside Payload admin, use the `hasPageTree` prop:

```typescript
import { PuckEditor } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  pageTitle={page.title}
  pageSlug={page.slug}
  apiEndpoint="/api/puck/pages"
  hasPageTree={true}
  folder={page.folder}
  pageSegment={page.pageSegment}
/>
```

### Performance

Detection is instant - it reads the in-memory collection config, no database queries.

---

## Hybrid Integration

Add Puck to existing collections with legacy blocks.

### Automatic (Recommended)

If you already have a `pages` collection, the plugin adds only the Puck-specific fields:

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'layout', type: 'blocks', blocks: [HeroBlock, CTABlock] },
      ],
    },
  ],
  plugins: [
    createPuckPlugin({ pagesCollection: 'pages' }),
  ],
})
```

The `editorVersion` field auto-detects whether pages use legacy blocks or Puck.

### Manual with `getPuckCollectionConfig()` (Recommended)

When you need the `isHomepage` field, use `getPuckCollectionConfig()` which returns both fields AND hooks. This ensures the homepage uniqueness validation is included:

```typescript
import { getPuckCollectionConfig } from '@delmaredigital/payload-puck'

const { fields: puckFields, hooks: puckHooks } = getPuckCollectionConfig({
  includeSEO: true,
  includeEditorVersion: true,
  includePageLayout: true,
  includeIsHomepage: true, // Includes uniqueness hook automatically
})

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    beforeChange: [
      ...(puckHooks.beforeChange ?? []),
      // Your other beforeChange hooks...
    ],
    afterChange: [
      // Your afterChange hooks...
    ],
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'layout', type: 'blocks', blocks: [...] },
    ...puckFields,
  ],
}
```

### Manual with `getPuckFields()` (Fields Only)

If you don't need `isHomepage` or want to configure hooks manually:

```typescript
import { getPuckFields, createIsHomepageUniqueHook } from '@delmaredigital/payload-puck'

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    // Required if using includeIsHomepage: true
    beforeChange: [createIsHomepageUniqueHook()],
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'layout', type: 'blocks', blocks: [...] },
    ...getPuckFields({
      includeSEO: true,
      includeEditorVersion: true,
      includePageLayout: true,
      includeIsHomepage: true, // Note: requires hook above for uniqueness
    }),
  ],
}
```

> **Note:** The `isHomepage` field allows marking one page as the homepage. The `createIsHomepageUniqueHook()` ensures only one page can be marked as homepage at a time, prompting users to swap if a homepage already exists.

### Rendering Hybrid Pages

```typescript
import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
import { LegacyBlockRenderer } from '@/components/LegacyBlockRenderer'

<HybridPageRenderer
  page={page}
  config={puckConfig}
  legacyRenderer={(blocks) => <LegacyBlockRenderer blocks={blocks} />}
/>
```

---

## AI Integration

> **Early Preview:** While Puck's AI features are powerful, this plugin's implementation is still in early stages and under active development. Expect changes as we refine the integration.

The plugin integrates with [Puck AI](https://puckeditor.com/docs/integrating-puck/ai) to enable AI-assisted page generation. Users can describe what they want in natural language, and the AI builds complete page layouts using your components.

### Requirements

- `PUCK_API_KEY` environment variable (from [Puck Cloud](https://puckeditor.com))
- AI features require `@puckeditor/plugin-ai` and `@puckeditor/cloud-client` (bundled with the plugin)

### Quick Start

Enable AI in your plugin configuration:

```typescript
createPuckPlugin({
  pagesCollection: 'pages',
  ai: {
    enabled: true,
    context: 'We are Acme Corp, a B2B SaaS company. Use professional language.',
  },
})
```

This automatically:
- Registers the AI chat endpoint at `/api/puck/ai`
- Adds the AI chat plugin to the editor
- Applies comprehensive component instructions for better generation quality

### Dynamic Business Context

Instead of hardcoding context in your config, you can manage it through Payload admin:

```typescript
createPuckPlugin({
  ai: {
    enabled: true,
    contextCollection: true,  // Creates puck-ai-context collection
  },
})
```

This creates a `puck-ai-context` collection where you can add entries for:
- **Brand Guidelines** - Colors, fonts, brand voice
- **Tone of Voice** - How to communicate
- **Product Information** - What you sell/offer
- **Industry Context** - Your market and audience
- **Technical Requirements** - Specific constraints
- **Page Patterns** - Common layout structures

Context entries can be enabled/disabled and ordered. The AI receives all enabled entries sorted by order.

### Context Editor Plugin

When `contextCollection: true`, a "Context" panel appears in the Puck plugin rail. Users can view, create, edit, and toggle context entries directly in the editor without visiting Payload admin.

### Prompt Management

Store reusable prompts in Payload:

```typescript
createPuckPlugin({
  ai: {
    enabled: true,
    promptsCollection: true,  // Creates puck-ai-prompts collection
    examplePrompts: [
      { label: 'Landing page', prompt: 'Create a landing page for...' },
    ],
  },
})
```

Prompts from the collection appear in the AI chat interface. A "Prompts" panel in the plugin rail allows in-editor prompt management.

### Custom Tools

Enable the AI to query your data:

```typescript
import { z } from 'zod'

createPuckPlugin({
  ai: {
    enabled: true,
    tools: {
      getProducts: {
        description: 'Get products from the database',
        inputSchema: z.object({ category: z.string() }),
        execute: async ({ category }, { payload }) => {
          return await payload.find({
            collection: 'products',
            where: { category: { equals: category } },
          })
        },
      },
    },
  },
})
```

Tools receive a context object with the Payload instance and authenticated user.

### AI Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `false` | Enable AI features |
| `context` | `undefined` | Static system context for the AI |
| `contextCollection` | `false` | Create `puck-ai-context` collection for dynamic context |
| `promptsCollection` | `false` | Create `puck-ai-prompts` collection for reusable prompts |
| `examplePrompts` | `[]` | Static example prompts for the chat interface |
| `tools` | `undefined` | Custom tools for AI to query your system |
| `componentInstructions` | `undefined` | Override default component AI instructions |

### Component Instructions

The plugin includes comprehensive instructions for all built-in components, teaching the AI:
- Correct field names and values
- Component composition patterns
- Page structure best practices (Hero → Features → CTA flow)
- Semantic HTML usage

To customize or extend:

```typescript
createPuckPlugin({
  ai: {
    enabled: true,
    componentInstructions: {
      Heading: {
        ai: { instructions: 'Use our brand voice: professional but approachable' },
        fields: {
          text: { ai: { instructions: 'Keep under 8 words' } },
        },
      },
    },
  },
})
```

### Standalone API Routes

For custom implementations outside the plugin:

```typescript
// app/api/puck/[...all]/route.ts
import { createPuckAiApiRoutes } from '@delmaredigital/payload-puck/ai'
import config from '@payload-config'

export const POST = createPuckAiApiRoutes({
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      // Your auth implementation
      return { user: { id: '...' } }
    },
  },
  ai: {
    context: 'Your business context...',
  },
})
```

### AI Exports

```typescript
import {
  // Plugins
  createAiPlugin,
  createPromptEditorPlugin,
  createContextEditorPlugin,

  // Hooks
  useAiPrompts,
  useAiContext,

  // Config utilities
  injectAiConfig,
  comprehensiveComponentAiConfig,
  pagePatternSystemContext,

  // API routes
  createPuckAiApiRoutes,
  createAiGenerate,
} from '@delmaredigital/payload-puck/ai'
```

---

## Advanced Configuration

### Plugin Options

| Option | Default | Description |
|--------|---------|-------------|
| `pagesCollection` | `'pages'` | Collection slug to use for pages |
| `autoGenerateCollection` | `true` | Create the collection if it doesn't exist, or add Puck fields to existing |
| `enableEndpoints` | `true` | Register API endpoints at `/api/puck/:collection` for the editor |
| `enableAdminView` | `true` | Register the Puck editor view in Payload admin |
| `adminViewPath` | `'/puck-editor'` | Path for the editor (full path: `/admin/puck-editor/:collection/:id`) |
| `pageTreeIntegration` | auto-detect | Integration with `@delmaredigital/payload-page-tree` |
| `layouts` | `undefined` | Layout definitions for page templates |
| `editorStylesheet` | `undefined` | Path to CSS file for editor iframe styling (e.g., `'src/app/globals.css'`) |
| `editorStylesheetCompiled` | `undefined` | Path to pre-compiled CSS for production (e.g., `'/puck-editor-styles.css'`) |
| `editorStylesheetUrls` | `[]` | Additional stylesheet URLs for the editor (e.g., Google Fonts) |
| `previewUrl` | `undefined` | URL for "View" button - string or function receiving page data |

```typescript
createPuckPlugin({
  pagesCollection: 'pages',
  autoGenerateCollection: true,
  enableEndpoints: true,
  enableAdminView: true,
  adminViewPath: '/puck-editor',
  pageTreeIntegration: undefined, // auto-detects

  // Collection overrides (merged with generated collection)
  collectionOverrides: {
    admin: {
      defaultColumns: ['title', 'slug', 'updatedAt'],
    },
  },

  // Access control
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
})
```

### Preview URL (View Button)

The "View" button in the editor opens the published page in a new tab. By default, it navigates to `/{slug}` (or `/` for homepage). Use the `previewUrl` option to customize this behavior.

```typescript
// Simple static URL pattern
createPuckPlugin({
  previewUrl: '/preview',
})

// Dynamic prefix based on page data
createPuckPlugin({
  previewUrl: (page) => `/${page.slug || ''}`,
})

// Organization-scoped pages (multi-tenant)
// The function receives the full page document with relationships populated
createPuckPlugin({
  previewUrl: (page) => {
    const orgSlug = page.organization?.slug || 'default'
    // Return a function that handles homepage vs regular pages
    return (slug) => slug ? `/${orgSlug}/${slug}` : `/${orgSlug}`
  },
})
```

When `previewUrl` is a function, the page document is fetched with `depth: 1` so relationship fields (like `organization`) are populated with their full data.

### Editor Stylesheet (Iframe Styling)

The Puck editor renders page content in an iframe. By default, this iframe doesn't have access to your frontend's CSS (Tailwind utilities, CSS variables, fonts). The `editorStylesheet` option solves this by compiling and serving your CSS.

#### Development (Runtime Compilation)

In development, CSS is compiled at runtime for hot reload support:

```typescript
createPuckPlugin({
  pagesCollection: 'pages',
  editorStylesheet: 'src/app/(frontend)/globals.css',
  editorStylesheetUrls: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ],
})
```

**How it works:**
1. You specify your CSS file path in the plugin config
2. The plugin creates an endpoint at `/api/puck/styles`
3. On first request, the CSS is compiled with PostCSS/Tailwind and cached
4. The iframe loads this compiled CSS

#### Production (Build-Time Compilation)

Runtime compilation fails on serverless platforms (Vercel, Netlify, etc.) because source CSS files aren't deployed—only compiled `.next` output is included. Use `withPuckCSS()` to compile CSS at build time:

**Step 1: Wrap your Next.js config**

```javascript
// next.config.js
import { withPuckCSS } from '@delmaredigital/payload-puck/next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  // your config...
}

export default withPuckCSS({
  cssInput: 'src/app/(frontend)/globals.css',
})(withPayload(nextConfig))
```

**Step 2: Add the compiled path to your plugin config**

```typescript
createPuckPlugin({
  pagesCollection: 'pages',
  editorStylesheet: 'src/app/(frontend)/globals.css',      // For dev (runtime)
  editorStylesheetCompiled: '/puck-editor-styles.css',     // For prod (static)
  editorStylesheetUrls: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ],
})
```

**How it works:**
1. During `next build`, the wrapper compiles your CSS to `public/puck-editor-styles.css`
2. In production (`NODE_ENV=production`), the plugin serves the static file
3. In development, runtime compilation continues working for hot reload

**`withPuckCSS` options:**

| Option | Default | Description |
|--------|---------|-------------|
| `cssInput` | (required) | Path to source CSS file |
| `cssOutput` | `'puck-editor-styles.css'` | Output filename in `public/` |
| `skipInDev` | `true` | Skip compilation in development |

#### Requirements

- `postcss` must be installed in your project
- For Tailwind v4: `@tailwindcss/postcss`
- For Tailwind v3: `tailwindcss`

---

### Custom API Routes (Advanced)

The built-in endpoints handle most use cases. Only disable them if you need custom authentication or middleware.

If needed, three route factories are available:

| Factory | Route Pattern | Methods |
|---------|---------------|---------|
| `createPuckApiRoutes` | `/api/puck/[collection]` | GET (list), POST (create) |
| `createPuckApiRoutesWithId` | `/api/puck/[collection]/[id]` | GET, PATCH, DELETE |
| `createPuckApiRoutesVersions` | `/api/puck/[collection]/[id]/versions` | GET, POST (restore) |

See the JSDoc in `@delmaredigital/payload-puck/api` for usage examples.

---

## Export Reference

| Export Path | Description |
|-------------|-------------|
| `@delmaredigital/payload-puck` | Plugin creation, field utilities |
| `@delmaredigital/payload-puck/plugin` | `createPuckPlugin` |
| `@delmaredigital/payload-puck/config` | `baseConfig`, `createConfig()`, `extendConfig()` |
| `@delmaredigital/payload-puck/config/editor` | `editorConfig` for editing |
| `@delmaredigital/payload-puck/client` | `PuckEditor`, `PuckConfigProvider`, page-tree utilities |
| `@delmaredigital/payload-puck/editor` | `PuckEditor`, `HeaderActions`, editor hooks |
| `@delmaredigital/payload-puck/rsc` | `PuckEditorView` for Payload admin views |
| `@delmaredigital/payload-puck/render` | `PageRenderer`, `HybridPageRenderer` |
| `@delmaredigital/payload-puck/fields` | Custom Puck fields and CSS helpers |
| `@delmaredigital/payload-puck/components` | Component configs for custom configurations |
| `@delmaredigital/payload-puck/theme` | `ThemeProvider`, theme utilities |
| `@delmaredigital/payload-puck/layouts` | Layout definitions, `LayoutWrapper` |
| `@delmaredigital/payload-puck/api` | API route factories (for custom implementations) |
| `@delmaredigital/payload-puck/ai` | AI plugins, hooks, config utilities, API routes |
| `@delmaredigital/payload-puck/next` | `withPuckCSS` Next.js config wrapper for build-time CSS |
| `@delmaredigital/payload-puck/admin/client` | `EditWithPuckButton`, `EditWithPuckCell` |

---

## License

MIT
