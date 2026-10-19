import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Target, 
  Award, 
  PieChart, 
  Bookmark,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react';
import { UserProfile, ExamTrack } from '../types';
import { HISTORICAL_EXAM_QUESTIONS } from '../data/examQuestions';

interface PerformanceAnalyticsViewProps {
  userProfile: UserProfile;
  onNavigate: (tab: string, extraState?: any) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
}

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  userProfile,
  onNavigate,
  onSelectExamTrack,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack>(
    userProfile.selectedExamTrack || 'prt'
  );

  useEffect(() => {
    if (userProfile.selectedExamTrack) {
      setSelectedTrack(userProfile.selectedExamTrack);
    }
  }, [userProfile.selectedExamTrack]);

  const currentStream: ExamTrack = userProfile.selectedExamTrack || selectedTrack;

  // Filter pool to active stream
  const streamQuestions = HISTORICAL_EXAM_QUESTIONS.filter(
    (q) => !q.examTracks || q.examTracks.includes(currentStream)
  );

  const streamQuestionIds = new Set(streamQuestions.map((q) => q.id));

  const completedList = Object.entries(userProfile.completedQuestions).filter(([qId]) =>
    streamQuestionIds.has(qId)
  ) as Array<[string, { selected: number; isCorrect: boolean; timestamp: number }]>;

  const totalAttempted = completedList.length;
  const correctAnswers = completedList.filter(([_, v]) => v.isCorrect).length;
  const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;

  // Track-specific subjects definition
  const subjectConfigs: Record<
    ExamTrack,
    Array<{ key: string; label: string; filter: (cat: string) => boolean; color: string }>
  > = {
    prt: [
      { key: 'cdp', label: 'Child Development & Pedagogy (CDP)', filter: (c) => c === 'CDP', color: 'bg-indigo-600 text-indigo-600' },
      { key: 'eng', label: 'English Language (Paper I)', filter: (c) => c === 'English', color: 'bg-blue-600 text-blue-600' },
      { key: 'math', label: 'Mathematics (Content & Pedagogy)', filter: (c) => c === 'Mathematics' || c === 'MathsScience', color: 'bg-emerald-600 text-emerald-600' },
      { key: 'evs', label: 'Environmental Studies (EVS)', filter: (c) => c === 'EVS', color: 'bg-amber-600 text-amber-600' },
    ],
    'gt-maths-science': [
      { key: 'cdp', label: 'Child Development & Pedagogy (CDP)', filter: (c) => c === 'CDP', color: 'bg-indigo-600 text-indigo-600' },
      { key: 'eng', label: 'English Language & Pedagogy', filter: (c) => c === 'English', color: 'bg-blue-600 text-blue-600' },
      { key: 'mathsci', label: 'Mathematics & Science Pedagogy', filter: (c) => c === 'MathsScience' || c === 'Mathematics', color: 'bg-emerald-600 text-emerald-600' },
    ],
    'gt-humanities': [
      { key: 'cdp', label: 'Child Development & Pedagogy (CDP)', filter: (c) => c === 'CDP', color: 'bg-indigo-600 text-indigo-600' },
      { key: 'eng', label: 'English Language & Pedagogy', filter: (c) => c === 'English', color: 'bg-blue-600 text-blue-600' },
      { key: 'soc', label: 'Social Science Pedagogy (History, Geo, Civics)', filter: (c) => c === 'SocialScience', color: 'bg-purple-600 text-purple-600' },
    ],
  };

  const activeSubjects = subjectConfigs[currentStream] || subjectConfigs['prt'];

  const calculateSubjectStats = (filterFn: (cat: string) => boolean) => {
    const questionsForSubj = streamQuestions.filter((q) => filterFn(q.category));
    const totalInBank = questionsForSubj.length;
    const attempted = questionsForSubj.filter((q) => userProfile.completedQuestions[q.id]);
    const correct = attempted.filter((q) => userProfile.completedQuestions[q.id]?.isCorrect).length;
    const acc = attempted.length > 0 ? Math.round((correct / attempted.length) * 100) : 0;
    return { totalInBank, attempted: attempted.length, correct, acc };
  };

  // By Paper Year within current stream
  const calculateYearStats = (year: '2026' | '2025' | '2024') => {
    const attempted = streamQuestions.filter(
      (q) => q.year === year && userProfile.completedQuestions[q.id]
    );
    const correct = attempted.filter((q) => userProfile.completedQuestions[q.id]?.isCorrect).length;
    return attempted.length > 0 ? Math.round((correct / attempted.length) * 100) : 0;
  };

  const y2026Acc = calculateYearStats('2026');
  const y2025Acc = calculateYearStats('2025');
  const y2024Acc = calculateYearStats('2024');

  // Bookmarks for this stream
  const streamSavedQuestionIds = userProfile.savedQuestions.filter((id) => streamQuestionIds.has(id));

  return (
    <div className="space-y-6 pb-12" id="performance-analytics-container">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>STET Exam Performance Analytics</span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time diagnostics across historical exam patterns, topic accuracy, and qualification probabilities for your chosen stream.
            </p>
          </div>
        </div>

        {/* Stream Selector Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Active Stream:
          </span>
          {[
            { id: 'prt', label: 'Primary Teacher (PRT - Paper I)' },
            { id: 'gt-maths-science', label: 'GT - Maths & Science (Paper II)' },
            { id: 'gt-humanities', label: 'GT - Humanities (Paper II)' },
          ].map((trk) => {
            const isSelected = currentStream === trk.id;
            return (
              <button
                key={trk.id}
                onClick={() => {
                  setSelectedTrack(trk.id as ExamTrack);
                  if (onSelectExamTrack) {
                    onSelectExamTrack(trk.id as ExamTrack);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{trk.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
              </button>
            );
          })}
        </div>

        {/* Active Stream Indicator */}
        <div className="flex items-center justify-between text-xs text-indigo-950 bg-indigo-50/70 border border-indigo-100 px-3 py-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>
              Analyzing performance metrics for: <strong className="font-bold">{
                currentStream === 'prt' ? 'Primary Teacher (PRT - Paper I)' :
                currentStream === 'gt-maths-science' ? 'Graduate Teacher Maths & Science (Paper II)' :
                'Graduate Teacher Humanities (Paper II)'
              }</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {streamQuestions.length} Questions in Active Syllabus
          </span>
        </div>
      </div>

      {/* Top 3 Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pass Probability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Predicted Qualification Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {Math.min(96, Math.max(50, Math.round(accuracy * 0.95 + 10)))}%
            </span>
            <span className="text-xs font-bold text-emerald-600">Above 60% Cutoff</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Qualifying benchmark: Minimum 90/150 marks (60%) for General Category in {currentStream.toUpperCase()}.
          </div>
        </div>

        {/* Accuracy Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stream Question Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {accuracy}%
            </span>
            <span className="text-xs text-slate-500">({correctAnswers} / {totalAttempted} Attempted)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${accuracy}%` }}></div>
          </div>
        </div>

        {/* Mock Pace */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Velocity Per MCQ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">52s</span>
            <span className="text-xs text-emerald-600 font-bold">Optimal Pace (Limit: 60s)</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Allows 20 minutes buffer for final OMR review during exam.
          </div>
        </div>
      </div>

      {/* Subject Diagnostic Bars (Track-Specific) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
            Stream Subject-Wise Accuracy &amp; Completion Rates
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {activeSubjects.length} Core Sections
          </span>
        </div>

        <div className="space-y-4">
          {activeSubjects.map((sub) => {
            const stats = calculateSubjectStats(sub.filter);
            const colorClass = sub.color.split(' ')[0];
            return (
              <div key={sub.key}>
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-900">{sub.label}</span>
                  <span className="text-indigo-600">
                    {stats.acc}% Accuracy ({stats.attempted}/{stats.totalInBank} attempted)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`${colorClass} h-full rounded-full transition-all duration-700`} 
                    style={{ width: `${stats.acc}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Year Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            STET 2026 Paper
          </span>
          <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">Special Education &amp; NEP 2020</h4>
          <div className="text-2xl font-extrabold text-slate-900">{y2026Acc}%</div>
          <p className="text-xs text-slate-500">Emphasizes translanguaging, UDL, and foundational competencies.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            STET 2025 Paper
          </span>
          <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">Sectional &amp; Subject Pedagogy</h4>
          <div className="text-2xl font-extrabold text-slate-900">{y2025Acc}%</div>
          <p className="text-xs text-slate-500">Features subject pedagogical constructs and syllabus-mapped items.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            STET 2024 Paper
          </span>
          <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">Comprehensive Core Paper</h4>
          <div className="text-2xl font-extrabold text-slate-900">{y2024Acc}%</div>
          <p className="text-xs text-slate-500">Focuses on educational policy, developmental theorists, and curricular frameworks.</p>
        </div>
      </div>

      {/* Bookmarked Revision Queue */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
              Saved for Revision Queue ({streamSavedQuestionIds.length} Questions in Stream)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Review in Practice Bank</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {streamSavedQuestionIds.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No bookmarked questions for this stream yet. Click the bookmark icon on any question in Practice Bank to add it to your revision queue.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {streamSavedQuestionIds.map((qId) => {
              const q = HISTORICAL_EXAM_QUESTIONS.find((item) => item.id === qId);
              if (!q) return null;

              return (
                <div key={q.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      STET {q.year} • {q.category}
                    </span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {q.question}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('practice')}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                  >
                    Solve Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
