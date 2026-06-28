import { dummyInsights } from '../data/dummyInsights.js';
import { formatInsightParagraphs, stripInsightHtml } from './insightText.js';
import { resolveApiUrl } from './apiBase.js';

function buildInsightsUrl({ category, query, page = 1, pageSize = 50 } = {}) {
  const url = resolveApiUrl('/insights/');

  if (category && category !== 'all') {
    url.searchParams.set('category', category);
  }
  if (query?.trim()) {
    url.searchParams.set('q', query.trim());
  }

  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));

  return url.toString();
}

function buildInsightUrl(slug) {
  return resolveApiUrl(`/insights/${slug}/`).toString();
}

async function fetchInsightsPage(params, page) {
  const response = await fetch(buildInsightsUrl({ ...params, page }));

  if (!response.ok) {
    throw new Error(`Insights request failed (${response.status})`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : payload.results || [];
  const next = Array.isArray(payload) ? null : payload.next;
  return { results, next };
}

/**
 * Fetches published insights from the Django API (`GET /api/insights/`).
 */
export async function fetchInsights({ category = 'all', query = '' } = {}) {
  const params = { category, query };
  const collected = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 10) {
    const { results, next } = await fetchInsightsPage(params, page);
    collected.push(...results);
    hasNext = Boolean(next) && results.length > 0;
    page += 1;
  }

  if (collected.length === 0) {
    return [];
  }

  return collected.map(normalizeInsight);
}

export async function fetchInsightBySlug(slug) {
  const response = await fetch(buildInsightUrl(slug));

  if (!response.ok) {
    throw new Error(`Insight request failed (${response.status})`);
  }

  return normalizeInsight(await response.json());
}

function normalizeInsight(insight) {
  const featuredImage = insight.featured_image_url || insight.featured_image || '';
  const summary = stripInsightHtml(insight.summary || '');
  const content = stripInsightHtml(insight.content || insight.summary || '');
  return {
    id: insight.id,
    slug: insight.slug,
    title: insight.title,
    summary,
    content: content || summary,
    paragraphs: formatInsightParagraphs(content || summary),
    category: insight.category,
    author_name: insight.author_name || insight.author_detail?.name || 'Traviona Research',
    published_at: insight.published_at,
    read_time_minutes: insight.read_time_minutes || 5,
    featured_image_url: insight.featured_image_url || '',
    featured_image: insight.featured_image || '',
    image: featuredImage,
    source_name: insight.source_name || '',
    source_url: insight.source_url || '',
    is_external: Boolean(insight.source_url),
  };
}

export function filterLocalInsights({ category, query }) {
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
