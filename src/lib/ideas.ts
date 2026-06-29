/* ============================================
   Ideas — experiments, stories, and side projects.
   Single source of truth for both the homepage
   listing (IdeasSection) and the /ideas/[slug]
   detail template (IdeaExperience).
   ============================================ */

export interface Idea {
  slug: string
  title: string
  /** One-line subtitle shown under the title on both card and detail. */
  subtitle: string
  category: 'Experiments' | 'Stories' | 'Random' | 'Resources' | 'Newsletters'
  /** Short clamp-to-two-lines blurb for the listing card. */
  excerpt: string
  /** Long-form body for the detail page (~1,000 chars). Split on blank lines. */
  body: string
  image: string
  /** Dark source image → use a black placeholder background while it loads. */
  dark?: boolean
}

export const IDEA_CATEGORIES = [
  'All',
  'Experiments',
  'Stories',
  'Random',
  'Resources',
  'Newsletters',
] as const

export const IDEAS: Idea[] = [
  {
    slug: 'let-go',
    title: 'What do you want to let go of?',
    subtitle: 'An interactive installation about naming — and releasing — what we carry.',
    category: 'Experiments',
    excerpt:
      'An interactive installation that invites people to name — and release — what they are carrying.',
    body: `It started with a question I kept asking myself: what would it feel like to set something down in public? Not to perform it, just to name it and let it go.

The piece is simple. You type a single sentence — a worry, a grudge, a name — and it joins a slow constellation of everyone else's. The words drift, brighten, and then dissolve into light, so nothing you write stays on screen long enough to be read twice. The release is the point.

Technically it's a small thing pretending to be a large one. A keyboard feeds a web app; a particle system renders each phrase as a cloud of points that scatter on a timer; the whole field is projected large enough that a room of strangers feels like a shared sky. I tuned the decay curve for weeks — too fast and it feels dismissive, too slow and the wall gets crowded and anxious.

What surprised me was how honest people were when they believed the words would vanish. The anonymity did the heavy lifting. I want to build a version that travels — a booth you can wheel into a lobby, a festival, a waiting room — and see what a city decides to put down.`,
    image: '/landing/opt/orbitals.avif',
    dark: true,
  },
  {
    slug: 'choosing-sucks',
    title: 'Choosing Sucks',
    subtitle: 'A decision tool for the chronically indecisive.',
    category: 'Random',
    excerpt:
      'A decision tool for the chronically indecisive. Fewer options, better choices.',
    body: `My friend Allister and I lose real time to the same conversation: where should we eat? Neither of us wants to decide, both of us have opinions, and the group chat goes quiet until someone gives up. So we built the thing that ends it.

Choosing Sucks does the opposite of every recommendation app. It does not give you more options — it takes them away. You feed it a short list, it removes choices one at a time, and you react to each cut. The discomfort of losing an option you secretly wanted tells you what you actually want faster than any star rating ever could.

Under the hood it is almost insultingly simple: a list, a shuffler, and a little state machine that remembers what you flinched at. No accounts, no map, no reviews. The whole point is to be closed in under a minute.

It is the most-used thing I have ever made, by a wide margin, and the least impressive on paper. That gap is the lesson. People do not want more information. They want permission to stop deciding. I keep meaning to give it a real home, a domain, a coat of paint — but it works, and Allister and I eat on time now.`,
    image: '/landing/opt/render3.avif',
  },
  {
    slug: 'stage-controller',
    title: 'Stage Controller',
    subtitle: 'Run a full lighting rig live from an iPad.',
    category: 'Experiments',
    excerpt: 'Run lighting cues live from an iPad, built on ENTTEC ELM.',
    body: `Most lighting consoles are built for someone sitting still at front-of-house. I needed the opposite — something I could hold while walking a room, watching a crowd, feeling where the energy wanted to go next.

Stage Controller is a touch surface for ENTTEC's ELM. It speaks the same OSC and DMX that the big desks do, but the interface is mine: oversized cue buttons, a master fader you can find without looking, and a layout that reshapes itself for whatever rig I happen to be running that night. I designed it on an iPad because that is the device that survives a load-in — no mouse, no menus, just glass you can drive with a thumb.

The hard part was latency and trust. A lighting cue that lands a beat late reads as a mistake to everyone in the room, so the whole stack is tuned to feel instantaneous, and every control gives physical-feeling feedback the moment you touch it. If the app ever feels uncertain, the operator does too.

It started as a tool for my own gigs and quietly became the way I run live light. The next version adds timeline-based cue stacks so a whole show can ride on muscle memory.`,
    image: '/landing/opt/installation-33.avif',
    dark: true,
  },
  {
    slug: 'pour-perfect',
    title: 'Pour Perfect',
    subtitle: 'A guided pour-over timer that teaches as you brew.',
    category: 'Random',
    excerpt:
      'A guided pour-over timer that teaches ratio and rhythm as you brew.',
    body: `Good coffee is mostly rhythm — how much water, how fast, when to wait. I knew the numbers but my hands never quite trusted them, so I built a timer that walks me through a pour the way a metronome walks a musician through a phrase.

You tell Pour Perfect how much coffee you have and it does the ratio math, then it conducts: pour now, stop, let it bloom, pour again. The screen shows only the thing you need in this exact second — a target weight, a countdown, a gentle cue — and nothing else. Each brew teaches you a little, until one morning you realize you have stopped looking at it.

I cared most about the feel of the prompts. A guide that nags is worse than no guide. So the language is quiet and the transitions are soft, and it never makes you feel behind. It is less an app than a calm voice standing next to the kettle.

It is a small idea and an honest one: the best tools dissolve into the thing you are doing. I want to fold in scales over Bluetooth so the timer reads the water itself, and the last screen finally disappears.`,
    image: '/landing/opt/gg.avif',
  },
  {
    slug: 'gestures',
    title: 'Gestures',
    subtitle: 'A camera that turns hand movement into living typography.',
    category: 'Stories',
    excerpt: 'A camera-driven piece that turns hand movement into living typography.',
    body: `Gestures came out of a stubborn curiosity: what does handwriting look like if the pen is gone and only the motion remains? I wanted to read the shape of a wave, a reach, a flinch.

A camera tracks your hands and a type system answers in real time — letters that stretch, scatter, and pool depending on how you move. Slow and deliberate, the words hold together. Fast and loose, they break into a field of marks that still somehow read as language. There is no menu and no instruction; you figure out the grammar with your body, which is the part people remember.

The build is computer vision feeding a custom renderer, but the engineering was never the story. The story was watching strangers get shy, then bold, then performative in front of it — discovering that they were writing with their whole arm. VICE picked it up, and the footage that traveled was always the same: someone laughing at what their own gesture turned into.

It taught me that interaction is choreography. Give people a clear cause and a surprising effect and they will compose something you never could have scripted. I still pull pieces of its renderer into new work.`,
    image: '/landing/opt/gestures.avif',
    dark: true,
  },
  {
    slug: '9to5-tv',
    title: '9to5.tv',
    subtitle: 'A festival and public livestream out of The Goat Farm.',
    category: 'Stories',
    excerpt:
      'A festival and public livestream out of The Goat Farm, with custom robots.',
    body: `9to5.tv began as a joke about office hours and turned into a festival. The premise: take the most generative, least-watched part of a creative life — the workday — and broadcast it live, badly lit and unedited, as if it were worth tuning into. It turned out to be.

We ran it out of The Goat Farm in Atlanta, a sprawl of brick studios and overgrown lots that feels more like a small country than an arts center. Artists worked in public, the stream stayed on, and the audience drifted between rooms both in person and online. I built tools to keep it moving — including a couple of custom robots that roamed with cameras so the broadcast had eyes that wandered the way a curious guest would.

The technical brief was chaos management: many feeds, no rehearsal, everything live. But the real design problem was tone. A livestream of people working is boring unless the framing tells you it is a gift, so we leaned into the warmth and the mess instead of hiding it.

What I keep from it is a belief that process is the most generous thing you can show. The festival became a community, and that community is still the audience I make things for.`,
    image: '/landing/opt/agent3.avif',
  },
  {
    slug: 'lighting-field-kit',
    title: 'Lighting Field Kit',
    subtitle: 'The references, profiles, and cheatsheets I reach for on every load-in.',
    category: 'Resources',
    excerpt:
      'The DMX/sACN references, fixture profiles, and cheatsheets I reach for on every load-in.',
    body: `Every show I do leaves behind the same residue: a folder of fixture profiles, a patch cheatsheet, a diagram of how sACN universes map to the rig. For years I rebuilt that folder from scratch each time, which is a stupid way to lose an afternoon. So I cleaned it up and made it public.

The Field Kit is the stuff I actually use, not a textbook. Pinout diagrams for the connectors that always trip me up. A one-page primer on DMX versus sACN versus Art-Net and when to reach for each. Profiles for the fixtures I rent most. A pre-show checklist that has saved me from at least three on-site disasters.

None of it is proprietary and none of it is precious. It is the kind of knowledge that gets passed around backstage in a hurry, written down so it stops living only in my head and the heads of a few generous people who taught me.

If you light shows, take what is useful and ignore the rest. If you find a mistake — and there will be mistakes — tell me, and I will fix it for the next person who is standing in an empty room at 7am trying to get a rig to talk.`,
    image: '/landing/opt/space-labs.avif',
    dark: true,
  },
  {
    slug: 'reading-list',
    title: 'The Reading List',
    subtitle: 'Books, talks, and essays that shaped how I think about light, code, and craft.',
    category: 'Resources',
    excerpt:
      'Books, talks, and essays that shaped how I think about light, code, and craft.',
    body: `People ask what to read, and I never have a clean answer in the moment, so here is the running list — the things that actually changed how I work, not the ones that look good on a shelf.

It is a mix on purpose. Books on light and perception sit next to talks about software, essays about craft sit next to a few odd manuals and zines. The throughline is not a discipline; it is an attitude. Every entry taught me something about making a thing that respects the person on the other side of it.

I keep it short and I prune it. When something stops feeling true I take it off, which means the list is less a canon and more a snapshot of where my head is right now. Each entry gets a sentence on why it earned a place — what it unlocked, what it argued, what I stole from it.

It is the document I wish someone had handed me when I was starting out and drowning in tutorials. Read slowly, follow the threads that pull at you, and let the rest go.`,
    image: '/landing/opt/img-2808.avif',
  },
  {
    slug: 'the-list',
    title: 'The List',
    subtitle: 'The studio dispatch — new work and half-finished thoughts, sent only when there is something worth showing.',
    category: 'Newsletters',
    excerpt:
      'The studio dispatch — new work and half-finished thoughts, sent only when there is something worth showing.',
    body: `The List is the newsletter version of how I actually work: quietly, in bursts, and only when there is something real to share. No schedule, no growth funnel, no "hey just checking in." It goes out when a project ships, an experiment surprises me, or a thought finally clicks into words.

I started it because the best parts of this practice happen between the public moments — the rig that almost worked, the prototype I scrapped, the question I cannot stop chewing on. Social feeds are a bad place for that. An inbox is patient. It lets me show process without performing it.

So expect new projects and the occasional half-finished thing, written like a note to a friend rather than a brand update. Short most of the time. Honest always. If a month is quiet, that means I had nothing worth your attention, which I think is the whole promise.

No spam, no selling your address, unsubscribe in one click with no hard feelings. If any of the work on this page made you curious, this is how you stay close to what comes next.`,
    image: '/landing/opt/group-5753.avif',
  },
  {
    slug: 'worth-subscribing',
    title: 'Worth Subscribing',
    subtitle: 'The handful of newsletters I actually open — a short, opinionated list.',
    category: 'Newsletters',
    excerpt:
      'The handful of newsletters I actually open — a short, opinionated list.',
    body: `My inbox is a graveyard of newsletters I subscribed to with good intentions and never opened again. This is the opposite list: the few that survived the cull, the ones whose name in the subject line still makes me stop scrolling.

They span the things I care about — light and space, creative technology, the strange edges of design, a couple that are just one person thinking out loud in public and doing it well. What they share is restraint. None of them pad. None of them chase a cadence. Every send earns the open.

I keep this list short on purpose, because a recommendation only means something if it is rare. When I add one it is because it has proven itself over months, and when one starts coasting I drop it. Each entry gets a line on who it is for and why it stuck.

Think of it as the inverse of an algorithm: a small, human, slow-moving set of pointers from someone whose taste you can choose to trust or ignore. Steal the ones that fit, and tell me what I am missing.`,
    image: '/landing/opt/img-7745.avif',
  },
]

export const IDEAS_BY_SLUG: Record<string, Idea> = Object.fromEntries(
  IDEAS.map((idea) => [idea.slug, idea]),
)

/** Rough read time for an idea body — ~200 words/min, floored at 1 minute. */
export function readMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/** The idea that follows `slug` in the list, wrapping around at the end. */
export function nextIdea(slug: string): Idea | null {
  const i = IDEAS.findIndex((idea) => idea.slug === slug)
  if (i === -1) return null
  return IDEAS[(i + 1) % IDEAS.length]
}
