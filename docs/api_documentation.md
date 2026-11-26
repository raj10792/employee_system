# API Documentation

Base URL: `http://localhost:3000/api/v1` (or `/api/v1` through the Vite
development proxy). Requests and responses use JSON unless noted.

## Authentication

`POST /login` is public. All other API v1 endpoints require:

```http
Authorization: Bearer <token>
```

Tokens are HS256 JWTs with a 24-hour expiry. `DELETE /logout` revokes the
current token. HR managers and admins can manage employees and view salary
insights; the employee role is denied those operations.

## Endpoints

| Method and path | Access | Description |
| --- | --- | --- |
| `POST /login` | Public | Authenticate with `email` and `password` |
| `DELETE /logout` | Authenticated | Revoke the current JWT |
| `GET /employees` | HR manager, admin | Search, filter, sort, and paginate |
| `GET /employees/:id` | HR manager, admin | Fetch one employee |
| `POST /employees` | HR manager, admin | Create an employee |
| `PATCH /employees/:id` | HR manager, admin | Update an employee |
| `DELETE /employees/:id` | HR manager, admin | Permanently delete an employee |
| `GET /lookups` | Authenticated | List countries and departments for forms |
| `GET /salaries` | HR manager, admin | Employee summary and salary aggregates |

### Login and logout

`POST /login`

```json
{ "email": "hr@example.com", "password": "password123" }
```

Success (`200`):

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": 1, "email": "hr@example.com", "role": "hr_manager" }
}
```

Invalid credentials return `401` with `{"error":"Invalid email or password"}`.
Logout returns `200` with a success message; missing, invalid, expired, or
revoked tokens return `401`.

### Employee list

`GET /employees` accepts these optional query parameters:

| Parameter | Meaning |
| --- | --- |
| `search` | Case-insensitive match on first name, last name, full name, email, or employee code |
| `country_id`, `department_id` | Exact relationship filters |
| `job_title` | Case-insensitive partial match |
| `employment_status` | `active`, `inactive`, or `terminated` |
| `sort_by` | `created_at`, `updated_at`, `salary`, `joining_date`, `first_name`, or `last_name` |
| `direction` | `asc` or `desc` |
| `page` | Page number; invalid values are normalized to page 1 |
| `per_page` | Defaults to 20; clamped to 1–100 |

Success returns `data` and pagination `meta`. Each employee includes associated
country (`id`, `name`, `iso_code`) and department (`id`, `name`).

```json
{
  "data": [
    {
      "id": 42,
      "employee_code": "EMP0042",
      "first_name": "Asha",
      "last_name": "Rao",
      "full_name": "Asha Rao",
      "email": "asha@example.com",
      "job_title": "Software Engineer",
      "salary": "120000.0",
      "currency": "INR",
      "employment_status": 0,
      "joining_date": "2024-01-15",
      "country": { "id": 1, "name": "India", "iso_code": "IN" },
      "department": { "id": 1, "name": "Engineering" }
    }
  ],
  "meta": {
    "total_count": 1,
    "current_page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

### Employee create and update

Create uses `POST /employees`; update uses `PATCH /employees/:id`. Both accept
an `employee` object containing `employee_code`, `first_name`, `last_name`,
`email`, `job_title`, `salary`, `currency`, `employment_status`,
`joining_date`, `country_id`, and `department_id`.

Creation returns `201`; update returns `200`. Validation failures return `422`
with `{"errors":["..."]}`. Delete returns `204` with no body.

### Lookups

`GET /lookups` returns:

```json
{
  "data": {
    "countries": [
      { "id": 1, "name": "India", "iso_code": "IN", "currency_code": "INR" }
    ],
    "departments": [{ "id": 1, "name": "Engineering" }]
  }
}
```

### Salary insights

`GET /salaries` returns:

```json
{
  "data": {
    "summary": {
      "total_employees": 10,
      "active_employees": 8,
      "inactive_employees": 1,
      "terminated_employees": 1
    },
    "salary_by_country": [
      {
        "country": "India",
        "currency": "INR",
        "minimum_salary": "75000.0",
        "maximum_salary": "120000.0",
        "average_salary": "93750.0",
        "employee_count": 4
      }
    ],
    "salary_by_job_title": [
      {
        "job_title": "Ruby on Rails Developer",
        "country": "India",
        "average_salary": "85000.0",
        "employee_count": 1
      }
    ]
  }
}
```

Country metrics group by currency; role metrics do not include a currency
field.

## Common errors

| Status | Meaning | Example body |
| --- | --- | --- |
| `401` | Missing/invalid token or invalid login | `{"error":"Unauthorized"}` |
| `403` | Authenticated user lacks permission | `{"error":"Forbidden"}` |
| `422` | Employee validation failed | `{"errors":["Email has already been taken"]}` |
| `404` | Requested employee does not exist | Rails not-found response |
