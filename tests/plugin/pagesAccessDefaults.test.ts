import { describe, expect, it } from 'vitest'
import type { Access, PayloadRequest } from 'payload'
import { generatePagesCollection } from '../../src/plugin/collections/Pages.js'

/**
 * A consumer who passes no `access` must not get a world-writable collection.
 * Anonymous reads only expose published pages; authenticated users can read
 * everything. Every write requires an authenticated Payload user.
 */
const req = (user: unknown) => ({ req: { user } as PayloadRequest }) as Parameters<Access>[0]

describe('generatePagesCollection default access', () => {
  const access = generatePagesCollection('pages', {}).access!

  it.each([null, undefined])('limits anonymous reads to published pages (%s)', async (user) => {
    expect(await access.read!(req(user))).toEqual({ _status: { equals: 'published' } })
  })

  it('lets anonymous callers read every page when drafts are turned off', async () => {
    const noDrafts = generatePagesCollection('pages', {
      collectionOverrides: { versions: { drafts: false } },
    })
    expect(noDrafts.versions).toEqual({ drafts: false })
    expect(await noDrafts.access!.read!(req(null))).toBe(true)
    expect(await noDrafts.access!.read!(req({ id: 1 }))).toBe(true)
  })

  it('keeps the published-only filter when versions are overridden with drafts on', async () => {
    const withDrafts = generatePagesCollection('pages', {
      collectionOverrides: { versions: { maxPerDoc: 10 } },
    }).access!
    expect(await withDrafts.read!(req(null))).toEqual({ _status: { equals: 'published' } })
  })

  it('allows authenticated users to read everything', async () => {
    expect(await access.read!(req({ id: 1, collection: 'users' }))).toBe(true)
  })

  it('honours consumer access.read for anonymous and authenticated callers', async () => {
    const publicAccess = generatePagesCollection('pages', { access: { read: () => true } }).access!
    expect(await publicAccess.read!(req(null))).toBe(true)
    const privateAccess = generatePagesCollection('pages', { access: { read: () => false } }).access!
    expect(await privateAccess.read!(req({ id: 1 }))).toBe(false)
  })

  it.each(['create', 'update', 'delete'] as const)('denies anonymous %s', async (op) => {
    expect(await access[op]!(req(null))).toBe(false)
    expect(await access[op]!(req(undefined))).toBe(false)
  })

  it.each(['create', 'update', 'delete'] as const)('allows an authenticated user to %s', async (op) => {
    expect(await access[op]!(req({ id: 1, collection: 'users' }))).toBe(true)
  })

  it('still honours explicit access functions', async () => {
    const adminOnly: Access = ({ req }) => (req.user as { role?: string } | null)?.role === 'admin'
    const custom = generatePagesCollection('pages', { access: { update: adminOnly } }).access!
    expect(await custom.update!(req({ id: 1, role: 'user' }))).toBe(false)
    expect(await custom.update!(req({ id: 1, role: 'admin' }))).toBe(true)
    // untouched operations keep the new defaults
    expect(await custom.delete!(req(null))).toBe(false)
  })

  it('lets collectionOverrides.access win over both defaults and access', async () => {
    const never: Access = () => false
    const custom = generatePagesCollection('pages', {
      access: { read: () => true },
      collectionOverrides: { access: { read: never } },
    }).access!
    expect(await custom.read!(req({ id: 1 }))).toBe(false)
  })
})

describe('generatePagesCollection collectionOverrides merging', () => {
  const adminOnly: Access = ({ req }) => (req.user as { role?: string } | null)?.role === 'admin'

  it('does not let collectionOverrides.access clobber the rules passed via access', async () => {
    // Regression: a trailing `...collectionOverrides` spread replaced the merged
    // access object, so read/create/update/delete silently fell back to
    // Payload's defaults whenever readVersions (or anything) was overridden.
    const collection = generatePagesCollection('pages', {
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      collectionOverrides: { access: { readVersions: adminOnly } },
    })
    const access = collection.access!
    expect(await access.read!(req(null))).toBe(true)
    expect(await access.create!(req({ id: 1, role: 'user' }))).toBe(false)
    expect(await access.update!(req({ id: 1, role: 'user' }))).toBe(false)
    expect(await access.delete!(req({ id: 1, role: 'user' }))).toBe(false)
    expect(await access.readVersions!(req({ id: 1, role: 'admin' }))).toBe(true)
  })

  it('accepts readVersions directly on the access option', async () => {
    const access = generatePagesCollection('pages', { access: { readVersions: adminOnly } }).access!
    expect(await access.readVersions!(req({ id: 1, role: 'user' }))).toBe(false)
    expect(await access.readVersions!(req({ id: 1, role: 'admin' }))).toBe(true)
    // defaults untouched
    expect(await access.read!(req(null))).toEqual({ _status: { equals: 'published' } })
    expect(await access.create!(req(null))).toBe(false)
  })

  it('keeps default admin settings when only some admin overrides are given', () => {
    const collection = generatePagesCollection('pages', {
      collectionOverrides: { admin: { group: 'Site' } },
    })
    expect(collection.admin?.useAsTitle).toBe('title')
    expect(collection.admin?.group).toBe('Site')
  })

  it('keeps drafts enabled when versions are partially overridden', () => {
    const collection = generatePagesCollection('pages', {
      collectionOverrides: { versions: { maxPerDoc: 5 } },
    })
    expect(collection.versions).toMatchObject({ drafts: true, maxPerDoc: 5 })
  })

  it('still spreads unrelated overrides verbatim', () => {
    const collection = generatePagesCollection('pages', {
      collectionOverrides: { labels: { singular: 'Landing Page', plural: 'Landing Pages' } },
    })
    expect(collection.labels).toEqual({ singular: 'Landing Page', plural: 'Landing Pages' })
  })
})
