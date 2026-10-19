import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Bookmark, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  Lightbulb, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  Wand2,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  Target,
  Award,
  Crown,
  Clock,
  Lock,
} from 'lucide-react';
import { Question, SubjectCategory, ExamYear, UserProfile, LogicQuestionMode, ExamTrack } from '../types';
import { HISTORICAL_EXAM_QUESTIONS, getLogicModeLabel } from '../data/examQuestions';
import { recordLearningActivity } from '../utils/streakTracker';
import { 
  getQuestionsUsageCount, 
  hasReachedQuestionLimit, 
  isPaidOrAdmin, 
  recordQuestionAttempt, 
  getAttemptedQuestionIds, 
  FREE_TIER_QUESTION_LIMIT,
  getFreeTierQuestionLimit,
  canAccessExamTrack,
  isCourseLockedForUser,
  getSubscribedCourseTitle,
  getUserSubscribedTrack,
  isAdminUser
} from '../utils/storage';

interface PracticeQuestionsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onOpenTutor: (contextPrompt?: string, questionRef?: Question) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
  initialTopicFilter?: string;
  onOpenSubscription?: (trackId?: ExamTrack) => void;
  onOpenSubscribeForMore?: (section?: 'practice' | 'mock-tests') => void;
}

export const PracticeQuestionsView: React.FC<PracticeQuestionsViewProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenTutor,
  onSelectExamTrack,
  initialTopicFilter,
  onOpenSubscription,
  onOpenSubscribeForMore,
}) => {
  const initialCat: SubjectCategory = 
    initialTopicFilter === 'CDP' ? 'CDP' :
    initialTopicFilter === 'SocialScience' ? 'SocialScience' :
    initialTopicFilter === 'English' ? 'English' :
    initialTopicFilter === 'Maths' ? 'Maths' :
    initialTopicFilter === 'EVS' ? 'EVS' :
    initialTopicFilter === 'MathsScience' ? 'MathsScience' : 'All';

  const isPaid = isPaidOrAdmin(userProfile);
  const isPaidCandidate = isPaid && !isAdminUser(userProfile.email) && userProfile.role !== 'admin';
  const subscribedTrack = getUserSubscribedTrack(userProfile);

  const [selectedTrack, setSelectedTrack] = useState<ExamTrack | 'all'>(
    isPaidCandidate ? subscribedTrack : (userProfile.selectedExamTrack || 'gt-humanities')
  );

  useEffect(() => {
    if (isPaidCandidate) {
      setSelectedTrack(subscribedTrack);
    } else if (userProfile.selectedExamTrack) {
      setSelectedTrack(userProfile.selectedExamTrack);
    }
  }, [userProfile.selectedExamTrack, isPaidCandidate, subscribedTrack]);

  const currentStream: ExamTrack | 'all' = isPaidCandidate ? subscribedTrack : (selectedTrack || userProfile.selectedExamTrack || 'gt-humanities');

  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>(initialCat);
  const [selectedYear, setSelectedYear] = useState<ExamYear>('All');
  const [selectedLogicMode, setSelectedLogicMode] = useState<LogicQuestionMode | 'all'>('all');
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [aiBreakdowns, setAiBreakdowns] = useState<Record<string, { loading: boolean; text?: string }>>({});
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [jumpInput, setJumpInput] = useState<string>('');
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);
  const [similarLogicNotice, setSimilarLogicNotice] = useState<{
    sourceQuestionId: string;
    targetQuestionId: string;
    modeLabel: string;
    rule: string;
  } | null>(null);

  // Filtered Question List strictly locked to the Active Exam Stream
  const filteredQuestions = HISTORICAL_EXAM_QUESTIONS.filter((q) => {
    if (currentStream !== 'all' && q.examTracks && !q.examTracks.includes(currentStream as ExamTrack)) return false;
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
    if (selectedYear !== 'All' && q.year !== selectedYear) return false;
    if (selectedLogicMode !== 'all' && q.logicMode !== selectedLogicMode) return false;
    if (initialTopicFilter && initialTopicFilter.toLowerCase() !== 'all' && initialCat === 'All') {
      const match = q.topic.toLowerCase().includes(initialTopicFilter.toLowerCase()) || 
                    q.tags.some(t => t.toLowerCase().includes(initialTopicFilter.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  // All questions in active stream for accurate live pool statistics
  const streamPoolQuestions = useMemo(() => {
    if (currentStream === 'all') return HISTORICAL_EXAM_QUESTIONS;
    return HISTORICAL_EXAM_QUESTIONS.filter((q) => !q.examTracks || q.examTracks.includes(currentStream as ExamTrack));
  }, [currentStream]);

  const streamTotalCount = streamPoolQuestions.length;
  const masterVaultTotal = HISTORICAL_EXAM_QUESTIONS.length;

  const getCategoryCount = (cat: SubjectCategory) => {
    if (cat === 'All') return streamTotalCount;
    return streamPoolQuestions.filter(q => q.category === cat).length;
  };

  const getStreamCount = (track: ExamTrack | 'all') => {
    if (track === 'all') return HISTORICAL_EXAM_QUESTIONS.length;
    return HISTORICAL_EXAM_QUESTIONS.filter(q => !q.examTracks || q.examTracks.includes(track)).length;
  };

  const availableSubjectCategories: Array<{ id: SubjectCategory; label: string; count: number }> = [
    { id: 'All', label: currentStream === 'all' ? 'All Master Questions' : 'All Stream Subjects', count: streamTotalCount },
    { id: 'CDP', label: 'Child Dev & Pedagogy', count: getCategoryCount('CDP') },
    { id: 'English', label: 'English Language', count: getCategoryCount('English') },
    ...(currentStream === 'prt'
      ? [
          { id: 'Maths' as SubjectCategory, label: 'Mathematics (PRT)', count: getCategoryCount('Maths') },
          { id: 'EVS' as SubjectCategory, label: 'Environmental Studies (EVS)', count: getCategoryCount('EVS') },
        ]
      : currentStream === 'gt-maths-science'
      ? [
          { id: 'MathsScience' as SubjectCategory, label: 'Graduate Maths & Science', count: getCategoryCount('MathsScience') },
        ]
      : currentStream === 'gt-humanities'
      ? [
          { id: 'SocialScience' as SubjectCategory, label: 'Graduate Social Science & Pedagogy', count: getCategoryCount('SocialScience') },
        ]
      : [
          { id: 'SocialScience' as SubjectCategory, label: 'Graduate Social Science', count: getCategoryCount('SocialScience') },
          { id: 'MathsScience' as SubjectCategory, label: 'Graduate Maths & Science', count: getCategoryCount('MathsScience') },
          { id: 'Maths' as SubjectCategory, label: 'Mathematics (PRT)', count: getCategoryCount('Maths') },
          { id: 'EVS' as SubjectCategory, label: 'Environmental Studies (EVS)', count: getCategoryCount('EVS') },
        ]),
  ];

  const [usageCount, setUsageCount] = useState<number>(() => getQuestionsUsageCount(userProfile));
  const [questionLimit, setQuestionLimit] = useState<number>(() => getFreeTierQuestionLimit());

  useEffect(() => {
    const handleAttemptUpdate = () => {
      setUsageCount(getQuestionsUsageCount(userProfile));
    };
    const handleLimitUpdate = () => {
      setQuestionLimit(getFreeTierQuestionLimit());
    };
    window.addEventListener('studeezone_question_attempted', handleAttemptUpdate);
    window.addEventListener('studeezone_free_limit_updated', handleLimitUpdate);
    return () => {
      window.removeEventListener('studeezone_question_attempted', handleAttemptUpdate);
      window.removeEventListener('studeezone_free_limit_updated', handleLimitUpdate);
    };
  }, [userProfile]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex] || filteredQuestions[0];
  const qState = currentQuestion ? userProfile.completedQuestions[currentQuestion.id] : undefined;
  const isAnswered = qState !== undefined || userSelectedOption !== null;
  const activeSelection = userSelectedOption !== null ? userSelectedOption : qState?.selected ?? null;
  const isSaved = currentQuestion ? userProfile.savedQuestions.includes(currentQuestion.id) : false;

  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion) return;

    // Free Usage Limit check: Dynamic Question Limit across Mock & Practice
    if (!isPaid) {
      const attemptedIds = getAttemptedQuestionIds(userProfile);
      const isAlreadyAttempted = 
        Boolean(userProfile.completedQuestions[currentQuestion.id]) || 
        attemptedIds.includes(currentQuestion.id);

      if (!isAlreadyAttempted) {
        const currentUsage = getQuestionsUsageCount(userProfile);
        if (currentUsage >= questionLimit) {
          // Block attempt and trigger pop up: Subscribe for more..!!
          if (onOpenSubscribeForMore) {
            onOpenSubscribeForMore('practice');
          } else if (onOpenSubscription) {
            onOpenSubscription(currentStream);
          }
          return;
        }

        const newCount = recordQuestionAttempt(currentQuestion.id);
        setUsageCount(newCount);

        // If this completed question limit, show pop up immediately
        if (newCount >= questionLimit) {
          setTimeout(() => {
            if (onOpenSubscribeForMore) {
              onOpenSubscribeForMore('practice');
            } else if (onOpenSubscription) {
              onOpenSubscription(currentStream);
            }
          }, 350);
        }
      }
    }

    setUserSelectedOption(optIndex);
    const isCorrect = optIndex === currentQuestion.correctIndex;

    onUpdateProfile((prev) => {
      const newCompleted = {
        ...prev.completedQuestions,
        [currentQuestion.id]: {
          selected: optIndex,
          isCorrect,
          timestamp: Date.now(),
        },
      };

      const xpGain = isCorrect ? 25 : 5;
      const streakUpdated = recordLearningActivity(prev, 'practice_session', 1, xpGain);

      return {
        ...streakUpdated,
        totalXp: prev.totalXp + xpGain,
        completedQuestions: newCompleted,
      };
    });
  };

  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    onUpdateProfile((prev) => {
      const isBookmarked = prev.savedQuestions.includes(currentQuestion.id);
      const newSaved = isBookmarked
        ? prev.savedQuestions.filter((id) => id !== currentQuestion.id)
        : [...prev.savedQuestions, currentQuestion.id];
      return {
        ...prev,
        savedQuestions: newSaved,
      };
    });
  };

  // Similar Logic-Based Question Creation & Navigation Mode
  const handleSpawnSimilarLogicQuestion = () => {
    if (!currentQuestion) return;
    const mode = currentQuestion.logicMode || 'assertion-reason';
    
    // Find questions in the 1,000-question pool with the same cognitive logic mode
    const similarPool = HISTORICAL_EXAM_QUESTIONS.filter(
      (q) => q.logicMode === mode && q.id !== currentQuestion.id
    );

    if (similarPool.length === 0) return;

    // Prefer same category or cycle to another matching item
    const sameCat = similarPool.filter((q) => q.category === currentQuestion.category);
    const candidateList = sameCat.length > 0 ? sameCat : similarPool;
    const chosen = candidateList[Math.floor(Math.random() * candidateList.length)];

    // Reset filters if necessary to show the chosen question
    if (selectedCategory !== 'All' && chosen.category !== selectedCategory) {
      setSelectedCategory('All');
    }
    if (selectedYear !== 'All' && chosen.year !== selectedYear) {
      setSelectedYear('All');
    }
    if (selectedLogicMode !== 'all' && chosen.logicMode !== selectedLogicMode) {
      setSelectedLogicMode(chosen.logicMode || 'all');
    }

    // Find its index in the newly active pool
    const newIdx = HISTORICAL_EXAM_QUESTIONS.findIndex((q) => q.id === chosen.id);
    if (newIdx !== -1) {
      // Find index within filtered questions
      setTimeout(() => {
        const matchingIdx = filteredQuestions.findIndex((q) => q.id === chosen.id);
        setCurrentIndex(matchingIdx >= 0 ? matchingIdx : 0);
        setUserSelectedOption(null);
      }, 50);
    }

    // Set notification banner explaining the similar logic rule
    let ruleText = 'Evaluates causal cognitive connection between Assertion and Reason.';
    if (mode === 'calculation') ruleText = 'Employs 15° = 1 Hour Longitude Earth rotation or IQ mental age formulas.';
    if (mode === 'theorist-stage') ruleText = 'Maps developmental milestones across Piaget, Kohlberg, Vygotsky or Bandura stages.';
    if (mode === 'case-study') ruleText = 'Tests pedagogical intervention in an authentic inclusive classroom situation.';
    if (mode === 'policy-statute') ruleText = 'Validates exact statutory provisions of RTE Act 2009 or NEP 2020 frameworks.';
    if (mode === 'linguistic-syntax') ruleText = 'Tests linguistic grammar, literary figures of speech, or Cummins language theory.';

    setSimilarLogicNotice({
      sourceQuestionId: currentQuestion.id,
      targetQuestionId: chosen.id,
      modeLabel: getLogicModeLabel(mode),
      rule: ruleText,
    });
  };

  const handleJumpToQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (isNaN(num) || num < 1 || num > filteredQuestions.length) return;
    setCurrentIndex(num - 1);
    setUserSelectedOption(null);
    setJumpInput('');
  };

  const handleFetchAiBreakdown = async () => {
    if (!currentQuestion) return;
    setAiBreakdowns((prev) => ({
      ...prev,
      [currentQuestion.id]: { loading: true },
    }));

    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          selectedOption: activeSelection !== null ? String.fromCharCode(65 + activeSelection) : 'Not attempted',
          correctOption: String.fromCharCode(65 + currentQuestion.correctIndex),
          explanation: currentQuestion.explanation,
        }),
      });
      const data = await res.json();
      setAiBreakdowns((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          loading: false,
          text: data.deepExplanation || currentQuestion.explanation,
        },
      }));
    } catch (err) {
      setAiBreakdowns((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          loading: false,
          text: currentQuestion.explanation,
        },
      }));
    }
  };

  const handleNext = () => {
    if (!isPaid && usageCount >= questionLimit) {
      const nextIdx = currentIndex + 1;
      const nextQ = filteredQuestions[nextIdx];
      if (nextQ) {
        const attemptedIds = getAttemptedQuestionIds(userProfile);
        const isNextAttempted = Boolean(userProfile.completedQuestions[nextQ.id]) || attemptedIds.includes(nextQ.id);
        if (!isNextAttempted) {
          if (onOpenSubscribeForMore) {
            onOpenSubscribeForMore('practice');
          } else if (onOpenSubscription) {
            onOpenSubscription(currentStream);
          }
          return;
        }
      }
    }
    setUserSelectedOption(null);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setUserSelectedOption(null);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="practice-bank-container">
      {/* Header with Filters & Pool Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Updated Master Question Bank Pool</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300 shadow-2xs">
                {masterVaultTotal.toLocaleString()} Questions Master Vault
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                {streamTotalCount.toLocaleString()} in Active Stream
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Authentic official STET previous papers &amp; verified item banks: <strong className="text-indigo-900 font-bold">{masterVaultTotal.toLocaleString()} Master Vault</strong> (GT Humanities: {getStreamCount('gt-humanities')} items | GT Maths &amp; Science: {getStreamCount('gt-maths-science')} items | PRT: {getStreamCount('prt')} items).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Jump Input */}
            <form onSubmit={handleJumpToQuestion} className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 font-medium">Jump #</span>
              <input
                type="number"
                min={1}
                max={filteredQuestions.length}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={`1-${filteredQuestions.length}`}
                className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800 text-center font-bold"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 cursor-pointer"
              >
                Go
              </button>
            </form>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={instantFeedback}
                onChange={(e) => setInstantFeedback(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Instant Feedback</span>
            </label>
          </div>
        </div>

        {/* Restricted Course Access Banner for Paid Users */}
        {restrictedNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-start space-x-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">{restrictedNotice}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your active subscription grants unlimited access to your registered course. Other courses remain locked.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRestrictedNotice(null)}
              className="text-amber-700 hover:text-amber-900 font-black p-1 cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stream Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Target className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Active Stream:
          </span>
          {[
            { id: 'gt-humanities', label: 'GT - Humanities (1,223 Questions)' },
            { id: 'gt-maths-science', label: 'GT - Maths & Science (1,909 Questions)' },
            { id: 'prt', label: 'Primary Teacher (PRT - 1,264 Questions)' },
            { id: 'all', label: '🌟 All Streams & Master Vault (3,573 Questions)' },
          ].map((trk) => {
            const isSelected = currentStream === trk.id;
            const isLocked = trk.id !== 'all' && isCourseLockedForUser(userProfile, trk.id as ExamTrack);
            return (
              <button
                key={trk.id}
                onClick={() => {
                  if (isLocked) {
                    const subTitle = getSubscribedCourseTitle(userProfile.targetExam, userProfile.paidStreams);
                    setRestrictedNotice(`Restricted Course Access: You are SUBSCRIBED TO- "${subTitle}". Full access is granted to that specific course only. Rest of the courses remain inaccessible under your current plan.`);
                    return;
                  }
                  setRestrictedNotice(null);
                  setSelectedTrack(trk.id as ExamTrack | 'all');
                  if (onSelectExamTrack && trk.id !== 'all') {
                    onSelectExamTrack(trk.id as ExamTrack);
                  }
                  setSelectedCategory('All');
                  setSelectedYear('All');
                  setSelectedLogicMode('all');
                  setCurrentIndex(0);
                  setUserSelectedOption(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isLocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-amber-300'
                    : isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isLocked ? 'Course inaccessible under your current subscription' : undefined}
              >
                {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                <span>{trk.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                {isLocked && <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Locked</span>}
              </button>
            );
          })}
        </div>

        {/* Active Stream Note & Reset Option */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Practice Stream: <strong className="font-bold text-slate-900">{
                currentStream === 'all' ? 'All Streams Combined Master Vault (3,573 Questions)' :
                currentStream === 'gt-humanities' ? 'Graduate Teacher Humanities (1,223 Questions: Social Science, English & CDP)' :
                currentStream === 'gt-maths-science' ? 'Graduate Teacher Maths & Science (1,909 Questions)' :
                'Primary Teacher (PRT - 1,264 Questions)'
              }</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-600 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              Showing <strong>{filteredQuestions.length}</strong> of <strong>{streamTotalCount}</strong> questions
            </span>
            {(selectedCategory !== 'All' || selectedYear !== 'All' || selectedLogicMode !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedYear('All');
                  setSelectedLogicMode('all');
                  setCurrentIndex(0);
                  setUserSelectedOption(null);
                }}
                className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Show All {streamTotalCount} Qs
              </button>
            )}
          </div>
        </div>

        {/* Verified STET 2026 Master Item Bank Selector */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-slate-900">STET 2026 Verified Question Banks:</span>
              <span className="text-slate-600 ml-1.5 hidden sm:inline">Click to isolate verified items with answer keys</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {currentStream === 'gt-humanities' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('2026');
                  setSelectedCategory('SocialScience');
                  setSelectedLogicMode('all');
                  setCurrentIndex(0);
                  setUserSelectedOption(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedYear === '2026' && selectedCategory === 'SocialScience'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                🏛️ Social Science (400 Qs)
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedYear('2026');
                setSelectedCategory('English');
                setSelectedLogicMode('all');
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedYear === '2026' && selectedCategory === 'English'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              📖 English (250 Qs)
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedYear('2026');
                setSelectedCategory('CDP');
                setSelectedLogicMode('all');
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedYear === '2026' && selectedCategory === 'CDP'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              🧠 CDP (250 Qs)
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedYear('2026');
                setSelectedCategory('All');
                setSelectedLogicMode('all');
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedYear === '2026' && selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              🌟 All 2026 Items
            </button>

            {(selectedYear === '2026' || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('All');
                  setSelectedCategory('All');
                  setSelectedLogicMode('all');
                  setCurrentIndex(0);
                  setUserSelectedOption(null);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar 1: Subject Category */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Subject:
          </span>
          {availableSubjectCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-400 mx-2">|</span>
          <span className="text-xs font-bold text-slate-400 mr-1">Paper Year:</span>
          {(['All', '2026', '2025', '2024', '2023', '2022'] as ExamYear[]).map((yr) => (
            <button
              key={yr}
              onClick={() => {
                setSelectedYear(yr);
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {yr === 'All' ? 'All Papers' : `STET ${yr}`}
            </button>
          ))}
        </div>

        {/* Filter Bar 2: Logic-Based Question Creation Mode */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-indigo-700 mr-1 flex items-center bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <Cpu className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Logic Mode:
          </span>
          {[
            { id: 'all', label: 'All Logic Modes' },
            { id: 'assertion-reason', label: 'Assertion-Reason (A/R)' },
            { id: 'case-study', label: 'Classroom Case-Study' },
            { id: 'calculation', label: 'Longitude & Formulas' },
            { id: 'theorist-stage', label: 'Theorist & Stage Alignment' },
            { id: 'policy-statute', label: 'RTE & NEP Policy Logic' },
            { id: 'linguistic-syntax', label: 'Linguistic & Grammar' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedLogicMode(mode.id as LogicQuestionMode | 'all');
                setCurrentIndex(0);
                setUserSelectedOption(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                selectedLogicMode === mode.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Similar Logic Active Notification Banner */}
      {similarLogicNotice && (
        <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-emerald-50 p-4 rounded-2xl border border-violet-200 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shrink-0 mt-0.5">
              <Wand2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-violet-950 uppercase tracking-wide">
                  Similar Logic Creation Mode Active
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-violet-200 text-violet-800 text-[10px] font-bold">
                  {similarLogicNotice.modeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Switched to an isomorphic practice question. <strong>Underlying Logic Principle:</strong> {similarLogicNotice.rule}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSimilarLogicNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Free Question Limit Banner for Non-Subscribed Users */}
      {!isPaid && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
          usageCount >= questionLimit
            ? 'bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-rose-300'
            : 'bg-amber-50/90 border-amber-200/90'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              usageCount >= questionLimit ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                  {usageCount >= questionLimit 
                    ? `Free Usage Limit Reached (${questionLimit}/${questionLimit} Questions)` 
                    : `Free Usage: ${usageCount} / ${questionLimit} Questions Used`}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  usageCount >= questionLimit 
                    ? 'bg-rose-200 text-rose-950' 
                    : 'bg-amber-200 text-amber-950'
                }`}>
                  {usageCount >= questionLimit ? 'Limit Reached' : `${questionLimit - usageCount} Remaining`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {usageCount >= questionLimit
                  ? `You have reached the free limit of ${questionLimit} questions. Subscription is required to practice more questions.`
                  : `Free usage is limited to ${questionLimit} questions across Mock & Practice sections.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('practice') : onOpenSubscription?.(currentStream)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-1.5 shrink-0 border border-amber-400"
            id="practice-subscribe-for-more-banner-btn"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Subscribe for more..!!</span>
          </button>
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Top Bar: Question Index, Tags, Logic Mode & Bookmark */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                Question {currentIndex + 1} of {filteredQuestions.length}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                STET {currentQuestion.year} • Q{currentQuestion.questionNumber}
              </span>
              {currentQuestion.previousPaperSet && (
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
                  {currentQuestion.previousPaperSet}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200 flex items-center space-x-1">
                <Cpu className="w-3 h-3 mr-0.5 text-violet-600" />
                <span>{getLogicModeLabel(currentQuestion.logicMode)}</span>
              </span>
              {currentQuestion.isStetItemBankRef && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center space-x-1">
                  <Award className="w-3 h-3 mr-0.5 text-amber-600" />
                  <span>SCERT &amp; APU Item Bank Ref</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Similar Logic Question Trigger */}
              <button
                onClick={handleSpawnSimilarLogicQuestion}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Find or practice another question utilizing this exact cognitive logic structure"
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Practice Similar Logic</span>
              </button>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Save for Revision'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                onClick={() =>
                  onOpenTutor(
                    `Help me analyze Question ${currentQuestion.questionNumber} from STET ${currentQuestion.year} (Logic: ${getLogicModeLabel(currentQuestion.logicMode)}): "${currentQuestion.question}"`,
                    currentQuestion
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Reading Passage or Diagram if present */}
          {currentQuestion.passageText && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-slate-700 text-sm space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Passage Reference: {currentQuestion.passageTitle || 'Reading Comprehension'}</span>
              </div>
              <p className="italic leading-relaxed whitespace-pre-line font-serif text-slate-800">
                "{currentQuestion.passageText}"
              </p>
            </div>
          )}

          {currentQuestion.diagramDescription && (
            <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Visual Diagram Reference (Historical Paper):</strong> {currentQuestion.diagramDescription}
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-['Outfit']">
            {currentQuestion.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = activeSelection === idx;
              const isCorrectOpt = idx === currentQuestion.correctIndex;
              const showResult = isAnswered && instantFeedback;

              let optionStyle = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-700';

              if (showResult) {
                if (isCorrectOpt) {
                  optionStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = 'bg-rose-50/90 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                  badgeStyle = 'bg-rose-600 text-white';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 font-semibold';
                badgeStyle = 'bg-indigo-600 text-white';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeStyle}`}>
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base flex-1 pt-0.5">{option}</span>
                  {showResult && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {showResult && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Solution & Real-Time Feedback Card */}
          {isAnswered && instantFeedback && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Official Solution &amp; Exam Key</span>
                </div>
                <button
                  onClick={handleFetchAiBreakdown}
                  disabled={aiBreakdowns[currentQuestion.id]?.loading}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-indigo-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {aiBreakdowns[currentQuestion.id]?.loading
                      ? 'Analyzing with AI...'
                      : 'Deep Distractor Analysis'}
                  </span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <strong>Historical Exam Set:</strong> {currentQuestion.previousPaperSet || `STET ${currentQuestion.year} Paper`}
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span><strong>Cognitive Logic Mode:</strong> {getLogicModeLabel(currentQuestion.logicMode)}</span>
                  <button
                    onClick={handleSpawnSimilarLogicQuestion}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center"
                  >
                    <span>Practice Similar</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Official SCERT-APU Distractor Diagnostic Breakdown if available */}
              {currentQuestion.distractorRationales && currentQuestion.distractorRationales.length > 0 && (
                <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-linear-to-br from-indigo-50/90 via-slate-50 to-blue-50/80 border border-indigo-200/90 text-xs space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-indigo-950">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>SCERT &amp; APU Item Bank Diagnostic Distractor Rationale:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Why each option was formulated by item writers and what misconception it diagnoses:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {currentQuestion.distractorRationales.map((rationale, rIdx) => {
                      const letter = String.fromCharCode(65 + rIdx);
                      const isKey = rIdx === currentQuestion.correctIndex;
                      return (
                        <div
                          key={rIdx}
                          className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                            isKey
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                              : 'bg-white/90 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`px-1.5 py-0.5 rounded font-bold mr-1.5 text-[10px] ${
                            isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                          }`}>
                            Option {letter}
                          </span>
                          <span>{rationale}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Deep Breakdown if fetched */}
              {aiBreakdowns[currentQuestion.id]?.text && (
                <div className="mt-3 p-4 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs sm:text-sm text-indigo-950 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-indigo-900">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Senior Examiner Detailed Breakdown:</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-800 leading-relaxed font-mono text-xs">
                    {aiBreakdowns[currentQuestion.id]?.text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
              <button
                onClick={handleSpawnSimilarLogicQuestion}
                className="hidden sm:flex items-center space-x-1 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-md cursor-pointer"
                title="Next question with similar logic structure"
              >
                <Wand2 className="w-3 h-3" />
                <span>Next Similar Logic</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentIndex === filteredQuestions.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium">No questions matched the selected filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedYear('All');
              setSelectedLogicMode('all');
            }}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
