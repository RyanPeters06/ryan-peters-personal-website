/**
 * Portfolio content as data. Scene code never hardcodes copy — swap
 * the placeholders here for real projects without touching the world.
 */

export interface LocationItem {
  title: string
  description: string
  url?: string
}

export interface WorldLocation {
  id: string
  /** Name shown on the floating card. */
  name: string
  /** Emoji icon centered at the top of the card. */
  icon: string
  /** One-line flavor text under the name. */
  tagline: string
  /** Pastel accent for the pod and card trim. */
  accent: string
  /** Where the pod stands on the planet, in degrees. */
  lat: number
  lon: number
  items: LocationItem[]
}

export const LOCATIONS: WorldLocation[] = [
  {
    id: 'projects',
    name: 'Projects',
    icon: '💻',
    tagline: 'Things I have built',
    accent: '#a9c9e8',
    // Straight ahead of the spawn point — the first stroll finds it.
    lat: 62,
    lon: 0,
    items: [
      {
        title: 'Tiny Planet Portfolio',
        description: 'This world — React Three Fiber, a quad-sphere plaza, and one small resident.',
        url: 'https://github.com/RyanPeters06/ryan-peters-personal-website',
      },
      {
        title: 'Placeholder Project Two',
        description: 'A short description of what it does and what it is built with.',
      },
      {
        title: 'Placeholder Project Three',
        description: 'A short description of what it does and what it is built with.',
      },
    ],
  },
]
