import React from 'react';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  FileDown, 
  Award, 
  Compass, 
  Calculator, 
  Leaf, 
  BrainCircuit, 
  Languages 
} from 'lucide-react';
import { Question } from '../types';
import { PRT_2024_QUESTIONS } from '../data/prtQuestions2024';
import { PRT_2025_QUESTIONS } from '../data/prtQuestions2025';
import { downloadStudyGuidePDF } from '../utils/pdfGenerator';
import { STUDY_GUIDES } from '../data/examQuestions';

interface PrtExamSectionProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor: (prompt?: string, questionRef?: Question) => void;
  onSelectPrtTrack: () => void;
  isPrtActive: boolean;
}

export const PrtExamSection: React.FC<PrtExamSectionProps> = ({
  onNavigate,
  onOpenTutor,
  onSelectPrtTrack,
  isPrtActive,
}) => {
  const prtEvsGuide = STUDY_GUIDES.find(g => g.id === 'guide-evs-sikkim');
  const prtMathGuide = STUDY_GUIDES.find(g => g.id === 'guide-maths-primary');

  return (
    <div 
      className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 rounded-2xl p-6 sm:p-7 border border-amber-300/70 shadow-sm space-y-6 relative overflow-hidden" 
      id="prt-stet-dedicated-section"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[11px] tracking-wide uppercase shadow-2xs">
              Dedicated Section
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Paper I (Primary: Classes I - V)
            </span>
            {isPrtActive && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                <span>Active Track</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <span>STET Primary Teacher (PRT) Exam Center</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Full coverage of the official syllabus with verified question sets from 
            <strong className="text-slate-900"> STET PRT 2024 (2024 STET.pdf)</strong> and 
            <strong className="text-slate-900"> STET PRT 2025</strong> papers across all 4 mandatory subjects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isPrtActive && (
            <button
              onClick={onSelectPrtTrack}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Set PRT as Primary Track
            </button>
          )}

          <button
            onClick={() => onNavigate('mock-tests')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Take PRT Mock Test</span>
          </button>
        </div>
      </div>

      {/* 4 Core Subjects of STET PRT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subject 1: CDP */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Child Development &amp; Pedagogy
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Developmental milestones, Cephalocaudal trend, Chomsky LAD, Kohlberg morality, RPwD Act 2016, and POCSO Act 2012.
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice', { topicFilter: 'CDP' })}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>Practice CDP (PRT)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Subject 2: English (Language-1) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              English (Language-1)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Poetic analysis ("Whispers of the Wind"), rhyme scheme (AABB), onomatopoeia, inductive grammar, and Sikkim multilingualism.
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice', { topicFilter: 'English' })}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>Practice English (PRT)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Subject 3: Mathematics */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Mathematics
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Euler's polyhedron formula (F+V=E+2), perimeter invariance, fractions, prime sequences, cubic terms, and Geoboard pedagogy.
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice', { topicFilter: 'Maths' })}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>Practice Maths (PRT)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Subject 4: Environmental Sciences (EVS) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Environmental Sciences (EVS)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dubdi Monastery ("Hermit's Cell"), Dokpas pastoral nomads, RAP/PAP Sikkim permits, UDID Yellow Card, Khangchendzonga, and Sarhul.
            </p>
          </div>
          <button
            onClick={() => onNavigate('practice', { topicFilter: 'EVS' })}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center space-x-1 cursor-pointer pt-1"
          >
            <span>Practice EVS (PRT)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Official 2024 & 2025 Paper Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Paper 1: 2024 STET PRT */}
        <div className="bg-white rounded-xl p-5 border border-amber-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase">
              Uploaded Paper (2024 STET.pdf)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {PRT_2024_QUESTIONS.length} Questions Transcribed
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-900">
            STET PRT 2024 Official Paper
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Covers the actual questions from the uploaded paper: Dubdi Monastery, Dokpas transhumant pastoralists, RAP/PAP permit laws, UDID Yellow Card threshold (40-79%), Euler's formula, and POCSO child definition (&lt;18 years).
          </p>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Solve 2024 Paper</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onOpenTutor('Can you provide an in-depth breakdown of the STET PRT 2024 official paper from 2024 STET.pdf?')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Ask Tutor
            </button>
          </div>
        </div>

        {/* Paper 2: 2025 STET PRT */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 uppercase">
              Official 2025 Paper Set
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {PRT_2025_QUESTIONS.length} Questions Transcribed
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-900">
            STET PRT 2025 Official Paper
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Covers Pardeep Narwal kabaddi, Deforestation carbon sinks, Sarhul festival, Mt. Khangchendzonga expedition ban, Pangolakha Sanctuary, GLOF migration in Lachen, and RPwD 2016 21 disabilities.
          </p>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Solve 2025 Paper</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onOpenTutor('Can you explain the key questions and answer logic from the STET PRT 2025 official paper?')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Ask Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Online PRT Study Guides */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-200/50">
        <div className="flex items-center space-x-2 text-xs text-slate-700">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span className="font-bold">Online Revision Guides for PRT (PDF Download Disabled):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {prtEvsGuide && (
            <button
              onClick={() => onNavigate('study-guides')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Read Sikkim EVS Guide Online</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {prtMathGuide && (
            <button
              onClick={() => onNavigate('study-guides')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Read Primary Maths Guide Online</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
