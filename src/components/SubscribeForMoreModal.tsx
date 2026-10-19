import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, ExamTrack } from '../types';
import { FREE_TIER_QUESTION_LIMIT, getFreeTierQuestionLimit } from '../utils/storage';

interface SubscribeForMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription: (trackId?: ExamTrack) => void;
  questionsUsed?: number;
  userProfile?: UserProfile;
  sourceSection?: 'practice' | 'mock-tests' | 'general';
}

export const SubscribeForMoreModal: React.FC<SubscribeForMoreModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscription,
  questionsUsed,
  userProfile,
  sourceSection = 'general',
}) => {
  const [questionLimit, setQuestionLimit] = useState<number>(() => getFreeTierQuestionLimit());

  useEffect(() => {
    const handleLimitUpdate = () => {
      setQuestionLimit(getFreeTierQuestionLimit());
    };
    window.addEventListener('studeezone_free_limit_updated', handleLimitUpdate);
    return () => window.removeEventListener('studeezone_free_limit_updated', handleLimitUpdate);
  }, []);

  const actualQuestionsUsed = questionsUsed !== undefined ? questionsUsed : questionLimit;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTrack: ExamTrack = userProfile?.selectedExamTrack || 'prt';

  const handleSubscribeClick = () => {
    onClose();
    onOpenSubscription(currentTrack);
  };

  const sectionLabel = 
    sourceSection === 'mock-tests' ? 'Mock Test Section' :
    sourceSection === 'practice' ? 'Practice Section' :
    'Mock & Practice Section';

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity"
      id="subscribe-for-more-modal-overlay"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-300/60 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        id="subscribe-for-more-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Gradient Accent */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            id="close-subscribe-for-more-btn"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Alert Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-slate-950 text-xs font-black tracking-wide shadow-sm mb-3">
            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>TRIAL PERIOD OVER &bull; FREE LIMIT REACHED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit'] text-white leading-tight">
            Subscribe for more..!!
          </h2>
          <p className="text-amber-200/90 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            You have used your <strong>{questionLimit} free questions</strong> in the {sectionLabel}. The trial period is over. Subscribe now to unlock unlimited questions and tests!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Progress / Limit Display Card */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-1.5 text-amber-900">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Usage Limit: {questionLimit} Questions Completed</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[11px]">
                {actualQuestionsUsed} / {questionLimit} (100%)
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-amber-200/70 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '100%' }}
              />
            </div>

            <p className="text-[11px] text-amber-900 leading-tight">
              Following {questionLimit} questions, full subscription is required to continue practicing and taking mock tests.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              What you unlock with PRO subscription:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">3,500+ Question Master Pool</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Unlimited practice across all exam tracks (1,223+ GT Humanities, 1,909+ GT Maths &amp; Science, 1,264+ PRT).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Full 120-Q Mock Tests</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Complete timed mock simulations with instant rank.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Official Papers 2022-26</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Authentic previous year question papers with answer keys.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">24/7 Ask Lama Tutor</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Bilingual pedagogic explanations for every single question.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee / Price Badge */}
          <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs">
                Instant UPI &amp; QR Activation &bull; Valid for Full Exam Season
              </span>
            </div>
            <span className="font-black text-indigo-700 shrink-0 ml-2">
              ₹499 / stream
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 space-y-2.5">
            <button
              onClick={handleSubscribeClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border border-amber-400"
              id="subscribe-for-more-primary-btn"
            >
              <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Subscribe for more..!!</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleSubscribeClick}
                className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                id="view-upi-qr-plans-btn"
              >
                View UPI QR Code &amp; Payment Options
              </button>

              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-medium"
                id="dismiss-subscribe-modal-btn"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
