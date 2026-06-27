import Footer from '../components/Footer.jsx';

const titles = {
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'cookie-policy': 'Cookie Policy',
};

export default function LegalPage({ page }) {
  const title = titles[page] || 'Legal';

  return (
    <>
      <section className="w-full max-w-full overflow-x-hidden bg-ivory px-4 pb-12 pt-28 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-harbor">Legal</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mt-6 text-sm leading-7 text-ink/65 sm:text-base">
            This page is being prepared. For enquiries, contact{' '}
            <a href="mailto:info@travionaconsulting.com" className="font-semibold text-harbor hover:text-ink">
              info@travionaconsulting.com
            </a>
            .
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
