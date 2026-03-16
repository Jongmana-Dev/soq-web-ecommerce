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
    '/orders/[id]': { th: '/orders/[id]', en: '/orders/[id]' },
    '/admin': { th: '/admin', en: '/admin' },
    '/admin/products': { th: '/admin/products', en: '/admin/products' },
    '/admin/faqs': { th: '/admin/faqs', en: '/admin/faqs' },
    '/admin/reviews': { th: '/admin/reviews', en: '/admin/reviews' },
    '/admin/certifications': { th: '/admin/certifications', en: '/admin/certifications' },
    '/admin/orders': { th: '/admin/orders', en: '/admin/orders' },
    '/admin/orders/[id]': { th: '/admin/orders/[id]', en: '/admin/orders/[id]' },
    '/admin/settings': { th: '/admin/settings', en: '/admin/settings' },
    '/admin/payment-accounts': { th: '/admin/payment-accounts', en: '/admin/payment-accounts' },
    '/admin/shipping': { th: '/admin/shipping', en: '/admin/shipping' },
    '/admin/usage-steps': { th: '/admin/usage-steps', en: '/admin/usage-steps' },
    '/admin/terms': { th: '/admin/terms', en: '/admin/terms' },
    '/admin/members': { th: '/admin/members', en: '/admin/members' },
    '/admin/change-password': { th: '/admin/change-password', en: '/admin/change-password' }
  }
})

// ✅ export union type "th" | "en"
export type Locale = (typeof routing.locales)[number]
