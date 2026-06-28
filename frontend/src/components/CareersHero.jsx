import { ChevronDown } from 'lucide-react';
import { employmentTypeOptions, experienceOptions, locationOptions, sourceOptions } from '../data/jobFilters.js';

function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-full border border-ink/12 bg-white px-4 py-3 pr-10 text-sm font-medium text-ink outline-none ring-tide/30 focus:ring-2"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
    </div>
  );
}

export default function CareersHero({
  query,
  onQueryChange,
  employmentType,
  onEmploymentTypeChange,
  location,
  onLocationChange,
  experience,
  onExperienceChange,
  source,
  onSourceChange,
  onClearFilters,
  hasActiveFilters = false,
}) {
  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="/images/global1.jpg" alt="" className="h-full w-full object-cover object-center opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/78 to-midnight/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(43,196,182,0.2),transparent_45%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl min-w-0 flex-col items-center px-4 pb-28 pt-24 text-center sm:px-8 sm:pb-32 sm:pt-28 lg:px-10 lg:pb-36">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-tide sm:text-sm sm:tracking-[0.2em]">
          Careers
        </p>
        <h1 className="max-w-4xl text-balance font-display text-[clamp(1.85rem,6.5vw,3rem)] font-bold leading-[1.12] text-white sm:text-5xl">
          <span className="lg:hidden">Join Our Global Network</span>
          <span className="hidden lg:inline">Join Our Global Talent Network</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-mist sm:text-base">
          Discover advisory, research, and specialist roles with Traviona teams across regions and disciplines.
        </p>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-4xl px-4 pb-10 sm:px-8 lg:px-10">
        <div className="rounded-2xl border border-white/12 bg-white p-4 shadow-[0_22px_50px_rgba(7,19,31,0.18)] sm:p-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="jobs-search">
                Search by keyword or title
              </label>
              <input
                id="jobs-search"
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search by keyword or title..."
                className="w-full rounded-full border border-ink/12 px-5 py-3.5 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/45 focus:ring-2"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <FilterSelect
                id="jobs-type"
                label="Job type"
                value={employmentType}
                onChange={onEmploymentTypeChange}
                options={employmentTypeOptions}
              />
              <FilterSelect
                id="jobs-location"
                label="Location"
                value={location}
                onChange={onLocationChange}
                options={locationOptions}
              />
              <FilterSelect
                id="jobs-experience"
                label="Experience level"
                value={experience}
                onChange={onExperienceChange}
                options={experienceOptions}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FilterSelect
                id="jobs-source"
                label="Source"
                value={source}
                onChange={onSourceChange}
                options={sourceOptions}
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-ink/12 px-5 py-3 text-sm font-semibold text-ink transition hover:border-harbor hover:text-harbor"
                >
                  Clear filters
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
