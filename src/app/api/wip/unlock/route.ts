import { NextResponse } from 'next/server'
import {
  WIP_COOKIE,
  WIP_MAX_AGE,
  WIP_TOKEN,
  checkPassword,
} from '@/lib/wip-gate'

/**
 * Unlocks the work-in-progress wall. Takes the password, sets the cookie the
 * middleware looks for, and says nothing else — a wrong password gets one flat
 * 401 with no hint as to why.
 */
export async function POST(request: Request) {
  let password: unknown
  try {
    const body = await request.json()
    password = body?.password
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(WIP_COOKIE, WIP_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: WIP_MAX_AGE,
  })
  return response
}
