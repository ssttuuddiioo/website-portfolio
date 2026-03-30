'use client'

const CLIENTS = [
  'HBO',
  'Google',
  'Intel',
  'Sony',
  'Dolby',
  'Michigan Central',
  'Cox',
  'Mercedes-Benz',
  'Chemistry Creative',
]

export function ClientLogos() {
  return (
    <section
      className="overflow-hidden"
      style={{ padding: 'var(--spacing-2xl) 0' }}
    >
      <div className="logo-scroll-container group">
        <div className="logo-scroll">
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <span
              key={`${client}-${i}`}
              className="font-mono text-text-tertiary whitespace-nowrap"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                padding: '0 var(--spacing-2xl)',
              }}
            >
              {client}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .logo-scroll-container {
          display: flex;
          overflow: hidden;
        }

        .logo-scroll {
          display: flex;
          animation: scroll-logos 35s linear infinite;
          flex-shrink: 0;
        }

        .group:hover .logo-scroll {
          animation-play-state: paused;
        }

        @keyframes scroll-logos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
