/* ============================================
   GROQ Queries — Studio Studio
   ============================================ */

export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    siteTitle,
    siteDescription,
    heroTagline,
    contactEmail,
    heroMedia{asset->{url}},
    aboutTeaser,
    aboutPhoto{..., asset->{url, metadata{lqip}}},
    services,
    social,
    clientLogos[]{name, logo{asset->{url}}, url},
    featuredProjects[]->{
      _id,
      title,
      slug,
      subtitle,
      client,
      year,
      heroImage{..., asset->{url, metadata{lqip, dimensions}}},
      heroVideo{asset->{url}},
      thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
      category->{title, slug},
      tags,
      role
    }
  }
`

export const FEATURED_PROJECTS_QUERY = `
  *[_type == "project" && featured == true && !hidden] | order(sortOrder asc) {
    _id,
    title,
    slug,
    subtitle,
    client,
    year,
    category->{title, slug},
    heroImage{..., asset->{url, metadata{lqip, dimensions}}},
    heroVideo{asset->{url}},
    thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
    tags,
    role
  }
`

export const PROJECT_INDEX_QUERY = `
  *[_type == "project" && !hidden] | order(sortOrder asc, year desc) {
    _id,
    title,
    slug,
    subtitle,
    client,
    year,
    featured,
    category->{title, slug},
    thumbnail{..., asset->{url, metadata{lqip, dimensions}}},
    heroImage{..., asset->{url, metadata{lqip, dimensions}}},
    tags,
    role
  }
`

export const PROJECT_DETAIL_QUERY = `
  *[_type == "project" && slug.current == $slug][0] {
    ...,
    category->{title, slug},
    seo{..., ogImage{..., asset->{url, metadata{lqip, dimensions}}}},
    relatedProjects[]->{
      _id,
      title,
      slug,
      thumbnail{..., asset->{url, metadata{lqip}}}
    },
    body[]{
      ...,
      _type == "imageBlock" => {
        image{..., asset->{url, metadata{lqip, dimensions}}}
      },
      _type == "imageGrid" => {
        images[]{..., asset->{url, metadata{lqip, dimensions}}}
      },
      _type == "videoFile" => {
        file{asset->{url}},
        poster{asset->{url}}
      },
    },
    "nextProject": *[_type == "project" && !hidden && sortOrder > ^.sortOrder] | order(sortOrder asc) [0] {
      title,
      slug,
      thumbnail{..., asset->{url, metadata{lqip}}}
    }
  }
`

export const EXPERIMENTS_QUERY = `
  *[_type == "experiment"] | order(sortOrder asc, year desc) {
    _id,
    title,
    slug,
    description,
    techStack,
    status,
    year,
    heroImage{..., asset->{url, metadata{lqip, dimensions}}},
    liveUrl,
    githubUrl
  }
`

export const PROJECT_SLUGS_QUERY = `
  *[_type == "project" && !hidden]{
    "slug": slug.current
  }
`

export const SITE_SETTINGS_ORG_QUERY = `
  *[_type == "siteSettings"][0] {
    orgName,
    orgAlternateName,
    orgDescription,
    logo{..., asset->{url}},
    address,
    memberOf,
    knowsAbout,
    sameAs,
    founder->{
      _id,
      name,
      jobTitle,
      url,
      bio,
      socials
    }
  }
`
