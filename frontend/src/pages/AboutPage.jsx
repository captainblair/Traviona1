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
import Footer from '../components/Footer.jsx';
import PageHero from '../components/PageHero.jsx';
import { RevealItem, RevealSection } from '../components/reveal.jsx';

const missionValues = [
  { label: 'Global Impact', icon: Globe2 },
  { label: 'Client Partnership', icon: Users },
  { label: 'Innovation', icon: Lightbulb },
  { label: 'Open Partnership', icon: Handshake },
  { label: 'Excellence', icon: Award },
  { label: 'Integrity', icon: ShieldCheck },
];

const leaders = [
  { name: 'Dr. Peggy Oberma', role: 'Managing Director', initials: 'PO' },
  { name: 'Dr. Yvette Oster', role: 'Chief Strategy Officer', initials: 'YO' },
  { name: 'James Okello', role: 'Director, Global Affairs', initials: 'JO' },
  { name: 'Sarah Chen', role: 'Head of Talent Network', initials: 'SC' },
];

const globalOffices = [
  { city: 'London', left: '46%', top: '28%' },
  { city: 'Nairobi', left: '54%', top: '58%' },
  { city: 'Washington DC', left: '22%', top: '36%' },
  { city: 'Singapore', left: '72%', top: '54%' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Shaping Tomorrow's Global Landscape"
        subtitle="Strategic international business consulting and political insights for a complex world."
        primaryCta={{ label: 'Our Story', href: '#our-story' }}
        secondaryCta={{ label: 'Discover Services', href: '/#services' }}
      />

      <RevealSection
        id="our-story"
        className="w-full max-w-full overflow-x-hidden bg-white px-4 py-14 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
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

          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Mission & Values</h2>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
              {missionValues.map(({ label, icon: Icon }, index) => (
                <RevealItem
                  key={label}
                  delay={index * 80}
                  className="flex min-w-0 flex-col items-center rounded-md border border-ink/10 bg-white px-2 py-4 text-center shadow-[0_8px_24px_rgba(7,19,31,0.05)] sm:px-3 sm:py-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-tide/12 text-harbor sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 break-words text-[0.65rem] font-semibold leading-4 text-ink/75 sm:text-xs sm:leading-5">
                    {label}
                  </p>
                </RevealItem>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection
        id="leadership"
        className="w-full max-w-full overflow-x-hidden bg-ivory px-4 py-14 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Leadership Team</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {leaders.map(({ name, role, initials }, index) => (
              <RevealItem
                key={name}
                delay={index * 100}
                className="min-w-0 rounded-lg border border-ink/8 bg-white p-4 text-center shadow-[0_10px_28px_rgba(7,19,31,0.06)] sm:p-5"
              >
                <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-ink/90 to-midnight text-lg font-bold text-white sm:h-24 sm:w-24">
                  {initials}
                </span>
                <h3 className="mt-4 break-words font-display text-sm font-bold leading-5 text-ink sm:text-base">{name}</h3>
                <p className="mt-1 break-words text-xs leading-5 text-ink/60">{role}</p>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center text-harbor transition hover:text-tide"
                  aria-label={`${name} on LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
              </RevealItem>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection
        id="global-presence"
        className="w-full max-w-full overflow-x-hidden bg-midnight px-4 py-14 text-white sm:px-8 sm:py-16 lg:px-10"
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
              {globalOffices.map(({ city, left, top }) => (
                <span
                  key={city}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top }}
                >
                  <span className="relative flex flex-col items-center">
                    <span className="grid h-3 w-3 place-items-center rounded-full bg-tide ring-4 ring-tide/25" />
                    <span className="mt-2 whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[0.65rem] font-semibold text-white/90 sm:text-xs">
                      {city}
                    </span>
                  </span>
                </span>
              ))}
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
      </RevealSection>

      <section className="w-full max-w-full overflow-x-hidden bg-white px-4 py-14 text-center sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Ready to Transform?</h2>
          <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-base">
            Partner with Traviona for strategic counsel, global insights, and specialist talent aligned to your mission.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-tide px-8 py-4 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
