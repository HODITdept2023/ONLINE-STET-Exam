import React, { useEffect, useState } from 'react';
import { Coins, Sparkles, Zap, ArrowUpRight, ShieldCheck, Flame, RotateCcw } from 'lucide-react';
import { subscribeToCredits, CreditStats, getCreditStats, resetCreditStats } from '../utils/creditTracker';

interface CreditCounterWidgetProps {
  variant?: 'banner' | 'card' | 'badge' | 'metric';
  className?: string;
  showAdminReset?: boolean;
}

export const CreditCounterWidget: React.FC<CreditCounterWidgetProps> = ({
  variant = 'card',
  className = '',
  showAdminReset = false,
}) => {
  const [stats, setStats] = useState<CreditStats>(() => getCreditStats());
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    let prevCredits = stats.totalCreditsSpent;
    const unsubscribe = subscribeToCredits((newStats) => {
      if (newStats.totalCreditsSpent !== prevCredits) {
        setIsPulsing(true);
        prevCredits = newStats.totalCreditsSpent;
        setTimeout(() => setIsPulsing(false), 500);
      }
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  const formatCredits = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40 shadow-xs backdrop-blur-xs select-none ${className}`}
        title="Total Gemini AI & Platform Credits Spent So Far"
        id="credits-spent-badge"
      >
        <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="font-mono text-amber-200">{formatCredits(stats.totalCreditsSpent)}</span>
        <span className="text-[10px] text-amber-300/80 font-semibold uppercase">Credits Spent</span>
      </div>
    );
  }

  if (variant === 'metric') {
    return (
      <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden ${className}`} id="admin-metric-credits-spent">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Total Credits Spent</span>
          </span>
          <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            <Flame className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Live Usage</span>
          </span>
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-baseline space-x-1.5 transition-all duration-300 ${isPulsing ? 'scale-105 text-amber-600' : ''}`}>
          <span>{formatCredits(stats.totalCreditsSpent)}</span>
          <span className="text-xs font-semibold text-slate-500">credits</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{stats.totalAiCalls} AI Tutor calls</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
            Gemini 2.5 Flash
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
        id="credits-spent-hero-banner"
      >
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0 border border-amber-200">
            <Coins className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-md">
                Live Admin Meter
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>AI Mentorship &amp; Explanations</span>
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-300 tracking-tight">
                {formatCredits(stats.totalCreditsSpent)}
              </span>
              <span className="text-sm font-bold text-amber-200/80">Total Credits Spent</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center relative z-10">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200 font-mono">
              {stats.totalAiCalls.toLocaleString()} Interactions
            </div>
            <div className="text-[10px] text-slate-400">
              Avg ~{(stats.totalCreditsSpent / Math.max(1, stats.totalAiCalls)).toFixed(2)} cr / query
            </div>
          </div>
          {showAdminReset && (
            <button
              onClick={() => {
                if (window.confirm('Reset the credits spent counter to baseline (428.50)?')) {
                  resetCreditStats();
                }
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Reset credits counter to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div
      className={`bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden ${className}`}
      id="credits-spent-card"
    >
      <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg border border-amber-300 shrink-0">
            <Coins className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full">
                Admin Hub Meter
              </span>
              <span className="text-[11px] text-slate-400">Total Credits Spent So Far</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white mt-0.5">
              Live Credits &amp; Token Consumption
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Dynamic AI Billing Meter</span>
          </span>
          {showAdminReset && (
            <button
              onClick={() => {
                if (window.confirm('Reset credits counter to baseline?')) {
                  resetCreditStats();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Reset credits counter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Credits Spent</span>
          </span>
          <div className="text-3xl font-black font-['Outfit'] text-amber-300 tracking-tight">
            {formatCredits(stats.totalCreditsSpent)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated across all student tutor chats &amp; question breakdowns
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Generations Logged</span>
          </span>
          <div className="text-3xl font-black font-['Outfit'] text-indigo-300 tracking-tight">
            {stats.totalAiCalls.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            24/7 Prof. Lama queries + exam distractor analyses
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Model Pricing Tier</span>
          </span>
          <div className="text-xl font-black font-['Outfit'] text-emerald-300 tracking-tight pt-1">
            Gemini 2.5 Flash
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            Low Latency • Server-Side Proxy Safe
          </p>
        </div>
      </div>
    </div>
  );
};
