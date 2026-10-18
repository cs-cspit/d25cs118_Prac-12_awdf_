# Practical 11 — Containerization with Docker and Docker Compose

**Student:** D25CS118 · **Subject:** Advanced Web Development Frameworks (ITUE301)

Continues from **Practical 10** (Task Manager with JWT auth, caching and event-driven notifications).
This practical containerizes the full stack: React frontend, Node/Express backend and MongoDB,
started together with **one command**.

## Run the whole stack with Docker

```bash
cp .env.example .env               # set JWT_SECRET (Compose refuses to start without it)
docker compose up --build          # builds 2 images, pulls mongo:7, starts all 3 containers
docker ps                          # taskmanager-frontend, taskmanager-backend, taskmanager-mongodb
```

| Service | Image | URL |
|---|---|---|
| frontend | built from `Dockerfile.frontend` (nginx) | http://localhost:5173 |
| backend | built from `Dockerfile.backend` (Node 22) | http://localhost:5000/api |
| mongodb | `mongo:7` | mongodb://localhost:27017 |

```bash
docker compose down                # stop and remove the containers (data stays in the volume)
docker compose down -v             # also delete the mongo-data volume
```

## Architecture

```
                 docker-compose.yml  —  network: app-network (bridge)
 ┌───────────────────────┐    /api/*    ┌──────────────────────┐   mongodb://mongodb:27017   ┌──────────────┐
 │ frontend (nginx)      │ ───────────▶ │ backend (Node 22)    │ ──────────────────────────▶ │ mongodb      │
 │ React build, port 80  │ backend:5000 │ Express, port 5000   │                             │ mongo:7      │
 └──────────┬────────────┘              └──────────┬───────────┘                             └──────┬───────┘
     host 5173:80                           host 5000:5000                            host 27017 · volume mongo-data
```

Start-up order: `mongodb` (healthy when `mongosh` ping answers) → `backend` (healthy when
`GET /api` returns 200) → `frontend`.

## Files

| File | Purpose |
|---|---|
| `Dockerfile.backend` | `node:22-alpine`, `npm ci --omit=dev`, copies only `server/`, runs as the `node` user |
| `Dockerfile.frontend` | Multi-stage: stage 1 builds with Vite, stage 2 is `nginx:alpine` holding only `dist/` |
| `nginx.conf` | Serves the React build, SPA fallback to `index.html`, proxies `/api/` to `http://backend:5000` |
| `docker-compose.yml` | 3 services, `app-network` bridge network, `mongo-data` named volume, healthchecks, `depends_on` |
| `.dockerignore` | Keeps `node_modules`, `.env`, `dist`, `.git` and docs out of the build context |

Both Dockerfiles sit at the project root because the frontend and backend share one
`package.json`. Each Dockerfile copies only the folders its image needs.

## Design notes

- **Node 22 instead of node:18:** Vite 8 needs Node ≥ 20.19, so a `node:18` build stage would
  fail at `npm run build`. Node 18 is also end-of-life.
- **Service name, not localhost:** inside the backend container `localhost` is the backend
  container itself. Docker's internal DNS resolves `mongodb` to the MongoDB container, and nginx
  reaches the API as `backend`.
- **EXPOSE vs ports:** `EXPOSE 5000` only documents the port the process listens on. `ports:
  "5000:5000"` in Compose actually publishes it on the host.
- **No node_modules copy:** `.dockerignore` excludes it and `npm ci` installs inside the image.
  Host `node_modules` may contain native binaries built for Windows, makes the build context
  huge and isn't reproducible from `package-lock.json`.
- **Multi-stage frontend:** the final image contains only nginx and the static build (about
  1 MB of assets), not Node, the source or the ~300 MB of build-time dependencies.
- **Named volume:** `mongo-data:/data/db` keeps tasks across `docker compose down` / `up`.
- **Secrets:** `JWT_SECRET` comes from `.env` through Compose variable substitution. `.env` is
  in both `.gitignore` and `.dockerignore`, so it never ends up in an image or in Git.

## Post-lab tasks done

- `.dockerignore` excluding `node_modules` and `.env`.
- Multi-stage build for the React frontend.
- Named volume for MongoDB so data persists across container restarts.

## Running without Docker (unchanged)

```bash
npm install
npm run server              # Express :5000 (local MongoDB)
npm run dev                 # React :5173
```
