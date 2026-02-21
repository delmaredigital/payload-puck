# @delmaredigital/payload-puck

A PayloadCMS plugin for integrating [Puck](https://puckeditor.com) visual page builder. Build pages visually with drag-and-drop components while leveraging Payload's content management capabilities.

<p align="center">
  <a href="https://demo.delmaredigital.com"><img src="https://img.shields.io/badge/Live_Demo-Try_It_Now-2ea44f?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo - Try It Now"></a>
  &nbsp;&nbsp;
  <a href="https://github.com/delmaredigital/dd-starter"><img src="https://img.shields.io/badge/Starter_Template-Use_This-blue?style=for-the-badge&logo=github&logoColor=white" alt="Starter Template - Use This"></a>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdelmaredigital%2Fdd-starter&project-name=my-payload-site&build-command=pnpm%20run%20ci&env=PAYLOAD_SECRET,BETTER_AUTH_SECRET&stores=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32"></a>
</p>

---

## Documentation

**Full documentation:** [docs/index.html](docs/index.html) (open in browser)

Covers installation, configuration, components, custom fields, theming, layouts, dark mode, page-tree integration, hybrid integration, AI integration, and more.

---

## Install

```bash
pnpm add @delmaredigital/payload-puck @puckeditor/core
```

### Requirements

| Dependency | Version |
|------------|---------|
| `@puckeditor/core` | >= 0.21.0 |
| `payload` | >= 3.69.0 |
| `@payloadcms/next` | >= 3.69.0 |
| `next` | >= 15.4.8 |
| `react` | >= 19.2.1 |

> **Note:** Puck 0.21+ moved from `@measured/puck` to `@puckeditor/core`. This plugin requires the new package scope.

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

For everything else — components, custom fields, theming, layouts, dark mode, page-tree integration, hybrid integration, AI integration, advanced configuration, and the full export reference — see the [full documentation](docs/index.html).

---

## License

MIT
