# SANITY_SCHEMA.md — Content Model

## Overview

The CMS should feel invisible. Pablo adds a project, fills in the fields, uploads media, and it appears on the site. No wrestling with layout builders or drag-and-drop widgets.

All schemas are defined in TypeScript using Sanity v3's `defineType` / `defineField` API.

---

## Document Types

### 1. `project`

The core content type. Every piece of work — commercial, art, or experimental — lives here.

```typescript
defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    // Identity
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'subtitle', type: 'string', description: 'One-line description' },

    // Classification
    { name: 'client', type: 'string', description: 'Client or commissioner. Leave blank for personal work.' },
    { name: 'year', type: 'number' },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'tags', type: 'array', of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Technologies, mediums, keywords (e.g., LED, TouchDesigner, interactive, public art)'
    },

    // Role
    { name: 'role', type: 'string',
      description: 'Your role on this project (e.g., Creative Director, Lead Developer, Artist)'
    },

    // Media
    { name: 'heroImage', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }]
    },
    { name: 'heroVideo', type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description: 'Optional hero video. Takes precedence over heroImage when present.'
    },
    { name: 'heroVideoUrl', type: 'url',
      description: 'Alternative: Vimeo/YouTube URL for hero video'
    },
    { name: 'thumbnail', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }],
      description: 'Grid thumbnail. Falls back to heroImage if not set.'
    },
    { name: 'thumbnailVideo', type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description: 'Short video loop for grid thumbnail (5-15s). Plays on hover or scroll-into-view.'
    },
    { name: 'thumbnailSecondary', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }],
      description: 'Secondary image revealed on hover (à la Republik dual-image pattern). Optional.'
    },

    // Body
    { name: 'body', type: 'projectContent',
      description: 'Full project content — mix of text, images, video, and custom blocks'
    },

    // Collaborators
    { name: 'collaborators', type: 'array', of: [{
      type: 'object',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'url', type: 'url' },
      ]
    }]},

    // Links
    { name: 'projectUrl', type: 'url', description: 'Live project link' },
    { name: 'caseStudyUrl', type: 'url', description: 'External case study or press link' },

    // Display Control
    { name: 'featured', type: 'boolean', initialValue: false,
      description: 'Show in featured section on homepage'
    },
    { name: 'sortOrder', type: 'number', initialValue: 0,
      description: 'Lower numbers appear first in grids'
    },
    { name: 'hidden', type: 'boolean', initialValue: false,
      description: 'Hide from public site (draft/archived)'
    },

    // SEO
    { name: 'seoDescription', type: 'text', rows: 3,
      description: 'Custom meta description. Falls back to subtitle.'
    },
    { name: 'ogImage', type: 'image',
      description: 'Custom OpenGraph image. Falls back to heroImage.'
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
    }
  },

  orderings: [
    { title: 'Sort Order', name: 'sortOrder', by: [{ field: 'sortOrder', direction: 'asc' }] },
    { title: 'Year (Newest)', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] },
    { title: 'Title', name: 'title', by: [{ field: 'title', direction: 'asc' }] },
  ],
})
```

### 2. `experiment`

Lab projects, side projects, tools. Lighter than a full project — no case study body, just a description and links.

```typescript
defineType({
  name: 'experiment',
  title: 'Experiment',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text', rows: 4 },
    { name: 'techStack', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } },
    { name: 'status', type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' },
          { title: 'Concept', value: 'concept' },
          { title: 'In Progress', value: 'in-progress' },
        ]
      }
    },
    { name: 'heroImage', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    },
    { name: 'liveUrl', type: 'url' },
    { name: 'githubUrl', type: 'url' },
    { name: 'year', type: 'number' },
    { name: 'sortOrder', type: 'number', initialValue: 0 },
  ],

  preview: {
    select: { title: 'title', subtitle: 'status', media: 'heroImage' },
  },
})
```

### 3. `category`

Project categories for filtering.

