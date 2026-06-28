import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';

export function LegalSection({ number, title, children }) {
  return (
    <section className="mt-16">
      <h2 className="mb-4 text-2xl font-semibold text-[#14B8A6]">
        {number}. {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-[#374151]">{children}</div>
    </section>
  );
}

export function LegalBulletList({ items }) {
  return (
    <ul className="ml-6 list-disc space-y-2 leading-relaxed text-[#374151] marker:text-[#14B8A6]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalInlineLink({ href, to, children }) {
  const className = 'font-semibold text-[#14B8A6] hover:underline';

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-[#0F172A]/10 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p className="text-sm leading-relaxed text-[#374151]">
          &copy; {new Date().getFullYear()} Traviona Consulting
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          <Link to="/" className="text-[#14B8A6] hover:underline">
            Home
          </Link>
          <Link to="/privacy-policy" className="text-[#14B8A6] hover:underline">
            Privacy
          </Link>
          <Link to="/terms-of-service" className="text-[#14B8A6] hover:underline">
            Terms
          </Link>
          <Link to="/cookie-policy" className="text-[#14B8A6] hover:underline">
            Cookies
          </Link>
          <Link to="/contact" className="text-[#14B8A6] hover:underline">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default function LegalDocumentLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 sm:px-8 lg:px-10">
          <Link to="/" className="inline-flex items-center gap-4 transition hover:opacity-90">
            <Logo variant="navy" />
            <span className="hidden font-display text-lg font-bold text-[#0F172A] sm:block">
              Traviona Consulting
            </span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-[#14B8A6] hover:underline">
            Back to site
          </Link>
        </div>
      </header>

      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-4 sm:px-8 sm:pb-24 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#14B8A6]">Legal</p>

          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#0F172A] sm:text-5xl">{title}</h1>

          <p className="mt-5 text-base leading-relaxed text-[#374151]">Last updated: June 28, 2026</p>

          <div className="mt-10">{children}</div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
