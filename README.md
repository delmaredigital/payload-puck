# @delmaredigital/payload-puck

A PayloadCMS plugin for integrating [Puck](https://puckeditor.com) visual page builder. Build pages visually with drag-and-drop components while leveraging Payload's content management capabilities.

<p align="center">
  <a href="https://github.com/delmaredigital/dd-starter"><img src="https://img.shields.io/badge/Starter_Template-Use_This-blue?style=for-the-badge&logo=github&logoColor=white" alt="Starter Template - Use This"></a>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdelmaredigital%2Fdd-starter&project-name=my-payload-site&build-command=pnpm%20run%20ci&env=PAYLOAD_SECRET,BETTER_AUTH_SECRET&stores=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32"></a>
</p>

> 🔒 **Upgrading to 0.9.3? Security fix — upgrade, no action needed.** The built-in update endpoint's homepage swap could clear the site's homepage on behalf of a user who wasn't allowed to make the edit ([GHSA-cphw-vvv5-c8p7](https://github.com/delmaredigital/payload-puck/security/advisories/GHSA-cphw-vvv5-c8p7)). The swap is now authorized first and runs in one transaction. See the [CHANGELOG](./CHANGELOG.md#093---2026-10-08).
>
> Coming from an older version? The [Upgrade Guide](https://delmaredigital.github.io/payload-puck/#upgrading) lists what each breaking or security release needs.

---

## Documentation

**[Full documentation &rarr;](https://delmaredigital.github.io/payload-puck/)**

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/delmaredigital/payload-puck)

Covers installation, configuration, components, custom fields, theming, layouts, dark mode, page-tree integration, hybrid integration, AI integration, and more.

---

## Install

```bash
pnpm add @delmaredigital/payload-puck @puckeditor/core
```

### Requirements

| Dependency | Version |
|------------|---------|
| `node` | >= 20.9.0 |
| `@puckeditor/core` | >= 0.23.0 |
| `payload` | >= 3.69.0 |
| `@payloadcms/next` | >= 3.69.0 |
| `next` | >= 15.4.8 (see security note below) |
| `react` | >= 19.2.1 |

> **Using [`@delmaredigital/payload-better-auth`](https://github.com/delmaredigital/payload-better-auth)?** Any published version works — its auth strategy stamps `collection` on the user, which is what 0.9's access resolution needs. **0.9.0 or later is recommended:** it is the first release where the recommended `payload.auth()` wiring, combined with the request headers 0.9 now forwards into Payload, is free of side effects for API-key requests. Current is `0.11.3`, which requires Better Auth `1.7`.

> **Note:** Puck 0.21+ moved from `@measured/puck` to `@puckeditor/core`. This plugin requires the new package scope.

> **Security:** If your app uses Next.js middleware (or proxy.ts) to protect dynamic routes, use `next` >= 15.5.16 / 16.2.5 to pick up the fix for [CVE-2026-44574](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv) (middleware bypass via dynamic route parameter injection). Turbopack users need >= 15.5.18 / 16.2.6.

---

## Quick Start

### 1. Add the Plugin

```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { createPuckPlugin } from '@delmaredigital/payload-puck/plugin'

export default buildConfig({
  plugins: [
    createPuckPlugin({
      pagesCollection: 'pages',
    }),
  ],
})
```

### 2. Provide Puck Configuration

```typescript
// app/(app)/layout.tsx
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

### 3. Create a Frontend Route

```typescript
// app/(frontend)/[[...slug]]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageRenderer } from '@delmaredigital/payload-puck/render'
import { baseConfig } from '@delmaredigital/payload-puck/config'
import { notFound } from 'next/navigation'

async function getPage(slug?: string[]) {
  const payload = await getPayload({ config })
  const slugPath = slug?.join('/') || ''
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

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()
  return <PageRenderer config={baseConfig} data={page.puckData} />
}
```

That's it! The plugin registers the editor view, API endpoints, and "Edit with Puck" buttons automatically.

---

## Documentation

For everything else — components, custom fields, theming, layouts, dark mode, page-tree integration, hybrid integration, AI integration, advanced configuration, and the full export reference — see the [full documentation](https://delmaredigital.github.io/payload-puck/).

---

## License

MIT
