import { dummyJobs } from '../data/dummyJobs.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function buildJobsUrl({ expertise, location, experience, query } = {}) {
  const url = new URL(`${API_BASE}/recruitment/jobs/`);

  if (query?.trim()) {
    url.searchParams.set('q', query.trim());
  }
  if (location && location !== 'all') {
    url.searchParams.set('location', location);
  }
  if (experience && experience !== 'all') {
    url.searchParams.set('experience_level', experience);
  }
  if (expertise && expertise !== 'all') {
    url.searchParams.set('specialization', expertise);
  }

  return url.toString();
}

function buildJobUrl(slug) {
  return `${API_BASE}/recruitment/jobs/${slug}/`;
}

/**
 * Fetches active job postings from Django (`GET /api/recruitment/jobs/`).
 * Falls back to dummy data when the API is unavailable.
 */
export async function fetchJobs({ expertise = 'all', location = 'all', experience = 'all', query = '' } = {}) {
  try {
    const response = await fetch(buildJobsUrl({ expertise, location, experience, query }));

    if (!response.ok) {
      throw new Error(`Jobs request failed (${response.status})`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : payload.results;

    if (!Array.isArray(results) || results.length === 0) {
      return filterLocalJobs({ expertise, location, experience, query });
    }

    return results.map(normalizeJob);
  } catch {
    return filterLocalJobs({ expertise, location, experience, query });
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
    location_key: job.location_key || slugifyLocation(job.location),
    employment_type: job.employment_type || 'full_time',
    experience_level: job.experience_level || 'Mid-level',
    experience_key: job.experience_key || slugifyExperience(job.experience_level),
    expertise: job.expertise || 'strategy',
    salary_range: job.salary_range || '',
    requirements: job.requirements || defaultRequirements(job),
    created_at: job.created_at,
  };
}

function defaultRequirements(job) {
  const bullets = [];
  if (job.experience_level) {
    bullets.push(`${job.experience_level} experience in a related advisory or research role`);
  }
  if (job.location) {
    bullets.push(`Eligible to work in or from ${job.location}`);
  }
  bullets.push('Excellent written and verbal communication');
  bullets.push('Strong analytical and client-facing skills');
  return bullets;
}

function slugifyLocation(value = '') {
  const normalized = value.toLowerCase();
  if (normalized.includes('london')) return 'london';
  if (normalized.includes('nairobi')) return 'nairobi';
  if (normalized.includes('singapore')) return 'singapore';
  if (normalized.includes('remote')) return 'remote';
  return normalized.replace(/\s+/g, '-');
}

function slugifyExperience(value = '') {
  const normalized = value.toLowerCase();
  if (normalized.includes('entry')) return 'entry';
  if (normalized.includes('mid')) return 'mid';
  if (normalized.includes('senior')) return 'senior';
  if (normalized.includes('lead') || normalized.includes('principal')) return 'lead';
  return 'all';
}

function filterLocalJobs({ expertise, location, experience, query }) {
  const normalizedQuery = query.trim().toLowerCase();

  return dummyJobs
    .map(normalizeJob)
    .filter((job) => {
      const matchesExpertise = expertise === 'all' || job.expertise === expertise;
      const matchesLocation = location === 'all' || job.location_key === location;
      const matchesExperience = experience === 'all' || job.experience_key === experience;
      const matchesQuery =
        !normalizedQuery ||
        job.title.toLowerCase().includes(normalizedQuery) ||
        job.summary.toLowerCase().includes(normalizedQuery) ||
        job.location.toLowerCase().includes(normalizedQuery);

      return matchesExpertise && matchesLocation && matchesExperience && matchesQuery;
    });
}
