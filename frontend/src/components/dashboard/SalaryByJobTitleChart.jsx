import { formatMoney } from "../../format";

export default function SalaryByJobTitleChart({ rows, country, currency }) {
  const jobs = rows
    .filter((row) => row.country === country)
    .sort((left, right) => Number(right.employee_count) - Number(left.employee_count));

  return (
    <section className="job-section">
      <div className="section-heading job-heading">
        <div>
          <p className="eyebrow">ROLE BENCHMARKS</p>
          <h2>Average salary by role</h2>
          <p className="section-subtitle">Compare average pay across job titles in {country || "your organization"}.</p>
        </div>
        <span className="result-count">{jobs.length} {jobs.length === 1 ? "role" : "roles"}</span>
      </div>
      {jobs.length ? (
        <div className="table-card role-table-wrap">
          <table className="data-table role-table">
            <thead><tr><th>JOB TITLE</th><th>EMPLOYEES</th><th>AVERAGE SALARY</th><th>BENCHMARK</th></tr></thead>
            <tbody>{jobs.slice(0, 8).map((row) => {
              const max = Number(jobs[0]?.average_salary) || 1;
              const percent = Math.max(8, Math.min(100, (Number(row.average_salary) / max) * 100));
              return (
                <tr key={`${row.job_title}-${row.country}`}>
                  <td><span className="role-dot" />{row.job_title}</td>
                  <td>{Number(row.employee_count).toLocaleString()}</td>
                  <td className="salary-cell">{formatMoney(row.average_salary, currency || "USD")}</td>
                  <td><div className="benchmark-track"><span style={{ width: `${percent}%` }} /></div></td>
                </tr>
              );
            })}</tbody>
          </table>
          {jobs.length > 8 && <p className="table-footnote">Showing 8 of {jobs.length} job titles.</p>}
        </div>
      ) : <EmptyState title="No roles to benchmark" text="Role averages will appear once you have active employees in this country." />}
    </section>
  );
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon">◌</span><strong>{title}</strong><span>{text}</span></div>;
}
