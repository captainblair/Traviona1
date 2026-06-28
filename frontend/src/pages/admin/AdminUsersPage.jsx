import { useEffect, useState } from 'react';
import {
  AdminAlert,
  AdminBadge,
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminTableWrap,
} from '../../components/admin/AdminUi.jsx';
import { fetchAdminUsers, updateUserRole, unwrapList } from '../../lib/adminApi.js';
import { USER_ROLES, formatRoleLabel } from '../../lib/adminAccess.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchAdminUsers();
      setUsers(unwrapList(payload));
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, role) {
    setSavingId(userId);
    setError('');
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((item) => (item.id === userId ? updated : item)));
    } catch (err) {
      setError(err.message || 'Unable to update role.');
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter((item) => {
    const haystack = `${item.first_name} ${item.last_name} ${item.email} ${item.username}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <AdminPageHeader
        title="Users"
        subtitle="Manage member accounts and assign staff roles."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminPanel>
        <div className="admin-toolbar">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email…"
            className="admin-input admin-input-search"
          />
        </div>

        {loading ? (
          <p className="admin-muted">Loading users…</p>
        ) : filtered.length === 0 ? (
          <AdminEmpty message="No users matched your search." />
        ) : (
          <AdminTableWrap>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Change role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : item.username}</strong>
                      {item.id === currentUser?.id && (
                        <AdminBadge tone="tide">You</AdminBadge>
                      )}
                    </td>
                    <td>{item.email}</td>
                    <td>
                      <AdminBadge tone={item.role}>{formatRoleLabel(item.role)}</AdminBadge>
                    </td>
                    <td>{item.social_provider || 'Email'}</td>
                    <td>
                      <select
                        value={item.role}
                        disabled={savingId === item.id || item.id === currentUser?.id}
                        onChange={(event) => handleRoleChange(item.id, event.target.value)}
                        className="admin-select"
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
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
