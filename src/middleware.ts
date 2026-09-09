import { NextResponse, type NextRequest } from 'next/server'
import { WIP_COOKIE, isGatedPath, isUnlocked } from '@/lib/wip-gate'

/**
 * The work-in-progress wall. Project pages are rewritten to /wip until the
 * browser carries an unlock cookie — a rewrite rather than a redirect, so the
 * URL the visitor followed stays in the bar and unlocking drops them straight
 * onto the project they asked for.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!isGatedPath(pathname)) return NextResponse.next()
  if (isUnlocked(request.cookies.get(WIP_COOKIE)?.value)) return NextResponse.next()

  const wip = new URL('/wip', request.url)
  wip.searchParams.set('from', `${pathname}${search}`)
  return NextResponse.rewrite(wip)
}

export const config = {
  /* Everything except Next's own assets, the API, the CMS and static files. */
  matcher: ['/((?!_next/|api/|studio|.*\\.[^/]+$).*)'],
}
