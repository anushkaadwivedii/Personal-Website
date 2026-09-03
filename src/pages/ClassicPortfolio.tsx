import type { MouseEvent } from 'react'
import graduationPhoto from '../assets/graduation.jpg'
import './ClassicPortfolio.css'

const experiences = [
  {
    period: 'JUN — AUG 2025',
    role: 'Software Development Engineer Intern',
    company: 'PMT College',
    location: 'Lucknow, India',
    type: 'Engineering',
    description: [
      'I worked on a production testing platform used by more than 300 students. I built parts of the assessment experience in Angular and TypeScript, including timed tests, question navigation, answer saving, and submission workflows connected to .NET APIs.',
      'I also investigated slow API calls by tracing requests from the frontend through the backend and identifying where they were getting held up. The fixes reduced API latency by 25%. Alongside development, I participated in code reviews and tested components before releases.',
    ],
    skills: ['Angular', 'TypeScript', '.NET', 'REST APIs'],
  },
  {
    period: 'SEP 2025 — MAY 2026',
    role: 'Undergraduate Student Researcher',
    company: 'University of Wisconsin Madison',
    location: 'Madison, Wisconsin',
    type: 'Research',
    description: [
      'I worked on a research project that used language models to extract and classify learning objectives from university course materials. I built a modular Python pipeline with more than 10 components for preprocessing, extraction, classification, and evaluation.',
      'A large part of the work involved experimentation. I compared prompt designs and input configurations, examined where the model was making mistakes, and adjusted the pipeline based on those results. This improved classification accuracy by 80%.',
    ],
    skills: ['Python', 'LangChain', 'Llama', 'LLMs'],
  },
  {
    period: 'SEP 2025 — MAY 2026',
    role: 'Academic Peer Mentor',
    company: 'Center for Academic Excellence',
    location: 'Madison, Wisconsin',
    type: 'Mentoring',
    description: [
      'I met one on one with students taking computer science and math courses, helping them work through topics such as recursion, object oriented programming, and algorithm design.',
      'Every student understood material differently, so I learned to change how I explained a concept instead of repeating the same answer. We broke down assignments, traced through code together, and focused on helping students understand how to approach the next problem independently.',
    ],
    skills: ['Mentoring', 'Computer Science', 'Mathematics', 'Communication'],
  },
]

type ProjectLink = {
  label: string
  url: string
}

type ProjectImage = {
  src: string
  alt: string
}

type Project = {
  number: string
  category: string
  name: string
  summary: string
  description: string[]
  metric?: string
  metricLabel?: string
  skills: string[]
  images: ProjectImage[]
  links: ProjectLink[]
}

