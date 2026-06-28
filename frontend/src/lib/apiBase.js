export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAdminPanelUrl() {
  if (API_BASE.startsWith('http')) {
    return `${API_BASE.replace(/\/api\/?$/, '')}/admin/`;
  }
  return 'http://localhost:8000/admin/';
}

/** Build a URL for API requests (supports relative `/api` via Vite proxy). */
export function resolveApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const endpoint = `${API_BASE.replace(/\/$/, '')}${normalizedPath}`;

  if (API_BASE.startsWith('http')) {
    return new URL(endpoint);
  }

  return new URL(endpoint, window.location.origin);
}
