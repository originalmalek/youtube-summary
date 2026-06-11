import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Breadcrumbs items={[
        { name: 'Legal', url: '/legal/terms' },
        { name: 'Terms of Service', url: '/legal/terms' }
      ]} />
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <strong>Version 1.1</strong><br/>
          Last updated: January 15, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Summar.me ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p>
            Summar.me provides AI-powered summarization of YouTube videos and text files. The Service includes both free and paid subscription tiers with different usage limits and features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Subscription and Payment Terms</h2>
          <h3 className="text-xl font-semibold mb-2">3.1 Subscription Plans</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We offer various subscription plans with different features and usage limits</li>
            <li>Subscription details and pricing are displayed on our pricing page</li>
            <li>We reserve the right to modify subscription plans and pricing with 30 days notice</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Billing and Payment</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Subscriptions are billed monthly or annually in advance</li>
            <li>Payment is processed through secure third-party payment processors</li>
            <li>You authorize us to charge your payment method on a recurring basis</li>
            <li>All fees are in USD unless otherwise specified</li>
            <li>Automatic renewal: Subscriptions automatically renew unless cancelled</li>
            <li>Failed payments: We will retry failed payments up to 3 times over 7 days</li>
            <li>Currency conversion fees may apply for non-USD transactions</li>
            <li>VAT/GST and other taxes are additional where applicable</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Refund Policy</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>We offer a 7-day money-back guarantee for first-time subscribers</li>
            <li>No refunds are provided for partial month usage</li>
            <li>Refunds are processed to the original payment method within 5-10 business days</li>
            <li>Technical issues: Full refund if service unavailable for more than 24 hours</li>
          </ul>
          <p className="mt-4"><strong>Refunds are NOT available for:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Services already consumed</li>
            <li>Accounts terminated for Terms violation</li>
            <li>Disputes filed directly with payment processor without contacting us first</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">3.4 Cancellation</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may cancel your subscription at any time through your account settings</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>You will retain access to paid features until the end of your billing period</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">3.5 Payment Security and Compliance</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>All payment processing is handled by PCI DSS Level 1 certified third-party processors</li>
            <li>We do not store, process, or have access to your payment card information</li>
            <li>Payment data is encrypted and tokenized by our certified payment partners</li>
            <li>We monitor transactions for fraudulent activity and maintain compliance with international payment regulations</li>
            <li>Our processors comply with all applicable card network security standards</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2 mt-4">3.6 Chargeback and Dispute Policy</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>For payment disputes, please contact <strong>billing@summar.me</strong> first</li>
            <li>We respond to billing inquiries within 24-48 hours</li>
            <li>Chargebacks may result in service suspension pending resolution</li>
            <li>We maintain detailed transaction records for dispute resolution</li>
            <li>We work in good faith with our payment partners to resolve disputes promptly and in compliance with applicable card network rules</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide a valid email address to create an account</li>
            <li>You are responsible for maintaining the confidentiality of your password</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Attempt to bypass any rate limits or access restrictions</li>
            <li>Upload malicious files or content</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Attempt to access other users' accounts or data</li>
            <li>Use the Service to generate summaries of copyrighted content without permission</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Prohibited Financial Activities</h2>
          <p>You may not use our payment services for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Money laundering or other illegal financial activities</li>
            <li>Using stolen payment methods or identity theft</li>
            <li>Testing credit card numbers or fraudulent transactions</li>
            <li>Purchasing subscriptions for resale</li>
            <li>Using the service for illegal content processing</li>
            <li>Transactions related to high-risk or prohibited industries as defined by our payment processor</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Content and Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You retain ownership of content you upload for summarization</li>
            <li>You grant us a limited license to process your content for the purpose of generating summaries</li>
            <li>Summaries generated by our AI are provided for your personal use</li>
            <li>You are responsible for ensuring you have the right to use any content you submit</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
          <p>
            Your use of our Service is also governed by our Privacy Policy. By using the Service, you consent to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Collection and processing of your personal data as described in our Privacy Policy</li>
            <li>Storage of your summaries and usage data</li>
            <li>Use of cookies and similar tracking technologies</li>
            <li>Sharing of data with third-party service providers as necessary to operate the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations</h2>
          <p>
            <strong>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.</strong> We do not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The accuracy, completeness, or usefulness of summaries</li>
            <li>That the Service will be uninterrupted or error-free</li>
            <li>That defects will be corrected</li>
            <li>That the Service is free of viruses or harmful components</li>
          </ul>
          <p className="mt-4">
            IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Service Modifications</h2>
          <p>
            We reserve the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or discontinue the Service at any time</li>
            <li>Change these Terms of Service</li>
            <li>Impose limits on certain features or restrict access to parts of the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
          <p>
            Any disputes arising out of or relating to these Terms shall be resolved through:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>First, good faith negotiations between the parties</li>
            <li>If negotiations fail, binding arbitration in accordance with the rules of the American Arbitration Association</li>
            <li>Small claims court for qualifying claims</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Georgia.
          </p>
          <p className="mt-2">
            <strong>Business Entity:</strong> Individual Entrepreneur registered in Georgia
          </p>
          <p className="mt-2">
            Disputes will be resolved in Tbilisi, Georgia courts in Georgian or English language.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. When we do:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We will notify you via email or through the Service</li>
            <li>The updated Terms will be effective immediately for new users</li>
            <li>Existing users will have 30 days to accept the new Terms</li>
            <li>Continued use of the Service after changes constitutes acceptance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>General inquiries: support@summar.me</li>
            <li>Billing and payment issues: billing@summar.me</li>
            <li>Website: https://summar.me</li>
            <li>Business Entity: Individual Entrepreneur Sergey Shesternev</li>
          </ul>
        </section>
      </div>
    </div>
  );
}