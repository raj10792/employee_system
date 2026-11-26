# Copilot Instructions

## Project map

- `backend/` is the Rails 8.1 JSON API and PostgreSQL application.
- `frontend/` is the React/Vite SPA.
- `compose.yaml` runs PostgreSQL, Rails, and Vite for local development.
- `docs/` contains architecture, schema, API, performance, tradeoff, and
  AI-usage notes. Keep these aligned with implementation changes.

The frontend is organized under `frontend/src` into `components/`, `context/`,
`pages/`, and `services/`. Add UI behavior to the relevant page or component
instead of growing `App.jsx`. Use React Router for navigation and
`AuthContext` for the current authenticated user.

## Backend conventions

- Keep controllers focused on HTTP and JSON. Reuse the employee service
  objects, `Salary::DashboardQuery`, and `Employees::SearchService` for their
  respective responsibilities.
- Employee writes and salary insights require Pundit authorization. HR
  managers and admins can manage employees and view salary insights; employee
  role users cannot. Keep authorization enforced on the server even when the
  frontend hides an action.
- API v1 responses are JSON. Authenticated requests use
  `Authorization: Bearer <JWT>`; use the shared frontend API service rather
  than adding ad hoc `fetch` calls.
- Change database structure through migrations, then regenerate
  `backend/db/schema.rb`; do not hand-edit the schema.
- Employee salary amounts have a separate currency code. Never present
  cross-currency salary values as directly comparable. Country stats group
  by currency; job-title averages currently assume a consistent currency
  within a country.

## Frontend conventions

- Preserve the existing React Router, component, and CSS patterns. Keep
  layout, dashboard, and employee-management responsibilities in their
  respective components/pages.
- Use the shared `services/api.js` for token headers, JSON requests, and
  normalized API errors. Surface actionable request errors in the UI.
- Keep loading, error, empty, and success states accessible; use labels and
  semantic buttons/links so the existing Testing Library patterns can cover
  user flows.
- Extend Vitest tests for new frontend behavior. Keep tests deterministic and
  avoid depending on live API services.

## Validation commands

Run commands from the indicated directory:

```sh
cd frontend && npm test && npm run build
cd frontend && npm audit
cd backend && bundle exec rspec
cd backend && bundle exec rubocop
docker compose config -q
```

For Docker smoke tests, run `docker compose up --build --wait`, check the
frontend at `http://localhost:5173` and Rails health at `http://localhost:3000/up`,
then stop the stack with `docker compose down`. The Vite proxy should reach
Rails; an unauthenticated protected API route should return `401`.

## Seeds and credentials

`bin/rails db:seed` currently creates demo users, reference countries and
departments, and ten fixed employee examples. The assessment's 10,000-generated
employee target is not implemented; do not describe the current seed as
10,000 rows or claim it was benchmarked at that size.

The demo accounts currently use `password123`. Treat these credentials and
the Compose database password as local-only; never use them for a shared or
production environment. Do not commit credentials, tokens, or key files.

## Documentation and scope

When API, schema, auth, seed, or Docker behavior changes, update the relevant
document under `docs/` and the root README when setup instructions change.
Prefer focused changes and tests for the requested behavior; do not silently
change unrelated pre-existing work.
