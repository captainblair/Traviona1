import { Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials.js';

function TestimonialCard({ testimonial }) {
  const { name, title, organization, country, flag, quote, photo, accent } = testimonial;

  return (
    <article
      className={`flex h-full w-[min(88vw,20rem)] shrink-0 flex-col rounded-2xl border border-ink/8 bg-gradient-to-br ${accent} p-5 shadow-[0_16px_40px_rgba(7,19,31,0.08)] ring-1 ring-white/80 sm:w-[22rem] sm:p-6`}
    >
      <div className="flex items-start gap-4">
        <img
          src={photo}
          alt={name}
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-tide/40 ring-offset-2 ring-offset-white"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-6 text-ink">{name}</p>
          <p className="mt-0.5 text-sm font-semibold text-harbor">{title}</p>
          <p className="mt-0.5 text-xs text-ink/55">{organization}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-ink/70 ring-1 ring-ink/8">
            <span aria-hidden="true">{flag}</span>
            {country}
          </p>
        </div>
      </div>

      <Quote className="mt-5 h-5 w-5 text-tide" aria-hidden="true" />

      <blockquote className="mt-3 flex-1 text-sm leading-7 text-ink/75">
        <p>&ldquo;{quote}&rdquo;</p>
      </blockquote>

      <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-tide to-harbor" aria-hidden="true" />
    </article>
  );
}

export default function TestimonialsSection() {
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="relative w-full max-w-full overflow-hidden bg-gradient-to-b from-ivory via-white to-mist/40 px-4 py-14 sm:px-8 sm:py-20 lg:px-10"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-tide/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-harbor/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-tide sm:text-sm sm:tracking-[0.2em]">
            Client Voices
          </p>
          <h2
            id="testimonials-heading"
            className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            What People Say About Us
          </h2>
          <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-base">
            Leaders across continents trust Traviona for strategic clarity, political intelligence, and execution
            support when the stakes are highest.
          </p>
        </div>

        <div className="testimonials-marquee relative mt-10 sm:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-ivory via-ivory/90 to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-mist/80 via-white/70 to-transparent sm:w-16" />

          <div className="overflow-hidden pb-2 motion-reduce:overflow-x-auto motion-reduce:pb-4">
            <div className="testimonials-marquee-track flex w-max items-stretch gap-5 sm:gap-6">
              {marqueeItems.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
