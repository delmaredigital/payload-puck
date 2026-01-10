'use client'

import Link from 'next/link'

export function PageTreeNavLink() {
  // Uses the same structure and classes as Payload's nav collection links
  return (
    <Link
      href="/admin/page-tree"
      className="nav__link"
      id="nav-page-tree"
    >
      <span className="nav__link-label">Page Tree</span>
    </Link>
  )
}

export default PageTreeNavLink
