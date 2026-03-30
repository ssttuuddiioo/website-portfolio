import { defineType } from 'sanity'

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video Embed',
  type: 'object',
  fields: [
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Vimeo or YouTube URL',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          { title: '16:9', value: '16:9' },
          { title: '4:3', value: '4:3' },
          { title: '1:1', value: '1:1' },
          { title: '9:16', value: '9:16' },
        ],
      },
      initialValue: '16:9',
    },
  ],
  preview: {
    select: { url: 'url', caption: 'caption' },
    prepare({ url, caption }) {
      return { title: caption || 'Video Embed', subtitle: url }
    },
  },
})
