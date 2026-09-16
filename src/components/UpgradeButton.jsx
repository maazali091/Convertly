import React, { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

function UpgradeButton({ className = '' }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Please log in first.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('lemon-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error || !data?.checkout_url) {
        console.error('Checkout error:', error);
        alert('Unable to start checkout. Please try again later.');
        setLoading(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <Crown size={18} />
          Upgrade to Pro — $9.99
        </>
      )}
    </button>
  );
}

export default UpgradeButton;