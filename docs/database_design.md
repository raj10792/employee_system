# Database Design

PostgreSQL is the system of record. The current schema is defined by Rails
migrations and represented by `backend/db/schema.rb`.

## Entities

| Table | Purpose | Important fields |
| --- | --- | --- |
| `users` | Sign-in identities and access roles | `email`, `password_digest`, integer `role` |
| `employees` | Employee profile and compensation | employee code, names, email, job title, decimal salary, currency, status, joining date, country and department IDs |
| `countries` | Employee country and market currency reference | name, ISO code, currency code |
| `departments` | Organizational grouping | name, optional description |
| `revoked_tokens` | JWT logout/revocation records | unique JWT ID (`jti`), expiration time |

### Relationships

- An employee belongs to exactly one country and one department; both foreign
  keys are non-null and enforced by PostgreSQL.
- A country or department cannot be deleted while employees reference it.
- Users are independent of employee rows; there is no employee-to-user
  association.
- Employee deletion is a hard delete. There is no soft-delete or audit-history
  table.

## Important fields and enums

- `employees.salary` is `DECIMAL(15, 2)`; `employees.currency` is a string
  currency code. The amount is not converted to a common currency.
- Employee status is stored as an integer: `active: 0`, `inactive: 1`,
  `terminated: 2`.
- User role is stored as an integer: `hr_manager: 0`, `admin: 1`,
  `employee: 2`.
- `employees.full_name` is computed from `first_name` and `last_name` by a
  model validation callback.
- Employee code, employee email, user email, and revoked-token `jti` have
  unique database indexes.

## Indexes

The employee table has indexes on `country_id`, `department_id`,
`(country_id, department_id)`, `(country_id, job_title)`,
`employment_status`, and `(employment_status, country_id)`. These support
relationship lookup, common filters, and active-country salary aggregation.

The unique email and employee-code indexes prevent duplicate records at the
database layer. Country name/ISO code and department name uniqueness are
currently model validations rather than unique database indexes.

## Reporting semantics

Salary dashboard summary counts include employees of every status, while
salary ranges and role averages include only active employees. Country salary
groups include both country and currency. Role averages currently group by
country and job title, not currency; use one consistent currency per country
when interpreting those role averages.
