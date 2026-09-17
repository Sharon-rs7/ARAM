export default function MetricCard({ label, value, tone = 'blue', icon }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <span>View all</span>
      </div>
      <div className="metric-icon">{icon}</div>
    </div>
  );
}
