'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { resolveLegacyHash } from '@/lib/legacy-redirects'

/**
 * Sends old Squarespace hash URLs — studiostudio.nyc/#storybooth3 — to the page
 * that replaced them.
 *
 * A fragment is never transmitted to the server, so `next.config`'s redirects
 * cannot see one: to the server, `/#storybooth3` is indistinguishable from `/`.
 * Only script running on the delivered page can read it, which is why this runs
 * on the client instead of alongside the path redirects.
 *
 * `replace`, not `push`, so the legacy URL does not sit in history waiting for
 * the back button to bounce the visitor straight back into this redirect. The
 * live section anchors (#work, #about, …) are left alone — `resolveLegacyHash`
 * returns null for those, and the page's own scroll spy handles them.
 */
export function LegacyHashRedirect() {
  const router = useRouter()

  useEffect(() => {
    const go = () => {
      const target = resolveLegacyHash(window.location.hash)
      if (!target) return
      // A row pointing at the homepage has nothing to navigate to; drop the
      // stale fragment so the URL is clean and the page stays put.
      if (target === '/') {
        window.history.replaceState(null, '', window.location.pathname)
        return
      }
      router.replace(target)
    }

    go()
    // An old link followed from within the site changes only the fragment, so
    // no navigation fires — hashchange is the only signal.
    window.addEventListener('hashchange', go)
    return () => window.removeEventListener('hashchange', go)
  }, [router])

  return null
}
