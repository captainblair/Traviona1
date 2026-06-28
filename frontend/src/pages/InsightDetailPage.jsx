import { ArrowLeft, Clock3, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import InsightCover from '../components/InsightCover.jsx';
import { insightCategories } from '../data/dummyInsights.js';
import { formatInsightParagraphs } from '../lib/insightText.js';
import { fetchInsightBySlug } from '../lib/insightsApi.js';

function formatPublishedDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function InsightDetailPage() {
  const { slug } = useParams();
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadInsight() {
      setIsLoading(true);
      setError('');
      try {
        const result = await fetchInsightBySlug(slug);
        if (!cancelled) {
          setInsight(result);
        }
      } catch {
        if (!cancelled) {
          setInsight(null);
          setError('This insight could not be loaded.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInsight();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const categoryLabel =
    insightCategories.find((item) => item.id === insight?.category)?.label || insight?.category;

  const bodyParagraphs =
    insight?.paragraphs?.length > 0
      ? insight.paragraphs
      : formatInsightParagraphs(insight?.content || insight?.summary || '');
  const leadParagraph = bodyParagraphs[0] || insight?.summary || '';
  const remainingParagraphs =
    bodyParagraphs.length > 1 ? bodyParagraphs.slice(1) : bodyParagraphs.length === 1 ? [] : [];

  return (
    <>
      <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <InsightCover insight={insight} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-midnight/75" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-10 pt-24 sm:px-8 sm:pt-28 lg:px-10">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-tide"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Insights
          </Link>

          {isLoading && <p className="mt-8 text-white/70">Loading insight…</p>}

          {!isLoading && error && (
            <p className="mt-8 rounded-lg border border-white/15 bg-white/10 px-4 py-6 text-sm text-white/85">{error}</p>
          )}

          {!isLoading && insight && (
            <>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-tide">{categoryLabel}</p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{insight.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span>{insight.author_name}</span>
                <span>{formatPublishedDate(insight.published_at)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  {insight.read_time_minutes} min read
                </span>
                {insight.source_name && <span>Source: {insight.source_name}</span>}
              </div>
            </>
          )}
        </div>
      </section>

      {!isLoading && insight && (
        <section className="bg-white px-4 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {leadParagraph && <p className="text-lg leading-8 text-ink/80">{leadParagraph}</p>}
            {remainingParagraphs.length > 0 && (
              <div className="mt-6 space-y-4 text-base leading-8 text-ink/75">
                {remainingParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 40)}`}>{paragraph}</p>
                ))}
              </div>
            )}

            {insight.is_external && insight.source_url && (
              <a
                href={insight.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink/75 transition hover:border-tide hover:text-tide"
              >
                Continue reading on {insight.source_name || 'original site'}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
