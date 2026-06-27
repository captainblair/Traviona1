import { ArrowRight, BriefcaseBusiness, Globe2, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const navItems = ['Home', 'About', 'Careers', 'Talent Network', 'Contact'];

const services = [
  {
    title: 'Global Strategy',
    text: 'Market entry, geopolitical positioning, and growth counsel.',
    image: '/images/service-global-strategy.jpg',
  },
  {
    title: 'Public Affairs',
    text: 'Policy intelligence and stakeholder strategy for complex systems.',
    image: '/images/service-public-affairs.avif',
  },
  {
    title: 'Risk Advisory',
    text: 'Risk visibility, operating plans, and executive support.',
    image: '/images/service-risk-advisory.avif',
  },
  {
    title: 'Geopolitical Shifts and Their Future',
    text: 'Forward-looking analysis of regional and global power shifts.',
    image: '/images/service-geopolitical.avif',
  },
  {
    title: 'Talent Network',
    text: 'Specialized consultants matched to strategic assignments.',
    image: '/images/service-talent-network.jpg',
  },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -80px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: visible ? 'reveal is-visible' : 'reveal',
  };
}

function RevealSection({ children, className = '', ...props }) {
  const reveal = useReveal();
  return (
    <section ref={reveal.ref} className={`${reveal.className} ${className}`} {...props}>
      {children}
    </section>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#home" className="flex items-center gap-3 text-white" onClick={closeMenu}>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-tide/60 bg-tide/15">
            <Globe2 className="h-5 w-5 text-tide" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-wide">Traviona</span>
        </a>

        <div className="hidden items-center gap-8 rounded-full border border-white/10 bg-ink/30 px-6 py-3 text-sm text-white/80 backdrop-blur md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="transition hover:text-tide">
              {item}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="hidden rounded-full bg-tide px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white md:inline-flex"
        >
          Enquire
        </a>

        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-ink/35 text-white backdrop-blur md:hidden"
          type="button"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="mx-5 overflow-hidden rounded-lg border border-white/12 bg-ink/92 text-white shadow-soft backdrop-blur sm:mx-8 md:hidden"
        >
          <div className="flex flex-col px-4 py-3">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                className="border-b border-white/10 px-1 py-3 text-sm font-semibold text-white/86 transition last:border-b-0 hover:text-tide"
                onClick={closeMenu}
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-tide px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"
              onClick={closeMenu}
            >
              Enquire
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-[88vh] w-full overflow-hidden bg-ink text-white">
      <img
        src="/images/homepage1.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-midnight/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(43,196,182,0.16),transparent_32%)]" />

      <Header />

      <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="hero-copy max-w-3xl min-w-0">
          <p className="mb-5 inline-flex border-l-2 border-tide pl-4 text-sm font-semibold uppercase tracking-[0.22em] text-tide">
            International advisory
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            Shaping Tomorrow&apos;s Global Landscape
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-mist sm:text-xl">
            Strategic international business consulting and political insights for a complex world.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-tide px-7 py-4 text-sm font-bold text-ink shadow-soft transition hover:bg-white"
            >
              Our Story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:border-tide hover:text-tide"
            >
              Discover Services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <RevealSection id="services" className="w-full overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl pl-0 md:pl-8">
          <h2 className="font-display text-3xl font-bold text-ink">What We Do</h2>
        </div>

        <div className="mt-8 grid min-w-0 gap-5 md:grid-cols-3 xl:grid-cols-5">
          {services.map(({ title, text, image }) => (
            <article
              key={title}
              className="rounded-md border border-ink/5 bg-white p-5 shadow-[0_14px_38px_rgba(7,19,31,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(7,19,31,0.13)]"
            >
              <img
                src={image}
                alt=""
                className="h-9 w-9 rounded object-cover ring-1 ring-ink/5"
                aria-hidden="true"
              />
              <h3 className="mt-5 min-h-[3rem] font-display text-lg font-bold leading-6 text-ink">{title}</h3>
              <p className="mt-3 min-h-[4.5rem] text-xs leading-5 text-ink/62">{text}</p>
              <a href="#services" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-harbor">
                Learn More
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function InsightBand() {
  return (
    <RevealSection id="about" className="w-full overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass">Our Story</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Built for leaders navigating shifting realities</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink/70">
            Traviona brings together strategic consulting, political intelligence, and operational talent for organizations
            making decisions across markets, institutions, and communities.
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {[
            ['50+', 'Countries monitored'],
            ['10+', 'Years experience'],
            ['200+', 'Strategic engagements'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-ink/10 bg-mist/40 p-6">
              <p className="font-display text-4xl font-bold text-harbor">{value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function CareersBand() {
  return (
    <RevealSection id="careers" className="w-full overflow-hidden bg-midnight px-5 py-20 text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-tide">Careers</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Join work that crosses borders and disciplines</h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            Explore advisory roles, research assignments, and talent network opportunities with Traviona.
          </p>
        </div>
        <a
          href="#talent-network"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-ink transition hover:bg-tide"
        >
          <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          View Careers
        </a>
      </div>
    </RevealSection>
  );
}

function TalentNetworkBand() {
  return (
    <RevealSection id="talent-network" className="w-full overflow-hidden bg-ivory px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-harbor">Talent Network</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Expert teams assembled around the assignment</h2>
        </div>
        <p className="max-w-3xl text-base leading-8 text-ink/70">
          Traviona connects clients with analysts, advisors, and project specialists who bring regional fluency and
          practical execution support to high-stakes initiatives.
        </p>
      </div>
    </RevealSection>
  );
}

function Footer() {
  return (
    <footer id="contact" className="w-full overflow-hidden bg-ink px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-tide/60 bg-tide/15">
            <Globe2 className="h-5 w-5 text-tide" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">Traviona</span>
        </div>
        <p className="text-sm text-white/55">Strategic international business consulting and political insights.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-ink">
      <Hero />
      <Services />
      <InsightBand />
      <CareersBand />
      <TalentNetworkBand />
      <Footer />
    </main>
  );
}
