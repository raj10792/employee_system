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
with the HR manager or admin role.

## Run the full app with Docker

Docker Compose starts PostgreSQL, the Rails API, and the Vite frontend:

```sh
docker compose up --build
```

Open `http://localhost:5173`. The API is available at `http://localhost:3000`;
the frontend proxies API requests through the Compose network. On startup,
Rails runs `db:prepare`. The development database is stored in the
`postgres_data` volume.

After the services are healthy, seed the local HR manager and admin accounts:

```sh
docker compose exec api bin/rails db:seed
```

By default, the local accounts are `hr@example.com` and `admin@example.com`,
both with password `change-me`. Set `HR_MANAGER_SEED_EMAIL`,
`HR_MANAGER_SEED_PASSWORD`, `ADMIN_SEED_EMAIL`, and `ADMIN_SEED_PASSWORD` to
override them. Production seeding requires explicit password variables.

The seed file does not create countries or departments. Add starter lookup
records for a local demo with:

```sh
docker compose exec api bin/rails runner 'Country.find_or_create_by!(name: "United States") { |c| c.iso_code = "US"; c.currency_code = "USD" }; Department.find_or_create_by!(name: "Engineering")'
```

The default account passwords and Compose database password are for local
development only; change them for any shared or production deployment. To stop
the services, run `docker compose down`.
