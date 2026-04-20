import { defineType, type SlugValue } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    /* Identity */
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) =>
        Rule.required().custom((slug: SlugValue | undefined) => {
          const reserved = ['about', 'contact', 'services', 'experiments', 'work', 'studio', 'api']
          if (slug?.current && reserved.includes(slug.current)) {
            return `"${slug.current}" is a reserved route — choose a different slug`
          }
          return true
        }),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'One-line description',
    },

    /* Classification */
    {
      name: 'client',
      title: 'Client',
      type: 'string',
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'LED, TouchDesigner, interactive, public art, etc.',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Creative Director, Lead Developer, Artist, etc.',
    },

    /* Media */
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    },
    {
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description: 'Takes precedence over heroImage',
    },
    {
      name: 'heroVideoUrl',
      title: 'Hero Video URL',
      type: 'url',
      description: 'Vimeo/YouTube URL alternative',
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      description: 'Falls back to heroImage if not set',
    },
    {
      name: 'thumbnailVideo',
      title: 'Thumbnail Video',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description: 'Short loop 5-15s, plays on hover/scroll',
    },
    {
      name: 'thumbnailSecondary',
      title: 'Thumbnail Secondary',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
      description: 'Secondary image on hover (optional)',
    },

    /* Content */
    {
      name: 'body',
      title: 'Body',
      type: 'projectContent',
    },

    /* Collaborators */
    {
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'role', type: 'string', title: 'Role' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
          preview: {
            select: { title: 'name', subtitle: 'role' },
          },
        },
      ],
    },

    /* Links */
    {
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
    },
    {
      name: 'caseStudyUrl',
      title: 'Case Study URL',
      type: 'url',
    },

    /* Display Control */
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      initialValue: false,
    },

    /* SEO */
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'client',
      media: 'thumbnail',
      year: 'year',
    },
    prepare({ title, subtitle, media, year }) {
      return {
        title,
        subtitle: [subtitle, year].filter(Boolean).join(' · '),
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Year (Newest)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Title',
      name: 'title',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
