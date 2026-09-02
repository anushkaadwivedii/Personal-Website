export type DistrictId = 'experience' | 'projects' | 'beyond-work' | 'about'

export type CityLink = {
  label: string
  url: string
}

export type CityDestination = {
  id: string
  district: DistrictId
  name: string
  category: string
  description: string
  color: string
  buildingPosition: [number, number, number]
  buildingScale: [number, number, number]
  entrancePosition: [number, number, number]
  metric?: string
  metricLabel?: string
  skills?: string[]
  links?: CityLink[]
}

export const districtDefinitions = [
  {
    id: 'experience' as const,
    name: 'Experience District',
    description: 'Work, research, and mentorship',
    position: [-11, 7, -18] as [number, number, number],
  },
  {
    id: 'projects' as const,
    name: 'Projects District',
    description: 'AI, full stack, data, and systems',
    position: [11, 7, -18] as [number, number, number],
  },
  {
    id: 'beyond-work' as const,
    name: 'Hobbies District',
    description: 'Hobbies and places worth discovering',
    position: [-11, 7, 18] as [number, number, number],
  },
  {
    id: 'about' as const,
    name: 'About District',
    description: 'My introduction, résumé, and contact links',
    position: [11, 7, 18] as [number, number, number],
  },
]

export const cityDestinations: CityDestination[] = [
  {
    id: 'pmt-college',
    district: 'experience',
    name: 'PMT College',
    category: 'Software engineering internship',
    description:
      'I built production assessment workflows in Angular and TypeScript, connected them to .NET APIs, and helped reduce API latency by 25%.',
    color: '#59452c',
    buildingPosition: [-31.5, 3.5, -31.5],
    buildingScale: [12, 7, 12],
    entrancePosition: [-31.5, 0, -24.2],
    metric: '25%',
    metricLabel: 'reduction in API latency',
    skills: ['Angular', 'TypeScript', '.NET', 'REST APIs'],
  },
  {
    id: 'uw-research',
    district: 'experience',
    name: 'UW Research Lab',
    category: 'Undergraduate research',
    description:
      'I built a modular Python and language-model pipeline for extracting and classifying learning objectives from university course materials.',
    color: '#655134',
    buildingPosition: [-10.5, 4.8, -31.5],
    buildingScale: [12, 9.6, 12],
    entrancePosition: [-10.5, 0, -24.2],
    metric: '80%',
    metricLabel: 'classification improvement',
    skills: ['Python', 'LangChain', 'Llama', 'LLMs'],
  },
  {
    id: 'peer-mentor',
    district: 'experience',
    name: 'Peer Mentor Center',
    category: 'Academic mentoring',
    description:
      'I mentored students one on one in computer science and mathematics, adapting explanations to how each student understood the material.',
    color: '#4f402d',
    buildingPosition: [-31.5, 2.8, -10.5],
    buildingScale: [12, 5.6, 12],
    entrancePosition: [-24.2, 0, -10.5],
    metric: '9 months',
    metricLabel: 'of individual mentoring',
    skills: ['Mentoring', 'Computer Science', 'Mathematics', 'Communication'],
  },
  {
    id: 'resonance',
    district: 'projects',
    name: 'Resonance',
    category: 'Music + search',
    description:
      'A music discovery engine for finding songs by mood, context, sound, and lyrical themes.',
    color: '#174657',
    buildingPosition: [7, 4.8, -31.5],
    buildingScale: [6, 9.6, 12],
    entrancePosition: [7, 0, -24.2],
    metric: '89,740',
    metricLabel: 'songs indexed',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'LLMs'],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/resonance-music-intelligence',
      },
    ],
  },
  {
    id: 'codepilot',
    district: 'projects',
    name: 'CodePilot',
    category: 'AI agents',
    description:
      'A coding agent that can understand an unfamiliar repository, plan a change, edit multiple files, and test its own work.',
    color: '#1b5362',
    buildingPosition: [14.5, 3.7, -31.5],
    buildingScale: [6, 7.4, 12],
    entrancePosition: [14.5, 0, -24.2],
    metric: '6 stages',
    metricLabel: 'in the agent workflow',
    skills: ['Python', 'LangGraph', 'FAISS', 'RAG', 'Pytest'],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/codepilot',
      },
    ],
  },
  {
    id: 'clinical-analytics',
    district: 'projects',
    name: 'Clinical Analytics',
    category: 'Data + health',
    description:
      'A full stack dashboard for exploring immune cell populations and treatment response in clinical trial data.',
    color: '#154958',
    buildingPosition: [28, 4.2, -31.5],
    buildingScale: [6, 8.4, 12],
    entrancePosition: [28, 0, -24.2],
    metric: '52,500',
    metricLabel: 'measurements analyzed',
    skills: ['React', 'TypeScript', 'FastAPI', 'SQLite', 'Python'],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/teiko-immune-response-explorer',
      },
    ],
  },
  {
    id: 'ledgerpilot',
    district: 'projects',
    name: 'LedgerPilot',
    category: 'AI + fintech',
    description:
      'An agent that operates legacy banking software and turns successful interactions into reusable automations.',
    color: '#1a5764',
    buildingPosition: [35.5, 3.4, -31.5],
    buildingScale: [6, 6.8, 12],
    entrancePosition: [35.5, 0, -24.2],
    metric: 'Model free',
    metricLabel: 'replay after a successful run',
    skills: ['TypeScript', 'Playwright', 'Zod', 'LLMs', 'Automation'],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/ledgerpilot',
      },
    ],
  },
  {
    id: 'market-data-engine',
    district: 'projects',
    name: 'Market Data Engine',
    category: 'Systems + fintech',
    description:
      'A C++ market data engine built to remain correct when network messages arrive late, out of order, or not at all.',
    color: '#183f55',
    buildingPosition: [7, 3.8, -10.5],
    buildingScale: [6, 7.6, 12],
    entrancePosition: [7, 0, -3.2],
    metric: '7.7M',
    metricLabel: 'events processed per second',
    skills: ['C++20', 'UDP', 'Multithreading', 'CMake', 'Linux'],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/resilient-market-data-engine',
      },
    ],
  },
  {
    id: 'cozy-corner-project',
    district: 'projects',
    name: "Anushka's Cozy Corner",
    category: 'Full stack project',
    description:
      'A full stack ecommerce website built around one of my favorite hobbies: crochet.',
    color: '#22566a',
    buildingPosition: [14.5, 2.9, -10.5],
    buildingScale: [6, 5.8, 12],
    entrancePosition: [14.5, 0, -3.2],
    metric: '9 views',
    metricLabel: 'across the application',
    skills: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB'],
    links: [
      {
        label: 'View website',
        url: 'https://anushkaadwivedii.github.io/crochet-frontend/',
      },
    ],
  },
  {
    id: 'crochet-shop',
    district: 'beyond-work',
    name: 'Crochet Shop',
    category: 'Crocheting',
    description:
      'I mostly make plushies and tapestries, usually as gifts for people.',
    color: '#63334f',
    buildingPosition: [-7, 3.2, 31.5],
    buildingScale: [6, 6.4, 12],
    entrancePosition: [-7, 0, 24.2],
    links: [
      {
        label: 'Visit my crochet shop',
        url: 'https://anushkaadwivedii.github.io/crochet-frontend/',
      },
    ],
  },
  {
    id: 'library',
    district: 'beyond-work',
    name: 'After Hours Library',
    category: 'Reading',
    description:
      'I read whenever I get the time, especially when I need a break from being on my laptop.',
    color: '#5a3850',
    buildingPosition: [-14.5, 4.2, 31.5],
    buildingScale: [6, 8.4, 12],
    entrancePosition: [-14.5, 0, 24.2],
  },
  {
    id: 'cycle-hub',
    district: 'beyond-work',
    name: 'Cycle Hub',
    category: 'Cycling',
    description:
      'I like going on long bike rides and using them as an excuse to explore somewhere new.',
    color: '#6b3b56',
    buildingPosition: [-28, 2.6, 31.5],
    buildingScale: [6, 5.2, 12],
    entrancePosition: [-28, 0, 24.2],
  },
  {
    id: 'music-room',
    district: 'beyond-work',
    name: 'Music Room',
    category: 'Ukulele + guitar',
    description:
      'I have been learning to play the ukulele and guitar, mostly through songs I already like.',
    color: '#733f5c',
    buildingPosition: [-35.5, 3.7, 31.5],
    buildingScale: [6, 7.4, 12],
    entrancePosition: [-35.5, 0, 24.2],
  },
  {
    id: 'gym',
    district: 'beyond-work',
    name: 'Gym',
    category: 'Strength training',
    description:
      'I started strength training recently and have really been enjoying it.',
    color: '#5f314b',
    buildingPosition: [-7, 2.8, 10.5],
    buildingScale: [6, 5.6, 12],
    entrancePosition: [-7, 0, 3.2],
  },
  {
    id: 'night-kitchen',
    district: 'beyond-work',
    name: 'Night Kitchen',
    category: 'Cooking',
    description:
      'I enjoy cooking and trying new vegetarian recipes, even when they do not turn out exactly as planned.',
    color: '#70435a',
    buildingPosition: [-14.5, 3.1, 10.5],
    buildingScale: [6, 6.2, 12],
    entrancePosition: [-14.5, 0, 3.2],
  },
  {
    id: 'about-gallery',
    district: 'about',
    name: 'About Gallery',
    category: 'A little about me',
    description:
      'I am a recent UW Madison graduate who builds full stack software across AI, fintech, data, and backend systems.',
    color: '#3d3d68',
    buildingPosition: [10.5, 3.6, 31.5],
    buildingScale: [12, 7.2, 12],
    entrancePosition: [10.5, 0, 24.2],
    skills: ['Computer Science', 'Data Science', 'Business'],
  },
  {
    id: 'graduation-park',
    district: 'about',
    name: 'Graduation Park',
    category: 'UW Madison',
    description:
      'The starting point for my story, featuring my graduation photo and the path that brought me here.',
    color: '#4a456f',
    buildingPosition: [31.5, 1.8, 31.5],
    buildingScale: [12, 3.6, 12],
    entrancePosition: [31.5, 0, 24.2],
  },
  {
    id: 'resume-station',
    district: 'about',
    name: 'Résumé Station',
    category: 'Résumé',
    description:
      'A quick stop for the conventional version of my experience and technical background.',
    color: '#45416e',
    buildingPosition: [10.5, 2.3, 10.5],
    buildingScale: [12, 4.6, 12],
    entrancePosition: [10.5, 0, 3.2],
    links: [{ label: 'Open résumé', url: '/resume.pdf' }],
  },
  {
    id: 'contact-kiosk',
    district: 'about',
    name: 'Contact Kiosk',
    category: 'Find me online',
    description:
      'GitHub, LinkedIn, and email links for continuing the conversation outside the city.',
    color: '#3f476f',
    buildingPosition: [31.5, 2.8, 10.5],
    buildingScale: [12, 5.6, 12],
    entrancePosition: [24.2, 0, 10.5],
    links: [
      { label: 'GitHub', url: 'https://github.com/anushkaadwivedii' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/anushka-dwivedi7/' },
      { label: 'Email me', url: 'mailto:anushkadwivedi71@gmail.com' },
    ],
  },
]
