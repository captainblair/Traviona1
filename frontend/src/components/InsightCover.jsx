import { useState } from 'react';

const categoryStyles = {
  politics: {
    gradient: 'from-[#1a2f45] via-midnight to-ink',
    accent: 'bg-brass/80',
    label: 'Politics',
  },
  economy: {
    gradient: 'from-harbor via-[#0a5c63] to-midnight',
    accent: 'bg-white/20',
    label: 'Business',
  },
  security: {
    gradient: 'from-ink via-[#142636] to-[#2a3544]',
    accent: 'bg-brass/70',
    label: 'Security',
  },
  human_rights: {
    gradient: 'from-[#35556b] via-harbor to-[#173845]',
    accent: 'bg-ivory/25',
    label: 'Human Rights',
  },
  global_trends: {
    gradient: 'from-midnight via-harbor to-tide/80',
    accent: 'bg-tide/40',
    label: 'Global Trends',
  },
};

const fallbackImages = [
  '/images/service-geopolitical.avif',
  '/images/service-global-strategy.jpg',
  '/images/service-risk-advisory.avif',
  '/images/global2.avif',
];

function hashString(value = '') {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function resolveInsightImageUrl(insight) {
  if (insight?.featured_image_url) {
    return insight.featured_image_url;
  }
  if (insight?.featured_image) {
    return insight.featured_image;
  }
  if (insight?.image && !insight.image.endsWith('/global1.jpg')) {
    return insight.image;
  }
  return '';
}

export function resolveFallbackImage(insight) {
  const key = insight?.slug || insight?.title || String(insight?.id || '');
  return fallbackImages[hashString(key) % fallbackImages.length];
}

export function getCategoryStyle(category = 'global_trends') {
  return categoryStyles[category] || categoryStyles.global_trends;
}

export default function InsightCover({ insight, className = '', compact = false }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = resolveInsightImageUrl(insight);
  const style = getCategoryStyle(insight?.category);

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`${className} object-cover brightness-[1.08] contrast-[1.06] saturate-[1.12]`}
        loading="lazy"
        onError={() => setFailed(true)}
        aria-hidden="true"
      />
    );
  }

  const fallbackImage = resolveFallbackImage(insight);

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <img
        src={fallbackImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-55 brightness-[1.05] saturate-110"
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
      <div className={`absolute inset-x-0 bottom-0 h-1.5 ${style.accent}`} />
      <div className={`absolute inset-0 flex ${compact ? 'items-end p-3' : 'items-end p-5'}`}>
        <span className={`font-semibold uppercase tracking-[0.14em] text-white/85 ${compact ? 'text-[0.6rem]' : 'text-xs'}`}>
          {style.label}
        </span>
      </div>
    </div>
  );
}
