import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import localFont from 'next/font/local'
import './globals.css'
import AntdProvider from './antd-provider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getThemeConfig } from '@/lib/themeConfig'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: {
    default: 'Ediora · Content Publishing Platform',
    template: '%s | Ediora',
  },
  description: 'A complete content publishing platform built with Next.js, Ant Design, and Prisma.',
  keywords: ['blog', 'content management', 'article publishing', 'CMS', 'Next.js', 'Prisma'],
  authors: [{ name: 'Ediora Team' }],
  creator: 'Ediora',
  publisher: 'Ediora',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:50812'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Ediora',
    title: 'Ediora · Content Publishing Platform',
    description: 'A complete content publishing platform built with Next.js, Ant Design, and Prisma.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ediora · Content Publishing Platform',
    description: 'A complete content publishing platform built with Next.js, Ant Design, and Prisma.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 前台统一使用默认主题（默认已英文化）
  const themeSlug = 'default'
  const themeConfig = getThemeConfig(themeSlug)

  const cssVars: CSSProperties = {
    '--theme-primary': themeConfig.primary,
    '--theme-accent': themeConfig.accent,
    '--theme-hero-start': themeConfig.heroStart,
    '--theme-hero-end': themeConfig.heroEnd,
    '--theme-page-bg': themeConfig.pageBackground,
    '--theme-card-bg': themeConfig.cardBackground,
    '--theme-card-alt-bg': themeConfig.cardAltBackground,
    '--theme-highlight-bg': themeConfig.highlightBackground,
    '--theme-highlight-alt-bg': themeConfig.highlightAltBackground,
    '--theme-text-color': themeConfig.text,
    '--theme-muted-text': themeConfig.subtext,
    '--theme-tag-bg': themeConfig.tagBackground,
    '--theme-tag-text': themeConfig.tagText,
    '--theme-gradient-start': themeConfig.gradientStart,
    '--theme-gradient-end': themeConfig.gradientEnd,
    '--theme-border-color': themeConfig.borderColor,
  } as CSSProperties

  return (
    <html lang="en" data-theme="default">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={cssVars}
      >
        <ErrorBoundary>
          <AntdProvider>{children}</AntdProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
