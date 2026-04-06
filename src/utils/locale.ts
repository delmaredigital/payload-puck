/**
 * Locale Resolver — Determines the locale for a Payload operation.
 */
import type { Locale, PayloadHandler } from 'payload'
import type { NextRequest } from 'next/server'

/**
 * Resolves the locale to use for a Payload operation.
 *
 * Priority:
 *   1. Explicit `bodyLocale` (from `_locale` in the request body, sent by PuckEditor)
 *   2. `?locale=` query param (standard REST convention, already parsed by Payload)
 *   3. `req.locale` set by Payload's middleware (from admin UI context)
 */
export function resolveLocale(
  req: Parameters<PayloadHandler>[0],
  bodyLocale?: string,
): string | undefined {
  if (bodyLocale) return bodyLocale
  const queryLocale = req.query?.locale as string | undefined
  if (queryLocale) return queryLocale
  if (req.locale) return typeof req.locale === 'string' ? req.locale : (req.locale as Locale).code
  return undefined
}

/**
 * Resolves the locale from a Next.js API route request.
 *
 * Priority:
 *   1. Explicit `bodyLocale` (from `_locale` in the request body)
 *   2. `?locale=` query param
 */
export function resolveLocaleFromNextRequest(
  req: NextRequest,
  bodyLocale?: string,
): string | undefined {
  if (bodyLocale) return bodyLocale
  const queryLocale = req.nextUrl.searchParams.get('locale') ?? undefined
  if (queryLocale) return queryLocale
  return undefined
}
