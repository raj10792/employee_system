import { useEffect, useMemo, useState } from "react";
import SalaryByCountryChart from "../components/dashboard/SalaryByCountryChart";
import SalaryByJobTitleChart from "../components/dashboard/SalaryByJobTitleChart";
import SummaryCard from "../components/dashboard/SummaryCard";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiRequest("/salaries", { token, signal: controller.signal })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [token, reload]);

  const countryRows = data?.salary_by_country || [];
  const jobRows = data?.salary_by_job_title || [];
  const countries = useMemo(
    () => [...new Set(countryRows.map((row) => row.country))].sort(),
    [countryRows],
  );
  const selectedCountry = country || countries[0] || "";
  const countryCurrency = countryRows.find((row) => row.country === selectedCountry)?.currency;
  const summary = data?.summary || {};

  useEffect(() => {
    if (country && !countries.includes(country)) setCountry("");
  }, [country, countries]);

  if (loading) return <LoadingState label="Loading salary insights" />;
  if (error) return <ErrorState message={error} />;

  const snapshotDay = new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  return (
    <>
      <div className="page-heading heading-with-action">
        <div>
          <p className="eyebrow">{snapshotDay}, YOUR PEOPLE SNAPSHOT</p>
          <h1>Good morning<span className="heading-period">.</span></h1>
          <p className="page-subtitle">Here’s a clear view of your team and compensation.</p>
        </div>
        <button className="button button-quiet" onClick={() => setReload((value) => value + 1)}>
          <span className="refresh-icon">↻</span> Refresh data
        </button>
      </div>
      <section className="metric-grid" aria-label="Employee summary">
        <SummaryCard label="Total employees" value={summary.ttotal_employees ?? summary.total_employees ?? 0} icon="♙" accent="violet" />
        <SummaryCard label="Active employees" value={summary.active_employees ?? 0} icon="↗" accent="green" foot="Currently on the team" />
        <SummaryCard label="Inactive" value={summary.inactive_employees ?? 0} icon="◷" accent="amber" foot="Not currently active" />
        <SummaryCard label="Terminated" value={summary.terminated_employees ?? 0} icon="↘" accent="rose" foot="Former employees" />
      </section>
      <SalaryByCountryChart
        rows={countryRows}
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryChange={setCountry}
      />
      <SalaryByJobTitleChart rows={jobRows} country={selectedCountry} currency={countryCurrency} />
    </>
  );
}

function LoadingState({ label }) {
  return <div className="loading-state"><span className="spinner" />{label}…</div>;
}

function ErrorState({ message }) {
  return <div className="error-state"><strong>We couldn’t load this view.</strong><span>{message}</span></div>;
}
