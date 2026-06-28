import { dummyJobs } from '../data/dummyJobs.js';
import { API_BASE, resolveApiUrl } from './apiBase.js';

function buildJobsUrl({ employmentType, location, experience, source, query, page = 1, pageSize = 200 } = {}) {
  const url = resolveApiUrl('/recruitment/jobs/');

  if (query?.trim()) {
    url.searchParams.set('search', query.trim());
  }
  if (location && location !== 'all') {
    url.searchParams.set('location', location);
  }
  if (experience && experience !== 'all') {
    url.searchParams.set('experience_level', experience);
  }
  if (employmentType && employmentType !== 'all') {
    url.searchParams.set('employment_type', employmentType);
  }
  if (source && source !== 'all') {
    url.searchParams.set('source', source);
  }

  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));

  return url.toString();
}

function buildJobUrl(slug) {
  return `${API_BASE.replace(/\/$/, '')}/recruitment/jobs/${slug}/`;
}

async function fetchJobsPage(params, page) {
  const response = await fetch(buildJobsUrl({ ...params, page }));

  if (!response.ok) {
    throw new Error(`Jobs request failed (${response.status})`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : payload.results || [];
  const next = Array.isArray(payload) ? null : payload.next;
  return { results, next };
}

/**
 * Fetches active job postings from Django (`GET /api/recruitment/jobs/`).
 * Falls back to dummy data only when the API is unavailable.
 */
export async function fetchJobs({
  employmentType = 'all',
  location = 'all',
  experience = 'all',
  source = 'all',
  query = '',
} = {}) {
  const params = { employmentType, location, experience, source, query };

  try {
    const collected = [];
    let page = 1;
    let hasNext = true;

    while (hasNext && page <= 5) {
      const { results, next } = await fetchJobsPage(params, page);
      collected.push(...results);
      hasNext = Boolean(next) && results.length > 0;
      page += 1;
    }

    if (collected.length === 0) {
      return [];
    }

    return collected.map(normalizeJob);
  } catch (error) {
    throw error;
  }
}

export async function fetchJobBySlug(slug) {
  try {
    const response = await fetch(buildJobUrl(slug));

    if (!response.ok) {
      throw new Error(`Job request failed (${response.status})`);
    }

    return normalizeJob(await response.json());
  } catch {
    const job = dummyJobs.find((item) => item.slug === slug);
    return job ? normalizeJob(job) : null;
  }
}

function normalizeJob(job) {
  const description = job.description || '';
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    summary: job.summary || description.slice(0, 180),
    description,
    location: job.location || 'Remote',
    location_key: slugifyLocation(job.location),
    employment_type: job.employment_type || 'full_time',
    experience_level: job.experience_level || '',
    experience_key: slugifyExperience(job.experience_level),
    salary_range: job.salary_range || '',
    source_name: job.source_name || '',
    source_url: job.source_url || '',
    is_external: Boolean(job.source_url),
    requirements: job.requirements || defaultRequirements(job),
    created_at: job.created_at,
  };
}

function defaultRequirements(job) {
  const bullets = [];
  if (job.experience_level) {
    bullets.push(`${job.experience_level} experience in a related role`);
  }
  if (job.location) {
    bullets.push(`Based in or eligible to work from ${job.location}`);
  }
  if (job.source_name) {
    bullets.push(`Original listing on ${job.source_name}`);
  }
  bullets.push('Review the full description before applying');
  return bullets;
}

function slugifyLocation(value = '') {
  return value.toLowerCase().replace(/\s+/g, '-');
}

function slugifyExperience(value = '') {
  const normalized = value.toLowerCase();
  if (normalized.includes('entry')) return 'entry';
  if (normalized.includes('mid')) return 'mid';
  if (normalized.includes('senior')) return 'senior';
  if (normalized.includes('lead') || normalized.includes('principal')) return 'lead';
  return 'all';
}
