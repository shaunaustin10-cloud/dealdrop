import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-slate-400 mb-4">
          Your privacy is important to us. This Privacy Policy explains how NextHome Mission to Serve collects,
          uses, and protects your personal information when you use our website and services.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">1. Information We Collect</h2>
        <p className="text-slate-400 mb-4">
          We collect various types of information in connection with the services, including:
          <ul className="list-disc list-inside ml-4 mt-2">
            <li><span className="font-medium text-white">Personal Information:</span> Name, email address, and other contact details when you register for an account.</li>
            <li><span className="font-medium text-white">Deal Data:</span> Information related to real estate deals you post or interact with, such as addresses, prices, rehab costs, images, and notes.</li>
            <li><span className="font-medium text-white">Usage Data:</span> Information about how you access and use the service, such as your IP address, browser type, pages visited, and time spent on the site.</li>
          </ul>
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">2. How We Use Your Information</h2>
        <p className="text-slate-400 mb-4">
          We use the information we collect for various purposes, including:
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>To provide, maintain, and improve our services.</li>
            <li>To manage your account and provide customer support.</li>
            <li>To personalize your experience and deliver relevant content.</li>
            <li>To analyze usage patterns and optimize our website.</li>
            <li>To communicate with you about updates, promotions, and important notices.</li>
            <li>To detect, prevent, and address technical issues or security breaches.</li>
          </ul>
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">3. Sharing Your Information</h2>
        <p className="text-slate-400 mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
          except as described in this Privacy Policy:
          <ul className="list-disc list-inside ml-4 mt-2">
            <li><span className="font-medium text-white">Service Providers:</span> We may share your information with trusted third-party service providers who assist us in operating our website and providing our services (e.g., Firebase for backend services, RentCast for property data).</li>
            <li><span className="font-medium text-white">Legal Requirements:</span> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          </ul>
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">4. Data Security</h2>
        <p className="text-slate-400 mb-4">
          We implement reasonable security measures to protect your personal information from unauthorized access,
          disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">5. Your Choices</h2>
        <p className="text-slate-400 mb-4">
          You can review and update your account information at any time. You may also have the right to request access to,
          correction of, or deletion of your personal data, subject to applicable law.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">6. Changes to This Policy</h2>
        <p className="text-slate-400 mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3 mt-8">7. Contact Us</h2>
        <p className="text-slate-400 mb-4">
          If you have any questions about this Privacy Policy, please contact us at support@reidealdrop.com.
        </p>

        <p className="text-slate-500 text-sm mt-12">
          Last updated: November 28, 2025
        </p>
      </div>
    </div>
  );
}
