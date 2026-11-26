# Performance Considerations

## Current request paths

- Employee search, filters, ordering, and pagination run in PostgreSQL.
- The list defaults to 20 employees per request and clamps `per_page` to 100.
- The controller eager-loads country and department for each result page to
  avoid per-row association queries.
- Search terms are escaped and matched with `ILIKE`; sort columns and
  directions are allowlisted.
- Salary insights use grouped SQL aggregates and `pluck`, avoiding transfer of
  every employee row into Rails.
- The frontend debounces employee search by 250 ms and cancels superseded
  requests with `AbortController`.

## Index coverage

Employee code, employee email, and user email have unique indexes. Employee
country, department, country/department, country/job-title, employment status,
and employment-status/country indexes support common filtering and reporting.
These indexes reduce lookup work but add storage and write cost.

The current substring search uses `%term%`, which a normal B-tree index
typically cannot accelerate. That is acceptable for the current exercise
scale; consider PostgreSQL trigram indexes or a search service if measured
latency warrants it.

## 10,000-employee target

The current committed seed contains ten fixed employee examples, not 10,000
generated records, and no 10,000-row load test has been recorded. The stated
assessment target is therefore not yet verified.

For a larger deterministic seed:

1. Load and validate first- and last-name source lists once.
2. Generate employee attributes in memory in bounded batches.
3. Use a transaction and bulk insert/upsert where appropriate, while retaining
   database constraints and deterministic unique codes/emails.
4. Avoid one query per row; resolve country/department IDs before generating
   rows.
5. Benchmark seed duration and representative list/dashboard queries at
   10,000 rows before making throughput claims.

## Known query limits

Employee count and result-page queries execute separately. Dashboard aggregates
return one result per country/currency and per country/job title; result size
therefore grows with distinct groups, not employee count. Job-title aggregates
do not include currency, so salary comparisons assume one currency per
country. Do not interpret mixed-currency values as comparable.

No response cache, background export, or dashboard cache is currently used.
Introduce them only after measurements show a need.
