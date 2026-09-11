import { IDEAS } from '@/lib/ideas'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { PLACEHOLDER_PROJECTS } from '@/lib/placeholder-projects'
import { FAQS } from '@/lib/faqs'

/**
 * /llms.txt — a plain-text summary of the site for language models.
 *
 * Generated from the same data the pages render (projects, notes, FAQ) so it
 * can't drift out of date the way a hand-written static file would. Pairs with
 * the AI-crawler allowlist in src/app/robots.ts.
 *
 * Format follows the llms.txt convention: an H1, a blockquote summary, prose,
 * then link sections.
 */

const SITE_URL = 'https://studiostudio.nyc'

export const dynamic = 'force-static'
export const revalidate = 3600

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return ''
  return `## ${title}\n\n${lines.join('\n')}\n`
}

export async function GET() {
  // Sourced from LANDING_PROJECTS (everything shown on the homepage), not just
  // the handful with case-study pages — otherwise a model asking "what has this
  // studio made?" only ever sees the three projects that happen to have a URL.
  // Linked where a detail page exists, plain text otherwise.
  const projectLinks = LANDING_PROJECTS.map((p) => {
    const label = `${p.title} — ${p.client} (${p.year}, ${p.category})`
    const head = p.slug ? `- [${label}](${SITE_URL}/work/${p.slug})` : `- ${label}`
    const tail = p.description ? `: ${p.description}` : ''
    return `${head}${tail}`
  })

  // Case-study pages, listed separately so the URLs are unambiguous.
  const caseStudyLinks = Object.values(PLACEHOLDER_PROJECTS).map(
    (p) => `- [${p.title} — ${p.client}](${SITE_URL}/work/${p.slug})`,
  )

  const noteLinks = IDEAS.map(
    (idea) =>
      `- [${idea.title}](${SITE_URL}/ideas/${idea.slug}) — ${idea.category}: ${idea.subtitle}`,
  )

  const faqLines = FAQS.map((f) => `- **${f.q}** ${f.a}`)

  const body = `# Studio Studio

> Studio Studio is the Brooklyn, New York creative practice of Pablo Gnecco — experiential design, creative technology, and lighting design for brands, agencies, galleries, and cultural institutions.

Studio Studio designs and builds interactive installations, brand activations, exhibitions, and immersive environments, working end to end: concept and creative direction, custom software, lighting and pixel-mapped LED systems (DMX/sACN), fabrication, and on-site delivery.

Founded and led by Pablo Gnecco, a Colombian-born experiential director and creative technologist. Pablo started the studio in 2015 as an inaugural member of the New Museum's NEW INC. Resident artist at Mana Contemporary; mentor at NYU ITP and the Steve Jobs Archive.

Clients and collaborators include HBO, Netflix, Google, AT&T, Audible, Under Armour, Intel, Sony, Dolby, Michigan Central Station, Cox Communications, and Mercedes-Benz Stadium.

Based in Brooklyn, New York. Travels to install and run work on-site.

${section('Pages', [
  `- [Home](${SITE_URL}/): studio overview, selected work, services, and contact.`,
  `- [Work](${SITE_URL}/work): full project index.`,
  `- [About](${SITE_URL}/about): practice, background, recognition, and FAQ.`,
  `- [Notes](${SITE_URL}/ideas): experiments, stories, and resources from the studio.`,
  `- [Contact](${SITE_URL}/contact): new projects, collaborations, and consulting.`,
])}
${section('Work', projectLinks)}
${section('Case studies (full project pages)', caseStudyLinks)}
${section('Notes', noteLinks)}
${section('Frequently asked', faqLines)}
## Contact

Email: hello@studiostudio.nyc
Location: Brooklyn, New York, USA
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
