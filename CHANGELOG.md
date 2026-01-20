# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Preview Theme Context for Reactive Dark Mode Detection

Added `PuckPreviewThemeContext` and `usePuckPreviewTheme()` hook to allow Puck components to reactively respond to the preview dark mode toggle without polling or MutationObserver hacks.

**The problem:** When users toggle dark mode in the Puck editor preview, CSS dark mode variants work correctly (via `data-theme` attribute), but JavaScript-based theme detection would fail due to race conditions with component remounting.

**The solution:** IframeWrapper now provides a React Context with the current dark mode state, which components can consume directly.

```typescript
import { usePuckPreviewTheme, PuckPreviewThemeContext } from '@delmaredigital/payload-puck/editor'

function MyComponent() {
  const previewTheme = usePuckPreviewTheme()

  // previewTheme is:
  // - null: not in editor (use DOM-based detection)
  // - boolean: in editor, indicates dark mode state

  const isDark = previewTheme !== null
    ? previewTheme
    : document.documentElement.getAttribute('data-theme') === 'dark'

  // Now render based on isDark...
}
```

This is particularly useful for components that need to dynamically change JavaScript-controlled styles (like overlay colors) based on the preview theme.

### Fixed

#### Rich Text Dropdown Controls Not Syncing Changes (Supersedes 0.6.4 Workaround)

Fixed the root cause of rich text dropdown controls (font size, text color, highlight) not triggering Puck's dirty state or updating the preview.

**What was happening:**
1. User clicks our dropdown (font size, color picker, etc.)
2. Focus moves from TipTap editor to the dropdown
3. Puck's blur handler checks: `e.relatedTarget?.closest("[data-puck-rte-menu]")`
4. Our dropdown didn't have this attribute, so Puck cleared `currentRichText`
5. All menu controls lost their editor reference, including native Puck ones like HeadingSelect
6. Changes were silently dropped due to Puck's `isFocused` guard

**The fix:** Add `data-puck-rte-menu` attribute to our dropdown content so Puck recognizes it as part of the rich text menu.

