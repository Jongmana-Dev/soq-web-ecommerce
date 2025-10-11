import {NextIntlClientProvider} from 'next-intl'
import {routing} from '@/i18n/routing'
import {setRequestLocale} from 'next-intl/server'
import {notFound} from 'next/navigation'

type Locale = (typeof routing.locales)[number]
type Props = { children: React.ReactNode; params: Promise<{locale: string}> }

export function generateStaticParams(){ return routing.locales.map(locale => ({locale})) }

export default async function LocaleLayout({children, params}: Props){
  const {locale} = await params
  if(!routing.locales.includes(locale as Locale)) notFound()
  setRequestLocale(locale as Locale)
  return <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
}
