import { Search } from 'lucide-react';

export default function InsightsHero({ query, onQueryChange, onSearch }) {
  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="/images/global1.jpg" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-midnight/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_40%,rgba(43,196,182,0.18),transparent_38%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 items-center gap-8 px-4 pb-14 pt-24 sm:px-8 sm:pb-16 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="hero-copy min-w-0">
          <p className="mb-4 block border-l-2 border-tide pl-4 text-xs font-semibold uppercase tracking-[0.08em] text-tide sm:text-sm sm:tracking-[0.2em]">
            Global insights
          </p>
          <h1 className="max-w-full text-balance font-display text-[clamp(1.85rem,7vw,2.65rem)] font-bold leading-[1.12] text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
            Global Current Affairs & Political Insights
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-mist sm:text-base sm:leading-8">
            Curated analysis on politics, economy, security, human rights, and global trends for international
            decision-makers.
          </p>

          <form
            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch?.();
            }}
          >
            <label className="sr-only" htmlFor="insights-search">
              Search insights
            </label>
            <input
              id="insights-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search articles, topics, or authors"
              className="w-full rounded-full border border-white/20 bg-white/95 px-5 py-3.5 text-sm text-ink outline-none ring-tide/40 placeholder:text-ink/45 focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-white"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </form>
        </div>

        <div className="relative hidden min-h-[220px] lg:block" aria-hidden="true">
          <img
            src="/images/global2.avif"
            alt=""
            className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-80 ring-1 ring-white/15"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-tide/20 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
