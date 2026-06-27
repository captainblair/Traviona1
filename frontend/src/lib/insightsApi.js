import { dummyInsights } from '../data/dummyInsights.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function buildInsightsUrl({ category, query } = {}) {
  const url = new URL(`${API_BASE}/insights/`);

  if (category && category !== 'all') {
    url.searchParams.set('category', category);
  }
  if (query?.trim()) {
    url.searchParams.set('q', query.trim());
  }

  return url.toString();
}

/**
 * Fetches published insights from the Django API (`GET /api/insights/`).
 * Falls back to local dummy data when the API is unavailable.
 */
export async function fetchInsights({ category = 'all', query = '' } = {}) {
  try {
    const response = await fetch(buildInsightsUrl({ category, query }));

    if (!response.ok) {
      throw new Error(`Insights request failed (${response.status})`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : payload.results;

    if (!Array.isArray(results) || results.length === 0) {
      return filterLocalInsights({ category, query });
    }

    return results.map(normalizeInsight);
  } catch {
    return filterLocalInsights({ category, query });
  }
}

function normalizeInsight(insight) {
  return {
    id: insight.id,
    slug: insight.slug,
    title: insight.title,
    summary: insight.summary,
    category: insight.category,
    author_name: insight.author_name || insight.author_detail?.name || 'Traviona Research',
    published_at: insight.published_at,
    read_time_minutes: insight.read_time_minutes || 5,
    image: insight.featured_image || '/images/global1.jpg',
    source_name: insight.source_name || '',
  };
}

function filterLocalInsights({ category, query }) {
  const normalizedQuery = query.trim().toLowerCase();

  return dummyInsights.filter((insight) => {
    const matchesCategory = category === 'all' || insight.category === category;
    const matchesQuery =
      !normalizedQuery ||
      insight.title.toLowerCase().includes(normalizedQuery) ||
      insight.summary.toLowerCase().includes(normalizedQuery) ||
      insight.author_name.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}
