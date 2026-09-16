import React from 'react';
import { AlertTriangle, Crown } from 'lucide-react';
import UpgradeButton from './UpgradeButton';

function LimitReached({ message }) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
      {/* ERROR MESSAGE */}
      <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <span>
          {message || "You have reached your daily conversion limit."}
        </span>
      </div>

      {/* UPGRADE BUTTON */}
      <div className="mt-4 border-t border-red-200 dark:border-red-900/50 pt-4">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          <strong className="text-slate-800 dark:text-slate-200">Want unlimited conversions?</strong> Upgrade to Pro and continue without limits.
        </p>
        <UpgradeButton className="w-full" />
      </div>
    </div>
  );
}

export default LimitReached;