const projects: Project[] = [
  {
    number: '01',
    category: 'Music + Search',
    name: 'Resonance',
    summary:
      'A music discovery engine for finding songs by mood, context, sound, and lyrical themes.',
    description: [
      'I built Resonance because I wanted music search to understand the way people actually talk about music. Instead of requiring someone to choose a genre or artist, it accepts requests based on a feeling, situation, lyrical idea, or combination of details and uses them to find relevant songs.',
      'The system turns each natural language request into structured search criteria, retrieves candidates through three different search channels, and ranks them using eight relevance signals. The catalog contains 89,740 songs with complete sound embedding coverage, allowing the system to consider both musical characteristics and the meaning behind the request.',
      'I also worked on the infrastructure needed to process and search a dataset of that size reliably. I redesigned the embedding representation to reduce input tokens by 41%, from 9.80 million to 5.74 million, and built resumable data pipelines so interrupted jobs could continue without repeating completed work. The backend includes seven database migrations and 54 automated tests covering the search, data processing, and recommendation logic.',
    ],
    metric: '89,740',
    metricLabel: 'songs indexed',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'LLMs'],
    images: [],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/resonance-music-intelligence',
      },
    ],
  },
  {
    number: '02',
    category: 'AI Agents',
    name: 'CodePilot',
    summary:
      'A coding agent that can understand an unfamiliar repository, plan a change, edit multiple files, and test its own work.',
    description: [
      'CodePilot is a repository level coding agent I built to explore how an agent could handle changes across an unfamiliar codebase instead of only generating isolated snippets. Given a request, it analyzes the repository, locates relevant code, creates a plan, generates structured patches, and runs the project’s tests to validate its work.',
      'The workflow is organized into six stages using LangGraph, which made it easier to control how information moves between repository analysis, retrieval, planning, editing, validation, and debugging. I used FAISS for semantic code search so the agent could find relevant files even when the user’s request did not contain the exact identifiers used in the codebase.',
      'I wanted every proposed change to remain reviewable and safe. CodePilot includes path traversal protection, dry run patch previews, structured code editing, and human approval before modifying files. When validation fails, it uses the test output to attempt a bounded repair instead of retrying indefinitely. I tested the system with 35 automated tests, including a multifile change with a twelve test suite and a case where it successfully recovered after one repair attempt.',
    ],
    metric: '6',
    metricLabel: 'stage agent workflow',
    skills: ['Python', 'LangGraph', 'FAISS', 'RAG', 'Pytest'],
    images: [],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/codepilot',
      },
    ],
  },
  {
    number: '03',
    category: 'Data + Health',
    name: 'Clinical Trial Immune Cell Analytics',
    summary:
      'A full stack dashboard for exploring immune cell populations and treatment response in clinical trial data.',
    description: [
      'This project began as a technical assignment and grew into a complete analytics workflow covering data ingestion, statistical analysis, an API, and an interactive frontend. The dashboard processes 10,500 patient samples and 52,500 immune cell measurements, giving users a way to explore both individual records and broader patterns in the trial data.',
      'I built a normalized Python pipeline that calculates the relative frequencies of different immune cell populations. For melanoma patients receiving treatment, it compares responders with nonresponders using Mann Whitney U tests, effect sizes, and multiple testing correction. The analysis focuses on PBMC samples and reports the statistical evidence behind each result instead of only displaying a visual difference.',
      'The frontend was built with React and TypeScript, while FastAPI provides the backend API and SQLite stores the processed data. I added validation throughout the pipeline to catch malformed or inconsistent records before analysis. The project also includes 14 unit and integration tests, GitHub Actions continuous integration, and a reproducible setup for running the data pipeline, analysis, API, and dashboard.',
    ],
    metric: '52,500',
    metricLabel: 'measurements analyzed',
    skills: ['React', 'TypeScript', 'FastAPI', 'SQLite', 'Python'],
    images: [],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/teiko-immune-response-explorer',
      },
    ],
  },
  {
    number: '04',
    category: 'AI + Fintech',
    name: 'LedgerPilot',
    summary:
      'An agent that operates legacy banking software and turns successful interactions into reusable automations.',
    description: [
      'LedgerPilot began as a technical challenge involving computer use in legacy financial software. The agent can observe an interface, complete a task, and turn the successful interaction into a typed and versioned automation capability that can be reused later.',
      'The first execution uses an AI model to understand and operate the interface. Once the task succeeds, LedgerPilot stores the important actions and element locators so later runs can replay the same capability without calling the model again. The replay system uses ranked locators, checkpoints, and bounded retries to handle small changes in the interface without silently performing the wrong action.',
      'I designed the execution system around four possible outcomes: success, business exceptions, recoverable errors, and hard failures. I also added policy guardrails, sensitive data redaction, approval hashing for generated artifacts, and same session human handoff when the automation should not continue independently. The system is covered by 18 unit and browser integration tests across seven test suites.',
    ],
    metric: '18',
    metricLabel: 'automated tests',
    skills: ['TypeScript', 'Playwright', 'Zod', 'LLMs', 'Automation'],
    images: [],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/ledgerpilot',
      },
    ],
  },
  {
    number: '05',
    category: 'Systems + Fintech',
    name: 'Resilient Market Data Engine',
    summary:
      'A C++ market data engine built to remain correct when network messages arrive late, out of order, or not at all.',
    description: [
      'I built this project to understand the systems behind electronic markets and the problems created when market data is delivered over an unreliable network. The engine receives binary UDP messages, validates them, and applies valid events to a price time priority order book.',
      'Because UDP does not guarantee delivery or ordering, the engine tracks message sequence numbers and detects gaps as soon as they appear. It can request missed messages through replay, recover from a full snapshot when replay is not enough, and reconstruct the correct order book state after delayed, missing, or reordered events.',
      'I tested recovery using 50,000 randomized events with simulated message loss and reordering, verifying that the final reconstructed state exactly matched the expected order book. I also created a reproducible Release benchmark using 200,000 events. The event application path processed 7.7 million events per second with a measured p99 latency of 209 nanoseconds.',
    ],
    metric: '7.7M',
    metricLabel: 'events processed per second',
    skills: ['C++20', 'UDP', 'Multithreading', 'CMake', 'Linux'],
    images: [],
    links: [
      {
        label: 'View repository',
        url: 'https://github.com/anushkaadwivedii/resilient-market-data-engine',
      },
    ],
  },
  {
    number: '06',
    category: 'Full Stack',
    name: "Anushka's Cozy Corner",
    summary:
      'A full stack ecommerce website built around one of my favorite hobbies: crochet.',
    description: [
      'Anushka’s Cozy Corner was one of my first complete full stack projects. I wanted to build something around a hobby I already enjoyed, so I created a crochet storefront where users can browse products, maintain a shopping cart, complete checkout, and submit orders.',
      'The application contains nine routed views covering the customer experience and the administration workflow. The backend provides seven REST API endpoints for retrieving products, validating and creating orders, populating product information, and updating order status. Product and order data are stored through two MongoDB schemas.',
      'I built the frontend with React, Vite, and Tailwind CSS and used Node.js, Express, and MongoDB for the backend. The project also gave me experience with persistent client state, form validation, authentication, deployment, and maintaining separate frontend and backend applications that communicate through an API.',
    ],
    skills: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB'],
    images: [],
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
]

