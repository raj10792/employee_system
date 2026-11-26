import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest, employeeQuery } from "../services/api";
import { formatMoney, initials, statusName } from "../format";

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

export default function EmployeesPage() {
  const { token, user, logout } = useAuth();
  const canDelete = ["admin", "hr_manager"].includes(user?.role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [querySearch, setQuerySearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ total_count: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lookups, setLookups] = useState({ countries: [], departments: [] });
  const [modalEmployee, setModalEmployee] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const onUnauthorized = useCallback(() => logout(), [logout]);

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
    setNotice(modalEmployee ? "Employee details updated." : "Employee added to your team.");
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Delete ${employee.full_name}? This cannot be undone.`)) return;
    setDeleting(employee.id);
    try {
      await apiRequest(`/employees/${employee.id}`, { token, method: "DELETE" });
      if (employees.length === 1 && page > 1) setPage((value) => value - 1);
      else setRefresh((value) => value + 1);
      setNotice(`${employee.full_name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="page-heading employees-heading">
        <div>
          <p className="eyebrow">YOUR ORGANIZATION</p>
          <h1>Employees<span className="heading-period">.</span></h1>
          <p className="page-subtitle">Manage your team’s details and compensation.</p>
        </div>
        <button className="button button-primary" onClick={() => setModalEmployee(null)}>
          <span className="plus">+</span> Add employee
        </button>
      </div>
      <section className="employee-panel">
        <div className="employee-panel-heading">
          <div><h2>All employees</h2><p>{Number(meta.total_count || 0).toLocaleString()} people in your organization</p></div>
          <div className="employee-tools">
            <label className="search-field">
              <span>⌕</span>
              <input aria-label="Search employees" placeholder="Search name, email or ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <kbd>⌘ K</kbd>
            </label>
            <label className="filter-select">
              <span className="sr-only">Filter by status</span>
              <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </label>
          </div>
        </div>
        {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
        <div className="table-scroll">
          <table className="data-table employee-table">
            <thead><tr><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>JOB TITLE</th><th>COUNTRY</th><th>SALARY</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {loading ? <tr><td className="table-message" colSpan="7">Loading employee records…</td></tr> : employees.length ? employees.map((employee) => (
                <tr key={employee.id}>
                  <td><div className="employee-cell"><span className="avatar employee-avatar">{initials(employee.full_name)}</span><span><strong>{employee.full_name}</strong><small>{employee.email}</small></span></div></td>
                  <td className="code-cell">{employee.employee_code}</td>
                  <td>{employee.job_title}</td>
                  <td>{employee.country?.name || "—"}</td>
                  <td className="salary-cell">{formatMoney(employee.salary, employee.currency)}</td>
                  <td><span className={`status-pill ${statusName(employee.employment_status)}`}><i />{statusName(employee.employment_status)}</span></td>
                  <td><div className="row-actions">
                    <button title={`Edit ${employee.full_name}`} aria-label={`Edit ${employee.full_name}`} onClick={() => setModalEmployee(employee)}>✎</button>
                    {canDelete && <button className="danger-action" title={`Delete ${employee.full_name}`} aria-label={`Delete ${employee.full_name}`} disabled={deleting === employee.id} onClick={() => deleteEmployee(employee)}>⌫</button>}
                  </div></td>
                </tr>
              )) : <tr><td colSpan="7"><EmptyState title={querySearch || status ? "No matching employees" : "Your team starts here"} text={querySearch || status ? "Try changing the search or status filter." : "Add your first employee to start managing your team."} /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {employees.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, Number(meta.total_count || 0))} of {Number(meta.total_count || 0).toLocaleString()}</span>
          <div>
            <button className="page-button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>← Previous</button>
            <span className="page-number">{page} <span>of</span> {Math.max(1, meta.total_pages || 1)}</span>
            <button className="page-button" disabled={page >= (meta.total_pages || 1) || loading} onClick={() => setPage((value) => value + 1)}>Next →</button>
          </div>
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
        <div className="modal-heading">
          <div><p className="eyebrow">{employee ? "EMPLOYEE PROFILE" : "NEW TEAM MEMBER"}</p><h2 id="modal-title">{employee ? "Edit employee" : "Add an employee"}</h2><p>Keep employee and compensation details up to date.</p></div>
          <button className="close-button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
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

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-icon">◌</span><strong>{title}</strong><span>{text}</span></div>;
}
