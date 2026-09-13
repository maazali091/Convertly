// import React, { useEffect, useState } from "react";
// import {
//     Check,
//     Crown,
//     Zap,
//     Shield,
//     ArrowRight,
//     Loader2,
// } from "lucide-react";
// import { supabase } from "../lib/supabase";

// function PricingPlan() {
//     const [plan, setPlan] = useState("free");
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const getPlan = async () => {
//             try {
//                 const {
//                     data: { user },
//                 } = await supabase.auth.getUser();

//                 if (!user) {
//                     setPlan("free");
//                     return;
//                 }

//                 const { data, error } = await supabase
//                     .from("profiles")
//                     .select("plan")
//                     .eq("id", user.id)
//                     .single();

//                 if (error) {
//                     console.error("Plan fetch error:", error);
//                     setPlan("free");
//                     return;
//                 }

//                 setPlan(data?.plan === "pro" ? "pro" : "free");
//             } catch (error) {
//                 console.error("Pricing error:", error);
//                 setPlan("free");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         getPlan();
//     }, []);

//     const freeFeatures = [
//         "5 conversions per day",
//         "Access to PDF tools",
//         "Browser-based conversion",
//         "No file uploads to our servers",
//     ];

//     const proFeatures = [
//         "100 conversions per day",
//         "Access to all PDF tools",
//         "Browser-based conversion",
//         "No file uploads to our servers",
//         "Higher daily conversion limit",
//     ];

//     return (
//         <main className="min-h-screen bg-white px-4 py-12 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-16">
//             <div className="mx-auto max-w-5xl">

//                 {/* HEADER */}

//                 <div className="mx-auto max-w-2xl text-center">

//                     <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
//                         <Zap size={14} />
//                         Simple pricing
//                     </div>

//                     <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
//                         Choose the plan that works for you
//                     </h1>

//                     <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
//                         Start free with essential conversion tools or upgrade
//                         when you need a higher daily conversion limit.
//                     </p>

//                 </div>

//                 {/* CURRENT PLAN */}

//                 {!loading && (
//                     <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">

//                         {plan === "pro" ? (
//                             <>
//                                 <Crown
//                                     size={15}
//                                     className="text-yellow-500"
//                                 />

//                                 Current plan:
//                                 <span className="text-blue-600 dark:text-blue-400">
//                                     Pro
//                                 </span>
//                             </>
//                         ) : (
//                             <>
//                                 <Shield size={15} />

//                                 Current plan:
//                                 <span className="text-blue-600 dark:text-blue-400">
//                                     Free
//                                 </span>
//                             </>
//                         )}

//                     </div>
//                 )}

//                 {/* PRICING */}

//                 <div className="mt-10 grid gap-5 md:grid-cols-2 md:items-stretch">

//                     {/* FREE */}

//                     <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

//                         <div className="flex items-start justify-between gap-4">

//                             <div>

//                                 <h2 className="text-lg font-bold">
//                                     Free
//                                 </h2>

//                                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                                     Everything you need to get started.
//                                 </p>

//                             </div>

//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
//                                 <Zap size={20} />
//                             </div>

//                         </div>

//                         {/* PRICE */}

//                         <div className="mt-7">

//                             <div className="flex items-end gap-1">

//                                 <span className="text-4xl font-bold">
//                                     $0
//                                 </span>

//                                 <span className="mb-1 text-sm text-slate-500 dark:text-slate-400">
//                                     / forever
//                                 </span>

//                             </div>

//                         </div>

//                         {/* LIMIT */}

//                         <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">

//                             <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
//                                 Daily limit
//                             </p>

//                             <p className="mt-1 text-xl font-bold">
//                                 5 conversions
//                             </p>

//                             <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                                 Reset automatically every day.
//                             </p>

//                         </div>

//                         {/* BUTTON */}

//                         <button
//                             type="button"
//                             disabled={plan === "free"}
//                             className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${plan === "free"
//                                 ? "cursor-default border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
//                                 : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
//                                 }`}
//                         >
//                             {plan === "free"
//                                 ? "Current plan"
//                                 : "Free plan"}
//                         </button>

//                         {/* FEATURES */}

//                         <div className="mt-7">

//                             <p className="text-sm font-semibold">
//                                 What's included
//                             </p>

//                             <ul className="mt-4 space-y-3">

//                                 {freeFeatures.map((feature) => (
//                                     <li
//                                         key={feature}
//                                         className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
//                                     >
//                                         <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
//                                             <Check size={13} />
//                                         </span>

//                                         <span>{feature}</span>
//                                     </li>
//                                 ))}

//                             </ul>

//                         </div>

//                     </div>

//                     {/* PRO */}

//                     <div className="relative flex flex-col rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-7">

//                         {/* POPULAR */}

//                         <div className="absolute -top-3 left-1/2 -translate-x-1/2">

//                             <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">

//                                 <Crown size={13} />

//                                 RECOMMENDED

//                             </span>

//                         </div>

//                         <div className="flex items-start justify-between gap-4">

//                             <div>

//                                 <h2 className="flex items-center gap-2 text-lg font-bold">

//                                     Pro

//                                     {plan === "pro" && (
//                                         <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-500/10 dark:text-green-400">
//                                             ACTIVE
//                                         </span>
//                                     )}

//                                 </h2>

//                                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                                     For users who need more conversions.
//                                 </p>

//                             </div>

//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
//                                 <Crown size={20} />
//                             </div>

//                         </div>

//                         {/* PRICE */}

//                         <div className="mt-7">

//                             <div className="flex items-end gap-1">

//                                 <span className="text-4xl font-bold">
//                                     $—
//                                 </span>

//                                 <span className="mb-1 text-sm text-slate-500 dark:text-slate-400">
//                                     / month
//                                 </span>

//                             </div>

//                             <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
//                                 Payment coming soon.
//                             </p>

//                         </div>

//                         {/* LIMIT */}

//                         <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">

//                             <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
//                                 Daily limit
//                             </p>

//                             <p className="mt-1 text-xl font-bold">
//                                 100 conversions
//                             </p>

//                             <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                                 Reset automatically every day.
//                             </p>

//                         </div>

//                         {/* BUTTON */}

//                         <button
//                             type="button"
//                             disabled
//                             className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white opacity-60"
//                         >

//                             {loading ? (
//                                 <>
//                                     <Loader2
//                                         size={17}
//                                         className="animate-spin"
//                                     />

//                                     Loading...
//                                 </>
//                             ) : plan === "pro" ? (
//                                 <>
//                                     <Check size={17} />

//                                     Pro Active
//                                 </>
//                             ) : (
//                                 <>
//                                     Upgrade to Pro

//                                     <ArrowRight size={17} />
//                                 </>
//                             )}

//                         </button>

//                         {/* FEATURES */}

//                         <div className="mt-7">

//                             <p className="text-sm font-semibold">
//                                 Everything in Free, plus
//                             </p>

//                             <ul className="mt-4 space-y-3">

//                                 {proFeatures.map((feature) => (
//                                     <li
//                                         key={feature}
//                                         className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
//                                     >
//                                         <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
//                                             <Check size={13} />
//                                         </span>

//                                         <span>{feature}</span>
//                                     </li>
//                                 ))}

//                             </ul>

//                         </div>

//                     </div>

//                 </div>

//                 {/* BOTTOM INFO */}

//                 <div className="mx-auto mt-7 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center dark:border-slate-800 dark:bg-slate-900">

//                     <div className="flex items-center justify-center gap-2">

//                         <Shield
//                             size={16}
//                             className="text-green-600 dark:text-green-400"
//                         />

//                         <p className="text-xs font-semibold">
//                             Your files stay private
//                         </p>

//                     </div>

//                     <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
//                         Convertly processes supported files directly in your
//                         browser whenever possible.
//                     </p>

//                 </div>

//             </div>
//         </main>
//     );
// }

// export default PricingPlan;







import React from "react";
import { Check, Crown } from "lucide-react";

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
                        <button
                            type="button"
                            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 dark:shadow-none"
                        >
                            Start Free Trial
                        </button>

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