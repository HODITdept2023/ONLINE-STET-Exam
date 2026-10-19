import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  MessageCircle,
  GraduationCap,
  Heart,
  HelpCircle,
  Clock,
  Gift,
  ExternalLink,
  Compass
} from 'lucide-react';
import { ClickVisitCounter } from './ClickVisitCounter';

import { Target } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: any) => void;
  onOpenSubscription?: () => void;
  onOpenFreeTrial?: () => void;
  onOpenTutor?: () => void;
  onOpenSubscribeForMore?: (section?: 'practice' | 'mock-tests' | 'general') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenSubscription,
  onOpenFreeTrial,
  onOpenTutor,
  onOpenSubscribeForMore,
}) => {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800 mt-12 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="studeezone-main-footer">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Tier: Brand, Live Click/Visit Counter & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Brand & Overview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-white/20">
                S
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight font-['Outfit'] text-white">
                  studeezone<span className="text-amber-400">.com</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Sikkim Teacher Eligibility Test (STET) Prep Portal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Comprehensive prep suite featuring 3,500+ syllabus-mapped questions (1,223+ GT Humanities, 1,909+ GT Maths &amp; Science, 1,264+ PRT), timed full mock tests, high-yield revision notes, and 24/7 Ask Lama mentor assistance.
            </p>

            {/* Question Limit & Stream Pass Quick Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('general') : onOpenSubscription?.()}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
                id="footer-trial-pill-btn"
                title="Trial period is over. Free usage is capped at 30 questions."
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Tier: 30 Qs Limit</span>
              </button>

              {onOpenSubscription && (
                <button
                  onClick={onOpenSubscription}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-400/40 text-xs font-bold transition-all cursor-pointer"
                  id="footer-subscribe-pill-btn"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>₹499 Per Stream Pass</span>
                </button>
              )}
            </div>
          </div>

          {/* Click / Visit Counter Highlight Box */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-['Outfit']">
                  Live Traffic &amp; Interaction Counter
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Real-time Verified</span>
            </div>

            {/* Render Counter in Card Variant */}
            <ClickVisitCounter variant="card" />

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>Automatically increments on visitor arrival and on-screen clicks</span>
              <span className="text-slate-400 font-medium">Session Safe</span>
            </div>
          </div>
        </div>

        {/* Middle Tier: Navigation Links & Support Info */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Study Streams
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectTab('practice')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Primary Teacher (Paper I)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('practice')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Maths &amp; Science (Paper II)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('practice')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Social Studies (Paper II)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('notes')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Revision Notes &amp; Formulae
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Practice &amp; Mocks
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onSelectTab('mock')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Full Timed Mock Tests
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('papers')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Official Previous Years (PYQs)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('practice')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Subject-Wise 30 MCQs
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('diagnostic')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  Diagnostic Weak Area Scan
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Help &amp; Mentorship
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onOpenTutor} className="hover:text-amber-300 transition-colors cursor-pointer flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>24/7 Ask Lama</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('general') : onOpenSubscription?.()} 
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Subscribe for More (30 Qs Limit)
                </button>
              </li>
              <li>
                {onOpenSubscription && (
                  <button onClick={onOpenSubscription} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                    Subscribe ₹499/stream
                  </button>
                )}
              </li>
              <li>
                <button onClick={() => onSelectTab('about-mission')} className="hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center space-x-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Vision, Mission &amp; About App</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('advisory')} className="hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center space-x-1">
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                  <span>Advisory Board / Academic Council</span>
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/918250739457"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1 text-emerald-400"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp Admin Support</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Official Admin &amp; Billing
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <p>
                <span className="text-slate-500">Payee / Admin:</span>{' '}
                <strong className="text-slate-200">Sabu Tamang</strong>
              </p>
              <p>
                <span className="text-slate-500">UPI ID:</span>{' '}
                <span className="font-mono text-amber-300">sabutamang1a@oksbi</span>
              </p>
              <p>
                <span className="text-slate-500">Helpline:</span>{' '}
                <span className="font-mono text-slate-200">+91 8250739457</span>
              </p>
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Direct UPI Activation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} studeezone.com. Dedicated to Sikkim STET educators.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Subscription: ₹499 per stream</span>
            <span>•</span>
            <span>Candidate Portal v2.6</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
