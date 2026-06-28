import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import { RevealItem, RevealSection } from '../components/reveal.jsx';
import { fetchServices } from '../lib/websiteApi.js';

export default function HomePage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices().then(setServices);
  }, []);

  return (
    <>
      <PageHero
        id="home"
        title="Shaping Tomorrow's Global Landscape"
        subtitle="Strategic international business consulting and political insights for a complex world."
        primaryCta={{ label: 'Our Story', href: '/about#our-story' }}
        secondaryCta={{ label: 'Discover Services', href: '#services' }}
      />

      <RevealSection id="services" className="w-full max-w-full overflow-x-hidden bg-white px-4 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-2xl pl-0 md:pl-8">
            <h2 className="font-display text-3xl font-bold text-ink">What We Do</h2>
          </div>

          <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-5">
            {services.length === 0 ? (
              <p className="col-span-full text-sm text-ink/50">Loading services…</p>
            ) : (
              services.map(({ slug, title, cardText, image }, index) => (
              <RevealItem
                key={slug}
                as="article"
                delay={index * 120}
                className="w-full min-w-0 max-w-full rounded-md border border-ink/5 bg-white p-5 shadow-[0_14px_38px_rgba(7,19,31,0.08)] transition duration-300 hover:shadow-[0_18px_48px_rgba(7,19,31,0.13)] motion-safe:hover:-translate-y-1"
              >
                <img
                  src={image}
                  alt=""
                  className="h-9 w-9 rounded object-cover ring-1 ring-ink/5"
                  aria-hidden="true"
                />
                <h3 className="mt-5 break-words font-display text-lg font-bold leading-6 text-ink sm:min-h-[3rem]">{title}</h3>
                <p className="mt-3 text-xs leading-5 text-ink/62 sm:min-h-[4.5rem]">{cardText}</p>
                <Link to={`/services/${slug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-harbor">
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </RevealItem>
              ))
            )}
          </div>
        </div>
      </RevealSection>

      <RevealSection id="about" className="w-full max-w-full overflow-x-hidden bg-white px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brass sm:text-sm sm:tracking-[0.2em]">Our Story</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Built for leaders navigating shifting realities
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base sm:leading-8">
              Traviona brings together strategic consulting, political intelligence, and operational talent for organizations
              making decisions across markets, institutions, and communities.
            </p>
            <a href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-harbor transition hover:text-tide">
              Read our full story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 text-center sm:grid-cols-3">
            {[
              ['50+', 'Countries monitored'],
              ['10+', 'Years experience'],
              ['200+', 'Strategic engagements'],
            ].map(([value, label], index) => (
              <RevealItem
                key={label}
                delay={index * 140}
                className="min-w-0 rounded-lg border border-ink/10 bg-mist/40 p-6"
              >
                <p className="font-display text-4xl font-bold text-harbor">{value}</p>
                <p className="mt-2 break-words text-xs font-semibold uppercase tracking-[0.08em] text-ink/60 sm:tracking-[0.14em]">{label}</p>
              </RevealItem>
            ))}
          </div>
        </div>
      </RevealSection>

      <TestimonialsSection />

      <RevealSection id="careers" className="w-full max-w-full overflow-x-hidden bg-midnight px-4 py-14 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-tide sm:text-sm sm:tracking-[0.2em]">Careers</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
              Join work that crosses borders and disciplines
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Explore advisory roles, research assignments, and talent network opportunities with Traviona.
            </p>
          </div>
          <Link
            to="/careers"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-ink transition hover:bg-tide sm:w-auto sm:px-7"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            View Careers
          </Link>
        </div>
      </RevealSection>

      <RevealSection id="talent-network" className="w-full max-w-full overflow-x-hidden bg-ivory px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-harbor sm:text-sm sm:tracking-[0.2em]">
              Talent Network
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Expert teams assembled around the assignment
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-ink/70 sm:text-base sm:leading-8">
            Traviona connects clients with analysts, advisors, and project specialists who bring regional fluency and
            practical execution support to high-stakes initiatives.
          </p>
          <Link
            to="/talent-network"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tide px-6 py-4 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white sm:w-auto sm:px-7 lg:justify-self-end"
          >
            Browse Experts
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </RevealSection>
    </>
  );
}
