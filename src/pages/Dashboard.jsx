import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import UpgradeButton from '../components/UpgradeButton';
import { Crown, Sparkles } from 'lucide-react';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usageCount, setUsageCount] = useState(0);
    const [usageLimit, setUsageLimit] = useState(5);

    const remaining = Math.max(usageLimit - usageCount, 0);
    const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

    useEffect(() => {
        const loadUser = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Session error: ", sessionError);
                setLoading(false);
                return;
            }

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // -----------------------------------------
                // 1. PROFILE
                // -----------------------------------------
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", currentUser.id)
                    .single();

                if (profileError) {
                    console.error("Profile error: ", profileError);
                } else {
                    setProfile(profileData);
                }

                // -----------------------------------------
                // 2. SUBSCRIPTION (NEW)
                // -----------------------------------------
                const { data: subData, error: subError } = await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", currentUser.id)
                    .maybeSingle();

                if (subError) {
                    console.error("Subscription error: ", subError);
                } else {
                    setSubscription(subData);
                }

                // -----------------------------------------
                // 3. USAGE
                // -----------------------------------------
                const today = new Date().toISOString().split('T')[0];
                const { data: usageData, error: usageError } = await supabase
                    .from("usage")
                    .select("conversions_count")
                    .eq("user_id", currentUser.id)
                    .eq("usage_date", today)
                    .maybeSingle();

                if (usageError) {
                    console.error("Usage Error: ", usageError);
                } else {
                    setUsageCount(usageData?.conversions_count ?? 0);
                }

                // -----------------------------------------
                // 4. USAGE LIMIT (from plan)
                // -----------------------------------------
                if (subData?.plan === 'pro' && subData?.status === 'active') {
                    setUsageLimit(100);
                } else {
                    setUsageLimit(5);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-5 py-12 md:px-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white'>
                        Welcome back, {" "}
                        {profile?.full_name || user?.user_metadata?.full_name || user?.email}
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Manage your Convertly account usage.
                    </p>
                </div>

                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : user ? (
                    <>
                        {/* ======================================
                            TOP CARDS
                        ====================================== */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* CURRENT PLAN */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Current Plan
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <h2 className='text-2xl font-bold capitalize text-slate-900 dark:text-white'>
                                        {subscription?.plan || "free"}
                                    </h2>
                                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                        isPro
                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    }`}>
                                        {isPro ? "Pro" : "Free"}
                                    </span>
                                </div>
                            </div>

                            {/* TODAY'S USAGE */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Today's Usage
                                </p>
                                <div className="mt-3 flex items-end justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {usageCount}
                                        <span className='text-base font-medium text-slate-400'>
                                            {" "} / {usageLimit}
                                        </span>
                                    </h2>
                                    <span className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                                        {remaining} left
                                    </span>
                                </div>
                                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-amber-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* SUBSCRIPTION STATUS */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Subscription
                                </p>
                                <h2 className='mt-3 text-2xl font-bold capitalize text-slate-900 dark:text-white'>
                                    {subscription?.status || "inactive"}
                                </h2>
                                <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
                                    {isPro
                                        ? `Renews on ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}`
                                        : 'No active paid subscription'}
                                </p>
                            </div>
                        </div>

                        {/* ======================================
                            ACCOUNT + UPGRADE
                        ====================================== */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

                            {/* ACCOUNT INFO */}
                            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                                    Account
                                </h2>
                                <div className="mt-6 space-y-5">
                                    <div>
                                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                                            Full name
                                        </p>
                                        <p className='mt-1 font-medium text-slate-900 dark:text-white'>
                                            {profile?.full_name || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                                            Email
                                        </p>
                                        <p className='mt-1 font-medium text-slate-900 dark:text-white'>
                                            {profile?.email || user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* UPGRADE / PRO CARD */}
                            {isPro ? (
                                <div className="rounded-2xl bg-amber-500 p-6 text-white">
                                    <Crown size={32} />
                                    <h2 className='mt-3 text-2xl font-bold'>
                                        You're Pro! 🎉
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-amber-50">
                                        Enjoy unlimited conversions, 500MB file size, batch processing, and priority support.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-indigo-600 p-6 text-white">
                                    <Sparkles size={32} />
                                    <h2 className='mt-3 text-2xl font-bold'>
                                        Upgrade to Pro
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-indigo-100">
                                        Get higher conversion limits and access to premium Convertly features.
                                    </p>
                                    <UpgradeButton className='mt-6 !bg-white !text-indigo-600 hover:!bg-indigo-50' />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500">
                        No user logged in
                    </p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;