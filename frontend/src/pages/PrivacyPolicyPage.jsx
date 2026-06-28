import LegalDocumentLayout, {
  LegalBulletList,
  LegalInlineLink,
  LegalSection,
} from '../components/legal/LegalDocumentLayout.jsx';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy">
      <p className="text-base leading-relaxed text-[#374151]">
        At Traviona Consulting, we are committed to protecting your privacy and handling your personal data with
        transparency and care. This Privacy Policy explains how we collect, use, and safeguard information when you
        visit our website or use our services.
      </p>

      <LegalSection number="1" title="Information We Collect">
        <p>We collect information you provide directly, including:</p>
        <LegalBulletList
          items={[
            'Name and contact details when you register, apply for roles, or join our talent network',
            'Professional background, CV, and employment-related information',
            'Communication data when you contact us or subscribe to updates',
            'Account credentials and preferences associated with your member profile',
          ]}
        />
        <p>
          We may also collect limited technical data such as browser type, device information, and usage analytics to
          improve site performance and security.
        </p>
      </LegalSection>

      <LegalSection number="2" title="How We Use Your Information">
        <p>We use your information to:</p>
        <LegalBulletList
          items={[
            'Provide consulting, recruitment, and talent network services',
            'Review applications and communicate about opportunities',
            'Respond to enquiries and deliver requested information',
            'Improve our website, content, and client experience',
            'Maintain security, prevent fraud, and comply with legal obligations',
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Sharing of Information">
        <p>
          We do not sell your personal data. We may share information with trusted service providers, professional
          partners, or affiliates only when necessary to deliver our services, operate our platform, or meet legal
          requirements. All third parties are expected to handle data responsibly and in line with applicable law.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Data Retention">
        <p>
          We retain personal data only for as long as needed to fulfil the purposes described in this policy, unless a
          longer retention period is required or permitted by law. When data is no longer required, we take reasonable
          steps to delete or anonymise it.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Your Rights">
        <p>
          Depending on your location, you may have the right to access, correct, update, restrict, or delete your
          personal data, or to object to certain processing. To exercise these rights, contact us at{' '}
          <LegalInlineLink href="mailto:privacy@travionaconsulting.top">
            privacy@travionaconsulting.top
          </LegalInlineLink>
          .
        </p>
      </LegalSection>

      <LegalSection number="6" title="Contact Us">
        <p>
          If you have questions about this Privacy Policy or our data practices, please contact{' '}
          <LegalInlineLink href="mailto:privacy@travionaconsulting.top">
            privacy@travionaconsulting.top
          </LegalInlineLink>{' '}
          or visit our <LegalInlineLink to="/contact">contact page</LegalInlineLink>.
        </p>
      </LegalSection>

      <p className="mt-16 border-t border-[#0F172A]/10 pt-10 text-base leading-relaxed text-[#374151]">
        For full details, please contact us.
      </p>
    </LegalDocumentLayout>
  );
}
