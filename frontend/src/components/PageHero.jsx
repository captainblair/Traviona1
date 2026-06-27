import { ArrowRight } from 'lucide-react';

export default function PageHero({
  id,
  eyebrow = 'International advisory',
  title,
  subtitle,
  primaryCta = { label: 'Our Story', href: '#our-story' },
  secondaryCta = { label: 'Discover Services', href: '/#services' },
}) {
  return (
    <section id={id} className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src="/images/homepage1.jpg"
          alt=""
          className="h-full w-full object-cover object-[center_28%] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-midnight/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(43,196,182,0.16),transparent_32%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl min-w-0 items-center px-4 pb-16 pt-24 sm:min-h-[72vh] sm:px-8 sm:pb-16 sm:pt-28 lg:min-h-[78vh] lg:px-10">
        <div className="hero-copy w-full max-w-3xl min-w-0 break-words">
          <p className="mb-5 block max-w-full border-l-2 border-tide pl-4 text-xs font-semibold uppercase tracking-[0.08em] text-tide sm:text-sm sm:tracking-[0.22em]">
            {eyebrow}
          </p>
          <h1 className="max-w-full text-balance font-display text-[clamp(2rem,8vw,2.75rem)] font-bold leading-[1.12] text-white sm:text-5xl sm:leading-[1.08] lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-2xl text-base leading-7 text-mist sm:text-lg sm:leading-8">{subtitle}</p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tide px-6 py-4 text-sm font-bold text-ink shadow-soft transition hover:bg-white sm:w-auto sm:px-7"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-4 text-sm font-bold text-white transition hover:border-tide hover:text-tide sm:w-auto sm:px-7"
                >
                  {secondaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
