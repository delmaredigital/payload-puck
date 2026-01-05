# Puck Plugin Examples

Copy these files to your project as a starting point. Each file includes comments explaining what to customize.

## Directory Structure

```
examples/
├── api/
│   └── puck/
│       └── pages/
│           ├── route.ts              # List & create pages
│           └── [id]/
│               ├── route.ts          # Get, update, delete page
│               └── versions/
│                   └── route.ts      # Version history (optional)
├── app/
│   ├── (frontend)/
│   │   └── page.tsx                  # Homepage route (root "/")
│   ├── pages/
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx          # Visual editor page
│   └── [...slug]/
│       └── page.tsx                  # Dynamic page renderer
├── config/
│   └── payload.config.example.ts     # Payload plugin configuration
└── lib/
    ├── puck-theme.ts                 # Theme configuration
    └── puck-layouts.ts               # Custom page layouts
```

**Note:** The plugin automatically creates a `puck-templates` collection for the Template component. No additional API routes are needed - templates use Payload's built-in REST API at `/api/puck-templates`.

## Quick Setup

### 1. Add the Plugin to Payload Config

Reference the example configuration and merge with your existing `payload.config.ts`:

```bash
# View the example config
cat node_modules/@delmaredigital/payload-puck/examples/config/payload.config.example.ts
```

Add the plugin to your config:

```typescript
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

export default buildConfig({
  plugins: [
    createPuckPlugin({
      pagesCollection: 'pages',
    }),
  ],
  // ... rest of your config
})
```

### 2. Copy API Routes

```bash
# From your project root
cp -r node_modules/@delmaredigital/payload-puck/examples/api/puck src/app/api/
```

### 3. Copy Editor Page

```bash
# Adjust the destination path as needed for your route structure
mkdir -p src/app/\(manage\)/pages/\[id\]/edit
cp node_modules/@delmaredigital/payload-puck/examples/app/pages/\[id\]/edit/page.tsx src/app/\(manage\)/pages/\[id\]/edit/
```

### 4. Copy Frontend Routes

```bash
# Homepage route (handles root "/")
mkdir -p src/app/\(frontend\)
cp node_modules/@delmaredigital/payload-puck/examples/app/\(frontend\)/page.tsx src/app/\(frontend\)/

# Dynamic catch-all route (handles "/about", "/contact", etc.)
mkdir -p src/app/\(frontend\)/\[...slug\]
cp node_modules/@delmaredigital/payload-puck/examples/app/\[...slug\]/page.tsx src/app/\(frontend\)/\[...slug\]/
```

### 5. Copy Theme (Optional)

```bash
mkdir -p src/lib
cp node_modules/@delmaredigital/payload-puck/examples/lib/puck-theme.ts src/lib/
```

Then uncomment the theme imports in the editor and renderer pages.

### 6. Copy Layouts (Optional)

```bash
cp node_modules/@delmaredigital/payload-puck/examples/lib/puck-layouts.ts src/lib/
```

Then update your plugin config and renderer to use custom layouts.

## Customization

### Authentication

Edit the `authenticate` function in each API route to match your auth setup:

```typescript
authenticate: async (request) => {
  // Your auth logic here
  const session = await getSession(request)
  if (!session?.user) return { authenticated: false }
  return { authenticated: true, user: session.user }
},
```

### Permissions

Customize the `canView`, `canEdit`, `canPublish`, and `canDelete` hooks:

```typescript
canEdit: async (user, pageId) => {
  // Example: Only editors and admins can edit
  return { allowed: ['editor', 'admin'].includes(user?.role) }
},
```

### Theme

Edit `lib/puck-theme.ts` to match your CSS variables:

```typescript
buttonVariants: {
  default: {
    // Use your CSS variable classes
    classes: 'bg-brand text-brand-foreground hover:bg-brand/90',
  },
},
```

### Layouts

Edit `lib/puck-layouts.ts` to define custom page layouts with header/footer support:

```typescript
import { createLayout, mergeLayouts, DEFAULT_LAYOUTS } from '@delmaredigital/payload-puck/layouts'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

// Layout with sticky header
const defaultLayout = createLayout({
  value: 'default',
  label: 'Default',
  description: 'Standard page with header and footer',
  maxWidth: '1200px',
  // Header/footer rendered in both editor preview and frontend
  header: Header,
  footer: Footer,
  // Editor preview settings
  editorBackground: '#ffffff',
  editorDarkMode: false,
  // IMPORTANT: Set this if your header is sticky/fixed
  // This adds padding-top in both editor AND frontend so content doesn't render behind the header
  stickyHeaderHeight: 80, // Height of your sticky header in pixels
})

// Landing layout without header/footer
const landingLayout = createLayout({
  value: 'landing',
  label: 'Landing',
  description: 'Full-width layout without header/footer',
  fullWidth: true,
  // No header/footer - content controls the entire page
  editorBackground: '#f8fafc',
})

// Dark theme example
const darkLayout = createLayout({
  value: 'dark',
  label: 'Dark',
  description: 'Dark theme layout',
  maxWidth: '1200px',
  header: Header, // Could be a dark-themed header
  footer: Footer,
  editorBackground: '#111827',
  editorDarkMode: true, // Sets dark mode class on iframe
  stickyHeaderHeight: 80,
})

// Combine with defaults
export const customLayouts = mergeLayouts(
  DEFAULT_LAYOUTS,
  [defaultLayout, landingLayout, darkLayout],
  { replace: true } // Replace defaults with our versions
)
```

Use layouts in your editor page:

```typescript
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { customLayouts } from '@/lib/puck-layouts'

<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  layouts={customLayouts}  // Editor reads header/footer from layouts
/>
```

And in your PageRenderer:

```typescript
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { customLayouts } from '@/lib/puck-layouts'

<PageRenderer
  data={page.puckData}
  layouts={customLayouts}  // Frontend renders header/footer from layouts
/>
```

#### Layout Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `value` | `string` | Unique identifier |
| `label` | `string` | Display name in editor |
| `header` | `ComponentType` | Header component for preview & frontend |
| `footer` | `ComponentType` | Footer component for preview & frontend |
| `stickyHeaderHeight` | `number` | Height of sticky/fixed header (applies padding in editor & frontend) |
| `editorBackground` | `string` | Background color for editor preview |
| `editorDarkMode` | `boolean` | Use dark mode in editor preview |
| `maxWidth` | `string` | Container max-width (e.g., `'1200px'`) |
| `fullWidth` | `boolean` | If true, no container constraints |
| `classes` | `object` | CSS classes for wrapper/container/content |