const interests = [
  {
    symbol: '◉',
    title: 'Crocheting',
    description:
      'I mostly make plushies and tapestries, usually as gifts for people.',
    link: {
      label: 'Visit my crochet shop',
      url: 'https://anushkaadwivedii.github.io/crochet-frontend/',
    },
  },
  {
    symbol: '▤',
    title: 'Reading',
    description:
      'I read whenever I get the time, especially when I need a break from being on my laptop.',
    link: null,
  },
  {
    symbol: '◒',
    title: 'Cycling',
    description:
      'I like going on long bike rides and using them as an excuse to explore somewhere new.',
    link: null,
  },
  {
    symbol: '♫',
    title: 'Ukulele & guitar',
    description:
      'I’ve been learning to play the ukulele and guitar, mostly through songs I already like.',
    link: null,
  },
  {
    symbol: '↑',
    title: 'Gym',
    description:
      'I started strength training recently and have really been enjoying it.',
    link: null,
  },
  {
    symbol: '✦',
    title: 'Cooking',
    description:
      'I enjoy cooking and trying new vegetarian recipes, even if they don’t always turn out how I planned.',
    link: null,
  },
]

function scrollToSection(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
) {
  event.preventDefault()

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
  })

  window.history.replaceState(null, '', `#${sectionId}`)
}

