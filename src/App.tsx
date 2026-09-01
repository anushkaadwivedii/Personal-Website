import './App.css'

function App() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <p className="eyebrow">Welcome to my corner of the internet</p>

        <h1>Anushka Dwivedi</h1>

        <p className="landing-prompt">
          Choose your way in.
        </p>

        <p className="landing-description">
          Take the quick route through my portfolio, or explore the city.
        </p>
      </header>

      <section className="portal-options">
        <button
          className="portal-option classic-portal"
          type="button"
        >
          <div className="portal-preview elevator-preview" aria-hidden="true">
            <span className="elevator-door left-door" />
            <span className="elevator-door right-door" />
            <span className="elevator-light" />
          </div>

          <div className="portal-copy">
            <span className="portal-number">01</span>
            <h2>Classic portfolio</h2>
            <p>Projects, experience, interests, and contact information.</p>
          </div>
        </button>

        <button
          className="portal-option city-portal"
          type="button"
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
        </button>
      </section>
    </main>
  )
}

export default App