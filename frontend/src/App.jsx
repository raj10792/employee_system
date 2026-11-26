import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, employeeQuery } from "./api";
import { formatMoney, initials, statusName } from "./format";

const EMPTY_FORM = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  job_title: "",
  salary: "",
  currency: "",
  employment_status: "active",
  joining_date: "",
  country_id: "",
  department_id: "",
};

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("people-pay-session") || "null");
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState(readSession);
  const [activePage, setActivePage] = useState("Overview");
  const [notice, setNotice] = useState("");

  const signOut = useCallback(() => {
    if (session?.token) {
      apiRequest("/logout", { method: "DELETE", token: session.token }).catch(() => {});
    }
    localStorage.removeItem("people-pay-session");
    setSession(null);
  }, [session]);

  if (!session?.token) {
    return (
      <Login
        onLogin={(nextSession) => {
          localStorage.setItem("people-pay-session", JSON.stringify(nextSession));
          setSession(nextSession);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setActivePage("Overview")}>
          <span className="brand-mark">p</span>
          <span>people<span className="brand-light">&amp;pay</span></span>
        </a>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={activePage === "Overview" ? "nav-item selected" : "nav-item"}
            onClick={() => setActivePage("Overview")}
          >
            <span className="nav-icon">◫</span> Overview
          </button>
          <button
            className={activePage === "Employees" ? "nav-item selected" : "nav-item"}
            onClick={() => setActivePage("Employees")}
          >
            <span className="nav-icon">♙</span> Employees
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><span className="secure-dot" /> Workspace secure</div>
          <button className="profile" onClick={signOut} title="Sign out">
            <span className="avatar avatar-small">{initials(session.user?.email)}</span>
            <span className="profile-copy">
              <strong>{session.user?.email}</strong>
              <small>{session.user?.role?.replace("_", " ") || "HR manager"}</small>
            </span>
            <span className="logout-icon">↪</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b>{activePage}</div>
          <div className="topbar-right">
            <span className="today-label">{new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
            <span className="avatar">{initials(session.user?.email)}</span>
          </div>
        </header>
        <div className="page-content">
          {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
          {activePage === "Overview" ? (
            <Dashboard token={session.token} />
          ) : (
            <Employees
              token={session.token}
              isAdmin={session.user?.role === "admin"}
              onNotice={setNotice}
              onUnauthorized={signOut}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin({ token: response.token, user: response.user });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" />
      <div className="login-decoration decoration-two" />
      <section className="login-card">
        <a className="brand login-brand" href="#">
          <span className="brand-mark">p</span><span>people<span className="brand-light">&amp;pay</span></span>
        </a>
        <p className="eyebrow">PEOPLE OPERATIONS</p>
        <h1>Good to have<br />you back.</h1>
        <p className="login-subtitle">Sign in to manage your people and payroll insights.</p>
        <form className="login-form" onSubmit={submit}>
          <label htmlFor="login-email">Work email</label>
          <input id="login-email" autoComplete="username" type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" autoComplete="current-password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"} <span>→</span>
          </button>
        </form>
        <p className="login-footnote"><span className="secure-dot" /> Secure access for your organization</p>
      </section>
      <div className="login-aside">
        <div className="aside-orbit orbit-a" /><div className="aside-orbit orbit-b" />
        <div className="aside-content">
          <span className="aside-tag">YOUR PEOPLE, IN FOCUS</span>
          <h2>Better decisions<br />start with a clearer<br /><em>people picture.</em></h2>
          <p>One calm place to understand your team, compensation, and what comes next.</p>
          <div className="aside-stat"><div className="stat-avatars"><span>A</span><span>M</span><span>J</span><span>+</span></div><div><strong>People first.</strong><small>Built for thoughtful teams</small></div></div>
        </div>
        <small className="aside-copyright">PEOPLE &amp; PAYROLL, MADE HUMAN.</small>
      </div>
    </main>
  );
}

function useRemoteData(token, path, dependencies = []) {
  const [state, setState] = useState({ data: null, error: "", loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: "" }));
    apiRequest(path, { token, signal: controller.signal })
      .then((response) => setState({ data: response.data, error: "", loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ data: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  // `dependencies` carries query values; path and token are intentionally the stable fetch inputs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, path, ...dependencies]);

  return state;
}

function Dashboard({ token }) {
  const { data, error, loading } = useRemoteData(token, "/salaries");
  const [country, setCountry] = useState("");
  const countryRows = data?.salary_by_country || [];
  const jobRows = data?.salary_by_job_title || [];
  const countries = useMemo(
    () => [...new Set(countryRows.map((row) => row.country))].sort(),
    [countryRows],
  );
  const selectedCountry = country || countries[0] || "";
  const selectedStats = countryRows.filter((row) => row.country === selectedCountry);
  const selectedJobs = jobRows
    .filter((row) => row.country === selectedCountry)
    .sort((left, right) => Number(right.employee_count) - Number(left.employee_count));
  const summary = data?.summary || {};

  useEffect(() => {
    if (country && !countries.includes(country)) setCountry("");
  }, [country, countries]);

  if (loading) return <LoadingState label="Loading salary insights" />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <div className="page-heading heading-with-action">
        <div><p className="eyebrow">THURSDAY, YOUR PEOPLE SNAPSHOT</p><h1>Good morning<span className="heading-period">.</span></h1><p className="page-subtitle">Here’s a clear view of your team and compensation.</p></div>
        <button className="button button-quiet" onClick={() => window.location.reload()}><span className="refresh-icon">↻</span> Refresh data</button>
      </div>
      <section className="metric-grid" aria-label="Employee summary">
        <MetricCard label="Total employees" value={summary.ttotal_employees ?? summary.total_employees ?? 0} icon="♙" accent="violet" />
        <MetricCard label="Active employees" value={summary.active_employees ?? 0} icon="↗" accent="green" foot="Currently on the team" />
        <MetricCard label="Inactive" value={summary.inactive_employees ?? 0} icon="◷" accent="amber" foot="Not currently active" />
        <MetricCard label="Terminated" value={summary.terminated_employees ?? 0} icon="↘" accent="rose" foot="Former employees" />
      </section>
      <section className="insights-section">
        <div className="section-heading">
          <div><p className="eyebrow">COMPENSATION</p><h2>Salary insights</h2><p className="section-subtitle">Benchmarks for active employees in each market.</p></div>
          <label className="select-wrap country-picker"><span>Country</span><select aria-label="Salary insights country" value={selectedCountry} onChange={(event) => setCountry(event.target.value)}>{countries.length ? countries.map((name) => <option key={name}>{name}</option>) : <option value="">No country data</option>}</select></label>
        </div>
        {selectedStats.length ? (
          <div className="salary-cards">
            {selectedStats.map((row) => (
              <article className="salary-card" key={`${row.country}-${row.currency}`}>
                <div className="salary-card-top"><span className="country-symbol">{row.country.slice(0, 2).toUpperCase()}</span><span className="currency-badge">{row.currency}</span></div>
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
      <section className="job-section">
        <div className="section-heading job-heading">
          <div><p className="eyebrow">ROLE BENCHMARKS</p><h2>Average salary by role</h2><p className="section-subtitle">Compare average pay across job titles in {selectedCountry || "your organization"}.</p></div>
          <span className="result-count">{selectedJobs.length} {selectedJobs.length === 1 ? "role" : "roles"}</span>
        </div>
        {selectedJobs.length ? (
          <div className="table-card role-table-wrap">
            <table className="data-table role-table">
              <thead><tr><th>JOB TITLE</th><th>EMPLOYEES</th><th>AVERAGE SALARY</th><th>BENCHMARK</th></tr></thead>
              <tbody>{selectedJobs.slice(0, 8).map((row, index) => {
                const max = Number(selectedJobs[0]?.average_salary) || 1;
                const percent = Math.max(8, Math.min(100, (Number(row.average_salary) / max) * 100));
                return <tr key={`${row.job_title}-${row.country}`}><td><span className="role-dot" />{row.job_title}</td><td>{Number(row.employee_count).toLocaleString()}</td><td className="salary-cell">{formatMoney(row.average_salary, selectedStats[0]?.currency || "USD")}</td><td><div className="benchmark-track"><span style={{ width: `${percent}%` }} /></div></td></tr>;
              })}</tbody>
            </table>
            {selectedJobs.length > 8 && <p className="table-footnote">Showing 8 of {selectedJobs.length} job titles.</p>}
          </div>
        ) : <EmptyState title="No roles to benchmark" text="Role averages will appear once you have active employees in this country." />}
      </section>
    </>
  );
}

function MetricCard({ label, value, icon, accent, foot }) {
  return <article className="metric-card"><div className={`metric-icon ${accent}`}>{icon}</div><span className="metric-label">{label}</span><strong className="metric-value">{Number(value).toLocaleString()}</strong><span className="metric-foot">{foot || "Across your organization"}</span></article>;
}

function SalaryValue({ label, amount, currency, emphasized }) {
  return <div className={emphasized ? "salary-value emphasized" : "salary-value"}><span>{label}</span><strong>{formatMoney(amount, currency)}</strong></div>;
}

function Employees({ token, isAdmin, onNotice, onUnauthorized }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [querySearch, setQuerySearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ total_count: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookups, setLookups] = useState({ countries: [], departments: [] });
  const [modalEmployee, setModalEmployee] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuerySearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/lookups", { token, signal: controller.signal })
      .then((response) => setLookups(response.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiRequest(`/employees${employeeQuery({ search: querySearch, status, page })}`, { token, signal: controller.signal })
      .then((response) => {
        setEmployees(response.data);
        setMeta(response.meta);
        setLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setError(requestError.message);
        setLoading(false);
        if (requestError.message === "Unauthorized") onUnauthorized();
      });
    return () => controller.abort();
  }, [token, querySearch, status, page, refresh, onUnauthorized]);

  async function saveEmployee(formData) {
    const method = modalEmployee ? "PATCH" : "POST";
    const path = modalEmployee ? `/employees/${modalEmployee.id}` : "/employees";
    await apiRequest(path, { token, method, body: JSON.stringify({ employee: formData }) });
    setModalEmployee(undefined);
    setRefresh((value) => value + 1);
    onNotice(modalEmployee ? "Employee details updated." : "Employee added to your team.");
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Delete ${employee.full_name}? This cannot be undone.`)) return;
    setDeleting(employee.id);
    try {
      await apiRequest(`/employees/${employee.id}`, { token, method: "DELETE" });
      if (employees.length === 1 && page > 1) setPage((value) => value - 1);
      else setRefresh((value) => value + 1);
      onNotice(`${employee.full_name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="page-heading employees-heading">
        <div><p className="eyebrow">YOUR ORGANIZATION</p><h1>Employees<span className="heading-period">.</span></h1><p className="page-subtitle">Manage your team’s details and compensation.</p></div>
        <button className="button button-primary" onClick={() => setModalEmployee(null)}><span className="plus">+</span> Add employee</button>
      </div>
      <section className="employee-panel">
        <div className="employee-panel-heading"><div><h2>All employees</h2><p>{Number(meta.total_count || 0).toLocaleString()} people in your organization</p></div><div className="employee-tools">
          <label className="search-field"><span>⌕</span><input aria-label="Search employees" placeholder="Search name, email or ID..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
          <label className="filter-select"><span className="sr-only">Filter by status</span><select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="terminated">Terminated</option></select></label>
        </div></div>
        {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
        <div className="table-scroll">
          <table className="data-table employee-table">
            <thead><tr><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>JOB TITLE</th><th>COUNTRY</th><th>SALARY</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{loading ? <tr><td className="table-message" colSpan="7">Loading employee records…</td></tr> : employees.length ? employees.map((employee) => (
              <tr key={employee.id}>
                <td><div className="employee-cell"><span className="avatar employee-avatar">{initials(employee.full_name)}</span><span><strong>{employee.full_name}</strong><small>{employee.email}</small></span></div></td>
                <td className="code-cell">{employee.employee_code}</td>
                <td>{employee.job_title}</td>
                <td>{employee.country?.name || "—"}</td>
                <td className="salary-cell">{formatMoney(employee.salary, employee.currency)}</td>
                <td><span className={`status-pill ${statusName(employee.employment_status)}`}><i />{statusName(employee.employment_status)}</span></td>
                <td><div className="row-actions"><button title={`Edit ${employee.full_name}`} aria-label={`Edit ${employee.full_name}`} onClick={() => setModalEmployee(employee)}>✎</button>{isAdmin && <button className="danger-action" title={`Delete ${employee.full_name}`} aria-label={`Delete ${employee.full_name}`} disabled={deleting === employee.id} onClick={() => deleteEmployee(employee)}>⌫</button>}</div></td>
              </tr>
            )) : <tr><td colSpan="7"><EmptyState title={querySearch || status ? "No matching employees" : "Your team starts here"} text={querySearch || status ? "Try changing the search or status filter." : "Add your first employee to start managing your team."} /></td></tr>}</tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {employees.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, Number(meta.total_count || 0))} of {Number(meta.total_count || 0).toLocaleString()}</span>
          <div><button className="page-button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>← Previous</button><span className="page-number">{page} <span>of</span> {Math.max(1, meta.total_pages || 1)}</span><button className="page-button" disabled={page >= (meta.total_pages || 1) || loading} onClick={() => setPage((value) => value + 1)}>Next →</button></div>
        </div>
      </section>
      {modalEmployee !== undefined && (
        <EmployeeModal
          employee={modalEmployee}
          lookups={lookups}
          onClose={() => setModalEmployee(undefined)}
          onSave={saveEmployee}
        />
      )}
    </>
  );
}

function EmployeeModal({ employee, lookups, onClose, onSave }) {
  const [form, setForm] = useState(() => employee ? {
    employee_code: employee.employee_code || "",
    first_name: employee.first_name || "",
    last_name: employee.last_name || "",
    email: employee.email || "",
    job_title: employee.job_title || "",
    salary: employee.salary ?? "",
    currency: employee.currency || employee.country?.currency_code || "",
    employment_status: statusName(employee.employment_status),
    joining_date: employee.joining_date || "",
    country_id: String(employee.country_id || employee.country?.id || ""),
    department_id: String(employee.department_id || employee.department?.id || ""),
  } : {
    ...EMPTY_FORM,
    country_id: String(lookups.countries[0]?.id || ""),
    department_id: String(lookups.departments[0]?.id || ""),
    currency: lookups.countries[0]?.currency_code || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "country_id") {
        next.currency = lookups.countries.find((country) => String(country.id) === value)?.currency_code || current.currency;
      }
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, salary: Number(form.salary), country_id: Number(form.country_id), department_id: Number(form.department_id) });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><p className="eyebrow">{employee ? "EMPLOYEE PROFILE" : "NEW TEAM MEMBER"}</p><h2 id="modal-title">{employee ? "Edit employee" : "Add an employee"}</h2><p>Keep employee and compensation details up to date.</p></div><button className="close-button" onClick={onClose} aria-label="Close dialog">×</button></div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="First name" name="first_name" value={form.first_name} onChange={updateField} required />
            <Field label="Last name" name="last_name" value={form.last_name} onChange={updateField} required />
            <Field label="Work email" name="email" type="email" value={form.email} onChange={updateField} required />
            <Field label="Employee ID" name="employee_code" value={form.employee_code} onChange={updateField} required />
            <Field label="Job title" name="job_title" value={form.job_title} onChange={updateField} required />
            <label className="form-field"><span>Department</span><select name="department_id" value={form.department_id} onChange={updateField} required><option value="" disabled>Select department</option>{lookups.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
            <label className="form-field"><span>Country</span><select name="country_id" value={form.country_id} onChange={updateField} required><option value="" disabled>Select country</option>{lookups.countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}</select></label>
            <Field label="Annual salary" name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={updateField} required />
            <Field label="Currency" name="currency" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} required maxLength="3" />
            <Field label="Joining date" name="joining_date" type="date" value={form.joining_date} onChange={updateField} required />
            <label className="form-field"><span>Status</span><select name="employment_status" value={form.employment_status} onChange={updateField}><option value="active">Active</option><option value="inactive">Inactive</option><option value="terminated">Terminated</option></select></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving || !lookups.countries.length || !lookups.departments.length}>{saving ? "Saving…" : employee ? "Save changes" : "Add employee"}</button></div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, name, onChange, ...inputProps }) {
  return <label className="form-field"><span>{label}</span><input name={name} onChange={onChange} {...inputProps} /></label>;
}

function LoadingState({ label }) {
  return <div className="loading-state"><span className="spinner" />{label}…</div>;
}

function ErrorState({ message }) {
  return <div className="error-state"><strong>We couldn’t load this view.</strong><span>{message}</span></div>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon">◌</span><strong>{title}</strong><span>{text}</span></div>;
}

export default App;
