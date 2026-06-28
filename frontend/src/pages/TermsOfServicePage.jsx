import LegalDocumentLayout, {
  LegalBulletList,
  LegalInlineLink,
  LegalSection,
} from '../components/legal/LegalDocumentLayout.jsx';

export default function TermsOfServicePage() {
  return (
    <LegalDocumentLayout title="Terms of Service">
      <p className="text-base leading-relaxed text-[#374151]">
        These Terms of Service govern your access to and use of the Traviona Consulting website, member platform, and
        related services. By using our services, you agree to these terms. If you do not agree, please do not use the
        platform.
      </p>

      <LegalSection number="1" title="Use of Our Services">
        <p>
          Traviona provides professional consulting content, career opportunities, talent network features, and related
          digital services. You agree to use the platform only for lawful purposes and in a manner consistent with these
          terms and applicable regulations.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Account Registration">
        <p>When you create an account, you agree to:</p>
        <LegalBulletList
          items={[
            'Provide accurate, current, and complete information',
            'Maintain the confidentiality of your login credentials',
            'Accept responsibility for activity conducted under your account',
            'Notify us promptly of any unauthorised access or security concern',
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Applications and Submissions">
        <p>
          Information submitted through job applications, contact forms, or talent profiles must be truthful and
          professionally appropriate. Traviona may review, evaluate, or decline submissions at its discretion.
          Submission of content does not guarantee engagement, employment, or partnership.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Intellectual Property">
        <p>
          All website content, branding, insights, materials, and platform functionality are owned by or licensed to
          Traviona Consulting unless otherwise stated. You may not copy, reproduce, distribute, or exploit site content
          without prior written permission, except for personal, non-commercial use permitted by law.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Prohibited Conduct">
        <p>You must not:</p>
        <LegalBulletList
          items={[
            'Attempt to gain unauthorised access to systems, accounts, or data',
            'Upload malicious code or interfere with platform operation',
            'Misrepresent your identity, qualifications, or affiliation',
            'Use the platform to harass, defame, or violate the rights of others',
          ]}
        />
      </LegalSection>

      <LegalSection number="6" title="Disclaimer">
        <p>
          Our website and insights are provided for general informational purposes. They do not constitute legal,
          financial, or professional advice unless expressly agreed in a separate engagement. Traviona makes reasonable
          efforts to maintain accurate content but does not guarantee completeness or uninterrupted availability.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Traviona Consulting shall not be liable for indirect, incidental,
          special, or consequential damages arising from your use of the platform. Our total liability for any claim
          relating to the services shall not exceed the amount paid by you, if any, for access to the relevant service
          during the preceding twelve months.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Changes to These Terms">
        <p>
          We may update these Terms of Service from time to time. Material changes will be reflected by updating the
          date at the top of this page. Continued use of the platform after changes become effective constitutes
          acceptance of the revised terms.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Contact">
        <p>
          Questions about these terms may be sent to{' '}
          <LegalInlineLink href="mailto:legal@travionaconsulting.top">legal@travionaconsulting.top</LegalInlineLink>.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
