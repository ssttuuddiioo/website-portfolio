import { LenisProvider } from '@/lib/lenis-provider'
import { BG, INK } from '@/components/landing/landing-theme'

/* Homepage shell — dark theme, own scroll context, no global nav/footer
   (the landing experience owns its sidebar nav and contact footer). */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenisProvider>
      <div
        style={{
          background: BG,
          color: INK,
          minHeight: '100svh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </LenisProvider>
  )
}
