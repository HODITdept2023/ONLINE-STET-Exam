import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Target, 
  Flame, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileDown, 
  TrendingUp, 
  AlertTriangle,
  Award,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Key,
  Layers,
  Crown,
  GraduationCap,
  Users,
  Library,
  BrainCircuit,
  CreditCard,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Trophy,
  FileCheck,
  Globe,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Question, ExamTrack, SubjectCategory } from '../types';
import { HISTORICAL_EXAM_QUESTIONS, STUDY_GUIDES } from '../data/examQuestions';
import { firestoreSyncService } from '../services/firestoreSyncService';
import { downloadStudyGuidePDF } from '../utils/pdfGenerator';
import { getExamTrack, EXAM_TRACKS } from '../data/examTracks';
import { ExamTrackSelector } from './ExamTrackSelector';
import { DailyStreakTracker } from './DailyStreakTracker';
import { getAdvisoryMembers, getCouncilSettings, isUserCouncilMember } from '../utils/advisoryStorage';
import { 
  getQuestionsUsageCount, 
  hasReachedQuestionLimit, 
  isPaidOrAdmin, 
  FREE_TIER_QUESTION_LIMIT,
  getFreeTierQuestionLimit,
  getSubscribedCourseTitle,
  getUserSubscribedTrack,
  isAdminUser,
} from '../utils/storage';
import { clientSyncService } from '../services/clientSyncService';
import {
  userDataStore,
  STUDEEZONE_DATA_STORE_EVENT,
  STUDEEZONE_PROFILE_EVENT,
  STUDEEZONE_CLIENTS_EVENT,
  STUDEEZONE_SUBSCRIPTION_EVENT
} from '../utils/userDataStore';

