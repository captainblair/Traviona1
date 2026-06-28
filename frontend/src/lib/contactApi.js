import { API_BASE } from './apiBase.js';

export const contactTopics = [
  { id: 'general', label: 'General enquiry' },
  { id: 'advisory', label: 'Advisory services' },
  { id: 'careers', label: 'Careers' },
  { id: 'talent', label: 'Talent network' },
  { id: 'media', label: 'Media & press' },
];

const fallbackContact = {
  email: 'info@travionaconsulting.top',
  phone: '+254 111 414 4441',
  address: '',
};

export async function fetchContactInformation() {
  try {
    const response = await fetch(`${API_BASE}/website/contact/`);
    if (!response.ok) throw new Error('Contact info unavailable');
    return await response.json();
  } catch {
    return fallbackContact;
  }
}

export async function submitContactEnquiry(payload) {
  try {
    const response = await fetch(`${API_BASE}/website/contact/enquiries/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail =
        data.detail ||
        data.email?.[0] ||
        data.full_name?.[0] ||
        data.message?.[0] ||
        'Unable to send your message.';
      throw new Error(Array.isArray(detail) ? detail[0] : detail);
    }

    return data;
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch')) {
      throw error;
    }

    // Offline/demo fallback — log locally so UX still works in dev without API
    console.info('Contact enquiry (local fallback):', payload);
    return { id: 'local', ...payload, created_at: new Date().toISOString() };
  }
}
