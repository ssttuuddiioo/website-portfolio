import { defineType } from 'sanity'

export const imageGrid = defineType({
  name: 'imageGrid',
  title: 'Image Grid',
  type: 'object',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      validation: (Rule) => Rule.min(2).max(4),
    },
    {
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4] },
      initialValue: 2,
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
  ],
  preview: {
    select: { images: 'images' },
    prepare({ images }) {
      return {
        title: `Image Grid (${images?.length || 0} images)`,
      }
    },
  },
})
