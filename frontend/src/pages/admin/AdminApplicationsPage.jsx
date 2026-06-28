import { useEffect, useMemo, useState } from 'react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminTableWrap,
} from '../../components/admin/AdminUi.jsx';
import {
  fetchAdminApplications,
  fetchAdminJobs,
  fetchAdminUsers,
  unwrapList,
  updateAdminApplication,
} from '../../lib/adminApi.js';
import { APPLICATION_STATUSES, formatStatusLabel } from '../../lib/adminAccess.js';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobsById, setJobsById] = useState({});
  const [usersById, setUsersById] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [appsPayload, jobsPayload, usersPayload] = await Promise.all([
        fetchAdminApplications({ status: statusFilter || undefined }),
        fetchAdminJobs({ pageSize: 200 }),
        fetchAdminUsers(),
      ]);
      const apps = unwrapList(appsPayload);
      const jobs = unwrapList(jobsPayload);
      const users = unwrapList(usersPayload);
      setApplications(apps);
      setJobsById(Object.fromEntries(jobs.map((job) => [job.id, job])));
      setUsersById(Object.fromEntries(users.map((user) => [user.id, user])));
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function handleStatusChange(appId, status) {
    setSavingId(appId);
    setError('');
    try {
      const updated = await updateAdminApplication(appId, { status });
      setApplications((prev) => prev.map((item) => (item.id === appId ? updated : item)));
    } catch (err) {
      setError(err.message || 'Unable to update application.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleNotesBlur(appId, notes) {
    setSavingId(appId);
    setError('');
    try {
      const updated = await updateAdminApplication(appId, { notes });
      setApplications((prev) => prev.map((item) => (item.id === appId ? updated : item)));
    } catch (err) {
      setError(err.message || 'Unable to save notes.');
    } finally {
      setSavingId(null);
    }
  }

  const sorted = useMemo(
    () => [...applications].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)),
    [applications],
  );

  return (
    <>
      <AdminPageHeader
        title="Applications"
        subtitle="Review candidate submissions and update hiring status."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminPanel>
        <div className="admin-toolbar">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-select"
          >
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="admin-muted">Loading applications…</p>
        ) : sorted.length === 0 ? (
          <AdminEmpty message="No applications yet." />
        ) : (
          <div className="admin-card-list">
            {sorted.map((app) => {
              const job = jobsById[app.job];
              const applicant = usersById[app.applicant];
              return (
                <article key={app.id} className="admin-card">
                  <div className="admin-card-head">
                    <div>
                      <h3 className="admin-card-title">{job?.title || `Job #${app.job}`}</h3>
                      <p className="admin-card-meta">
                        {applicant
                          ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || applicant.username
                          : `User #${app.applicant}`}
                        {' · '}
                        {applicant?.email || '—'}
                      </p>
                    </div>
                    <AdminBadge tone={app.status}>{formatStatusLabel(app.status)}</AdminBadge>
                  </div>

                  {app.cover_letter && (
                    <p className="admin-card-body">{app.cover_letter}</p>
                  )}

                  <div className="admin-card-actions">
                    <label className="admin-inline-field">
                      <span>Status</span>
                      <select
                        value={app.status}
                        disabled={savingId === app.id}
                        onChange={(event) => handleStatusChange(app.id, event.target.value)}
                        className="admin-select"
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-inline-field admin-inline-field-grow">
                      <span>Recruiter notes</span>
                      <input
                        defaultValue={app.notes || ''}
                        disabled={savingId === app.id}
                        onBlur={(event) => {
                          if (event.target.value !== (app.notes || '')) {
                            handleNotesBlur(app.id, event.target.value);
                          }
                        }}
                        className="admin-input"
                        placeholder="Internal notes…"
                      />
                    </label>
                  </div>

                  <p className="admin-card-foot">
                    Applied {new Date(app.applied_at).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </AdminPanel>
    </>
  );
}
