// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server'
import {routing, Locale} from './routing'

function isLocale(input: string | undefined): input is Locale {
  return !!input && (routing.locales as readonly string[]).includes(input)
}

export default getRequestConfig(async ({requestLocale}) => {
  // ✅ ต้องรอผลก่อน
  const resolved = await requestLocale

  const locale: Locale = isLocale(resolved) ? resolved : routing.defaultLocale
  const messages = (await import(`../messages/${locale}.json`)).default

  return { locale, messages }
})
