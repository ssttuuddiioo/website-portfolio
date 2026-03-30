import { defineType } from 'sanity'

export const projectContent = defineType({
  name: 'projectContent',
  title: 'Project Content',
  type: 'array',
  of: [
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
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              {
                name: 'external',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: true,
              },
            ],
          },
        ],
      },
    },
    { type: 'imageBlock' },
    { type: 'imageGrid' },
    { type: 'videoEmbed' },
    { type: 'videoFile' },
    { type: 'pullQuote' },
    { type: 'techStackBlock' },
  ],
})
