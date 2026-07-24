/**
 * Portfolio content as data. Scene code never hardcodes copy — swap
 * the placeholders here for real content without touching the world.
 *
 * Placement: the six landmarks fan in a gentle horseshoe around the
 * plaza's fountain (the island's center), opening toward the fixed
 * tableau camera on +Z. Screen left→right = About … Resume, per the
 * reference. Flat XZ world units, no curvature. Accents come from
 * DESIGN_SYSTEM §8.
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
  /** Where the monument stands on the flat plaza floor, world units. */
  x: number
  z: number
  /** Canopy palette for the pod's flanking trees. */
  treeVariant: 'green' | 'pink'
  items: LocationItem[]
}

export const LOCATIONS: WorldLocation[] = [
  {
    id: 'about',
    name: 'About',
    icon: '👤',
    tagline: 'Who I am',
    accent: '#cdb9ea',
    x: -7.23,
    z: -1.007,
    treeVariant: 'pink',
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
    x: -5.491,
    z: -5.674,
    treeVariant: 'green',
    items: [
      {
        title: 'Ryan Land',
        description: 'This world — React Three Fiber, a hand-tiled floating plaza, and one small resident.',
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
    x: -2.471,
    z: -8.054,
    treeVariant: 'green',
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
    x: 2.471,
    z: -8.054,
    treeVariant: 'green',
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
    x: 5.491,
    z: -5.674,
    treeVariant: 'green',
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
    x: 7.23,
    z: -1.007,
    treeVariant: 'pink',
    items: [
      {
        title: 'Download Resume',
        description: 'Placeholder — link a PDF here.',
      },
    ],
  },
]
