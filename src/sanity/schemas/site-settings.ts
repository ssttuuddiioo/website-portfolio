import { defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      initialValue: 'Studio Studio',
    },
    {
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'heroMedia',
      title: 'Homepage Hero Media',
      type: 'file',
      description: 'Homepage hero video or image',
    },
    {
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
    },
    {
      name: 'featuredProjects',
      title: 'Featured Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      validation: (Rule) => Rule.max(6),
    },
    {
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: [
        'Experiential Direction',
        'Lighting Design',
        'Custom Software',
        'Creative Technology',
        'Motion Design',
        'Consulting',
        'Mentoring',
      ],
    },
    {
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'vimeo', type: 'url', title: 'Vimeo' },
        { name: 'github', type: 'url', title: 'GitHub' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
      ],
    },
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Client Name' },
            { name: 'logo', type: 'image', title: 'Logo' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
          preview: {
            select: { title: 'name', media: 'logo' },
          },
        },
      ],
    },
    {
      name: 'aboutTeaser',
      title: 'About Teaser',
      type: 'text',
      rows: 4,
      description: '3-4 sentences for the homepage about section',
    },
    {
      name: 'aboutPhoto',
      title: 'About Photo',
      type: 'image',
      options: { hotspot: true },
    },
  ],
})
