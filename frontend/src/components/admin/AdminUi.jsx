export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        <h2 className="admin-page-title">{title}</h2>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="admin-page-action">{action}</div>}
    </div>
  );
}

export function AdminStatGrid({ children }) {
  return <div className="admin-stat-grid">{children}</div>;
}

export function AdminStatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`admin-stat-card admin-stat-card-${tone}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  );
}

export function AdminPanel({ children, className = '' }) {
  return <section className={`admin-panel ${className}`.trim()}>{children}</section>;
}

export function AdminBadge({ children, tone = 'neutral' }) {
  return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>;
}

export function AdminEmpty({ message }) {
  return <p className="admin-empty">{message}</p>;
}

export function AdminAlert({ tone = 'error', children }) {
  return <p className={`admin-alert admin-alert-${tone}`}>{children}</p>;
}

export function AdminTableWrap({ children }) {
  return <div className="admin-table-wrap">{children}</div>;
}