**What changed:**
- Dropdown controls now use `@radix-ui/react-popover` (matches Puck's pattern)
- Added `data-puck-rte-menu` attribute for Puck's focus management
- Removed the `forcePuckUpdate()` workaround from 0.6.4 (no longer needed)
- Fixed React warning about mixing border shorthand/non-shorthand properties

**Note:** The 0.6.4 release incorrectly identified this as a Puck core issue. It was actually a bug in our own code—missing the focus preservation attribute that Puck requires.

### Removed

- `docs/PUCK_CORE_RICH_TEXT_ISSUE.md` - This document incorrectly blamed Puck for an issue in our own code

## [0.6.4] - 2026-01-19

This release adds homepage swap functionality and fixes several issues with rich text editing, hook merging, and editor iframe styling.

### Added

#### Homepage Swap Functionality

When attempting to set a page as the homepage and another page already has that designation, the editor now shows a confirmation dialog offering to swap homepages. This provides a much better UX than simply failing with an error.

**How it works:**
1. User checks "Is Homepage" on a page
2. If another page is already the homepage, a dialog appears: "Page X is currently the homepage. Would you like to swap?"
3. If confirmed, the old homepage is unset and the new one is set atomically

**New exports:**
```typescript
import {
  createIsHomepageUniqueHook,
  HomepageConflictError,
  unsetHomepage,
} from '@delmaredigital/payload-puck'
```

#### `getPuckCollectionConfig()` Helper

New helper function that returns both fields AND hooks for hybrid collection integration. This ensures the `isHomepage` uniqueness hook is included when using the field.

```typescript
import { getPuckCollectionConfig } from '@delmaredigital/payload-puck'

const { fields, hooks } = getPuckCollectionConfig({
  includeIsHomepage: true,  // Includes uniqueness hook automatically
  includeSEO: true,
})

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    beforeChange: [
      ...(hooks.beforeChange ?? []),
      // Your other hooks...
    ],
  },
  fields: [
    { name: 'title', type: 'text' },
    ...fields,
  ],
}
```

#### Custom Plugin Rails Support

The `PuckEditor` component now accepts a `plugins` prop for custom Puck plugins. This enables adding custom panels to the plugin rail.

### Fixed

#### Rich Text Style Changes Not Triggering Dirty State

Fixed an issue where changing font size, text color, or highlights via dropdown controls wouldn't mark the editor as having unsaved changes. The root cause is a focus state race condition in Puck core's `useSyncedEditor` hook. This release includes a workaround that forces Puck to recognize the changes.

See `docs/PUCK_CORE_RICH_TEXT_ISSUE.md` for technical details.

#### Dark Mode Styling for Font Size Buttons

Fixed white-on-white text in the font size dropdown and custom size input when Payload admin is in dark mode.

#### Hook Merging in `generatePagesCollection`

Fixed a bug where the `isHomepage` uniqueness hook wasn't being triggered because:
1. When generating a new collection, the spread operator was overwriting the entire hooks object instead of merging arrays
2. When augmenting an existing collection, hooks weren't being added at all

#### Editor Iframe Stylesheet Loading

Fixed FOUC (Flash of Unstyled Content) in the editor iframe by forcing a browser repaint after stylesheets finish loading. The fix uses Puck's `waitForStyles` option combined with a forced repaint via opacity toggle.

#### `isHomepage` Field Not Saving

Fixed `isHomepage` field not being included in save/publish requests from the editor.

#### `./next` Export Not Working with `next.config.ts`

Fixed the `@delmaredigital/payload-puck/next` import failing when used in TypeScript Next.js configs (`next.config.ts`). The export now includes a `default` condition to support all module resolution strategies.

### Changed

- `TemplateField` now uses Puck's `getItemById` API instead of manual tree traversal for accessing slot content, simplifying the code significantly

### Documentation

- Added `docs/PUCK_CORE_RICH_TEXT_ISSUE.md` documenting the Puck core focus state issue and our workaround

---

## [0.6.3] - 2026-01-18

This release adds build-time CSS compilation for production deployments and fixes dark mode issues in Payload admin.

### Added

#### Build-Time CSS Compilation for Production

The `editorStylesheet` runtime compilation works great in development, but fails on serverless platforms (Vercel, Netlify, etc.) because source CSS files aren't deployed. This release adds `withPuckCSS()` - a Next.js config wrapper that compiles your CSS at build time.

**The problem:**
- Runtime CSS compilation reads source files (e.g., `src/app/globals.css`) at request time
- Serverless deployments only include compiled `.next` output, not source files
- Result: broken editor styles in production

**The solution:**
```javascript
// next.config.js
import { withPuckCSS } from '@delmaredigital/payload-puck/next'
import { withPayload } from '@payloadcms/next/withPayload'

export default withPuckCSS({
  cssInput: 'src/app/(frontend)/globals.css',
})(withPayload(nextConfig))
```

```typescript
// payload.config.ts
createPuckPlugin({
  editorStylesheet: 'src/app/(frontend)/globals.css',      // For dev (runtime)
  editorStylesheetCompiled: '/puck-editor-styles.css',     // For prod (static)
})
```

**How it works:**
1. During `next build`, the wrapper compiles your CSS to `public/puck-editor-styles.css`
2. In production, the plugin serves the static file instead of runtime compilation
3. In development, runtime compilation continues working for hot reload

**New exports:**
```typescript
import { withPuckCSS, getPuckCSSPath } from '@delmaredigital/payload-puck/next'
```

**New plugin options:**
- `editorStylesheetCompiled` - Path to pre-compiled CSS file for production (e.g., `/puck-editor-styles.css`)

### Fixed

#### Dark Mode Form Input Visibility

Fixed white-on-white text in Puck form inputs when Payload CMS is in dark mode. Puck's UI is always light-themed, but when nested inside Payload's dark mode admin, form inputs were inheriting white text color. The DarkModeStyles component now explicitly forces dark text in all Puck UI elements.

#### Editor Stylesheet Loading

Fixed editor iframe stylesheets not applying immediately on load. The compiled CSS (from `editorStylesheet` or `editorStylesheetCompiled`) now properly triggers a re-render when loaded, ensuring Tailwind classes and CSS variables are applied without requiring a dark mode toggle.

---

## [0.6.2] - 2026-01-17

This release adds dark mode support for the Puck editor and includes several bug fixes.

### Added

#### Dark Mode Support

The Puck editor now automatically detects PayloadCMS dark mode and applies CSS overrides to fix visibility issues (white-on-white text). Also includes a preview toggle to test how pages look in both light and dark modes.

**Features:**
- **Auto-detection**: Detects `.dark` class on `document.documentElement` (PayloadCMS) or `prefers-color-scheme: dark` (OS preference)
- **Preview toggle**: Sun/Moon toggle in the header to switch preview iframe between light/dark modes
- **CSS overrides**: Injects Puck color variable overrides when dark mode is detected

**New components:**
- `DarkModeStyles` - Injects Puck color variable overrides when dark mode detected
- `PreviewModeToggle` - Toggle for switching preview iframe dark/light mode
- `useDarkMode` hook - Detects dark mode from class or media query

**New props on `PuckEditor`:**
- `autoDetectDarkMode` (default: `true`) - Enable automatic dark mode detection for editor UI
- `showPreviewDarkModeToggle` (default: `true`) - Show light/dark toggle for preview iframe
- `initialPreviewDarkMode` (default: `false`) - Initial dark mode state for preview iframe

```typescript
<PuckEditor
  autoDetectDarkMode={true}           // Auto-detect PayloadCMS dark mode
  showPreviewDarkModeToggle={true}    // Show sun/moon toggle
  initialPreviewDarkMode={false}      // Start preview in light mode
/>
```

New exports from `@delmaredigital/payload-puck/editor`:
```typescript
import {
  DarkModeStyles,
  PreviewModeToggle,
  useDarkMode,
} from '@delmaredigital/payload-puck/editor'
```

#### createRenderLayouts Utility

New utility to strip header/footer from layouts for rendering. Use this when your host app already provides a global header/footer via its root layout:

```typescript
import { HybridPageRenderer, createRenderLayouts } from '@delmaredigital/payload-puck/render'
import { siteLayouts } from '@/lib/puck-layouts'

// Strip header/footer for rendering (host app provides them)
const renderLayouts = createRenderLayouts(siteLayouts)
```

This keeps header/footer in editor layouts for realistic preview while avoiding double headers when rendering.

Also exported from `@delmaredigital/payload-puck/layouts`.

### Fixed

- **Homepage preview URL**: Preview button now correctly navigates to `/` for pages marked as homepage instead of using the page slug
- **Editor iframe stylesheet URLs**: Relative stylesheet URLs (like `/api/puck/styles`) now resolve correctly in the Puck editor iframe, fixing broken styles when using `editorStylesheets` prop
- **Editor iframe data-theme attribute**: IframeWrapper now sets `data-theme` attribute in addition to CSS classes, fixing styles for projects using `[data-theme='dark']` selectors (common with shadcn/ui, Next.js themes)
- **CSS compilation now uses project's postcss.config**: The `/api/puck/styles` endpoint now loads the project's `postcss.config.js` via `postcss-load-config`, ensuring all plugins and configuration are properly applied. Falls back to direct Tailwind import if config loading fails.
- **MediaField styling**: Fixed border CSS syntax and resolved nested interactive element warning by replacing `<button>` with `<span>` inside the file input label

### Notes

**Fonts in Editor Preview**: If your project uses custom fonts loaded via `next/font` (like Google Fonts or local fonts), these won't automatically appear in the editor iframe. Add the font URLs to `editorStylesheetUrls`:

```typescript
createPuckPlugin({
  editorStylesheet: 'src/app/globals.css',
  editorStylesheetUrls: [
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap'
  ],
})
```

---

## [0.6.1] - 2026-01-17

This patch release fixes editor state synchronization and adds quality-of-life improvements for page-tree integration and TypeScript.

### Added

#### Payload Fields Sync to Editor Root Props

When loading a page in the editor, Payload document fields are now properly synced to Puck's root.props:

- `isHomepage`, `title`, `slug`, `pageLayout` now load correctly
- SEO fields (`meta.title`, `meta.description`, `meta.image`) are synced
- Page-tree fields (`folder`, `pageSegment`) are synced

New exports:
```typescript
import { mapPayloadFieldsToRootProps } from '@delmaredigital/payload-puck/api'

// Reverse-map Payload fields back to root.props format
const rootProps = mapPayloadFieldsToRootProps(payloadDocument)
```

#### Locked PageSegmentField for Page-Tree

The page segment field is now locked by default in page-tree mode to prevent accidental URL changes:

- Lock icon appears in the field header
- Click to unlock and enable editing
- Warning message displayed when unlocked: "Changing may break existing links"
- Matches behavior of slug and isHomepage fields

New exports:
```typescript
import {
  LockedPageSegmentField,
  createLockedPageSegmentField,
} from '@delmaredigital/payload-puck/fields'

// For custom page-tree implementations
const field = createLockedPageSegmentField({
  label: 'Page Segment',
  warningMessage: 'Changing may break existing links',
})
```

#### Server Component Type Safety

New TypeScript types for server-only Puck configs reduce field definition pressure:

```typescript
import type { ServerComponentConfig, SlotField } from '@delmaredigital/payload-puck/config'

// No fields required for components without slots
export const ButtonConfig: ServerComponentConfig<ButtonProps> = {
  label: 'Button',
  render: ({ text }) => <button>{text}</button>,
}

// Only slot fields needed for container components
export const SectionConfig: ServerComponentConfig<SectionProps> = {
  fields: { content: { type: 'slot' } },
  render: ({ content: Content }) => <section><Content /></section>,
}
```

#### HybridPageRenderer Improvements

Type safety improvements for hybrid rendering:

- Generic type parameter for typed `legacyRenderer` blocks
- `toHybridPageData()` helper to convert Payload's generic JSON types
- `HybridPageDataInput` type for loose input

```typescript
import {
  HybridPageRenderer,
  toHybridPageData,
  type HybridPageDataInput,
} from '@delmaredigital/payload-puck/render'

// Typed legacy blocks
<HybridPageRenderer<NonNullable<Page['layout']>>
  page={toHybridPageData(page)}
  config={config}
  legacyRenderer={(blocks) => <RenderBlocks blocks={blocks} />}
/>
```

#### AnimatedWrapper Export

`AnimatedWrapper` component is now exported from the components entry point:

```typescript
import { AnimatedWrapper } from '@delmaredigital/payload-puck/components'
```

### Fixed

- **Editor field sync**: Fields like `isHomepage`, `title`, `pageLayout` now correctly load from Payload documents into the editor root.props
- **Editor stylesheet passthrough**: `editorStylesheets` from plugin config now properly passed to `PuckEditor`

### Changed

- Page-tree integration now uses `createLockedPageSegmentField()` instead of `createPageSegmentField()` by default

---

## [0.6.0] - 2026-01-15

This release significantly enhances AI-assisted page generation and introduces a rewritten RichText field implementation.

> **Note:** AI integration is still in early stages and under active development. Expect changes as we refine the integration.

### Breaking Changes

#### RichText Field API Change

The TipTap field exports have been replaced with a new RichText field API using Puck's native richtext with custom extensions.

**Removed exports:**
- `TiptapField`, `createTiptapField`
- `TiptapModal`
- `TiptapModalField`, `createTiptapModalField`

**Migration:**
```typescript
// Before
import { createTiptapField } from '@delmaredigital/payload-puck/fields'

const content = createTiptapField({ label: 'Content' })

// After
import { createRichTextField } from '@delmaredigital/payload-puck/fields'

const content = createRichTextField({ label: 'Content' })
```

**New preset options:**
```typescript
import {
  createRichTextField,      // Full customization
  fullRichTextField,        // All features enabled
  minimalRichTextField,     // Basic formatting only
  sidebarRichTextField,     // Optimized for Puck sidebar
} from '@delmaredigital/payload-puck/fields'
```

### Added

#### AI Integration Enhancements

##### Comprehensive Component Instructions

The AI now receives detailed instructions for all built-in components, teaching it:
- Correct field names (e.g., Button uses `text` not `label`, `link` not `href`)
- Component composition patterns (Section → Flex → Heading + Text + Button)
- Page structure best practices (Hero → Features → FAQ → CTA flow)
- Semantic HTML element selection

This dramatically improves generation quality—the AI now creates complete multi-section pages instead of minimal layouts.

**New exports:**
```typescript
import {
  comprehensiveComponentAiConfig,  // Full component instructions
  pagePatternSystemContext,        // System context with page patterns
} from '@delmaredigital/payload-puck/ai'
```

##### Dynamic Business Context Collection

Business context can now be managed through Payload admin instead of hardcoded in config:

```typescript
createPuckPlugin({
  ai: {
    enabled: true,
    contextCollection: true,  // Creates puck-ai-context collection
  },
})
```

The `puck-ai-context` collection includes:
- **name** - Context entry name (e.g., "Brand Guidelines")
- **content** - Markdown content for the AI
- **category** - Categorization (brand, tone, product, industry, technical, patterns, other)
- **enabled** - Toggle to include/exclude from AI prompts
- **order** - Sort order in the prompt

##### Context Editor Plugin

When `contextCollection: true`, a new "AI Context" panel appears in the Puck plugin rail:

- View all context entries with enable/disable toggles
- Create new entries with name, category, and markdown content
- Edit existing entries inline
- Delete entries with confirmation

```typescript
import { createContextEditorPlugin } from '@delmaredigital/payload-puck/ai'

const contextPlugin = createContextEditorPlugin({
  apiEndpoint: '/api/puck/ai-context',
  canCreate: true,
  canEdit: true,
  canDelete: true,
})
```

##### Context Hook

New React hook for managing AI context client-side:

```typescript
import { useAiContext } from '@delmaredigital/payload-puck/ai'

const { context, loading, error, create, update, remove, refetch } = useAiContext({
  apiEndpoint: '/api/puck/ai-context',
  includeDisabled: false,
})
```

#### Experimental Full Screen Canvas

New prop to enable Puck's experimental full-screen canvas mode:

```typescript
<PuckEditor experimentalFullScreenCanvas={true} />
```

#### New RichText Field Implementation

The RichText field has been rewritten using Puck's native richtext with custom TipTap extensions:

- **Font Sizes** - 9 presets with custom input support
- **Text Colors** - Theme-aware color picker with opacity
- **Highlights** - Background color highlighting
- **Inline Editing** - Edit directly on the canvas (no modal)

### Changed

- AI endpoint now combines static context (from config) + dynamic context (from collection) + page pattern system context
- `PuckEditor` uses `comprehensiveComponentAiConfig` by default when AI is enabled
- Context fetching is non-blocking—if collection doesn't exist or fetch fails, AI continues with static context only
- RichText component now uses Puck's native richtext internally instead of custom TipTap implementation

---

## [0.5.0] - 2026-01-14

### Breaking Changes

#### Puck 0.21 Package Scope Migration

Puck 0.21 introduced a breaking package scope change. All Puck packages have moved from `@measured/*` to `@puckeditor/*`.

**Peer dependency change:**
```json
// Before
"@measured/puck": ">=0.20.0"

// After
"@puckeditor/core": ">=0.21.0"
```

**Installation:**
```bash
# Before
pnpm add @delmaredigital/payload-puck @measured/puck

# After
pnpm add @delmaredigital/payload-puck @puckeditor/core
```

**Import changes for custom components:**
```typescript
// Before
import type { ComponentConfig } from '@measured/puck'

// After
import type { ComponentConfig } from '@puckeditor/core'
```

This plugin no longer supports Puck versions prior to 0.21.

### Added

#### Version History Plugin Rail

Version history has moved from a header dropdown to a dedicated plugin rail panel, utilizing Puck 0.21's new plugin rail API.

**What changed:**
- History icon now appears in the left plugin rail (alongside Blocks, Outline, Fields)
- Clicking opens a full sidebar panel instead of a dropdown
- Restore no longer triggers a page reload—uses Puck's `dispatch` to update editor state instantly
- Success message appears briefly after restore

**New exports:**
```typescript
import { createVersionHistoryPlugin } from '@delmaredigital/payload-puck/editor'

// For custom plugin configurations
const versionPlugin = createVersionHistoryPlugin({
  pageId: 'page-123',
  apiEndpoint: '/api/puck/pages',
  onRestoreSuccess: () => markEditorClean(),
})

<Puck plugins={[versionPlugin]} />
```

**Deprecations:**
- `VersionHistory` component export (use `createVersionHistoryPlugin` instead)
- `showVersionHistory` prop on `HeaderActions` (version history now lives in plugin rail)

#### Semantic HTML Elements

Layout components now support semantic HTML output for better SEO and accessibility. Each component has an "HTML Element" dropdown in the editor sidebar:

| Component | Available Elements |
|-----------|-------------------|
| **Section** | `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `div` |
| **Flex** | `div`, `nav`, `ul`, `ol`, `aside`, `section` |
| **Container** | `div`, `article`, `aside`, `section` |
| **Grid** | `div`, `ul`, `ol` |

This enables proper document structure without wrapper elements:
- Use `<nav>` for navigation menus
- Use `<article>` for blog posts
- Use `<aside>` for sidebars
- Use `<ul>`/`<ol>` for list layouts

#### Full-Width Viewport Option

The editor now includes a "Full Width" (100%) viewport option alongside Mobile (360px), Tablet (768px), and Desktop (1280px). This helps preview how components behave at any viewport width.

#### Dynamic Accordion Defaults

The Accordion component now uses dynamic `defaultItemProps`:
- First item opens by default (`defaultOpen: true`)
- Items are numbered automatically ("Accordion Item 1", "Accordion Item 2", etc.)

#### ContentAlignmentField (D-Pad Positioning)

New visual 3x3 grid selector for content positioning within containers. Provides an intuitive d-pad style control for setting both horizontal and vertical alignment.

```typescript
import { createContentAlignmentField, alignmentToFlexCSS } from '@delmaredigital/payload-puck/fields'

const BannerConfig = {
  fields: {
    position: createContentAlignmentField({ label: 'Content Position' }),
  },
  render: ({ position }) => (
    <div style={{ display: 'flex', ...alignmentToFlexCSS(position) }}>
      {/* Content positioned at selected grid cell */}
    </div>
  ),
}
```

Helper functions:
- `alignmentToFlexCSS()` - For Flexbox containers
- `alignmentToGridCSS()` - For Grid containers
- `alignmentToPlaceSelfCSS()` - For individual grid items
- `alignmentToTailwind()` - Returns Tailwind classes

#### Unpublish Button

The editor header now includes an "Unpublish" link button that appears when viewing a published page. This allows reverting a published page back to draft status directly from the Puck editor, matching Payload's native document edit functionality.

#### Editor Stylesheet Injection

The Puck editor renders content in an iframe, which previously lacked access to your frontend CSS. New options enable stylesheet injection into the editor iframe:

**Plugin-level configuration:**
```typescript
createPuckPlugin({
  editorStylesheet: 'src/app/(frontend)/globals.css',  // Compiled with PostCSS/Tailwind
  editorStylesheetUrls: ['https://fonts.googleapis.com/...'],  // External stylesheets
})
```

This creates an endpoint at `/api/puck/styles` that compiles and serves your CSS (cached after first request).

**Component-level configuration:**
```typescript
<PuckConfigProvider
  config={editorConfig}
  editorStylesheets={['/api/puck/styles']}
  editorCss=":root { --custom: value; }"
/>

// Or per-layout in layout definitions
const layout: LayoutDefinition = {
  value: 'dark',
  editorStylesheets: ['/dark-theme.css'],
  editorCss: ':root { --background: #1a1a1a; }',
}
```

New props added to `PuckEditor`, `PuckConfigProvider`, and `LayoutDefinition`.

### Fixed

#### Server/Client Boundary Error

Fixed `getSizeClasses()` and `sizeValueToCSS()` being called from server components. These utilities have been moved to a server-safe module (`shared.ts`) to prevent the "Attempted to call client function from server" error when using the Button component with custom sizes in `PageRenderer`.

#### Publish Button Status

Fixed the Publish button not correctly setting `_status: 'published'` when publishing a draft page. The API now correctly omits the `draft` parameter when publishing to ensure Payload properly updates the document status.

#### Responsive Breakpoint Styles

Fixed responsive field styles not applying correctly at different breakpoints. Styles now properly cascade through Mobile, Tablet, and Desktop viewports.

#### Overflow Styling

Fixed overflow styling issues in layout components that could cause content clipping in certain configurations.

### Changed

- Internal imports updated from `@measured/puck` to `@puckeditor/core` (74 files)
- Plugin heading-analyzer import updated from `@measured/puck-plugin-heading-analyzer` to `@puckeditor/plugin-heading-analyzer`
- CSS import updated from `@measured/puck/puck.css` to `@puckeditor/core/puck.css`

### Notes

#### TipTap Implementation

This release evaluated Puck 0.21's built-in `richtext` field but retained the custom TipTap implementation. The custom implementation provides features not available in Puck's built-in:
- 9 font size presets with custom input
- Theme-aware color picker with opacity support
- Modal editing mode (full-screen expand)
- HTML source view/edit
- Auto-adapting colors for dark/light themes

The custom implementation uses standard TipTap packages (`@tiptap/react`, `@tiptap/starter-kit`, extensions) and official APIs—the customization is in the toolbar UI, not TipTap internals.

---

## [0.4.0] - 2026-01-12

### Breaking Changes

#### Unified PuckEditor Component

The editor component architecture has been simplified to a single `PuckEditor` component with built-in page-tree support.

**Removed exports:**
- `PuckEditorCore` - Use `PuckEditor` instead
- `PuckEditorClient` - Use `PuckEditor` instead

**Migration:**

```typescript
// Before
import { PuckEditorCore } from '@delmaredigital/payload-puck/editor'
// or
import { PuckEditorClient } from '@delmaredigital/payload-puck/client'

// After
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
// or
import { PuckEditor } from '@delmaredigital/payload-puck/client'
```

The new `PuckEditor` component:
- Accepts `config` prop directly OR reads from `PuckConfigProvider` context
- Includes built-in page-tree support via `hasPageTree` prop
- Handles all save/publish functionality
- Includes dynamic loading to prevent hydration mismatches

### Added

#### Page-Tree Props on PuckEditor

For custom editor UIs using page-tree integration:

```typescript
<PuckEditor
  config={editorConfig}
  pageId={page.id}
  initialData={page.puckData}
  pageTitle={page.title}
  pageSlug={page.slug}
  apiEndpoint="/api/puck/pages"
  hasPageTree={true}           // Enable page-tree fields
  folder={page.folder}         // Initial folder ID
  pageSegment={page.pageSegment} // Initial page segment
/>
```

#### New Utility Exports

Page-tree field injection utilities exported from `/client` and `/editor`:

```typescript
import { injectPageTreeFields, hasPageTreeFields } from '@delmaredigital/payload-puck/client'

// Check if config already has page-tree fields
if (!hasPageTreeFields(config)) {
  config = injectPageTreeFields(config)
}
```

### Changed

- `PuckEditor` now supports both direct `config` prop and context-based config
- `PuckEditorView` (RSC) now renders `PuckEditor` directly instead of `PuckEditorClient`
- Page-tree field injection moved into `PuckEditor` component

---

## [0.3.0] - 2026-01-09

### Breaking Changes

#### Payload Admin UI Integration

The Puck editor now runs inside Payload's admin UI using `DefaultTemplate`. This provides a native admin experience with proper navigation, permissions, and styling.

**Migration:**
- Remove custom editor routes (`app/(manage)/pages/[id]/edit/page.tsx`)
- Remove custom editor layouts
- The plugin now auto-registers the editor view at `/admin/puck-editor/:collection/:id`
- "Edit with Puck" buttons in Payload admin now navigate to the integrated editor

#### PuckConfigProvider Pattern

The Puck configuration is now provided via React context instead of being passed directly to components.

**Before:**
```tsx
// app/(manage)/pages/[id]/edit/page.tsx
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

<PuckEditor config={editorConfig} ... />
```

**After:**
```tsx
// app/(admin)/layout.tsx (or root layout)
import { PuckConfigProvider } from '@delmaredigital/payload-puck/client'
import { editorConfig } from '@delmaredigital/payload-puck/config/editor'

export default function Layout({ children }) {
  return (
    <PuckConfigProvider config={editorConfig}>
      {children}
    </PuckConfigProvider>
  )
}
```

The editor view automatically retrieves the config from context.

#### Build System Change

Migrated from tsup to tsc for simpler, more reliable builds.

- `tsup.config.ts` removed
- Build output structure unchanged
- No changes needed for consumers

### Added

#### Page-Tree Plugin Integration

Automatic integration with `@delmaredigital/payload-page-tree` when detected:

- **Auto-detection**: Checks if collection has `pageSegment` field (page-tree's signature)
- **Folder Picker Field**: Hierarchical folder selection in Puck sidebar
- **Page Segment Field**: Editable URL segment with live slugification
- **Slug Preview Field**: Read-only computed slug preview

When page-tree is active, the Puck editor sidebar shows:
```
Root Fields:
├── Page Title
├── Folder (picker dropdown with tree)
├── Page Segment (editable text, auto-slugified)
└── URL Slug (read-only preview)
```

**Configuration:**
```typescript
createPuckPlugin({
  // Auto-detect (default) - checks for pageSegment field
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

#### New Field Exports

Three new custom Puck fields for page-tree integration:

```typescript
import {
  createFolderPickerField,
  createPageSegmentField,
  createSlugPreviewField,
} from '@delmaredigital/payload-puck/fields'

// Folder picker with hierarchical tree
const folderField = createFolderPickerField({
  label: 'Folder',
  folderSlug: 'payload-folders',
})

// Page segment with auto-slugification
const segmentField = createPageSegmentField({
  label: 'Page Segment',
})

// Read-only slug preview
const slugField = createSlugPreviewField({
  label: 'URL Slug',
  hint: 'Auto-generated from folder + page segment',
})
```

#### New Export Paths

- `@delmaredigital/payload-puck/client` - Client components including `PuckConfigProvider`
- `@delmaredigital/payload-puck/rsc` - React Server Component exports
- `@delmaredigital/payload-puck/admin/client` - Admin-specific client components

### Changed

- Editor view now uses `DefaultTemplate` from `@payloadcms/next/templates`
- API routes now support `folder` and `pageSegment` fields in save payload
- Folder picker includes "Manage folders" link to `/admin/page-tree`

### Fixed

- Folder picker dropdown now appears inline (fixed `position: relative`)
- Folder picker refreshes folder list when opened (catches newly created folders)
- "No folder" selection no longer breaks the dropdown

---

## [0.2.0] - 2026-01-09

### Breaking Changes

#### Section Component Redesign
The Section component now has a two-layer architecture for more powerful layout control:

- **Section layer** (outer, full-width): Controls the full-bleed background, border, padding, and margin
- **Content layer** (inner, constrained): Controls the content area with max-width, background, border, and padding

**Field renames:**
- `background` → `sectionBackground`
- `border` → `sectionBorder`
- `customPadding` → `sectionPadding`
- `margin` → `sectionMargin`

**New fields:**
- `contentDimensions` - Max-width, min-height for content area (default: 1200px centered)
- `contentBackground` - Background for the content area
- `contentBorder` - Border around the content area
- `contentPadding` - Padding inside the content area

**Removed fields:**
- `fullWidth` - No longer needed; set `contentDimensions` to full width instead

#### Container Component Simplified
The Container component has been simplified to a single-layer organizational wrapper:

**Removed fields:**
- `innerBackground` - Use Section for two-layer backgrounds
- `innerBorder` - Use Section for two-layer borders
- `innerPadding` - Now just `padding`

**Migration:** If you were using Container's inner/outer backgrounds, migrate to Section which now provides this functionality with clearer naming.

### Added

- Changelog file to track breaking changes and new features

### Fixed

- Slot/DropZone now expands to fill container's minHeight in the editor
- RichText component now fills available width (removed Tailwind prose max-width constraint)
- Removed hardcoded padding defaults across components; now properly set via defaultProps

### Changed

- Section component now provides full-bleed background with constrained content area out of the box
- Container component simplified for basic organizational use cases
- Better field grouping in the editor panel (Section styling → Content styling)
- Default content area max-width of 1200px makes the two-layer design immediately visible
