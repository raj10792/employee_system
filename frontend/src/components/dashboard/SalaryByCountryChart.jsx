import { formatMoney } from "../../format";

function SalaryValue({ label, amount, currency, emphasized }) {
  return (
    <div className={emphasized ? "salary-value emphasized" : "salary-value"}>
      <span>{label}</span>
      <strong>{formatMoney(amount, currency)}</strong>
    </div>
  );
}

export default function SalaryByCountryChart({ rows, countries, selectedCountry, onCountryChange }) {
  const selectedRows = rows.filter((row) => row.country === selectedCountry);

  return (
    <section className="insights-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">COMPENSATION</p>
          <h2>Salary insights</h2>
          <p className="section-subtitle">Benchmarks for active employees in each market.</p>
        </div>
        <label className="select-wrap country-picker">
          <span>Country</span>
          <select aria-label="Salary insights country" value={selectedCountry} onChange={(event) => onCountryChange(event.target.value)}>
            {countries.length ? countries.map((name) => <option key={name}>{name}</option>) : <option value="">No country data</option>}
          </select>
        </label>
      </div>
      {selectedRows.length ? (
        <div className="salary-cards">
          {selectedRows.map((row) => (
            <article className="salary-card" key={`${row.country}-${row.currency}`}>
              <div className="salary-card-top">
                <span className="country-symbol">{row.country.slice(0, 2).toUpperCase()}</span>
                <span className="currency-badge">{row.currency}</span>
              </div>
              <strong className="salary-country">{row.country}</strong>
              <p className="salary-count">{Number(row.employee_count).toLocaleString()} active employees</p>
              <div className="salary-range">
                <SalaryValue label="Average" amount={row.average_salary} currency={row.currency} emphasized />
                <SalaryValue label="Minimum" amount={row.minimum_salary} currency={row.currency} />
                <SalaryValue label="Maximum" amount={row.maximum_salary} currency={row.currency} />
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No salary data yet" text="Add active employees to see compensation benchmarks here." />}
    </section>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon">◌</span><strong>{title}</strong><span>{text}</span></div>;
}
