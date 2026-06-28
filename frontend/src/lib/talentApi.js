import { teamMemberByName, teamMembers } from '../data/teamMembers.js';
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

function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function resolveMediaUrl(value) {
  if (!value) return null;
  if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
    return value;
  }
  return null;
}

function normalizeTalent(talent) {
  const staticMatch = teamMemberByName.get(talent.full_name);
  const specialization = talent.specialization || staticMatch?.specialization || '';
  const tags = staticMatch?.tags || (specialization ? [specialization] : []);
  const expertise =
    staticMatch?.expertise?.length > 0
      ? staticMatch.expertise
      : [slugify(specialization)].filter(Boolean);

  return {
    id: talent.id ?? staticMatch?.id,
    full_name: talent.full_name,
    headline: talent.headline || staticMatch?.headline || specialization,
    specialization,
    location: talent.location || staticMatch?.location || '',
    bio: talent.bio || staticMatch?.bio || '',
    years_experience: talent.years_experience || staticMatch?.years_experience || 0,
    tags,
    expertise,
    image: staticMatch?.image || resolveMediaUrl(talent.profile_photo),
    imagePosition: staticMatch?.imagePosition || 'center center',
    is_verified: talent.is_verified ?? staticMatch?.is_verified ?? false,
    is_leadership: staticMatch?.is_leadership ?? false,
    socialUrl: staticMatch?.socialUrl || '',
    socialLabel: staticMatch?.socialLabel || '',
  };
}

function filterLocalTalents({ expertise, query }) {
  const normalizedQuery = query.trim().toLowerCase();

  return teamMembers.filter((talent) => {
    const matchesExpertise =
      expertise === 'all' ||
      talent.expertise.includes(expertise) ||
      talent.tags.some((tag) => tag.toLowerCase().replace(/\s+/g, '-') === expertise);

    const matchesQuery =
      !normalizedQuery ||
      talent.full_name.toLowerCase().includes(normalizedQuery) ||
      talent.headline.toLowerCase().includes(normalizedQuery) ||
      talent.bio.toLowerCase().includes(normalizedQuery) ||
      talent.location.toLowerCase().includes(normalizedQuery) ||
      talent.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return matchesExpertise && matchesQuery;
  });
}

function sortByTeamOrder(talents) {
  const order = teamMembers.map((member) => member.full_name);

  return [...talents].sort((left, right) => {
    const leftIndex = order.indexOf(left.full_name);
    const rightIndex = order.indexOf(right.full_name);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

/**
 * Fetches public talent profiles from Django (`GET /api/recruitment/talents/`).
 * Enriches API rows with local team metadata; falls back to leadership profiles.
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
      return sortByTeamOrder(filterLocalTalents({ expertise, query }));
    }

    return sortByTeamOrder(results.map(normalizeTalent));
  } catch {
    return sortByTeamOrder(filterLocalTalents({ expertise, query }));
  }
}
