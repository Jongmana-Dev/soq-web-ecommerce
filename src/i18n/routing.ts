import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'as-needed',
  pathnames: {
    '/': { th: '/', en: '/' },
    '/products/[slug]': { th: '/products/[slug]', en: '/products/[slug]' }
  }
})

// ✅ export union type "th" | "en"
export type Locale = (typeof routing.locales)[number]
