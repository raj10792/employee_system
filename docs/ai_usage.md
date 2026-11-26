# AI Usage

## Tool used

Implementation and documentation work used GitHub Copilot CLI in this
repository workspace. Its file-inspection, patch, shell, and test-running tools
were used to explore the existing Rails API, implement the React application,
add supporting API/Docker/seed changes, and validate the results. No external
AI service or second AI product was used.

## Delegation

No work was delegated to subagents or other AI agents. Changes were made and
reviewed directly in the Copilot CLI session.

## Review and corrections

Generated changes were compared against the repository's existing models,
controllers, routes, authorization policies, and API response shapes. Review
and test feedback led to these adjustments:

- Salary formatting for INR was changed to use Indian digit grouping after a
  focused test exposed a locale mismatch.
- The initial single-file UI was split into the requested route, layout,
  context, page, and dashboard-component structure without dropping employee
  management.
- React Router was upgraded after the dependency audit reported advisories.
- HR-manager deletion was aligned across the frontend and Pundit policy, with
  tests confirming HR managers can delete and employee-role users cannot.
- The full backend suite exposed a misspelled employee-summary JSON key that
  disagreed with its existing service spec. The API and frontend were aligned
  on `total_employees`.
- Docker startup checks exposed Rails host authorization blocking the Vite
  proxy. A development-only Compose host allowlist and an external PID file
  resolved the observed issues.
- Docker and seed instructions were reconciled with the actual sample data
  and default credentials rather than assuming an empty or fully generated
  10,000-row seed.

## Validation

Validation used deterministic project tests and real local Docker checks:

- Frontend: `cd frontend && npm test` (6 tests), `npm run build`, and
  `npm audit` (no advisories).
- Backend: `cd backend && bundle exec rspec` (74 examples, 0 failures) and
  RuboCop on the seed and salary-query changes.
- Docker: `docker compose config -q`, image build, `docker compose up --wait`,
  and HTTP checks for Vite and Rails `/up` (both `200`) and the proxied
  authenticated API (`401` without credentials, as expected).

The current 10-row seed is not a substitute for the requested 10,000-row
performance validation; that remaining gap is recorded in
[performance considerations](performance_considerations.md).
