import React from 'react';
import { 
  Calculator, 
  Atom, 
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
  HelpCircle
} from 'lucide-react';
import { Question } from '../types';
import { HISTORICAL_EXAM_QUESTIONS } from '../data/examQuestions';
import { GT_MATHS_SCIENCE_2022_QUESTIONS } from '../data/gtMathsScience2022';
import { GT_MATHS_SCIENCE_2025_QUESTIONS } from '../data/gtMathsScience2025';

interface GtMathsScienceSectionProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor: (prompt?: string, questionRef?: Question) => void;
  onSelectTrack: () => void;
  isTrackActive: boolean;
}

export const GtMathsScienceSection: React.FC<GtMathsScienceSectionProps> = ({
  onNavigate,
  onOpenTutor,
  onSelectTrack,
  isTrackActive,
}) => {
  const mathsQuestions = HISTORICAL_EXAM_QUESTIONS.filter(
    q => !q.examTracks || q.examTracks.includes('gt-maths-science')
  );
  const stemQuestions = mathsQuestions.filter(q => q.category === 'MathsScience' || q.category === 'Maths');
  const englishQuestions = mathsQuestions.filter(q => q.category === 'English');
  const cdpQuestions = mathsQuestions.filter(q => q.category === 'CDP');
  return (
    <div 
      className="bg-gradient-to-br from-blue-500/10 via-white to-indigo-500/10 rounded-2xl p-6 sm:p-7 border border-blue-300/70 shadow-sm space-y-6 relative overflow-hidden" 
      id="gt-maths-science-dedicated-section"
    >
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-blue-200/60 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[11px] tracking-wide uppercase shadow-2xs">
              Updated Section
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
              Paper II (Graduate Teacher: Maths &amp; Science)
            </span>
            {isTrackActive && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Active Track</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <span>STET GT - Maths &amp; Science Examination Center</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Updated with official question sets from both <strong className="text-slate-900">STET GT 2025</strong> and <strong className="text-slate-900">STET GT 2022</strong> papers, mapped to the official syllabus across Mathematics, Science, English, and Child Development &amp; Pedagogy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isTrackActive && (
            <button
              onClick={onSelectTrack}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Set GT Maths/Sci as Track
            </button>
          )}

          <button
            onClick={() => onNavigate('mock-tests')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch GT STEM Mock Test</span>
          </button>
        </div>
      </div>

      {/* 3 Prescribed Subjects of GT Maths / Science */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Subject 1: Pedagogy Maths & Science */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Pedagogy Maths &amp; Science
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geometric proofs, Van Hiele abstraction, Kinematics slopes, Work-Energy 125 kJ, Ohm's law inquiry, Universal indicator, Planaria stem cells &amp; cheek cell mounting.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-600">
              {stemQuestions.length} Questions
            </span>
            <button
              onClick={() => onNavigate('practice', { topicFilter: 'MathsScience' })}
              className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
            >
              <span>Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject 2: English Language & Pedagogy */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              English (Language I)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shared 250-item question bank: Reading comprehension, literary devices, grammar concord, NEP language policies, Cummins BICS/CALP, SLA theories &amp; pedagogical methods.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600">
              {englishQuestions.length} Questions (Shared Bank)
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
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Child Development Pedagogy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shared 250-item question bank: Growth &amp; development principles, socialisation, Piaget/Vygotsky/Kohlberg, multiple intelligences, inclusive education (RPwD 2016), and learning psychology.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-600">
              {cdpQuestions.length} Questions (Shared Bank)
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

      {/* Shared STET 2026 Common Core Question Banks Spotlight (CDP 250 + English 250) */}
      <div className="bg-indigo-500/10 border-2 border-indigo-400/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-300/60 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit']">
                Shared STET 2026 Common Core Question Banks (500 Questions)
              </h3>
              <p className="text-xs text-slate-600">
                Official syllabus mapping: The 250 CDP and 250 English question banks are fully shared and tested in GT-Maths &amp; Science.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-xs shadow-2xs self-start sm:self-auto shrink-0">
            GT-Maths &amp; Science Core
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: CDP 250 Shared Bank */}
          <div className="bg-white p-4.5 rounded-xl border border-indigo-300 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-extrabold">
                  Batch 1A + 1D (Q.1-250)
                </span>
                <span className="text-xs font-black text-indigo-700">250 Questions</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                Child Development &amp; Secondary Pedagogy Bank
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Developmental milestones, Piaget Formal Operations, Vygotsky ZPD/scaffolding, Gardner Multiple Intelligences, RTE 2009, RPwD 2016 (21 disabilities), and inclusive STEM classrooms.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('mock-tests')}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold text-center cursor-pointer transition-colors shadow-xs"
              >
                Mock Test (250 Qs)
              </button>
              <button
                onClick={() => onNavigate('practice', { topicFilter: 'CDP' })}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Practice
              </button>
            </div>
          </div>

          {/* Card 2: English 250 Shared Bank */}
          <div className="bg-white p-4.5 rounded-xl border border-emerald-300 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-500 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">
                  Batch 1A-1B (Q.1-250)
                </span>
                <span className="text-xs font-black text-emerald-700">250 Questions</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                Language I English Master Question Bank
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Reading comprehension, syntax transformation, concord, discourse markers, Cummins BICS/CALP, translanguaging, and communicative language teaching in science &amp; math schools.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('mock-tests')}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold text-center cursor-pointer transition-colors shadow-xs"
              >
                Mock Test (250 Qs)
              </button>
              <button
                onClick={() => onNavigate('practice', { topicFilter: 'English' })}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official 2025 & 2022 Question Papers Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* 2025 Official Paper Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-xs space-y-3.5 hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold">
                Official Paper 2025
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {GT_MATHS_SCIENCE_2025_QUESTIONS.length} Questions Complete
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              STET GT Maths &amp; Science 2025 Official Paper
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full official paper from 2025: Radish haat arithmetic, ruler &amp; compass angle constructibility, cone/cylinder CSA, Work-Energy 125 kJ, distance-time graph, Planaria stem cells, universal indicator pH, and Bloom taxonomy in laboratory science.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Mathematics (Q31-60)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Science (Q61-90)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                English (Q1-30)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                CDP (Q91-120)
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-200" />
              <span>Launch 2025 Mock</span>
            </button>
            <button
              onClick={() => onOpenTutor('Explain the trickiest questions from the STET GT Maths & Science 2025 official question paper.')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI 2025 Breakdown</span>
            </button>
          </div>
        </div>

        {/* 2022 Official Paper Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-indigo-200 shadow-xs space-y-3.5 hover:border-indigo-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-extrabold">
                Official Paper 2022
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {GT_MATHS_SCIENCE_2022_QUESTIONS.length} Questions Complete
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              STET GT Maths &amp; Science 2022 Official Paper
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full official paper from 2022: Arithmetic Progression common differences, Geometric Progression nth terms, Cartesian coordinate slopes &amp; line perpendicularity, quadratic discriminant D &ge; 0, probability of events, and mensuration.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Arithmetic &amp; GP
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Coordinate Geometry
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Quadratic Discriminant
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                Probability Axioms
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-200" />
              <span>Launch 2022 Mock</span>
            </button>
            <button
              onClick={() => onOpenTutor('Explain the key mathematical formulas and problem solving steps in the STET GT 2022 Maths paper.')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI 2022 Breakdown</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
