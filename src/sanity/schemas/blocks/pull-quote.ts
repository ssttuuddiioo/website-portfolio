import { defineType } from 'sanity'

export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull Quote',
  type: 'object',
  fields: [
    {
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
    },
    {
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    },
  ],
  preview: {
    select: { quote: 'quote', attribution: 'attribution' },
    prepare({ quote, attribution }) {
      return {
        title: quote ? `"${quote.substring(0, 60)}..."` : 'Pull Quote',
        subtitle: attribution,
      }
    },
  },
})
