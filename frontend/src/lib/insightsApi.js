import { formatInsightParagraphs, stripInsightHtml } from './insightText.js';
import { resolveApiUrl } from './apiBase.js';
import { buildCacheKey, prefetchList, readListCache, writeListCache } from './listCache.js';

const CACHE_PREFIX = 'insights';
const DEFAULT_LIST_PARAMS = { category: 'all', query: '' };

function buildInsightsUrl({ category, query, page = 1, pageSize = 200 } = {}) {
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

async function fetchInsightsPage(params, page, pageSize) {
  const response = await fetch(buildInsightsUrl({ ...params, page, pageSize }));

  if (!response.ok) {
    throw new Error(`Insights request failed (${response.status})`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : payload.results || [];
  const next = Array.isArray(payload) ? null : payload.next;
  return { results, next };
}

export function readCachedInsights(params = DEFAULT_LIST_PARAMS) {
  return readListCache(buildCacheKey(CACHE_PREFIX, params));
}

export function prefetchInsights(params = DEFAULT_LIST_PARAMS) {
  prefetchList(buildCacheKey(CACHE_PREFIX, params), () => fetchInsights(params));
}

/**
 * Fetches published insights from the Django API (`GET /api/insights/`).
 */
export async function fetchInsights({ category = 'all', query = '' } = {}, { force = false } = {}) {
  const params = { category, query };
  const cacheKey = buildCacheKey(CACHE_PREFIX, params);
  if (!force) {
    const cached = readListCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const collected = [];
  let page = 1;
  let hasNext = true;
  const pageSize = 200;

  while (hasNext && page <= 3) {
    const { results, next } = await fetchInsightsPage(params, page, pageSize);
    collected.push(...results);
    hasNext = Boolean(next) && results.length > 0;
    page += 1;
  }

  if (collected.length === 0) {
    writeListCache(cacheKey, []);
    return [];
  }

  const normalized = collected.map(normalizeInsight);
  writeListCache(cacheKey, normalized);
  return normalized;
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
