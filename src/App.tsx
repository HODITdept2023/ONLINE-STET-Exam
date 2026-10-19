import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Users, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  HelpCircle,
  Flame,
  CheckCircle2,
  Lock,
  PowerOff
} from 'lucide-react';
import { UserProfile, Question, RegisteredUser, ExamTrack } from './types';
import { loadUserProfile, saveUserProfile, initAuthAndClientSync } from './utils/storage';
import { clientSyncService } from './services/clientSyncService';
import { firestoreSyncService } from './services/firestoreSyncService';
import { isBrowserOffline, cacheCriticalStateToSW } from './utils/serviceWorkerRegistration';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PracticeQuestionsView } from './components/PracticeQuestionsView';
import { MockTestView } from './components/MockTestView';
import { AdaptivePathView } from './components/AdaptivePathView';
import { StudyGuidesView } from './components/StudyGuidesView';
import { PerformanceAnalyticsView } from './components/PerformanceAnalyticsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminPanelView } from './components/AdminPanelView';
import { AdvisoryBoardView } from './components/AdvisoryBoardView';
import { FellowshipApplicationView } from './components/FellowshipApplicationView';
import { AboutMissionView } from './components/AboutMissionView';
import { StetItemBankView } from './components/StetItemBankView';
import { ChatTutorModal } from './components/ChatTutorModal';
import { AuthModal } from './components/AuthModal';
import { SubscribeForMoreModal } from './components/SubscribeForMoreModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Footer } from './components/Footer';
import { initCounterTracker } from './utils/counterTracker';
import { Shield, GraduationCap, Compass } from 'lucide-react';
import { 
  isAdminUser, 
  getQuestionsUsageCount, 
  isPaidOrAdmin, 
  canAccessExamTrack, 
  getUserSubscribedTrack, 
  getSubscribedCourseTitle,
  getAllClients,
  getExamTrackFromTarget,
  getClientAllocatedTrack,
  DEFAULT_USER_PROFILE,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY
} from './utils/storage';

function parseTabFromUrl(): { tab: string; isDirectAcademicLink: boolean; initialSubTab?: 'logins' | 'clients' | 'payment' | 'advisory' | 'form-submissions' | 'fellowship-applications' | 'credits' | 'about-mission' } {
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('view') || params.get('page');
    const subtabParam = params.get('subtab') || params.get('sub');
    const hash = window.location.hash.replace(/^#/, '');

    if (
      subtabParam === 'fellowship-applications' ||
      subtabParam === 'fellowship' ||
      tabParam === 'fellowship-admin' ||
      tabParam === 'admin-fellowship'
    ) {
      return { tab: 'admin', isDirectAcademicLink: false, initialSubTab: 'fellowship-applications' };
    }

    if (
      subtabParam === 'about-mission' ||
      subtabParam === 'mission' ||
      subtabParam === 'vision' ||
      subtabParam === 'about'
    ) {
      return { tab: 'admin', isDirectAcademicLink: false, initialSubTab: 'about-mission' };
    }

    const checkValue = (val: string | null): string | null => {
      if (!val) return null;
      const lower = val.toLowerCase().trim();
      if (
        lower === 'academic-board' ||
        lower === 'fellowship' ||
        lower === 'fellowship-application' ||
        lower === 'join-academic-board' ||
        lower === 'academic-fellowship' ||
        lower === 'board-application'
      ) {
        return 'fellowship-application';
      }
      if (
        lower === 'advisory' ||
        lower === 'advisory-board' ||
        lower === 'academic-council' ||
        lower === 'advisory-council'
      ) {
        return 'advisory';
      }
      if (
        lower === 'about' ||
        lower === 'about-us' ||
        lower === 'about-mission' ||
        lower === 'vision-mission' ||
        lower === 'vision' ||
        lower === 'mission' ||
        lower === 'team' ||
        lower === 'the-team' ||
        lower === 'our-team'
      ) {
        return 'about-mission';
      }
      if (
        lower === 'item-bank' ||
        lower === 'stet-item-bank' ||
        lower === 'itembank' ||
        lower === 'guidelines' ||
        lower === 'framing-guidelines' ||
        lower === 'reference-bank'
      ) {
        return 'item-bank';
      }
      if (['dashboard', 'mock-tests', 'practice', 'item-bank', 'adaptive', 'study-guides', 'analytics', 'leaderboard', 'admin', 'about-mission'].includes(lower)) {
        return lower;
      }
      return null;
    };

    const targetTab = checkValue(tabParam) || checkValue(hash);
    if (targetTab) {
      return { 
        tab: targetTab, 
        isDirectAcademicLink: targetTab === 'fellowship-application' || targetTab === 'advisory' || targetTab === 'item-bank' || targetTab === 'about-mission'
      };
    }
  } catch (e) {
    // Ignore URL parse error
  }
  return { tab: 'dashboard', isDirectAcademicLink: false };
}

