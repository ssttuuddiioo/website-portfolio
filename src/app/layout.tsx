import type { Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Jost } from 'next/font/google'
import { buildRootMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { organizationSchema, personSchema } from '@/lib/seo/jsonld'
import { getOrgSettings } from '@/lib/seo/fetch-org'
import './globals.css'

/* Futura stand-in. Real Futura is listed first in --font-display, so macOS/iOS
   renders the genuine face; everyone else gets Jost, a geometric sans cut close
   to Futura. Loaded variable (100-900) because the design uses 300 through 700
   and licensed Futura has no 600. */
const jost = Jost({
  variable: '--font-jost',
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
      className={`${jost.variable} antialiased`}
    >
      <body>
        <JsonLd data={[organizationSchema(settings), personSchema(settings?.founder)]} />
        {children}
        {/* Vercel Web Analytics. Cookie-free, so no consent banner needed. */}
        <Analytics />
      </body>
    </html>
  )
}
