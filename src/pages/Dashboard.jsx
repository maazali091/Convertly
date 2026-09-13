import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { supabase } from '../lib/supabase';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usageCount, setUsageCount] = useState(0);
    const [usageLoading, setUsageLoading] = useState(true);
    const [usageLimit, setUsageLimit] = useState(5);

    const remaining = Math.max(
        usageLimit - usageCount,
        0
    );

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Session error: ", sessionError);
                setLoading(false);
                setUsageLoading(false);
                return;
            }

            const currentUser = session?.user ?? null;

            setUser(currentUser);

            if (currentUser) {
                const {
                    data: profileData,
                    error: profileError,
                } = await supabase
                    .from("profiles")
                    .select("full_name, email, plan, subscription_status")
                    .eq("id", currentUser.id)
                    .single();
                if (profileError) {
                    console.error("Profile error: ", profileError);
                } else {
                    setProfile(profileData);
                }


                const today = new Date().toISOString().split('T')[0];

                const {
                    data: usageData,
                    error: usageError,
                } = await supabase
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
            }
            setLoading(false);
            setUsageLoading(false);
        };
        loadUser();
    }, []);
    const testCheckUsage = async () => {
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
            console.error("Session error: ", sessionError);
            return;
        }
        if (!session?.access_token) {
            console.error("No access token, User is not logged in.")
            return;
        }
        const { data, error } = await supabase.functions.invoke(
            "rapid-handler",
            {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                }
            }
        );

        console.log("check-usage response: ", data);
        console.log("check usage error: ", error);

        if (!error && data?.success) {
            setUsageCount(data.usage.count);
            setUsageLimit(data.usage.limit);
        }
    };
    return (
        <div className="mn-h-screen bg-gray-50 dark:bg-slate-950 px-5 py-12 md:px-10">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Current Plan
                                </p>
                                <div className="mt-3 flex tems-center justify-between">
                                    <h2 className='text-2xl font-bold capitalize text-slate-900 dark:text-hite'>
                                        {profile?.plan || "free"}
                                    </h2>
                                    <span className='rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-sm font-seibold text-indigo-600 dark:text-indigo-400'>
                                        Free
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-20 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
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
                                    <div className='h-full rounded-full bg-ndigo-600 transition-all duration-500'
                                        style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%`, }} />
                                </div>
                            </div>




                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                                <p className="text-sm font-medum text-slate-500 dark:text-slate-400">
                                    Subscription
                                </p>
                                <h2 className='mt-3 text-2xl font-bold capitalize text-slate-900 dark:text-white'>
                                    {profile?.subscription_status || "inactive"}
                                </h2>
                                <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
                                    No active paid subscription
                                </p>
                            </div>
                        </div>




                        <div className="grid grid-cols-1 lg:grd-cols-3 gap-5 mt-5">
                            {/* account */}
                            <div className="lg:col-span-2 rounded-2xl border border-slate-200  dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
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



                            <div className="rounded-2xl bg-indigo-600 p-6 text-white">
                                <p className='text-sm font-medium text-indigo-100'>
                                    Need more conversions?
                                </p>
                                <h2 className='mt-3 text-2xl font-bold'>
                                    Upgrade to Pro
                                </h2>
                                <p className="mt-3 text-sm  leading-6 text-indigo-100">
                                    Get higher converion limits and access to premium Convertly features.
                                </p>
                                <button className='mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50'>
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500">
                        No user logged in
                    </p>
                )}
            </div>
        </div>
    )
}

export default Dashboard
