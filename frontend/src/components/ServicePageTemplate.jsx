import {
  AlertTriangle,
  BriefcaseBusiness,
  Globe2,
  Handshake,
  Layers,
  LineChart,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer.jsx';
import { RevealItem, RevealSection } from './reveal.jsx';

const iconComponents = {
  Globe2,
  Layers,
  LineChart,
  BriefcaseBusiness,
  ShieldCheck,
  Users,
  AlertTriangle,
  Handshake,
  MapPin,
  Search,
};

export default function ServicePageTemplate({ service }) {
  const ctaHref = service.ctaHref ?? '/contact?topic=advisory';
  const ctaLabel = service.ctaLabel ?? 'Request a Consultation';

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[22rem] w-full overflow-hidden sm:min-h-[26rem] lg:min-h-[32rem]">
        <img
          src={service.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/82 to-[#0F172A]/55" />
        <div className="absolute inset-0 bg-[#07131f]/25" />

        <div className="relative mx-auto flex h-full min-h-[inherit] max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">Our Services</p>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
            {service.subheadline}
          </p>
        </div>
      </section>

      {/* Main content */}
      <RevealSection className="bg-white px-4 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold leading-tight text-[#0F172A] sm:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#374151]">{service.subheadline}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-[#0F172A] sm:text-3xl">Overview</h2>
            <div className="mt-8 space-y-6">
              {service.description.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-[#374151] sm:text-[1.0625rem] sm:leading-[1.85]">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold text-[#0F172A] sm:text-3xl">Key Benefits</h2>
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {service.benefits.map(({ label, icon }, index) => {
                  const Icon = iconComponents[icon] ?? BriefcaseBusiness;
                  return (
                    <RevealItem
                      key={label}
                      delay={index * 80}
                      className="flex gap-4 rounded-xl border border-[#0F172A]/8 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="pt-2 text-sm font-semibold leading-relaxed text-[#374151] sm:text-base">{label}</p>
                    </RevealItem>
                  );
                })}
              </ul>
            </div>

            <div className="mt-16 rounded-2xl border border-[#14B8A6]/20 bg-white p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold text-[#0F172A] sm:text-3xl">Why Choose Traviona</h2>
              <ul className="mt-6 space-y-4">
                {service.whyChoose.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed text-[#374151]">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#14B8A6]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar CTA */}
          <aside className="lg:pt-2">
            <div className="sticky top-28 rounded-2xl border border-[#0F172A]/10 bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#14B8A6]">Get started</p>
              <h3 className="mt-3 font-display text-xl font-bold text-[#0F172A]">
                Ready to discuss your requirements?
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#374151]">
                Speak with our team about how {service.title} can support your organization.
              </p>
              <Link
                to={ctaHref}
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#0F172A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#14B8A6] hover:text-[#0F172A]"
              >
                {ctaLabel}
              </Link>
              <Link
                to="/contact"
                className="mt-4 block text-center text-sm font-semibold text-[#14B8A6] hover:underline"
              >
                Contact us
              </Link>
            </div>
          </aside>
        </div>
      </RevealSection>

      {/* Bottom CTA band */}
      <section className="border-t border-[#0F172A]/8 bg-white px-4 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-[#0F172A]">Partner with Traviona Consulting</h2>
            <p className="mt-4 text-base leading-relaxed text-[#374151]">
              We help organizations navigate complexity with clarity, integrity, and global reach.
            </p>
          </div>
          <Link
            to={ctaHref}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#14B8A6] px-8 py-4 text-sm font-bold text-[#0F172A] transition hover:bg-[#0F172A] hover:text-white"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
