import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'

function Home() {
  const { user } = useAuth()

  return (
    <section className="section section-hero">
      <div className="hero-copy">
        <p className="eyebrow">Welcome to Practical 11</p>
        <h1>
          Containerized with <span className="gradient-text">Docker</span>
        </h1>
        <p className="section-intro">
          The frontend, backend and MongoDB each run in their own container, and one
          <code> docker compose up --build</code> starts all three.
        </p>
        <p className="hero-note">
          This page is served by <strong>nginx</strong> from a multi-stage image. Requests to
          <code> /api</code> are proxied to the <code>backend</code> container, which connects to
          <code> mongodb://mongodb:27017</code>, using the service name, not localhost. All three
          containers share the <code>app-network</code> bridge network, and tasks are kept in the
          <code> mongo-data</code> named volume.
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
            <li>Dockerfile.backend — node:22-alpine, npm ci --omit=dev, non-root user</li>
            <li>Dockerfile.frontend — multi-stage: Vite build → nginx:alpine</li>
            <li>docker-compose.yml — frontend :5173, backend :5000, mongodb :27017</li>
            <li>Healthchecks + depends_on: MongoDB → backend → frontend</li>
            <li>Named volume mongo-data so tasks survive restarts</li>
            <li>.dockerignore keeps node_modules and .env out of the images</li>
            <li>Still includes events (P10), caching (P9), lazy loading (P8) and JWT auth (P7)</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Home