function ClassicPortfolio() {
  return (
    <main className="portfolio-page">
      <div className="portfolio-grid" aria-hidden="true" />

      <div className="background-skyline" aria-hidden="true">
        <span className="background-building building-a" />
        <span className="background-building building-b" />
        <span className="background-building building-c" />
        <span className="background-building building-d" />
        <span className="background-building building-e" />
        <span className="background-building building-f" />
      </div>

      <div className="portfolio-nav-shell">
        <a className="portfolio-back" href="/" aria-label="Back to landing page">
          ←
        </a>

        <nav className="portfolio-nav" aria-label="Portfolio navigation">
          <div className="portfolio-nav-links">
            <a
              href="#about"
              onClick={(event) => scrollToSection(event, 'about')}
            >
              About
            </a>

            <a
              href="#experience"
              onClick={(event) => scrollToSection(event, 'experience')}
            >
              Experience
            </a>

            <a
              href="#projects"
              onClick={(event) => scrollToSection(event, 'projects')}
            >
              Projects
            </a>

            <a
              href="#beyond-work"
              onClick={(event) => scrollToSection(event, 'beyond-work')}
            >
              Hobbies
            </a>
          </div>
        </nav>
      </div>

      <div className="portfolio-content">
        <header
          className="portfolio-hero"
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect()
            const x = ((event.clientX - bounds.left) / bounds.width) * 100
            const y = ((event.clientY - bounds.top) / bounds.height) * 100

            event.currentTarget.style.setProperty('--hero-pointer-x', `${x}%`)
            event.currentTarget.style.setProperty('--hero-pointer-y', `${y}%`)
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty('--hero-pointer-x', '72%')
            event.currentTarget.style.setProperty('--hero-pointer-y', '32%')
          }}
        >
          <div className="hero-atmosphere" aria-hidden="true">
            <span className="hero-light hero-light-cyan" />
            <span className="hero-light hero-light-pink" />
            <span className="hero-reflections" />
            <span className="hero-grain" />
          </div>

          <div className="portfolio-hero-copy">
            <p className="portfolio-kicker">
              Software engineer · AI, Full Stack and Fintech
            </p>

            <h1>
              Hi, I'm <span>Anushka.</span>
            </h1>

            <p className="portfolio-introduction">
            I build full stack software across AI, fintech, and data, and I'm always looking for something new to learn, explore, or create.
            </p>

            <div className="portfolio-actions">
              <a href="/resume.pdf" target="_blank" rel="noreferrer">
                Résumé
              </a>

              <a
                href="https://github.com/anushkaadwivedii"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/anushka-dwivedi7/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>

              <a href="mailto:anushkadwivedi71@gmail.com">Email me</a>
            </div>
          </div>
        </header>

        <section className="portfolio-section about-section" id="about">
          <div className="graduation-photo-placeholder">
            <img
              src={graduationPhoto}
              alt="Anushka in her graduation gown at UW–Madison"
              loading="lazy"
            />
          </div>

          <div className="about-copy">
            <p className="section-label">01 · Who I am</p>

            <h2>A little about me.</h2>

            <p>
            I recently graduated from UW Madison with degrees in Computer Science and
            Data Science, along with a certificate in Business. Through my internship,
            research, and personal projects, I've worked across full stack development,
            AI, data, and backend systems.
            </p>

            <p>
            I'm especially interested in AI and the different ways it can be built into
            real software. I also want to learn more about finance and business, which
            has led me to explore projects involving financial automation and market
            data alongside my other work.
            </p>

            <p>
            During college, I was involved with Alpha Omega Epsilon, a professional and
            social sorority for women and underrepresented genders in STEM, and Women in
            Computing. I also spent a year mentoring students in computer science and
            math. Outside of work, I love music, crochet, exploring big cities, and
            taking on projects that are probably more ambitious than they need to be.
            </p>

          </div>
        </section>

        <section className="portfolio-section" id="experience">
          <div className="section-content">
            <div className="section-heading">
              <div>
                <p className="section-label">02 · Experience</p>
                <h2>Where I’ve worked.</h2>
              </div>
            </div>

            <div className="experience-list">
              {experiences.map((experience) => (
                <article
                  className="experience-row"
                  key={`${experience.company}-${experience.role}`}
                >
                  <div className="experience-meta">
                    <p className="experience-period">{experience.period}</p>
                    <span className="experience-type">{experience.type}</span>
                  </div>

                  <div className="experience-body">
                    <div className="experience-title">
                      <h3>{experience.role}</h3>
                      <p>
                        {experience.company} · {experience.location}
                      </p>
                    </div>

                    <div className="experience-description">
                      {experience.description.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div
                      className="experience-skills"
                      aria-label={`Skills used at ${experience.company}`}
                    >
                      {experience.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-section" id="projects">
          <div className="section-content">
            <div className="section-heading">
              <div>
                <p className="section-label">03 · Selected work</p>
                <h2>Things I’ve built.</h2>
              </div>

              <p>Select a project for a closer look at how it was built.</p>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <details className="project-card" key={project.name}>
                  <summary className="project-preview">
                    <div className="project-preview-heading">
                      <p className="project-category">
                        {project.number} · {project.category}
                      </p>

                      <h3>{project.name}</h3>
                    </div>

                    <p className="project-summary">{project.summary}</p>

                    <div className="project-preview-footer">
                      {project.metric && (
                        <div className="project-metric">
                          <strong>{project.metric}</strong>
                          <span>{project.metricLabel}</span>
                        </div>
                      )}

                      <span className="project-toggle">
                        <span className="project-open-label">
                          Explore project
                        </span>
                        <span className="project-close-label">
                          Close project
                        </span>
                      </span>
                    </div>
                  </summary>

                  <div
                    className={
                      project.images.length > 0
                        ? 'project-expanded project-expanded-with-media'
                        : 'project-expanded'
                    }
                  >
                    <div className="project-expanded-copy">
                      <div className="project-description">
                        {project.description.map((paragraph, index) => (
                          <p key={`${project.name}-${index}`}>{paragraph}</p>
                        ))}
                      </div>

                      <div
                        className="project-skills"
                        aria-label={`Technologies used for ${project.name}`}
                      >
                        {project.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>

                      <div className="project-links">
                        {project.links.map((link) => (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            key={link.url}
                          >
                            {link.label} →
                          </a>
                        ))}
                      </div>
                    </div>

                    {project.images.length > 0 && (
                      <div className="project-media">
                        {project.images.map((image) => (
                          <img
                            src={image.src}
                            alt={image.alt}
                            key={image.src}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-section" id="beyond-work">
          <div className="section-content">
            <div className="section-heading">
              <div>
                <p className="section-label">04 · Hobbies</p>
                <h2>Hobbies.</h2>
              </div>
            </div>

            <div className="interest-grid">
              {interests.map((interest) => (
                <article className="interest-card" key={interest.title}>
                  <span className="interest-symbol" aria-hidden="true">
                    {interest.symbol}
                  </span>

                  <h3>{interest.title}</h3>
                  <p>{interest.description}</p>

                  {interest.link && (
                    <a
                      className="interest-link"
                      href={interest.link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {interest.link.label} →
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ClassicPortfolio
