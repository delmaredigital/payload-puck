# @delmaredigital/payload-puck

A PayloadCMS plugin for integrating [Puck](https://puckeditor.com) visual page builder. Build pages visually with drag-and-drop components while leveraging Payload's content management capabilities.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling Setup](#styling-setup)
- [Core Concepts](#core-concepts)
- [Components](#components)
- [Custom Fields](#custom-fields)
- [Building Custom Components](#building-custom-components)
- [Theming](#theming)
- [Layouts](#layouts)
- [Page-Tree Integration](#page-tree-integration)
- [Hybrid Integration](#hybrid-integration)
- [Advanced Configuration](#advanced-configuration)
- [License](#license)

---

## Installation

### Requirements

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@measured/puck` | >= 0.20.0 | Visual editor core |
| `payload` | >= 3.0.0 | CMS backend |
| `@payloadcms/next` | >= 3.0.0 | Payload Next.js integration |
| `next` | >= 14.0.0 | React framework |
| `react` | >= 18.0.0 | UI library |
| `@tailwindcss/typography` | >= 0.5.0 | RichText component styling |

### Install

```bash
pnpm add @delmaredigital/payload-puck @measured/puck
```

---

## Quick Start

The plugin integrates directly into Payload's admin UI with minimal configuration. API endpoints and admin views are registered automatically.

### Step 1: Add the Plugin

```typescript
// payload.config.ts
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

Wrap your app with `PuckConfigProvider` to supply the Puck configuration. This is required because Puck configs contain React components that cannot be serialized from server to client.

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
async function getPage(slug?: string[]) {
  const payload = await getPayload({ config })
  const slugPath = slug?.join('/') || ''

  // Try to find by slug, or find homepage
  const { docs } = await payload.find({
    collection: 'pages',
    where: slugPath
      ? { slug: { equals: slugPath } }
      : { isHomepage: { equals: true } },
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
| **RichText** | TipTap-powered WYSIWYG editor |

### Media & Interactive

| Component | Description |
|-----------|-------------|
| **Image** | Responsive image with alt text |
| **Button** | Styled button/link with variants |
| **Card** | Content card with optional image |
| **Divider** | Horizontal rule with styles |
| **Accordion** | Expandable content sections |

### Responsive Controls

Layout components support per-breakpoint customization:
- **Dimensions** - Width, max-width, height constraints
- **Padding/Margin** - Spacing per breakpoint
- **Visibility** - Show/hide at specific breakpoints

---

## Custom Fields

All fields are imported from `@delmaredigital/payload-puck/fields`.

### Field Reference

| Field | Description |
|-------|-------------|
| **MediaField** | Payload media library integration |
| **TiptapField** | Rich text editor with formatting |
| **ColorPickerField** | Color picker with opacity and presets |
| **BackgroundField** | Solid colors, gradients, images |
| **PaddingField / MarginField** | Visual spacing editors |
| **BorderField** | Border width, style, color, radius |
| **DimensionsField** | Width/height with constraints |
| **AlignmentField** | Text alignment options |
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
} from '@delmaredigital/payload-puck/fields'
```

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
import type { ComponentConfig } from '@measured/puck'
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
| `createAlignmentField()` | Text alignment |
| `createTiptapField()` | Inline rich text editor |

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
} from '@delmaredigital/payload-puck/fields'

const style = {
  background: backgroundValueToCSS(props.background),
  padding: paddingValueToCSS(props.padding),
  ...dimensionsValueToCSS(props.dimensions),
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

---

## Page-Tree Integration

When `@delmaredigital/payload-page-tree` is detected, the plugin automatically adds folder management to the Puck sidebar.

### How It Works

The plugin checks if your collection has a `pageSegment` field (page-tree's signature). When detected:

1. **Folder Picker** - Select a folder from the hierarchy
2. **Page Segment** - Edit the page's URL segment
3. **Slug Preview** - See the computed slug (folder path + segment)

### Configuration

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

### Manual with `getPuckFields()`

```typescript
import { getPuckFields } from '@delmaredigital/payload-puck'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'layout', type: 'blocks', blocks: [...] },
    ...getPuckFields({
      includeSEO: true,
      includeEditorVersion: true,
      includePageLayout: true,
    }),
  ],
}
```

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
| `@delmaredigital/payload-puck/client` | `PuckConfigProvider`, `usePuckConfig`, client components |
| `@delmaredigital/payload-puck/rsc` | `PuckEditorView` for Payload admin views |
| `@delmaredigital/payload-puck/render` | `PageRenderer`, `HybridPageRenderer` |
| `@delmaredigital/payload-puck/fields` | Custom Puck fields and CSS helpers |
| `@delmaredigital/payload-puck/components` | Component configs for custom configurations |
| `@delmaredigital/payload-puck/theme` | `ThemeProvider`, theme utilities |
| `@delmaredigital/payload-puck/layouts` | Layout definitions, `LayoutWrapper` |
| `@delmaredigital/payload-puck/api` | API route factories (for custom implementations) |
| `@delmaredigital/payload-puck/admin/client` | `EditWithPuckButton`, `EditWithPuckCell` |

---

## License

MIT
