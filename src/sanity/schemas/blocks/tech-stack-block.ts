import { defineType } from 'sanity'

export const techStackBlock = defineType({
  name: 'techStackBlock',
  title: 'Tech Stack',
  type: 'object',
  fields: [
    {
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Name' },
            {
              name: 'category',
              type: 'string',
              title: 'Category',
              options: {
                list: [
                  { title: 'Hardware', value: 'Hardware' },
                  { title: 'Software', value: 'Software' },
                  { title: 'Framework', value: 'Framework' },
                  { title: 'Language', value: 'Language' },
                  { title: 'Platform', value: 'Platform' },
                ],
              },
            },
          ],
          preview: {
            select: { title: 'name', subtitle: 'category' },
          },
        },
      ],
    },
  ],
  preview: {
    select: { technologies: 'technologies' },
    prepare({ technologies }) {
      return {
        title: `Tech Stack (${technologies?.length || 0} items)`,
      }
    },
  },
})
