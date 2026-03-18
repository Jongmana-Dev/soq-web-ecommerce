// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const protectedPaths = ['/profile', '/checkout', '/admin']

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Always redirect root to /th
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/th', req.url))
  }

  // If entering with /en, redirect to /th (always default to Thai)
  if (pathname === '/en') {
    return NextResponse.redirect(new URL('/th', req.url))
  }

  // Check if the path (without locale prefix) is protected
  const pathWithoutLocale = pathname.replace(/^\/(th|en)/, '') || '/'
  const isProtected = protectedPaths.some((p) => pathWithoutLocale.startsWith(p))

  if (isProtected) {
    const sessionToken =
      req.cookies.get('authjs.session-token')?.value ??
      req.cookies.get('__Secure-authjs.session-token')?.value

    if (!sessionToken) {
      const localeMatch = pathname.match(/^\/(th|en)/)
      const locale = localeMatch ? localeMatch[1] : 'th'
      const loginUrl = new URL(`/${locale}?login=true`, req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Run next-intl middleware
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/', '/(th|en)/:path*'],
}
