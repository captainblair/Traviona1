import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminTableWrap,
} from '../../components/admin/AdminUi.jsx';
import { createAdminJob, fetchAdminJobs, unwrapList } from '../../lib/adminApi.js';

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
];

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  location: '',
  employment_type: 'full_time',
  salary_range: '',
  experience_level: '',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadJobs() {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchAdminJobs({ q: query, pageSize: 200 });
      setJobs(unwrapList(payload));
    } catch (err) {
      setError(err.message || 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadJobs();
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await createAdminJob(form);
      setForm(emptyForm);
      setShowForm(false);
      setMessage('Job posted successfully.');
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Unable to create job.');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = jobs.filter((job) => {
    if (!query.trim()) return true;
    const haystack = `${job.title} ${job.location} ${job.summary}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <AdminPageHeader
        title="Jobs"
        subtitle="Post and review active career listings."
        action={
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowForm((open) => !open)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? 'Close form' : 'Post new job'}
          </button>
        }
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {message && <AdminAlert tone="success">{message}</AdminAlert>}

      {showForm && (
        <AdminPanel className="admin-form-panel">
          <h3 className="admin-panel-title">New job posting</h3>
          <form className="admin-form-grid" onSubmit={handleCreate}>
            <label className="admin-field admin-field-span-2">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Location</span>
              <input
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Employment type</span>
              <select
                value={form.employment_type}
                onChange={(event) => setForm((prev) => ({ ...prev, employment_type: event.target.value }))}
                className="admin-select"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Salary range</span>
              <input
                value={form.salary_range}
                onChange={(event) => setForm((prev) => ({ ...prev, salary_range: event.target.value }))}
                className="admin-input"
                placeholder="e.g. £60k–£80k"
              />
            </label>
            <label className="admin-field">
              <span>Experience level</span>
              <input
                value={form.experience_level}
                onChange={(event) => setForm((prev) => ({ ...prev, experience_level: event.target.value }))}
                className="admin-input"
                placeholder="e.g. Senior"
              />
            </label>
            <label className="admin-field admin-field-span-2">
              <span>Summary</span>
              <textarea
                rows={3}
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                className="admin-textarea"
              />
            </label>
            <label className="admin-field admin-field-span-2">
              <span>Description</span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="admin-textarea"
              />
            </label>
            <div className="admin-field admin-field-span-2">
              <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                {submitting ? 'Publishing…' : 'Publish job'}
              </button>
            </div>
          </form>
        </AdminPanel>
      )}

      <AdminPanel>
        <form className="admin-toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search jobs…"
            className="admin-input admin-input-search"
          />
          <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
        </form>

        {loading ? (
          <p className="admin-muted">Loading jobs…</p>
        ) : filtered.length === 0 ? (
          <AdminEmpty message="No jobs found." />
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <p className="admin-cell-muted">{job.slug}</p>
                    </td>
                    <td>{job.location || '—'}</td>
                    <td>{job.employment_type?.replace('_', ' ') || '—'}</td>
                    <td>{job.source_name || 'Traviona'}</td>
                    <td>
                      <AdminBadge tone={job.is_active ? 'success' : 'neutral'}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </AdminBadge>
                    </td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        )}
      </AdminPanel>
    </>
  );
}
