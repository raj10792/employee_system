export default function SummaryCard({ label, value, icon, accent, foot }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${accent}`}>{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{Number(value).toLocaleString()}</strong>
      <span className="metric-foot">{foot || "Across your organization"}</span>
    </article>
  );
}
