import React from 'react';
import { 
  Landmark, 
  Globe, 
  BrainCircuit, 
  Languages, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  FileText, 
  Award, 
  Compass, 
  BookOpen,
  Scale
} from 'lucide-react';
import { Question } from '../types';
import { HISTORICAL_EXAM_QUESTIONS, STUDY_GUIDES } from '../data/examQuestions';

interface GtHumanitiesSectionProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor: (prompt?: string, questionRef?: Question) => void;
  onSelectTrack: () => void;
  isTrackActive: boolean;
}

export const GtHumanitiesSection: React.FC<GtHumanitiesSectionProps> = ({
  onNavigate,
  onOpenTutor,
  onSelectTrack,
  isTrackActive,
}) => {
  const humanitiesQuestions = HISTORICAL_EXAM_QUESTIONS.filter(
    q => !q.examTracks || q.examTracks.includes('gt-humanities')
  );
  const socialScienceQuestions = humanitiesQuestions.filter(q => q.category === 'SocialScience');
  const englishQuestions = humanitiesQuestions.filter(q => q.category === 'English');
  const cdpQuestions = humanitiesQuestions.filter(q => q.category === 'CDP');

  const polityGuide = STUDY_GUIDES.find(g => g.id === 'guide-social-science-polity');
  const sikkimHistoryGuide = STUDY_GUIDES.find(g => g.id === 'guide-gthum-history-sikkim');

  return (
    <div 
      className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 rounded-2xl p-6 sm:p-7 border border-amber-300/70 shadow-sm space-y-6 relative overflow-hidden" 
      id="gt-humanities-dedicated-section"
    >
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold text-[11px] tracking-wide uppercase shadow-2xs">
              Dedicated Section
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 font-bold text-[11px]">
              Paper II (Graduate Teacher: Humanities)
            </span>
            {isTrackActive && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Active Track</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <span>STET GT - Humanities &amp; Social Science Examination Center</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Full coverage of the official syllabus featuring the complete <strong className="text-amber-800 font-black">1,223-Item GT Humanities Question Repository</strong>: 
            Social Science (<strong>524 items</strong>: Ancient/Medieval/Modern History, Sikkim Geography, Civics &amp; Polity, Pedagogy), 
            Language I English (<strong>340 items</strong>), and Child Development &amp; Pedagogy (<strong>359 items</strong>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('practice', { topicFilter: 'All' })}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice All 1,223 Questions</span>
          </button>

          {!isTrackActive && (
            <button
              onClick={onSelectTrack}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Set GT Humanities as Track
            </button>
          )}

          <button
            onClick={() => onNavigate('mock-tests')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch GT Humanities Mock Test</span>
          </button>
        </div>
      </div>

      {/* 3 Prescribed Subjects of GT Humanities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Subject 1: Pedagogy Social Science */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Social Science &amp; Pedagogy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sikkim history (1642 Yuksom consecration, Chogyal dynasty), Indian Constitution &amp; Writs (Art 32/226), Harappan Lothal dockyard, local time math, and Gram Sabha.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700">
              {socialScienceQuestions.length} Questions
            </span>
            <button
              onClick={() => onNavigate('practice', { topicFilter: 'SocialScience' })}
              className="text-xs font-bold text-slate-700 hover:text-amber-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject 2: English Language & Literature */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              English (Language I)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tagore &amp; Sarojini Naidu poetry, literary figures of speech (metaphor, apostrophe, oxymoron), Cummins BICS/CALP, translanguaging, and reading comprehension.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600">
              {englishQuestions.length} Questions
            </span>
            <button
              onClick={() => onNavigate('practice', { topicFilter: 'English' })}
              className="text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center space-x-1 cursor-pointer"
            >
              <span>Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject 3: Child Development & Pedagogy */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Child Development &amp; Pedagogy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adolescent cognitive shifts (Piaget Formal Operational), Kohlberg Post-Conventional morality, Vygotsky ZPD/scaffolding, NEP 2020, and inclusive classroom strategies.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-600">
              {cdpQuestions.length} Questions
            </span>
            <button
              onClick={() => onNavigate('practice', { topicFilter: 'CDP' })}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
            >
              <span>Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STET 2026 Verified 900-Item Master Question Banks Spotlight */}
      <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-300/60 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit']">
              STET 2026 Verified Master Question Banks (900 Authentic Items)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-black text-xs shadow-2xs self-start sm:self-auto">
            100% Verified Answer Keys &amp; Rationales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Social Science 400 */}
          <div className="bg-white p-4.5 rounded-xl border border-amber-300 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                  Batch 1A-1D (Q.1-400)
                </span>
                <span className="text-xs font-black text-amber-700">400 Questions</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Social Science Master Bank</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ancient/Medieval/Modern History, Physical &amp; Sikkim Geography, Indian Constitution &amp; Writs, and Social Science Pedagogy.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('mock-tests')}
                className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold text-center cursor-pointer transition-colors"
              >
                Mock Test (400 Qs)
              </button>
              <button
                onClick={() => onNavigate('practice', { topicFilter: 'SocialScience' })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Practice
              </button>
            </div>
          </div>

          {/* Card 2: English 250 */}
          <div className="bg-white p-4.5 rounded-xl border border-emerald-300 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">
                  Batch 1A-1B (Q.1-250)
                </span>
                <span className="text-xs font-black text-emerald-700">250 Questions</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Language I English Master Bank</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Reading comprehension, literary figures of speech, concord, Cummins BICS/CALP, translanguaging, and language pedagogy.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('mock-tests')}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold text-center cursor-pointer transition-colors"
              >
                Mock Test (250 Qs)
              </button>
              <button
                onClick={() => onNavigate('practice', { topicFilter: 'English' })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Practice
              </button>
            </div>
          </div>

          {/* Card 3: CDP 250 */}
          <div className="bg-white p-4.5 rounded-xl border border-indigo-300 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-extrabold">
                  Batch 1A + 1D (Q.1-250)
                </span>
                <span className="text-xs font-black text-indigo-700">250 Questions</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">CDP Master Question Bank</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Growth &amp; development, Piaget/Vygotsky/Kohlberg, multiple intelligences, RPwD Act 2016 (21 disabilities), and inclusive classrooms.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('mock-tests')}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold text-center cursor-pointer transition-colors"
              >
                Mock Test (250 Qs)
              </button>
              <button
                onClick={() => onNavigate('practice', { topicFilter: 'CDP' })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Question Papers Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* 2026 Official Paper Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-xs space-y-3.5 hover:border-amber-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                Official Paper 2026
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Full 60 Questions Mapped
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              STET GT Humanities 2026 Official Paper
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Features cutting-edge questions on NEP 2020 multidisciplinary learning, Universal Design for Learning (UDL), special education pedagogy, and Indian constitutional rights.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Social Science (Q31-60)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                English (Q1-15)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                CDP (Q16-30)
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('mock-tests')}
            className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Start 2026 Humanities Mock Paper</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2025 GTA Official Paper Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-orange-200 shadow-xs space-y-3.5 hover:border-orange-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[11px] font-extrabold">
                Official Paper 2025 GTA
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Full 60 Questions Mapped
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              STET GT Humanities 2025 Official Paper
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete official test including Yuksom 1642 consecration, Namgyal rulers, Harappan Lothal dockyard, local solar time calculations (15° = 1 hr), and Article 32 Writs.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Sikkim History &amp; Polity (Q31-60)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                English (Q1-15)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                CDP (Q16-30)
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('mock-tests')}
            className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Start 2025 Humanities Mock Paper</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recommended Humanities Revision Guides */}
      <div className="bg-white/80 rounded-xl p-4 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Recommended Humanities Study Sheets</span>
          </div>
          <p className="text-xs text-slate-600">
            Quick revision sheets covering Indian Polity &amp; Writs, and Sikkim History &amp; Freedom Struggle.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigate('study-guides')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Read Study Sheets Online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
