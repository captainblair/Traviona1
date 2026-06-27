import { Search } from 'lucide-react';

export default function TalentHero({ query, onQueryChange, onSearch }) {
  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="/images/global2.avif" alt="" className="h-full w-full object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/95 via-ink/82 to-midnight/70 lg:bg-gradient-to-r lg:from-ink lg:via-ink/88 lg:to-midnight/45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(43,196,182,0.22),transparent_42%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 px-4 pb-10 pt-24 sm:px-8 sm:pb-12 sm:pt-28 lg:px-10 lg:pb-14">
        <div className="hero-copy min-w-0 max-w-3xl">
          <p className="mb-4 block border-l-2 border-tide pl-4 text-xs font-semibold uppercase tracking-[0.08em] text-tide sm:text-sm sm:tracking-[0.2em]">
            Talent Network
          </p>
          <h1 className="max-w-full text-balance font-display text-[clamp(1.85rem,7vw,2.65rem)] font-bold leading-[1.12] text-white sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
            Our Global Experts
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-mist sm:text-base sm:leading-8">
            Search Traviona&apos;s verified specialists across geopolitics, intelligence, security, and public affairs.
          </p>

          <form
            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch?.();
            }}
          >
            <label className="sr-only" htmlFor="experts-search">
              Search for experts
            </label>
            <input
              id="experts-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search for experts..."
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

        <div className="mt-8 flex flex-wrap gap-3 lg:mt-10" aria-hidden="true">
          {['Geopolitics', 'Cybersecurity', 'Public Affairs', 'Strategy'].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/75 backdrop-blur-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
