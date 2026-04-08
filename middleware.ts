import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/admin-auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page and login API through without auth
  if (
    pathname === '/cha-de-panela/admin/login' ||
    pathname === '/api/cha-de-panela/admin/login'
  ) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie) {
    return NextResponse.redirect(new URL('/cha-de-panela/admin/login', req.url))
  }

  const valid = await verifySession(cookie.value)
  if (!valid) {
    const res = NextResponse.redirect(new URL('/cha-de-panela/admin/login', req.url))
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cha-de-panela/admin/:path*', '/api/cha-de-panela/admin/:path*'],
}
