# Architecture

## System overview

Employee System is a modular monolith: a React single-page application calls a
versioned Ruby on Rails JSON API, which persists data in PostgreSQL.

```text
HR manager browser
       |
       | React + Vite, React Router
       | /api/v1 requests (Bearer JWT)
       v
Rails API
  controllers -> Pundit policies -> services / query objects
       |
       v
PostgreSQL
```

For local development, `compose.yaml` runs PostgreSQL, Rails, and Vite as
separate Docker Compose services. Vite proxies `/api` requests to Rails over
the Compose network. See the root README for startup instructions.

## Frontend

The React/Vite application is under `frontend/src`:

- `App.jsx` defines routes for login, dashboard, and employee management.
- `components/layout` contains the protected application shell, navigation,
  and header.
- `components/dashboard` renders employee summary cards and salary insights.
- `pages` contains the login, dashboard, and employee-management views.
- `context/AuthContext.jsx` owns login state and the persisted session.
- `components/ProtectedRoute.jsx` redirects unauthenticated users to login.
- `services/api.js` adds the JSON and bearer-token headers and normalizes API
  errors.

## Backend

The Rails API is in `backend/`. API v1 controllers handle HTTP concerns,
Pundit policies enforce role permissions, and employee/salary service objects
encapsulate write and aggregate-query operations. Authentication uses
`has_secure_password` and a custom HS256 JWT service; tokens expire after
24 hours and logout revokes the token identifier.

HR managers and admins can manage employees and view salary insights.
Employees cannot access those operations. Countries and departments are
authenticated lookup data used by employee forms.

## Data flow

1. A user signs in through `POST /api/v1/login`; the API returns a JWT and
   role-bearing user object.
2. The frontend stores that session in browser local storage and sends the JWT
   as `Authorization: Bearer <token>` on authenticated requests.
3. Rails authenticates the token, applies Pundit authorization, and returns
   JSON.
4. Employee search and pagination are performed in the database. Salary
   summaries are aggregated in SQL and returned as grouped results.

See [database design](database_design.md) and
[API documentation](api_documentation.md) for the data model and endpoint
contracts.
