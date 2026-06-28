import { API_BASE } from './apiBase.js';
import { authHeaders } from './authApi.js';

async function adminRequest(path, options = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.detail || payload.title?.[0] || 'Request failed';
    throw new Error(Array.isArray(detail) ? detail[0] : detail);
  }
  return payload;
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  return payload.results || [];
}

export async function fetchAdminDashboard() {
  return adminRequest('/recruitment/dashboard/');
}

export async function fetchAdminUsers() {
  return adminRequest('/users/');
}

export async function updateUserRole(userId, role) {
  return adminRequest(`/users/${userId}/role/`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function fetchAdminJobs(params = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('search', params.q);
  search.set('page_size', String(params.pageSize || 100));
  const query = search.toString();
  return adminRequest(`/recruitment/jobs/${query ? `?${query}` : ''}`);
}

export async function createAdminJob(data) {
  return adminRequest('/recruitment/jobs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAdminApplications(params = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.job) search.set('job', params.job);
  return adminRequest(`/recruitment/applications/${search.toString() ? `?${search}` : ''}`);
}

export async function updateAdminApplication(id, data) {
  return adminRequest(`/recruitment/applications/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchAdminTalents(params = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.is_verified !== undefined) search.set('is_verified', params.is_verified ? 'true' : 'false');
  search.set('page_size', '100');
  const query = search.toString();
  return adminRequest(`/recruitment/talents/${query ? `?${query}` : ''}`);
}

export async function verifyAdminTalent(id, isVerified) {
  return adminRequest(`/recruitment/talents/${id}/verify/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_verified: isVerified }),
  });
}

export async function fetchAdminInsightDrafts(params = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.moderation_status) search.set('moderation_status', params.moderation_status);
  search.set('page_size', '50');
  const query = search.toString();
  return adminRequest(`/insights/drafts/${query ? `?${query}` : ''}`);
}

export async function publishAdminInsight(slug) {
  return adminRequest(`/insights/${slug}/publish/`, { method: 'POST' });
}

export async function unpublishAdminInsight(slug) {
  return adminRequest(`/insights/${slug}/unpublish/`, { method: 'POST' });
}

export async function deleteAdminInsight(slug) {
  return adminRequest(`/insights/editor/${slug}/`, { method: 'DELETE' });
}

export async function createAdminInsightDraft(data) {
  return adminRequest('/insights/drafts/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
