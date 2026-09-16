import React from 'react'
import { Link } from 'react-router-dom'

function RefundPolicy() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Refund Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: September 15, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Overview</h2>
            <p>We want you to be satisfied with Convertly Pro. If you are not happy with your purchase, we offer a fair refund policy as described below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. 14-Day Money-Back Guarantee</h2>
            <p>If you are not satisfied with Convertly Pro, you can request a full refund within <strong>14 days</strong> of your initial purchase. No questions asked.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Subscription Renewals</h2>
            <p>Refunds are NOT provided for subscription renewals. Please cancel your subscription before the renewal date if you no longer wish to use Pro.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. How to Request a Refund</h2>
            <p>To request a refund, email us at:</p>
            <p className="mt-2"><strong>Email:</strong> maazjan.dev@gmail.com</p>
            <p className="mt-2">Include your account email and order number. We will process your refund within <strong>5-7 business days</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Abusive Refunds</h2>
            <p>We reserve the right to deny refunds to users who repeatedly subscribe and request refunds in a pattern that suggests abuse.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Cancellation</h2>
            <p>You can cancel your subscription anytime from your account dashboard. After cancellation, you will retain Pro access until the end of your current billing period.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}

export default RefundPolicy