const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const ACCESS_KEY = 'traviona_access';
const REFRESH_KEY = 'traviona_refresh';
const USER_KEY = 'traviona_user';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistSession({ access, refresh, user }) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      payload.detail ||
      payload.username?.[0] ||
      payload.email?.[0] ||
      payload.password?.[0] ||
      'Request failed';
    throw new Error(Array.isArray(detail) ? detail[0] : detail);
  }
  return payload;
}

export async function login({ username, password, mfa_code = '' }) {
  const response = await fetch(`${API_BASE}/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, mfa_code }),
  });
  const payload = await parseResponse(response);
  persistSession(payload);
  return payload.user;
}

export async function register({ username, email, password, first_name, last_name, location, headline }) {
  const response = await fetch(`${API_BASE}/users/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      first_name,
      last_name,
      location,
      headline,
    }),
  });
  const payload = await parseResponse(response);
  persistSession(payload);
  return payload.user;
}

export async function fetchCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}/users/me/`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const user = await response.json();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE}/users/password/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return parseResponse(response);
}

export async function applyToJob(jobId, coverLetter) {
  const response = await fetch(`${API_BASE}/recruitment/jobs/${jobId}/apply/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ cover_letter: coverLetter }),
  });
  return parseResponse(response);
}
