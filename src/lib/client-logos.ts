/**
 * The clients and partners on the About page, each with a copy of its logo
 * cropped to the artwork (public/logos/clients) and that crop's width over
 * height. The page sizes every mark from its ratio so each covers about the
 * same area: a long wordmark runs short and wide, a square mark stands taller,
 * and the grid reads evenly. The black-on-clear files are turned light by the
 * page.
 */
export interface ClientLogo {
  name: string
  src: string
  ratio: number
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: 'New Museum', src: '/logos/clients/new-museum.svg', ratio: 7.723 },
  { name: 'Intel', src: '/logos/clients/intel.svg', ratio: 2.5 },
  { name: 'Dolby', src: '/logos/clients/dolby.svg', ratio: 1.411 },
  { name: 'AT&T', src: '/logos/clients/atandt.svg', ratio: 1.006 },
  { name: 'HBO', src: '/logos/clients/hbo.svg', ratio: 2.362 },
  { name: 'Netflix', src: '/logos/clients/netflix.svg', ratio: 0.559 },
  { name: 'Google', src: '/logos/clients/google.svg', ratio: 0.975 },
  { name: 'Hypebeast', src: '/logos/clients/hypebeast.png', ratio: 7.742 },
  { name: 'Hope Hydration', src: '/logos/clients/hope.png', ratio: 9.205 },
  { name: 'Audible', src: '/logos/clients/audible.svg', ratio: 1.597 },
  { name: 'Civic', src: '/logos/clients/civic.png', ratio: 1 },
  { name: 'Sony', src: '/logos/clients/sony.svg', ratio: 5.204 },
  { name: 'Invisible North', src: '/logos/clients/invisiblenorth.png', ratio: 1 },
  { name: 'Under Armour', src: '/logos/clients/underarmour.svg', ratio: 1.675 },
  { name: 'Cox', src: '/logos/clients/cox.svg', ratio: 3.131 },
  { name: 'Mercedes-Benz', src: '/logos/clients/mercedes.svg', ratio: 1 },
  { name: 'Michigan Central', src: '/logos/clients/michigan-central.png', ratio: 13.274 },
]
