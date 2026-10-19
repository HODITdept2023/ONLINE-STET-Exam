import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Key,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Save,
  LogIn,
  BookOpen,
  GraduationCap,
  FileCheck,
  Check,
  HelpCircle,
  Globe,
  RefreshCw,
  Database
} from 'lucide-react';
import { UserProfile, ExamTrack } from '../types';
import { 
  changeUserPasswordWithVerification, 
  updateUserPhone, 
  isProtectedAdminEmail 
} from '../utils/storage';
import { firestoreSyncService } from '../services/firestoreSyncService';

export const UPLOADED_EXAM_CHOICES: Array<{
  trackId: ExamTrack;
  title: string;
  shortTitle: string;
  badge: string;
  paperLevel: string;
  uploadedPapersLabel: string;
  questionBankCount: string;
  subjectsSummary: string;
  highlightColor: string;
}> = [
  {
    trackId: 'prt',
    title: 'Sikkim Primary Teacher (PRT - Paper I)',
    shortTitle: 'PRT (Paper I)',
    badge: 'Paper I (Primary)',
    paperLevel: 'Classes I – V',
    uploadedPapersLabel: '2024 & 2025 Uploaded Question Papers',
    questionBankCount: '1,060+ Questions Bank',
    subjectsSummary: 'Child Development & Pedagogy, English (Lang I), Mathematics, Environmental Studies (EVS)',
    highlightColor: 'amber',
  },
  {
    trackId: 'gt-maths-science',
    title: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    shortTitle: 'GT Maths / Science (Paper II)',
    badge: 'Paper II (Secondary STEM)',
    paperLevel: 'Classes VI – VIII',
    uploadedPapersLabel: 'Uploaded Question Papers & Sectionals',
    questionBankCount: '1,150+ Questions Bank',
    subjectsSummary: 'Child Development & Pedagogy, English Language & Pedagogy, Pedagogy Maths & Science',
    highlightColor: 'emerald',
  },
  {
    trackId: 'gt-humanities',
    title: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    shortTitle: 'GT Humanities (Paper II)',
    badge: 'Paper II (Secondary Social Sciences)',
    paperLevel: 'Classes VI – VIII',
    uploadedPapersLabel: 'Uploaded Question Papers & Sectionals',
    questionBankCount: '1,120+ Questions Bank',
    subjectsSummary: 'Child Development & Pedagogy, English Language & Pedagogy, Pedagogy Social Science',
    highlightColor: 'indigo',
  },
];

