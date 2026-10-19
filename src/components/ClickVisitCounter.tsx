import React, { useEffect, useState } from 'react';
import { Eye, MousePointerClick, Activity } from 'lucide-react';
import { subscribeToCounters, CounterStats, getCounterStats } from '../utils/counterTracker';

interface ClickVisitCounterProps {
  variant?: 'compact' | 'badge' | 'card';
  className?: string;
}

export const ClickVisitCounter: React.FC<ClickVisitCounterProps> = ({
  variant = 'badge',
  className = '',
}) => {
  const [stats, setStats] = useState<CounterStats>(() => getCounterStats());
  const [isClickPulsing, setIsClickPulsing] = useState(false);

  useEffect(() => {
    let prevClicks = stats.clicks;
    const unsubscribe = subscribeToCounters((newStats) => {
      if (newStats.clicks !== prevClicks) {
        setIsClickPulsing(true);
        prevClicks = newStats.clicks;
        setTimeout(() => setIsClickPulsing(false), 400);
      }
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  // Format large numbers with commas (e.g. 1,248)
  const formatNum = (num: number) => num.toLocaleString();

  if (variant === 'compact' || variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center space-x-2 text-[11px] font-semibold bg-slate-800/80 border border-slate-700/80 px-2.5 py-0.5 rounded-full text-slate-300 shadow-2xs backdrop-blur-xs select-none ${className}`}
        title="Live site traffic & user interaction counter"
        id="header-click-visit-counter"
      >
        <div className="flex items-center space-x-1" title="Total Site Visits">
          <Eye className="w-3 h-3 text-cyan-400" />
          <span className="font-mono text-cyan-200 font-bold">{formatNum(stats.visits)}</span>
          <span className="text-slate-400 text-[10px]">visits</span>
        </div>

        <span className="text-slate-600">|</span>

        <div
          className={`flex items-center space-x-1 transition-transform duration-200 ${
            isClickPulsing ? 'scale-110 text-amber-300' : ''
          }`}
          title="Total User Clicks & Interactions"
        >
          <MousePointerClick className="w-3 h-3 text-amber-400" />
          <span className="font-mono text-amber-300 font-bold">{formatNum(stats.clicks)}</span>
          <span className="text-slate-400 text-[10px]">clicks</span>
        </div>
      </div>
    );
  }

  // Card Variant (for Footer or Admin Panel)
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`} id="detailed-click-visit-counter-grid">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Site Visits</span>
          </span>
          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live</span>
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-cyan-300 tracking-tight">
          {formatNum(stats.visits)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Total candidate sessions &amp; page visits
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>User Clicks</span>
          </span>
          <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded-md">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Active</span>
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-300 tracking-tight flex items-center space-x-1.5">
          <span>{formatNum(stats.clicks)}</span>
          {isClickPulsing && (
            <span className="text-[11px] font-sans font-bold text-amber-400 animate-bounce">+1</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Total questions, tabs &amp; tests clicked
        </p>
      </div>
    </div>
  );
};
