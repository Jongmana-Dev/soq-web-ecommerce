import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Prompt, Poppins } from 'next/font/google'
import Script from 'next/script'
import SessionProvider from '@/providers/SessionProvider'
import '@/app/globals.css'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '400', '600', '700'],
  display: 'swap',
  variable: '--font-prompt'
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
  variable: '--font-poppins'
})

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
      </head>
      <body className={`${prompt.variable} ${poppins.variable} font-prompt`}>
        <Script
          id="font-awesome-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var l=document.createElement('link');
              l.rel='stylesheet';
              l.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
              l.crossOrigin='anonymous';
              document.head.appendChild(l);
            `,
          }}
        />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <NextIntlClientProvider locale={locale}>
              {props.children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