export function resolveExamTrackFromTarget(targetExam?: string, currentTrack?: ExamTrack): ExamTrack {
  if (currentTrack && ['prt', 'gt-maths-science', 'gt-humanities'].includes(currentTrack)) {
    return currentTrack;
  }
  const lower = (targetExam || '').toLowerCase();
  if (lower.includes('primary') || lower.includes('prt')) return 'prt';
  if (lower.includes('math') || lower.includes('science')) return 'gt-maths-science';
  return 'gt-humanities';
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'forgot') => void;
  initialTab?: 'password' | 'profile';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onOpenAuth,
  initialTab = 'password',
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'profile' | 'sync'>(initialTab as any);

  // Global Sync state
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleTriggerForceGlobalSync = async () => {
    if (isSyncingGlobal) return;
    setIsSyncingGlobal(true);
    setSyncFeedback(null);
    try {
      const res = await firestoreSyncService.forceGlobalSync();
      setSyncFeedback({
        success: res.success,
        message: res.success
          ? `Force Global Sync Succeeded! Cleared local question & profile caches. Deep-fetched ${res.clientsCount} accounts and unified Firestore state.`
          : res.message,
      });
      if (res.profileSynced) {
        onUpdateProfile((prev) => ({
          ...prev,
          selectedExamTrack: resolveExamTrackFromTarget(prev.targetExam, prev.selectedExamTrack),
        }));
      }
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: 'Sync encountered a network interruption. Please verify connection.',
      });
    } finally {
      setIsSyncingGlobal(false);
    }
  };

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile details state
  const [name, setName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [selectedExamTrack, setSelectedExamTrack] = useState<ExamTrack>(() =>
    resolveExamTrackFromTarget(userProfile.targetExam, userProfile.selectedExamTrack)
  );
  const [targetExam, setTargetExam] = useState<string>(() => {
    const track = resolveExamTrackFromTarget(userProfile.targetExam, userProfile.selectedExamTrack);
    const matched = UPLOADED_EXAM_CHOICES.find((e) => e.trackId === track);
    return matched?.title || userProfile.targetExam || UPLOADED_EXAM_CHOICES[0].title;
  });
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setPasswordSuccess(null);
      setProfileSuccess(null);
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      const track = resolveExamTrackFromTarget(userProfile.targetExam, userProfile.selectedExamTrack);
      setSelectedExamTrack(track);
      const matched = UPLOADED_EXAM_CHOICES.find((e) => e.trackId === track);
      setTargetExam(matched?.title || userProfile.targetExam || UPLOADED_EXAM_CHOICES[0].title);
    }
  }, [isOpen, initialTab, userProfile]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayEmail = isProtectedAdminEmail(userProfile.email)
    ? 'studeezone Admin Account'
    : userProfile.email || 'Candidate Account (Guest)';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!userProfile.isLoggedIn) {
      setPasswordError('Please sign in first to change your account password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify and re-type.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setIsUpdatingPassword(true);
    const identifier = userProfile.email || userProfile.loginId || '';

    const result = changeUserPasswordWithVerification(
      identifier,
      currentPassword,
      newPassword
    );

    setIsUpdatingPassword(false);

    if (!result.success) {
      setPasswordError(result.message || 'Failed to update password. Please check your current password.');
    } else {
      setPasswordSuccess('Password updated successfully! Your new password is now active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSelectExamOption = (trackId: ExamTrack) => {
    setSelectedExamTrack(trackId);
    const matched = UPLOADED_EXAM_CHOICES.find((opt) => opt.trackId === trackId);
    if (matched) {
      setTargetExam(matched.title);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);

    const identifier = userProfile.email || userProfile.loginId || '';
    if (identifier) {
      updateUserPhone(identifier, phone);
    }

    onUpdateProfile((prev) => ({
      ...prev,
      name: name.trim() || prev.name,
      phone: phone.trim(),
      targetExam,
      selectedExamTrack,
    }));

    setIsSavingProfile(false);
    setProfileSuccess(`Profile updated! Target exam set to "${targetExam}".`);
    setTimeout(() => setProfileSuccess(null), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      id="user-profile-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        id="user-profile-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center space-x-2">
                <span>User Profile &amp; Settings</span>
                {userProfile.isLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {displayEmail}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 text-xs font-semibold"
            id="profile-modal-close-btn"
            title="Close"
            aria-label="Close"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-change-password"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-personal-details"
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal &amp; Phone Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-cloud-sync"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cloud &amp; Global Sync</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-130px)] space-y-4">
          {/* TAB 1: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              {!userProfile.isLoggedIn ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Sign in to Change Password</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      You are currently exploring in 7-Day Free Trial Guest Mode. Please sign in or register your account to set or update your password.
                    </p>
                  </div>
                  {onOpenAuth && (
                    <div className="pt-1 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth('login');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth('register');
                        }}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Register Account</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3 text-xs text-indigo-900 flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-indigo-950">Secure Password Management</span>
                      <span className="text-[11px] text-indigo-800 leading-snug block mt-0.5">
                        Update your login credentials. Your mock test progress, score history, and study data will remain completely intact.
                      </span>
                    </div>
                  </div>

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-medium">{passwordError}</span>
                    </div>
                  )}

                  {/* Current Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your existing password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        id="profile-current-password-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                      <span>New Password</span>
                      <span className="text-[10px] text-slate-400 font-normal">Min 6 characters</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        id="profile-new-password-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type your new password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        id="profile-confirm-password-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                    id="save-new-password-btn"
                  >
                    <Key className="w-4 h-4" />
                    <span>{isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL & PHONE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{profileSuccess}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="profile-name-field"
                  />
                </div>
              </div>

              {/* Email Address (Read-only / Masked) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    readOnly
                    value={displayEmail}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 cursor-not-allowed select-none"
                    id="profile-email-field"
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">For SMS / WhatsApp STET Updates</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="profile-phone-field"
                  />
                </div>
              </div>

              {/* Target STET Exam - Strictly the 3 uploaded exams */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Target STET Exam Stream</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    3 Uploaded Exam Streams
                  </span>
                </div>

                {/* Dropdown Select for the 3 Uploaded Exams */}
                <select
                  value={selectedExamTrack}
                  onChange={(e) => handleSelectExamOption(e.target.value as ExamTrack)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  id="profile-target-exam-select"
                >
                  {UPLOADED_EXAM_CHOICES.map((choice) => (
                    <option key={choice.trackId} value={choice.trackId}>
                      {choice.title} — {choice.paperLevel} ({choice.questionBankCount})
                    </option>
                  ))}
                </select>

                {/* Visual Cards for the 3 Uploaded Exams */}
                <div className="space-y-2 pt-1" id="profile-uploaded-exam-cards">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select your primary preparation track:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {UPLOADED_EXAM_CHOICES.map((choice) => {
                      const isSelected = selectedExamTrack === choice.trackId;
                      return (
                        <div
                          key={choice.trackId}
                          onClick={() => handleSelectExamOption(choice.trackId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectExamOption(choice.trackId);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                          }`}
                          id={`profile-exam-card-${choice.trackId}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2.5">
                              <div
                                className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'border-2 border-slate-300 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                                    {choice.title}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                      choice.trackId === 'prt'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : choice.trackId === 'gt-maths-science'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    }`}
                                  >
                                    {choice.badge}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                                  <span className="inline-flex items-center text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                    <FileCheck className="w-3 h-3 mr-1" />
                                    {choice.uploadedPapersLabel}
                                  </span>
                                  <span className="inline-flex items-center text-slate-700 font-medium px-1.5 py-0.5 rounded bg-slate-100">
                                    {choice.questionBankCount}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-tight pt-0.5">
                                  <span className="font-semibold text-slate-700">Subjects:</span> {choice.subjectsSummary}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0 self-start">
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  id="save-profile-details-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile & Exam Choice'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CLOUD & GLOBAL SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-md">
                <div className="flex items-center space-x-2 text-cyan-300 font-extrabold text-sm mb-1.5">
                  <Globe className="w-4 h-4 text-cyan-300" />
                  <h4>Force Global Synchronization</h4>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Clears local storage caches for questions and profile metrics, and executes an authoritative deep-fetch from Cloud Firestore to guarantee cross-system parity.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Authoritative Firestore Deep-Fetch</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Directly reads <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">/clients</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">/profiles</code>, and question collections from Cloud Firestore.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Cache Invalidation</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Wipes browser CacheStorage and question bank memory caches so you immediately see the full 3,573+ question repository without needing a hard reload.
                    </p>
                  </div>
                </div>

                {syncFeedback && (
                  <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start space-x-2.5 ${
                    syncFeedback.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    {syncFeedback.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{syncFeedback.message}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTriggerForceGlobalSync}
                  disabled={isSyncingGlobal}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                  id="modal-trigger-force-global-sync-btn"
                >
                  <Globe className={`w-4 h-4 text-cyan-200 ${isSyncingGlobal ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGlobal ? 'Performing Deep Fetch from Firestore...' : 'Execute Force Global Sync Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick close button at bottom */}
          <div className="pt-4 border-t border-slate-100 text-center mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer inline-flex items-center space-x-1"
              id="profile-modal-dismiss-btn"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss &amp; Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