```typescript
defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text', rows: 2 },
    { name: 'sortOrder', type: 'number', initialValue: 0 },
  ],
})
```

**Default categories to create:**
- Commercial (client-commissioned work)
- Art (personal installations, gallery work)
- Lighting (LED systems, pixel mapping, DMX)
- Software (custom apps, kiosks, tools)
- Experiments (lab projects, prototypes)

### 4. `page`

Generic content pages (About, Services).

```typescript
defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'body', type: 'pageContent' },
    { name: 'seoDescription', type: 'text', rows: 3 },
    { name: 'ogImage', type: 'image' },
  ],
})
```

### 5. `siteSettings`

Singleton document for global configuration.

```typescript
defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'siteTitle', type: 'string', initialValue: 'Studio Studio' },
    { name: 'siteDescription', type: 'text', rows: 3 },
    { name: 'contactEmail', type: 'string' },
    { name: 'heroMedia', type: 'file', description: 'Homepage hero video or image' },
    { name: 'heroTagline', type: 'string', description: 'Homepage hero text' },

    // Featured projects (ordered references)
    { name: 'featuredProjects', type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      description: 'Projects shown in homepage featured section. Order matters.',
      validation: Rule => Rule.max(6),
    },

    // Services list
    { name: 'services', type: 'array', of: [{ type: 'string' }],
      description: 'Service labels for the homepage strip',
      initialValue: [
        'Experiential Direction',
        'Lighting Design',
        'Custom Software',
        'Creative Technology',
        'Motion Design',
        'Consulting',
        'Mentoring',
      ]
    },

    // Social
    { name: 'social', type: 'object', fields: [
      { name: 'instagram', type: 'url' },
      { name: 'vimeo', type: 'url' },
      { name: 'github', type: 'url' },
      { name: 'linkedin', type: 'url' },
    ]},

    // Client logos (for homepage strip)
    { name: 'clientLogos', type: 'array', of: [{
      type: 'object',
      fields: [
        { name: 'name', type: 'string', description: 'Client name (for alt text)' },
        { name: 'logo', type: 'image', description: 'White/monochrome SVG or PNG logo' },
        { name: 'url', type: 'url', description: 'Optional link to client site' },
      ]
    }], description: 'Client logos for horizontal scroll strip on homepage' },

    // About (for homepage teaser)
    { name: 'aboutTeaser', type: 'text', rows: 4,
      description: 'Short bio paragraph for homepage about section'
    },
    { name: 'aboutPhoto', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    },
  ],
})
```

---

## Custom Block Types (Portable Text)

### `projectContent`

Rich text type used in project body fields.

```typescript
defineType({
  name: 'projectContent',
  title: 'Project Content',
  type: 'array',
  of: [
    // Standard blocks
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            fields: [
              { name: 'href', type: 'url' },
              { name: 'external', type: 'boolean', initialValue: true },
            ],
          },
        ],
      },
    },

    // Custom blocks
    { type: 'imageBlock' },
    { type: 'imageGrid' },
    { type: 'videoEmbed' },
    { type: 'videoFile' },
    { type: 'pullQuote' },
    { type: 'techStackBlock' },
  ],
})
```

### `imageBlock`

Single image, full-bleed or contained.

```typescript
defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    { name: 'image', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    },
    { name: 'caption', type: 'string' },
    { name: 'layout', type: 'string',
      options: { list: ['contained', 'full-bleed', 'left-half', 'right-half'] },
      initialValue: 'contained'
    },
  ],
  preview: {
    select: { media: 'image', title: 'caption' },
    prepare({ media, title }) {
      return { title: title || 'Image', media }
    }
  },
})
```

### `imageGrid`

2-4 images in a responsive grid.

```typescript
defineType({
  name: 'imageGrid',
  title: 'Image Grid',
  type: 'object',
  fields: [
    { name: 'images', type: 'array', of: [{
      type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }]
    }], validation: Rule => Rule.min(2).max(4) },
    { name: 'columns', type: 'number',
      options: { list: [2, 3, 4] },
      initialValue: 2
    },
    { name: 'caption', type: 'string' },
  ],
})
```

