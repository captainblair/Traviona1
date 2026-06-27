import { Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLockup from './BrandLockup.jsx';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Careers', to: '/careers' },
  { label: 'Talent Network', to: '/talent-network' },
  { label: 'Contact Us', to: '/contact' },
];

const services = [
  { label: 'Global Strategy', to: '/#services' },
  { label: 'Public Affairs & Political Risk', to: '/#services' },
  { label: 'Risk Advisory', to: '/#services' },
  { label: 'Talent Acquisition', to: '/talent-network' },
  { label: 'Geopolitical Intelligence', to: '/insights' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://x.com', Icon: XIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
];

function FooterLink({ to, children }) {
  const className = 'block w-fit text-sm leading-6 text-white/65 transition hover:text-tide';

  if (to.includes('#')) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FooterColumn({ title, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-tide">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FooterLinkList({ items }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ label, to }) => (
        <li key={label}>
          <FooterLink to={to}>{label}</FooterLink>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer id="site-footer" className="w-full max-w-full overflow-x-hidden bg-ink px-4 py-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-white sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <FooterColumn title="Quick Links" className="order-1">
            <FooterLinkList items={quickLinks} />
          </FooterColumn>

          <FooterColumn title="Services" className="order-2">
            <FooterLinkList items={services} />
          </FooterColumn>

          <FooterColumn title="Legal" className="order-3">
            <FooterLinkList items={legalLinks} />
            <p className="mt-6 text-xs leading-5 text-white/45">
              © 2026 Traviona Consulting. All Rights Reserved.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/6 text-white/75 transition hover:border-tide hover:bg-tide/15 hover:text-tide"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </FooterColumn>

          <FooterColumn title="Company" className="order-4 sm:col-span-2 lg:col-span-1">
            <BrandLockup size="md" theme="dark" showSubtitle={false} />
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
              Strategic international consulting and global insights for a complex world.
            </p>
            <a
              href="mailto:info@travionaconsulting.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-tide"
            >
              <Mail className="h-4 w-4 shrink-0 text-tide" aria-hidden="true" />
              info@travionaconsulting.com
            </a>
          </FooterColumn>
        </div>
      </div>
    </footer>
  );
}
