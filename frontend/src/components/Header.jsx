import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Careers', to: '/careers' },
  { label: 'Talent Network', to: '/talent-network' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const closeMenu = () => setIsMenuOpen(false);

  const resolveHref = (to) => {
    if (to.startsWith('/#') && location.pathname !== '/') {
      return to;
    }
    return to;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full max-w-full overflow-x-hidden pt-[env(safe-area-inset-top)] lg:absolute lg:inset-x-0 lg:top-0 lg:pt-0">
      {/* Solid bar on mobile — backdrop-blur blurs logo text while scrolling on phones */}
      <div
        className="pointer-events-none absolute inset-0 border-b border-white/10 bg-ink lg:hidden"
        aria-hidden="true"
      />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
        <Link
          to="/"
          className="site-header-logo relative z-10 flex min-w-0 shrink items-center text-white"
          onClick={closeMenu}
        >
          <Logo variant="header" />
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

        <div className="relative z-10 hidden shrink-0 items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-white/75">{user.first_name || user.username}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-tide hover:text-tide"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to={`/login?next=${encodeURIComponent(location.pathname)}`}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-tide hover:text-tide"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/contact"
            className="inline-flex rounded-full bg-tide px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Enquire
          </Link>
        </div>

        <button
          className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-ink text-white lg:hidden"
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
          className="relative z-10 mx-4 mb-3 rounded-lg border border-white/12 bg-ink text-white shadow-soft sm:mx-8 lg:hidden"
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
            <Link
              to={isAuthenticated ? '/careers' : `/login?next=${encodeURIComponent('/careers')}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-tide px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"
              onClick={closeMenu}
            >
              {isAuthenticated ? 'My Careers' : 'Sign In'}
            </Link>
            <Link
              to="/contact"
              className="mt-3 inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-tide hover:text-tide"
              onClick={closeMenu}
            >
              Enquire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
