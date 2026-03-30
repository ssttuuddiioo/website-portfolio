import { LenisProvider } from '@/lib/lenis-provider'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenisProvider>
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <Navigation />
      <PageTransition>
        <main id="main">{children}</main>
      </PageTransition>
      <Footer />
    </LenisProvider>
  )
}
