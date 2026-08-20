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
    a: 'Installations, brand activations, exhibitions, and interactive environments — for rooms, screens, and stages. We work end to end: concept and creative direction, custom software and lighting, fabrication, and on-site delivery. Recent work spans clients like HBO, Intel, Dolby, and Michigan Central Station, alongside our own exhibited artwork.',
  },
  {
    q: 'Do you work with agencies and institutions, or only direct clients?',
    a: 'Both. We partner with brands and agencies as a production and creative-technology arm, and we take commissioned work from galleries, festivals, and cultural institutions. We are comfortable leading a project or plugging into a larger team.',
  },
  {
    q: 'What does a typical engagement look like?',
    a: 'It usually starts with a conversation about what the experience should be — before anyone builds anything. From there we move through concept, design, prototyping, fabrication, and install. Scope can be a single moment or a full multi-month production; we scale the team to fit.',
  },
  {
    q: 'What technologies do you work with?',
    a: 'A wide range. Lighting and LED systems (DMX/sACN, pixel mapping, show control), real-time installation software (TouchDesigner, Three.js, React Three Fiber, openFrameworks, Unity), sensor-driven and networked systems, computer vision, projection and media servers, audio and show playback. On the software side: websites and web apps (Next.js, React), native and mobile apps, kiosks and touch interfaces, custom hardware and microcontrollers, and the backend and streaming plumbing that ties a piece together. We choose the stack around the idea, not the other way around.',
  },
  {
    q: 'Where are you based, and do you travel?',
    a: 'New York, London, and Bogota. Our main studio is in New York, and the network works out of all three. We travel everywhere to install and run work on-site, wherever a project lives.',
  },
  {
    q: 'How do we start a project together?',
    a: 'Send a note through the form below with a rough sense of the idea, timeline, and budget. We will set up a call to figure out whether it is a fit and what the first step looks like.',
  },
]
