# Starter files

Copy the files you need from [GitHub](https://github.com/delmaredigital/payload-puck/tree/main/examples) or the [starter files guide](https://plugins.delmaredigital.com/docs/puck/guides/starter-files) into your application's `src/` directory, keeping the paths below. The npm package contains only `dist`, so these files must be copied from GitHub or the docs page.

These are starting points to adapt, not a standalone application. Merge the `puckConfig.plugins` fragment from `payload.config.ts` into your existing `buildConfig()` call, keep your secret, database and admin setup, and adjust the Tailwind CSS import in the manage layout. Configure `@/*` to resolve to your app's `src/*` and `@payload-config` to your Payload configuration.

| File | Purpose |
| --- | --- |
| `payload.config.ts` | Plugin configuration, generated collection access and layout choices; merge into your existing config. |
| `app/(frontend)/page.tsx` | Published homepage lookup, metadata and rendering. |
| `app/(frontend)/[...slug]/page.tsx` | Published pages at other paths, metadata and rendering. |
| `app/(manage)/layout.tsx` | Standalone editor root layout; imports your Tailwind CSS. |
| `app/(manage)/pages/[id]/edit/page.tsx` | Standalone editor with save, publish, preview and history. |
| `app/api/puck/pages/route.ts` | Authenticated list and create routes. |
| `app/api/puck/pages/[id]/route.ts` | Authenticated read, update, publish and delete routes. |
| `app/api/puck/pages/[id]/versions/route.ts` | Authenticated version listing and restore handler. |
| `app/api/puck/pages/[id]/restore/route.ts` | Restore endpoint used by the editor's History panel. |
| `lib/puck-layouts.ts` | Custom layouts, header/footer slots and editor backgrounds. |
| `lib/puck-theme.ts` | Button styles, focus ring and colour picker presets. |
| `components/CustomBanner.tsx` | Custom component using the public field helpers. |
| `puck/custom-config.ts` | Adds the banner to the built-in editor config. |
| `styles/puck-theme.css` | CSS variables for apps without an existing shadcn/ui theme. |

For the built-in admin editor and endpoints, start with the [quick start](https://plugins.delmaredigital.com/docs/puck/quick-start); you only need plugin configuration, a `PuckConfigProvider` and a frontend route. Copy the standalone editor and API routes when you need to replace the built-in flows. Set `enableEndpoints: false` when replacing the plugin's endpoints with these custom routes. The routes preserve Payload's authenticated user as `payloadUser`, so collection and field access checks retain their authentication context.

Pass custom layouts to `PuckConfigProvider` (or `PuckEditor`) and `PageRenderer`. Pass a custom theme to `PuckConfigProvider` (or `PuckEditor`); for the integrated admin editor you can also set the plugin's `theme` option. Wrap frontend rendering in `ThemeProvider`. See the guide for Tailwind v4 utility mappings and further setup.

Run `pnpm typecheck:examples` in this repository to check these starters against the current source entry points. It does not start an application server.
