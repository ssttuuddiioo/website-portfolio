import { defineType } from 'sanity'

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'jobTitle',
      title: 'Job title',
      type: 'string',
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Canonical external URL (e.g. yopablo.com)',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      description: 'Long-form bio — reused on /about later.',
    },
    {
      name: 'socials',
      title: 'Socials',
      type: 'array',
      of: [{ type: 'url' }],
      description: 'External profile URLs — feeds JSON-LD sameAs.',
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'jobTitle' },
  },
})
