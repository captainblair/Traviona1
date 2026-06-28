import { getServiceBySlug, services as staticServices } from '../data/services.js';
import { API_BASE, resolveApiUrl } from './apiBase.js';

function buildServicesUrl() {
  return resolveApiUrl('/website/services/').toString();
}

function buildServiceUrl(slug) {
  return `${API_BASE.replace(/\/$/, '')}/website/services/${slug}/`;
}

function resolveMediaUrl(value) {
  if (!value) return null;
  if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
    return value;
  }
  return null;
}

function splitParagraphs(text = '') {
  if (!text?.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizeService(item) {
  const staticFallback = getServiceBySlug(item.slug);
  const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};

  const description =
    Array.isArray(metadata.description) && metadata.description.length > 0
      ? metadata.description
      : splitParagraphs(item.detailed_description).length > 0
        ? splitParagraphs(item.detailed_description)
        : staticFallback?.description || (item.description ? [item.description] : []);

  const benefits =
    Array.isArray(metadata.benefits) && metadata.benefits.length > 0
      ? metadata.benefits
      : staticFallback?.benefits || [];

  const whyChoose =
    Array.isArray(metadata.whyChoose) && metadata.whyChoose.length > 0
      ? metadata.whyChoose
      : staticFallback?.whyChoose || [];

  return {
    id: item.id,
    slug: item.slug,
    title: item.name || item.title || staticFallback?.title,
    cardText: item.short_description || staticFallback?.cardText || '',
    image:
      resolveMediaUrl(metadata.image) ||
      resolveMediaUrl(item.featured_image) ||
      staticFallback?.image ||
      '/images/service-global-strategy.jpg',
    subheadline: metadata.subheadline || item.description || staticFallback?.subheadline || '',
    description,
    benefits,
    whyChoose,
    ctaHref: metadata.ctaHref || staticFallback?.ctaHref || '/contact?topic=advisory',
    ctaLabel: metadata.ctaLabel || staticFallback?.ctaLabel || 'Request a Consultation',
    source: item.id ? 'api' : 'static',
  };
}

function extractResults(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

/**
 * Fetches active services from Django (`GET /api/website/services/`).
 * Falls back to local `services.js` when the API is unavailable or empty.
 */
export async function fetchServices() {
  try {
    const response = await fetch(buildServicesUrl());

    if (!response.ok) {
      throw new Error(`Services request failed (${response.status})`);
    }

    const results = extractResults(await response.json());

    if (results.length === 0) {
      return staticServices.map((service) => normalizeService({ ...service, name: service.title }));
    }

    return results.map(normalizeService);
  } catch {
    return staticServices.map((service) => normalizeService({ ...service, name: service.title }));
  }
}

export async function fetchServiceBySlug(slug) {
  try {
    const response = await fetch(buildServiceUrl(slug));

    if (!response.ok) {
      throw new Error(`Service request failed (${response.status})`);
    }

    return normalizeService(await response.json());
  } catch {
    const service = getServiceBySlug(slug);
    return service ? normalizeService({ ...service, name: service.title }) : null;
  }
}
