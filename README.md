# @delmaredigital/payload-puck

A PayloadCMS plugin for integrating [Puck](https://puckeditor.com) visual page builder. Build pages visually with drag-and-drop components while leveraging Payload's content management capabilities.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling Setup](#styling-setup)
- [Setup Checklist](#setup-checklist)
- [Core Concepts](#core-concepts)
- [Components](#components)
- [Configuration](#configuration)
- [Custom Fields](#custom-fields)
- [Theming](#theming)
- [Layouts](#layouts)
- [API Routes](#api-routes)
- [Plugin Options](#plugin-options)
- [Hybrid Integration](#hybrid-integration)

---

## Installation

### Requirements

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@measured/puck` | >= 0.20.0 | Visual editor core |
| `payload` | >= 3.0.0 | CMS backend |
| `next` | >= 15.4.0 | React framework |
| `react` | >= 18.0.0 | UI library |
| `@tailwindcss/typography` | >= 0.5.0 | RichText component styling |

> **⚠️ Don't skip the styling setup!** After Quick Start, you must configure Tailwind to scan this package. See [Styling Setup](#styling-setup).

### Install

```bash
pnpm add @delmaredigital/payload-puck @measured/puck
```

Or install from GitHub:

```bash
pnpm add github:delmaredigital/payload-puck#main @measured/puck
```

---

## Quick Start

> **📋 Important:** After completing these steps, continue to [Styling Setup](#styling-setup) and verify with the [Setup Checklist](#setup-checklist).

<details>
<summary><strong>Option A: Copy Boilerplate (Fastest)</strong></summary>

The package includes ready-to-use example files:

```bash
# Copy API routes
cp -r node_modules/@delmaredigital/payload-puck/examples/api/puck src/app/api/

# Copy editor page
mkdir -p src/app/\(manage\)/pages/\[id\]/edit
cp node_modules/@delmaredigital/payload-puck/examples/app/pages/\[id\]/edit/page.tsx src/app/\(manage\)/pages/\[id\]/edit/

# Copy frontend routes (homepage + dynamic pages)
mkdir -p src/app/\(frontend\)
cp node_modules/@delmaredigital/payload-puck/examples/app/\(frontend\)/page.tsx src/app/\(frontend\)/
mkdir -p src/app/\(frontend\)/\[...slug\]
cp node_modules/@delmaredigital/payload-puck/examples/app/\[...slug\]/page.tsx src/app/\(frontend\)/\[...slug\]/

# Copy theme config (optional)
mkdir -p src/lib
cp node_modules/@delmaredigital/payload-puck/examples/lib/puck-theme.ts src/lib/
```

See `examples/README.md` for detailed customization instructions.

</details>

<details>
<summary><strong>Option B: Manual Setup</strong></summary>

#### Step 1: Add the Plugin

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

#### Step 2: Create API Routes

```typescript
// app/api/puck/pages/route.ts
import { createPuckApiRoutes } from '@delmaredigital/payload-puck/api'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const { GET, POST } = createPuckApiRoutes({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      const payload = await getPayload({ config })
      const { user } = await payload.auth({ headers: await headers() })
      if (!user) return { authenticated: false }
      return { authenticated: true, user: { id: user.id } }
    },
  },
})
```

```typescript
// app/api/puck/pages/[id]/route.ts
import { createPuckApiRoutesWithId } from '@delmaredigital/payload-puck/api'
import config from '@payload-config'

export const { GET, PATCH, DELETE } = createPuckApiRoutesWithId({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      // Same auth logic as above
    },
  },
})
```

#### Step 3: Create the Editor Page

```typescript
// app/pages/[id]/edit/page.tsx
'use client'

import { PuckEditorView } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function EditorPage() {
  return (
    <PuckEditorView
      config={editorConfig}
      collectionSlug="pages"
      apiBasePath="/api/puck"
      backUrl="/admin/collections/pages"
      previewUrl={(slug) => `/${slug}`}
    />
  )
}
```

The editor includes:
- **Save Draft** - Saves without publishing
- **Publish** - Publishes the page
- **Draft/Published badge** - Shows current document status
- **Unsaved changes warning** - Prevents accidental navigation
- **Heading Analyzer** - WCAG-compliant heading outline visualization (enabled by default)

**Heading Analyzer Plugin**

The heading analyzer plugin is included by default and displays a heading outline in the editor sidebar. It helps identify accessibility issues like skipped heading levels (e.g., jumping from H1 to H3).

To add additional plugins or disable the default:

```typescript
// Add additional plugins (headingAnalyzer is still included)
<PuckEditorView
  plugins={[myCustomPlugin]}
  // ...
/>

// Disable all default plugins
<PuckEditorView
  plugins={false}
  // ...
/>
```

#### Step 4: Create a Frontend Route

```typescript
// app/(frontend)/[...slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug.join('/') } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) notFound()

  return <PageRenderer config={baseConfig} data={page.puckData} />
}
```

#### Step 5: Enable Version History (Optional)

```typescript
// app/api/puck/pages/[id]/versions/route.ts
import { createPuckApiRoutesVersions } from '@delmaredigital/payload-puck/api'
import config from '@payload-config'

export const { GET, POST } = createPuckApiRoutesVersions({
  collection: 'pages',
  payloadConfig: config,
  auth: {
    authenticate: async (request) => {
      // Same auth logic as your main routes
    },
  },
})
```

The History button automatically appears when this route exists.

</details>

---

## Styling Setup

> **⚠️ This section is critical.** Without proper styling setup, components will render with broken or missing styles.

<details>
<summary><strong>⚠️ Tailwind Typography</strong> — Required for RichText component</summary>

The RichText component uses the `prose` class from `@tailwindcss/typography`. **Without this, rich text content will be unstyled** — no proper heading sizes, list styles, blockquote formatting, etc.

```bash
pnpm add @tailwindcss/typography
```

**Tailwind v4** — Add the `@plugin` directive to your main CSS file:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

**Tailwind v3** — Add to your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

</details>

<details>
<summary><strong>⚠️ Tailwind Source Scanning</strong> — Required for component styles</summary>

**Without this, Tailwind won't include the plugin's CSS classes in your build.** Components will have missing styles.

The `@source` directive (v4) or `content` path (v3) tells Tailwind to scan the package for class names.

**Tailwind v4**

The path is relative to your CSS file's location and must resolve to your project's `node_modules`:

| CSS file location | `@source` path |
|-------------------|----------------|
| `globals.css` (root) | `./node_modules/@delmaredigital/payload-puck` |
| `src/globals.css` | `../node_modules/@delmaredigital/payload-puck` |
| `src/styles/tailwind.css` | `../../node_modules/@delmaredigital/payload-puck` |

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Adjust path based on your CSS file location */
@source "../node_modules/@delmaredigital/payload-puck";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

**Tailwind v3**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@delmaredigital/payload-puck/**/*.{js,mjs,jsx,tsx}',
  ],
}
```

</details>

<details>
<summary><strong>⚠️ Theme CSS Variables</strong> — Required if not using shadcn/ui</summary>

The field components use [shadcn/ui](https://ui.shadcn.com)-style CSS variables.

**If you use shadcn/ui:** No action needed — components inherit your existing theme.

**If you don't use shadcn/ui:** Copy the theme boilerplate:

```bash
cp node_modules/@delmaredigital/payload-puck/examples/styles/puck-theme.css src/styles/
```

Then import it:

```css
@import './puck-theme.css';
```

<details>
<summary>CSS Variable Reference</summary>

| Variable | Purpose |
|----------|---------|
| `--background` | Page background color |
| `--foreground` | Default text color |
| `--primary` | Primary buttons, active states |
| `--primary-foreground` | Text on primary backgrounds |
| `--secondary` | Secondary buttons |
| `--secondary-foreground` | Text on secondary backgrounds |
| `--muted` | Subtle backgrounds, disabled states |
| `--muted-foreground` | Muted text |
| `--accent` | Hover states |
| `--accent-foreground` | Text on accent backgrounds |
| `--destructive` | Error messages, delete buttons |
| `--destructive-foreground` | Text on destructive backgrounds |
| `--border` | General borders |
| `--input` | Form input borders |
| `--ring` | Focus rings |
| `--popover` | Dropdown/modal backgrounds |
| `--popover-foreground` | Text in popovers |
| `--card` | Card backgrounds |
| `--card-foreground` | Text in cards |
| `--radius` | Base border radius |

</details>

</details>

---

## Setup Checklist

Use this checklist to verify your setup is complete.

### ✅ Core Setup

- [ ] Install packages: `@delmaredigital/payload-puck` and `@measured/puck`
- [ ] Add `createPuckPlugin()` to your Payload config
- [ ] Create API routes (`/api/puck/pages` and `/api/puck/pages/[id]`)
- [ ] Create the editor page component with `PuckEditorView`
- [ ] Create a frontend route with `PageRenderer`

### ⚠️ Styling Setup

- [ ] Install and configure `@tailwindcss/typography`
- [ ] Add Tailwind `@source` directive (v4) or `content` path (v3)
- [ ] Set up theme CSS variables (if not using shadcn/ui)

### ⚙️ Collection Config

- [ ] Enable `versions: { drafts: true }` on your pages collection

### 📦 Optional

- [ ] Version history API route (`/api/puck/pages/[id]/versions`)
- [ ] Custom theme configuration via `ThemeProvider`
- [ ] Custom layouts with headers/footers
- [ ] Custom components

---

<details>
<summary><strong>Core Concepts</strong> — Server vs Client configs, Draft system</summary>

### Server vs Client Configuration

The plugin provides two configurations to handle React Server Components:

| Config | Import | Use Case |
|--------|--------|----------|
| `baseConfig` | `@delmaredigital/payload-puck/config` | Server-safe rendering with `PageRenderer` |
| `editorConfig` | `@delmaredigital/payload-puck/config/editor` | Client-side editing with full TipTap support |

```typescript
// Server component - use baseConfig
import { baseConfig } from '@delmaredigital/payload-puck/config'
<PageRenderer config={baseConfig} data={page.puckData} />

// Client component - use editorConfig
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'
<PuckEditor config={editorConfig} ... />
```

### Draft System

The editor uses Payload's native draft system.

> **⚠️ Required:** Without `drafts: true`, the Save Draft and Publish buttons won't work correctly.

```typescript
{
  slug: 'pages',
  versions: {
    drafts: true,
  },
}
```

</details>

---

<details>
<summary><strong>Components</strong> — Layout, Typography, Media, Interactive</summary>

### Layout

| Component | Description | Responsive Controls |
|-----------|-------------|---------------------|
| **Container** | Content wrapper with max-width and background options | Dimensions, Padding, Margin, Visibility |
| **Flex** | Flexible box layout with direction and alignment | Dimensions, Padding, Margin, Visibility |
| **Grid** | CSS Grid layout with responsive columns | Dimensions, Padding, Margin, Visibility |
| **Section** | Full-width section with slot for nested content | Dimensions, Padding, Margin, Visibility |
| **Spacer** | Vertical/horizontal spacing element | Visibility |
| **Template** | Reusable component arrangements - save and load templates | Dimensions, Padding, Margin, Visibility |

### Typography

| Component | Description | Responsive Controls |
|-----------|-------------|---------------------|
| **Heading** | H1-H6 headings with size and alignment options | — |
| **Text** | Paragraph text with styling options | — |
| **RichText** | TipTap-powered WYSIWYG editor | — |

> **⚠️ RichText requires `@tailwindcss/typography`** — see [Styling Setup](#styling-setup). Without it, content renders without proper formatting.

### Media

| Component | Description | Responsive Controls |
|-----------|-------------|---------------------|
| **Image** | Responsive image with alt text and sizing | Visibility |

### Interactive

| Component | Description | Responsive Controls |
|-----------|-------------|---------------------|
| **Button** | Styled button/link with variants | — |
| **Card** | Content card with optional image header | — |
| **Divider** | Horizontal rule with style options | — |
| **Accordion** | Expandable content sections | — |

### Responsive Controls

Components with responsive controls allow you to customize their behavior at different breakpoints (mobile, tablet, desktop). Available controls:

- **Dimensions** - Width, max-width, height constraints per breakpoint
- **Padding** - Inner spacing per breakpoint
- **Margin** - Outer spacing per breakpoint
- **Visibility** - Show/hide components at specific breakpoints

Breakpoints follow Tailwind CSS conventions:
| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| base | 0px | Mobile (default) |
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |

### Template Component

The Template component allows saving groups of components as reusable templates. The plugin automatically creates a `puck-templates` collection in Payload.

**Saving a template:**
1. Add a Template component to your page
2. Add child components inside the Template slot
3. Click "Save as Template" and give it a name/category

**Loading a template:**
1. Add a Template component to your page
2. Select a saved template from the dropdown
3. The template's components are loaded into the slot

</details>

---

<details>
<summary><strong>Configuration</strong> — Merging configs, Custom components</summary>

### Merging Custom Components

```typescript
import { mergeConfigs } from '@delmaredigital/payload-puck/config'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { MyCustomComponent } from './components/MyCustomComponent'

const customConfig = mergeConfigs({
  base: baseConfig,
  components: {
    MyCustomComponent,
  },
  categories: {
    custom: { title: 'Custom', components: ['MyCustomComponent'] },
  },
  exclude: ['Spacer'], // Optionally remove components
})
```

### Creating Custom Components

Components need two variants to work across server rendering and the editor:

| File | Purpose | Used By |
|------|---------|---------|
| `MyComponent.server.tsx` | Server-safe render (no hooks/interactivity) | `baseConfig` → `PageRenderer` |
| `MyComponent.tsx` or `.editor.tsx` | Full interactivity + field definitions | `editorConfig` → `PuckEditor` |

**Server variant** (`MyComponent.server.tsx`):
- No `'use client'` directive
- No React hooks (`useState`, `useEffect`, etc.)
- No event handlers that require client JS
- **If component has slots**: Must include `fields: { content: { type: 'slot' } }` (Puck needs this to transform slot data into a renderable component)
- Other fields can be omitted (not used in rendering)

**Editor variant** (`MyComponent.tsx`):
- Can use `'use client'` if needed
- Full interactivity with hooks
- Includes all `fields` for the Puck sidebar

<details>
<summary><strong>Example: Interactive Component</strong></summary>

```tsx
// components/Tabs.server.tsx - Server-safe version
import type { ComponentConfig } from '@measured/puck'

export interface TabsProps {
  items: { title: string; content: string }[]
  defaultTab: number
}

export const TabsConfig: ComponentConfig<TabsProps> = {
  label: 'Tabs',
  defaultProps: {
    items: [{ title: 'Tab 1', content: 'Content 1' }],
    defaultTab: 0,
  },
  // No fields - server version only renders
  render: ({ items, defaultTab }) => (
    <div>
      {/* Render only the default tab statically */}
      <div className="flex border-b">
        {items.map((item, i) => (
          <div key={i} className={i === defaultTab ? 'border-b-2 border-primary' : ''}>
            {item.title}
          </div>
        ))}
      </div>
      <div>{items[defaultTab]?.content}</div>
    </div>
  ),
}
```

```tsx
// components/Tabs.tsx - Editor version with interactivity
'use client'

import type { ComponentConfig } from '@measured/puck'
import { useState } from 'react'

export interface TabsProps {
  items: { title: string; content: string }[]
  defaultTab: number
}

export const TabsConfig: ComponentConfig<TabsProps> = {
  label: 'Tabs',
  fields: {
    items: {
      type: 'array',
      label: 'Tabs',
      arrayFields: {
        title: { type: 'text', label: 'Title' },
        content: { type: 'textarea', label: 'Content' },
      },
    },
    defaultTab: { type: 'number', label: 'Default Tab' },
  },
  defaultProps: {
    items: [{ title: 'Tab 1', content: 'Content 1' }],
    defaultTab: 0,
  },
  render: ({ items, defaultTab }) => {
    const [activeTab, setActiveTab] = useState(defaultTab)

    return (
      <div>
        <div className="flex border-b">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={i === activeTab ? 'border-b-2 border-primary' : ''}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div>{items[activeTab]?.content}</div>
      </div>
    )
  },
}
```

Then register both:
```tsx
// In your custom baseConfig
import { TabsConfig } from './components/Tabs.server'

// In your custom editorConfig
import { TabsConfig } from './components/Tabs'
```
</details>

<details>
<summary><strong>Example: Component with Slot (nested components)</strong></summary>

```tsx
// components/Card.server.tsx - Server-safe version WITH slot field
import type { ComponentConfig } from '@measured/puck'

export interface CardProps {
  content: unknown // Slot for nested components
  title: string
}

export const CardConfig: ComponentConfig<CardProps> = {
  label: 'Card',
  // CRITICAL: Slot field MUST be defined for Puck to transform data into component
  fields: {
    content: { type: 'slot' },
  },
  defaultProps: {
    content: [],
    title: 'Card Title',
  },
  render: ({ content: Content, title }) => (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold mb-2">{title}</h3>
      <Content /> {/* Renders nested components */}
    </div>
  ),
}
```

```tsx
// components/Card.tsx - Editor version with all fields
import type { ComponentConfig } from '@measured/puck'

export interface CardProps {
  content: unknown
  title: string
}

export const CardConfig: ComponentConfig<CardProps> = {
  label: 'Card',
  fields: {
    title: { type: 'text', label: 'Title' },
    content: { type: 'slot' },
  },
  defaultProps: {
    content: [],
    title: 'Card Title',
  },
  render: ({ content: Content, title }) => (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold mb-2">{title}</h3>
      <Content />
    </div>
  ),
}
```

**Why slots need the field definition:** Puck stores slot content as an array of component data. The `fields: { content: { type: 'slot' } }` tells Puck to transform this array into a renderable `<Content />` component before passing it to `render()`. Without this, you'll get "Element type is invalid: got array" errors.
</details>

</details>

---

<details>
<summary><strong>Custom Fields</strong> — 19 field types with usage examples</summary>

All fields are imported from `@delmaredigital/payload-puck/fields`.

### Field Reference

| Field | Description |
|-------|-------------|
| **MediaField** | Payload media library integration with upload/browse |
| **TiptapField** | Rich text editor with formatting toolbar |
| **ColorPickerField** | Color picker with presets and transparency |
| **BackgroundField** | Backgrounds with solid colors, gradients, and images |
| **PaddingField** | Visual padding editor with per-side controls |
| **MarginField** | Visual margin editor with per-side controls |
| **BorderField** | Border editor with width, style, color, radius |
| **DimensionsField** | Width/height with min/max constraints |
| **SizeField** | Preset sizes (sm, md, lg) or custom values |
| **AlignmentField** | Text alignment (left, center, right, justify) |
| **JustifyContentField** | Flexbox justify-content options |
| **AlignItemsField** | Flexbox align-items options |
| **VerticalAlignmentField** | Vertical alignment (top, center, bottom) |
| **LockedTextField** | Protected text field with edit confirmation |
| **LockedRadioField** | Protected radio field with edit confirmation |
| **ResponsiveField** | Per-breakpoint values for responsive design |
| **ResponsiveVisibilityField** | Show/hide toggle per breakpoint (Divi/Elementor-style) |
| **AnimationField** | Entrance animations with easing/duration |
| **TransformField** | CSS transforms (rotate, scale, translate) |
| **GradientEditor** | Visual gradient builder |

### Usage Examples

<details>
<summary><strong>MediaField</strong></summary>

Integrates with Payload's media collection:

```typescript
import { createMediaField } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Hero: {
      fields: {
        backgroundImage: createMediaField({
          label: 'Background Image',
          collection: 'media', // Default: 'media'
        }),
      },
    },
  },
}
```
</details>

<details>
<summary><strong>TiptapField</strong></summary>

Rich text editor with formatting toolbar:

```typescript
import { createTiptapField } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    TextBlock: {
      fields: {
        content: createTiptapField({ label: 'Content' }),
      },
    },
  },
}
```
</details>

<details>
<summary><strong>ColorPickerField</strong></summary>

Color picker with presets and alpha channel:

```typescript
import { createColorPickerField } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Section: {
      fields: {
        backgroundColor: createColorPickerField({
          label: 'Background Color',
        }),
      },
    },
  },
}
```
</details>

<details>
<summary><strong>BackgroundField</strong></summary>

Full background editor with solid colors, gradients, and images:

```typescript
import { createBackgroundField, backgroundValueToCSS } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Section: {
      fields: {
        background: createBackgroundField({ label: 'Background' }),
      },
      render: ({ background }) => (
        <section style={{ background: backgroundValueToCSS(background) }}>
          {/* content */}
        </section>
      ),
    },
  },
}
```
</details>

<details>
<summary><strong>DimensionsField</strong></summary>

Width/height with min/max constraints and alignment:

```typescript
import { createDimensionsField, dimensionsValueToCSS } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Container: {
      fields: {
        dimensions: createDimensionsField({ label: 'Size' }),
      },
      render: ({ dimensions, children }) => (
        <div style={dimensionsValueToCSS(dimensions)}>
          {children}
        </div>
      ),
    },
  },
}
```
</details>

<details>
<summary><strong>PaddingField & MarginField</strong></summary>

Visual spacing editors:

```typescript
import { createPaddingField, createMarginField } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Box: {
      fields: {
        padding: createPaddingField({ label: 'Padding' }),
        margin: createMarginField({ label: 'Margin' }),
      },
    },
  },
}
```
</details>

<details>
<summary><strong>LockedTextField & LockedRadioField</strong></summary>

Protected fields that require confirmation before editing:

```typescript
import {
  createLockedTextField,
  createLockedRadioField,
  lockedSlugField,      // Pre-built slug field
  lockedHomepageField,  // Pre-built homepage toggle
} from '@delmaredigital/payload-puck/fields'

// Use pre-built fields
const config = {
  root: {
    fields: {
      slug: lockedSlugField,
      isHomepage: lockedHomepageField,
    },
  },
}

// Or create custom locked fields
const customLockedField = createLockedTextField({
  label: 'API Key',
  placeholder: 'Enter API key',
  warningMessage: 'Changing this will break integrations.',
})
```
</details>

<details>
<summary><strong>AnimationField</strong></summary>

Entrance animations with customizable timing:

```typescript
import { createAnimationField, getEntranceAnimationClasses } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    AnimatedSection: {
      fields: {
        animation: createAnimationField({ label: 'Entrance Animation' }),
      },
      render: ({ animation, children }) => (
        <div className={getEntranceAnimationClasses(animation)}>
          {children}
        </div>
      ),
    },
  },
}
```
</details>

<details>
<summary><strong>ResponsiveField</strong></summary>

Values that change per breakpoint:

```typescript
import { createResponsiveField, BREAKPOINTS } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    Grid: {
      fields: {
        columns: createResponsiveField({
          label: 'Columns',
          field: { type: 'number' },
          defaultValue: { sm: 1, md: 2, lg: 3 },
        }),
      },
    },
  },
}
```
</details>

<details>
<summary><strong>ResponsiveVisibilityField</strong></summary>

Show/hide components at different breakpoints (like Divi/Elementor):

```typescript
import { createResponsiveVisibilityField, visibilityValueToCSS } from '@delmaredigital/payload-puck/fields'

const config = {
  components: {
    MobileOnlyBanner: {
      fields: {
        visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
      },
      render: ({ visibility, children }) => {
        const visibilityCSS = visibilityValueToCSS(visibility, 'mobile-banner')
        return (
          <>
            {visibilityCSS && <style>{visibilityCSS}</style>}
            <div className="mobile-banner">{children}</div>
          </>
        )
      },
    },
  },
}
```

The field displays device icons with visibility toggles. Green = visible, Red = hidden at that breakpoint.
</details>

### CSS Helper Functions

Convert field values to CSS:

```typescript
import {
  backgroundValueToCSS,
  dimensionsValueToCSS,
  animationValueToCSS,
  transformValueToCSS,
  gradientValueToCSS,
  sizeValueToCSS,
  // Responsive helpers
  responsiveValueToCSS,
  visibilityValueToCSS,
} from '@delmaredigital/payload-puck/fields'

const styles = {
  background: backgroundValueToCSS(background),
  ...dimensionsValueToCSS(dimensions),
  animation: animationValueToCSS(animation),
  transform: transformValueToCSS(transform),
}

// Responsive values generate CSS media queries
const uniqueId = 'my-component-123'
const { baseStyles, mediaQueryCSS } = responsiveValueToCSS(
  dimensions,           // ResponsiveValue<T> or T
  dimensionsValueToCSS, // Converter function
  uniqueId              // CSS class selector
)

// Visibility generates show/hide media queries
const visibilityCSS = visibilityValueToCSS(visibility, uniqueId)

// Render with media queries
return (
  <>
    {mediaQueryCSS && <style>{mediaQueryCSS}</style>}
    {visibilityCSS && <style>{visibilityCSS}</style>}
    <div className={uniqueId} style={baseStyles}>{children}</div>
  </>
)
```

</details>

---

<details>
<summary><strong>Theming</strong> — Button variants, color presets, focus rings</summary>

Customize button styles, color presets, and focus rings to match your design system.

### Basic Usage

Wrap your `PageRenderer` with `ThemeProvider` to apply custom theming:

```typescript
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { ThemeProvider } from '@delmaredigital/payload-puck/theme'

<ThemeProvider theme={{
  buttonVariants: {
    default: { classes: 'bg-primary text-primary-foreground hover:bg-primary/90' },
    secondary: { classes: 'bg-secondary text-secondary-foreground hover:bg-secondary/90' },
  },
  focusRingColor: 'focus:ring-primary',
}}>
  <PageRenderer config={baseConfig} data={page.puckData} />
</ThemeProvider>
```

### Using the Example Theme

```typescript
import { ThemeProvider, exampleTheme } from '@delmaredigital/payload-puck/theme'

<ThemeProvider theme={exampleTheme}>
  <PageRenderer data={page.puckData} />
</ThemeProvider>

// Or customize specific values
<ThemeProvider theme={{
  ...exampleTheme,
  focusRingColor: 'focus:ring-brand',
}}>
  <PageRenderer data={page.puckData} />
</ThemeProvider>
```

### Theme Options

| Option | Description |
|--------|-------------|
| `buttonVariants` | Button component variant styles (default, secondary, outline, ghost) |
| `ctaButtonVariants` | CallToAction button styles (primary, secondary, outline) |
| `ctaBackgroundStyles` | CallToAction background styles (default, dark, light) |
| `colorPresets` | Color picker preset swatches |
| `extendColorPresets` | If true, adds to defaults instead of replacing |
| `focusRingColor` | Focus ring class (e.g., `focus:ring-primary`) |

### Custom Color Presets

```typescript
<ThemeProvider theme={{
  colorPresets: [
    { hex: '#3b82f6', label: 'Brand Blue' },
    { hex: '#10b981', label: 'Success' },
    { hex: '#ef4444', label: 'Danger' },
  ],
  extendColorPresets: false, // Replace defaults
}}>
  <PageRenderer data={page.puckData} />
</ThemeProvider>
```

### Direct Theme Imports

```typescript
import {
  ThemeProvider,
  useTheme,
  getVariantClasses,
  DEFAULT_THEME,
} from '@delmaredigital/payload-puck/theme'

function MyButton({ variant }) {
  const theme = useTheme()
  const classes = getVariantClasses(theme.buttonVariants, variant)
  return <button className={classes}>Click me</button>
}
```

</details>

---

<details>
<summary><strong>Layouts</strong> — Page structure, headers/footers, responsive controls</summary>

The layout system controls page structure, max-width constraints, and optional header/footer rendering. Layouts are selected per-page in the Puck editor's "Page Setup" panel.

### Built-in Layouts

| Layout | Description |
|--------|-------------|
| **Default** | Standard page with max-width container (1200px) |
| **Landing** | Full-width sections, no container constraints |
| **Full Width** | Edge-to-edge content |

### Defining Custom Layouts

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
    editorBackground: '#ffffff',
    editorDarkMode: false,
    stickyHeaderHeight: 80,
    // Default background for frontend (overridden by pageBackground in Puck)
    styles: {
      wrapper: {
        background: 'var(--site-bg)',
        backgroundAttachment: 'fixed',
      },
    },
  },
  {
    value: 'landing',
    label: 'Landing',
    description: 'Full-width landing page',
    fullWidth: true,
    editorBackground: '#f8fafc',
    styles: {
      wrapper: {
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      },
    },
  },
  {
    value: 'full-width',
    label: 'Full Width',
    description: 'Edge-to-edge content',
    fullWidth: true,
  },
]
```

> **Background priority:** If a user sets `pageBackground` in the Puck editor, it overrides the layout's `styles.wrapper.background`. This allows layouts to define sensible defaults while letting individual pages customize their appearance.

### Using Layouts in the Editor

```typescript
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { siteLayouts } from '@/lib/puck-layouts'

<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  layouts={siteLayouts}
/>
```

### Using Layouts on the Frontend

```typescript
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { LayoutWrapper, DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'

export default async function Page({ params }) {
  const page = await getPage(params.slug)
  const layout = DEFAULT_LAYOUTS.find(l => l.value === page.puckData?.root?.props?.pageLayout)

  return (
    <LayoutWrapper layout={layout}>
      <PageRenderer config={baseConfig} data={page.puckData} />
    </LayoutWrapper>
  )
}
```

### Layout Definition Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `string` | — | Unique identifier |
| `label` | `string` | — | Display name in editor |
| `description` | `string` | — | Optional description |
| `maxWidth` | `string` | — | Container max-width (e.g., `'1200px'`) |
| `fullWidth` | `boolean` | `false` | If true, no container constraints |
| `classes` | `object` | — | CSS classes for wrapper/container/content |
| `styles` | `object` | — | Inline styles for wrapper/container/content |
| `header` | `ComponentType` | — | Header component for editor preview and frontend |
| `footer` | `ComponentType` | — | Footer component for editor preview and frontend |
| `editorBackground` | `string` | `'#ffffff'` | Background color/gradient for editor preview |
| `editorDarkMode` | `boolean` | `false` | Whether to use dark mode styling in editor preview |
| `stickyHeaderHeight` | `number` | — | Height in px of sticky/fixed header for proper content offset |
| `stickyFooter` | `boolean` | `true` | Push footer to bottom of viewport even with minimal content. Set to `false` to let footer flow naturally after content |

### Page-Level Settings

The editor automatically includes page-level controls that allow overriding layout defaults per-page:

| Field | Options | Description |
|-------|---------|-------------|
| `showHeader` | `default`, `show`, `hide` | Override header visibility for this page |
| `showFooter` | `default`, `show`, `hide` | Override footer visibility for this page |
| `pageBackground` | Background field | Custom page background color/gradient/image |
| `pageMaxWidth` | Select | Override layout's max-width constraint |

These settings appear in the editor's "Page Setup" panel and are applied in both the editor preview and frontend rendering.

</details>

---

<details>
<summary><strong>API Routes</strong> — Auth configuration, root props mapping</summary>

### Auth Configuration

The API routes require an `auth` configuration with permission hooks:

```typescript
const auth = {
  // Required: Authenticate the request
  authenticate: async (request) => {
    const session = await getSession(request)
    if (!session?.user) return { authenticated: false }
    return { authenticated: true, user: session.user }
  },

  // Optional permission hooks
  canList: async (user) => ({ allowed: true }),
  canView: async (user, pageId) => ({ allowed: true }),
  canEdit: async (user, pageId) => ({ allowed: user.role === 'editor' }),
  canPublish: async (user, pageId) => ({ allowed: user.role === 'admin' }),
  canDelete: async (user, pageId) => ({ allowed: user.role === 'admin' }),
}
```

### Root Props Mapping

Sync Puck root.props to Payload fields automatically:

```typescript
createPuckApiRoutesWithId({
  // ...
  rootPropsMapping: [
    { from: 'title', to: 'meta.title' },
    { from: 'description', to: 'meta.description' },
    { from: 'pageLayout', to: 'pageLayout' },
  ],
})
```

</details>

---

<details>
<summary><strong>Plugin Options</strong> — Collection config, access control</summary>

```typescript
createPuckPlugin({
  // Collection slug for pages (default: 'pages')
  pagesCollection: 'pages',

  // Auto-generate the Pages collection (default: true)
  autoGenerateCollection: true,

  // Override collection config
  collectionOverrides: {
    admin: {
      defaultColumns: ['title', 'slug', 'updatedAt'],
    },
  },

  // Custom access control
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
})
```

</details>

---

<details>
<summary><strong>Hybrid Integration</strong> — Add Puck to existing collections with legacy blocks</summary>

If you have an existing Pages collection with legacy Payload blocks, you can add Puck support without replacing your collection.

### Automatic (Recommended)

If you already have a `pages` collection defined, the plugin automatically adds only the Puck-specific fields that don't already exist:

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

export default buildConfig({
  collections: [
    {
      slug: 'pages',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'layout', type: 'blocks', blocks: [HeroBlock, CTABlock] },
      ],
    },
  ],
  plugins: [
    createPuckPlugin({ pagesCollection: 'pages' }),
  ],
})
```

The plugin adds: `puckData`, `editorVersion`, `pageLayout`, `meta` (SEO fields), and the "Edit with Puck" button.

**Smart detection:** The `editorVersion` field automatically detects whether existing pages use legacy blocks or Puck data. Pages with legacy blocks are marked `'legacy'`, pages with Puck content are marked `'puck'`, and new empty pages use the configured default. This prevents migrations from incorrectly overwriting existing content.

### Manual with `getPuckFields()`

For full control, disable auto-generation and use `getPuckFields()`:

```typescript
// collections/Pages.ts
import type { CollectionConfig } from 'payload'
import { getPuckFields } from '@delmaredigital/payload-puck'

export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'layout', type: 'blocks', blocks: [HeroBlock, CTABlock] },

    ...getPuckFields({
      includeSEO: false,
      includeConversion: true,
      // Custom conversion types (optional - defaults to standard types)
      conversionTypeOptions: [
        { label: 'Registration', value: 'registration' },
        { label: 'Donation', value: 'donation' },
        { label: 'Course Start', value: 'course_start' },
        { label: 'Custom', value: 'custom' },
      ],
      includeEditorVersion: true,
      includePageLayout: true,
      includeIsHomepage: false,
      // Custom layouts (only value/label needed for the field)
      layouts: [
        { value: 'default', label: 'Default' },
        { value: 'landing', label: 'Landing' },
      ],
    }),
  ],
}
```

```typescript
// payload.config.ts
createPuckPlugin({
  pagesCollection: 'pages',
  autoGenerateCollection: false,
})
```

### Individual Field Imports

```typescript
import {
  puckDataField,
  editorVersionField,
  createPageLayoutField,
  seoFieldGroup,
  conversionFieldGroup,
} from '@delmaredigital/payload-puck'

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    puckDataField,
    editorVersionField,
    createPageLayoutField(myCustomLayouts),
  ],
}
```

### Rendering Hybrid Pages

**Option A: Using `HybridPageRenderer` (Recommended)**

The `HybridPageRenderer` component handles the branching logic for you:

```typescript
// app/(frontend)/[...slug]/page.tsx
import { HybridPageRenderer } from '@delmaredigital/payload-puck/render'
import { puckConfig } from '@/puck/config'
import { siteLayouts } from '@/lib/puck-layouts'
import { LegacyBlockRenderer } from '@/components/LegacyBlockRenderer'

export default async function Page({ params }) {
  const page = await getPage(params.slug)

  return (
    <HybridPageRenderer
      page={page}
      config={puckConfig}
      layouts={siteLayouts}
      legacyRenderer={(blocks) => <LegacyBlockRenderer blocks={blocks} />}
    />
  )
}
```

**Option B: Manual Branching**

For more control, handle the branching yourself:

```typescript
// app/(frontend)/[...slug]/page.tsx
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { puckConfig } from '@/puck/config'
import { siteLayouts } from '@/lib/puck-layouts'
import { LegacyBlockRenderer } from '@/components/LegacyBlockRenderer'

export default async function Page({ params }) {
  const page = await getPage(params.slug)

  if (page.editorVersion === 'puck' && page.puckData) {
    return (
      <PageRenderer
        config={puckConfig}
        data={page.puckData}
        layouts={siteLayouts}
      />
    )
  }

  return <LegacyBlockRenderer blocks={page.layout} />
}
```

### Available Field Exports

| Export | Description |
|--------|-------------|
| `getPuckFields(options)` | Returns array of Puck fields based on options |
| `puckDataField` | JSON field for Puck editor data (hidden) |
| `editorVersionField` | Select field: 'legacy' \| 'puck' (auto-detects based on content) |
| `createEditorVersionField(default, sidebar, legacyBlocksFieldName)` | Factory for custom editor version field |
| `pageLayoutField` | Layout selector with DEFAULT_LAYOUTS |
| `createPageLayoutField(layouts, sidebar)` | Factory for custom layout options |
| `isHomepageField` | Checkbox for homepage designation |
| `seoFieldGroup` | Group named `meta` with title, description, image, noindex, etc. |
| `conversionFieldGroup` | Group for conversion tracking analytics (default types) |
| `createConversionFieldGroup(types, sidebar)` | Factory for custom conversion types |
| `DEFAULT_CONVERSION_TYPES` | Default conversion types array |
| `generatePuckEditField(slug, config)` | Creates the "Edit with Puck" UI button |

### Available Render Exports

| Export | Description |
|--------|-------------|
| `PageRenderer` | Renders Puck data with layout support |
| `HybridPageRenderer` | Renders either Puck or legacy pages based on `editorVersion` |

</details>

---

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

### What This Means

**✅ Free for:**
- Personal projects and hobby use
- Open source projects
- Educational and research purposes
- Evaluation and testing
- Nonprofit organizations
- Government institutions

**💼 Commercial use:**
Requires a separate commercial license. If you're using this in a commercial product or service, please contact us for licensing options.

**📧 Commercial Licensing:** [hello@delmaredigital.com](mailto:hello@delmaredigital.com)

---

## About

Built by [Delmare Digital](https://delmaredigital.com) — custom software solutions for growing businesses.