/**
 * Portfolio content as data. Scene code never hardcodes copy — swap
 * the placeholders here for real content without touching the world.
 *
 * Placement: the six landmarks fan in a gentle horseshoe around the
 * plaza's fountain (the planet's crown), opening toward the fixed
 * tableau camera on lon 0. Screen left→right = About … Resume, per
 * the reference. Accents come from DESIGN_SYSTEM §8.
 */

export interface LocationItem {
  title: string
  description: string
  url?: string
}

export interface WorldLocation {
  id: string
  /** Name shown on the monument and the floating card. */
  name: string
  /** Icon centered at the top of the card. */
  icon: string
  /** One-line flavor text under the name. */
  tagline: string
  /** Pastel accent for the monument and card trim. */
  accent: string
  /** Where the monument stands on the planet, in degrees. */
  lat: number
  lon: number
  items: LocationItem[]
}

export const LOCATIONS: WorldLocation[] = [
  {
    id: 'about',
    name: 'About',
    icon: '👤',
    tagline: 'Who I am',
    accent: '#cdb9ea',
    lat: 73.8,
    lon: -98,
    items: [
      {
        title: 'Hi, I’m Ryan',
        description:
          'CS student and aspiring software engineer. Placeholder — a short friendly bio goes here.',
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '</>',
    tagline: 'Things I have built',
    accent: '#a9c9e8',
    lat: 72.2,
    lon: -136,
    items: [
      {
        title: 'Ryan’s Planet',
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
  {
    id: 'experience',
    name: 'Experience',
    icon: '💼',
    tagline: 'Where I have worked',
    accent: '#b8e6c9',
    lat: 71.4,
    lon: -163,
    items: [
      {
        title: 'Placeholder Role — Company',
        description: 'Summer 20XX. A line about what was built and shipped.',
      },
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: '⚙️',
    tagline: 'What I work with',
    accent: '#f2d38f',
    lat: 71.4,
    lon: 163,
    items: [
      {
        title: 'Languages & Tools',
        description: 'Placeholder — TypeScript, React, Python, and friends.',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '💬',
    tagline: 'Say hello',
    accent: '#f2b8c6',
    lat: 72.2,
    lon: 136,
    items: [
      {
        title: 'petersryan006@gmail.com',
        description: 'The fastest way to reach me.',
        url: 'mailto:petersryan006@gmail.com',
      },
    ],
  },
  {
    id: 'resume',
    name: 'Resume',
    icon: '📄',
    tagline: 'The paper version',
    accent: '#a8dde0',
    lat: 73.8,
    lon: 98,
    items: [
      {
        title: 'Download Resume',
        description: 'Placeholder — link a PDF here.',
      },
    ],
  },
]
