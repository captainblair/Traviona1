import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AdminAlert,
  AdminBadge,
  AdminPanel,
  AdminPageHeader,
  AdminStatCard,
  AdminStatGrid,
  AdminTableWrap,
} from '../../components/admin/AdminUi.jsx';
import { fetchAdminDashboard, fetchAdminInsightDrafts, unwrapList } from '../../lib/adminApi.js';
import { canManageInsights, canManageRecruitment, formatStatusLabel } from '../../lib/adminAccess.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [draftCount, setDraftCount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const tasks = [];
        if (canManageRecruitment(user)) {
          tasks.push(fetchAdminDashboard().then((data) => ({ dashboard: data })));
        }
        if (canManageInsights(user)) {
          tasks.push(
            fetchAdminInsightDrafts()
              .then((data) => ({ drafts: unwrapList(data).length }))
              .catch(() => ({ drafts: 0 })),
          );
        }
        const results = await Promise.all(tasks);
        if (cancelled) return;
        results.forEach((result) => {
          if ('dashboard' in result) setDashboard(result.dashboard);
          if ('drafts' in result) setDraftCount(result.drafts);
        });
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return <p className="admin-muted">Loading dashboard…</p>;
  }

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of recruitment, talent, and editorial activity."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      {dashboard && (
        <>
          <AdminStatGrid>
            <AdminStatCard label="Active jobs" value={dashboard.active_jobs} tone="tide" />
            <AdminStatCard label="Total applications" value={dashboard.total_applications} tone="ink" />
            <AdminStatCard label="Public talent profiles" value={dashboard.public_talent_profiles} />
            <AdminStatCard label="Verified talent" value={dashboard.verified_talent_profiles} tone="success" />
            {draftCount !== null && (
              <AdminStatCard label="Insight drafts" value={draftCount} tone="warning" />
            )}
          </AdminStatGrid>

          <div className="admin-dashboard-grid">
            <AdminPanel>
              <h3 className="admin-panel-title">Applications by status</h3>
              <div className="admin-status-grid">
                {Object.entries(dashboard.applications_by_status || {}).map(([status, total]) => (
                  <div key={status} className="admin-status-item">
                    <AdminBadge tone={status}>{formatStatusLabel(status)}</AdminBadge>
                    <span className="admin-status-count">{total}</span>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel>
              <div className="admin-panel-head">
                <h3 className="admin-panel-title">Recent applications</h3>
                <Link to="/admin/applications" className="admin-inline-link">
                  View all
                </Link>
              </div>
              <AdminTableWrap>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Applicant</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboard.recent_applications || []).map((app) => (
                      <tr key={app.id}>
                        <td>#{app.job}</td>
                        <td>User #{app.applicant}</td>
                        <td>
                          <AdminBadge tone={app.status}>{formatStatusLabel(app.status)}</AdminBadge>
                        </td>
                        <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableWrap>
            </AdminPanel>
          </div>
        </>
      )}

      {!dashboard && !error && (
        <AdminPanel>
          <p className="admin-muted">Recruitment metrics are available to recruiter and admin roles.</p>
        </AdminPanel>
      )}

      <div className="admin-quick-links">
        {canManageRecruitment(user) && (
          <>
            <Link to="/admin/jobs" className="admin-quick-link">Manage jobs</Link>
            <Link to="/admin/applications" className="admin-quick-link">Review applications</Link>
            <Link to="/admin/talents" className="admin-quick-link">Verify talent</Link>
          </>
        )}
        {canManageInsights(user) && (
          <Link to="/admin/insights" className="admin-quick-link">Edit insight drafts</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin/users" className="admin-quick-link">Manage users</Link>
        )}
      </div>
    </>
  );
}
