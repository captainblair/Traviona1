import { ArrowRight, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer.jsx';
import InsightsHero from '../components/InsightsHero.jsx';
import { RevealItem, RevealSection } from '../components/reveal.jsx';
import { insightCategories } from '../data/dummyInsights.js';
import { fetchInsights } from '../lib/insightsApi.js';

function formatPublishedDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function authorInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function InsightCard({ insight, index }) {
  return (
    <RevealItem
      delay={index * 100}
      as="article"
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-ink/8 bg-white shadow-[0_12px_32px_rgba(7,19,31,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(7,19,31,0.12)]"
    >
      <img
        src={insight.image}
        alt=""
        className="h-44 w-full object-cover sm:h-48"
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-harbor">
          {insightCategories.find((item) => item.id === insight.category)?.label || insight.category}
        </p>
        <h2 className="mt-2 line-clamp-3 font-display text-lg font-bold leading-6 text-ink">{insight.title}</h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-ink/65">{insight.summary}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-midnight text-xs font-bold text-white">
              {authorInitials(insight.author_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{insight.author_name}</p>
              <p className="text-xs text-ink/55">{formatPublishedDate(insight.published_at)}</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ink/55">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {insight.read_time_minutes} min
          </span>
        </div>
      </div>
    </RevealItem>
  );
}

function InsightListItem({ insight, index }) {
  return (
    <RevealItem
      delay={index * 80}
      as="article"
      className="flex min-w-0 gap-4 rounded-lg border border-ink/8 bg-white p-3 shadow-[0_10px_28px_rgba(7,19,31,0.06)] sm:p-4"
    >
      <img
        src={insight.image}
        alt=""
        className="h-24 w-24 shrink-0 rounded-md object-cover sm:h-28 sm:w-28"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-harbor">
          {insightCategories.find((item) => item.id === insight.category)?.label || insight.category}
        </p>
        <h2 className="mt-1 line-clamp-2 font-display text-base font-bold leading-5 text-ink">{insight.title}</h2>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/60 sm:text-sm sm:leading-6">{insight.summary}</p>
        <p className="mt-2 text-xs text-ink/50">
          {insight.author_name} · {formatPublishedDate(insight.published_at)}
        </p>
      </div>
    </RevealItem>
  );
}

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      setIsLoading(true);
      const results = await fetchInsights({ category: activeCategory, query: searchTerm });
      if (!cancelled) {
        setInsights(results);
        setIsLoading(false);
      }
    }

    loadInsights();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, searchTerm]);

  const visibleInsights = useMemo(() => insights, [insights]);

  return (
    <>
      <InsightsHero
        query={query}
        onQueryChange={setQuery}
        onSearch={() => setSearchTerm(query)}
      />

      <section className="sticky top-[4.25rem] z-20 border-b border-ink/8 bg-white/95 backdrop-blur lg:top-auto">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-8 lg:px-10">
          {insightCategories.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === id
                  ? 'bg-tide text-ink'
                  : 'bg-mist/70 text-ink/70 hover:bg-mist hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="border-b border-ink/8 bg-ivory px-4 py-8 lg:hidden sm:px-8">
        <div className="mx-auto w-full max-w-7xl rounded-xl border border-ink/8 bg-white p-5 shadow-[0_10px_28px_rgba(7,19,31,0.06)]">
          <h2 className="font-display text-xl font-bold text-ink">Stay Informed</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Receive curated global affairs briefings from the Traviona insights desk.
          </p>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border border-ink/12 px-4 py-3 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/45 focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-tide px-6 py-3 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
            >
              Submit
            </button>
          </form>
        </div>
      </section>

      <RevealSection className="w-full max-w-full overflow-x-hidden bg-white px-4 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Latest Insights</h2>
              <p className="mt-2 text-sm text-ink/60">
                {isLoading ? 'Loading insights…' : `${visibleInsights.length} article${visibleInsights.length === 1 ? '' : 's'} shown`}
              </p>
            </div>
          </div>

          <div className="mt-8 hidden gap-6 lg:grid lg:grid-cols-4">
            {visibleInsights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>

          <div className="mt-8 space-y-4 lg:hidden">
            <h3 className="font-display text-lg font-bold text-ink">Popular Articles</h3>
            {visibleInsights.map((insight, index) => (
              <InsightListItem key={insight.id} insight={insight} index={index} />
            ))}
          </div>

          {!isLoading && visibleInsights.length === 0 && (
            <p className="mt-8 rounded-lg border border-ink/10 bg-mist/40 px-4 py-6 text-sm text-ink/70">
              No insights matched your filters. Try another category or search term.
            </p>
          )}

          <div className="mt-10 hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-tide" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-harbor transition hover:text-tide"
              disabled
            >
              Next Page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </>
  );
}
