import React, { useState, useMemo, useRef } from 'react';
import {
  FileDown,
  BookOpen,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
  FileCheck,
  Check,
  Shield,
  RotateCcw,
  Zap
} from 'lucide-react';
import { ExamTrack, Question } from '../types';
import { QUESTION_BANK_1000, getQuestionsForExamTrack } from '../data/examQuestions';
import {
  generateQuestionBankPdf,
  exportQuestionBankJSON,
  restoreQuestionBankFromJSON,
  getStreamLabel
} from '../utils/questionPdfExport';

interface AdminQuestionBankViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminQuestionBankView: React.FC<AdminQuestionBankViewProps> = ({ onShowToast }) => {
  // Selection state
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack | 'all'>('all');
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [questionCountLimit, setQuestionCountLimit] = useState<number | 'all'>('all');

  // PDF Generation Progress state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: '',
  });

  // Re-upload state
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Question Explorer state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Stream counts
  const totalCount = QUESTION_BANK_1000.length;
  const prtCount = useMemo(() => getQuestionsForExamTrack('prt').length, []);
  const gtMsCount = useMemo(() => getQuestionsForExamTrack('gt-maths-science').length, []);
  const gtHumCount = useMemo(() => getQuestionsForExamTrack('gt-humanities').length, []);

  // Filtered list for live question preview
  const currentStreamQuestions = useMemo(() => {
    return getQuestionsForExamTrack(selectedTrack);
  }, [selectedTrack]);

  const filteredQuestions = useMemo(() => {
    return currentStreamQuestions.filter((q) => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase().trim();
        const inQuestion = q.question.toLowerCase().includes(qLower);
        const inTopic = (q.topic || '').toLowerCase().includes(qLower);
        const inOptions = q.options.some((o) => o.toLowerCase().includes(qLower));
        if (!inQuestion && !inTopic && !inOptions) return false;
      }
      return true;
    });
  }, [currentStreamQuestions, categoryFilter, searchQuery]);

  const paginatedQuestions = useMemo(() => {
    const start = (previewPage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, previewPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  // Handle PDF Generation
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress({ current: 0, total: 100, message: 'Preparing questions for export...' });

    try {
      const limit = questionCountLimit === 'all' ? undefined : questionCountLimit;
      const res = await generateQuestionBankPdf({
        track: selectedTrack,
        includeSolutions,
        maxQuestions: limit,
        onProgress: (current, total, message) => {
          setPdfProgress({ current, total, message });
        },
      });

      onShowToast(`Downloaded ${res.totalExported} STET questions in publication-grade PDF!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle JSON Backup Export
  const handleExportJSON = () => {
    try {
      const res = exportQuestionBankJSON(selectedTrack);
      onShowToast(`Downloaded full JSON backup (${res.total} questions) for ${getStreamLabel(selectedTrack)}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to export JSON backup.');
    }
  };

  // Handle JSON Re-upload (Restore)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreStatus(null);

    try {
      const fileText = await file.text();
      const res = await restoreQuestionBankFromJSON(fileText);
      setRestoreStatus({
        success: true,
        message: res.message,
      });
      onShowToast(`Successfully re-uploaded & restored ${res.totalRestored} questions!`);
    } catch (err: any) {
      setRestoreStatus({
        success: false,
        message: err?.message || 'Failed to restore questions from file.',
      });
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-400/40 uppercase tracking-wider">
                <FileDown className="w-3.5 h-3.5 text-amber-300" />
                <span>Admin Hub • Master Question Vault</span>
              </span>
              <span className="text-xs font-bold text-emerald-400">• All Streams Available</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              1,000+ Question Bank PDF Download &amp; Emergency Restore
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Download complete authentic questions across PRT, GT-Maths &amp; Science, and GT-Humanities in print-ready PDF format with complete pedagogical explanations or question-paper-only mode. Also supports full JSON backup export and re-upload if the app ever crashes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              title="Download structured JSON file containing all questions for offline preservation"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download JSON Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer border border-emerald-400/30"
              title="Re-upload previously downloaded questions JSON backup if app ever resets"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Re-upload Questions (Restore)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Stream Metrics Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Streams Card */}
        <div
          onClick={() => { setSelectedTrack('all'); setPreviewPage(1); }}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTrack === 'all'
              ? 'bg-indigo-900/10 border-indigo-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Master Total</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{totalCount}</span>
            <span className="text-xs font-bold text-indigo-600">All Streams</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Complete repository across all 3 teaching streams</p>
        </div>

        {/* PRT Card */}
        <div
          onClick={() => { setSelectedTrack('prt'); setPreviewPage(1); }}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTrack === 'prt'
              ? 'bg-amber-500/10 border-amber-500 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">PRT (Paper I)</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{prtCount}</span>
            <span className="text-xs font-bold text-amber-600">Primary Teacher</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">CDP, EVS, Primary Maths, English, RPwD Act</p>
        </div>

        {/* GT Maths & Science Card */}
        <div
          onClick={() => { setSelectedTrack('gt-maths-science'); setPreviewPage(1); }}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTrack === 'gt-maths-science'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">GT Maths &amp; Sci (Paper II)</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{gtMsCount}</span>
            <span className="text-xs font-bold text-emerald-600">STEM Stream</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Advanced Maths, Physics, Chemistry, Biology &amp; STEM Pedagogy</p>
        </div>

        {/* GT Humanities Card */}
        <div
          onClick={() => { setSelectedTrack('gt-humanities'); setPreviewPage(1); }}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTrack === 'gt-humanities'
              ? 'bg-purple-500/10 border-purple-500 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">GT Humanities (Paper II)</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{gtHumCount}</span>
            <span className="text-xs font-bold text-purple-600">Social Science</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">History, Geography, Indian Polity, Writs &amp; Sikkim Chronicles</p>
        </div>
      </div>

      {/* Restore Status Feedback Banner */}
      {restoreStatus && (
        <div className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-4 animate-in fade-in ${
          restoreStatus.success
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-start space-x-3">
            {restoreStatus.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-extrabold text-sm">{restoreStatus.success ? 'Question Vault Restored' : 'Restore Notice'}</p>
              <p className="text-xs mt-0.5">{restoreStatus.message}</p>
            </div>
          </div>
          <button
            onClick={() => setRestoreStatus(null)}
            className="text-slate-500 hover:text-slate-800 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* PDF Export Control Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <FileDown className="w-5 h-5 text-indigo-600" />
              <span>Configure PDF Export Settings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select stream target, answer key format, and question volume for PDF generation.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Selected:</span>
            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
              {getStreamLabel(selectedTrack)} ({currentStreamQuestions.length} Questions)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Target Stream */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              1. Target Stream
            </label>
            <select
              value={selectedTrack}
              onChange={(e) => {
                setSelectedTrack(e.target.value as ExamTrack | 'all');
                setPreviewPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Streams (Complete Master Bank - {totalCount} Qs)</option>
              <option value="prt">Primary Teacher (PRT - Paper I - {prtCount} Qs)</option>
              <option value="gt-maths-science">Graduate Teacher (GT Maths &amp; Science - {gtMsCount} Qs)</option>
              <option value="gt-humanities">Graduate Teacher (GT Humanities - {gtHumCount} Qs)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Choose an individual stream paper or the complete 2,670+ master pool.
            </p>
          </div>

          {/* 2. Format / Solutions Mode */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              2. Solution Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIncludeSolutions(true)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  includeSolutions
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                With Full Solutions
              </button>
              <button
                type="button"
                onClick={() => setIncludeSolutions(false)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  !includeSolutions
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-black shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Mock Test Only
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {includeSolutions
                ? 'Includes correct option and rationale directly under each question.'
                : 'Questions only with an Answer Key sheet appended at the very end.'}
            </p>
          </div>

          {/* 3. Question Count Limit */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              3. Volume Limit
            </label>
            <select
              value={questionCountLimit}
              onChange={(e) => {
                const val = e.target.value;
                setQuestionCountLimit(val === 'all' ? 'all' : Number(val));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Available Questions ({currentStreamQuestions.length} Qs)</option>
              <option value="1000">1,000 Questions</option>
              <option value="500">500 Questions</option>
              <option value="250">250 Questions</option>
              <option value="100">100 Questions (Standard Mock Test)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Specify how many questions to compile into the exported PDF.
            </p>
          </div>
        </div>

        {/* Download Action Button & Progress */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Estimated PDF size: ~2.5 MB - 6 MB depending on question volume. Rendered directly in-browser.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer border border-indigo-400/30 ${
                isGeneratingPdf ? 'opacity-80 cursor-wait' : ''
              }`}
              id="admin-download-questions-pdf-btn"
            >
              <FileDown className={`w-5 h-5 text-amber-300 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>
                {isGeneratingPdf
                  ? 'Generating PDF Document...'
                  : `Download PDF (${questionCountLimit === 'all' ? currentStreamQuestions.length : Math.min(Number(questionCountLimit), currentStreamQuestions.length)} Qs)`}
              </span>
            </button>
          </div>
        </div>

        {/* Live Rendering Progress Bar */}
        {isGeneratingPdf && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
              <span>{pdfProgress.message}</span>
              <span>
                {pdfProgress.total > 0
                  ? `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-indigo-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-amber-500 rounded-full transition-all duration-150"
                style={{
                  width: `${pdfProgress.total > 0 ? (pdfProgress.current / pdfProgress.total) * 100 : 5}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-indigo-700">
              Generating paginated document layout with Bloom process taxonomy and distractor rationales...
            </p>
          </div>
        )}
      </div>

      {/* Live Question Vault Explorer / Verifier */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Live Question Explorer &amp; Content Verifier</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse questions, options, and pedagogical rationales currently loaded in the active vault.
            </p>
          </div>

          {/* Search & Subject Category Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search question text or topic..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPreviewPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPreviewPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              <option value="CDP">CDP</option>
              <option value="Maths">Mathematics</option>
              <option value="MathsScience">Maths &amp; Science</option>
              <option value="SocialScience">Social Science</option>
              <option value="EVS">EVS</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {paginatedQuestions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
              No questions found matching the selected filters.
            </div>
          ) : (
            paginatedQuestions.map((q, idx) => {
              const displayNum = (previewPage - 1) * itemsPerPage + idx + 1;
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-black">
                        #{displayNum}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase">
                        {q.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {q.topic || 'General Pedagogy'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {q.id}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex items-center space-x-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900">
                      <span className="font-black text-emerald-800">Pedagogical Rationale: </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500 font-bold">
              Showing {(previewPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(previewPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} Questions
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-black text-indigo-900 px-2">
                Page {previewPage} of {totalPages}
              </span>
              <button
                onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                disabled={previewPage >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
