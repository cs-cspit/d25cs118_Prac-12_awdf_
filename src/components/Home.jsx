import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'

function Home() {
  const { user } = useAuth()

  return (
    <section className="section section-hero">
      <div className="hero-copy">
        <p className="eyebrow">Welcome to Practical 12</p>
        <h1>
          CI/CD with <span className="gradient-text">GitHub Actions</span>
        </h1>
        <p className="section-intro">
          Every push to <code>main</code> starts a pipeline that installs dependencies, lints the
          code, runs the API tests and builds the frontend.
        </p>
        <p className="hero-note">
          <code>.github/workflows/ci.yml</code> has two jobs. <strong>Lint</strong> runs ESLint, and
          only if it passes does <strong>Build and test</strong> start. That job runs
          Jest + supertest against a throw-away <code>mongo:7</code> service container and then runs
          <code> npm run build</code>. A failing test turns the commit red on GitHub; fixing it turns
          it green again.
        </p>
        <p className="hero-note">
          {user ? (
            <>Logged in as <strong>{user.name}</strong>. <Link to="/tasks">Go to your tasks →</Link></>
          ) : (
            <><Link to="/login">Log in</Link> or <Link to="/register">register</Link> to manage your tasks.</>
          )}
        </p>
        <div className="feature-list">
          <p>✨ Key Features:</p>
          <ul>
            <li>Trigger: push and pull_request on the main branch</li>
            <li>Job 1 — ESLint; Job 2 — npm ci → npm test → npm run build</li>
            <li>7 API tests: /api, 404, 401 without token, GET / POST tasks, validation</li>
            <li>MongoDB service container (mongo:7) inside the pipeline</li>
            <li>server/app.js exports the Express app so supertest needs no open port</li>
            <li>Failed run (deliberately broken test) and fixed run documented</li>
            <li>Still includes Docker (P11), events (P10), caching (P9) and JWT auth (P7)</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Home
