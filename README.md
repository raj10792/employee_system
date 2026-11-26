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

The current backend seed file does not create countries, departments, or users.
For a local demo, create starter records after the services are healthy:

```sh
docker compose exec api bin/rails runner 'Country.find_or_create_by!(name: "United States") { |c| c.iso_code = "US"; c.currency_code = "USD" }; Department.find_or_create_by!(name: "Engineering"); User.find_or_create_by!(email: "hr@example.com") { |u| u.password = "change-me"; u.role = "hr_manager" }'
```

Sign in with `hr@example.com` and `change-me`. This account and the Compose
database password are for local development only; change them for any shared
or production deployment. To stop the services, run `docker compose down`.
