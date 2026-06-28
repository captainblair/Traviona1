import {
  Award,
  Globe2,
  Handshake,
  Lightbulb,
  Linkedin,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import { teamMembers } from '../data/teamMembers.js';

const missionValues = [
  { label: 'Global Impact', icon: Globe2 },
  { label: 'Client Partnership', icon: Users },
  { label: 'Innovation', icon: Lightbulb },
  { label: 'Open Partnership', icon: Handshake },
  { label: 'Excellence', icon: Award },
  { label: 'Integrity', icon: ShieldCheck },
];

const leaders = teamMembers.map(({ name, role, image, socialUrl, socialLabel }) => ({
  name,
  role,
  image,
  socialUrl,
  socialLabel,
  initials: name
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
}));

const globalOffices = [
  { city: 'London', left: '46%', top: '28%' },
  { city: 'Nairobi', left: '54%', top: '58%' },
  { city: 'Washington DC', left: '22%', top: '36%' },
  { city: 'Singapore', left: '72%', top: '54%' },
];

function LeaderAvatar({ image, initials, name, compact = false }) {
  const sizeClass = compact
    ? 'mx-auto h-36 w-36'
    : 'mx-auto h-40 w-40 lg:h-44 lg:w-44';

  if (image) {
    return (
      <span
        className={`leader-avatar relative block shrink-0 overflow-hidden rounded-full bg-[#eef2f6] ring-2 ring-ink/10 ${sizeClass}`}
      >
        <img
          src={image}
          alt={name}
          width={512}
          height={512}
          decoding="sync"
          loading="eager"
          className="h-full w-full object-cover object-center"
        />
      </span>
    );
  }

  return (
    <span
      className={`grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-ink/90 to-midnight font-bold text-white ${
        compact ? 'text-base' : 'text-xl sm:text-2xl'
      } ${sizeClass}`}
    >
      {initials}
    </span>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LeaderSocialLink({ name, url, platform }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center justify-center text-harbor transition hover:text-tide sm:mt-3"
      aria-label={`${name} on ${platform}`}
    >
      {platform === 'LinkedIn' ? (
        <Linkedin className="h-4 w-4" aria-hidden="true" />
      ) : (
        <XIcon className="h-4 w-4" />
      )}
    </a>
  );
}

function GlobalMapPins({ showLabels = true }) {
  return (
    <>
      {globalOffices.map(({ city, left, top }) => (
        <span
          key={city}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left, top }}
        >
          <span className="relative flex flex-col items-center">
            <span className="grid h-3 w-3 place-items-center rounded-full bg-tide ring-4 ring-tide/25 sm:h-3.5 sm:w-3.5" />
            {showLabels && (
              <span className="mt-2 whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[0.65rem] font-semibold text-white/90 sm:text-xs">
                {city}
              </span>
            )}
          </span>
        </span>
      ))}
    </>
  );
}

