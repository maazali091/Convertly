import React from 'react'
import { Link } from 'react-router-dom'

function TermsOfService() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: September 15, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Convertly, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
            <p>Convertly provides online file conversion tools including PDF, Word, Excel, JPG, and other format conversions. All file processing happens locally in your browser.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Free and Pro Plans</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Free Plan:</strong> 5 conversions per day, 50MB per file</li>
              <li><strong>Pro Plan:</strong> Higher conversion limits, 500MB per file, batch processing, priority support</li>
            </ul>
            <p className="mt-2">Daily limits reset at midnight UTC.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Payment Terms</h2>
            <p>Pro plan subscriptions are billed monthly through Lemon Squeezy. By subscribing, you authorize recurring charges until you cancel.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use our service for illegal purposes</li>
              <li>Upload malicious files or malware</li>
              <li>Attempt to bypass our usage limits</li>
              <li>Reverse engineer or copy our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Limitation of Liability</h2>
            <p>Convertly is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Contact</h2>
            <p>For questions about these Terms, contact: <strong>maazjan.dev@gmail.com</strong></p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}

export default TermsOfService