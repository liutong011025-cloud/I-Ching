import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/components/language-provider'
import { SiteHeader, SiteFooter } from '@/components/site-shell'
import './globals.css'

export const metadata: Metadata = {
  title: '易引 E-Guide · The Book of Changes',
  description:
    '走近《易经》的变化智慧，探索八卦，体验三枚钱币起卦。Explore the Book of Changes, its symbols, and a thoughtful three-coin reading.',
  icons: { icon: '/brand/logo-mark.svg', apple: '/brand/logo-mark.svg' },
}

export const viewport: Viewport = {
  themeColor: '#1a1714',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider><SiteHeader />{children}<SiteFooter /></LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
