// middleware.ts
import createMiddleware from 'next-intl/middleware'
import {routing} from './src/i18n/routing'

export default createMiddleware(routing)

// จับทั้ง root และ path ที่มี/ไม่มี prefix th|en
export const config = {
  matcher: ['/', '/(th|en)/:path*']
}
