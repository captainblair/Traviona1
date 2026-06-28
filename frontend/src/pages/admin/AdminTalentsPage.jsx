import { useEffect, useState } from 'react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminTableWrap,
} from '../../components/admin/AdminUi.jsx';
import { fetchAdminTalents, unwrapList, verifyAdminTalent } from '../../lib/adminApi.js';

export default function AdminTalentsPage() {
  const [talents, setTalents] = useState([]);
  const [query, setQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadTalents() {
    setLoading(true);
    setError('');
    try {
      const params = { q: query || undefined };
      if (verifiedFilter === 'verified') params.is_verified = true;
      if (verifiedFilter === 'unverified') params.is_verified = false;
      const payload = await fetchAdminTalents(params);
      setTalents(unwrapList(payload));
    } catch (err) {
      setError(err.message || 'Unable to load talent profiles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTalents();
  }, [verifiedFilter]);

  async function handleVerify(id, isVerified) {
    setSavingId(id);
    setError('');
    try {
      const updated = await verifyAdminTalent(id, isVerified);
      setTalents((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err.message || 'Unable to update verification.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Talent network"
        subtitle="Review public expert profiles and verify members."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminPanel>
        <div className="admin-toolbar">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search talent…"
            className="admin-input admin-input-search"
          />
          <select
            value={verifiedFilter}
            onChange={(event) => setVerifiedFilter(event.target.value)}
            className="admin-select"
          >
            <option value="all">All profiles</option>
            <option value="verified">Verified only</option>
            <option value="unverified">Awaiting verification</option>
          </select>
          <button type="button" onClick={loadTalents} className="admin-btn admin-btn-secondary">
            Search
          </button>
        </div>

        {loading ? (
          <p className="admin-muted">Loading talent profiles…</p>
        ) : talents.length === 0 ? (
          <AdminEmpty message="No public talent profiles found." />
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {talents.map((talent) => (
                  <tr key={talent.id}>
                    <td>
                      <strong>{talent.full_name}</strong>
                      <p className="admin-cell-muted">{talent.headline}</p>
                    </td>
                    <td>{talent.specialization || '—'}</td>
                    <td>{talent.location || '—'}</td>
                    <td>{talent.years_experience ? `${talent.years_experience} yrs` : '—'}</td>
                    <td>
                      <AdminBadge tone={talent.is_verified ? 'success' : 'warning'}>
                        {talent.is_verified ? 'Verified' : 'Unverified'}
                      </AdminBadge>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={savingId === talent.id}
                        onClick={() => handleVerify(talent.id, !talent.is_verified)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        {talent.is_verified ? 'Revoke' : 'Verify'}
                      </button>
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
