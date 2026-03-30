import { project } from './project'
import { experiment } from './experiment'
import { category } from './category'
import { page } from './page'
import { siteSettings } from './site-settings'
import { imageBlock } from './blocks/image-block'
import { imageGrid } from './blocks/image-grid'
import { videoEmbed } from './blocks/video-embed'
import { videoFile } from './blocks/video-file'
import { pullQuote } from './blocks/pull-quote'
import { techStackBlock } from './blocks/tech-stack-block'
import { projectContent } from './blocks/project-content'

export const schemaTypes = [
  // Documents
  project,
  experiment,
  category,
  page,
  siteSettings,
  // Block types
  imageBlock,
  imageGrid,
  videoEmbed,
  videoFile,
  pullQuote,
  techStackBlock,
  projectContent,
]
