import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'always',
  pathnames: {
    '/': { th: '/', en: '/' },
    '/cart': { th: '/cart', en: '/cart' },
    '/products/[slug]': { th: '/products/[slug]', en: '/products/[slug]' },
    '/profile': { th: '/profile', en: '/profile' },
    '/checkout': { th: '/checkout', en: '/checkout' },
    '/checkout/confirmation': { th: '/checkout/confirmation', en: '/checkout/confirmation' },
    '/orders': { th: '/orders', en: '/orders' },
    '/orders/[id]': { th: '/orders/[id]', en: '/orders/[id]' }
  }
})

// ✅ export union type "th" | "en"
export type Locale = (typeof routing.locales)[number]
