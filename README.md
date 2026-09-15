# Scheduly Backend

Private REST API for Scheduly, a local tutor management app for university students in Uruguay. It replaces json-server with PostgreSQL: students, contacts, referral discounts, subjects, and classes.

The frontend is a separate React SPA. This service authenticates with HTTP-only session cookies. There is no object storage, Redis, or payment provider.

## Stack

- Node.js 20+
- Express and TypeScript (ESM)
- PostgreSQL and Sequelize (schema from migrations only)
- Zod validation
- Pino logging

## Local setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL (Compose project `scheduly`, container `scheduly-postgres`). Postgres is on host port **5434** so it does not collide with QRly (5432) or AlgoRico (5433):

```bash
docker compose up -d
```

3. Install dependencies, migrate, seed, and run:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The API listens on **http://localhost:4001**.

Development login:

- Email: `gasvaryt@gmail.com`
- Password: `Sg-yGefyNn-2026!`

## Tests

```bash
npm run test
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the API with reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run the compiled API |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run db:migrate` | Apply Sequelize migrations |
| `npm run db:seed` | Insert the local tutor user and domain data |

## Architecture

Feature folders under `src/features` follow `routes -> validation -> controller -> service`. Sequelize models live in `src/models`. Migrations are in `src/database/migrations` and are the only schema source; `sequelize.sync()` is not used.

## Authentication

Sessions are stored server-side. Login sets:

- `scheduly.sid` — HTTP-only session cookie
- `scheduly.csrf` — readable CSRF cookie

Mutating `/api/*` business requests must send `x-csrf-token`. Passwords are hashed with bcrypt. Login is rate-limited.

## API

JSON envelope `{ data }` on success. Lists return the full array (no pagination). Deletes return 204.

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | public |
| POST | `/api/auth/login` | public, rate-limited |
| POST | `/api/auth/logout` | session |
| GET | `/api/auth/me` | session |
| GET, POST | `/api/students` | session + CSRF |
| GET, PATCH, DELETE | `/api/students/:studentId` | session + CSRF |
| GET, POST | `/api/subjects` | session + CSRF |
| GET, PATCH, DELETE | `/api/subjects/:subjectId` | session + CSRF |
| GET, POST | `/api/classes` | session + CSRF |
| GET, PATCH, DELETE | `/api/classes/:classId` | session + CSRF |
| PATCH | `/api/classes/:classId/payment-status` | session + CSRF |
