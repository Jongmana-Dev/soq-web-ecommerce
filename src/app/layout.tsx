import './globals.css'

export const dynamic = 'force-static'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
