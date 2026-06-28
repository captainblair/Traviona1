import { ArrowLeft, MapPin, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { RevealSection } from '../components/reveal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applyToJob } from '../lib/authApi.js';
import { fetchJobBySlug } from '../lib/jobsApi.js';

function JobDetailHero({ title }) {
  return (
    <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="/images/global1.jpg" alt="" className="h-full w-full object-cover object-center opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-midnight/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(43,196,182,0.18),transparent_38%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-4 px-4 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28 lg:px-10">
        <div className="min-w-0">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-tide"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Careers
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-tide sm:text-sm">
            Traviona Careers
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
            {title || 'Current Opportunities'}
          </h1>
        </div>
      </div>
    </section>
  );
}

function ApplicationForm({ jobId, isAuthenticated, onRequireAuth }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    setError('');
    setStatus('');
    setIsSubmitting(true);
    try {
      await applyToJob(jobId, coverLetter);
      setStatus('Application submitted successfully.');
      setCoverLetter('');
    } catch (err) {
      setError(err.message || 'Unable to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="application-form" className="rounded-xl border border-ink/8 bg-white p-5 shadow-[0_10px_28px_rgba(7,19,31,0.06)]">
      <h2 className="font-display text-xl font-bold text-ink">Application Form</h2>
      <p className="mt-2 text-sm text-ink/60">
        {isAuthenticated
          ? 'Submit your CV and a short note to the hiring team.'
          : 'Sign in or create an account to apply for this role.'}
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="job-cv" className="text-sm font-semibold text-ink">
            Upload CV
          </label>
          <label
            htmlFor="job-cv"
            className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-tide px-5 py-3 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload CV
          </label>
          <input id="job-cv" type="file" className="sr-only" accept=".pdf,.doc,.docx" />
        </div>

        <div>
          <label htmlFor="job-message" className="text-sm font-semibold text-ink">
            Message to Hiring Manager
          </label>
          <textarea
            id="job-message"
            rows={5}
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Tell us why you are a strong fit for this role..."
            className="mt-2 w-full rounded-lg border border-ink/12 px-4 py-3 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/45 focus:ring-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status && <p className="text-sm text-harbor">{status}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting…' : isAuthenticated ? 'Submit Application' : 'Sign In to Apply'}
        </button>
      </form>
    </section>
  );
}

function ApplyButton({ isAuthenticated, onRequireAuth, className = '' }) {
  function handleClick() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {isAuthenticated ? 'Apply Now' : 'Sign In to Apply'}
    </button>
  );
}

export default function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const requireAuth = () => {
    navigate(`/login?next=${encodeURIComponent(`/careers/${slug}`)}`);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      setIsLoading(true);
      const result = await fetchJobBySlug(slug);
      if (!cancelled) {
        setJob(result);
        setIsLoading(false);
      }
    }

    loadJob();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <JobDetailHero title="Loading role…" />
        <section className="bg-ivory px-4 py-12 sm:px-8 lg:px-10">
          <p className="mx-auto max-w-7xl text-sm text-ink/60">Loading job details…</p>
        </section>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <JobDetailHero title="Role not found" />
        <section className="bg-ivory px-4 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm text-ink/70">This role may have been filled or removed.</p>
            <Link to="/careers" className="mt-4 inline-flex text-sm font-semibold text-harbor hover:text-ink">
              Return to Careers
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const paragraphs = job.description.split('\n\n').filter(Boolean);

  return (
    <>
      <JobDetailHero title={job.title} />

      <RevealSection className="w-full max-w-full overflow-x-hidden bg-ivory px-4 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)_16rem] lg:gap-8">
          <aside className="min-w-0">
            <article className="overflow-hidden rounded-xl bg-gradient-to-br from-harbor to-tide text-white shadow-[0_18px_40px_rgba(7,19,31,0.16)]">
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/75">Open role</p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-8">{job.title}</h2>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/85">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {job.location}
                </p>
                {job.salary_range && (
                  <p className="mt-3 text-sm text-white/75">{job.salary_range}</p>
                )}
                {job.is_external && job.source_url ? (
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-midnight"
                  >
                    Apply on {job.source_name || 'original site'}
                  </a>
                ) : (
                  <ApplyButton
                    isAuthenticated={isAuthenticated}
                    onRequireAuth={requireAuth}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-midnight"
                  />
                )}
              </div>
            </article>
          </aside>

          <div className="min-w-0 rounded-xl border border-ink/8 bg-white p-6 shadow-[0_10px_28px_rgba(7,19,31,0.05)]">
            <h2 className="font-display text-2xl font-bold text-ink">Full Job Description</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-ink/70 sm:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="min-w-0 rounded-xl border border-ink/8 bg-white p-6 shadow-[0_10px_28px_rgba(7,19,31,0.05)]">
            <h2 className="font-display text-xl font-bold text-ink">Requirements</h2>
            <p className="mt-3 text-sm text-ink/60">{job.location}</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-ink/70">
              {job.requirements.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tide" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!job.is_external && (
              <ApplyButton
                isAuthenticated={isAuthenticated}
                onRequireAuth={requireAuth}
                className="mt-6 hidden w-full items-center justify-center rounded-full bg-tide px-5 py-3 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white lg:inline-flex"
              />
            )}
          </aside>
        </div>

        <div className="mx-auto mt-8 max-w-7xl">
          {job.is_external && job.source_url ? (
            <section className="rounded-xl border border-ink/8 bg-white p-5 shadow-[0_10px_28px_rgba(7,19,31,0.06)]">
              <h2 className="font-display text-xl font-bold text-ink">Apply for this role</h2>
              <p className="mt-2 text-sm text-ink/60">
                This listing is hosted on {job.source_name || 'an external job board'}. You will apply on the original site.
              </p>
              <a
                href={job.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
              >
                Continue to application
              </a>
            </section>
          ) : (
            <ApplicationForm
              jobId={job.id}
              isAuthenticated={isAuthenticated}
              onRequireAuth={requireAuth}
            />
          )}
        </div>
      </RevealSection>

      <Footer />
    </>
  );
}
