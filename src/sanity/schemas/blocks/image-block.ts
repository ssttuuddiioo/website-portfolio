import { defineType } from 'sanity'

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' },
      ],
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Contained', value: 'contained' },
          { title: 'Full Bleed', value: 'full-bleed' },
          { title: 'Left Half', value: 'left-half' },
          { title: 'Right Half', value: 'right-half' },
        ],
      },
      initialValue: 'contained',
    },
  ],
  preview: {
    select: { title: 'caption', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Image', media }
    },
  },
})
