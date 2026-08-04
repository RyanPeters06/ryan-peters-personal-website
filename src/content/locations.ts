/**
 * Portfolio content as data. Scene code never hardcodes copy — this is
 * the only file that changes when the content does.
 *
 * Placement: the six landmarks fan in a gentle horseshoe around the
 * plaza's fountain (the island's center), opening toward the fixed
 * tableau camera on +Z. Screen left→right = About … Resume, per the
 * reference. Flat XZ world units, no curvature. Accents come from
 * DESIGN_SYSTEM §8.
 *
 * Keep item lists to ~5 and descriptions to a line or two: `LocationCard`
 * is a floating card, not a page, and on a phone it is height-capped with
 * internal scroll. Titles carrying a `url` render as links with a ↗.
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
    x: -7.592,
    z: -1.054,
    treeVariant: 'pink',
    items: [
      {
        title: 'Hi, I’m Ryan',
        description:
          'Computer Science student at Western University and an aspiring software engineer. I like building things people actually use — and occasionally a tiny world like this one.',
      },
      {
        title: 'Western University — B.S. Computer Science',
        description:
          'Honours Specialization, minor in Software Engineering. Expected May 2028. GPA 3.8 / 4.0, Dean’s Honour List.',
      },
      {
        title: 'What I’m into',
        description:
          'Practical AI — RAG pipelines, agent tooling, and shipping full-stack apps end to end. Most of my work starts as a real problem someone had.',
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '</>',
    tagline: 'Things I have built',
    accent: '#a9c9e8',
    x: -6.078,
    z: -5.554,
    treeVariant: 'green',
    items: [
      {
        title: 'BrainReps',
        description:
          'Cognitive training platform with streak-based engagement. Next.js, TypeScript, Supabase, and row-level security on Postgres.',
        url: 'https://brainreps.fit',
      },
      {
        title: 'Dr. Maple',
        description:
          'AI healthcare triage agent with voice interaction. A multi-model fallback pipeline cut token usage 75%. Hack Canada 2026.',
        url: 'https://github.com/RyanPeters06/dr-maple',
      },
      {
        title: 'RAG Model Comparator',
        description:
          'Desktop tool that queries 16 AI models at once, grounded in your own manuals, and compares cost and accuracy side by side.',
        url: 'https://github.com/RyanPeters06/rag-model-comparator',
      },
      {
        title: 'Clearwater Care',
        description:
          'Healthcare coordination for a town of 1,800, built solo in 38 hours. Risk-scoring across 5+ clinical factors, live.',
        url: 'https://github.com/RyanPeters06/clearwater-care',
      },
      {
        title: 'Ryan Land',
        description:
          'This world. React Three Fiber, a hand-built plaza, and one small guy in a suit.',
        url: 'https://github.com/RyanPeters06/ryan-peters-personal-website',
      },
    ],
  },
  {
    id: 'experience',
    name: 'Experience',
    icon: '💼',
    tagline: 'Where I have worked',
    accent: '#b8e6c9',
    x: -2.376,
    z: -8.532,
    treeVariant: 'green',
    items: [
      {
        title: 'RBC — Software Engineer Intern',
        description:
          'Incoming Fall 2026, Toronto. Joining the Full Stack Development team.',
      },
      {
        title: 'Royal Containers — AI Implementation Engineer Intern',
        description:
          'May 2026 – Present. Built a production RAG chatbot on the Claude API so employees can query machine manuals in plain language, and benchmarked self-hosted LLMs against cloud APIs to settle the architecture.',
      },
      {
        title: 'Citi — Early ID Program, Software Engineering',
        description:
          'Mar – Apr 2026, Mississauga. One of ~50 CS students chosen from an international pool. Containerized microservice deployments with Docker on Linux.',
      },
      {
        title: 'Royal Containers — Software Engineer Intern',
        description:
          'May – Aug 2025. Python/Flask notification system for 400+ users across 2 plants — full supervisor adoption, 300+ monthly requests, 80% less downtime.',
      },
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: '⚙️',
    tagline: 'What I work with',
    accent: '#f2d38f',
    x: 2.376,
    z: -8.532,
    treeVariant: 'green',
    items: [
      {
        title: 'AI / ML',
        description:
          'Claude API, Claude Code, Cursor, RAG, Google Gemini, Ollama, LM Studio, prompt engineering.',
      },
      {
        title: 'Languages',
        description: 'Python, TypeScript, JavaScript, Java, C/C++, HTML/CSS.',
      },
      {
        title: 'Frameworks & Libraries',
        description:
          'React, Next.js, Node.js, Flask, TailwindCSS, Vite, Pandas, Tkinter, REST APIs.',
      },
      {
        title: 'Databases & Tools',
        description:
          'PostgreSQL, Supabase, Firebase, SQL, Git, GitHub, Docker, Vercel, VS Code.',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '💬',
    tagline: 'Say hello',
    accent: '#f2b8c6',
    x: 6.078,
    z: -5.554,
    treeVariant: 'green',
    items: [
      {
        title: 'petersryan006@gmail.com',
        description: 'The fastest way to reach me.',
        url: 'mailto:petersryan006@gmail.com',
      },
      {
        title: 'LinkedIn',
        description: 'The long-form version — roles, education, and updates.',
        url: 'https://linkedin.com/in/ryan-peters-14691a375',
      },
      {
        title: 'GitHub',
        description: 'Everything I build in public lives here.',
        url: 'https://github.com/RyanPeters06',
      },
    ],
  },
  {
    id: 'resume',
    name: 'Resume',
    icon: '📄',
    tagline: 'The short version',
    accent: '#a8dde0',
    x: 7.592,
    z: -1.054,
    treeVariant: 'pink',
    items: [
      {
        title: 'Education',
        description:
          'Western University — B.S. Computer Science, Honours Specialization, minor in Software Engineering. Expected May 2028. GPA 3.8 / 4.0, Dean’s Honour List.',
      },
      {
        title: 'Coursework',
        description:
          'Data Structures & Algorithms, Software Engineering, Computer Organization, Systems Programming, Data Science, Statistics, Discrete Math.',
      },
      {
        title: 'Leadership',
        description:
          'Western Developers Society, 2025 – Present. Won Best Overall Project among 10 teams for a fitness management app.',
      },
      {
        title: 'Full resume on LinkedIn',
        description:
          'The complete history, kept current.',
        url: 'https://linkedin.com/in/ryan-peters-14691a375',
      },
    ],
  },
]
