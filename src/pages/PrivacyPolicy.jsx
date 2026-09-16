import React from 'react'
import { Link } from 'react-router-dom'

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: September 15, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
            <p>Convertly ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our file conversion services at Convertly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you sign up, we collect your name, email address, and password (securely hashed).</p>
            <p className="mt-2"><strong>Usage Data:</strong> We track how many conversions you perform daily to enforce our plan limits.</p>
            <p className="mt-2"><strong>Payment Information:</strong> Payment processing is handled by our third-party provider (Lemon Squeezy). We do not store your credit card details.</p>
            <p className="mt-2"><strong>Files:</strong> All file conversions happen directly in your browser. We do NOT upload your files to our servers. Your files never leave your device.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and improve our services</li>
              <li>To manage your account and subscription</li>
              <li>To enforce daily usage limits based on your plan</li>
              <li>To communicate important updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
            <p>We use industry-standard encryption and security practices. Your account data is stored securely in Supabase with row-level security policies. Files are processed locally in your browser and never transmitted to our servers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Third-Party Services</h2>
            <p>We use the following services:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Supabase:</strong> For authentication and data storage</li>
              <li><strong>Lemon Squeezy:</strong> For payment processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> maazjan.dev@gmail.com</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy