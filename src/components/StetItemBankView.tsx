import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  X,
  FileCheck,
  GraduationCap,
  Scale,
  BrainCircuit,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCcw,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { Question, SubjectCategory, ExamTrack, UserProfile } from '../types';
import {
  STET_FRAMING_GUIDELINES,
  STET_COMPETENCY_DOMAINS,
  STET_OFFICIAL_ITEM_BANK_QUESTIONS,
  auditQuestionAgainstGuidelines,
  QuestionAuditResult
} from '../data/stetItemBankData';
import { CompactShareLink } from './CompactShareLink';
import { isUserCouncilMember } from '../utils/advisoryStorage';

interface StetItemBankViewProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor?: (prompt?: string, questionRef?: Question) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
  userProfile?: UserProfile;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const StetItemBankView: React.FC<StetItemBankViewProps> = ({
  onNavigate,
  onOpenTutor,
  onSelectExamTrack,
  userProfile,
  onOpenAuth,
}) => {
  const isCouncil = isUserCouncilMember(userProfile);

  const [activeTab, setActiveTab] = useState<'bank' | 'guidelines' | 'auditor' | 'domains'>('bank');
  
  // Item Bank filters
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'All'>('All');
  const [selectedCognitiveLevel, setSelectedCognitiveLevel] = useState<string>('All');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    STET_OFFICIAL_ITEM_BANK_QUESTIONS[0]?.id || null
  );
  const [showDistractorsFor, setShowDistractorsFor] = useState<Record<string, boolean>>({
    [STET_OFFICIAL_ITEM_BANK_QUESTIONS[0]?.id || '']: true
  });

  // Guidelines filters
  const [guidelineCategory, setGuidelineCategory] = useState<string>('All');
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>('guideline-1');

  // Question Framing Auditor State
  const [authorStem, setAuthorStem] = useState('');
  const [authorOpts, setAuthorOpts] = useState(['', '', '', '']);
  const [authorCorrectIdx, setAuthorCorrectIdx] = useState(0);
  const [authorExplanation, setAuthorExplanation] = useState('');
  const [auditResult, setAuditResult] = useState<QuestionAuditResult | null>(null);

  // Filtered Item Bank Questions
  const filteredQuestions = useMemo(() => {
    return STET_OFFICIAL_ITEM_BANK_QUESTIONS.filter((q) => {
      if (selectedSubject !== 'All' && q.category !== selectedSubject) {
        if (selectedSubject === 'Maths' && q.category !== 'Maths' && q.category !== 'MathsScience') return false;
        if (selectedSubject === 'MathsScience' && q.category !== 'MathsScience' && q.category !== 'Maths') return false;
        if (selectedSubject !== 'Maths' && selectedSubject !== 'MathsScience' && q.category !== selectedSubject) return false;
      }
      if (selectedCognitiveLevel !== 'All' && q.cognitiveLevel !== selectedCognitiveLevel) return false;
      if (selectedTrack !== 'All' && q.examTracks && !q.examTracks.includes(selectedTrack as ExamTrack)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesSubtopic = q.subtopic?.toLowerCase().includes(query) || false;
        const matchesQuestion = q.question.toLowerCase().includes(query);
        const matchesCompetency = q.competencyCode?.toLowerCase().includes(query) || false;
        if (!matchesTopic && !matchesSubtopic && !matchesQuestion && !matchesCompetency) return false;
      }
      return true;
    });
  }, [selectedSubject, selectedCognitiveLevel, selectedTrack, searchQuery]);

  // Filtered Guidelines
  const filteredGuidelines = useMemo(() => {
    if (guidelineCategory === 'All') return STET_FRAMING_GUIDELINES;
    return STET_FRAMING_GUIDELINES.filter((g) => g.category === guidelineCategory);
  }, [guidelineCategory]);

  const toggleDistractorView = (questionId: string) => {
    setShowDistractorsFor((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleRunAudit = () => {
    const res = auditQuestionAgainstGuidelines(authorStem, authorOpts, authorExplanation);
    setAuditResult(res);
  };

  const handleLoadExemplarInAuditor = () => {
    const exemplar = STET_OFFICIAL_ITEM_BANK_QUESTIONS[0];
    if (exemplar) {
      setAuthorStem(exemplar.question);
      setAuthorOpts([...exemplar.options]);
      setAuthorCorrectIdx(exemplar.correctIndex);
      setAuthorExplanation(exemplar.explanation);
      const res = auditQuestionAgainstGuidelines(exemplar.question, exemplar.options, exemplar.explanation);
      setAuditResult(res);
    }
  };

  const handleResetAuditor = () => {
    setAuthorStem('');
    setAuthorOpts(['', '', '', '']);
    setAuthorCorrectIdx(0);
    setAuthorExplanation('');
    setAuditResult(null);
  };

  if (!isCouncil) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4" id="item-bank-council-restricted-screen">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-black tracking-wide uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>Council Members Only</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              STET Item Bank &amp; Question Framing Guidelines
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold max-w-lg mx-auto">
              The foundational psychometric blueprint for the Sikkim Teacher Eligibility Test (STET Paper I &amp; Paper II).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              This repository acts as the authoritative reference for framing exam items, mastering distractor diagnostic rationales, and eliminating flawed question designs.
            </p>
            <p className="font-bold text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              Access to this psychometric repository is strictly restricted to inducted members of the Academic Council, Advisory Board, and authorized contributing authors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('fellowship')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              id="restricted-apply-council-btn"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Apply for Council Membership</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                id="restricted-login-council-btn"
              >
                <span>Council Member Login</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Top Direct Shareable Link Widget */}
      <CompactShareLink
        headerTitle="STET Item Bank & Framing Guidelines"
        shareUrl={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?tab=item-bank` : ''}
        pageTitle="SCERT Sikkim & Azim Premji University STET Item Bank Reference Repository"
      />

      {/* Hero Banner Header */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-amber-400 text-slate-950 rounded-full flex items-center space-x-1 shadow-xs">
              <Award className="w-3.5 h-3.5" />
              <span>Official Reference Item Bank</span>
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-white/10 text-slate-200 rounded-full backdrop-blur-xs border border-white/15">
              SCERT Sikkim & Azim Premji University Joint Standard
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
              NEP 2020 & NCF Aligned
            </span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              STET Item Bank & Question Framing Guidelines
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              The foundational psychometric blueprint for the Sikkim Teacher Eligibility Test (STET Paper I & Paper II).
              This repository acts as the authoritative reference for framing exam items, mastering distractor diagnostic rationales,
              and eliminating flawed question designs.
            </p>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">10 Principles</div>
              <div className="text-[11px] sm:text-xs text-slate-300">SCERT Question Framing Rules</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">100% Diagnostic</div>
              <div className="text-[11px] sm:text-xs text-slate-300">Distractor Misconception Rationales</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-bold text-sky-400">4 Cognitive Tiers</div>
              <div className="text-[11px] sm:text-xs text-slate-300">Recall • Comprehend • Apply • Analyze</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-bold text-indigo-300">All 3 Tracks</div>
              <div className="text-[11px] sm:text-xs text-slate-300">PRT, GT Maths-Sci, GT Humanities</div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Take SCERT Benchmark Mock Exam</span>
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all border border-white/20 flex items-center space-x-2 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4 text-emerald-300" />
              <span>Test Your Own Question (Framing Auditor)</span>
            </button>
            <button
              onClick={() => onNavigate('advisory')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs sm:text-sm rounded-xl transition-all border border-white/15 flex items-center space-x-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              <span>Academic Council & Fellowship</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Reference Item Bank ({filteredQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'guidelines'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>10 Question Framing Guidelines</span>
        </button>

        <button
          onClick={() => setActiveTab('auditor')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'auditor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Item Framing Studio & Auditor</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'domains'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Competency Matrix</span>
        </button>
      </div>

      {/* TAB 1: REFERENCE ITEM BANK EXPLORER */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by topic, keyword, classroom scenario, or competency code (e.g. CDP.COG.01)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Subject Selector */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as any)}
                  aria-label="Filter questions by subject"
                  className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Subjects</option>
                  <option value="CDP">Child Development & Pedagogy (CDP)</option>
                  <option value="Maths">Mathematics & Pedagogy</option>
                  <option value="MathsScience">Science & Pedagogy</option>
                  <option value="EVS">Environmental Studies (EVS)</option>
                  <option value="SocialScience">Social Science / Humanities</option>
                  <option value="English">English & Language Pedagogy</option>
                </select>

                {/* Cognitive Level Selector */}
                <select
                  value={selectedCognitiveLevel}
                  onChange={(e) => setSelectedCognitiveLevel(e.target.value)}
                  aria-label="Filter questions by cognitive taxonomy level"
                  className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Cognitive Levels</option>
                  <option value="Recall">Recall (Knowledge)</option>
                  <option value="Understanding">Understanding (Comprehension)</option>
                  <option value="Application">Application (Pedagogical Action)</option>
                  <option value="Analysis">Analysis (Higher-Order / Diagnosis)</option>
                </select>

                {/* Track Selector */}
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  aria-label="Filter questions by STET exam track"
                  className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Exam Tracks</option>
                  <option value="prt">Paper I: Primary Teacher (PRT)</option>
                  <option value="gt-maths-science">Paper II: GT Maths & Science</option>
                  <option value="gt-humanities">Paper II: GT Humanities / Arts</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Showing {filteredQuestions.length}</span>
                <span>exemplar items from official SCERT-APU Item Bank</span>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium">
                Click any item to view Diagnostic Distractor Breakdown
              </span>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800">No questions match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the subject, cognitive level, or search keyword above to view authentic STET items.
                </p>
                <button
                  onClick={() => {
                    setSelectedSubject('All');
                    setSelectedCognitiveLevel('All');
                    setSelectedTrack('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, qIndex) => {
                const isExpanded = expandedQuestionId === q.id;
                const showDistractor = showDistractorsFor[q.id] ?? false;

                const cognitiveBadgeColor =
                  q.cognitiveLevel === 'Analysis'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : q.cognitiveLevel === 'Application'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : q.cognitiveLevel === 'Understanding'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    {/* Item Card Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[11px] font-bold rounded-md">
                          ITEM #{qIndex + 1}
                        </span>
                        {q.competencyCode && (
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-[11px] font-semibold rounded-md">
                            {q.competencyCode}
                          </span>
                        )}
                        {q.cognitiveLevel && (
                          <span className={`px-2.5 py-1 border text-[11px] font-bold rounded-md ${cognitiveBadgeColor}`}>
                            Cognitive: {q.cognitiveLevel}
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-[11px] rounded-md">
                          {q.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-500 font-medium hidden sm:inline">
                          {q.topic} {q.subtopic ? `• ${q.subtopic}` : ''}
                        </span>
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Question Stem */}
                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                        {q.question}
                      </div>

                      {/* Options Grid */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctIndex;
                          const letter = String.fromCharCode(65 + oIdx);

                          return (
                            <div
                              key={oIdx}
                              className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start space-x-3 ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                                  : 'bg-slate-50/60 border-slate-200/80 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700'
                                }`}
                              >
                                {letter}
                              </span>
                              <div className="flex-1 leading-relaxed">
                                {opt}
                                {isCorrect && (
                                  <span className="ml-2 inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                    <Check className="w-3 h-3 mr-1" />
                                    Correct Key
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Distractor Rationale Toggle & Detailed Section */}
                      {q.distractorRationales && q.distractorRationales.length > 0 && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleDistractorView(q.id)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center space-x-2 transition cursor-pointer"
                          >
                            <BrainCircuit className="w-4 h-4 text-indigo-600" />
                            <span>
                              {showDistractor
                                ? 'Hide Diagnostic Distractor Rationale'
                                : 'Inspect Diagnostic Distractor Rationale (SCERT/APU Standard)'}
                            </span>
                            {showDistractor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {showDistractor && (
                            <div className="mt-3 p-4 sm:p-5 rounded-xl bg-linear-to-br from-indigo-50/90 via-slate-50 to-blue-50/60 border border-indigo-200/90 space-y-3 animate-fadeIn">
                              <div className="flex items-center space-x-2 text-indigo-950 font-bold text-xs sm:text-sm">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Distractor Engineering Analysis (Why options were chosen by item writers):</span>
                              </div>
                              <p className="text-xs text-slate-600">
                                In the SCERT Sikkim & Azim Premji University assessment model, every distractor must diagnose a specific learner or teacher misconception.
                              </p>

                              <div className="space-y-2 pt-1">
                                {q.distractorRationales.map((rationale, rIdx) => {
                                  const letter = String.fromCharCode(65 + rIdx);
                                  const isKey = rIdx === q.correctIndex;

                                  return (
                                    <div
                                      key={rIdx}
                                      className={`p-3 rounded-lg text-xs border leading-relaxed ${
                                        isKey
                                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 font-medium'
                                          : 'bg-white/90 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <div className="font-bold flex items-center space-x-1.5 mb-1">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                          isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                                        }`}>
                                          Option {letter}
                                        </span>
                                        <span className={isKey ? 'text-emerald-800' : 'text-slate-800'}>
                                          {isKey ? 'Target Construct Validated' : 'Diagnostic Misconception Detected'}
                                        </span>
                                      </div>
                                      <div className="text-slate-700 pl-1">{rationale}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expanded Details: Pedagogical Explanation & Pattern Analysis */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1.5">
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <Info className="w-4 h-4 text-blue-600" />
                              <span>Pedagogical Solution & Curricular Alignment:</span>
                            </div>
                            <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                            <div>
                              <strong>Source:</strong> {q.sourceDoc || 'SCERT Sikkim & Azim Premji University STET Item Bank'}
                            </div>
                            <div className="flex items-center space-x-2">
                              {onOpenTutor && (
                                <button
                                  onClick={() => onOpenTutor(`Please explain this official STET Item Bank question in detail: "${q.question}"`, q)}
                                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Discuss with AI Tutor</span>
                                </button>
                              )}
                              <button
                                onClick={() => onNavigate('practice', { topicFilter: q.topic })}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Practice in Question Pool</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 10 QUESTION FRAMING GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          {/* Header intro & Category Filter */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  SCERT Sikkim & Azim Premji University Item Writing Principles
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  10 mandatory pedagogical principles formulated to replace rote memory tests with authentic classroom assessment.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Stem Design', 'Distractor Engineering', 'Cognitive Rigor', 'Fairness & Bias', 'Sikkim Context'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGuidelineCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      guidelineCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cognitive Taxonomy Distribution Blueprint Card */}
            <div className="p-4 rounded-xl bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Recommended Bloom's Cognitive Distribution for STET Examination:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-amber-700">Recall / Knowledge (15%)</div>
                  <div className="text-[11px] text-slate-600">Definitions, foundational landmark acts, vital terminology.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-blue-700">Understanding (35%)</div>
                  <div className="text-[11px] text-slate-600">Interpreting theories, classifying student behaviors, explaining causes.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-emerald-700">Application (30%)</div>
                  <div className="text-[11px] text-slate-600">Solving classroom dilemmas, adapting lesson plans, CRA sequencing.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-purple-700">Analysis & Evaluation (20%)</div>
                  <div className="text-[11px] text-slate-600">Diagnosing pupil errors, dissecting experiments, source criticism.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Cards Accordion */}
          <div className="space-y-4">
            {filteredGuidelines.map((guideline) => {
              const isOpen = expandedGuidelineId === guideline.id;

              return (
                <div
                  key={guideline.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                >
                  {/* Guideline Header */}
                  <div
                    onClick={() => setExpandedGuidelineId(isOpen ? null : guideline.id)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {guideline.ruleNumber}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {guideline.category}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                          {guideline.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{guideline.shortSummary}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-fadeIn">
                      {/* Core Principle */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-1">Core Assessment Principle:</strong>
                        {guideline.corePrinciple}
                      </div>

                      {/* Dos and Don'ts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dos */}
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                          <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Mandatory Best Practices (DO):</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-emerald-900">
                            {guideline.dos.map((item, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-emerald-600 font-bold shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Don'ts */}
                        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-2">
                          <div className="font-bold text-xs sm:text-sm text-rose-950 flex items-center space-x-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Common Item Flaws to Eliminate (DON'T):</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-rose-900">
                            {guideline.donts.map((item, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-rose-600 font-bold shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Classroom Exemplar: Flawed vs Improved */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Comparative Item Design Transformation:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Flawed side */}
                          <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200/80 space-y-2">
                            <span className="font-bold text-rose-800 text-[11px] uppercase tracking-wider block">
                              ❌ Flawed Item Framing:
                            </span>
                            <div className="font-mono text-slate-800 whitespace-pre-line bg-white p-2.5 rounded border border-rose-100">
                              {guideline.classroomExample.flawedItem}
                            </div>
                            <p className="text-[11px] text-rose-900 italic">
                              <strong>Why Flawed:</strong> {guideline.classroomExample.flawExplanation}
                            </p>
                          </div>

                          {/* Improved side */}
                          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block">
                              ✅ SCERT/APU Standard Item Framing:
                            </span>
                            <div className="font-mono text-slate-800 whitespace-pre-line bg-white p-2.5 rounded border border-emerald-100">
                              {guideline.classroomExample.improvedItem}
                            </div>
                            <p className="text-[11px] text-emerald-900 italic">
                              <strong>Why Effective:</strong> {guideline.classroomExample.improvedExplanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION FRAMING STUDIO & PSYCHOMETRIC AUDITOR */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span>Interactive Item Authoring & Psychometric Auditor</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Draft or paste a proposed STET test item. The engine immediately audits it against the 10 SCERT-APU
                  psychometric standards, flags flaws ("all of the above", length disparity, cue leaks), and estimates cognitive rigor.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleLoadExemplarInAuditor}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Load Exemplar 100/100 Item</span>
                </button>
                <button
                  onClick={handleResetAuditor}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-4 pt-2">
              {/* Question Stem */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Question Stem (Provide realistic classroom situation, student work, or pedagogical problem)
                </label>
                <textarea
                  rows={4}
                  value={authorStem}
                  onChange={(e) => setAuthorStem(e.target.value)}
                  placeholder="e.g. An upper primary teacher in Soreng observes that students consistently make errors when dividing fractions (e.g. 1/2 ÷ 1/4 = 1/8). In constructivist mathematics pedagogy, which instructional model should the teacher use to clarify the inverse relationship?"
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Four Homogeneous Options (Select the Radio for Correct Key)
                </label>
                {authorOpts.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`opt-radio-${i}`}
                        name="correct-option"
                        checked={authorCorrectIdx === i}
                        onChange={() => setAuthorCorrectIdx(i)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor={`opt-radio-${i}`} className="text-xs font-bold w-6 text-slate-700 cursor-pointer">
                        {letter})
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...authorOpts];
                          updated[i] = e.target.value;
                          setAuthorOpts(updated);
                        }}
                        placeholder={`Option ${letter} text...`}
                        className="flex-1 p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  3. Pedagogical Explanation & Distractor Diagnostic Rationales
                </label>
                <textarea
                  rows={3}
                  value={authorExplanation}
                  onChange={(e) => setAuthorExplanation(e.target.value)}
                  placeholder="Detail the correct mathematical/pedagogical principle and explain why the incorrect options diagnose specific pupil misconceptions..."
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunAudit}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Audit Item Against SCERT-APU Standards</span>
              </button>
            </div>
          </div>

          {/* Audit Results Card */}
          {auditResult && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white ${
                      auditResult.score >= 90
                        ? 'bg-emerald-600'
                        : auditResult.score >= 70
                        ? 'bg-blue-600'
                        : auditResult.score >= 50
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    {auditResult.score}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Psychometric Score</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                      <span>Rating: {auditResult.rating}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                        Taxonomy: {auditResult.detectedCognitiveLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Evaluated against 10 SCERT Sikkim & Azim Premji University Guidelines
                </div>
              </div>

              {/* Rules Passed */}
              {auditResult.passedRules.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-950 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Psychometric Criteria Satisfied:</span>
                  </div>
                  <ul className="space-y-1 text-emerald-900 pl-4 list-disc">
                    {auditResult.passedRules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Violations */}
              {auditResult.violations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5">
                  <div className="font-bold text-rose-950 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Flaws Detected (Violations of Guidelines):</span>
                  </div>
                  <ul className="space-y-1 text-rose-900 pl-4 list-disc">
                    {auditResult.violations.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {auditResult.suggestions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center space-x-1">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Senior Examiner Revision Suggestions:</span>
                  </div>
                  <ul className="space-y-1 text-amber-900 pl-4 list-disc">
                    {auditResult.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPETENCY MATRIX */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Official STET Competency Matrix & Learning Domains
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                The curricular domains mapped by SCERT Sikkim and Azim Premji University for teacher eligibility assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {STET_COMPETENCY_DOMAINS.map((domain) => (
                <div
                  key={domain.domainId}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800">
                      {domain.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{domain.domainId}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{domain.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{domain.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Sub-Domains & Competency Codes:
                    </div>
                    {domain.subDomains.map((sub) => (
                      <div key={sub.code} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {sub.code}
                          </span>
                          <span className="font-semibold text-slate-800">{sub.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-1">
                          {sub.keyLearningOutcomes.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Reference CTA */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-lg font-bold text-amber-400">
            Contribute to the Academic Council Question Bank
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Are you a teacher educator, subject specialist, or researcher? Apply for the STET Pedagogical Fellowship
            to review and frame gold-standard items using the SCERT-APU guidelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('fellowship-application')}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Apply for Fellowship</span>
          </button>
          <button
            onClick={() => onNavigate('mock-tests')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-white/20 cursor-pointer flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4 text-emerald-300" />
            <span>Mock Test Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