### `videoEmbed`

YouTube or Vimeo embed.

```typescript
defineType({
  name: 'videoEmbed',
  title: 'Video Embed',
  type: 'object',
  fields: [
    { name: 'url', type: 'url', validation: Rule => Rule.required() },
    { name: 'caption', type: 'string' },
    { name: 'aspectRatio', type: 'string',
      options: { list: ['16:9', '4:3', '1:1', '9:16'] },
      initialValue: '16:9'
    },
  ],
})
```

### `videoFile`

Self-hosted video.

```typescript
defineType({
  name: 'videoFile',
  title: 'Video File',
  type: 'object',
  fields: [
    { name: 'file', type: 'file', options: { accept: 'video/mp4,video/webm' } },
    { name: 'poster', type: 'image' },
    { name: 'caption', type: 'string' },
    { name: 'autoplay', type: 'boolean', initialValue: true,
      description: 'Autoplay muted on scroll-into-view'
    },
    { name: 'loop', type: 'boolean', initialValue: true },
  ],
})
```

### `pullQuote`

Styled quote block.

```typescript
defineType({
  name: 'pullQuote',
  title: 'Pull Quote',
  type: 'object',
  fields: [
    { name: 'quote', type: 'text', rows: 3 },
    { name: 'attribution', type: 'string' },
  ],
})
```

### `techStackBlock`

Visual display of technologies used.

```typescript
defineType({
  name: 'techStackBlock',
  title: 'Tech Stack',
  type: 'object',
  fields: [
    { name: 'technologies', type: 'array', of: [{
      type: 'object',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'category', type: 'string',
          options: { list: ['Hardware', 'Software', 'Framework', 'Language', 'Platform'] }
        },
      ]
    }]},
  ],
})
```

---

## GROQ Queries

### Homepage

```groq
// Featured projects
*[_type == "project" && featured == true && !hidden] | order(sortOrder asc) {
  _id, title, slug, subtitle, client, year, category->{title, slug},
  heroImage{..., asset->{url, metadata{lqip, dimensions}}},
  heroVideo{asset->{url}},
  thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
  tags, role
}

// Site settings
*[_type == "siteSettings"][0] {
  siteTitle, siteDescription, heroTagline, contactEmail,
  heroMedia{asset->{url}},
  aboutTeaser, aboutPhoto{..., asset->{url, metadata{lqip}}},
  services, social,
  featuredProjects[]->{
    _id, title, slug, subtitle, client, year,
    heroImage{..., asset->{url, metadata{lqip, dimensions}}},
    thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
    category->{title, slug}, tags
  }
}
```

### Project Index

```groq
*[_type == "project" && !hidden] | order(sortOrder asc, year desc) {
  _id, title, slug, subtitle, client, year, featured,
  category->{title, slug},
  thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
  heroImage{..., asset->{url, metadata{lqip, dimensions}}},
  tags, role
}
```

### Single Project

```groq
*[_type == "project" && slug.current == $slug][0] {
  ...,
  category->{title, slug},
  body[]{
    ...,
    _type == "imageBlock" => { image{..., asset->{url, metadata{lqip, dimensions}}} },
    _type == "imageGrid" => { images[]{..., asset->{url, metadata{lqip, dimensions}}} },
    _type == "videoFile" => { file{asset->{url}}, poster{asset->{url}} },
  },
  "nextProject": *[_type == "project" && !hidden && sortOrder > ^.sortOrder] | order(sortOrder asc) [0] {
    title, slug, thumbnail{..., asset->{url, metadata{lqip}}}
  }
}
```

### Experiments

```groq
*[_type == "experiment"] | order(sortOrder asc, year desc) {
  _id, title, slug, description, techStack, status, year,
  heroImage{..., asset->{url, metadata{lqip, dimensions}}},
  liveUrl, githubUrl
}
```
