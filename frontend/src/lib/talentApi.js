import { dummyTalents } from '../data/dummyTalents.js';
import { resolveApiUrl } from './apiBase.js';

function buildTalentsUrl({ expertise, query } = {}) {
  const url = resolveApiUrl('/recruitment/talents/');

  if (expertise && expertise !== 'all') {
    url.searchParams.set('specialization', expertise.replace('-', ' '));
  }
  if (query?.trim()) {
    url.searchParams.set('q', query.trim());
  }

  return url.toString();
}

/**
 * Fetches public talent profiles from Django (`GET /api/recruitment/talents/`).
 * Falls back to dummy data when the API is unavailable.
 */
export async function fetchTalents({ expertise = 'all', query = '' } = {}) {
  try {
    const response = await fetch(buildTalentsUrl({ expertise, query }));

    if (!response.ok) {
      throw new Error(`Talents request failed (${response.status})`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : payload.results;

    if (!Array.isArray(results) || results.length === 0) {
      return filterLocalTalents({ expertise, query });
    }

    return results.map(normalizeTalent);
  } catch {
    return filterLocalTalents({ expertise, query });
  }
}

function normalizeTalent(talent) {
  const specialization = talent.specialization || '';
  return {
    id: talent.id,
    full_name: talent.full_name,
    headline: talent.headline || specialization,
    specialization,
    location: talent.location || '',
    bio: talent.bio || '',
    years_experience: talent.years_experience || 0,
    tags: specialization ? [specialization] : [],
    expertise: [slugify(specialization)].filter(Boolean),
    image: talent.profile_photo || null,
    is_verified: talent.is_verified,
  };
}

function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function filterLocalTalents({ expertise, query }) {
  const normalizedQuery = query.trim().toLowerCase();

  return dummyTalents.filter((talent) => {
    const matchesExpertise =
      expertise === 'all' ||
      talent.expertise.includes(expertise) ||
      talent.tags.some((tag) => tag.toLowerCase().replace(/\s+/g, '-') === expertise);

    const matchesQuery =
      !normalizedQuery ||
      talent.full_name.toLowerCase().includes(normalizedQuery) ||
      talent.headline.toLowerCase().includes(normalizedQuery) ||
      talent.bio.toLowerCase().includes(normalizedQuery) ||
      talent.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return matchesExpertise && matchesQuery;
  });
}
