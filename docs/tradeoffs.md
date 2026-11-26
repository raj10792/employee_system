# Tradeoffs and Known Limitations

## Chosen tradeoffs

| Choice | Benefit | Cost or limitation |
| --- | --- | --- |
| Rails modular monolith + React SPA | Simple local development and clear API/UI boundary | Two runtimes and builds must be coordinated |
| PostgreSQL-side filtering and aggregates | Bounded API responses and efficient calculations | SQL query behavior and indexes require maintenance |
| JWT persisted in browser local storage | Simple SPA authentication across refreshes | JavaScript-accessible tokens increase exposure if an XSS issue is introduced |
| Integer-backed role/status enums | Compact storage and straightforward Rails predicates | Numeric values depend on stable enum mappings |
| Hard-delete employee endpoint | Simple CRUD behavior | No restore, audit trail, or salary-history retention |
| Seeded country/department choices | Makes local forms usable without extra admin screens | Adding or editing reference data requires seeds or backend work |

## Reporting caveats

- Salaries are stored as amounts plus currency codes. There is no FX rate
  service or normalization, so only same-currency amounts are comparable.
- Country salary metrics group by currency. Job-title metrics currently group
  only by country and title, so a country with mixed employee currencies can
  produce a misleading average.
- Salary metrics include only active employees; summary counts include all
  statuses.

## Seed and scale caveats

- `db:seed` currently creates ten fixed employee rows, not the requested
  10,000 generated names. There is no recorded 10,000-row benchmark.
- The current seed assigns the same `password123` default to the two sample
  accounts. Treat it as local-only and do not use it to create production
  credentials.
- Country and department uniqueness is validated in Rails but is not backed
  by unique database indexes; concurrent creation could race.
- Employee list pagination and several query indexes target the exercise's
  scale. Trigram search, caching, exports, and bulk-generation optimizations
  should be driven by measured needs.

## Authorization boundary

Both HR managers and admins can create, view, update, and delete employees and
view salary insights. Employee-role users are denied these operations.
Country and department lookups require authentication but are not separately
role-restricted.
