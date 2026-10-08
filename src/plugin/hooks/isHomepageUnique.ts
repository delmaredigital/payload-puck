import type { CollectionBeforeChangeHook, CollectionSlug, PayloadRequest } from 'payload'
import { APIError } from 'payload'

/**
 * Information about an existing homepage page
 */
export interface ExistingHomepageInfo {
  id: string
  title: string
  slug: string
}

/**
 * Error thrown when attempting to set a second page as homepage.
 * Contains information about the existing homepage for client-side handling.
 */
export class HomepageConflictError extends APIError {
  existingHomepage: ExistingHomepageInfo

  constructor(existingHomepage: ExistingHomepageInfo) {
    super(
      `Another page is already set as homepage: "${existingHomepage.title}" (/${existingHomepage.slug})`,
      400,
      // Pass existingHomepage in the data parameter so it appears in the API response
      { existingHomepage },
      true // isPublic - allows the message to be shown to the client
    )
    this.name = 'HomepageConflictError'
    this.existingHomepage = existingHomepage
  }
}

/**
 * Options for the isHomepage uniqueness hook
 */
export interface IsHomepageUniqueHookOptions {
  /**
   * Collection slug to query for existing homepage.
   * Defaults to the current collection.
   */
  collectionSlug?: string
}

/**
 * Creates a beforeChange hook that ensures only one page can have isHomepage: true.
 *
 * When a user tries to set isHomepage to true on a page, this hook:
 * 1. Checks if another page already has isHomepage: true
 * 2. If found, throws a HomepageConflictError with the existing page info
 * 3. The client can then prompt the user to swap homepages
 *
 * @example
 * ```typescript
 * import { createIsHomepageUniqueHook } from '@delmaredigital/payload-puck/plugin'
 *
 * const Pages: CollectionConfig = {
 *   slug: 'pages',
 *   hooks: {
 *     beforeChange: [createIsHomepageUniqueHook()],
 *   },
 *   fields: [...],
 * }
 * ```
 */
export function createIsHomepageUniqueHook(
  options: IsHomepageUniqueHookOptions = {}
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, collection, context }) => {
    // Skip if explicitly bypassed (used during homepage swap)
    if (context?.skipIsHomepageHook) {
      return data
    }

    // Only check if isHomepage is being set to true
    const isSettingHomepage = data?.isHomepage === true
    const wasHomepage = originalDoc?.isHomepage === true

    // Skip if not setting as homepage, or if it was already homepage
    if (!isSettingHomepage || wasHomepage) {
      return data
    }

    const collectionSlug = options.collectionSlug || collection.slug
    // Use locale from context (passed by endpoint handler) or fall back to req.locale
    const locale = context?.locale || req.locale

    // Query for existing homepage (excluding current document).
    //
    // `overrideAccess: true` is deliberate. This hook runs *inside* an operation
    // whose access Payload already checked, and it enforces a global invariant:
    // only one page may be the homepage. Evaluating it against the editing user's
    // read rules would let someone create a second homepage merely because they
    // cannot see the first — a correctness bug, not a safeguard.
    const existingHomepage = await req.payload.find({
      collection: collectionSlug,
      overrideAccess: true,
      ...(locale ? { locale: locale.toString() } : {}),
      where: {
        and: [
          { isHomepage: { equals: true } },
          // Exclude current document if it has an ID
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existingHomepage.docs.length > 0) {
      const existing = existingHomepage.docs[0] as {
        id: string
        title?: string
        slug?: string
      }

      throw new HomepageConflictError({
        id: String(existing.id),
        title: existing.title || 'Untitled',
        slug: existing.slug || '',
      })
    }

    return data
  }
}

/**
 * Unsets isHomepage on the specified page.
 * Used when swapping homepages.
 *
 * This writes with `overrideAccess: true`, so callers must only invoke it *after*
 * the edit that justifies it has passed access control. Pass `req` so the write
 * joins the caller's transaction and rolls back with it.
 */
export async function unsetHomepage(
  payload: any,
  collectionSlug: string,
  pageId: string,
  locale?: string,
  req?: PayloadRequest
): Promise<void> {
  // Deliberate, for the same reason as the uniqueness query above: unsetting the
  // previous homepage is invariant maintenance on behalf of an already-authorized
  // edit, not a user-initiated write to that document.
  await payload.update({
    collection: collectionSlug,
    overrideAccess: true,
    ...(req ? { req } : {}),
    id: pageId,
    data: {
      isHomepage: false,
    },
    // Skip hooks to avoid infinite loops
    context: {
      skipIsHomepageHook: true,
    },
    ...(locale ? { locale: locale.toString() } : {}),
  })
}

/**
 * Completes a homepage swap: unsets isHomepage on every page other than
 * `homepageId`.
 *
 * Call this only after `homepageId` itself has been updated under the caller's
 * access control, and inside the same transaction. Running it first let an
 * unauthorized swap request clear the site's homepage before its own update was
 * rejected (GHSA-cphw-vvv5-c8p7).
 */
export async function unsetOtherHomepages(
  req: PayloadRequest,
  collectionSlug: string,
  homepageId: string,
  locale?: string
): Promise<void> {
  // `overrideAccess: true` is deliberate, as in the uniqueness hook: the previous
  // homepage must be found even when the editor cannot read it, or the swap
  // leaves two homepages behind.
  const others = await req.payload.find({
    collection: collectionSlug as CollectionSlug,
    req,
    overrideAccess: true,
    where: {
      and: [
        { isHomepage: { equals: true } },
        { id: { not_equals: homepageId } },
      ],
    },
    pagination: false,
    depth: 0,
    ...(locale ? { locale: locale.toString() as any } : {}),
  })

  for (const doc of others.docs) {
    await unsetHomepage(req.payload, collectionSlug, String(doc.id), locale, req)
  }
}
