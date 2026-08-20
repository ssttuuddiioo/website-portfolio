import { LenisProvider } from '@/lib/lenis-provider'

/* Homepage shell — light theme, own scroll context, no global nav/footer
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
          background: '#F0F0F9',
          color: '#0A0A0A',
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
