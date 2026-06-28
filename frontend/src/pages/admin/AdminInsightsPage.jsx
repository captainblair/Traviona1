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
import {
  createAdminInsightDraft,
  deleteAdminInsight,
  fetchAdminInsightDrafts,
  publishAdminInsight,
  unpublishAdminInsight,
  unwrapList,
} from '../../lib/adminApi.js';

const emptyDraft = {
  title: '',
  summary: '',
  content: '',
  author_name: '',
  category: '',
};

export default function AdminInsightsPage() {
  const [drafts, setDrafts] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyDraft);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actingSlug, setActingSlug] = useState('');

  async function loadDrafts() {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchAdminInsightDrafts({ q: query || undefined });
      setDrafts(unwrapList(payload));
    } catch (err) {
      setError(err.message || 'Unable to load insight drafts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await createAdminInsightDraft(form);
      setForm(emptyDraft);
      setShowForm(false);
      setMessage('Draft created.');
      await loadDrafts();
    } catch (err) {
      setError(err.message || 'Unable to create draft.');
    } finally {
      setSubmitting(false);
    }
  }

  async function runAction(slug, action) {
    setActingSlug(slug);
    setError('');
    setMessage('');
    try {
      if (action === 'publish') await publishAdminInsight(slug);
      if (action === 'unpublish') await unpublishAdminInsight(slug);
      if (action === 'delete') await deleteAdminInsight(slug);
      setMessage(`Insight ${action === 'delete' ? 'deleted' : `${action}ed`} successfully.`);
      await loadDrafts();
    } catch (err) {
      setError(err.message || `Unable to ${action} insight.`);
    } finally {
      setActingSlug('');
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Insights"
        subtitle="Create drafts, publish articles, and manage editorial workflow."
        action={
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowForm((open) => !open)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? 'Close form' : 'New draft'}
          </button>
        }
      />

      {error && <AdminAlert>{error}</AdminAlert>}
      {message && <AdminAlert tone="success">{message}</AdminAlert>}

      {showForm && (
        <AdminPanel className="admin-form-panel">
          <h3 className="admin-panel-title">New insight draft</h3>
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
              <span>Author name</span>
              <input
                value={form.author_name}
                onChange={(event) => setForm((prev) => ({ ...prev, author_name: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Category</span>
              <input
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="admin-input"
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
              <span>Content</span>
              <textarea
                rows={8}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                className="admin-textarea"
              />
            </label>
            <div className="admin-field admin-field-span-2">
              <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">
                {submitting ? 'Saving…' : 'Save draft'}
              </button>
            </div>
          </form>
        </AdminPanel>
      )}

      <AdminPanel>
        <div className="admin-toolbar">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search drafts…"
            className="admin-input admin-input-search"
          />
          <button type="button" onClick={loadDrafts} className="admin-btn admin-btn-secondary">Search</button>
        </div>

        {loading ? (
          <p className="admin-muted">Loading drafts…</p>
        ) : drafts.length === 0 ? (
          <AdminEmpty message="No insight drafts found." />
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <strong>{draft.title}</strong>
                      <p className="admin-cell-muted">{draft.slug}</p>
                    </td>
                    <td>{draft.author_name || draft.author_detail?.name || '—'}</td>
                    <td>
                      <AdminBadge tone={draft.moderation_status || 'draft'}>
                        {draft.moderation_status || 'draft'}
                      </AdminBadge>
                    </td>
                    <td>{new Date(draft.updated_at || draft.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          disabled={actingSlug === draft.slug}
                          onClick={() => runAction(draft.slug, 'publish')}
                          className="admin-btn admin-btn-sm admin-btn-primary"
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          disabled={actingSlug === draft.slug}
                          onClick={() => runAction(draft.slug, 'unpublish')}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          Unpublish
                        </button>
                        <button
                          type="button"
                          disabled={actingSlug === draft.slug}
                          onClick={() => runAction(draft.slug, 'delete')}
                          className="admin-btn admin-btn-sm admin-btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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
