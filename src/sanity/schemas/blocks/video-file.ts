import { defineType } from 'sanity'

export const videoFile = defineType({
  name: 'videoFile',
  title: 'Video File',
  type: 'object',
  fields: [
    {
      name: 'file',
      title: 'Video File',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
    },
    {
      name: 'poster',
      title: 'Poster Image',
      type: 'image',
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'loop',
      title: 'Loop',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: { caption: 'caption' },
    prepare({ caption }) {
      return { title: caption || 'Video File' }
    },
  },
})
