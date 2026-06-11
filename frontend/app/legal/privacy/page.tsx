import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Breadcrumbs items={[
        { name: 'Legal', url: '/legal/privacy' },
        { name: 'Privacy Policy', url: '/legal/privacy' }
      ]} />
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <strong>Version 1.1</strong><br/>
          Last updated: January 15, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-2">Information You Provide:</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Email address (for account registration)</li>
            <li>Password (stored in encrypted form)</li>
            <li>YouTube video URLs you submit for summarization</li>
            <li>Text files and content you upload</li>
            <li>Generated summaries and your interactions with them</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Automatically Collected Information:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage data (pages visited, features used)</li>
            <li>Timestamps of your activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Process your summarization requests</li>
            <li>Send email verifications and password reset links</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Improve our Service and develop new features</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your data is stored in secure MongoDB Atlas cloud databases</li>
            <li>Passwords are hashed using bcrypt encryption</li>
            <li>We use HTTPS for all data transmissions</li>
            <li>Access to user data is restricted to authorized personnel only</li>
            <li>We implement rate limiting to prevent abuse</li>
          </ul>
          <p className="mt-4">
            However, no method of electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Third Parties</h2>
          <p>We do not sell, trade, or rent your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>OpenAI:</strong> To process summarization requests (content only, not personal data)</li>
            <li><strong>YouTube API:</strong> To fetch video transcripts (video URLs only)</li>
            <li><strong>Email Service Provider:</strong> To send transactional emails</li>
            <li><strong>Error Tracking (Sentry):</strong> To monitor and fix technical issues</li>
            <li><strong>Legal Authorities:</strong> If required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Payment Data Processing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payment information is processed exclusively by PCI DSS Level 1 certified payment partners</li>
            <li>We do not store credit card numbers, CVV codes, or other sensitive payment data</li>
            <li>Payment transactions are tokenized and encrypted</li>
            <li>Our payment processors comply with all applicable card network security standards</li>
            <li>Billing information (name, address) may be stored for invoicing and tax compliance</li>
            <li>Billing records are retained for 7 years as required by Georgian tax law</li>
            <li>Payment data is subject to our payment processor's privacy policies</li>
            <li>For payment-related inquiries: <strong>billing@summar.me</strong></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Authentication:</strong> To keep you logged in (essential cookies)</li>
            <li><strong>Preferences:</strong> To remember your settings</li>
            <li><strong>Security:</strong> To prevent fraudulent activity</li>
          </ul>
          <p className="mt-4">
            We do not use third-party advertising cookies or tracking pixels.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your summaries</li>
            <li>Opt-out of non-essential emails</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us at privacy@summar.me
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. GDPR Rights for EU Residents</h2>
          <p>If you are located in the European Union, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to rectify inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to data portability</li>
            <li>Right to restrict processing</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge complaints with supervisory authorities</li>
          </ul>
          <p className="mt-4">
            We will respond to your requests within 30 days as required by GDPR.<br/>
            To exercise these rights, contact: <strong>gdpr@summar.me</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Data Breach Notification</h2>
          <p>In case of a data breach that may affect your payment information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We will notify affected users within 72 hours</li>
            <li>Notification will include steps to protect your account</li>
            <li>We maintain comprehensive incident response procedures</li>
            <li>EU residents will be notified through supervisory authorities as required</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account data is retained as long as your account is active</li>
            <li>Summaries are retained until you delete them</li>
            <li>Deleted accounts and data are permanently removed within 30 days</li>
            <li>We may retain anonymized usage data for analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. International Data Transfers</h2>
          <p>
            Your data may be transferred between Georgia and other countries including the European Union.
            We ensure appropriate safeguards including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standard Contractual Clauses (SCCs) for EU transfers under Article 46 of GDPR</li>
            <li>Adequate security measures for data protection</li>
            <li>Compliance with local data protection requirements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

      </div>
    </div>
  );
}