function LeadershipCards({ compact = false, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-5 ${compact ? '' : 'lg:grid-cols-4'} ${className}`}>
      {leaders.map(({ name, role, initials, image, socialUrl, socialLabel }) => (
        <article
          key={name}
          className={`min-w-0 rounded-lg border border-ink/8 bg-white p-4 text-center shadow-[0_10px_28px_rgba(7,19,31,0.06)] sm:p-5 ${
            compact ? 'shadow-[0_16px_40px_rgba(7,19,31,0.18)]' : 'sm:p-6'
          }`}
        >
          <LeaderAvatar image={image} initials={initials} name={name} compact={compact} />
          <h3 className="mt-3 break-words font-display text-sm font-bold leading-5 text-ink sm:mt-4 sm:text-base">
            {name}
          </h3>
          <p className="mt-1 break-words text-xs leading-5 text-ink/60">{role}</p>
          <LeaderSocialLink name={name} url={socialUrl} platform={socialLabel} />
        </article>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Shaping Tomorrow's Global Landscape"
        subtitle="Strategic international business consulting and political insights for a complex world."
        primaryCta={{ label: 'Our Story', href: '#our-story' }}
        secondaryCta={{ label: 'Discover Services', href: '/#services' }}
      />

      <section
        id="our-story"
        className="w-full max-w-full overflow-x-hidden bg-white px-4 py-14 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Our Story</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_minmax(0,11rem)] sm:items-start">
              <div className="space-y-4 text-sm leading-7 text-ink/72 sm:text-base sm:leading-8">
                <p>
                  Traviona Consulting was founded to help organizations navigate complex international environments
                  with clarity, integrity, and strategic foresight. We combine business advisory, political intelligence,
                  and specialist talent to support decisions that matter across borders.
                </p>
                <p>
                  From market entry and risk advisory to public affairs and global insights, our teams work alongside
                  leaders who need trusted counsel in fast-moving political and economic contexts.
                </p>
              </div>
              <img
                src="/images/register.avif"
                alt="Traviona team in a professional office setting"
                className="h-44 w-full rounded-md object-cover shadow-[0_12px_32px_rgba(7,19,31,0.12)] ring-1 ring-ink/8 sm:h-48"
              />
            </div>
          </div>

          <div className="min-w-0 border-t border-ink/8 pt-10 lg:border-t-0 lg:pt-0">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Mission &amp; Values</h2>
            <ul className="about-values-grid mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {missionValues.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex min-w-0 items-start gap-3 rounded-lg border border-ink/10 bg-ivory px-4 py-4 sm:items-center sm:px-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tide/15 text-harbor">
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="pt-2 text-sm font-semibold leading-snug text-ink sm:pt-0">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mobile: full-screen global map with leadership overlaid */}
      <section
        id="leadership"
        className="relative min-h-[100svh] w-full max-w-full overflow-x-hidden lg:hidden"
      >
        <div className="pointer-events-none absolute inset-0 min-h-full" aria-hidden="true">
          <img
            src="/images/global2.avif"
            alt=""
            className="h-full min-h-[100svh] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-midnight/50 to-ink/92" />
          <div className="absolute inset-0">
            <GlobalMapPins />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col px-4 pb-14 pt-28">
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-2xl font-bold text-white">Leadership Team</h2>
            <LeadershipCards compact className="mt-6" />
          </div>

          <div id="global-presence" className="mt-8 border-t border-white/15 pt-8">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Global Presence</h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              {globalOffices.map(({ city }) => (
                <span key={city} className="inline-flex items-center gap-2 text-sm text-white/85">
                  <MapPin className="h-4 w-4 shrink-0 text-tide" aria-hidden="true" />
                  {city}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <h2 className="font-display text-2xl font-bold text-white">Ready to Transform?</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Partner with Traviona for strategic counsel and global insights.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-tide px-8 py-4 text-sm font-bold text-ink transition hover:bg-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop: separate leadership and global sections */}
      <section
        id="leadership-desktop"
        className="hidden w-full max-w-full overflow-x-hidden bg-ivory px-4 py-14 sm:px-8 sm:py-16 lg:block lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Leadership Team</h2>
          <LeadershipCards className="mt-8" />
        </div>
      </section>

      <section
        id="global-presence-desktop"
        className="hidden w-full max-w-full overflow-x-hidden bg-midnight px-4 py-14 text-white sm:px-8 sm:py-16 lg:block lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Global Presence</h2>
          <div className="relative mt-8 overflow-hidden rounded-xl border border-white/10 bg-ink/40">
            <img
              src="/images/global2.avif"
              alt=""
              className="h-56 w-full object-cover opacity-70 sm:h-72 lg:h-80"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent" />
            <div className="absolute inset-0" aria-hidden="true">
              <GlobalMapPins />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {globalOffices.map(({ city }) => (
              <span key={city} className="inline-flex items-center gap-2 text-sm text-white/75">
                <MapPin className="h-4 w-4 text-tide" aria-hidden="true" />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="hidden w-full max-w-full overflow-x-hidden bg-white px-4 py-14 text-center sm:px-8 sm:py-16 lg:block lg:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Ready to Transform?</h2>
          <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-base">
            Partner with Traviona for strategic counsel, global insights, and specialist talent aligned to your mission.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-tide px-8 py-4 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
