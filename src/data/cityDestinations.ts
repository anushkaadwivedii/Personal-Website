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
  details?: string[]
  context?: string
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
    details: [
      'I worked on a production testing platform used by more than 300 students. I built parts of the assessment experience in Angular and TypeScript, including timed tests, question navigation, answer saving, and submission workflows connected to .NET APIs.',
      'I also investigated slow API calls by tracing requests from the frontend through the backend and identifying where they were getting held up. The fixes reduced API latency by 25%. Alongside development, I participated in code reviews and tested components before releases.',
    ],
    context: 'JUN — AUG 2025 · Software Development Engineer Intern · Lucknow, India',
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
    details: [
      'I worked on a research project that used language models to extract and classify learning objectives from university course materials. I built a modular Python pipeline with more than 10 components for preprocessing, extraction, classification, and evaluation.',
      'A large part of the work involved experimentation. I compared prompt designs and input configurations, examined where the model was making mistakes, and adjusted the pipeline based on those results. This improved classification accuracy by 80%.',
    ],
    context: 'SEP 2025 — MAY 2026 · Undergraduate Student Researcher · Madison, Wisconsin',
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
    details: [
      'I met one on one with students taking computer science and math courses, helping them work through topics such as recursion, object oriented programming, and algorithm design.',
      'Every student understood material differently, so I learned to change how I explained a concept instead of repeating the same answer. We broke down assignments, traced through code together, and focused on helping students understand how to approach the next problem independently.',
    ],
    context: 'SEP 2025 — MAY 2026 · Academic Peer Mentor · Madison, Wisconsin',
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
    details: [
      'I built Resonance because I wanted music search to understand the way people actually talk about music. Instead of requiring someone to choose a genre or artist, it accepts requests based on a feeling, situation, lyrical idea, or combination of details and uses them to find relevant songs.',
      'The system turns each natural language request into structured search criteria, retrieves candidates through three different search channels, and ranks them using eight relevance signals. The catalog contains 89,740 songs with complete sound embedding coverage, allowing the system to consider both musical characteristics and the meaning behind the request.',
      'I also worked on the infrastructure needed to process and search a dataset of that size reliably. I redesigned the embedding representation to reduce input tokens by 41%, from 9.80 million to 5.74 million, and built resumable data pipelines so interrupted jobs could continue without repeating completed work. The backend includes seven database migrations and 54 automated tests covering the search, data processing, and recommendation logic.',
    ],
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
    details: [
      'CodePilot is a repository level coding agent I built to explore how an agent could handle changes across an unfamiliar codebase instead of only generating isolated snippets. Given a request, it analyzes the repository, locates relevant code, creates a plan, generates structured patches, and runs the project’s tests to validate its work.',
      'The workflow is organized into six stages using LangGraph, which made it easier to control how information moves between repository analysis, retrieval, planning, editing, validation, and debugging. I used FAISS for semantic code search so the agent could find relevant files even when the user’s request did not contain the exact identifiers used in the codebase.',
      'I wanted every proposed change to remain reviewable and safe. CodePilot includes path traversal protection, dry run patch previews, structured code editing, and human approval before modifying files. When validation fails, it uses the test output to attempt a bounded repair instead of retrying indefinitely. I tested the system with 35 automated tests, including a multifile change with a twelve test suite and a case where it successfully recovered after one repair attempt.',
    ],
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
    details: [
      'This project began as a technical assignment and grew into a complete analytics workflow covering data ingestion, statistical analysis, an API, and an interactive frontend. The dashboard processes 10,500 patient samples and 52,500 immune cell measurements, giving users a way to explore both individual records and broader patterns in the trial data.',
      'I built a normalized Python pipeline that calculates the relative frequencies of different immune cell populations. For melanoma patients receiving treatment, it compares responders with nonresponders using Mann Whitney U tests, effect sizes, and multiple testing correction. The analysis focuses on PBMC samples and reports the statistical evidence behind each result instead of only displaying a visual difference.',
      'The frontend was built with React and TypeScript, while FastAPI provides the backend API and SQLite stores the processed data. I added validation throughout the pipeline to catch malformed or inconsistent records before analysis. The project also includes 14 unit and integration tests, GitHub Actions continuous integration, and a reproducible setup for running the data pipeline, analysis, API, and dashboard.',
    ],
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
    details: [
      'LedgerPilot began as a technical challenge involving computer use in legacy financial software. The agent can observe an interface, complete a task, and turn the successful interaction into a typed and versioned automation capability that can be reused later.',
      'The first execution uses an AI model to understand and operate the interface. Once the task succeeds, LedgerPilot stores the important actions and element locators so later runs can replay the same capability without calling the model again. The replay system uses ranked locators, checkpoints, and bounded retries to handle small changes in the interface without silently performing the wrong action.',
      'I designed the execution system around four possible outcomes: success, business exceptions, recoverable errors, and hard failures. I also added policy guardrails, sensitive data redaction, approval hashing for generated artifacts, and same session human handoff when the automation should not continue independently. The system is covered by 18 unit and browser integration tests across seven test suites.',
    ],
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
    details: [
      'I built this project to understand the systems behind electronic markets and the problems created when market data is delivered over an unreliable network. The engine receives binary UDP messages, validates them, and applies valid events to a price time priority order book.',
      'Because UDP does not guarantee delivery or ordering, the engine tracks message sequence numbers and detects gaps as soon as they appear. It can request missed messages through replay, recover from a full snapshot when replay is not enough, and reconstruct the correct order book state after delayed, missing, or reordered events.',
      'I tested recovery using 50,000 randomized events with simulated message loss and reordering, verifying that the final reconstructed state exactly matched the expected order book. I also created a reproducible Release benchmark using 200,000 events. The event application path processed 7.7 million events per second with a measured p99 latency of 209 nanoseconds.',
    ],
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
    details: [
      'Anushka’s Cozy Corner was one of my first complete full stack projects. I wanted to build something around a hobby I already enjoyed, so I created a crochet storefront where users can browse products, maintain a shopping cart, complete checkout, and submit orders.',
      'The application contains nine routed views covering the customer experience and the administration workflow. The backend provides seven REST API endpoints for retrieving products, validating and creating orders, populating product information, and updating order status. Product and order data are stored through two MongoDB schemas.',
      'I built the frontend with React, Vite, and Tailwind CSS and used Node.js, Express, and MongoDB for the backend. The project also gave me experience with persistent client state, form validation, authentication, deployment, and maintaining separate frontend and backend applications that communicate through an API.',
    ],
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
      {
        label: 'Frontend repository',
        url: 'https://github.com/anushkaadwivedii/crochet-frontend',
      },
      {
        label: 'Backend repository',
        url: 'https://github.com/anushkaadwivedii/crochet-backend',
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
      'I’ve been learning to play the ukulele and guitar, mostly through songs I already like.',
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
      'I enjoy cooking and trying new vegetarian recipes, even if they don’t always turn out how I planned.',
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
    details: [
      "I recently graduated from UW Madison with degrees in Computer Science and Data Science, along with a certificate in Business. Through my internship, research, and personal projects, I've worked across full stack development, AI, data, and backend systems.",
      "I'm especially interested in AI and the different ways it can be built into real software. I also want to learn more about finance and business, which has led me to explore projects involving financial automation and market data alongside my other work.",
      'During college, I was involved with Alpha Omega Epsilon, a professional and social sorority for women and underrepresented genders in STEM, and Women in Computing. I also spent a year mentoring students in computer science and math. Outside of work, I love music, crochet, exploring big cities, and taking on projects that are probably more ambitious than they need to be.',
    ],
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
