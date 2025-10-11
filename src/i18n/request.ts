// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server'
import {routing} from './routing'

type Locale = (typeof routing.locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: Locale =
    routing.locales.includes((requested ?? '') as Locale)
      ? (requested as Locale)
      : routing.defaultLocale

  // เปลี่ยน path เป็น ../messages/
  const messages = (await import(`../messages/${locale}.json`)).default

  return { locale, messages }
})
