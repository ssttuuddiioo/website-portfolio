import type { JsonLdObject } from './jsonld'

interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[]
}

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Each schema gets its own tag so tooling (Google Rich Results Test,
          // schema.org validator) can report per-schema errors independently.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
