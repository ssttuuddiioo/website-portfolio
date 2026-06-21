import type { Viewport } from 'next'
import { Geist } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import { buildRootMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { organizationSchema, personSchema } from '@/lib/seo/jsonld'
import { getOrgSettings } from '@/lib/seo/fetch-org'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = buildRootMetadata()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getOrgSettings()
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <JsonLd data={[organizationSchema(settings), personSchema(settings?.founder)]} />
        {children}
      </body>
    </html>
  )
}
