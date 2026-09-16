import React from "react";
import { Check, Crown } from "lucide-react";
import UpgradeButton from "../components/UpgradeButton";

function PricingPlan() {
    return (
        <section className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto max-w-6xl">

                {/* Heading */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Simple, Transparent Pricing
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                        Choose the plan that fits your needs. Start free and upgrade
                        whenever you need more.
                    </p>
                </div>

                {/* Pricing */}
                <div className="grid gap-7 lg:grid-cols-2">

                    {/* ================= FREE ================= */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                        <h3 className="text-4xl font-bold">
                            Free
                        </h3>

                        <p className="mt-2 text-base text-slate-400">
                            Perfect for casual users
                        </p>

                        {/* Price */}
                        <div className="mt-8 flex items-end">
                            <span className="text-6xl font-bold tracking-tight">
                                $0
                            </span>

                            <span className="mb-2 ml-1 text-lg text-slate-500 dark:text-slate-400">
                                /month
                            </span>
                        </div>

                        {/* Button */}
                        <button
                            type="button"
                            className="mt-8 w-full rounded-xl bg-slate-100 px-5 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        >
                            Get Started
                        </button>

                        {/* Features */}
                        <div className="mt-9 space-y-5">

                            <Feature
                                text="50MB per file"
                                color="green"
                            />

                            <Feature
                                text="5 conversions/day"
                                color="green"
                            />

                            <Feature
                                text="Basic Support"
                                color="green"
                            />

                        </div>
                    </div>


                    {/* ================= PRO ================= */}
                    <div className="relative rounded-2xl border-2 border-blue-500 bg-linear-to-br from-blue-50 via-white to-purple-50 p-8 shadow-xl shadow-blue-100 dark:from-blue-500/10 dark:via-slate-900 dark:to-purple-500/10 dark:shadow-none">

                        {/* Most Popular */}
                        <div className="absolute right-7 top-7">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                                <Crown size={14} />
                                Most Popular
                            </span>
                        </div>

                        <h3 className="text-4xl font-bold">
                            Pro
                        </h3>

                        <p className="mt-2 text-base text-slate-400">
                            For professionals
                        </p>

                        {/* Price */}
                        <div className="mt-8 flex items-end">
                            <span className="text-6xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                                $9.99
                            </span>

                            <span className="mb-2 ml-1 text-lg text-slate-500 dark:text-slate-400">
                                /month
                            </span>
                        </div>

                        {/* Button */}
                        {/* <button
                            type="button"
                            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 dark:shadow-none"
                        >
                            <
                        </button> */}
                        <UpgradeButton className="mt-8 w-full" />
                        {/* Features */}
                        <div className="mt-9 space-y-5">

                            <Feature
                                text="500MB per file"
                                color="blue"
                            />

                            <Feature
                                text="Unlimited conversions"
                                color="blue"
                            />

                            <Feature
                                text="Priority support"
                                color="blue"
                            />

                            <Feature
                                text="Batch processing"
                                color="blue"
                            />

                            <Feature
                                text="API access"
                                color="blue"
                            />

                            <Feature
                                text="Advanced analytics"
                                color="blue"
                            />

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}


/* ================= FEATURE ================= */

function Feature({ text, color }) {
    const isBlue = color === "blue";

    return (
        <div className="flex items-center gap-3">

            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isBlue
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-green-500 text-green-600 dark:text-green-400"
                    }`}
            >
                <Check size={14} strokeWidth={3} />
            </div>

            <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                {text}
            </span>

        </div>
    );
}

export default PricingPlan;