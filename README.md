# Practical 12 — CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/cs-cspit/d25cs118_Prac-12_awdf_/actions/workflows/ci.yml/badge.svg)](https://github.com/cs-cspit/d25cs118_Prac-12_awdf_/actions/workflows/ci.yml)

**Student:** D25CS118 · **Subject:** Advanced Web Development Frameworks (ITUE301)

Continues from **Practical 11** (containerized Task Manager). This practical adds automated
API tests and a GitHub Actions pipeline that runs on every push to `main`.

📄 **Failed and passed pipeline runs:** [docs/ci-runs.md](docs/ci-runs.md)

## Pipeline

```
git push origin main  (or a pull request into main)
        │
        ▼
GitHub Actions  —  .github/workflows/ci.yml
        │
        ├─ Job 1: Lint (ESLint)
        │     checkout → setup Node 22 → npm ci → npm run lint
        │
        └─ Job 2: Build and test          (needs: lint)
              service container: mongo:7
              checkout → setup Node 22 → npm ci → npm test → npm run build
        │
        ▼
✔ green check (all steps pass)   or   ✘ red X (first failing step, with its log)
```

## Run the tests locally

```bash
npm install
npm test          # needs a local MongoDB; uses the taskmanager_test database
```

`MONGO_URI_TEST` overrides the test database URL. `TEST_LOGS=true npm test` shows the route logs.

## Tests — `server/tests/api.test.js`

| Test | Expects |
|---|---|
| `GET /api` | 200 and the API description |
| `GET /api/does-not-exist` | 404 |
| `GET /api/tasks` without a token | 401 |
| `GET /api/tasks` with a token | 200 and an array |
| `POST /api/tasks` with a title | 201 and the created task |
| `POST /api/tasks` without a title | 400 |
| `GET /api/tasks` after creating | the created task is listed |

To make the app testable, `server/app.js` now only builds and **exports** the Express app.
`server/server.js` loads `.env`, connects to MongoDB, registers the event listeners and calls
`listen()`, and `npm run server` now starts that file. supertest calls the exported app in
memory, so the tests don't open a port.

## Files

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Triggers, `lint` and `build-and-test` jobs, MongoDB service container |
| `server/tests/api.test.js` | Jest + supertest API tests |
| `server/tests/setup.js` | Hides route `console.log` output during tests |
| `server/app.js` / `server/server.js` | Express app vs. process entry point |
| `package.json` | `"test"` script (Jest with `--experimental-vm-modules` for ES modules) and Jest config |

## Answers to the key questions

- **CI or CD?** This pipeline is **Continuous Integration**: every push is automatically
  installed, linted, tested and built, but nothing is deployed. Continuous Deployment would
  add a job that ships the build (for example, pushing the Practical 11 Docker images) after
  the tests pass.
- **Why test on every push?** A broken change is caught minutes after it is pushed, while
  it is small and the author still remembers it, instead of weeks later before a release
  when many changes are mixed together.
- **Wrong test file path?** Jest would find no tests and exit with "No tests found" (exit
  code 1). The run fails at the same **"Run tests"** step, but the log shows a configuration
  error rather than a failed assertion, which is why the log matters and not just the red X.

## Post-lab tasks done

- Second (and more) automated tests covering different endpoints.
- Status badge at the top of this README.
- A separate lint job that must pass before the test job (`needs: lint`), and a
  `pull_request` trigger for `main` alongside `push`.
