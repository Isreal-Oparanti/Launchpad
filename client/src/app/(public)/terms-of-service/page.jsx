'use client';

import Link from 'next/link';

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using FoundrGeeks, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our platform."
    },
    {
      title: "2. Description of Service",
      content: "FoundrGeeks is a platform that connects entrepreneurs, founders, and innovators to collaborate on projects, find co-founders, and build startups together. We provide tools for project showcasing, team matching, and collaboration management."
    },
    {
      title: "3. User Accounts",
      content: "To access certain features, you must create an account. You are responsible for:\n• Maintaining the confidentiality of your account credentials\n• All activities that occur under your account\n• Ensuring your account information is accurate and up-to-date\n• Notifying us immediately of any unauthorized use"
    },
    {
      title: "4. User Conduct",
      content: "You agree not to:\n• Post false, misleading, or fraudulent content\n• Impersonate any person or entity\n• Harass, abuse, or harm other users\n• Upload malicious code or viruses\n• Violate any applicable laws or regulations\n• Use the platform for spam or unauthorized advertising\n• Scrape or collect data without permission"
    },
    {
      title: "5. Content Ownership and Rights",
      content: "You retain ownership of content you post on FoundrGeeks. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on the platform. You represent that you have all necessary rights to the content you post."
    },
    {
      title: "6. Intellectual Property",
      content: "The FoundrGeeks platform, including its design, features, and functionality, is owned by FoundrGeeks and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of our platform without explicit permission."
    },
    {
      title: "7. Project and Collaboration Terms",
      content: "• All agreements between users are made independently of FoundrGeeks\n• We are not party to any contracts between users\n• Users are responsible for their own agreements and collaborations\n• We do not guarantee the success of any project or collaboration\n• Exercise due diligence when entering partnerships"
    },
    {
      title: "8. Privacy and Data Protection",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using FoundrGeeks, you consent to our data practices as described in our Privacy Policy."
    },
    {
      title: "9. Termination",
      content: "We reserve the right to suspend or terminate your account at any time for:\n• Violation of these Terms of Service\n• Fraudulent or illegal activity\n• Conduct that harms other users or the platform\n• At our discretion for any reason\n\nYou may terminate your account at any time through your account settings."
    },
    {
      title: "10. Disclaimers",
      content: 'FoundrGeeks is provided "as is" without warranties of any kind. We do not guarantee:\n• Uninterrupted or error-free service\n• The accuracy or reliability of content\n• The quality or success of collaborations\n• That the platform will meet your specific needs'
    },
    {
      title: "11. Limitation of Liability",
      content: "To the maximum extent permitted by law, FoundrGeeks shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, including loss of profits, data, or business opportunities."
    },
    {
      title: "12. Indemnification",
      content: "You agree to indemnify and hold FoundrGeeks harmless from any claims, damages, losses, or expenses arising from:\n• Your use of the platform\n• Your violation of these terms\n• Your violation of any rights of another party\n• Content you post on the platform"
    },
    {
      title: "13. Changes to Terms",
      content: "We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or platform notification. Continued use of FoundrGeeks after changes constitutes acceptance of the modified terms."
    },
    {
      title: "14. Dispute Resolution",
      content: "Any disputes arising from these terms or use of FoundrGeeks shall be resolved through:\n• Good faith negotiation between parties\n• Mediation if negotiation fails\n• Arbitration or legal proceedings as a last resort\n• Governing law: Laws of Nigeria"
    },
    {
      title: "15. Contact Information",
      content: "For questions about these Terms of Service, please contact us at:\n\nEmail: legal@foundrgeeks.com\nWebsite: www.foundrgeeks.com\n\nLast Updated: November 16, 2025"
    }
  ];

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
              className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-teal-100">Effective Date: November 16, 2025</p>
          <p className="mt-4 text-teal-100 max-w-2xl mx-auto">
            Please read these terms carefully before using FoundrGeeks. By accessing our platform, 
            you agree to be bound by these terms and conditions.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-6 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-gray-700 mb-0">
                <strong>Welcome to FoundrGeeks!</strong> These Terms of Service govern your use of our platform. 
                By creating an account or using our services, you acknowledge that you have read, understood, 
                and agree to be bound by these terms.
              </p>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Additional Important Notice */}
            <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Important Notice</h3>
              <p className="text-gray-700 mb-0">
                These Terms of Service constitute a legally binding agreement between you and FoundrGeeks. 
                If you have any questions or concerns, please contact us before using the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link 
            href="/privacy-policy"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/contact"
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} FoundrGeeks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}