import { Globe2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Careers', to: '/#careers' },
  { label: 'Talent Network', to: '/#talent-network' },
  { label: 'Contact', to: '/about#contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setIsMenuOpen(false);

  const resolveHref = (to) => {
    if (to.startsWith('/#') && location.pathname !== '/') {
      return to;
    }
    return to;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full max-w-full overflow-x-hidden bg-ink/92 pt-[env(safe-area-inset-top)] backdrop-blur lg:absolute lg:inset-x-0 lg:top-0 lg:bg-transparent lg:pt-0">
      <nav className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
        <Link to="/" className="flex min-w-0 shrink items-center gap-3 text-white" onClick={closeMenu}>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-tide/60 bg-tide/15">
            <Globe2 className="h-5 w-5 text-tide" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-wide">Traviona</span>
        </Link>

        <div className="hidden min-w-0 items-center gap-8 rounded-full border border-white/10 bg-ink/30 px-6 py-3 text-sm text-white/80 backdrop-blur lg:flex">
          {navItems.map(({ label, to }) =>
            to.startsWith('/') && !to.includes('#') ? (
              <Link key={label} to={to} className="transition hover:text-tide">
                {label}
              </Link>
            ) : (
              <a key={label} href={resolveHref(to)} className="transition hover:text-tide">
                {label}
              </a>
            ),
          )}
        </div>

        <a
          href="/about#contact"
          className="hidden shrink-0 rounded-full bg-tide px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white lg:inline-flex"
        >
          Enquire
        </a>

        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-ink/35 text-white backdrop-blur lg:hidden"
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
          className="mx-4 mb-3 rounded-lg border border-white/12 bg-ink/95 text-white shadow-soft backdrop-blur sm:mx-8 lg:hidden"
        >
          <div className="flex flex-col px-4 py-3">
            {navItems.map(({ label, to }) =>
              to.startsWith('/') && !to.includes('#') ? (
                <Link
                  key={label}
                  to={to}
                  className="border-b border-white/10 px-1 py-3 text-sm font-semibold text-white/86 transition last:border-b-0 hover:text-tide"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={resolveHref(to)}
                  className="border-b border-white/10 px-1 py-3 text-sm font-semibold text-white/86 transition last:border-b-0 hover:text-tide"
                  onClick={closeMenu}
                >
                  {label}
                </a>
              ),
            )}
            <a
              href="/about#contact"
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
