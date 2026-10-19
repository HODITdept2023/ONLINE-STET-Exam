import React, { useState, useMemo, useRef } from 'react';
import {
  FileDown,
  Download,
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Sparkles,
  Layers,
  ShieldCheck,
  Check,
  Eye,
  FileText,
  Printer,
  ChevronDown,
  ArrowRight,
  Database
} from 'lucide-react';
import { Question, ExamTrack } from '../../types';
import {
  QUESTION_BANK_1000,
  getQuestionsForExamTrack,
  getExamTrackQuestionCount
} from '../../data/questionPool1000';
import {
  generateQuestionBankPdf,
  exportQuestionBankJSON,
  restoreQuestionBankFromJSON,
  getStreamLabel
} from '../../utils/questionPdfExport';

interface QuestionBankPdfDownloadSectionProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const QuestionBankPdfDownloadSection: React.FC<QuestionBankPdfDownloadSectionProps> = ({
  showToast
}) => {
  // Config state
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack | 'all'>('all');
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [questionCountLimit, setQuestionCountLimit] = useState<number>(1000);
  const [customLimitInput, setCustomLimitInput] = useState<string>('1000');

  // Generation status
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ processed: number; total: number; message: string }>({
    processed: 0,
    total: 0,
    message: ''
  });

  // Re-upload / Restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Question Explorer state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const pageSize = 10;

  // Stream counts
  const totalCount = QUESTION_BANK_1000.length;
  const prtCount = useMemo(() => getExamTrackQuestionCount('prt'), []);
  const gtMsCount = useMemo(() => getExamTrackQuestionCount('gt-maths-science'), []);
  const gtHumCount = useMemo(() => getExamTrackQuestionCount('gt-humanities'), []);

  // Filtered questions for current stream
  const currentStreamQuestions = useMemo(() => {
    return getQuestionsForExamTrack(selectedTrack);
  }, [selectedTrack]);

  // Unique categories for the current stream
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    currentStreamQuestions.forEach((q) => {
      if (q.category) cats.add(q.category);
    });
    return Array.from(cats).sort();
  }, [currentStreamQuestions]);

  // Questions filtered for preview
  const filteredQuestions = useMemo(() => {
    return currentStreamQuestions.filter((q) => {
      const matchesSearch =
        !searchTerm ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.options.some((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' || q.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [currentStreamQuestions, searchTerm, categoryFilter]);

  const totalPreviewPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const paginatedQuestions = useMemo(() => {
    const start = (previewPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, previewPage]);

  // Handle PDF Download
  const handleDownloadPdf = async (overrideTrack?: ExamTrack | 'all', overrideCount?: number) => {
    const track = overrideTrack || selectedTrack;
    const maxQ = overrideCount !== undefined ? overrideCount : questionCountLimit;

    try {
      setIsGeneratingPdf(true);
      setPdfProgress({
        processed: 0,
        total: maxQ,
        message: 'Preparing document structure...'
      });

      const res = await generateQuestionBankPdf({
        track,
        includeSolutions,
        maxQuestions: maxQ > 0 ? maxQ : undefined,
        onProgress: (processed, total, message) => {
          setPdfProgress({ processed, total, message });
        }
      });

      if (res.success) {
        showToast?.(`Downloaded ${res.totalExported} questions PDF successfully!`, 'success');
      }
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showToast?.(err?.message || 'Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle JSON Backup Download
  const handleDownloadJsonBackup = (track: ExamTrack | 'all') => {
    try {
      const res = exportQuestionBankJSON(track);
      showToast?.(`Downloaded JSON backup of ${res.total} questions (${res.fileName})`, 'success');
    } catch (err: any) {
      showToast?.(err?.message || 'Failed to export backup file.', 'error');
    }
  };

  // Handle JSON File Re-upload / Restore
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error('File content was empty');

        const result = await restoreQuestionBankFromJSON(text);
        setUploadResult({
          success: true,
          message: result.message,
          count: result.totalRestored
        });
        showToast?.(result.message, 'success');
      } catch (err: any) {
        setUploadResult({
          success: false,
          message: err?.message || 'Failed to parse and restore question bank file.'
        });
        showToast?.(err?.message || 'Failed to restore questions.', 'error');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadResult({
        success: false,
        message: 'Could not read the uploaded file.'
      });
      showToast?.('File read error', 'error');
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="admin-questions-pdf-section">
      {/* Top Banner / Mission Statement */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AdminHub Master Exporter</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Complete Crash-Recovery Safe</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight mb-2">
            1,000+ Questions PDF Exporter &amp; System Backup
          </h2>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Generate and download publication-ready official PDF papers for all Sikkim TET streams
            (Primary Teacher PRT, GT Maths &amp; Science, and GT Humanities). Includes complete solutions,
            pedagogical explanations, answer key appendixes, and one-click JSON restore if the app ever resets.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">All Streams Total</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{totalCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Master Repository</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">PRT (Paper I)</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{prtCount}</div>
              <div className="text-[11px] text-indigo-200/70 mt-0.5">Primary Teacher</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">GT Maths &amp; Sci</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{gtMsCount}</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Paper II (STEM)</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-xs text-rose-300 font-bold uppercase tracking-wider">GT Humanities</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{gtHumCount}</div>
              <div className="text-[11px] text-rose-200/70 mt-0.5">Paper II (Social Sci)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Grid: PDF Downloader & JSON Backup / Re-upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: PDF Download Customizer & Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Configure &amp; Download PDF Question Paper
                </h3>
                <p className="text-xs text-slate-500">
                  Select your target stream, question volume, and whether to include answers
                </p>
              </div>
            </div>

            {/* 1. Stream Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Target Exam Stream
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'all',
                    label: 'All Streams (Complete Master Bank)',
                    count: totalCount,
                    desc: 'PRT + GT Maths-Science + GT Humanities'
                  },
                  {
                    id: 'prt',
                    label: 'Primary Teacher (PRT - Paper I)',
                    count: prtCount,
                    desc: 'Classes I - V (CDP, Maths, EVS, Lang)'
                  },
                  {
                    id: 'gt-maths-science',
                    label: 'GT Maths & Science (Paper II)',
                    count: gtMsCount,
                    desc: 'Classes VI - VIII (Physics, Chem, Bio, Maths)'
                  },
                  {
                    id: 'gt-humanities',
                    label: 'GT Humanities & Social Sci (Paper II)',
                    count: gtHumCount,
                    desc: 'Classes VI - VIII (History, Polity, Geog)'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedTrack(item.id as ExamTrack | 'all');
                      setPreviewPage(1);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      selectedTrack === item.id
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.count} Qs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Format & Solutions Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. PDF Content &amp; Solution Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIncludeSolutions(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    includeSolutions
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${includeSolutions ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    <span className="font-bold text-xs text-slate-900">
                      With Solutions &amp; Explanations
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Shows correct answers inline with full pedagogical reasoning &amp; syllabus notes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeSolutions(false)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    !includeSolutions
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Printer
                      className={`w-4 h-4 ${!includeSolutions ? 'text-indigo-600' : 'text-slate-400'}`}
                    />
                    <span className="font-bold text-xs text-slate-900">
                      Question Paper Only (+ Appendix)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Clean test layout for candidate printing; answer keys compiled at the end.
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Question Quantity Preset */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Question Volume Limit
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target: {questionCountLimit === 0 ? 'All Available' : `${questionCountLimit} Questions`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: `All in Stream (${currentStreamQuestions.length} Qs)`, value: 0 },
                  { label: `All Master Vault (${totalCount} Qs)`, value: totalCount },
                  { label: '1,000 Questions', value: 1000 },
                  { label: '500 Questions', value: 500 },
                  { label: '150 Mock Test', value: 150 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setQuestionCountLimit(preset.value);
                      setCustomLimitInput(preset.value.toString());
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      questionCountLimit === preset.value
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Display (When Generating) */}
            {isGeneratingPdf && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>{pdfProgress.message || 'Compiling questions into PDF...'}</span>
                  </span>
                  <span>
                    {pdfProgress.processed} / {pdfProgress.total}
                  </span>
                </div>
                <div className="w-full bg-indigo-200/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-150"
                    style={{
                      width: `${
                        pdfProgress.total > 0
                          ? Math.min(100, Math.round((pdfProgress.processed / pdfProgress.total) * 100))
                          : 10
                      }%`
                    }}
                  />
                </div>
                <p className="text-[10px] text-indigo-600">
                  Rendering multi-page A4 layout with typography and metadata formatting.
                </p>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf()}
                disabled={isGeneratingPdf}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isGeneratingPdf
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-indigo-500/25 transform hover:scale-[1.01]'
                }`}
                id="admin-download-questions-pdf-submit-btn"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Generating PDF Document ({pdfProgress.processed}/{pdfProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                    <span>
                      Download {questionCountLimit === 0 ? currentStreamQuestions.length : Math.min(questionCountLimit, currentStreamQuestions.length)} Questions PDF ({getStreamLabel(selectedTrack).split(' (')[0]})
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Stream PDF Download Cards */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                ⚡ Quick 1-Click PDF Downloads by Stream
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('all', 1000)}
                  disabled={isGeneratingPdf}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      Master 1,000 Questions PDF
                    </div>
                    <div className="text-[11px] text-slate-500">All Streams Combined (1,000 Qs)</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf('prt', prtCount)}
                  disabled={isGeneratingPdf}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      PRT Paper I Complete PDF
                    </div>
                    <div className="text-[11px] text-slate-500">Primary Teacher ({prtCount} Qs)</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf('gt-maths-science', gtMsCount)}
                  disabled={isGeneratingPdf}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      GT Maths &amp; Science Paper II PDF
                    </div>
                    <div className="text-[11px] text-slate-500">STEM Stream ({gtMsCount} Qs)</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf('gt-humanities', gtHumCount)}
                  disabled={isGeneratingPdf}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      GT Humanities Paper II PDF
                    </div>
                    <div className="text-[11px] text-slate-500">Social Science ({gtHumCount} Qs)</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Crash Protection & JSON Re-Upload / Restore (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* JSON Backup Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Download Full JSON Backup
                </h3>
                <p className="text-xs text-slate-500">
                  Raw structured dataset for permanent safe keeping
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Downloads the complete raw question bank including question text, options, answers,
              pedagogical explanations, syllabus codes, and exam tags into a single standardized JSON file.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDownloadJsonBackup('all')}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer border border-amber-300"
                id="admin-download-json-backup-all-btn"
              >
                <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Download All Streams Master Backup ({totalCount} Qs .json)</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadJsonBackup('prt')}
                  className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 text-center"
                >
                  PRT ({prtCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJsonBackup('gt-maths-science')}
                  className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 text-center"
                >
                  GT-MS ({gtMsCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJsonBackup('gt-humanities')}
                  className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 text-center"
                >
                  GT-Hum ({gtHumCount})
                </button>
              </div>
            </div>
          </div>

          {/* Re-Upload / Restore Tool (Crash Recovery) */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 rounded-3xl p-6 border-2 border-indigo-200/80 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-indigo-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Re-Upload &amp; Restore Questions
                </h3>
                <p className="text-xs text-indigo-700 font-semibold">
                  Restore questions if app crashes or clears cache
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-indigo-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Instant Crash Recovery Guarantee:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                If the application cache is ever deleted or the database resets, re-upload your downloaded
                backup JSON file here. It automatically verifies each question, restores it to local memory,
                and synchronizes with the server questions registry.
              </p>
            </div>

            {/* Hidden File Input & Upload Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
              id="admin-restore-questions-file-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-white/60 hover:bg-white transition-all group"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all mb-2">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              <p className="font-bold text-xs text-slate-900">
                {isUploading ? 'Validating and restoring file...' : 'Click to Select Backup JSON File'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Accepts <span className="font-mono text-indigo-600">.json</span> files exported from this system
              </p>
            </div>

            {/* Upload Feedback Result */}
            {uploadResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start space-x-2.5 animate-in fade-in duration-200 ${
                  uploadResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {uploadResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {uploadResult.success ? 'Restore Succeeded!' : 'Upload Error'}
                  </span>
                  <span className="text-[11px]">{uploadResult.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Live Question Bank Inspector & Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                Live Question Bank Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Inspect and search through all questions before generating PDF or JSON backup
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredQuestions.length} of {currentStreamQuestions.length} in stream
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPreviewPage(1);
              }}
              placeholder="Search by question text, pedagogical concepts, option keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPreviewPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer truncate"
            >
              <option value="all">All Categories ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-3.5">
          {paginatedQuestions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No questions matched your filter</p>
              <p className="text-xs text-slate-500 mt-1">Try searching a different concept or resetting filters</p>
            </div>
          ) : (
            paginatedQuestions.map((q, idx) => {
              const globalIndex = (previewPage - 1) * pageSize + idx + 1;
              return (
                <div
                  key={q.id || `q-item-${idx}`}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-md">
                        #{globalIndex}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                        {q.category}
                      </span>
                      {q.topic && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {q.topic}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Year: {q.year || '2025'} • ID: {q.id}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.question}
                  </p>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-tight">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Banner */}
                  {q.explanation && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-emerald-700 font-bold">Solution &amp; Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        {totalPreviewPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Page {previewPage} of {totalPreviewPages} ({filteredQuestions.length} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                disabled={previewPage >= totalPreviewPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

export default QuestionBankPdfDownloadSection;
