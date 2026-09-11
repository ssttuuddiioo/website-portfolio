/* ============================================
   FAQ — shared source of truth.

   Lives here (not in the accordion component) so the /about page can emit
   FAQPage structured data from the same array the UI renders. Keep the two
   in sync by construction, never by hand.
   ============================================ */

export interface Faq {
  q: string
  a: string
}

// Placeholder copy — drawn from the studio's actual practice. Swap for final
// answers (or move to the CMS) before launch.
export const FAQS: Faq[] = [
  {
    q: 'What kinds of projects do you take on?',
    a: 'Installations, brand activations, exhibitions, and interactive spaces. We handle the concept, creative direction, software, lighting, fabrication, and install. Recent clients include HBO, Google, AT&T, Dolby, and Michigan Central Station. We also make and exhibit our own work.',
  },
  {
    q: 'Do you work with agencies and institutions, or only direct clients?',
    a: 'Both. Agencies bring us in as their creative technology and production team. Galleries, festivals, and cultural institutions commission work from us. We can lead a project or work inside a bigger team.',
  },
  {
    q: 'What does a typical engagement look like?',
    a: 'Most projects start with a call about the idea. Then comes concept and design, a working prototype, fabrication, and install. Some jobs are a single piece built in a few weeks, others run for months, and the team grows or shrinks to match.',
  },
  {
    q: 'What technologies do you work with?',
    a: 'Lighting and LED systems (DMX/sACN, pixel mapping, show control). Real-time software in TouchDesigner, Three.js, React Three Fiber, openFrameworks, and Unity. Sensors, computer vision, projection, media servers, and audio playback. We also build websites and web apps in Next.js and React, native and mobile apps, kiosks and touch interfaces, firmware for custom hardware, and the backend and streaming systems behind them.',
  },
  {
    q: 'Where are you based, and do you travel?',
    a: 'New York, London, and Bogotá. The main studio is in New York, and collaborators work out of all three cities. We travel to install and run work wherever it is.',
  },
  {
    q: 'How do we start a project together?',
    a: 'Send a note through the form below with the idea, timeline, and budget, even if they are rough. We will set up a call to see if it is a fit and what the first step should be.',
  },
]
