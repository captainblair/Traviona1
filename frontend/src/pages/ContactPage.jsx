import { ChevronDown, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer.jsx';
import { RevealSection } from '../components/reveal.jsx';
import { contactTopics, fetchContactInformation, submitContactEnquiry } from '../lib/contactApi.js';

function Field({ id, label, type = 'text', value, onChange, required = true, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-ink/50">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/40 focus:border-tide/40 focus:ring-2"
      />
    </div>
  );
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    topic: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContactInformation().then(setContactInfo);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await submitContactEnquiry(form);
      setSuccess('Thank you — your message has been sent. We will respond within two business days.');
      setForm({
        full_name: '',
        email: '',
        company: '',
        topic: 'general',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Unable to send your message.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const email = contactInfo?.email || 'info@travionaconsulting.top';
  const phone = contactInfo?.phone || '+254 111 414 4441';
  const address = contactInfo?.address;

  return (
    <>
      <section className="relative w-full max-w-full overflow-x-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-midnight to-harbor/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(43,196,182,0.22),transparent_42%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-8 sm:pb-14 sm:pt-32 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-tide">Contact</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Get in touch with Traviona
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-mist sm:text-base">
            Tell us about your enquiry — advisory support, careers, talent network, or a general question. No account
            required.
          </p>
        </div>
      </section>

      <RevealSection className="w-full max-w-full overflow-x-hidden bg-ivory px-4 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-[0_16px_40px_rgba(7,19,31,0.07)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Send a message</h2>
            <p className="mt-2 text-sm text-ink/60">Fields marked with * are required.</p>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            {success && (
              <p className="mt-4 rounded-xl border border-tide/20 bg-tide/10 px-4 py-3 text-sm text-harbor">{success}</p>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field
                id="contact-name"
                label="Full name *"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                autoComplete="name"
              />
              <Field
                id="contact-email"
                label="Email address *"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                autoComplete="email"
              />
              <Field
                id="contact-company"
                label="Organisation (optional)"
                value={form.company}
                onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                required={false}
                autoComplete="organization"
              />
              <div className="relative">
                <label htmlFor="contact-topic" className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-ink/50">
                  Topic *
                </label>
                <select
                  id="contact-topic"
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  required
                  className="w-full appearance-none rounded-xl border border-ink/10 bg-white px-4 py-3.5 pr-10 text-sm text-ink outline-none ring-tide/30 focus:border-tide/40 focus:ring-2"
                >
                  {contactTopics.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-[2.65rem] h-4 w-4 text-ink/45" aria-hidden="true" />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-ink/50">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  required
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="How can Traviona support you?"
                  className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-ink outline-none ring-tide/30 placeholder:text-ink/40 focus:border-tide/40 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tide px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-ink/8 bg-midnight p-6 text-white shadow-[0_16px_40px_rgba(7,19,31,0.12)]">
              <h2 className="font-display text-xl font-bold">Direct contact</h2>
              <ul className="mt-5 space-y-4 text-sm text-white/75">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-tide" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="transition hover:text-tide">
                    {email}
                  </a>
                </li>
                {phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-tide" aria-hidden="true" />
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="transition hover:text-tide">
                      {phone}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tide" aria-hidden="true" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-ink/8 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">What happens next?</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/65">
                <li>We review your enquiry within two business days.</li>
                <li>A Traviona advisor responds by email.</li>
                <li>For careers or talent requests, we may direct you to the relevant portal.</li>
              </ol>
            </div>
          </aside>
        </div>
      </RevealSection>

      <Footer />
    </>
  );
}
