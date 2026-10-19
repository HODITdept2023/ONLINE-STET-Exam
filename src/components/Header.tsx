import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  Clock, 
  Award, 
  FileText, 
  Users, 
  Sparkles, 
  Flame, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  HelpCircle, 
  Menu, 
  X,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
  UserPlus,
  Gift,
  Shield,
  Key,
  Crown,
  GraduationCap,
  Library,
  Coins,
  Compass,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import { getLastSyncTime, isAdminUser, isProtectedAdminEmail, getQuestionsUsageCount, hasReachedQuestionLimit, isPaidOrAdmin, FREE_TIER_QUESTION_LIMIT, getFreeTierQuestionLimit, initAuthAndClientSync } from '../utils/storage';
import { clientSyncService } from '../services/clientSyncService';
import { firestoreSyncService } from '../services/firestoreSyncService';
import { getFellowshipApplications, isUserCouncilMember } from '../utils/advisoryStorage';
import { ClickVisitCounter } from './ClickVisitCounter';
import { CreditCounterWidget } from './CreditCounterWidget';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string, extraState?: any) => void;
  userProfile: UserProfile;
  onOpenTutor: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'forgot', initialErrorMessage?: string | null) => void;
  onLogout: () => void;
  onOpenFreeTrial?: () => void;
  onOpenProfile?: () => void;
  onOpenSubscription?: () => void;
  onOpenSubscribeForMore?: (section?: 'practice' | 'mock-tests' | 'general') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  onOpenTutor,
  isMobilePreview,
  onToggleMobilePreview,
  onOpenAuth,
  onLogout,
  onOpenFreeTrial,
  onOpenProfile,
  onOpenSubscription,
  onOpenSubscribeForMore,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [globalSyncing, setGlobalSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(getLastSyncTime());
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalSyncEvent = (e: any) => {
      setLastSync('Just now');
      if (e.detail?.timestamp) {
        setLastSync(e.detail.timestamp);
      }
    };
    window.addEventListener('studeezone_global_synced', handleGlobalSyncEvent);
    return () => window.removeEventListener('studeezone_global_synced', handleGlobalSyncEvent);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleManualSync = () => {
    setSyncing(true);
    clientSyncService.syncAll()
      .then(() => {
        setSyncing(false);
        setLastSync('Just now');
      })
      .catch(() => {
        setSyncing(false);
      });
  };

  const handleForceGlobalSync = async () => {
    if (globalSyncing) return;
    setGlobalSyncing(true);
    try {
      const res = await firestoreSyncService.forceGlobalSync();
      setLastSync('Just now');
      setSyncToast({
        message: res.success
          ? `Global Sync Complete: Cleared local question & profile caches, deep-fetched ${res.clientsCount} accounts and forced consistency from Firestore!`
          : `Sync Notice: ${res.message}`,
        type: res.success ? 'success' : 'error',
      });
      setTimeout(() => setSyncToast(null), 5500);
    } catch (err: any) {
      setSyncToast({
        message: 'Force Global Sync failed. Please verify network connectivity.',
        type: 'error',
      });
      setTimeout(() => setSyncToast(null), 5500);
    } finally {
      setGlobalSyncing(false);
    }
  };

  // Only logged in admin accounts with valid credentials can access admin features
  const isAdmin = Boolean(userProfile.isLoggedIn) && (isAdminUser(userProfile.email) || userProfile.role === 'admin');

  // Dynamic Free Question Limit tracking
  const [freeQuestionLimit, setFreeQuestionLimit] = useState<number>(() => getFreeTierQuestionLimit());

  useEffect(() => {
    const handleLimitUpdate = () => {
      setFreeQuestionLimit(getFreeTierQuestionLimit());
    };
    window.addEventListener('studeezone_free_limit_updated', handleLimitUpdate);
    return () => window.removeEventListener('studeezone_free_limit_updated', handleLimitUpdate);
  }, []);

  const [pendingFellowshipCount, setPendingFellowshipCount] = useState<number>(() => {
    try {
      const apps = getFellowshipApplications();
      return apps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        const apps = getFellowshipApplications();
        setPendingFellowshipCount(apps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('studeezone_fellowship_applications_updated', updateCount);
    return () => window.removeEventListener('studeezone_fellowship_applications_updated', updateCount);
  }, []);

  // Streamlined navigation for candidates with dedicated Council tab
  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, title: 'Dashboard & Exam Overview' },
    { id: 'mock-tests', label: 'Mock Tests', icon: Clock, title: 'Timed Mock Tests' },
    { id: 'practice', label: 'Practice', icon: BookOpen, title: 'Question Bank Practice' },
    { id: 'advisory', label: 'Council', icon: GraduationCap, title: 'Advisory Board & Academic Council' },
    { id: 'about-mission', label: 'About & Mission', icon: Compass, title: 'Vision, Mission, About This App & Team' },
  ];

  // Admin users can see Admin Hub and Fellowship Approvals ONLY AFTER logging in with admin credentials
  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin Hub', icon: Shield, isAdminItem: true, title: 'Super Administrator Console' },
      { 
        id: 'fellowship-admin', 
        label: 'Fellowship Approvals', 
        renderLabel: () => (
          <span>
            Fellowship<span className="hidden xl:inline"> Approvals</span>
          </span>
        ),
        icon: Award, 
        isFellowshipItem: true, 
        title: 'Review & Allocate Fellowship Designations' 
      }
    ] : []),
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'fellowship-admin') {
      onSelectTab('admin', { subTab: 'fellowship-applications' });
      return;
    }
    onSelectTab(tabId);
  };

  const isLoggedIn = Boolean(userProfile.isLoggedIn);
  const userInitials = (userProfile.name || 'Candidate')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs w-full max-w-full" id="main-app-header">
      {/* Dynamic Global Sync Notification Toast */}
      {syncToast && (
        <div className={`w-full py-2 px-4 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-md transition-all animate-in slide-in-from-top-2 duration-200 z-50 ${
          syncToast.type === 'success' ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white' : 'bg-rose-600 text-white'
        }`}>
          {syncToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 animate-bounce" />
          ) : (
            <X className="w-4 h-4 text-rose-200 shrink-0" />
          )}
          <span className="truncate max-w-3xl">{syncToast.message}</span>
          <button 
            type="button" 
            onClick={() => setSyncToast(null)} 
            className="ml-2 bg-white/20 hover:bg-white/30 text-white p-0.5 rounded-full cursor-pointer transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Top Banner / Sync Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <span className="inline-flex items-center text-emerald-400 font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            Cloud Sync Active
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400 whitespace-nowrap">
            Target: <strong className="text-white font-semibold">{userProfile.targetExam}</strong>
          </span>
          {isLoggedIn && userProfile.email ? (
            <>
              <span className="hidden lg:inline text-slate-500">•</span>
              <span className="hidden lg:inline text-slate-400 truncate max-w-[200px]">
                User: <strong className="text-indigo-300">{isProtectedAdminEmail(userProfile.email) ? 'studeezone Admin' : userProfile.email}</strong>
              </span>
              {isAdmin && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-extrabold border border-amber-400/40 whitespace-nowrap">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>ADMIN ACCESS</span>
                </span>
              )}
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-amber-300 font-medium whitespace-nowrap">
                Guest Practice Mode
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Live Click & Visit Counter Badge */}
          <ClickVisitCounter variant="badge" />

          {/* Live Credits Spent Counter Badge */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onSelectTab('admin', { subTab: 'credits' })}
              className="cursor-pointer transition-transform hover:scale-105 shrink-0"
              title="Total AI & Platform Credits Spent - Click to view in Admin Hub"
              id="header-credits-spent-btn"
            >
              <CreditCounterWidget variant="badge" />
            </button>
          ) : (
            <div className="shrink-0" title="Platform Cloud Engine Active">
              <CreditCounterWidget variant="badge" />
            </div>
          )}

          {!isPaidOrAdmin(userProfile) && (
            <button
              onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('general') : onOpenSubscription?.()}
              className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                hasReachedQuestionLimit(userProfile)
                  ? 'bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border-rose-400/60 animate-pulse'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
              }`}
              title={
                hasReachedQuestionLimit(userProfile)
                  ? `${freeQuestionLimit} Questions Free Limit Reached - Subscribe for more..!!`
                  : `${getQuestionsUsageCount(userProfile)}/${freeQuestionLimit} Free Questions Used - Subscribe for more..!!`
              }
              id="header-question-limit-badge-btn"
            >
              <Crown className="w-3 h-3 text-amber-300 shrink-0" />
              <span>
                {hasReachedQuestionLimit(userProfile) ? `Limit Reached (${freeQuestionLimit}/${freeQuestionLimit}) • Subscribe` : `${getQuestionsUsageCount(userProfile)}/${freeQuestionLimit} Free Qs`}
              </span>
            </button>
          )}

          <button 
            type="button"
            onClick={handleManualSync}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            title="Passive sync between active devices"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="text-[11px] hidden sm:inline">{syncing ? 'Syncing...' : `Synced ${lastSync}`}</span>
          </button>

          {/* Force Global Sync Button - Clears cache and deep-fetches from Firestore */}
          <button 
            type="button"
            onClick={handleForceGlobalSync}
            disabled={globalSyncing}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/60 border border-blue-400/50 hover:border-cyan-400 text-blue-200 hover:text-white transition-all text-[11px] font-bold cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
            title="Force Global Sync: Clears local question and user profile caches, and deep-fetches from Firestore to guarantee cross-system parity"
            id="header-force-global-sync-btn"
          >
            <Globe className={`w-3 h-3 text-cyan-300 ${globalSyncing ? 'animate-spin' : ''}`} />
            <span>{globalSyncing ? 'Deep Syncing...' : 'Force Global Sync'}</span>
          </button>

          <button
            onClick={onToggleMobilePreview}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px] border border-slate-700 cursor-pointer whitespace-nowrap"
            title="Toggle responsive mobile app simulation frame"
            id="toggle-mobile-simulation-btn"
          >
            {isMobilePreview ? (
              <>
                <Monitor className="w-3 h-3 text-indigo-400" />
                <span className="hidden sm:inline">Desktop View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Mobile App View</span>
              </>
            )}
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* Main Navbar Top Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand */}
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0"
          >
            {/* 3D Cap & Book App Icon */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/studeezone-icon.svg"
                alt="studeezone.com app icon"
                className="w-full h-full object-contain drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-['Outfit'] whitespace-nowrap">
                  studee<span className="text-blue-600">zone</span><span className="text-slate-500 font-bold text-xs sm:text-sm">.com</span>
                </span>
                <span className="inline-flex bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap shadow-2xs">
                  2026/25/24
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block">
                STET Exam Preparation &amp; Historical Mock Platform
              </p>
            </div>
          </div>

          {/* Right Action: Admin Fellowship Shortcut, User Auth, Streak & 24/7 Ask Lama */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Direct Admin Shortcut for Fellowship Applications */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSelectTab('admin', { subTab: 'fellowship-applications' })}
                className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 via-amber-500/20 to-amber-400/20 hover:from-amber-400/30 hover:to-amber-500/30 text-amber-950 text-xs font-black transition-all cursor-pointer border border-amber-400/60 shadow-2xs whitespace-nowrap"
                title="Review people who filled Fellowship Application page and allocate council designations"
                id="header-fellowship-admin-shortcut-btn"
              >
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Fellowship Apps</span>
                {pendingFellowshipCount > 0 ? (
                  <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {pendingFellowshipCount} New
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    Review
                  </span>
                )}
              </button>
            )}

            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="flex items-center space-x-1.5 px-2 sm:px-2.5 lg:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs border border-amber-300 shrink-0"
                id="header-subscribe-btn"
                title="Subscribe to STET Pro - ₹499 Per Stream"
              >
                <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                <span className="hidden sm:inline font-black uppercase tracking-wider text-[11px]">Subscribe</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('dashboard')}
              className="hidden 2xl:flex items-center bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1 text-amber-800 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              title="Daily Learning Streak - Consecutive Days Active"
            >
              <Flame className="w-4 h-4 text-amber-500 mr-1 fill-amber-500" />
              <span>{userProfile.streakDays}d Streak</span>
            </button>

            {/* Auth Button or User Profile Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center space-x-1.5 sm:space-x-2 p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer ${
                    profileDropdownOpen
                      ? 'border-indigo-400 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/25 shadow-xs'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-800'
                  }`}
                  id="user-profile-menu-btn"
                  title={userProfile.name ? `${userProfile.name} - Account Menu` : 'Candidate Account'}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 ring-1 ring-white/40">
                    {userInitials}
                  </div>
                  <div className="text-left hidden lg:block pr-1 max-w-[85px] xl:max-w-[120px]">
                    <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-none truncate">
                      {isProtectedAdminEmail(userProfile.email) ? 'studeezone Admin' : (userProfile.email || 'Candidate')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${profileDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>

                {/* Highly Visible, Elevated Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    id="user-account-dropdown-menu"
                    className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 ring-1 ring-slate-900/10 py-0 z-[100] animate-in fade-in zoom-in-95 duration-150 overflow-hidden max-w-[calc(100vw-1.5rem)]"
                    role="menu"
                    aria-label="User Account Options"
                  >
                    {/* Dropdown Header Card */}
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-inner ring-2 ring-white/20">
                            {userInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-white truncate leading-tight">
                              {userProfile.name}
                            </p>
                            <p className="text-[11px] text-slate-300 truncate mt-0.5" title={userProfile.email}>
                              {isProtectedAdminEmail(userProfile.email) ? 'studeezone Super Admin' : (userProfile.email || 'Candidate Account')}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title="Close menu"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-white/10">
                        {isAdmin ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            SUPER ADMIN ACCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                            Verified Candidate
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          STET Prep 2026/25
                        </span>
                      </div>
                    </div>

                    {/* User Snapshot Metrics */}
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Exam</span>
                        <span className="font-extrabold text-slate-800 text-xs truncate block" title={userProfile.targetExam}>
                          {userProfile.targetExam}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
                        <span className="font-black text-indigo-600 text-xs flex items-center">
                          <Sparkles className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                          {userProfile.totalXp} XP
                        </span>
                      </div>
                    </div>

                    {/* Quick Credits Counter Row - Only visible for authenticated admin */}
                    {isAdmin && (
                      <div 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab('admin', { subTab: 'credits' });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border-b border-amber-300/40 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/50 transition-colors"
                        title="Click to view total credits spent in Admin Hub"
                      >
                        <div className="flex items-center space-x-1.5 text-amber-950 font-bold">
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[11px]">Total Credits Spent:</span>
                        </div>
                        <CreditCounterWidget variant="badge" className="py-0.5 px-2 text-[10px]" />
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="p-2 space-y-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-2.5 cursor-pointer font-bold transition-colors group"
                        id="header-profile-change-password-btn"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block leading-tight">Profile &amp; Change Password</span>
                          <span className="text-[10px] font-normal text-slate-500 block truncate">Edit name, track &amp; credentials</span>
                        </div>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSelectTab('admin');
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-amber-950 bg-amber-50/80 hover:bg-amber-100 flex items-center space-x-2.5 cursor-pointer font-bold border border-amber-200/70 transition-colors group"
                          id="header-profile-admin-hub-btn"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block leading-tight">Admin Hub (Console &amp; Logins)</span>
                            <span className="text-[10px] font-medium text-amber-800/80 block truncate">Audit logs, users &amp; database</span>
                          </div>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSelectTab('admin', { subTab: 'fellowship-applications' });
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-amber-950 bg-amber-100/60 hover:bg-amber-200/70 flex items-center justify-between cursor-pointer font-bold border border-amber-300/80 transition-colors"
                          id="header-profile-fellowship-btn"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="block leading-tight truncate">Fellowship Approvals</span>
                              <span className="text-[10px] font-medium text-amber-800 block truncate">Allocate Council Designations</span>
                            </div>
                          </div>
                          {pendingFellowshipCount > 0 && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs animate-pulse">
                              {pendingFellowshipCount} New
                            </span>
                          )}
                        </button>
                      )}

                      <div className="h-px bg-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAuth('login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 cursor-pointer font-medium transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Switch Account / Re-login</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAuth('register');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 cursor-pointer font-medium transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Register New Account</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      {/* Force Global Sync Action in Dropdown */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleForceGlobalSync();
                        }}
                        disabled={globalSyncing}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-blue-900 bg-blue-50/80 hover:bg-blue-100/90 flex items-center space-x-2.5 cursor-pointer font-bold border border-blue-200/80 transition-colors group disabled:opacity-60"
                        id="dropdown-force-global-sync-btn"
                        title="Clears local question bank cache and user profile cache, then triggers an authoritative deep fetch from Cloud Firestore"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <Globe className={`w-3.5 h-3.5 ${globalSyncing ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="block leading-tight text-blue-950 font-extrabold text-xs">Force Global Sync</span>
                            <span className="text-[9px] bg-blue-200 text-blue-800 font-black px-1.5 py-0.2 rounded-full">Firestore</span>
                          </div>
                          <span className="text-[10px] font-normal text-slate-600 block truncate mt-0.5">
                            Clear question &amp; profile cache &bull; Deep-fetch cloud
                          </span>
                        </div>
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 cursor-pointer font-bold transition-colors"
                        id="header-profile-logout-btn"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                  id="header-login-btn"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  id="header-register-btn"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span>Register</span>
                </button>
              </div>
            )}

            <button
              id="header-open-chat-tutor-btn"
              type="button"
              onClick={onOpenTutor}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer group shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">24/7 Ask Lama</span>
              <span className="sm:hidden text-xs">Ask Lama</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Desktop/Tablet Navigation Bar (Fluid width with responsive labels and smooth scroll) */}
      <div className="hidden md:block w-full border-t border-slate-200/90 bg-slate-50/90 backdrop-blur-xs shadow-2xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <nav className="flex items-center justify-start 2xl:justify-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1.5 w-full scroll-smooth" id="desktop-primary-nav">
            {navItems.map((item: any) => {
              const Icon = item.icon;
              const isActive = (item.id === 'fellowship-admin' && currentTab === 'admin') || currentTab === item.id;
              const isSpecialAdmin = item.id === 'admin';
              const isFellowship = item.id === 'fellowship-admin';
              return (
                <button
                  type="button"
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  title={item.title}
                  className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? isFellowship
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs border border-amber-400'
                        : isSpecialAdmin
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : isFellowship
                      ? 'bg-amber-100/90 text-amber-950 border border-amber-300 hover:bg-amber-200 font-extrabold'
                      : isSpecialAdmin
                      ? 'bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? (isSpecialAdmin || isFellowship ? 'text-slate-950' : 'text-white') : (isSpecialAdmin || isFellowship ? 'text-amber-700' : 'text-slate-500')}`} />
                  <span>{item.renderLabel ? item.renderLabel() : item.label}</span>
                  {isSpecialAdmin && (
                    <span className="text-[9px] bg-amber-200/90 text-amber-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                      Portal
                    </span>
                  )}
                  {isFellowship && pendingFellowshipCount > 0 && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5 animate-pulse">
                      {pendingFellowshipCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500">
            <span>🔥 Streak: {userProfile.streakDays} days</span>
            <span>⭐ XP: {userProfile.totalXp}</span>
          </div>

          {/* Admin Fellowship Shortcut in Mobile Menu */}
          {isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectTab('admin', { subTab: 'fellowship-applications' });
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs"
            >
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Fellowship Applications &amp; Approvals</span>
              </div>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingFellowshipCount} Pending
              </span>
            </button>
          )}

          {/* Mobile User Profile or Auth triggers */}
          {isLoggedIn ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{userProfile.name}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                    {isProtectedAdminEmail(userProfile.email) ? 'studeezone Admin Account' : userProfile.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Log Out
                </button>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Profile &amp; Change Password</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Register
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
