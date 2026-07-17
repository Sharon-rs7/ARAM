export default function StatusBadge({ children, type = 'info' }) {
  return <span className={`status-badge ${type}`}>{children}</span>;
}
