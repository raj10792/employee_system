# Engineering Decisions

## Architecture and stack

- **Rails API + React/Vite SPA:** keep the backend and browser UI independently
  organized while retaining a small, single-repository deployment surface.
- **PostgreSQL:** relational constraints and indexed SQL aggregation fit
  employee, country, department, and salary reporting data.
- **REST/JSON API v1:** explicit resources and predictable status codes keep
  the frontend/API boundary simple.
- **React Router and feature components:** route protection and page-level
  components separate login, dashboard, and employee workflows.

## Authentication and authorization

- **Password digest + JWT:** Rails `has_secure_password` handles password
  verification; a custom HS256 token service issues 24-hour tokens and tracks
  revocation on logout.
- **Pundit policies:** employee and salary permissions are enforced server
  side. The frontend also hides actions unavailable to the current role, but
  that is only a usability measure.
- **Local storage session:** this keeps the SPA session across refreshes
  without adding a server-side session store. See
  [tradeoffs](tradeoffs.md) for the browser-storage risk.

## Data and queries

- **Decimal salary plus currency code:** stores a salary amount without
  floating-point rounding; no currency conversion is implied.
- **Database-side aggregates:** salary minimum, maximum, average, and counts
  use SQL rather than loading all employees into Ruby.
- **Paginated employee API:** defaults to 20 results and caps page size at
  100 to bound response size.
- **Service/query objects:** employee mutations and salary aggregate logic
  stay out of controllers.
- **Indexes:** employee identifiers and email have unique indexes; query
  indexes cover common country, department, status, and job-title access
  patterns.
- **Local demo seeds:** `db:seed` creates default roles, five countries, five
  departments, and ten fixed employee examples for local exploration.

## Development and verification

- Docker Compose provides a local PostgreSQL, Rails, and Vite stack.
- RSpec covers backend models, services, and requests; Vitest and Testing
  Library cover frontend formatting and user flows.
- Run `cd frontend && npm test && npm run build` for frontend validation.
  Run backend specs with `cd backend && bundle exec rspec`.

The current sample seed does not yet satisfy the assessment's
10,000-generated-employee target; see
[performance considerations](performance_considerations.md). Demo user
passwords are currently `password123`; do not use those seeds in production.