interface DashboardViewProps {
  userProfile: UserProfile;
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor: (contextMsg?: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenFreeTrial?: () => void;
  onOpenProfile?: () => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
  onOpenSubscription?: (trackId?: ExamTrack) => void;
  onOpenSubscribeForMore?: (section?: 'practice' | 'mock-tests' | 'general') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  onNavigate,
  onOpenTutor,
  onOpenAuth,
  onOpenFreeTrial,
  onOpenProfile,
  onSelectExamTrack,
  onOpenSubscription,
  onOpenSubscribeForMore,
}) => {
  // Collapsible sections to save space and keep landing page clean
  const [academicHubTab, setAcademicHubTab] = useState<'item-bank' | 'academic-council' | 'guides' | 'adaptive'>('item-bank');
  const isCouncil = isUserCouncilMember(userProfile);
  const [isItemBankCollapsed, setIsItemBankCollapsed] = useState<boolean>(true);
  const [isSubjectMasteryCollapsed, setIsSubjectMasteryCollapsed] = useState<boolean>(true);
  const [isAdaptivePathCollapsed, setIsAdaptivePathCollapsed] = useState<boolean>(true);
  const [, setAdvisoryUpdateTick] = useState<number>(0);

  useEffect(() => {
    const handleAdvisoryUpdate = () => {
      setAdvisoryUpdateTick((prev) => prev + 1);
    };
    window.addEventListener('studeezone_advisory_updated', handleAdvisoryUpdate);
    window.addEventListener('studeezone_council_settings_updated', handleAdvisoryUpdate);
    window.addEventListener('studeezone_clients_updated', handleAdvisoryUpdate);
    window.addEventListener('studeezone_users_updated', handleAdvisoryUpdate);
    window.addEventListener('studeezone_profile_updated', handleAdvisoryUpdate);
    window.addEventListener('storage', handleAdvisoryUpdate);

    return () => {
      window.removeEventListener('studeezone_advisory_updated', handleAdvisoryUpdate);
      window.removeEventListener('studeezone_council_settings_updated', handleAdvisoryUpdate);
      window.removeEventListener('studeezone_clients_updated', handleAdvisoryUpdate);
      window.removeEventListener('studeezone_users_updated', handleAdvisoryUpdate);
      window.removeEventListener('studeezone_profile_updated', handleAdvisoryUpdate);
      window.removeEventListener('storage', handleAdvisoryUpdate);
    };
  }, []);
  const [freeQuestionLimit, setFreeQuestionLimit] = useState<number>(() => getFreeTierQuestionLimit());

  useEffect(() => {
    const handleLimitUpdate = () => {
      setFreeQuestionLimit(getFreeTierQuestionLimit());
    };
    window.addEventListener('studeezone_free_limit_updated', handleLimitUpdate);
    return () => window.removeEventListener('studeezone_free_limit_updated', handleLimitUpdate);
  }, []);

  const [isStudyGuidesCollapsed, setIsStudyGuidesCollapsed] = useState<boolean>(true);

  // Resolve active exam track with instant-feedback local state
  const isLoggedIn = Boolean(
    userProfile &&
    userProfile.isLoggedIn &&
    (userProfile.email?.trim() || userProfile.loginId?.trim()) &&
    userProfile.name !== 'Candidate Learner'
  );
  const userLower = `${userProfile.name || ''} ${userProfile.email || ''} ${userProfile.loginId || ''}`.toLowerCase();
  const isSpecialCandidate = isLoggedIn && (userLower.includes('asha') || userLower.includes('prasad') || userLower.includes('shanti') || userLower.includes('subba'));
  const isSuperAdmin = isLoggedIn && (isAdminUser(userProfile.email) || userProfile.role === 'admin');
  const isPaid = isLoggedIn && (isPaidOrAdmin(userProfile) || isSpecialCandidate);
  const isPaidCandidate = isPaid && !isSuperAdmin;
  const subscribedTrack: ExamTrack = isSpecialCandidate ? 'gt-maths-science' : getUserSubscribedTrack(userProfile);
  const subscribedCourseTitle = getSubscribedCourseTitle(subscribedTrack);
  const [restrictedTrackNotice, setRestrictedTrackNotice] = useState<string | null>(null);

  const [localTrackId, setLocalTrackId] = useState<ExamTrack>(() => {
    if (isSpecialCandidate) return 'gt-maths-science';
    if (isPaidCandidate) return subscribedTrack;
    return userProfile.selectedExamTrack 
      ? userProfile.selectedExamTrack 
      : userProfile.targetExam?.toLowerCase().includes('math') || userProfile.targetExam?.toLowerCase().includes('science')
      ? 'gt-maths-science'
      : userProfile.targetExam?.toLowerCase().includes('primary') || userProfile.targetExam?.toLowerCase().includes('prt')
      ? 'prt'
      : 'gt-humanities';
  });

  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncBanner, setSyncBanner] = useState<string | null>(null);

  const handleForceGlobalSync = async () => {
    if (isSyncingGlobal) return;
    setIsSyncingGlobal(true);
    setSyncBanner(null);
    try {
      const res = await firestoreSyncService.forceGlobalSync();
      setSyncBanner(
        res.success
          ? `Global Sync Complete: Cleared local question & profile caches, deep-fetched ${res.clientsCount} accounts and forced consistency with Cloud Firestore.`
          : res.message
      );
      setTimeout(() => setSyncBanner(null), 6000);
    } catch {
      setSyncBanner('Global Sync interrupted. Please check network.');
      setTimeout(() => setSyncBanner(null), 6000);
    } finally {
      setIsSyncingGlobal(false);
    }
  };

  useEffect(() => {
    clientSyncService.syncAll().catch(() => {});
  }, []);

  // Synchronize localTrackId whenever track or subscription state changes
  useEffect(() => {
    let target: ExamTrack = 'prt';
    if (isSpecialCandidate) {
      target = 'gt-maths-science';
    } else if (isPaidCandidate) {
      target = subscribedTrack;
    } else if (userProfile.selectedExamTrack) {
      target = userProfile.selectedExamTrack;
    } else if (userProfile.targetExam) {
      const lower = userProfile.targetExam.toLowerCase();
      if (lower.includes('math') || lower.includes('science')) {
        target = 'gt-maths-science';
      } else if (lower.includes('humanities') || lower.includes('social')) {
        target = 'gt-humanities';
      } else {
        target = 'prt';
      }
    }
    setLocalTrackId((prev) => (prev === target ? prev : target));
  }, [
    userProfile.selectedExamTrack,
    userProfile.targetExam,
    userProfile.isPaid,
    userProfile.role,
    isSpecialCandidate,
    isPaidCandidate,
    subscribedTrack,
  ]);

  // Requirement: Paid candidate gets full access to that specific course only; rest remain inaccessible
  const activeTrackId: ExamTrack = isPaidCandidate
    ? subscribedTrack
    : (userProfile.selectedExamTrack || localTrackId);
  const activeTrackInfo = getExamTrack(activeTrackId);

  const handleSelectTrack = (trackId: ExamTrack) => {
    if (isPaidCandidate && trackId !== subscribedTrack) {
      setRestrictedTrackNotice(
        `Restricted Course Access: You are SUBSCRIBED TO- "${subscribedCourseTitle}". You have full access to that specific course only. Rest of the courses remain inaccessible under your current plan.`
      );
      return;
    }
    setRestrictedTrackNotice(null);
    setLocalTrackId(trackId);
    if (onSelectExamTrack) {
      onSelectExamTrack(trackId);
    }
  };

  const trackQuestions = HISTORICAL_EXAM_QUESTIONS.filter(
    (q) => !q.examTracks || q.examTracks.includes(activeTrackId)
  );
  const totalQuestionsInTrack = trackQuestions.length;

  const completedEntries = Object.entries(userProfile.completedQuestions) as Array<[
    string,
    { selected: number; isCorrect: boolean; timestamp: number }
  ]>;
  const trackCompletedEntries = completedEntries.filter(([qId]) =>
    trackQuestions.some((tq) => tq.id === qId)
  );
  const totalAttempted = trackCompletedEntries.length;
  const totalCorrect = trackCompletedEntries.filter(([_, e]) => e.isCorrect).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Category statistics helper scoped strictly to active track questions
  const getCatStats = (category: SubjectCategory) => {
    const total = trackQuestions.filter((q) => q.category === category).length;
    const solved = trackQuestions.filter(
      (q) => q.category === category && userProfile.completedQuestions[q.id]
    );
    const correct = solved.filter((q) => userProfile.completedQuestions[q.id]?.isCorrect).length;
    const accuracy = solved.length > 0 ? Math.round((correct / solved.length) * 100) : 0;
    return { total, solvedCount: solved.length, accuracy };
  };

  // Track-specific diagnostic focus areas
  const trackDiagnosticTopics: Record<ExamTrack, string[]> = {
    'prt': [
      'Piaget vs Vygotsky Cognitive Stages & Moral Development',
      'Sikkim Biodiversity, Monasteries & Pastoral Dokpas',
      "Euler's Polyhedron Formula & Perimeter Invariance"
    ],
    'gt-maths-science': [
      'Work-Energy Theorem & Thin Lens Ray Optics',
      'Perpendicular Slopes (m₁m₂ = -1) & Quadratic Discriminant',
      'Adolescent Development & Gardner Multiple Intelligences'
    ],
    'gt-humanities': [
      'Indian Constitution: Article 32 & 226 Supreme Court Writs',
      'Longitudes & Local Time Math (15° = 1 Hour Difference)',
      'Sikkim History: 1642 Yuksom Consecration & Namgyals'
    ]
  };
  const activeDiagnosticTopics = trackDiagnosticTopics[activeTrackId] || trackDiagnosticTopics['gt-humanities'];

  // Estimated Readiness Score based on accuracy & mock tests
  const readinessScore = Math.min(
    98,
    Math.max(45, Math.round(overallAccuracy * 0.75 + userProfile.mockTestResults.length * 4 + userProfile.streakDays * 1.2))
  );

  const questionsUsed = getQuestionsUsageCount(userProfile);
  const isLimitReached = hasReachedQuestionLimit(userProfile);

  return (
    <div className="space-y-6 pb-12" id="dashboard-view-container">
      {/* USER REQUESTED: You are SUBSCRIBED TO - "course" Banner for Paid Pro Access - visible only to logged-in paid candidate users */}
      {isLoggedIn && isPaid && !isSuperAdmin && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-2 border-emerald-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden" id="dashboard-subscribed-course-banner">
          <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/40 uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>PRO PAID ACCESS ACTIVE</span>
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  • Course Access Unlocked
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white tracking-tight">
                You are SUBSCRIBED TO- "{subscribedCourseTitle}"
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Full access is granted to that specific course only. Rest of the courses remain inaccessible under this subscription plan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('practice')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Practice Subscribed Course</span>
              </button>
              <button
                onClick={() => onNavigate('mock-tests')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center space-x-1.5 border border-indigo-400/30"
              >
                <Target className="w-4 h-4 text-amber-300" />
                <span>Start Mock Tests</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restricted Track Notice Banner */}
      {restrictedTrackNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-950">{restrictedTrackNotice}</p>
              <p className="text-xs text-amber-800 mt-1">
                Your subscription provides complete, unrestricted access exclusively to your enrolled course. All test materials, grand mocks, and practice modules for your course are fully unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRestrictedTrackNotice(null)}
            className="text-amber-700 hover:text-amber-950 font-black p-1 text-sm cursor-pointer"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Question Usage / Free Tier Limit Banner for Non-Paid Users */}
      {!isPaid && (
        <div className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs ${
          isLimitReached 
            ? 'bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-rose-300' 
            : 'bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-amber-300/70'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl bg-white border flex items-center justify-center p-1 shrink-0 shadow-xs ${
              isLimitReached ? 'border-rose-200 text-rose-800' : 'border-amber-200 text-amber-800'
            }`}>
              <img
                src="/studeezone-icon.svg"
                alt="studeezone.com icon"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>{isLimitReached ? `Free Usage Limit Reached (${questionsUsed}/${freeQuestionLimit} Qs)` : `Free Usage: ${questionsUsed}/${freeQuestionLimit} Questions Used`}</span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isLimitReached 
                      ? 'text-rose-900 bg-rose-200 border-rose-300' 
                      : 'text-amber-900 bg-amber-200 border-amber-300'
                  }`}>
                    {isLimitReached ? 'Limit Reached' : `${Math.max(0, freeQuestionLimit - questionsUsed)} Left`}
                  </span>
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isLimitReached 
                  ? `The trial period is over. You have completed all ${freeQuestionLimit} free practice & mock questions. Subscribe for more to unlock full 3,500+ questions and master mock tests!`
                  : `The trial period is over. Usage is capped at ${freeQuestionLimit} questions across Mock & Practice sections. Following ${freeQuestionLimit} questions, subscription is required.`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('general') : onOpenSubscription?.()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs flex items-center space-x-1.5 border border-amber-300"
              id="banner-subscribe-now-btn"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Subscribe for more..!!</span>
            </button>
            {!userProfile.isLoggedIn && (
              <>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Register Free
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Adaptive STET Exam Roadmap Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
              {userProfile.isLoggedIn ? `Welcome back, ${userProfile.name}!` : 'Welcome, Aspirant!'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your personalized prep engine for <strong className="text-white">{activeTrackInfo.title}</strong>. 
              Reviewing historical questions from STET 2026, 2025 &amp; 2024 with instant diagnostic feedback.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span><strong>{userProfile.streakDays} Days</strong> Streak</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                <span><strong>{userProfile.totalXp} XP</strong> Earned</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span><strong>{userProfile.dailyStudyMinutes} mins</strong> Logged Today</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={handleForceGlobalSync}
                disabled={isSyncingGlobal}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/60 border border-blue-400/50 text-blue-200 hover:text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
                title="Force Global Sync: Clears local question bank & profile caches, then deep-fetches from Cloud Firestore"
                id="dashboard-force-global-sync-btn"
              >
                <Globe className={`w-3.5 h-3.5 text-cyan-300 ${isSyncingGlobal ? 'animate-spin' : ''}`} />
                <span>{isSyncingGlobal ? 'Deep Syncing...' : 'Force Global Sync'}</span>
              </button>
            </div>
            {syncBanner && (
              <div className="w-full mt-3 p-3 rounded-xl bg-blue-500/20 border border-blue-400/50 text-blue-100 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span>{syncBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncBanner(null)}
                  className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Bold Primary Subscribe Now Button */}
            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer border-2 border-amber-300 transform hover:scale-[1.02] active:scale-95"
                id="dashboard-hero-subscribe-now-btn"
              >
                <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span className="font-extrabold tracking-wide uppercase">Subscribe Now</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            )}

            <button
              onClick={() => onNavigate('mock-tests')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/50 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              id="start-mock-test-quick-btn"
            >
              <Target className="w-4 h-4 text-amber-300" />
              <span>Launch Timed Mock Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenTutor('I would like to review my weakest exam topics and get custom practice recommendations.')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              id="ask-tutor-quick-btn"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>24/7 Ask Lama</span>
            </button>

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                id="dashboard-open-profile-btn"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Profile &amp; Change Password</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Exam Track Switcher */}
      <ExamTrackSelector
        currentTrackId={activeTrackId}
        onSelectTrack={handleSelectTrack}
        onNavigateToPractice={() => onNavigate('practice')}
        userProfile={userProfile}
        onOpenSubscriptionForTrack={(trackId) => {
          if (onOpenSubscription) onOpenSubscription(trackId);
        }}
      />

      {/* Bold Subscription & Payment Page Card */}
      {onOpenSubscription && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-indigo-500/10 border-2 border-amber-400/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                  STET Pro Pass: ₹499 Per Stream
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-200 text-amber-900 border border-amber-300 uppercase tracking-wide">
                  Instant UPI QR &amp; Activation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Unlock full 120-question grand mock papers, topic analytics, full downloadable answer keys, and unlimited 24/7 Ask Lama mentor explanations for your chosen stream.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={onOpenSubscription}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-400 transform hover:scale-[1.02] active:scale-95"
              id="dashboard-pro-subscribe-now-btn"
            >
              <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span className="font-extrabold uppercase tracking-wide text-slate-950">Subscribe Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* USER REQUESTED: Daily Learning Streak Tracker highlighting consecutive days of mock tests / practice */}
      <DailyStreakTracker
        userProfile={userProfile}
        onNavigate={onNavigate}
        onOpenSubscription={onOpenSubscription}
      />

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Exam Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {readinessScore}%
            </span>
            <span className="text-xs font-bold text-emerald-600">High Probability</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on accuracy &amp; past exam thresholds</p>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {overallAccuracy}%
            </span>
            <span className="text-xs text-slate-500">{totalCorrect}/{totalAttempted} Correct</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${overallAccuracy}%` }}></div>
          </div>
        </div>

        {/* Historical Questions Solved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Questions Solved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {totalAttempted}
            </span>
            <span className="text-xs text-slate-500">of {totalQuestionsInTrack} Track Qs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Authentic {activeTrackInfo.title}</p>
        </div>

        {/* Mock Tests Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mock Tests Taken</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {userProfile.mockTestResults.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Avg ~82%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full-length pattern tests</p>
        </div>
      </div>

      {/* 2. Historical Exam Subject Mastery (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all" id="dashboard-subject-mastery-collapsible">
        <div 
          onClick={() => setIsSubjectMasteryCollapsed(!isSubjectMasteryCollapsed)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] truncate">
                  Historical Exam Subject Mastery
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  {activeTrackInfo.subjects.length} Subjects • {overallAccuracy}% Overall
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Syllabus mastery tracking across {activeTrackInfo.title} ({totalAttempted}/{totalQuestionsInTrack} solved)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
              {isSubjectMasteryCollapsed ? 'Show Subjects' : 'Collapse'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              {isSubjectMasteryCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {!isSubjectMasteryCollapsed && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Mapped against standard syllabus patterns of STET &amp; Teacher Eligibility Exams
              </p>
              <button
                onClick={() => onNavigate('practice')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>Practice All Subjects</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {activeTrackInfo.subjects.map((sub) => {
                const stats = getCatStats(sub.category);
                const badgeMap: Record<string, string> = {
                  CDP: 'CDP',
                  SocialScience: 'SOC',
                  English: 'ENG',
                  MathsScience: 'STEM',
                  Maths: 'MATH',
                  EVS: 'EVS',
                };
                const colorClasses = 
                  sub.category === 'CDP' ? { bgBadge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-600' } :
                  sub.category === 'SocialScience' ? { bgBadge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-600' } :
                  sub.category === 'English' ? { bgBadge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' } :
                  sub.category === 'Maths' ? { bgBadge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-600' } :
                  sub.category === 'EVS' ? { bgBadge: 'bg-teal-100 text-teal-700', bar: 'bg-teal-600' } :
                  { bgBadge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-600' };

                return (
                  <div 
                    key={sub.category} 
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('practice', { topicFilter: sub.category })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-lg ${colorClasses.bgBadge} flex items-center justify-center font-bold text-xs shrink-0`}>
                          {badgeMap[sub.category] || 'SUB'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{sub.name}</h4>
                            <span className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center">
                              Drill <ChevronRight className="w-3 h-3 ml-0.5" />
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {sub.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">{stats.accuracy}%</span>
                        <p className="text-[10px] text-slate-400">{stats.solvedCount}/{stats.total}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`${colorClasses.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${stats.accuracy}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Adaptive Study Path (Collapsible) */}
      <div className="bg-gradient-to-b from-indigo-50/60 to-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden transition-all" id="dashboard-adaptive-path-collapsible">
        <div 
          onClick={() => setIsAdaptivePathCollapsed(!isAdaptivePathCollapsed)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-indigo-50/40 transition-colors"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] truncate">
                  Adaptive Study Path
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                  {activeDiagnosticTopics.length} Focus Gaps
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Personalized conceptual remediation based on your diagnostic mock test performance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
              {isAdaptivePathCollapsed ? 'Show Remediation' : 'Collapse'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100/60 flex items-center justify-center text-indigo-700">
              {isAdaptivePathCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {!isAdaptivePathCollapsed && (
          <div className="p-5 sm:p-6 border-t border-indigo-100 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Our diagnostic algorithm identified 3 conceptual gaps from your mock test attempts:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeDiagnosticTopics.map((topic, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Focus Area #{idx + 1}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Priority High</span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{topic}</h5>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate('practice', { topicFilter: topic })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Drill 5 Qs</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenTutor(`Can you explain the core concepts and exam rules for "${topic}" in STET exams?`)}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 underline cursor-pointer"
                    >
                      Ask Tutor
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate('adaptive')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>View Full Adaptive Syllabus</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Online Study Guides & Core Revision Sheets (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all" id="dashboard-study-guides-collapsible">
        <div 
          onClick={() => setIsStudyGuidesCollapsed(!isStudyGuidesCollapsed)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] truncate">
                  Core Study Guides &amp; Key Revision Sheets
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  Read Online Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Exam-focused revision cheat-sheets with formulas, theorist summaries, and mnemonics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
              {isStudyGuidesCollapsed ? 'Show Cheat Sheets' : 'Collapse'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              {isStudyGuidesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {!isStudyGuidesCollapsed && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-slate-500">
                Exam-focused revision cheat-sheets with formulas, theorist summaries, and mnemonics (read online mode active).
              </p>
              <button
                onClick={() => onNavigate('study-guides')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Browse All Guides</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {STUDY_GUIDES.filter((guide) => !guide.examTracks || guide.examTracks.includes(activeTrackId)).slice(0, 3).map((guide) => (
                <div 
                  key={guide.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 bg-slate-50/40"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {guide.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {guide.readMinutes} min read
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {guide.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => onNavigate('study-guides')}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                      id={`read-online-guide-btn-${guide.id}`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Read Guide Online</span>
                    </button>
                    <button
                      disabled
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-[11px] font-medium flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-75"
                      title="PDF download option is disabled"
                    >
                      <FileDown className="w-3 h-3 text-slate-400" />
                      <span>PDF Download Disabled</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Mock Test History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
            Recent Interactive Mock Tests
          </h3>
          <button
            onClick={() => onNavigate('mock-tests')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Take New Mock Test</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {userProfile.mockTestResults.map((res) => (
            <div key={res.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{res.title}</h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span>{res.date}</span>
                    <span>•</span>
                    <span>Duration: {Math.round(res.timeTakenSeconds / 60)} mins</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">
                    {res.score}/{res.totalQuestions}
                  </span>
                  <span className="block text-[11px] font-bold text-emerald-600">
                    {res.accuracy}% Accuracy
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Board & Authors Spotlight Card */}
      {(() => {
        const councilSettings = getCouncilSettings();
        const showMembers = councilSettings.showCouncilMembersSection;
        const advisoryList = showMembers ? getAdvisoryMembers().filter((m) => m.active !== false) : [];
        const featuredList = advisoryList.filter((m) => m.featured);
        const displayList = (featuredList.length > 0 ? featuredList : advisoryList).slice(0, 3);

        return (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden" id="dashboard-advisory-spotlight">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/30">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>ACADEMIC GOVERNANCE COUNCIL</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                  Guided by Distinguished Pedagogy Fellows &amp; Authors
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl">
                  Every Sikkim STET mock question, Bloom's cognitive calibration, and curriculum note is authored and vetted by state educators, former SCERT consultants, and academic council scholars.
                </p>
              </div>

              <button
                onClick={() => onNavigate('advisory')}
                className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                id="dashboard-explore-advisory-btn"
              >
                <span>View Full Council</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {displayList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                {displayList.map((fellow) => (
                  <div
                    key={fellow.id}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-amber-400/50 transition-colors flex items-start space-x-3.5"
                  >
                    {fellow.avatarUrl ? (
                      <img
                        src={fellow.avatarUrl}
                        alt={fellow.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {fellow.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide truncate">
                        {fellow.roleTitle}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {fellow.honorific ? `${fellow.honorific} ` : ''}{fellow.name}
                      </h4>
                      <p className="text-[11px] text-indigo-200/80 truncate">
                        {fellow.affiliation}
                      </p>
                      <div className="text-[10px] text-slate-300 mt-1 line-clamp-1 italic">
                        "{fellow.bio}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 text-xs">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wide">
                    Psychometric Rigor
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">Item Stem Verification</h4>
                  <p className="text-[11px] text-indigo-200/80 mt-0.5">
                    Bloom's cognitive calibrations &amp; zero-ambiguity distractor vetting
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wide">
                    Syllabus Fidelity
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">NCTE &amp; NEP 2020 Benchmarks</h4>
                  <p className="text-[11px] text-indigo-200/80 mt-0.5">
                    Curricular mapping for Sikkim STET Paper I (PRT) &amp; Paper II (GT)
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wide">
                    Academic Integrity
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">Directory Kept Clear</h4>
                  <p className="text-[11px] text-indigo-200/80 mt-0.5">
                    Zero fake entries — contributing fellows listed strictly upon formal audit
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* USER REQUESTED: Academic Council & Syllabus Architecture / STET Academic Framework & Learning Hub - Pushed to Bottom of Dashboard */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden" id="home-academic-framework-section">
        {/* Section Header with Fluid Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 uppercase tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Academic Council &amp; Syllabus Architecture</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] text-white">
                STET Academic Framework &amp; Learning Hub
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                The authoritative psychometric reference, distinguished advisory board, high-yield study guides, and state percentile trajectory.
              </p>
            </div>
            {isCouncil ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black self-start sm:self-auto shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Council Member Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium self-start sm:self-auto shrink-0">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Candidate Portal</span>
              </span>
            )}
          </div>

          {/* 4 Interactive Navigation Tabs / Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5" role="tablist">
            {/* Button 1: ITEM BANK */}
            <button
              role="tab"
              aria-selected={academicHubTab === 'item-bank'}
              onClick={() => setAcademicHubTab('item-bank')}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                academicHubTab === 'item-bank'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${academicHubTab === 'item-bank' ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-white'}`}>
                  <Award className="w-4 h-4" />
                </div>
                {isCouncil ? (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${academicHubTab === 'item-bank' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    Verified
                  </span>
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center space-x-0.5 ${academicHubTab === 'item-bank' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400/20 text-amber-300'}`}>
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Council
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="block text-xs font-black uppercase tracking-wide">1. ITEM BANK</span>
                <span className={`text-[11px] line-clamp-1 ${academicHubTab === 'item-bank' ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                  Framing Guidelines
                </span>
              </div>
            </button>

            {/* Button 2: ACADEMIC COUNCIL */}
            <button
              role="tab"
              aria-selected={academicHubTab === 'academic-council'}
              onClick={() => setAcademicHubTab('academic-council')}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                academicHubTab === 'academic-council'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${academicHubTab === 'academic-council' ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-white'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${academicHubTab === 'academic-council' ? 'bg-slate-950 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                  Advisory
                </span>
              </div>
              <div className="mt-3">
                <span className="block text-xs font-black uppercase tracking-wide">2. ACADEMIC COUNCIL</span>
                <span className={`text-[11px] line-clamp-1 ${academicHubTab === 'academic-council' ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                  Board &amp; Authors
                </span>
              </div>
            </button>

            {/* Button 3: GUIDES */}
            <button
              role="tab"
              aria-selected={academicHubTab === 'guides'}
              onClick={() => setAcademicHubTab('guides')}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                academicHubTab === 'guides'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${academicHubTab === 'guides' ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-white'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${academicHubTab === 'guides' ? 'bg-slate-950 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  Revision
                </span>
              </div>
              <div className="mt-3">
                <span className="block text-xs font-black uppercase tracking-wide">3. STUDY GUIDES</span>
                <span className={`text-[11px] line-clamp-1 ${academicHubTab === 'guides' ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                  High-Yield Notes
                </span>
              </div>
            </button>

            {/* Button 4: ADAPTIVE & RANKS */}
            <button
              role="tab"
              aria-selected={academicHubTab === 'adaptive'}
              onClick={() => setAcademicHubTab('adaptive')}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                academicHubTab === 'adaptive'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${academicHubTab === 'adaptive' ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-white'}`}>
                  <Compass className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${academicHubTab === 'adaptive' ? 'bg-slate-950 text-amber-300' : 'bg-violet-500/20 text-violet-300'}`}>
                  Ranks &amp; Path
                </span>
              </div>
              <div className="mt-3">
                <span className="block text-xs font-black uppercase tracking-wide">4. ADAPTIVE &amp; RANKS</span>
                <span className={`text-[11px] line-clamp-1 ${academicHubTab === 'adaptive' ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                  Roadmap &amp; Standings
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Detail Pane */}
        <div className="p-5 sm:p-6 bg-slate-50/70">
          {/* TAB 1: ITEM BANK */}
          {academicHubTab === 'item-bank' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wide">
                      SCERT Sikkim Standard
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">15 Exemplars • 10 Framing Rules • Question Auditor Studio</span>
                  </div>
                  {isCouncil ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Council Member Access Granted</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center space-x-1.5 border border-rose-200">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>TO BE ACCESSIBLE ONLY FOR COUNCIL MEMBERS</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 font-['Outfit']">
                    STET Item Bank &amp; Question Framing Guidelines
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                    The foundational psychometric blueprint for the Sikkim Teacher Eligibility Test (STET Paper I &amp; Paper II). This repository acts as the authoritative reference for framing exam items, mastering distractor diagnostic rationales, and eliminating flawed question designs.
                  </p>
                </div>

                {!isCouncil ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-sm text-rose-950">
                        Council Membership Restriction
                      </p>
                      <p className="leading-relaxed">
                        Access to this psychometric repository is strictly restricted to inducted members of the Academic Council, Advisory Board, and authorized contributing authors. Candidates may view the access gate or apply for fellowship appointment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-sm text-emerald-950">
                        Council Member Privileges Active
                      </p>
                      <p className="leading-relaxed">
                        You have full authorization to view official psychometric exemplars, inspect cognitive distractor rationales, and run the real-time Question Framing Auditor.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('item-bank')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Library className="w-4 h-4" />
                    <span>{isCouncil ? 'Open Item Bank & Framing Studio' : 'Enter Item Bank (Council Verification)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('fellowship-application')}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Apply for Fellowship Induction</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC COUNCIL */}
          {academicHubTab === 'academic-council' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wide">
                      Advisory Board / Academic Council page
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Distinguished Educators &amp; Cognitive Psychologists</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                    NCTE &amp; SCERT Fidelity
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 font-['Outfit']">
                    Advisory Board / Academic Council
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                    Distinguished Advisory Board &amp; Contributing Authors — The intellectual backbone of studeezone.com. Our council brings together esteemed teacher-educators, former SCERT consultants, cognitive psychologists, and subject-matter authors to uphold rigorous psychometric standards and syllabus fidelity for the Sikkim Teacher Eligibility Test (STET).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Executive Leadership</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Former SCERT consultants &amp; senior education faculty steering content rigor.</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-xs mb-1">
                      <FileCheck className="w-4 h-4" />
                      <span>Contributing Authors</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Curating verified high-yield MCQs for PRT, GT Maths-Science &amp; GT Humanities.</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs mb-1">
                      <Award className="w-4 h-4" />
                      <span>Fellowship Program</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Open applications for distinguished educators to earn council credentials.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('advisory')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Academic Council &amp; Contributing Authors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('fellowship-application')}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Apply for Academic Fellowship</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY GUIDES */}
          {academicHubTab === 'guides' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wide">
                      High-Yield Master Notes
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Child Development • Environmental Studies • Sikkim History</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    Read Online Mode • PDF Download Disabled
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 font-['Outfit']">
                    STET High-Yield Concept Summaries &amp; Syllabus Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                    Master essential pedagogical concepts, Piaget and Vygotsky cognitive frameworks, Sikkim state environmental flora, and constitutional articles with high-retention structured study notes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('study-guides')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open All Study Guides &amp; Notes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADAPTIVE ROADMAP & RANKS */}
          {academicHubTab === 'adaptive' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 text-xs font-black uppercase tracking-wide">
                      Adaptive Roadmap &amp; State Ranks
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Personalized Mastery &amp; Peer Standings</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                    Live Statewide Standings
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 font-['Outfit']">
                    Adaptive Learning Trajectory &amp; Sikkim State Standings
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                    Dynamic question difficulty recalibrated automatically based on your real-time performance, paired with statewide leaderboard standings across PRT and Graduate Teacher candidates.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('adaptive')}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Launch Adaptive Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('leaderboard')}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>View Statewide Ranks</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
