import { Link } from 'react-router'
import '../App.css'

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <p className="eyebrow">Welcome to my corner of the internet</p>

        <h1>Anushka Dwivedi</h1>

        <div className="landing-introduction">
          <p>
            Hey, I'm Anushka! I'm a recent grad, and I made this portfolio to
            share a little about myself and the things I've worked on.
          </p>
          <p>
            There are two ways to explore it: you can stick with the classic
            portfolio, or drive through the interactive city I built. I’ve
            always loved big cities and rain, so I wanted to incorporate both
            into the site. Each building represents a different section.
          </p>
          <p className="landing-signoff">Hope you enjoy it :)</p>
        </div>

        <p className="landing-prompt">
          Choose your way in.
        </p>
      </header>

      <section className="portal-options">
        <Link
          className="portal-option classic-portal"
          to="/portfolio"
        >
          <div className="portal-preview elevator-preview" aria-hidden="true">
            <span className="elevator-door left-door" />
            <span className="elevator-door right-door" />
            <span className="elevator-light" />
          </div>

          <div className="portal-copy">
            <span className="portal-number">01</span>
            <h2>Classic portfolio</h2>
            <p>Projects, experience, hobbies, and contact information.</p>
          </div>
        </Link>

        <Link
          className="portal-option city-portal"
          to="/city"
        >
          <div className="portal-preview city-preview" aria-hidden="true">
            <span className="city-building building-one" />
            <span className="city-building building-two" />
            <span className="city-building building-three" />
            <span className="rain-glass" />
          </div>

          <div className="portal-copy">
            <span className="portal-number">02</span>
            <h2>Explore the city</h2>
            <p>Drive through a rainy world and discover each section.</p>
          </div>
        </Link>
      </section>
    </main>
  )
}

export default LandingPage
