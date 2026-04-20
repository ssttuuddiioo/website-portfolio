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

    /* Organization JSON-LD fields. See docs/CMS_SEED.md for initial values. */
    {
      name: 'orgName',
      title: 'Organization name',
      type: 'string',
      initialValue: 'Studio Studio',
      description: 'JSON-LD Organization.name',
    },
    {
      name: 'orgAlternateName',
      title: 'Organization alternate name',
      type: 'string',
      initialValue: 'Studio Studio NYC',
    },
    {
      name: 'orgDescription',
      title: 'Organization description',
      type: 'text',
      rows: 4,
      initialValue:
        "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers.",
      description: 'Feeds the Organization JSON-LD on every page. Distinct from Site Description (which is for generic meta).',
    },
    {
      name: 'logo',
      title: 'Organization logo',
      type: 'image',
      description: 'Feeds JSON-LD Organization.logo (and any "Powered by" use later).',
    },
    {
      name: 'founder',
      title: 'Founder',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'Feeds Organization.founder in JSON-LD.',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'locality', title: 'Locality (city)', type: 'string' },
        { name: 'region', title: 'Region (state)', type: 'string' },
        { name: 'country', title: 'Country (code)', type: 'string' },
      ],
    },
    {
      name: 'memberOf',
      title: 'Memberships',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
          preview: { select: { title: 'name', subtitle: 'url' } },
        },
      ],
      description: 'e.g. NEW INC, Mana Contemporary. Feeds Organization.memberOf.',
    },
    {
      name: 'knowsAbout',
      title: 'Expertise topics',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Topics/services for Organization.knowsAbout. e.g. "Experiential design", "Lighting design".',
    },
    {
      name: 'sameAs',
      title: 'Canonical external URLs',
      type: 'array',
      of: [{ type: 'url' }],
      description: 'Feeds Organization.sameAs in JSON-LD. Separate from the Social Links object below (which drives the footer).',
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
