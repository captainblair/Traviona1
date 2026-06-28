import { ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CareersHero from '../components/CareersHero.jsx';
import Footer from '../components/Footer.jsx';
import { fetchJobs } from '../lib/jobsApi.js';
function formatEmploymentType(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function JobCard({ job, compact = false }) {
  if (compact) {
    return (
      <article className="flex min-w-0 flex-col rounded-lg border border-ink/8 bg-white p-5 shadow-[0_10px_28px_rgba(7,19,31,0.06)]">
        <h3 className="font-display text-lg font-bold leading-6 text-ink">{job.title}</h3>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink/60">
          <MapPin className="h-4 w-4 shrink-0 text-harbor" aria-hidden="true" />
          {job.location}
        </p>
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-ink/65">{job.summary}</p>
        <Link
          to={`/careers/${job.slug}`}
          className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-tide px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
        >
          View Details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-ink/8 bg-white p-6 shadow-[0_12px_32px_rgba(7,19,31,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(7,19,31,0.12)]">
      <h3 className="font-display text-xl font-bold leading-7 text-ink">{job.title}</h3>
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink/60">
        <MapPin className="h-4 w-4 shrink-0 text-harbor" aria-hidden="true" />
        Location: {job.location}
      </p>
      <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-ink/65">{job.summary}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">
          {formatEmploymentType(job.employment_type)}
        </span>
        <Link
          to={`/careers/${job.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-tide px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
        >
          View Details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function CareersPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentType, setEmploymentType] = useState('all');
  const [location, setLocation] = useState('all');
  const [experience, setExperience] = useState('all');
  const [source, setSource] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setLoadError('');
      try {
        const results = await fetchJobs({
          employmentType,
          location,
          experience,
          source,
          query: searchTerm,
        });
        if (!cancelled) {
          setJobs(results);
        }
      } catch {
        if (!cancelled) {
          setJobs([]);
          setLoadError('Could not load jobs. Make sure the backend is running on port 8000.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [employmentType, location, experience, source, searchTerm]);

  return (
    <>
      <CareersHero
        query={query}
        onQueryChange={setQuery}
        onSearch={() => setSearchTerm(query)}
        employmentType={employmentType}
        onEmploymentTypeChange={setEmploymentType}
        location={location}
        onLocationChange={setLocation}
        experience={experience}
        onExperienceChange={setExperience}
        source={source}
        onSourceChange={setSource}
      />

      <section className="w-full max-w-full overflow-x-hidden bg-ivory px-4 pb-12 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Current Opportunities</h2>
              <p className="mt-2 text-sm text-ink/60">
                {isLoading ? 'Loading roles…' : `${jobs.length} role${jobs.length === 1 ? '' : 's'} available`}
              </p>
            </div>
          </div>

          {loadError && (
            <p className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
              {loadError}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>

          {!isLoading && !loadError && jobs.length === 0 && (
            <p className="mt-8 rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70">
              No roles matched your filters. Try another keyword or broaden your search.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
