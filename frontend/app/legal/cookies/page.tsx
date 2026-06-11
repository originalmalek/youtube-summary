import { Breadcrumbs } from '@/components/seo/breadcrumbs';

export default function CookiePolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Breadcrumbs items={[
        { name: 'Legal', url: '/legal/cookies' },
        { name: 'Cookie Policy', url: '/legal/cookies' }
      ]} />
      <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <strong>Version 1.1</strong><br/>
          Last updated: January 15, 2025
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Cookie Consent Notice</h2>
          <p>
            By continuing to use Summar.me, you consent to our use of cookies as described in this policy.
            You can manage your preferences through your browser settings or cookie preference center.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
          <p>Summar.me uses cookies for the following purposes:</p>
          
          <h3 className="text-xl font-medium mb-2 mt-4">Essential Cookies</h3>
          <p>These cookies are necessary for the Service to function properly:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Authentication Cookie:</strong> Keeps you logged in during your session</li>
            <li><strong>Security Cookie:</strong> Helps protect against Cross-Site Request Forgery (CSRF) attacks</li>
            <li><strong>Session Cookie:</strong> Maintains your session state</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">Functional Cookies</h3>
          <p>These cookies enhance your experience:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Language Preference:</strong> Remembers your preferred summary language</li>
            <li><strong>Theme Preference:</strong> Remembers if you prefer light or dark mode</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookie Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Duration</th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">access_token</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">User authentication</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">15 minutes</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">refresh_token</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Session renewal</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">7 days</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Essential</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">theme</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">UI theme preference</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">1 year</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Functional</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">language</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Summary language preference</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">1 year</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">Functional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Processing Cookies</h2>
          <p>
            Our payment processors may set cookies to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure payment transactions and prevent fraud</li>
            <li>Remember payment preferences and billing information</li>
            <li>Comply with PCI DSS requirements and card network rules</li>
          </ul>
          <p className="mt-4">
            <strong>Legal basis:</strong> These cookies are strictly necessary for the performance of a contract with you (Article 6(1)(b) GDPR).
            These cookies are essential for payment processing and cannot be disabled.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          <p>
            We do not use any third-party cookies for advertising or tracking purposes. However, some third-party services we integrate with may set their own cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Sentry:</strong> Error tracking service (only when errors occur)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
          <p>
            You can control and manage cookies in various ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Most browsers allow you to view, delete, and block cookies from websites</li>
            <li>You can set your browser to notify you when cookies are sent</li>
            <li>You can delete all cookies that are already on your device</li>
          </ul>
          
          <p className="mt-4">
            <strong>EU Residents:</strong> You have the right to manage your cookie preferences via browser settings or cookie preference center.
            Essential cookies cannot be disabled as they are necessary for service functionality and contract performance.
          </p>
          
          <p className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <strong>Note:</strong> Blocking or deleting essential cookies may prevent you from using certain features of our Service, such as staying logged in.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browser-Specific Instructions</h2>
          <p>Here's how to manage cookies in popular browsers:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new Cookie Policy on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:
          </p>
          <ul className="list-none space-y-1 mt-4">
            <li>Email: privacy@summar.me</li>
          </ul>
        </section>
      </div>
    </div>
  );
}