export default function App() {
  const initialUrlState = React.useMemo(() => parseTabFromUrl(), []);
  const [currentTab, setCurrentTab] = useState<string>(initialUrlState.tab);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string | undefined>(undefined);
  const [tutorActiveQuestion, setTutorActiveQuestion] = useState<Question | undefined>(undefined);
  const [practiceTopicFilter, setPracticeTopicFilter] = useState<string | undefined>(undefined);

  // Pro Subscription / Payment Modal
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [subscriptionModalStreamId, setSubscriptionModalStreamId] = useState<string | undefined>(undefined);

  const handleOpenSubscription = (trackId?: ExamTrack) => {
    if (trackId) {
      const streamMap: Record<ExamTrack, string> = {
        'prt': 'primary',
        'gt-maths-science': 'graduate-science',
        'gt-humanities': 'graduate-social',
      };
      setSubscriptionModalStreamId(streamMap[trackId] || 'primary');
    } else {
      setSubscriptionModalStreamId(undefined);
    }
    setIsSubscriptionModalOpen(true);
  };

  // The trial period is over. Removed trial modal auto-popup. Free usage is limited to 30 questions.
  const [isSubscribeForMoreModalOpen, setIsSubscribeForMoreModalOpen] = useState<boolean>(false);
  const [subscribeModalSource, setSubscribeModalSource] = useState<'practice' | 'mock-tests' | 'general'>('general');

  const handleOpenSubscribeForMore = (section: 'practice' | 'mock-tests' | 'general' = 'general') => {
    setSubscribeModalSource(section);
    setIsSubscribeForMoreModalOpen(true);
  };

  // User Profile & Password Management Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');

  const handleOpenProfile = (tab: 'profile' | 'password' = 'profile') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
  };

  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authModalErrorMessage, setAuthModalErrorMessage] = useState<string | null>(null);

  // Security & Course Access Notices
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState<string | null>(null);
  const [inaccessibleNotice, setInaccessibleNotice] = useState<string | null>(null);

  // Offline detection & Service Worker state
  const [isOffline, setIsOffline] = useState<boolean>(() => isBrowserOffline());

  // Initialize click and visit tracking and sync auth/clients from server
  useEffect(() => {
    initCounterTracker();
    clientSyncService.syncAll().then(() => {
      setUserProfile(loadUserProfile());
    }).catch(() => {});

    const handleNetworkChange = () => {
      const offline = isBrowserOffline();
      setIsOffline(offline);
      if (!offline) {
        clientSyncService.syncAll().then(() => {
          setUserProfile(loadUserProfile());
        }).catch(() => {});
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('studeezone_network_status', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('studeezone_network_status', handleNetworkChange);
    };
  }, []);

  // Synchronize profile changes to storage and Service Worker cache
  useEffect(() => {
    saveUserProfile(userProfile);
    cacheCriticalStateToSW('userProfile', userProfile);
  }, [userProfile]);

  const handleUpdateProfile = (updater: ((prev: UserProfile) => UserProfile) | UserProfile) => {
    setUserProfile((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveUserProfile(updated);
      return updated;
    });
  };

  const handleOpenTutor = (prompt?: string, questionRef?: Question) => {
    setTutorInitialPrompt(prompt);
    setTutorActiveQuestion(questionRef);
    setIsTutorOpen(true);
  };

  const [adminInitialSubTab, setAdminInitialSubTab] = useState<'logins' | 'clients' | 'payment' | 'advisory' | 'form-submissions' | 'fellowship-applications' | 'credits' | 'about-mission' | undefined>(initialUrlState.initialSubTab);

  const handleNavigate = (tab: string, extraState?: any) => {
    if (tab === 'subscription' || tab === 'payment') {
      setIsSubscriptionModalOpen(true);
      return;
    }
    if (extraState?.topicFilter !== undefined) {
      setPracticeTopicFilter(extraState.topicFilter === 'All' ? undefined : extraState.topicFilter);
    } else if (tab === 'practice') {
      setPracticeTopicFilter(undefined);
    }
    if (extraState?.subTab) {
      setAdminInitialSubTab(extraState.subTab);
    }
    handleTabSelect(tab);
  };

  const handleSelectExamTrack = (trackId: ExamTrack) => {
    const isPaid = isPaidOrAdmin(userProfile);
    const isPaidCandidate = isPaid && !isAdmin;
    if (isPaidCandidate && !canAccessExamTrack(userProfile, trackId)) {
      const subTitle = getSubscribedCourseTitle(userProfile.targetExam, userProfile.paidStreams);
      setInaccessibleNotice(`You are SUBSCRIBED TO- "${subTitle}". Full access is granted to that specific course only. Rest of the courses remain inaccessible under your current plan.`);
      return;
    }

    setInaccessibleNotice(null);
    handleUpdateProfile((prev) => ({
      ...prev,
      selectedExamTrack: trackId,
      targetExam:
        trackId === 'prt'
          ? 'Sikkim Primary Teacher (PRT - Paper I)'
          : trackId === 'gt-maths-science'
          ? 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)'
          : 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    }));
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' = 'login', initialErrorMessage?: string | null) => {
    setAuthModalMode(mode);
    setAuthModalErrorMessage(initialErrorMessage || null);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: RegisteredUser) => {
    const isSuperAdmin = isAdminUser(user.email);
    const clients = getAllClients();
    const userNormName = (user.name || '').toLowerCase().trim();
    const cleanUserId = user.id ? user.id.replace(/^(user-|client-)+/, '') : '';
    const matchedClient = clients.find(
      (c) =>
        (user.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
        (user.loginId && c.loginId && c.loginId.toLowerCase().trim() === user.loginId.toLowerCase().trim()) ||
        (userNormName && userNormName !== 'candidate learner' && c.name.toLowerCase().trim() === userNormName) ||
        c.id === user.id ||
        c.id === cleanUserId ||
        c.id === `client-${cleanUserId}`
    );
    const userLower = `${user.name || ''} ${user.email || ''} ${user.loginId || ''}`.toLowerCase();
    const isSpecialCandidate = userLower.includes('asha') || userLower.includes('prasad') || userLower.includes('shanti') || userLower.includes('subba');
    const clientTrack = matchedClient ? getClientAllocatedTrack(matchedClient) : undefined;
    const allocatedTrack: ExamTrack = isSpecialCandidate
      ? 'gt-maths-science'
      : clientTrack
      ? clientTrack
      : (user.paidStreams && user.paidStreams.length > 0)
      ? user.paidStreams[0]
      : getExamTrackFromTarget(user.targetExam);

    const effectivePaid = isSuperAdmin || isSpecialCandidate || Boolean(matchedClient?.isPaid || user.isPaid);

    const paidStreams: ExamTrack[] = isSuperAdmin
      ? ['prt', 'gt-maths-science', 'gt-humanities']
      : [allocatedTrack];

    const targetTrack: ExamTrack = isSuperAdmin ? ((user as any).selectedExamTrack || 'prt') : allocatedTrack;
    const resolvedTargetExam = isSuperAdmin
      ? (user.targetExam || 'Sikkim Primary Teacher (PRT - Paper I)')
      : getSubscribedCourseTitle(targetTrack);

    handleUpdateProfile((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      isLoggedIn: true,
      role: user.role || (isSuperAdmin ? 'admin' : 'candidate'),
      authProvider: user.authProvider,
      targetExam: resolvedTargetExam,
      isPaid: effectivePaid,
      paidStreams: paidStreams,
      selectedExamTrack: targetTrack,
    }));

    // Trigger Cloud Firestore real-time profile listener and sync
    if (user.email) {
      firestoreSyncService.pullProfileFromCloud(user.email).catch(() => {});
      firestoreSyncService.attachUserProfileRealtimeListener();
    }

    // Trigger cloud sync to pull freshest status/allocations
    clientSyncService.syncAll().then(() => {
      setUserProfile(loadUserProfile());
    }).catch(() => {});
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
    handleUpdateProfile(DEFAULT_USER_PROFILE);
    firestoreSyncService.attachUserProfileRealtimeListener();
  };

  // Only authenticated admin credentials unlock admin privileges
  const isAdmin = Boolean(userProfile.isLoggedIn) && (isAdminUser(userProfile.email) || userProfile.role === 'admin');

  // Keep user profile and course allocation in live sync with Admin Panel modifications
  useEffect(() => {
    const applyProfileUpdate = (incoming: UserProfile) => {
      if (!incoming) return;
      setUserProfile((prev) => {
        if (
          prev.email === incoming.email &&
          prev.isPaid === incoming.isPaid &&
          prev.selectedExamTrack === incoming.selectedExamTrack &&
          prev.targetExam === incoming.targetExam &&
          prev.role === incoming.role &&
          prev.totalXp === incoming.totalXp &&
          prev.streakDays === incoming.streakDays &&
          JSON.stringify(prev.paidStreams || []) === JSON.stringify(incoming.paidStreams || [])
        ) {
          return prev;
        }
        return incoming;
      });
    };

    const handleProfileUpdated = (e: any) => {
      const incoming = e.detail?.userProfile || (e.detail && !e.detail.type ? e.detail : null);
      if (incoming) {
        applyProfileUpdate(incoming);
      } else {
        applyProfileUpdate(loadUserProfile());
      }
    };

    const handleClientsUpdated = () => {
      applyProfileUpdate(loadUserProfile());
    };

    window.addEventListener('studeezone_profile_updated', handleProfileUpdated);
    window.addEventListener('studeezone_clients_updated', handleClientsUpdated);
    window.addEventListener('studeezone_data_store_change', handleProfileUpdated);
    window.addEventListener('studeezone_subscription_status_changed', handleProfileUpdated);

    return () => {
      window.removeEventListener('studeezone_profile_updated', handleProfileUpdated);
      window.removeEventListener('studeezone_clients_updated', handleClientsUpdated);
      window.removeEventListener('studeezone_data_store_change', handleProfileUpdated);
      window.removeEventListener('studeezone_subscription_status_changed', handleProfileUpdated);
    };
  }, []);

  // Requirement: Handle remote session termination from Admin Hub
  useEffect(() => {
    const handleSessionTerminated = (e: any) => {
      const detail = e.detail;
      if (
        userProfile.isLoggedIn &&
        !isAdmin &&
        (detail?.all || (detail?.userEmail && userProfile.email && detail.userEmail.toLowerCase() === userProfile.email.toLowerCase()))
      ) {
        handleLogout();
        setSessionTerminatedNotice(detail?.reason || 'Your active session was terminated by the administrator.');
      }
    };
    window.addEventListener('studeezone_session_terminated', handleSessionTerminated);
    return () => window.removeEventListener('studeezone_session_terminated', handleSessionTerminated);
  }, [userProfile.isLoggedIn, userProfile.email, isAdmin]);

  // Periodic active session validator (enforces 1 IP / single session rule)
  useEffect(() => {
    if (!userProfile.isLoggedIn || isAdmin || !userProfile.email) return;
    const interval = setInterval(() => {
      fetch(`/api/auth/check-session?email=${encodeURIComponent(userProfile.email!)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.active === false) {
            handleLogout();
            setSessionTerminatedNotice(data.reason || 'Your active session has ended because your account was logged in from another device/IP or terminated by administrator.');
          }
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [userProfile.isLoggedIn, userProfile.email, isAdmin]);

  // Periodic background data and course synchronization from server
  useEffect(() => {
    const syncData = () => {
      clientSyncService.syncAll().then(() => {
        setUserProfile(loadUserProfile());
      }).catch(() => {});
    };

    const interval = setInterval(syncData, 10000);
    window.addEventListener('focus', syncData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncData);
    };
  }, []);

  // Listen for browser back/forward and external link hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const urlInfo = parseTabFromUrl();
      if (urlInfo.tab) {
        setCurrentTab(urlInfo.tab);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleTabSelect = (tab: string, extraState?: any) => {
    if (extraState?.subTab) {
      setAdminInitialSubTab(extraState.subTab);
    }
    if (extraState?.topicFilter) {
      setPracticeTopicFilter(extraState.topicFilter);
    }
    if (tab === 'admin' && !isAdmin) {
      handleOpenAuth('login', 'login with admin credentials');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Synchronize browser URL bar so current page is cleanly shareable
    try {
      const url = new URL(window.location.href);
      if (tab === 'fellowship-application') {
        url.searchParams.set('tab', 'fellowship-application');
        url.searchParams.delete('subtab');
      } else if (tab === 'advisory') {
        url.searchParams.set('tab', 'academic-council');
        url.searchParams.delete('subtab');
      } else if (tab === 'dashboard') {
        url.searchParams.delete('tab');
        url.searchParams.delete('subtab');
      } else if (tab === 'admin' && extraState?.subTab) {
        url.searchParams.set('tab', 'admin');
        url.searchParams.set('subtab', extraState.subTab);
      } else {
        url.searchParams.set('tab', tab);
        url.searchParams.delete('subtab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // Mobile Bottom Navigation Bar when in mobile mode or narrow screen
  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'mock-tests', label: 'Mocks', icon: Clock },
    { id: 'practice', label: 'Practice', icon: BookOpen },
    { id: 'advisory', label: 'Council', icon: GraduationCap },
    { id: 'about-mission', label: 'About', icon: Compass },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Plus_Jakarta_Sans'] antialiased flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {/* Container wrapper - adapts if simulated Mobile frame is toggled */}
      <div className={`w-full max-w-full transition-all duration-300 overflow-x-hidden ${
        isMobilePreview 
          ? 'max-w-md mx-auto my-4 sm:my-8 bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-800 ring-1 ring-slate-400 min-h-[850px] relative flex flex-col'
          : 'w-full'
      }`}>
        {/* Mobile Device Status Bar Notch (if in Mobile frame mode) */}
        {isMobilePreview && (
          <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs select-none">
            <span className="font-semibold text-[11px]">9:41</span>
            <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto"></div>
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span>5G</span>
              <span className="font-bold">100%</span>
            </div>
          </div>
        )}

        {/* Global Navigation Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleTabSelect}
          userProfile={userProfile}
          onOpenTutor={() => handleOpenTutor()}
          isMobilePreview={isMobilePreview}
          onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onOpenProfile={handleOpenProfile}
          onOpenSubscription={() => handleOpenSubscription()}
          onOpenSubscribeForMore={handleOpenSubscribeForMore}
        />

        {/* Offline Mode Service Worker Indicator Banner */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs border-b border-amber-500/50">
            <div className="flex items-center space-x-2.5 max-w-7xl mx-auto w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping shrink-0"></span>
              <span className="leading-snug">
                Offline Mode Active &bull; Service Worker is serving cached STET mock tests, practice banks, and study guides. All answers, registrations, and notes are saved locally and will sync to cloud when internet connection resumes.
              </span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full ${isMobilePreview ? 'pb-24' : 'pb-16'}`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              onNavigate={handleNavigate}
              onOpenTutor={handleOpenTutor}
              onOpenAuth={handleOpenAuth}
              onOpenProfile={() => handleOpenProfile('profile')}
              onSelectExamTrack={handleSelectExamTrack}
              onOpenSubscription={(trackId) => handleOpenSubscription(trackId)}
              onOpenSubscribeForMore={handleOpenSubscribeForMore}
            />
          )}

          {currentTab === 'mock-tests' && (
            <MockTestView
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onOpenTutor={handleOpenTutor}
              onSelectExamTrack={handleSelectExamTrack}
              onOpenSubscription={(trackId) => handleOpenSubscription(trackId)}
              onOpenSubscribeForMore={handleOpenSubscribeForMore}
            />
          )}

          {currentTab === 'practice' && (
            <PracticeQuestionsView
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onOpenTutor={handleOpenTutor}
              initialTopicFilter={practiceTopicFilter}
              onSelectExamTrack={handleSelectExamTrack}
              onOpenSubscription={(trackId) => handleOpenSubscription(trackId)}
              onOpenSubscribeForMore={handleOpenSubscribeForMore}
            />
          )}

          {currentTab === 'item-bank' && (
            <StetItemBankView
              onNavigate={handleNavigate}
              onOpenTutor={handleOpenTutor}
              onSelectExamTrack={handleSelectExamTrack}
              userProfile={userProfile}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {currentTab === 'adaptive' && (
            <AdaptivePathView
              userProfile={userProfile}
              onNavigate={handleNavigate}
              onOpenTutor={handleOpenTutor}
              onSelectExamTrack={handleSelectExamTrack}
            />
          )}

          {currentTab === 'study-guides' && (
            <StudyGuidesView 
              userProfile={userProfile}
              onOpenTutor={handleOpenTutor} 
              onSelectExamTrack={handleSelectExamTrack}
            />
          )}

          {currentTab === 'analytics' && (
            <PerformanceAnalyticsView
              userProfile={userProfile}
              onNavigate={handleNavigate}
              onSelectExamTrack={handleSelectExamTrack}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView userProfile={userProfile} />
          )}

          {currentTab === 'advisory' && (
            <AdvisoryBoardView
              onNavigate={handleNavigate}
              onOpenTutor={handleOpenTutor}
              userProfile={userProfile}
            />
          )}

          {currentTab === 'fellowship-application' && (
            <FellowshipApplicationView
              onNavigate={handleNavigate}
              onOpenTutor={handleOpenTutor}
            />
          )}

          {currentTab === 'about-mission' && (
            <AboutMissionView
              onNavigate={handleNavigate}
              isAdmin={isAdmin}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanelView
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onOpenAuth={handleOpenAuth}
              initialSubTab={adminInitialSubTab}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Platform Footer with Live Click & Visit Counter */}
        <Footer
          onSelectTab={handleTabSelect}
          onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          onOpenSubscribeForMore={handleOpenSubscribeForMore}
          onOpenTutor={() => handleOpenTutor()}
        />

        {/* Mobile Persistent Bottom Bar (Visible on mobile screens or mobile preview mode) */}
        <div className={`md:hidden sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around z-30 shadow-lg ${
          isMobilePreview ? 'rounded-b-2xl' : ''
        }`}>
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating 24/7 Ask Lama Chat Tutor Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => handleOpenTutor()}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer font-bold text-xs sm:text-sm group border border-violet-400/30"
          id="floating-ai-tutor-trigger-btn"
          title="Ask Lama 24/7 STET Mentor"
        >
          <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="font-['Outfit'] tracking-wide">24/7 Ask Lama</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
        </button>
      </div>

      {/* 24/7 Ask Lama Chat Support Modal */}
      <ChatTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        initialPrompt={tutorInitialPrompt}
        activeQuestion={tutorActiveQuestion}
      />

      {/* User Profile & Password Management Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
        initialTab={profileModalTab}
      />

      {/* Authentication Modal: Gmail, Login ID/Password, Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalErrorMessage(null);
        }}
        initialMode={authModalMode}
        initialErrorMessage={authModalErrorMessage}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 30-Question Limit Reached: Subscribe For More Pop Up Modal */}
      <SubscribeForMoreModal
        isOpen={isSubscribeForMoreModalOpen}
        onClose={() => setIsSubscribeForMoreModalOpen(false)}
        onOpenSubscription={(trackId) => {
          setIsSubscribeForMoreModalOpen(false);
          handleOpenSubscription(trackId);
        }}
        questionsUsed={getQuestionsUsageCount(userProfile)}
        userProfile={userProfile}
        sourceSection={subscribeModalSource}
      />

      {/* STET Pro Subscription & Complete Payment Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userProfile={userProfile}
        initialStreamId={subscriptionModalStreamId}
        onOpenAuth={handleOpenAuth}
        onNavigateToAdmin={() => handleTabSelect('admin')}
      />

      {/* Session Terminated / 1-IP Enforced Modal */}
      {sessionTerminatedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <PowerOff className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                Active Session Terminated
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {sessionTerminatedNotice}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                Security Policy: Only one active login at one time from a single IP address is permitted.
              </div>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-2.5">
              <button
                onClick={() => {
                  setSessionTerminatedNotice(null);
                  handleOpenAuth('login');
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Sign In Again
              </button>
              <button
                onClick={() => setSessionTerminatedNotice(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inaccessible Course Restriction Toast Banner */}
      {inaccessibleNotice && (
        <div className="fixed top-20 right-4 z-50 max-w-md p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border-2 border-amber-400 flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Lock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs flex-1">
            <p className="font-extrabold text-amber-300 font-['Outfit']">Restricted Course Access</p>
            <p className="text-slate-200 leading-relaxed">{inaccessibleNotice}</p>
          </div>
          <button
            onClick={() => setInaccessibleNotice(null)}
            className="text-amber-300 hover:text-white font-black text-sm shrink-0 ml-1 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
