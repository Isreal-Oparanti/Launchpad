'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
               <span> 
          <img 
            src="favicon/android-chrome-512x512.png" 
            alt="foundrgeeks logo" 
            className={`object-cover w-11 h-11`}
          />
        </span>
        <span className="font-bold text-teal-800">Foun<span className="text-orange-500">dr</span>Geeks</span>  
            </Link>
            <Link 
              href="/"
              className="text-sm text-gray-600 hover:text-teal-600 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-2xl text-teal-100 mb-4">Last Updated: November 16, 2025</p>
          <p className="text-lg text-teal-100 max-w-3xl mx-auto">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information when you use FoundrGeeks.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          
          {/* Introduction */}
          <div className="mb-12 p-6 bg-teal-50 border-l-4 border-teal-600 rounded-r-lg">
            <p className="text-gray-800 text-lg leading-relaxed">
              <strong>Welcome to FoundrGeeks!</strong> We are committed to protecting your privacy and handling your data with care and transparency. This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              1. Information We Collect
            </h2>
            
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and username</li>
                  <li>Profile information including bio, skills, interests, and expertise</li>
                  <li>Contact details such as location and social media links</li>
                  <li>Profile pictures and project images you upload</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and approximate location</li>
                  <li>Pages you visit and features you use</li>
                  <li>Time and date of your activities</li>
                  <li>Interaction patterns and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">User-Generated Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Projects you create and showcase</li>
                  <li>Messages and communications with other users</li>
                  <li>Comments and feedback on projects</li>
                  <li>Collaboration preferences and team-building criteria</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              2. How We Use Your Information
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p className="font-semibold text-gray-900">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Provide Services:</strong> Create and manage your account, enable core platform features</li>
                <li><strong>Matchmaking:</strong> Connect you with potential co-founders and collaborators based on your profile and preferences</li>
                <li><strong>Communication:</strong> Send you notifications, updates, and respond to your inquiries</li>
                <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance user experience and develop new features</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and protect the safety of our community</li>
                <li><strong>Legal Compliance:</strong> Fulfill legal obligations and enforce our Terms of Service</li>
                <li><strong>Marketing:</strong> Send relevant updates about platform features (you can opt-out anytime)</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              3. How We Share Your Information
            </h2>
            
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Public Information</h3>
                <p>The following information is visible to other FoundrGeeks users:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your public profile (name, bio, skills, interests, expertise)</li>
                  <li>Projects you publish on the platform</li>
                  <li>Comments and interactions on public projects</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">With Your Consent</h3>
                <p>We may share information when you explicitly consent, such as when you enable collaboration features or connect with third-party services.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
                <p>We work with trusted third-party service providers who help us operate the platform:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Cloud hosting and storage providers</li>
                  <li>Analytics and performance monitoring services</li>
                  <li>Email and communication platforms</li>
                  <li>Payment processors (if applicable)</li>
                </ul>
                <p className="mt-2">These providers are bound by strict confidentiality agreements and can only use your data to provide services to us.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Requirements</h3>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, and safety</li>
                  <li>Prevent fraud or security threats</li>
                  <li>Respond to emergencies involving danger to individuals</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              4. Data Security
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>We take the security of your data seriously and implement multiple layers of protection:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols</li>
                <li><strong>Secure Authentication:</strong> Passwords are hashed using strong cryptographic algorithms</li>
                <li><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access user data</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                <li><strong>Monitoring:</strong> 24/7 monitoring systems detect and respond to security threats</li>
                <li><strong>Data Backups:</strong> Regular backups ensure data can be recovered in case of incidents</li>
              </ul>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-amber-800">
                  <strong>Important Note:</strong> While we implement robust security measures, no system is 100% secure. We encourage you to use strong passwords and enable two-factor authentication when available.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              5. Your Rights and Choices
            </h2>
            
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>You have control over your personal information. Your rights include:</p>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Access and Correction</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View and update your profile information at any time</li>
                  <li>Request a copy of all data we have about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deletion</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delete your account through account settings</li>
                  <li>Request removal of specific content or information</li>
                  <li>We will delete your data within 30 days of your request (except where legally required to retain)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Controls</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Control your collaboration profile visibility</li>
                  <li>Manage email and notification preferences</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Choose what information is publicly visible</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Portability</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Export your data in a structured, machine-readable format</li>
                  <li>Transfer your data to another service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Objection and Withdrawal</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Object to certain data processing activities</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-blue-800">
                  <strong>Exercise Your Rights:</strong> To exercise any of these rights, contact us at privacy@foundrgeeks.com. We will respond within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              6. Cookies and Tracking
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>We use cookies and similar technologies to enhance your experience:</p>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 space-y-3">
                  <li><strong>Essential Cookies:</strong> Required for platform functionality (login, security, preferences)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve our platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                  <li><strong>Performance Cookies:</strong> Monitor platform performance and speed</li>
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Managing Cookies</h3>
                <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality. Most browsers allow you to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>View and delete existing cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block all third-party cookies</li>
                  <li>Clear all cookies when you close the browser</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              7. Third-Party Services
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>FoundrGeeks may integrate with or link to third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication:</strong> Google, LinkedIn, or other OAuth providers for sign-in</li>
                <li><strong>Analytics:</strong> Tools to measure and analyze platform usage</li>
                <li><strong>Cloud Services:</strong> Storage and hosting infrastructure</li>
                <li><strong>Communication:</strong> Email and messaging services</li>
              </ul>
              
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-gray-800">
                  These third-party services have their own privacy policies. We encourage you to review them. FoundrGeeks is not responsible for the privacy practices of external services.
                </p>
              </div>
            </div>
          </section>

          

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              8. International Data Transfers
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.</p>
              <p>When we transfer data internationally, we ensure appropriate safeguards are in place:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Data processing agreements with all service providers</li>
                <li>Compliance with applicable data protection laws (GDPR, CCPA, etc.)</li>
                <li>Encryption during transfer and at rest</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              9. Data Retention
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>We retain your information only as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve and develop our platform</li>
              </ul>
              
              <p className="mt-4"><strong>Account Deletion:</strong> When you delete your account, we remove your personal information within 30 days. However, we may retain certain information where we have a legitimate reason or legal obligation to do so (e.g., transaction records, legal disputes).</p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              10. Changes to This Policy
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.</p>
              
              <p><strong>We will notify you of significant changes by:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sending an email to your registered email address</li>
                <li>Displaying a prominent notice on the platform</li>
                <li>In-app notifications</li>
              </ul>
              
              <p className="mt-4">Your continued use of FoundrGeeks after the changes take effect constitutes acceptance of the updated policy. We encourage you to review this policy periodically.</p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              11. California Privacy Rights (CCPA)
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Right to Know:</strong> Request details about the personal information we collect, use, and share</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (Note: We do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights</li>
              </ul>
              
              <p className="mt-4">To exercise these rights, contact us at privacy@foundrgeeks.com with "California Privacy Rights" in the subject line.</p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              12. European Privacy Rights (GDPR)
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>If you are in the European Economic Area (EEA), UK, or Switzerland, you have rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Right of Access:</strong> Obtain confirmation of data processing and access to your data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restriction:</strong> Restrict processing of your data in certain circumstances</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for consent-based processing</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-teal-600">
              13. Contact Us
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              
              <div className="mt-6 p-6 bg-gray-50 border border-gray-300 rounded-xl">
                <div className="space-y-3">
                  <p><strong>Privacy Team:</strong> privacy@foundrgeeks.com</p>
                  <p><strong>General Support:</strong> support@foundrgeeks.com</p>
                  <p><strong>Website:</strong> www.foundrgeeks.com</p>
                  <p><strong>Mailing Address:</strong> Lagos, Nigeria</p>
                </div>
              </div>

              <p className="mt-6">We are committed to resolving your privacy concerns. We will respond to all inquiries within 30 days.</p>
            </div>
          </section>

          {/* Trust Badge */}
          <div className="mt-12 p-8 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Privacy Commitment</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  At FoundrGeeks, your privacy is a top priority. We are committed to protecting your data, being transparent about our practices, and giving you control over your information. We regularly review and update our security measures to keep your data safe.
                </p>
                <p className="text-gray-700 text-lg mt-4">
                  <strong>Last Updated:</strong> November 16, 2025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Link 
            href="/terms-of-service"
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-teal-600 transition-all font-semibold text-lg shadow-sm"
          >
            Terms of Service
          </Link>
          <Link 
            href="/contact"
            className="px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-semibold text-lg shadow-md"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              
            </div>
            <p className="text-gray-400">
              © {new Date().getFullYear()} FoundrGeeks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}