# Employee System

## Run the React frontend

The frontend is a Vite/React application in `frontend/`. Start the Rails API on
port `3000`, then run:

```sh
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:3000`. To use another local
API server, set `VITE_API_PROXY_TARGET` before starting Vite. For a separately
hosted API, set `VITE_API_BASE_URL` to its `/api/v1` URL and configure the API
to allow the frontend origin. `npm test` runs the focused frontend tests and
`npm run build` creates the production assets in `frontend/dist/`.

Sign in with an account created in the Rails application. Employee creation
and editing use the authenticated `/api/v1/lookups` endpoint to load the
available countries and departments. Deletion remains restricted to users
with the backend's admin role.
