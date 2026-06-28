import LegalDocumentLayout, {
  LegalBulletList,
  LegalInlineLink,
  LegalSection,
} from '../components/legal/LegalDocumentLayout.jsx';

export default function CookiePolicyPage() {
  return (
    <LegalDocumentLayout title="Cookie Policy">
      <p className="text-base leading-relaxed text-[#374151]">
        This Cookie Policy explains how Traviona Consulting uses cookies and similar technologies when you visit our
        website. It should be read alongside our{' '}
        <LegalInlineLink to="/privacy-policy">Privacy Policy</LegalInlineLink>.
      </p>

      <LegalSection number="1" title="What Are Cookies">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help websites function
          properly, remember preferences, and understand how visitors interact with content.
        </p>
      </LegalSection>

      <LegalSection number="2" title="How We Use Cookies">
        <p>We use cookies and similar technologies to:</p>
        <LegalBulletList
          items={[
            'Enable essential site functionality and secure account access',
            'Remember preferences and improve user experience',
            'Measure traffic and understand how our pages are used',
            'Support authentication and session management',
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Types of Cookies We Use">
        <p>
          <strong className="font-semibold text-[#0F172A]">Strictly necessary cookies</strong> — required for core
          website operation, security, and account access.
        </p>
        <p>
          <strong className="font-semibold text-[#0F172A]">Functional cookies</strong> — help remember choices and
          improve usability.
        </p>
        <p>
          <strong className="font-semibold text-[#0F172A]">Analytics cookies</strong> — help us understand visitor
          behaviour and improve content and performance.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Third-Party Cookies">
        <p>
          Some cookies may be placed by trusted third-party services that support analytics, authentication, or embedded
          content. These providers process data according to their own privacy policies. We aim to work only with
          reputable partners aligned with our standards.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Managing Cookies">
        <p>
          Most browsers allow you to control or delete cookies through settings. Disabling certain cookies may affect
          site functionality, including secure login and form submission. You can also adjust browser settings to block
          cookies or alert you when cookies are being used.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Updates to This Policy">
        <p>
          We may revise this Cookie Policy as our website and technologies evolve. Updates will be posted on this page
          with a revised &quot;Last updated&quot; date.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Contact">
        <p>
          For questions about our use of cookies, contact{' '}
          <LegalInlineLink href="mailto:privacy@travionaconsulting.com">privacy@travionaconsulting.com</LegalInlineLink>.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
