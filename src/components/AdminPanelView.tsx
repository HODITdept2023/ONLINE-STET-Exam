import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Users,
  User,
  UserPlus,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Plus,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Laptop,
  Smartphone,
  Key,
  Lock,
  Mail,
  Phone,
  ArrowUpRight,
  X,
  Sparkles,
  LogOut,
  UserCheck,
  UserX,
  FileSpreadsheet,
  QrCode,
  CreditCard,
  Upload,
  Image as ImageIcon,
  Send,
  Check,
  Crown,
  MessageCircle,
  FileText,
  FileDown,
  CheckCheck,
  Copy,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Award,
  Star,
  RotateCcw,
  HelpCircle,
  FolderDown,
  Info,
  BookmarkCheck,
  Eye,
  EyeOff,
  ArrowRight,
  MapPin,
  Coins,
  Zap,
  Globe,
  Camera,
  Compass,
  PowerOff,
  ChevronDown,
  UploadCloud,
  FileJson,
  Database,
} from 'lucide-react';
import {
  UserProfile,
  LoginAuditLog,
  ClientRecord,
  AdminPaymentConfig,
  AdvisoryMember,
  ContributorCategory,
  SuggestedRoleTitle,
  FellowshipApplication,
  CouncilSettings,
  PaymentSubmissionRecord,
  ExamTrack,
} from '../types';
import {
  isAdminUser,
  isProtectedAdminEmail,
  getLoginAuditLogs,
  recordLoginAudit,
  clearLoginAuditLogs,
  getAllClients,
  saveClients,
  updateClient,
  extendClientTrial,
  createClient,
  deleteClient,
  getAdminPaymentConfig,
  saveAdminPaymentConfig,
  activatePaidCustomer,
  getPaymentSubmissions,
  savePaymentSubmissions,
  directApprovePaymentSubmission,
  getFreeTierQuestionLimit,
  setFreeTierQuestionLimit,
  terminateSession,
  terminateAllSessions,
  isDummyAccount,
  isDeletedEmail,
  getDeletedEmails,
  addDeletedEmail,
  allocateClientCourse,
  getExamTrackFromTarget,
  getSubscribedCourseTitle,
  getClientAllocatedTrack,
  exportDatabaseJSON,
  exportClientsCSV,
  downloadSampleClientsCSV,
  parseCSVToClients,
  parseImportFileContent,
  importUserDatabase,
  initAuthAndClientSync,
} from '../utils/storage';
import { userDataStore } from '../utils/userDataStore';
import {
  getAdvisoryMembers,
  saveAdvisoryMembers,
  addAdvisoryMember,
  updateAdvisoryMember,
  deleteAdvisoryMember,
  resetAdvisoryMembers,
  getCategoryLabel,
  SUGGESTED_HIGH_SOUNDING_TITLES,
  getCouncilSettings,
  saveCouncilSettings,
  toggleCouncilMembersSection,
  getFellowshipApplications,
  updateFellowshipApplicationStatus,
  updateFellowshipApplication,
  inductFellowshipApplicant,
  deleteFellowshipApplication,
} from '../utils/advisoryStorage';
import { processPassportPhoto } from '../utils/imageUtils';
import { ClickVisitCounter } from './ClickVisitCounter';
import { CreditCounterWidget } from './CreditCounterWidget';
import { AboutMissionAdminEditor } from './AboutMissionAdminEditor';
import { QuestionBankPdfDownloadSection } from './admin/QuestionBankPdfDownloadSection';
import { clientSyncService } from '../services/clientSyncService';
import { firestoreSyncService } from '../services/firestoreSyncService';
import { QUESTION_BANK_1000 } from '../data/examQuestions';

interface AdminPanelViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updater: ((prev: UserProfile) => UserProfile) | UserProfile) => void;
  onOpenAuth: (mode?: 'login' | 'register', initialErrorMessage?: string | null) => void;
  initialSubTab?: 'logins' | 'clients' | 'payment' | 'advisory' | 'form-submissions' | 'fellowship-applications' | 'credits' | 'about-mission' | 'questions';
  onNavigate?: (tab: string, extraState?: any) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenAuth,
  initialSubTab,
  onNavigate,
}) => {
  // Navigation between the requested sections:
  // 1. "check who are all logging in" (login-activity)
  // 2. "separate client management section" (clients)
  // 3. "payment gateway & gpay scanner settings" (payment)
  // 4. "advisory board section & contributing authors" (advisory)
  // 5. "paid and form filled category" (form-submissions)
  // 6. "fellowship application page submissions & approval" (fellowship-applications)
  // 7. "counter to show total credits spent so far in admin hub" (credits)
  // 8. "vision, mission, about app & team editor" (about-mission)
  // 9. "download option for downloading all 1000 questions in pdf format for all streams & re-upload" (questions)
  const [activeSubTab, setActiveSubTab] = useState<'logins' | 'clients' | 'payment' | 'advisory' | 'form-submissions' | 'fellowship-applications' | 'credits' | 'about-mission' | 'questions'>(initialSubTab || 'logins');

  // Paid & Form Filled Submissions State
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmissionRecord[]>(() => getPaymentSubmissions());
  const [subSearchQuery, setSubSearchQuery] = useState<string>('');
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'pending_approval' | 'approved'>('all');

  // Fellowship Applications State
  const [fellowshipSearchQuery, setFellowshipSearchQuery] = useState<string>('');
  const [fellowshipStatusFilter, setFellowshipStatusFilter] = useState<'all' | 'pending' | 'inducted'>('all');

  // Advisory Board & Contributors State
  const [advisoryMembers, setAdvisoryMembers] = useState<AdvisoryMember[]>(() => getAdvisoryMembers());
  const [advisorySearchQuery, setAdvisorySearchQuery] = useState<string>('');
  const [advisoryCategoryFilter, setAdvisoryCategoryFilter] = useState<ContributorCategory | 'all'>('all');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<AdvisoryMember | null>(null);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState<boolean>(true);

  // Council Settings & Fellowship Applications State
  const [councilSettings, setCouncilSettings] = useState<CouncilSettings>(() => getCouncilSettings());
  const [fellowshipApps, setFellowshipApps] = useState<FellowshipApplication[]>(() => getFellowshipApplications());
  const [advisoryViewSection, setAdvisoryViewSection] = useState<'members' | 'fellowship-apps'>('members');
  const [inspectingApp, setInspectingApp] = useState<FellowshipApplication | null>(null);
  const [decidedAppPosition, setDecidedAppPosition] = useState<string>('');
  const [decidedAppCategory, setDecidedAppCategory] = useState<ContributorCategory>('contributing-authors');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleCouncilVisibility = () => {
    const updated = toggleCouncilMembersSection();
    setCouncilSettings(updated);
    showToast(updated ? 'Council section is now visible on public app' : 'Council section is now hidden from public app');
  };

  // Admin Fellowship Applicant Editing State
  const [appEditName, setAppEditName] = useState<string>('');
  const [appEditHonorific, setAppEditHonorific] = useState<string>('Dr.');
  const [appEditEmail, setAppEditEmail] = useState<string>('');
  const [appEditPhone, setAppEditPhone] = useState<string>('');
  const [appEditAffiliation, setAppEditAffiliation] = useState<string>('');
  const [appEditLocation, setAppEditLocation] = useState<string>('');
  const [appEditHighestQualification, setAppEditHighestQualification] = useState<string>('');
  const [appEditCustomCredentials, setAppEditCustomCredentials] = useState<string>('');
  const [appEditSpecialization, setAppEditSpecialization] = useState<string>('');
  const [appEditExperienceYears, setAppEditExperienceYears] = useState<string>('0');
  const [appEditBriefExperienceAndBio, setAppEditBriefExperienceAndBio] = useState<string>('');
  const [appEditStatementOfPedagogy, setAppEditStatementOfPedagogy] = useState<string>('');
  const [appEditProfileLink, setAppEditProfileLink] = useState<string>('');
  const [appEditPhotoUrl, setAppEditPhotoUrl] = useState<string>('');
  const [appEditAdminNotes, setAppEditAdminNotes] = useState<string>('');
  const [isEditingAppForm, setIsEditingAppForm] = useState<boolean>(false);
  const [isProcessingAdminPhoto, setIsProcessingAdminPhoto] = useState<boolean>(false);
  const adminPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleOpenInspectApp = (app: FellowshipApplication) => {
    setInspectingApp(app);
    const initialPos = app.adminAssignedRoleTitle 
      || (app.preferredPosition && !app.preferredPosition.includes('Pending') && !app.preferredPosition.includes('Open') 
          ? app.preferredPosition 
          : app.preferredCategory === 'advisory-board' 
            ? 'Distinguished Advisory Board Member' 
            : 'Distinguished Contributing Author');
    setDecidedAppPosition(initialPos);
    setDecidedAppCategory(app.adminAssignedCategory || app.preferredCategory || 'advisory-board');

    // Populate all editable fields
    setAppEditName(app.name || '');
    setAppEditHonorific(app.honorific || 'Dr.');
    setAppEditEmail(app.email || '');
    setAppEditPhone(app.phone || '');
    setAppEditAffiliation(app.affiliation || '');
    setAppEditLocation(app.location || '');
    setAppEditHighestQualification(app.highestQualification || '');
    setAppEditCustomCredentials(app.customCredentials || '');
    setAppEditSpecialization(app.specializationDomain || '');
    setAppEditExperienceYears(String(app.experienceYears || '0'));
    setAppEditBriefExperienceAndBio(app.briefExperienceAndBio || '');
    setAppEditStatementOfPedagogy(app.statementOfPedagogy || '');
    setAppEditProfileLink(app.profileLink || '');
    setAppEditPhotoUrl(app.photoUrl || '');
    setAppEditAdminNotes(app.adminNotes || '');
    setIsEditingAppForm(false);
  };

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingAdminPhoto(true);
    try {
      const processed = await processPassportPhoto(file);
      setAppEditPhotoUrl(processed);
      if (inspectingApp) {
        const updated = updateFellowshipApplication(inspectingApp.id, { photoUrl: processed });
        if (updated) {
          setInspectingApp(updated);
          setFellowshipApps(getFellowshipApplications());
          showToast('Passport photograph updated for applicant.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process photo');
    } finally {
      setIsProcessingAdminPhoto(false);
      if (adminPhotoInputRef.current) adminPhotoInputRef.current.value = '';
    }
  };

  const handleAdminRemovePhoto = () => {
    setAppEditPhotoUrl('');
    if (inspectingApp) {
      const updated = updateFellowshipApplication(inspectingApp.id, { photoUrl: '' });
      if (updated) {
        setInspectingApp(updated);
        setFellowshipApps(getFellowshipApplications());
        showToast('Passport photograph removed.');
      }
    }
  };

  const handleSaveAppEdits = () => {
    if (!inspectingApp) return;
    const updated = updateFellowshipApplication(inspectingApp.id, {
      name: appEditName.trim() || inspectingApp.name,
      honorific: appEditHonorific.trim() || inspectingApp.honorific,
      email: appEditEmail.trim() || inspectingApp.email,
      phone: appEditPhone.trim() || inspectingApp.phone,
      affiliation: appEditAffiliation.trim() || inspectingApp.affiliation,
      location: appEditLocation.trim() || inspectingApp.location,
      highestQualification: appEditHighestQualification.trim() || inspectingApp.highestQualification,
      customCredentials: appEditCustomCredentials.trim() || undefined,
      specializationDomain: appEditSpecialization.trim() || inspectingApp.specializationDomain,
      experienceYears: appEditExperienceYears.trim() || inspectingApp.experienceYears,
      briefExperienceAndBio: appEditBriefExperienceAndBio.trim() || undefined,
      statementOfPedagogy: appEditStatementOfPedagogy.trim() || inspectingApp.statementOfPedagogy,
      profileLink: appEditProfileLink.trim() || undefined,
      photoUrl: appEditPhotoUrl || undefined,
      adminNotes: appEditAdminNotes.trim() || undefined,
      adminAssignedRoleTitle: decidedAppPosition,
      adminAssignedCategory: decidedAppCategory,
    });
    if (updated) {
      setInspectingApp(updated);
      setFellowshipApps(getFellowshipApplications());
      showToast(`Applicant ${updated.name}'s details & credentials updated.`);
      setIsEditingAppForm(false);
    }
  };

  const handleInductApplicant = (app: FellowshipApplication) => {
    // Commit any in-progress edits first
    const updatedBeforeInduction = updateFellowshipApplication(app.id, {
      name: appEditName.trim() || app.name,
      honorific: appEditHonorific.trim() || app.honorific,
      email: appEditEmail.trim() || app.email,
      phone: appEditPhone.trim() || app.phone,
      affiliation: appEditAffiliation.trim() || app.affiliation,
      location: appEditLocation.trim() || app.location,
      highestQualification: appEditHighestQualification.trim() || app.highestQualification,
      customCredentials: appEditCustomCredentials.trim() || undefined,
      specializationDomain: appEditSpecialization.trim() || app.specializationDomain,
      experienceYears: appEditExperienceYears.trim() || app.experienceYears,
      briefExperienceAndBio: appEditBriefExperienceAndBio.trim() || undefined,
      statementOfPedagogy: appEditStatementOfPedagogy.trim() || app.statementOfPedagogy,
      profileLink: appEditProfileLink.trim() || undefined,
      photoUrl: appEditPhotoUrl || app.photoUrl || undefined,
      adminNotes: appEditAdminNotes.trim() || undefined,
    }) || app;

    const inducted = inductFellowshipApplicant(updatedBeforeInduction.id, decidedAppPosition, decidedAppCategory);
    if (inducted) {
      setAdvisoryMembers(getAdvisoryMembers());
      setFellowshipApps(getFellowshipApplications());
      setInspectingApp(null);
      showToast(`Success! ${updatedBeforeInduction.name} is now approved & published live on the Academic Advisory Board.`);
    }
  };

  const handleUpdateAppStatus = (appId: string, status: any) => {
    updateFellowshipApplicationStatus(appId, status);
    setAdvisoryMembers(getAdvisoryMembers());
    setFellowshipApps(getFellowshipApplications());
    if (inspectingApp && inspectingApp.id === appId) {
      setInspectingApp({ ...inspectingApp, status });
    }
    if (status === 'approved' || status === 'inducted') {
      showToast('Applicant approved & published to Academic Advisory Board directory!');
    } else if (status === 'under_review') {
      showToast('Application marked as Under Review');
    } else if (status === 'declined') {
      showToast('Application marked as Declined');
    }
  };

  const handleDeleteApp = (appId: string) => {
    deleteFellowshipApplication(appId);
    setFellowshipApps(getFellowshipApplications());
    if (inspectingApp?.id === appId) {
      setInspectingApp(null);
    }
    showToast('Application deleted');
  };

  // Form State for Add/Edit Member
  const [memberFormHonorific, setMemberFormHonorific] = useState<string>('Dr.');
  const [memberFormName, setMemberFormName] = useState<string>('');
  const [memberFormRoleTitle, setMemberFormRoleTitle] = useState<string>('Senior Advisory Board Member');
  const [memberFormCategory, setMemberFormCategory] = useState<ContributorCategory>('advisory-board');
  const [memberFormAffiliation, setMemberFormAffiliation] = useState<string>('');
  const [memberFormCredentials, setMemberFormCredentials] = useState<string>('');
  const [memberFormBio, setMemberFormBio] = useState<string>('');
  const [memberFormContributions, setMemberFormContributions] = useState<string>('');
  const [memberFormAvatarUrl, setMemberFormAvatarUrl] = useState<string>('');
  const [memberFormBadge, setMemberFormBadge] = useState<string>('Board Member');
  const [memberFormEmail, setMemberFormEmail] = useState<string>('');
  const [memberFormFeatured, setMemberFormFeatured] = useState<boolean>(false);
  const [memberFormActive, setMemberFormActive] = useState<boolean>(true);

  // Login Audit State
  const [loginLogs, setLoginLogs] = useState<LoginAuditLog[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [logProviderFilter, setLogProviderFilter] = useState<'all' | 'google' | 'password'>('all');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isRefreshingLogs, setIsRefreshingLogs] = useState<boolean>(false);

  // Client Management State
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'trial' | 'active' | 'expired' | 'suspended'>('all');
  const [clientExamFilter, setClientExamFilter] = useState<string>('all');
  const [candidateToDelete, setCandidateToDelete] = useState<ClientRecord | null>(null);
  const [isDeletingCandidate, setIsDeletingCandidate] = useState<boolean>(false);

  // Quick Paid Customer Activation State
  const [quickPaidEmail, setQuickPaidEmail] = useState<string>('');
  const [quickPaidPhone, setQuickPaidPhone] = useState<string>('');
  const [quickPaidName, setQuickPaidName] = useState<string>('');
  const [quickPaidDays, setQuickPaidDays] = useState<number>(365);
  const [quickPaidNotes, setQuickPaidNotes] = useState<string>('Payment verified on WhatsApp screenshot');
  const [isActivatingPaid, setIsActivatingPaid] = useState<boolean>(false);

  // Free question usage limit management
  const [adminQuestionLimit, setAdminQuestionLimit] = useState<number>(() => getFreeTierQuestionLimit());

  const handleSaveQuestionLimit = (limitVal: number) => {
    setFreeTierQuestionLimit(limitVal);
    setAdminQuestionLimit(limitVal);
    showToast(`Free usage limit set to ${limitVal} questions! Unsubscribed users will see subscription popup after ${limitVal} questions.`);
  };

  // Direct 1-click Revoke Paid
  const handleDirectRevokePaid = (client: ClientRecord) => {
    const updated = userDataStore.toggleClientPaidStatus(client.id, false);
    setClients(updated);
    if (userProfile.email && userProfile.email.toLowerCase() === client.email.toLowerCase()) {
      onUpdateProfile((prev) => ({
        ...prev,
        isPaid: false,
        paidStreams: [],
      }));
    }
    showToast(`Pro Paid Active disabled for ${client.name}.`);
  };

  // Payment Gateway & GPay Scanner Settings State
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentConfig>(() => getAdminPaymentConfig());
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);
  const [copiedTestPhone, setCopiedTestPhone] = useState<boolean>(false);

  // Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [isImportDatabaseModalOpen, setIsImportDatabaseModalOpen] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importFileName, setImportFileName] = useState<string>('');
  const [parsedImportData, setParsedImportData] = useState<{
    type: 'json' | 'csv';
    records: Partial<ClientRecord>[];
    totalFound: number;
    rawPayload?: any;
  } | null>(null);
  const [isExecutingImport, setIsExecutingImport] = useState<boolean>(false);
  const [importFileError, setImportFileError] = useState<string | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientRecord | null>(null);

  // New Client Form (Synchronized with Register Now 5-step format)
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientLoginId, setNewClientLoginId] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientTargetExam, setNewClientTargetExam] = useState<string>('Sikkim Primary Teacher (PRT - Paper I)');
  const [newClientTrialDays, setNewClientTrialDays] = useState<number>(7);
  const [newClientNotes, setNewClientNotes] = useState<string>('');
  const [showAddClientAdvanced, setShowAddClientAdvanced] = useState<boolean>(false);
  const [isRefreshingClients, setIsRefreshingClients] = useState<boolean>(false);

  // Load data
  const loadData = async () => {
    // Sync logs from server if possible, fallback to local storage
    fetch('/api/admin/logins')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          // Merge with client-side logs
          const localLogs = getLoginAuditLogs();
          const merged = [...data.logs];
          localLogs.forEach((ll) => {
            if (!merged.some((m) => m.id === ll.id)) {
              merged.push(ll);
            }
          });
          merged.sort((a, b) => b.timestamp - a.timestamp);
          setLoginLogs(merged);
        } else {
          setLoginLogs(getLoginAuditLogs());
        }
      })
      .catch(() => {
        setLoginLogs(getLoginAuditLogs());
      });

    setClients(getAllClients());
    setFellowshipApps(getFellowshipApplications());
    setAdvisoryMembers(getAdvisoryMembers());

    // 1. Sync tombstoned deleted emails first and wait
    try {
      const delRes = await fetch('/api/deleted-emails');
      if (delRes.ok) {
        const delData = await delRes.json();
        if (delData && Array.isArray(delData.deletedEmails)) {
          delData.deletedEmails.forEach((email: string) => addDeletedEmail(email));
        }
      }
    } catch {}

    // 2. Authoritative modular sync across cloud and local storage
    try {
      const syncRes = await clientSyncService.syncAll();
      setClients(syncRes.clients);
    } catch {
      setClients(getAllClients());
    }

    // Sync advisory members and applications from server
    fetch('/api/advisory-members')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.members) && data.members.length > 0) {
          setAdvisoryMembers(data.members);
        }
      })
      .catch(() => {});

    fetch('/api/fellowship-applications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.applications)) {
          const isDummy = (a: any) => !a || a.id === 'app-seed-001' || a.id === 'app-seed-002' || a.id === 'app-seed-003' || (typeof a.id === 'string' && a.id.startsWith('app-seed-'));
          const clean = data.applications.filter((a: any) => !isDummy(a));
          setFellowshipApps(clean);
        }
      })
      .catch(() => {});
  };

  const handleRefreshClients = async () => {
    setIsRefreshingClients(true);
    try {
      const res = await clientSyncService.syncAll();
      if (res && Array.isArray(res.clients)) {
        setClients([...res.clients]);
      } else {
        setClients(getAllClients());
      }
      showToast(`Aspirant registry fully synchronized with cloud! ${res.count || res.clients?.length} accounts loaded.`);
    } catch {
      setClients(getAllClients());
      showToast('Refresh completed.');
    } finally {
      setIsRefreshingClients(false);
    }
  };

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    loadData();
    // Periodically sync trial accounts & active sessions created on other browsers/devices
    const autoSyncInterval = setInterval(() => {
      loadData();
    }, 10000);

    const handleSubsUpdate = () => {
      setPaymentSubmissions(getPaymentSubmissions());
      setClients(getAllClients());
    };
    const handleFellowshipUpdate = () => {
      setFellowshipApps(getFellowshipApplications());
      setAdvisoryMembers(getAdvisoryMembers());
    };
    const handleClientsUpdate = (e?: any) => {
      if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setClients(e.detail);
      } else {
        setClients(getAllClients());
      }
    };
    window.addEventListener('studeezone_payment_submissions_updated', handleSubsUpdate);
    window.addEventListener('studeezone_fellowship_applications_updated', handleFellowshipUpdate);
    window.addEventListener('studeezone_advisory_members_updated', handleFellowshipUpdate);
    window.addEventListener('studeezone_advisory_updated', handleFellowshipUpdate);
    window.addEventListener('studeezone_clients_updated', handleClientsUpdate);
    window.addEventListener('studeezone_users_updated', handleClientsUpdate);
    window.addEventListener('storage', handleClientsUpdate);
    const unsubscribeStore = userDataStore.subscribe((detail) => {
      if (Array.isArray(detail.clients) && detail.clients.length > 0) {
        setClients(detail.clients);
      }
    });

    return () => {
      clearInterval(autoSyncInterval);
      unsubscribeStore();
      window.removeEventListener('studeezone_payment_submissions_updated', handleSubsUpdate);
      window.removeEventListener('studeezone_fellowship_applications_updated', handleFellowshipUpdate);
      window.removeEventListener('studeezone_advisory_members_updated', handleFellowshipUpdate);
      window.removeEventListener('studeezone_advisory_updated', handleFellowshipUpdate);
      window.removeEventListener('studeezone_clients_updated', handleClientsUpdate);
      window.removeEventListener('studeezone_users_updated', handleClientsUpdate);
      window.removeEventListener('storage', handleClientsUpdate);
    };
  }, []);

  const handleDirectApprove = (submissionId: string) => {
    try {
      const res = directApprovePaymentSubmission(submissionId, userProfile.email || 'Sabu Tamang');
      setPaymentSubmissions(getPaymentSubmissions());
      setClients(getAllClients());
      showToast(res.message);
    } catch (err: any) {
      alert(err?.message || 'Direct approval failed');
    }
  };

  const handleRefreshLogs = () => {
    setIsRefreshingLogs(true);
    setTimeout(() => {
      loadData();
      setIsRefreshingLogs(false);
      showToast('Live login activity feed refreshed');
    }, 400);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear the login audit history?')) {
      clearLoginAuditLogs();
      fetch('/api/admin/logins', { method: 'DELETE' }).catch(() => {});
      setLoginLogs([]);
      showToast('Login logs cleared successfully');
    }
  };

  // Terminate Single Active Session
  const handleTerminateSingleSession = (logId: string, userEmail?: string, userName?: string) => {
    terminateSession(logId, userEmail);
    setLoginLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, status: 'completed' as const } : l)));
    showToast(`Active session for ${userName || userEmail || 'candidate'} terminated successfully`);
  };

  // Terminate All Active Candidate Sessions
  const handleTerminateAllSessions = () => {
    if (window.confirm('Are you sure you want to terminate all candidate active sessions? Active candidates will be signed out.')) {
      terminateAllSessions();
      setLoginLogs((prev) =>
        prev.map((l) => (l.status === 'active' && !isProtectedAdminEmail(l.userEmail) ? { ...l, status: 'completed' as const } : l))
      );
      showToast('All candidate active sessions terminated');
    }
  };

  // Extend Trial
  const handleExtendTrial = (client: ClientRecord, days: number = 7) => {
    const updated = userDataStore.extendClientTrial(client.id, days);
    setClients(updated);
    showToast(`Extended ${client.name}'s trial by +${days} days`);
  };

  // Status Change
  const handleStatusChange = (client: ClientRecord, newStatus: 'trial' | 'active' | 'expired' | 'suspended') => {
    const updated = userDataStore.updateClientAndSync(client.id, {
      status: newStatus,
      isPaid: newStatus === 'active',
      trialDaysRemaining: newStatus === 'active' ? 365 : newStatus === 'expired' ? 0 : client.trialDaysRemaining,
      notes: `${client.notes || ''} • Status set to ${newStatus} by admin on ${new Date().toLocaleDateString()}`,
    });
    setClients(updated);
    showToast(`Updated status for ${client.name} to ${newStatus}`);
  };

  // Allocate specific course/stream to candidate
  const handleAllocateCourse = async (client: ClientRecord, newTrack: ExamTrack) => {
    try {
      const updated = userDataStore.allocateClientTrack(client.id, newTrack);
      setClients(updated);
      clientSyncService.allocateCourse(client.id, newTrack).catch(() => {});
      showToast(`Course allocated for ${client.name}: ${getSubscribedCourseTitle(newTrack)}`);
    } catch {
      allocateClientCourse(client.id, newTrack);
      setClients(getAllClients());
    }
  };

  // Delete Client permanently
  const handleDeleteClient = (client: ClientRecord) => {
    if (isProtectedAdminEmail(client.email)) {
      showToast('The primary administrator account cannot be deleted.');
      return;
    }
    setCandidateToDelete(client);
  };

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    const client = candidateToDelete;
    setIsDeletingCandidate(true);
    try {
      const updated = deleteClient(client.id, client.email, client.loginId, client.name);
      setClients(updated);
      showToast(`Candidate "${client.name}" permanently deleted.`);

      const q = new URLSearchParams();
      if (client.email) q.set('email', client.email);
      if (client.loginId) q.set('loginId', client.loginId);
      if (client.name) q.set('name', client.name);
      const qs = q.toString() ? `?${q.toString()}` : '';

      await Promise.all([
        fetch(`/api/clients/${encodeURIComponent(client.id)}${qs}`, { method: 'DELETE' }),
        client.email ? fetch(`/api/users/${encodeURIComponent(client.email)}${qs}`, { method: 'DELETE' }) : Promise.resolve(),
        fetch('/api/deleted-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: client.email, loginId: client.loginId, id: client.id, name: client.name }),
        }),
      ]);
    } catch (err) {
      console.error('Failed to sync deletion with server:', err);
    } finally {
      setIsDeletingCandidate(false);
      setCandidateToDelete(null);
      setClients(getAllClients());
    }
  };

  // Create Client Submit (Unified with Register Now 5-Step Process)
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      alert('Please enter candidate name and email address');
      return;
    }

    const finalEmail = newClientEmail.trim().toLowerCase();
    const finalPhone = newClientPhone.trim();
    const finalLoginId = (newClientLoginId.trim() || finalEmail).toLowerCase();
    const finalPassword = finalPhone || 'stet123456';

    const created = createClient({
      name: newClientName.trim(),
      email: finalEmail,
      loginId: finalLoginId,
      password: finalPassword,
      targetExam: newClientTargetExam,
      trialDaysRemaining: Number(newClientTrialDays) || 7,
      status: 'trial',
      phone: finalPhone,
      notes: newClientNotes.trim() || 'Created via Admin Add Client candidate form.',
    });
    setClients(getAllClients());
    setIsAddClientModalOpen(false);
    // Reset form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientLoginId('');
    setNewClientPhone('');
    setNewClientNotes('');
    setShowAddClientAdvanced(false);
    showToast(`Client ${created.name} registered! User ID: ${finalLoginId} | Password: ${finalPassword}`);
  };

  // Edit Client Submit (Admin can change login ID and password)
  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const isProPaid = Boolean(editingClient.isPaid || editingClient.status === 'active');
    const cleanEmail = (editingClient.email || '').trim().toLowerCase();
    const cleanLoginId = (editingClient.loginId || cleanEmail).trim().toLowerCase();
    const cleanPassword = (editingClient.password !== undefined ? editingClient.password : (editingClient.phone || '')).trim();

    const updated = userDataStore.updateClientAndSync(editingClient.id, {
      name: editingClient.name.trim(),
      email: cleanEmail,
      loginId: cleanLoginId,
      password: cleanPassword,
      phone: editingClient.phone ? editingClient.phone.trim() : '',
      targetExam: editingClient.targetExam,
      trialDaysRemaining: Number(editingClient.trialDaysRemaining),
      notes: editingClient.notes,
      status: isProPaid ? 'active' : (editingClient.status === 'active' ? 'trial' : editingClient.status),
      isPaid: isProPaid,
      paidStreams: isProPaid
        ? [getExamTrackFromTarget(editingClient.targetExam)]
        : [],
    });
    setClients(updated);

    // If edited client is the currently active userProfile, synchronize state immediately
    if (userProfile.email && userProfile.email.toLowerCase() === cleanEmail) {
      const assignedTrack = getExamTrackFromTarget(editingClient.targetExam);
      onUpdateProfile((prev) => ({
        ...prev,
        isPaid: isProPaid,
        role: isSuperAdmin ? 'admin' : (isProPaid ? 'subscriber' : 'candidate'),
        targetExam: editingClient.targetExam,
        selectedExamTrack: assignedTrack,
        paidStreams: isProPaid ? [assignedTrack] : [],
      }));
    }

    setEditingClient(null);
    setShowEditPassword(false);
    showToast(`Client ${editingClient.name} updated! Login ID: ${cleanLoginId} | Password: ${cleanPassword}`);
  };

  // Quick Paid Customer Activation ("add the paid customers email id and phone number in my admin panel to enable the complete access")
  const handleQuickActivatePaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPaidEmail.trim() || !quickPaidEmail.includes('@')) {
      alert('Please enter a valid candidate email address to enable complete access.');
      return;
    }
    setIsActivatingPaid(true);

    try {
      const res = activatePaidCustomer({
        email: quickPaidEmail.trim(),
        phone: quickPaidPhone.trim(),
        name: quickPaidName.trim(),
        notes: quickPaidNotes.trim() || 'Paid Pro Customer activated by Admin',
        planDurationDays: Number(quickPaidDays) || 365,
        amount: paymentSettings.subscriptionPrice,
      });

      setClients(getAllClients());
      userDataStore.notify('payment_approved', undefined, quickPaidEmail.trim());
      setQuickPaidEmail('');
      setQuickPaidPhone('');
      setQuickPaidName('');
      setQuickPaidNotes('Payment verified on WhatsApp screenshot');
      showToast(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to activate paid customer');
    } finally {
      setIsActivatingPaid(false);
    }
  };

  // Direct 1-Click Upgrade to Paid Pro for an existing client in the directory table
  const handleDirectGrantPaid = async (client: ClientRecord) => {
    try {
      const track: ExamTrack = getClientAllocatedTrack(client);
      const courseTitle = getSubscribedCourseTitle(track);
      const res = activatePaidCustomer({
        email: client.email,
        phone: client.phone,
        name: client.name,
        notes: `Upgraded to Paid Pro from Admin Hub for ${courseTitle} on ${new Date().toLocaleDateString()}`,
        planDurationDays: 365,
        amount: paymentSettings.subscriptionPrice,
        streamTrack: track,
      });
      userDataStore.notify('payment_approved', client.id, client.email);
      const syncRes = await clientSyncService.syncAll();
      setClients(syncRes.clients);
      showToast(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to activate client');
    }
  };

  // GPay QR Scanner Image File Upload
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('The image is too large. Please upload an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updated = {
        ...paymentSettings,
        qrScannerImageUrl: base64,
      };
      setPaymentSettings(updated);
      saveAdminPaymentConfig(updated);
      showToast('GPay Scanner image uploaded and saved successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrImage = () => {
    const updated = {
      ...paymentSettings,
      qrScannerImageUrl: '',
    };
    setPaymentSettings(updated);
    saveAdminPaymentConfig(updated);
    showToast('Custom QR scanner image removed (restored standard payment code)');
  };

  // Save Payment Configuration
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      const saved = saveAdminPaymentConfig(paymentSettings);
      setPaymentSettings(saved);
      showToast('Payment settings, UPI ID & admin phone number updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save payment settings');
    } finally {
      setTimeout(() => setIsSavingPayment(false), 300);
    }
  };

  const handleCopyTestPhone = () => {
    navigator.clipboard.writeText(paymentSettings.adminPhone);
    setCopiedTestPhone(true);
    setTimeout(() => setCopiedTestPhone(false), 2000);
    showToast('Admin contact phone copied to clipboard');
  };

  // Advisory Board & Contributors Handlers
  const handleOpenAddMemberModal = () => {
    setEditingMember(null);
    setMemberFormHonorific('Dr.');
    setMemberFormName('');
    setMemberFormRoleTitle('Senior Advisory Board Member');
    setMemberFormCategory('advisory-board');
    setMemberFormAffiliation('');
    setMemberFormCredentials('');
    setMemberFormBio('');
    setMemberFormContributions('');
    setMemberFormAvatarUrl('');
    setMemberFormBadge('Board Member');
    setMemberFormEmail('');
    setMemberFormFeatured(false);
    setMemberFormActive(true);
    setIsAddMemberModalOpen(true);
  };

  const handleOpenEditMemberModal = (member: AdvisoryMember) => {
    setEditingMember(member);
    setMemberFormHonorific(member.honorific || 'Dr.');
    setMemberFormName(member.name);
    setMemberFormRoleTitle(member.roleTitle);
    setMemberFormCategory(member.category);
    setMemberFormAffiliation(member.affiliation);
    setMemberFormCredentials(member.credentials);
    setMemberFormBio(member.bio);
    setMemberFormContributions(member.contributions ? member.contributions.join('\n') : '');
    setMemberFormAvatarUrl(member.avatarUrl || '');
    setMemberFormBadge(member.badge || '');
    setMemberFormEmail(member.email || '');
    setMemberFormFeatured(Boolean(member.featured));
    setMemberFormActive(member.active !== false);
    setIsAddMemberModalOpen(true);
  };

  const handleApplyTitleSuggestion = (suggestion: SuggestedRoleTitle) => {
    setMemberFormRoleTitle(suggestion.title);
    setMemberFormCategory(suggestion.category);
    setMemberFormBadge(suggestion.recommendedBadge);
    showToast(`Adopted title: "${suggestion.title}"`);
  };

  const handleSaveMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormName.trim()) {
      alert('Please enter member name');
      return;
    }

    const contributionsArray = memberFormContributions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingMember) {
      updateAdvisoryMember(editingMember.id, {
        name: memberFormName.trim(),
        honorific: memberFormHonorific.trim(),
        roleTitle: memberFormRoleTitle.trim(),
        category: memberFormCategory,
        affiliation: memberFormAffiliation.trim(),
        credentials: memberFormCredentials.trim(),
        bio: memberFormBio.trim(),
        contributions: contributionsArray,
        avatarUrl: memberFormAvatarUrl.trim() || undefined,
        badge: memberFormBadge.trim() || undefined,
        email: memberFormEmail.trim() || undefined,
        featured: memberFormFeatured,
        active: memberFormActive,
      });
      setAdvisoryMembers(getAdvisoryMembers());
      setIsAddMemberModalOpen(false);
      setEditingMember(null);
      showToast(`Updated council credentials for ${memberFormName}`);
    } else {
      const added = addAdvisoryMember({
        name: memberFormName.trim(),
        honorific: memberFormHonorific.trim(),
        roleTitle: memberFormRoleTitle.trim(),
        category: memberFormCategory,
        affiliation: memberFormAffiliation.trim(),
        credentials: memberFormCredentials.trim(),
        bio: memberFormBio.trim(),
        contributions: contributionsArray,
        avatarUrl: memberFormAvatarUrl.trim() || undefined,
        badge: memberFormBadge.trim() || undefined,
        email: memberFormEmail.trim() || undefined,
        featured: memberFormFeatured,
        active: memberFormActive,
        order: advisoryMembers.length + 1,
      });
      setAdvisoryMembers(getAdvisoryMembers());
      setIsAddMemberModalOpen(false);
      showToast(`Added ${added.name} as ${added.roleTitle}!`);
    }
  };

  const handleDeleteMember = (member: AdvisoryMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.name} (${member.roleTitle}) from the academic board?`)) {
      deleteAdvisoryMember(member.id);
      setAdvisoryMembers(getAdvisoryMembers());
      showToast(`Removed ${member.name} from advisory board`);
    }
  };

  const handleToggleMemberActive = (member: AdvisoryMember) => {
    updateAdvisoryMember(member.id, { active: !member.active });
    setAdvisoryMembers(getAdvisoryMembers());
    showToast(`${member.name} is now ${member.active ? 'inactive (hidden)' : 'active (visible)'}`);
  };

  const handleToggleMemberFeatured = (member: AdvisoryMember) => {
    updateAdvisoryMember(member.id, { featured: !member.featured });
    setAdvisoryMembers(getAdvisoryMembers());
    showToast(`${member.name} ${member.featured ? 'removed from spotlight' : 'pinned to featured spotlight'}`);
  };

  const handleClearAllCouncilMembers = () => {
    if (window.confirm('Are you sure you want to clear all council members and authors from the registry?')) {
      resetAdvisoryMembers();
      setAdvisoryMembers([]);
      showToast('All council members cleared from directory');
    }
  };

  const handleResetAdvisoryMembers = handleClearAllCouncilMembers;

  // Export Logins CSV
  const handleExportLoginsCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Login ID', 'Role', 'Method', 'Date & Time', 'IP Address', 'Device', 'Location', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.userId,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userEmail,
      l.loginId,
      l.role,
      l.authProvider,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      l.ipAddress,
      `"${l.deviceInfo.replace(/"/g, '""')}"`,
      `"${l.location.replace(/"/g, '""')}"`,
      l.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studeezone_login_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Clients CSV
  const handleExportClientsCSV = () => {
    const headers = ['Client ID', 'Name', 'Email', 'Login ID', 'Target Exam', 'Status', 'Trial Days Left', 'Tests Done', 'Avg Score', 'Registered Date', 'Phone', 'Notes'];
    const rows = filteredClients.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.loginId,
      `"${c.targetExam.replace(/"/g, '""')}"`,
      c.status,
      c.trialDaysRemaining,
      c.testsCompleted,
      `${c.avgScore}%`,
      `"${new Date(c.registeredAt).toLocaleDateString()}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studeezone_clients_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Full JSON Database Backup (Crash Proof)
  const handleExportJSONBackup = () => {
    exportDatabaseJSON();
    showToast('Downloaded full database JSON backup for crash protection.');
  };

  // Export Full CSV Candidate Directory
  const handleExportFullCSV = () => {
    exportClientsCSV();
    showToast('Exported complete candidate database CSV directory.');
  };

  // Download Compiled Chat Corrections & Rebuild Blueprint Document
  const handleDownloadCorrectionsDocument = () => {
    const link = document.createElement('a');
    link.href = '/STET_APP_CORRECTIONS_AND_REBUILD_BLUEPRINT.md';
    link.download = 'STET_APP_CORRECTIONS_AND_REBUILD_BLUEPRINT.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded complete corrections & rebuild blueprint document (.md)!');
  };

  // Open Database Bulk Upload & Restore Modal
  const handleOpenImportModal = () => {
    setImportFileName('');
    setParsedImportData(null);
    setImportFileError(null);
    setImportMode('merge');
    if (importFileInputRef.current) importFileInputRef.current.value = '';
    setIsImportDatabaseModalOpen(true);
  };

  // Handle File Upload & Parsing
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileError(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || '';
        const parsed = parseImportFileContent(text, file.name);
        if (parsed.totalFound === 0) {
          setImportFileError('No candidate records found in file. Please verify CSV or JSON format.');
          setParsedImportData(null);
        } else {
          setParsedImportData(parsed);
        }
      } catch (err: any) {
        setImportFileError(err.message || 'Failed to parse file.');
        setParsedImportData(null);
      }
    };
    reader.onerror = () => {
      setImportFileError('Failed to read file from disk.');
      setParsedImportData(null);
    };
    reader.readAsText(file);
  };

  // Execute Database Bulk Upload / Restore
  const handleExecuteImportDatabase = async () => {
    if (!parsedImportData || parsedImportData.totalFound === 0) {
      setImportFileError('Please select a valid CSV or JSON backup file first.');
      return;
    }
    setIsExecutingImport(true);
    setImportFileError(null);
    try {
      const dataToImport = parsedImportData.rawPayload || parsedImportData.records;
      const res = await importUserDatabase(dataToImport, importMode);
      setClients(getAllClients());
      setIsImportDatabaseModalOpen(false);
      showToast(
        `Successfully bulk imported ${res.total} candidates! (${res.added} new added, ${res.updated} updated). Backup synchronized.`
      );
    } catch (err: any) {
      setImportFileError(err.message || 'Import operation failed.');
    } finally {
      setIsExecutingImport(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return loginLogs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.loginId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(logSearchQuery.toLowerCase());

      const matchesProvider = logProviderFilter === 'all' || log.authProvider === logProviderFilter;
      const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;

      return matchesSearch && matchesProvider && matchesStatus;
    });
  }, [loginLogs, logSearchQuery, logProviderFilter, logStatusFilter]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    const q = (clientSearchQuery || '').toLowerCase().trim();
    return clients.filter((client) => {
      const cName = (client.name || '').toLowerCase();
      const cEmail = (client.email || '').toLowerCase();
      const cLoginId = (client.loginId || '').toLowerCase();
      const cTarget = (client.targetExam || '').toLowerCase();

      const matchesSearch =
        !q ||
        cName.includes(q) ||
        cEmail.includes(q) ||
        cLoginId.includes(q) ||
        cTarget.includes(q);

      const matchesStatus =
        clientStatusFilter === 'all' ||
        (clientStatusFilter === 'form_filled'
          ? Boolean(client.formFilled || (client.paidStreams && client.paidStreams.length > 0) || client.isPaid)
          : clientStatusFilter === 'trial'
          ? (client.status === 'trial' || (!client.isPaid && client.status !== 'active' && !isProtectedAdminEmail(client.email)))
          : clientStatusFilter === 'active'
          ? (client.isPaid || client.status === 'active')
          : client.status === clientStatusFilter);
      const matchesExam =
        clientExamFilter === 'all' ||
        cTarget.includes((clientExamFilter || '').toLowerCase());

      return matchesSearch && matchesStatus && matchesExam;
    });
  }, [clients, clientSearchQuery, clientStatusFilter, clientExamFilter]);

  // Filtered Advisory Members
  const filteredAdvisoryMembers = useMemo(() => {
    const q = advisorySearchQuery.toLowerCase().trim();
    const normQ = q.replace(/distiguished/g, 'distinguished');
    return advisoryMembers.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(normQ) ||
        m.roleTitle.toLowerCase().includes(q) ||
        m.roleTitle.toLowerCase().includes(normQ) ||
        m.affiliation.toLowerCase().includes(q) ||
        m.affiliation.toLowerCase().includes(normQ) ||
        (m.credentials && (m.credentials.toLowerCase().includes(q) || m.credentials.toLowerCase().includes(normQ))) ||
        (m.contributions && m.contributions.some((c) => c.toLowerCase().includes(q) || c.toLowerCase().includes(normQ)));

      const matchesCat = advisoryCategoryFilter === 'all' || m.category === advisoryCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [advisoryMembers, advisorySearchQuery, advisoryCategoryFilter]);

  // Filtered Paid & Form Filled Submissions
  const filteredSubmissions = useMemo(() => {
    return paymentSubmissions.filter((sub) => {
      const q = subSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.email.toLowerCase().includes(q) ||
        sub.phone.toLowerCase().includes(q) ||
        (sub.utrNumber && sub.utrNumber.toLowerCase().includes(q)) ||
        sub.selectedStreamName.toLowerCase().includes(q);

      const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [paymentSubmissions, subSearchQuery, subStatusFilter]);

  const pendingSubmissionsCount = paymentSubmissions.filter((s) => s.status === 'pending_approval').length;
  const approvedSubmissionsCount = paymentSubmissions.filter((s) => s.status === 'approved').length;

  // Filtered Fellowship Applications
  const filteredFellowshipApps = useMemo(() => {
    return fellowshipApps.filter((app) => {
      const q = fellowshipSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.phone && app.phone.toLowerCase().includes(q)) ||
        app.affiliation.toLowerCase().includes(q) ||
        app.specializationDomain.toLowerCase().includes(q) ||
        app.highestQualification.toLowerCase().includes(q) ||
        app.referenceNumber.toLowerCase().includes(q);

      const matchesStatus =
        fellowshipStatusFilter === 'all' ||
        (fellowshipStatusFilter === 'pending'
          ? (app.status === 'submitted' || app.status === 'under_review')
          : app.status === 'inducted');

      return matchesSearch && matchesStatus;
    });
  }, [fellowshipApps, fellowshipSearchQuery, fellowshipStatusFilter]);

  const pendingFellowshipCount = fellowshipApps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
  const inductedFellowshipCount = fellowshipApps.filter((a) => a.status === 'inducted').length;

  // Derived Metrics - strictly limited to authenticated admin accounts
  const isSuperAdmin = Boolean(userProfile.isLoggedIn) && (isAdminUser(userProfile.email) || userProfile.role === 'admin');
  const activeSessionsCount = loginLogs.filter((l) => l.status === 'active').length;
  const uniqueCandidateLogins = new Set(loginLogs.map((l) => l.userEmail)).size;
  const activeTrialsCount = clients.filter((c) => (c.status === 'trial' || (!c.isPaid && c.status !== 'active')) && !isProtectedAdminEmail(c.email)).length;
  const expiredTrialsCount = clients.filter((c) => (c.status === 'expired' || (c.status === 'trial' && (c.trialDaysRemaining || 0) <= 0)) && !c.isPaid && !isProtectedAdminEmail(c.email)).length;
  const proClientsCount = clients.filter((c) => (c.isPaid || c.status === 'active') && !isProtectedAdminEmail(c.email)).length;
  const activeAdvisoryCount = advisoryMembers.filter((m) => m.active !== false).length;
  const authorsCount = advisoryMembers.filter((m) => m.category === 'contributing-authors').length;

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center" id="admin-restricted-screen">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
          </div>
          
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-base font-bold tracking-tight">login with admin credentials</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenAuth('login', 'login with admin credentials')}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center space-x-2"
              id="admin-login-cta-btn"
            >
              <Shield className="w-4 h-4" />
              <span>Login with Admin Credentials</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16" id="admin-panel-container">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Hero Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Super Administrator Portal</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <Activity className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                <span>Real-time Login Auditing Active</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                Admin Control Hub &amp; Client Management
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Master Administrator Console &bull; Monitor live candidate logins, audit session authenticity, and govern client subscription &amp; 7-day free trial lifecycles.
              </p>
            </div>
          </div>

          {/* Admin Status & Quick Shortcut */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Logged in as: Authorized Administrator</span>
            </div>

            <button
              type="button"
              onClick={handleDownloadCorrectionsDocument}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-emerald-400/40 transform hover:scale-102"
              id="hero-download-corrections-doc-btn"
              title="Download compiled document containing all chat corrections, architecture audit, and rebuild blueprint"
            >
              <FileText className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              <span>Download All Corrections &amp; Rebuild Prompt (.md)</span>
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('questions')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 hover:from-indigo-400 hover:to-indigo-600 text-white text-xs font-black shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-indigo-400/40 transform hover:scale-102"
              id="hero-jump-questions-btn"
            >
              <FileDown className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              <span>Question Bank Vault: Download / Upload ({QUESTION_BANK_1000.length} Qs)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('fellowship-applications')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-amber-300 transform hover:scale-102"
              id="hero-jump-fellowship-btn"
            >
              <Award className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Review Fellowship Applicants ({pendingFellowshipCount} New)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Live Credits Spent Counter Banner in Admin Hub */}
      <CreditCounterWidget variant="banner" showAdminReset={true} />

      {/* Main Section Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('logins')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'logins'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Who is Logging In (Login Audit)</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {loginLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'clients'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Separate Client Management</span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('payment')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'payment'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-payment-btn"
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>GPay &amp; Payment Gateway Settings</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {paymentSettings.currency}{paymentSettings.subscriptionPrice}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'advisory'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-advisory-btn"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Advisory Board &amp; Contributors</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {advisoryMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('form-submissions')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'form-submissions'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-form-submissions-btn"
          >
            <CheckCheck className="w-4 h-4 text-amber-800" />
            <span>Paid &amp; Form Filled Category</span>
            {pendingSubmissionsCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingSubmissionsCount} Pending
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {paymentSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('fellowship-applications')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'fellowship-applications'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xs font-black border border-amber-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-fellowship-applications-btn"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Fellowship Applications &amp; Approvals</span>
            {pendingFellowshipCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingFellowshipCount} New
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {fellowshipApps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('credits')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'credits'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-credits-btn"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Total Credits Spent Counter</span>
            <span className="bg-amber-100 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black">
              Live Meter
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('about-mission')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'about-mission'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xs font-black border border-amber-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-about-mission-btn"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Vision, Mission &amp; About Editor</span>
            <span className="bg-amber-100 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black">
              Public Page
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('questions')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'questions'
                ? 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white shadow-xs font-black border border-indigo-400/40'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="admin-subtab-questions-btn"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Question Bank: Download / Upload</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-400/30">
              {QUESTION_BANK_1000.length} Qs
            </span>
          </button>
        </div>

        {/* Global Action depending on subtab */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {activeSubTab === 'credits' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('header-open-chat-tutor-btn');
                  if (el) el.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Test live AI queries to increment counter"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Test AI Credit Spend</span>
              </button>
            </>
          ) : activeSubTab === 'logins' ? (
            <>
              <button
                onClick={handleRefreshLogs}
                disabled={isRefreshingLogs}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Refresh live activity"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Refresh Live</span>
              </button>
              <button
                onClick={handleExportLoginsCSV}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                title="Download CSV report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                title="Clear audit trail"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : activeSubTab === 'clients' ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  setIsRefreshingClients(true);
                  try {
                    const res = await firestoreSyncService.forceGlobalSync();
                    setToastMessage(
                      res.success
                        ? `⚡ Global Sync Complete: Cleared local question & user caches, deep-fetched ${res.clientsCount} accounts from Cloud Firestore!`
                        : `Sync Notice: ${res.message}`
                    );
                    setTimeout(() => setToastMessage(null), 5500);
                  } catch (e: any) {
                    setToastMessage('Global Sync failed. Check network connection.');
                    setTimeout(() => setToastMessage(null), 5500);
                  } finally {
                    setIsRefreshingClients(false);
                  }
                }}
                disabled={isRefreshingClients}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
                title="Force Global Sync: Clears local question bank & profile caches, then deep-fetches from Cloud Firestore"
                id="admin-force-global-sync-btn"
              >
                <Globe className={`w-3.5 h-3.5 text-cyan-200 ${isRefreshingClients ? 'animate-spin' : ''}`} />
                <span>Force Global Sync</span>
              </button>
              <button
                onClick={handleRefreshClients}
                disabled={isRefreshingClients}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Sync and load latest trial accounts created on website"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingClients ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                <span>Sync From Server</span>
              </button>
              <button
                onClick={handleExportJSONBackup}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs border border-slate-800"
                title="Download full JSON database backup for crash recovery"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Backup (JSON)</span>
              </button>
              <button
                onClick={handleExportFullCSV}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Download complete candidates CSV directory"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleOpenImportModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Bulk upload users or restore entire database from backup"
              >
                <UploadCloud className="w-3.5 h-3.5 text-white" />
                <span>Bulk Upload / Restore</span>
              </button>
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Client</span>
              </button>
            </>
          ) : activeSubTab === 'advisory' ? (
            <>
              <button
                onClick={handleOpenAddMemberModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                id="admin-add-advisory-member-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member / Author</span>
              </button>
              {advisoryMembers.length > 0 && (
                <button
                  onClick={handleClearAllCouncilMembers}
                  className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  title="Clear all council entries"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </>
          ) : activeSubTab === 'questions' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('admin-download-questions-pdf-submit-btn');
                  if (el) el.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm border border-indigo-400/40"
                title="Download 1,000 Questions PDF Paper"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-300 stroke-[2.5]" />
                <span>Download PDF Paper</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopyTestPhone}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Copy admin WhatsApp reception number"
              >
                {copiedTestPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTestPhone ? 'Copied Number!' : 'Copy Admin Phone'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: WHO ARE ALL LOGGING IN (LOGIN AUDIT TRAIL)
          ========================================================================= */}
      {activeSubTab === 'logins' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Logins Logged</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
                {loginLogs.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Recorded audit events</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Sessions</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 font-['Outfit']">
                {activeSessionsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Currently practicing / online</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Unique Candidates</span>
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
                {uniqueCandidateLogins}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Distinct learner accounts</p>
            </div>

            {/* Total Credits Spent Live Metric Card */}
            <CreditCounterWidget variant="metric" />

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Admin Status</span>
                <Shield className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-extrabold text-slate-900 font-mono truncate">
                studeezone Admin
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Super Admin Privileges</span>
              </p>
            </div>
          </div>

          {/* Search and Filters for Logins */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search who is logging in by Name, Email, Login ID, or IP..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Method:</span>
                <select
                  value={logProviderFilter}
                  onChange={(e: any) => setLogProviderFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Methods</option>
                  <option value="google">Google SSO</option>
                  <option value="password">Login ID &amp; Password</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Status:</span>
                <select
                  value={logStatusFilter}
                  onChange={(e: any) => setLogStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All States</option>
                  <option value="active">Active Only</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Login Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
                  <span>Live Candidate Login Logs</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    1 IP Rule Enforced
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredLogs.length} verified login attempts and active sessions
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTerminateAllSessions}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Terminate all candidate active sessions"
                >
                  <PowerOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>Terminate All Candidate Sessions</span>
                </button>
                <button
                  onClick={handleRefreshLogs}
                  disabled={isRefreshingLogs}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Refresh activity logs"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingLogs ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-3 px-4">Candidate / User</th>
                    <th className="py-3 px-4">Login ID / Email</th>
                    <th className="py-3 px-4">Auth Method</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Device &amp; Browser</th>
                    <th className="py-3 px-4">Location &amp; IP</th>
                    <th className="py-3 px-4">Session Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No login events match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isLogAdmin = log.role === 'admin' || isProtectedAdminEmail(log.userEmail);
                      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Candidate Name & Role */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isLogAdmin 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {log.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                  <span>{log.userName}</span>
                                  {isLogAdmin ? (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold">
                                      ADMIN
                                    </span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                      Candidate
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email & Login ID */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            <div>{isProtectedAdminEmail(log.userEmail) ? 'studeezone Admin' : log.userEmail}</div>
                            <div className="text-slate-400 text-[10px]">ID: {log.loginId}</div>
                          </td>

                          {/* Auth Method */}
                          <td className="py-3.5 px-4">
                            {log.authProvider === 'google' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                                <span className="font-bold">G</span>
                                <span>Google SSO</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                                <Key className="w-3 h-3 text-slate-500" />
                                <span>Password ID</span>
                              </span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-semibold text-slate-900">{timeStr}</div>
                            <div className="text-[10px] text-slate-400">{dateStr}</div>
                          </td>

                          {/* Device & Browser */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="flex items-center space-x-1.5">
                              {log.deviceInfo.toLowerCase().includes('mobile') || log.deviceInfo.toLowerCase().includes('iphone') ? (
                                <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[160px] text-[11px]">{log.deviceInfo}</span>
                            </div>
                          </td>

                          {/* Location & IP */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="text-[11px] font-medium text-slate-800">{log.location}</div>
                            <div className="font-mono text-[10px] text-slate-400">{log.ipAddress}</div>
                          </td>

                          {/* Session Status */}
                          <td className="py-3.5 px-4">
                            {log.status === 'active' ? (
                              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Active Now</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                <span>Session Ended</span>
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {log.status === 'active' && !isLogAdmin && (
                                <button
                                  onClick={() => handleTerminateSingleSession(log.id, log.userEmail, log.userName)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 hover:border-rose-300 text-[10.5px] inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                                  title={`Terminate active session for ${log.userName}`}
                                >
                                  <PowerOff className="w-3 h-3 text-rose-600" />
                                  <span>Terminate Session</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const found = clients.find((c) => c.email.toLowerCase() === log.userEmail.toLowerCase());
                                  if (found) {
                                    setSelectedClientDetail(found);
                                  } else {
                                    showToast(`Client profile for ${log.userName} is ready in directory.`);
                                  }
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline text-[11px] cursor-pointer"
                              >
                                View Client
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SEPARATE CLIENT MANAGEMENT SECTION
          ========================================================================= */}
      {activeSubTab === 'clients' && (
        <div className="space-y-6">
          {/* Live Visitor & Click Counter Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-['Outfit']">
                  Real-time Candidate Visits &amp; Interaction Traffic
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                Active Tracking
              </span>
            </div>
            <ClickVisitCounter variant="card" />
          </div>

          {/* USER REQUESTED: Total User Database Backup, Crash Recovery & Bulk Upload Center */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30 uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5 text-amber-300" />
                    <span>Total User Database Center</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-400/20">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Crash Proof &amp; Server-Synchronized</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white tracking-tight">
                  User Database Backup &amp; Bulk Upload Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Export total user rosters for safe crash backups or bulk upload candidate lists (CSV/JSON). Easily migrate, backup, or restore candidate logins, target courses, and pro subscriptions in one click.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <Users className="w-3.5 h-3.5 text-indigo-300" />
                    <span><strong>{clients.length}</strong> Total Aspirants</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <Crown className="w-3.5 h-3.5 text-emerald-300" />
                    <span><strong>{proClientsCount}</strong> Pro Subscribed</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span><strong>{activeTrialsCount}</strong> Free Trials</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportJSONBackup}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Download complete JSON database backup with login audits and credentials"
                >
                  <Database className="w-4 h-4 text-amber-300" />
                  <span>Export JSON Backup</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportFullCSV}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Export spreadsheet of all candidates"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export Directory CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenImportModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Bulk upload users or restore entire database from backup"
                >
                  <UploadCloud className="w-4 h-4 text-slate-950" />
                  <span>Bulk Upload / Restore</span>
                </button>
                <button
                  type="button"
                  onClick={downloadSampleClientsCSV}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Download pre-formatted sample CSV template"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Sample Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* USER REQUESTED: Free Question Usage Limit Control Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-indigo-500/10 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-400 text-slate-950">
                    Candidate Usage Limit Setting
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Controls "Subscribe for More" Pop-up Trigger
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit']">
                  Free Questions Limit: <span className="text-indigo-600 font-black">{adminQuestionLimit} Questions</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Set how many total practice &amp; mock questions un-subscribed / free candidates can answer before access is locked and the <strong>"Subscribe for more..!!"</strong> pop-up appears.
                </p>
              </div>

              {/* Quick Presets & Custom Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[15, 20, 30, 40, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSaveQuestionLimit(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        adminQuestionLimit === preset
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs border border-amber-400'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {preset} Qs {preset === 30 && '(Default)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={adminQuestionLimit}
                    onChange={(e) => setAdminQuestionLimit(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Limit"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveQuestionLimit(adminQuestionLimit)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap transition-colors"
                  >
                    Save Limit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client Metrics with Clickable Filter Triggers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setClientStatusFilter('all')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                clientStatusFilter === 'all'
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Candidates</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
                {clients.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">All database aspirants</p>
            </div>

            <div
              onClick={() => setClientStatusFilter('trial')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                clientStatusFilter === 'trial'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Free Trials (1 Day)</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600 font-['Outfit']">
                {activeTrialsCount}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Click to view all trial accounts →</p>
            </div>

            <div
              onClick={() => setClientStatusFilter('active')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                clientStatusFilter === 'active'
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pro Candidates</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 font-['Outfit']">
                {proClientsCount}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">Enrolled certified students</p>
            </div>

            <div
              onClick={() => setClientStatusFilter('expired')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                clientStatusFilter === 'expired'
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Trials Expired</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600 font-['Outfit']">
                {expiredTrialsCount}
              </div>
              <p className="text-[11px] text-rose-700 font-semibold mt-1">Eligible for trial extension</p>
            </div>
          </div>

          {/* Quick Filter Pills (Requirement: All trial registration list should be visible) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setClientStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                clientStatusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Aspirants ({clients.length})</span>
            </button>

            <button
              onClick={() => setClientStatusFilter('trial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                clientStatusFilter === 'trial'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Free Trial Registration List ({activeTrialsCount})</span>
            </button>

            <button
              onClick={() => setClientStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                clientStatusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pro Paid Access ({proClientsCount})</span>
            </button>

            <button
              onClick={() => setClientStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                clientStatusFilter === 'expired'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Expired Trials ({expiredTrialsCount})</span>
            </button>
          </div>

          {/* Search & Filter bar for Clients */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Search clients by candidate name, email, login ID, or target exam..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Tier / Status:</span>
                <select
                  value={clientStatusFilter}
                  onChange={(e: any) => setClientStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="form_filled">Paid & Form Filled</option>
                  <option value="trial">Free Trial (1 Day)</option>
                  <option value="active">Pro / Active</option>
                  <option value="expired">Trial Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Exam:</span>
                <select
                  value={clientExamFilter}
                  onChange={(e: any) => setClientExamFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All STET Papers</option>
                  <option value="Secondary">Paper II (Secondary)</option>
                  <option value="Primary">Paper I (Primary)</option>
                  <option value="Special">Special Education</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clients Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
                  <span>{clientStatusFilter === 'trial' ? 'Free Trial Registrations List' : 'Registered Aspirant Directory'}</span>
                  {clientStatusFilter === 'trial' ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {filteredClients.length} Trial Accounts
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {filteredClients.length} Candidates
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {clientStatusFilter === 'trial'
                    ? 'All candidates who registered for trial access on the platform. Click "Grant Paid" to activate complete access for their specific course.'
                    : 'Manage candidate access, review trial registrations, and grant paid course access.'}
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleRefreshClients}
                  disabled={isRefreshingClients}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Sync and load latest visitor registrations from server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingClients ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                  <span>Sync ({clients.length})</span>
                </button>
                <button
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Candidate</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Contact (Email / ID)</th>
                    <th className="py-3 px-4">Allocated Course / Stream</th>
                    <th className="py-3 px-4">Free Trial / Status</th>
                    <th className="py-3 px-4">Practice Stats</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Quick Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No clients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const isClientAdmin = client.role === 'admin' || isProtectedAdminEmail(client.email);
                      const candidateActiveLog = loginLogs.find(
                        (l) => l.userEmail.toLowerCase().trim() === client.email.toLowerCase().trim() && l.status === 'active'
                      );

                      return (
                        <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isClientAdmin
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center space-x-1">
                                  <span>{client.name}</span>
                                  {isClientAdmin && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-extrabold">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                {client.phone && (
                                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{client.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email & ID */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            <div className="font-sans font-medium text-slate-900">{isProtectedAdminEmail(client.email) ? 'studeezone Admin' : client.email}</div>
                            <div className="text-[10px] text-indigo-700 font-semibold">User ID: {client.loginId || client.email}</div>
                            <div className="text-[10px] text-amber-800 font-semibold flex items-center space-x-1 mt-0.5">
                              <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span>Pass: {client.password || client.phone || '—'}</span>
                            </div>
                            {candidateActiveLog && !isClientAdmin && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold border border-emerald-200 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active IP: {candidateActiveLog.ipAddress}</span>
                              </span>
                            )}
                          </td>

                          {/* Allocated STET Course */}
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {isClientAdmin ? (
                              <div className="text-xs font-semibold text-slate-600 italic">All Streams (Super Admin)</div>
                            ) : (
                              <div className="space-y-1.5 min-w-[210px]">
                                <select
                                  value={getClientAllocatedTrack(client)}
                                  onChange={(e) => handleAllocateCourse(client, e.target.value as ExamTrack)}
                                  className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs hover:bg-indigo-100/80 transition-all"
                                  title="Change allocated course for candidate"
                                >
                                  <option value="gt-maths-science">GT - Maths &amp; Science (Paper II)</option>
                                  <option value="gt-humanities">GT - Humanities (Paper II)</option>
                                  <option value="prt">PRT - Primary (Paper I)</option>
                                </select>

                                {/* Allocated Stream Status Badge */}
                                {getClientAllocatedTrack(client) === 'gt-maths-science' && (
                                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                                    <span>Subscribed for: GT Maths &amp; Science</span>
                                  </div>
                                )}
                                {getClientAllocatedTrack(client) === 'gt-humanities' && (
                                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-black">
                                    <span>Subscribed for: GT Humanities</span>
                                  </div>
                                )}
                                {getClientAllocatedTrack(client) === 'prt' && (
                                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black">
                                    <span>Subscribed for: PRT (Paper I)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Trial / Status Badge */}
                          <td className="py-3.5 px-4">
                            {isClientAdmin ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                                <Shield className="w-3 h-3 text-amber-600" />
                                <span>Administrator</span>
                              </span>
                            ) : client.isPaid || client.status === 'active' ? (
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300 shadow-2xs">
                                    <Crown className="w-3 h-3 text-emerald-600" />
                                    <span>Pro Paid Active</span>
                                  </span>
                                  {client.formFilled && (
                                    <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                                      Form Filled
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-medium">Complete Access ({client.trialDaysRemaining || 365}d)</div>
                              </div>
                            ) : client.status === 'trial' ? (
                              <div className="space-y-1">
                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  client.trialDaysRemaining > 2
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  <span>Trial: {client.trialDaysRemaining}d remaining</span>
                                </span>
                              </div>
                            ) : client.status === 'expired' ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Trial Expired</span>
                                </span>
                                <div className="text-[10px] text-rose-600">Pending Subscription</div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          {/* Practice Stats */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-semibold text-slate-800">{client.testsCompleted} tests completed</div>
                            <div className="text-[10px] text-slate-400">Avg accuracy: {client.avgScore}%</div>
                          </td>

                          {/* Registered Date */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            <div>{new Date(client.registeredAt).toLocaleDateString()}</div>
                          </td>

                          {/* Quick Management Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* One-click Grant Complete Paid Access */}
                              {!isClientAdmin && !client.isPaid && client.status !== 'active' && (
                                <button
                                  onClick={() => handleDirectGrantPaid(client)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Enable complete paid access for this candidate"
                                >
                                  <Crown className="w-3 h-3 text-amber-300" />
                                  <span>Grant Paid</span>
                                </button>
                              )}

                              {/* One-click Disable / Revoke Paid Access */}
                              {!isClientAdmin && (client.isPaid || client.status === 'active') && (
                                <button
                                  onClick={() => handleDirectRevokePaid(client)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Disable Pro Paid Active status for this candidate"
                                >
                                  <X className="w-3 h-3 text-rose-500" />
                                  <span>Disable Paid</span>
                                </button>
                              )}

                              {/* One-click +7 days trial extension */}
                              {!isClientAdmin && (
                                <button
                                  onClick={() => handleExtendTrial(client, 7)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Extend trial by 7 days"
                                >
                                  <Plus className="w-3 h-3 text-amber-600" />
                                  <span>+7d Trial</span>
                                </button>
                              )}

                              {/* One-click Terminate Active Session */}
                              {!isClientAdmin && candidateActiveLog && (
                                <button
                                  onClick={() => handleTerminateSingleSession(candidateActiveLog.id, client.email, client.name)}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                                  title={`Terminate active candidate session for ${client.name} (${candidateActiveLog.ipAddress})`}
                                >
                                  <PowerOff className="w-3 h-3 text-rose-600" />
                                  <span>Terminate</span>
                                </button>
                              )}

                              {/* Change Credentials */}
                              <button
                                onClick={() => {
                                  setEditingClient(client);
                                  setShowEditPassword(true);
                                }}
                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 cursor-pointer"
                                title="Change Login ID & Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Modal */}
                              <button
                                onClick={() => setEditingClient(client)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                title="Edit client details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* View detail */}
                              <button
                                onClick={() => setSelectedClientDetail(client)}
                                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 cursor-pointer"
                                title="Inspect client activity"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              {!isClientAdmin && (
                                <button
                                  onClick={() => handleDeleteClient(client)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                  title="Delete client"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PAYMENT GATEWAY & GPAY SCANNER SETTINGS
          ========================================================================= */}
      {activeSubTab === 'payment' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wide">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>PAYMENT GATEWAY CONFIGURATION</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                  GPay Scanner, UPI ID &amp; Screenshot Settings
                </h2>
                <p className="text-indigo-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Upload your Google Pay (GPay) scanner image, set your UPI ID, and enter the contact phone number where candidates send their payment screenshots on WhatsApp for manual verification and complete access enablement.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                  <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Aspirant Fee</div>
                  <div className="text-xl font-black text-amber-300 font-['Outfit']">
                    {paymentSettings.currency}{paymentSettings.subscriptionPrice}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                  <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Admin WhatsApp</div>
                  <div className="text-xs font-bold text-white font-mono">
                    {paymentSettings.adminPhone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Left Configuration Form, Right Live Candidate Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Settings (7 cols) */}
            <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 space-y-5">
              {/* Card 1: GPay QR Scanner Image Upload */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                        Google Pay (GPay) Scanner Image Upload
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Upload your real QR code scanner image from GPay, PhonePe, or Paytm
                      </p>
                    </div>
                  </div>

                  {paymentSettings.qrScannerImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveQrImage}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>

                {/* Upload or Preview Box */}
                {paymentSettings.qrScannerImageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <img
                      src={paymentSettings.qrScannerImageUrl}
                      alt="Uploaded GPay QR Scanner"
                      className="w-36 h-36 object-contain bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs shrink-0"
                    />
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Custom GPay Scanner Active</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Candidates will see this real scanner image directly in their subscription and upgrade modal.
                      </p>
                      <div className="pt-1">
                        <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace with Another Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 transition-all rounded-2xl p-6 text-center">
                    <label className="cursor-pointer block space-y-2.5">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-indigo-700 block">
                          Click to Browse or Upload GPay Scanner Image
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          PNG, JPG, WEBP, or SVG (Recommended: Clear square screenshot, max 4MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrFileUpload}
                        className="hidden"
                        id="admin-upload-gpay-qr-input"
                      />
                    </label>
                  </div>
                )}

                {/* Optional Direct URL field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Or Enter Image URL directly (Optional)
                  </label>
                  <input
                    type="url"
                    value={paymentSettings.qrScannerImageUrl}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, qrScannerImageUrl: e.target.value })}
                    placeholder="https://example.com/my-gpay-scanner.png"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    id="admin-input-qr-url"
                  />
                </div>
              </div>

              {/* Card 2: UPI ID & Account Holder Name */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                      Official UPI ID &amp; Account Holder Name
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Displayed so candidates can pay directly via GPay, PhonePe, Paytm, or BHIM UPI
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official UPI ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentSettings.upiId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                      placeholder="e.g. sabutamang1a@oksbi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      id="admin-input-upi-id"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payee / Merchant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentSettings.upiName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, upiName: e.target.value })}
                      placeholder="e.g. Sabu Tamang"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      id="admin-input-upi-name"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Admin Phone / WhatsApp Number for Screenshot Verification */}
              <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-300 shadow-2xs p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-emerald-200 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-950 font-['Outfit']">
                      Admin Phone Number (For Receiving Payment Screenshots) *
                    </h3>
                    <p className="text-[11px] text-emerald-700">
                      As requested: "once payment is made, screenshot has to be shared on my number that I enter in admin portal"
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Admin WhatsApp / Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={paymentSettings.adminPhone}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, adminPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs sm:text-sm font-bold font-mono text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        id="admin-input-whatsapp-phone"
                      />
                      <a
                        href={`https://wa.me/${((paymentSettings.adminPhone || '').replace(/[^\d]/g, '').length === 10 ? `91${(paymentSettings.adminPhone || '').replace(/[^\d]/g, '')}` : (paymentSettings.adminPhone || '').replace(/[^\d]/g, ''))}?text=${encodeURIComponent('Test verification link from studeezone Admin Portal')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                        title="Test opening WhatsApp chat with this number"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Test WhatsApp</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1.5 leading-relaxed">
                      Aspirants will click "Share Screenshot on WhatsApp" in their payment modal, which automatically launches WhatsApp to this number with their name, email, and verification request.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Pricing & Duration */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                      Subscription Plan Pricing &amp; Validity
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Configure the fee and title shown across all candidate prompts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subscription Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        {paymentSettings.currency}
                      </span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={paymentSettings.subscriptionPrice}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, subscriptionPrice: Number(e.target.value) })}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        id="admin-input-price"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.planName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, planName: e.target.value })}
                      placeholder="STET Master Pass"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Duration Label
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.planDuration}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, planDuration: e.target.value })}
                      placeholder="1 Year Access / Stream"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Payment Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={paymentSettings.instructions}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, instructions: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Changes apply across all candidate payment modals instantly</span>
                </div>
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                  id="admin-btn-save-payment-settings"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingPayment ? 'Saving Settings...' : 'Save Payment Gateway Settings'}</span>
                </button>
              </div>
            </form>

            {/* Right Column: Live Candidate Simulation (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold font-['Outfit'] uppercase tracking-wider text-slate-300">
                      Live Candidate Modal Preview
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Real-time
                  </span>
                </div>

                {/* Candidate Mock Card */}
                <div className="mt-4 bg-white text-slate-900 rounded-2xl p-4 shadow-lg border border-slate-200 space-y-4">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-amber-600 to-indigo-700 p-3.5 rounded-xl text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                          {paymentSettings.planDuration}
                        </span>
                        <div className="text-sm font-extrabold font-['Outfit'] mt-1">
                          {paymentSettings.planName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black font-['Outfit'] text-amber-300">
                          {paymentSettings.currency}{paymentSettings.subscriptionPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-[11px] font-bold text-indigo-900 mb-2">
                      GPay / UPI QR Scanner Code
                    </div>
                    {paymentSettings.qrScannerImageUrl ? (
                      <img
                        src={paymentSettings.qrScannerImageUrl}
                        alt="Scanner Preview"
                        className="w-40 h-40 object-contain mx-auto rounded-lg border border-slate-300 bg-white p-1"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-slate-900 rounded-lg mx-auto flex flex-col items-center justify-center text-white p-2">
                        <QrCode className="w-16 h-16 text-white mb-1" />
                        <span className="text-[10px] font-mono text-amber-300">
                          {paymentSettings.currency}{paymentSettings.subscriptionPrice}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block mt-1.5">
                      Scan with Google Pay, PhonePe, Paytm or BHIM
                    </span>
                  </div>

                  {/* UPI Details Box */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Payee UPI ID:</div>
                    <div className="font-mono font-bold text-slate-900 flex items-center justify-between">
                      <span className="truncate">{paymentSettings.upiId}</span>
                      <span className="text-[10px] text-indigo-600 font-sans font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                        Copy
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Name: {paymentSettings.upiName}</div>
                  </div>

                  {/* WhatsApp Screenshot Button */}
                  <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl space-y-2">
                    <div className="text-[11px] font-bold text-emerald-950 flex items-center space-x-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Screenshot to Admin:</span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-900 bg-emerald-100/70 px-2 py-1 rounded">
                      {paymentSettings.adminPhone}
                    </div>
                    <div className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Share Screenshot on WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center mt-3">
                  This exact flow appears on candidate screens when their 7-day trial finishes or when clicking "Subscribe".
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ADVISORY BOARD & CONTRIBUTING AUTHORS DIRECTORY
          ========================================================================= */}
      {activeSubTab === 'advisory' && (
        <div className="space-y-6" id="admin-advisory-tab">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-black tracking-wide border border-indigo-400/30">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>ACADEMIC GOVERNANCE &amp; AUTHORSHIP REPOSITORY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                  Advisory Board &amp; Contributing Authors
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Manage esteemed council fellows, question vetting specialists, and curriculum authors. Assign prestigious high-sounding designations to establish academic authority and NCTE syllabus alignment for STET candidates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                  <div className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Total Fellows</div>
                  <div className="text-xl font-black text-white font-['Outfit']">
                    {advisoryMembers.length}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                  <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Active on App</div>
                  <div className="text-xl font-black text-emerald-300 font-['Outfit']">
                    {activeAdvisoryCount}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                  <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Authors</div>
                  <div className="text-xl font-black text-amber-300 font-['Outfit']">
                    {authorsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Council Members Section Visibility Settings */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="admin-council-visibility-card">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                councilSettings.showCouncilMembersSection
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {councilSettings.showCouncilMembersSection ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                    Council Members Section Visibility
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    councilSettings.showCouncilMembersSection
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {councilSettings.showCouncilMembersSection ? 'Section Visible on App' : 'Section Hidden from App'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  {councilSettings.showCouncilMembersSection
                    ? 'The Council Members roster is currently visible on the public Advisory Board view and candidate dashboard spotlight.'
                    : 'The Council Members roster is hidden from candidates. When hidden, the Advisory Board displays the pure Academic Governance Charter and verification standards.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={handleToggleCouncilVisibility}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs border ${
                  councilSettings.showCouncilMembersSection
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-emerald-600/20'
                }`}
                id="admin-toggle-council-members-visibility-btn"
              >
                {councilSettings.showCouncilMembersSection ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide Council Members Section</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show Council Members Section</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sub-Navigation: Council Members vs Fellowship Applications */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAdvisoryViewSection('members')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  advisoryViewSection === 'members'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Council Members Roster ({advisoryMembers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('fellowship-applications')}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 text-amber-950 border border-amber-300 shadow-2xs"
                id="advisory-to-fellowship-applications-btn"
              >
                <Award className="w-3.5 h-3.5 text-amber-800" />
                <span>Fellowship Applications &amp; Approvals ({fellowshipApps.length})</span>
                {pendingFellowshipCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {pendingFellowshipCount} New
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetAdvisoryMembers}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Clear Roster (No Fake Entries)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Directory</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddMemberModal}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
              {/* High-Sounding Contributor Titles Suggestion Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-slate-50 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                    Prestigious Contributor Designations &amp; High-Sounding Titles
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any title below to instantly adopt it for a new or existing contributing scholar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRoleSuggestions(!showRoleSuggestions)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto cursor-pointer"
              >
                {showRoleSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
              </button>
            </div>

            {showRoleSuggestions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {SUGGESTED_HIGH_SOUNDING_TITLES.map((sug, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {sug.resonanceTier}
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-600">
                          {getCategoryLabel(sug.category)}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-amber-700 transition-colors">
                        {sug.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {sug.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenAddMemberModal();
                        handleApplyTitleSuggestion(sug);
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Use This Title</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search, Filter & Quick Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Contributors' },
                  { id: 'advisory-board', label: 'Advisory Board' },
                  { id: 'contributing-authors', label: 'Contributing Authors' },
                  { id: 'academic-council', label: 'Academic Council' },
                  { id: 'pedagogical-fellows', label: 'Pedagogical Fellows' },
                  { id: 'editorial-reviewers', label: 'Editorial Reviewers' },
                ] as { id: ContributorCategory | 'all'; label: string }[]
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setAdvisoryCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    advisoryCategoryFilter === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search member name or title..."
                value={advisorySearchQuery}
                onChange={(e) => setAdvisorySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdvisoryMembers.map((member) => (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all flex flex-col justify-between space-y-4 ${
                  member.active === false
                    ? 'opacity-60 border-slate-200 bg-slate-50/50'
                    : member.featured
                    ? 'border-amber-300 ring-1 ring-amber-300/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                            {member.honorific ? `${member.honorific} ` : ''}{member.name}
                          </h4>
                          {member.featured && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" title="Featured Council Spotlight" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                          {member.credentials}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleMemberFeatured(member)}
                        className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          member.featured ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={member.featured ? 'Pinned to Featured Spotlight' : 'Pin to Spotlight'}
                      >
                        <Star className={`w-4 h-4 ${member.featured ? 'fill-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleOpenEditMemberModal(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-extrabold text-xs border border-amber-200/80">
                      {member.roleTitle}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">
                      {member.affiliation}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>

                  {member.contributions && member.contributions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.contributions.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 text-[11px]">
                    {getCategoryLabel(member.category)}
                  </span>

                  <button
                    onClick={() => handleToggleMemberActive(member)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                      member.active !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {member.active !== false ? '● Visible on App' : '○ Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAdvisoryMembers.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Directory Kept Clear (No Fake Entries)</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The academic governance council is kept clear of placeholder or dummy entries. Add verified council fellows, pedagogy authors, or item reviewers when formally appointed.
              </p>
              <button
                onClick={handleOpenAddMemberModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Add Verified Member
              </button>
            </div>
          )}
        </div>
      </div>
    )}

      {/* =========================================================================
          SUBTAB 5: PAID & FORM FILLED CATEGORY DIRECT APPROVAL PORTAL
          ========================================================================= */}
      {activeSubTab === 'form-submissions' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-form-submissions-section">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900/5 rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>PAID &amp; FORM FILLED CATEGORY</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                Candidate Direct Approvals &amp; Form Submissions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Candidates who selected a stream, filled in their details (Name, Phone, Email, Selected Stream &amp; UTR), and submitted verification. As Admin, directly approve candidates with 1 click to instantly activate their full paid access.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Pending Direct Approval</div>
                <div className="text-xl font-black text-amber-600 font-['Outfit']">
                  {pendingSubmissionsCount}
                </div>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Approved Paid</div>
                <div className="text-xl font-black text-emerald-600 font-['Outfit']">
                  {approvedSubmissionsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by candidate name, phone, email, or UTR..."
                value={subSearchQuery}
                onChange={(e) => setSubSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSubStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({paymentSubmissions.length})
              </button>
              <button
                onClick={() => setSubStatusFilter('pending_approval')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  subStatusFilter === 'pending_approval'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>Pending Approval</span>
                <span className="bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingSubmissionsCount}
                </span>
              </button>
              <button
                onClick={() => setSubStatusFilter('approved')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  subStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>Approved</span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px]">
                  {approvedSubmissionsCount}
                </span>
              </button>
            </div>
          </div>

          {/* Submissions Cards */}
          {filteredSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubmissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const cleanPhone = (sub.phone || '').replace(/\D/g, '');
                const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const whatsappReplyUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                  `Hello ${sub.name}! Your payment of ₹${sub.amount} for STET ${sub.selectedStreamName} has been approved by Admin Sabu Tamang. Your 1-Year Pro access is now active on studeezone.com!`
                )}`;

                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs space-y-4 ${
                      isApproved ? 'border-emerald-200 bg-emerald-50/15' : 'border-amber-300 ring-2 ring-amber-500/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                              {sub.name}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isApproved ? '● Active Paid' : 'Pending Direct Approval'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-800">{sub.phone}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{sub.email}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Stream & Payment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Selected Exam Stream (Autofilled)
                        </span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center space-x-1.5">
                          <GraduationCap className="w-4 h-4 text-indigo-600" />
                          <span>{sub.selectedStreamName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Plan Fee &amp; Duration
                        </span>
                        <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                          ₹{sub.amount} <span className="text-xs text-slate-500 font-normal">/ 1 Year Access</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          UPI Ref / UTR Number
                        </span>
                        <div className="font-mono font-bold text-indigo-900 text-sm mt-0.5">
                          {sub.utrNumber ? sub.utrNumber : <span className="text-slate-400 italic font-sans">Not entered (check screenshot)</span>}
                        </div>
                      </div>
                    </div>

                    {sub.notes && (
                      <p className="text-xs text-slate-600 italic">
                        "{sub.notes}"
                      </p>
                    )}

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-2">
                        {/* Direct WhatsApp chat button */}
                        <a
                          href={whatsappReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Candidate</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleDirectApprove(sub.id)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-emerald-500"
                            id={`direct-approve-btn-${sub.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                            <span>Direct Approve for Paid Access</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-200">
                            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            <span>Approved &amp; Access Unlocked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <CheckCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">No Matching Form Submissions</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When candidates select their stream and submit their name, phone, email &amp; payment confirmation in the payment section, their entries will show up here for 1-click direct approval.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBTAB 6: FELLOWSHIP APPLICATIONS & COUNCIL APPROVAL / ROLE ALLOCATION
          ========================================================================= */}
      {activeSubTab === 'fellowship-applications' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-fellowship-applications-portal">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900/5 rounded-3xl p-6 sm:p-7 border border-amber-300/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                <Award className="w-3.5 h-3.5" />
                <span>FELLOWSHIP APPLICANTS &amp; APPROVALS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                Review &amp; Approve Fellowship Applications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Educators, scholars, and specialists who filled the <strong>Fellowship Application page</strong>. Inspect their verified academic qualifications, pedagogical statements, and 1-click allocate their official academic council designation &amp; titles before inducting them to the live registry.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Pending Review</div>
                <div className="text-xl font-black text-amber-600 font-['Outfit']">
                  {pendingFellowshipCount}
                </div>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Inducted Scholars</div>
                <div className="text-xl font-black text-emerald-600 font-['Outfit']">
                  {inductedFellowshipCount}
                </div>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total Submissions</div>
                <div className="text-xl font-black text-slate-900 font-['Outfit']">
                  {fellowshipApps.length}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by candidate name, phone, email, university, qualification, specialization, or reference ID..."
                value={fellowshipSearchQuery}
                onChange={(e) => setFellowshipSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                id="search-fellowship-applications-input"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFellowshipStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  fellowshipStatusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Applications ({fellowshipApps.length})
              </button>
              <button
                onClick={() => setFellowshipStatusFilter('pending')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  fellowshipStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>Pending Role Allocation</span>
                <span className="bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingFellowshipCount}
                </span>
              </button>
              <button
                onClick={() => setFellowshipStatusFilter('inducted')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  fellowshipStatusFilter === 'inducted'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>Approved &amp; Inducted</span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {inductedFellowshipCount}
                </span>
              </button>
            </div>
          </div>

          {/* Applications Cards List */}
          {filteredFellowshipApps.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredFellowshipApps.map((app) => {
                const isInducted = app.status === 'inducted';
                const cleanPhone = (app.phone || '').replace(/\D/g, '');
                const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const whatsappReplyUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                  `Hello ${app.honorific ? app.honorific + ' ' : ''}${app.name}! This is from the studeezone.com Academic Governance Council regarding your Fellowship Application (${app.referenceNumber}).`
                )}`;

                return (
                  <div
                    key={app.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs space-y-4 ${
                      isInducted 
                        ? 'border-emerald-200 bg-emerald-50/10' 
                        : 'border-amber-300 ring-2 ring-amber-500/10'
                    }`}
                    id={`fellowship-app-card-${app.id}`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3.5">
                        {app.photoUrl ? (
                          <div className="w-12 h-16 rounded-xl bg-white border-2 border-slate-300 overflow-hidden shrink-0 shadow-xs relative ring-2 ring-slate-100">
                            <img
                              src={app.photoUrl}
                              alt={app.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-14 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isInducted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {app.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit']">
                              {app.honorific ? `${app.honorific} ` : ''}{app.name}
                            </h4>
                            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
                              {app.referenceNumber}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                              isInducted 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isInducted ? '● Active Inducted Member' : 'Pending Allocation'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">{app.affiliation}</span>
                            {app.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{app.location}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Academic Credentials & Role Assignment Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Academic Qualification &amp; Experience
                        </span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center space-x-1.5">
                          <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate">{app.highestQualification}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          {app.experienceYears} Years of Pedagogical Experience
                        </span>
                        {app.customCredentials && (
                          <div className="mt-1.5 text-[10.5px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center space-x-1" title={app.customCredentials}>
                            <Award className="w-3 h-3 text-amber-700 shrink-0" />
                            <span className="truncate">Other: {app.customCredentials}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Specialization Domain
                        </span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">
                          {app.specializationDomain}
                        </div>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Curricular Focus Area
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                          Council Role &amp; Track Preference
                        </span>
                        <div className="font-extrabold text-indigo-700 text-sm mt-0.5 flex items-center space-x-1">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>
                            {isInducted 
                              ? (app.adminAssignedRoleTitle || app.preferredPosition) 
                              : (app.preferredPosition || 'Member (Advisory Board)')}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                          {isInducted 
                            ? `Category: ${getCategoryLabel(app.adminAssignedCategory || app.preferredCategory)}` 
                            : `Requested Track: ${getCategoryLabel(app.preferredCategory || 'advisory-board')}`}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info & CV Link */}
                    <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${app.email}`} className="font-mono hover:text-indigo-600 hover:underline">
                          {app.email}
                        </a>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{app.phone}</span>
                      </div>
                      {app.profileLink && (
                        <>
                          <span className="text-slate-300">•</span>
                          <a
                            href={app.profileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center space-x-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Scholar Profile / CV</span>
                          </a>
                        </>
                      )}
                    </div>

                    {/* Curricular Areas of Contribution */}
                    {app.contributions && app.contributions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                          Proposed Curricular Contribution Areas ({app.contributions.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {app.contributions.map((c, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brief About Experience, Yourself & Role Fit Section */}
                    {app.briefExperienceAndBio && (
                      <div className="bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/40 p-4 rounded-2xl border border-indigo-200/90 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-extrabold text-indigo-950 text-[11px] uppercase tracking-wide">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Candidate Bio, Experience &amp; Role Fit:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed italic line-clamp-3">
                          "{app.briefExperienceAndBio}"
                        </p>
                      </div>
                    )}

                    {/* Brief Statement of Pedagogy / Contribution Note */}
                    {app.statementOfPedagogy && (
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wide">
                          Brief Statement of Pedagogy / Contribution Note:
                        </span>
                        <p className="italic text-slate-700 leading-relaxed font-serif">
                          "{app.statementOfPedagogy}"
                        </p>
                      </div>
                    )}

                    {/* Admin Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-2">
                        <a
                          href={whatsappReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Applicant</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isInducted && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const inducted = inductFellowshipApplicant(app.id, 'Distinguished Advisory Board Member', 'advisory-board');
                                if (inducted) {
                                  setAdvisoryMembers(getAdvisoryMembers());
                                  setFellowshipApps(getFellowshipApplications());
                                  showToast(`Success! ${app.name} approved & inducted as Member (Advisory Board)!`);
                                }
                              }}
                              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer border border-indigo-500 transform hover:scale-[1.01] active:scale-95"
                              id={`induct-advisory-btn-${app.id}`}
                              title="Directly approve and induct as Member of Advisory Board"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>Add Member (Advisory Board)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const pos = app.adminAssignedRoleTitle 
                                  || (app.preferredPosition && !app.preferredPosition.includes('Pending') && !app.preferredPosition.includes('Open') 
                                      ? app.preferredPosition 
                                      : app.preferredCategory === 'advisory-board' 
                                        ? 'Distinguished Advisory Board Member' 
                                        : 'Distinguished Contributing Author');
                                const cat = app.adminAssignedCategory || app.preferredCategory || 'advisory-board';
                                const inducted = inductFellowshipApplicant(app.id, pos, cat);
                                if (inducted) {
                                  setAdvisoryMembers(getAdvisoryMembers());
                                  setFellowshipApps(getFellowshipApplications());
                                  showToast(`Success! ${app.name} approved & published live to the Advisory Board!`);
                                }
                              }}
                              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer border border-emerald-500 transform hover:scale-[1.01] active:scale-95"
                              id={`quick-approve-btn-${app.id}`}
                              title="Immediately approve and publish member to public advisory board"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                              <span>1-Click Quick Approve</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenInspectApp(app)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-amber-300 transform hover:scale-[1.01] active:scale-95"
                          id={`allocate-role-btn-${app.id}`}
                        >
                          <Award className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                          <span>
                            {isInducted 
                              ? 'Change Designation / Roster Category' 
                              : 'Approve & Allocate Council Designation'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">No Matching Fellowship Applications</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When educators, scholars, or specialists submit their credentials through the "Fellowship Application page", their details will appear here for evaluation, designation assignment, and approval.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 7: TOTAL CREDITS SPENT & LIVE AI CONSUMPTION AUDIT
          ========================================================================= */}
      {activeSubTab === 'credits' && (
        <div className="space-y-6" id="admin-credits-section">
          {/* Detailed Full Card Meter with Reset Option */}
          <CreditCounterWidget variant="card" showAdminReset={true} />

          {/* AI Token Economics & Model Pricing Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>24/7 Ask Lama (AI Tutor)</span>
              </div>
              <p className="text-2xl font-black text-slate-900 font-['Outfit']">2.25 cr <span className="text-xs font-normal text-slate-500">/ query</span></p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Covers conversational query answering, real-time pedagogy coaching, and STET question clarifications with Gemini 2.5 Flash.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Question Deep Analysis</span>
              </div>
              <p className="text-2xl font-black text-slate-900 font-['Outfit']">1.50 cr <span className="text-xs font-normal text-slate-500">/ explanation</span></p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Assertion-Reasoning breakdown, distractors evaluation, and syllabus-linked concept references for candidate revision.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cloud Cost Guardrails</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 font-['Outfit']">Active <span className="text-xs font-normal text-slate-500">• Server Proxy</span></p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rate limiting and server-side authentication proxy prevent runaway token spending and automated scraping.
              </p>
            </div>
          </div>

          {/* Quick Actions & Simulation */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold font-['Outfit']">Simulate Live Credit Spend</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Open "24/7 Ask Lama" in the navigation bar to ask curriculum questions. Each query automatically charges credits and increments this live meter in real-time across the app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('header-open-chat-tutor-btn');
                if (el) el.click();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch 24/7 Ask Lama Test</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: VISION, MISSION, ABOUT & THE TEAM PAGE EDITOR
          ========================================================================= */}
      {activeSubTab === 'about-mission' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-about-mission-portal">
          <AboutMissionAdminEditor
            onNavigateToPublicPage={() => {
              if (onNavigate) {
                onNavigate('about-mission');
              } else {
                window.location.search = '?tab=about-mission';
              }
            }}
            showToast={showToast}
          />
        </div>
      )}

      {/* =========================================================================
          SUB-TAB: 1,000+ QUESTIONS PDF EXPORTER & CRASH RESTORE (AdminHub Only)
          ========================================================================= */}
      {activeSubTab === 'questions' && (
        <QuestionBankPdfDownloadSection showToast={showToast} />
      )}

      {/* =========================================================================
          MODAL: ADD NEW CLIENT (Synchronized with Register Now 5-Step Process)
          ========================================================================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                    Register New Client Candidate
                  </h3>
                  <p className="text-xs text-slate-500">
                    5-step enrollment synced with candidate login credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Candidate Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g., Deepika Kumari"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 2. Enter email id */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    2. Enter Email ID *
                  </label>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    User ID for Sign-In
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => {
                      const emailVal = e.target.value;
                      setNewClientEmail(emailVal);
                      setNewClientLoginId(emailVal);
                    }}
                    placeholder="candidate@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 3. Enter phone number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    3. Enter Phone Number *
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Password for Sign-In
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 4. Select Course */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Select Course *
                </label>
                <select
                  value={newClientTargetExam}
                  onChange={(e) => setNewClientTargetExam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Sikkim Primary Teacher (PRT - Paper I)">
                    Sikkim Primary Teacher (PRT - Paper I) — Classes I - V
                  </option>
                  <option value="Sikkim Graduate Teacher (GT Maths & Science - Paper II)">
                    Sikkim Graduate Teacher (GT Maths &amp; Science - Paper II) — Classes VI - VIII
                  </option>
                  <option value="Sikkim Graduate Teacher (GT Humanities - Paper II)">
                    Sikkim Graduate Teacher (GT Humanities - Paper II) — Classes VI - VIII
                  </option>
                </select>
              </div>

              {/* 5. Instead of create password section: Display User ID (email id) and Password (phone number) */}
              <div className="bg-gradient-to-r from-amber-50/90 via-indigo-50/40 to-amber-50/90 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>5. Generated Candidate Sign-In Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-sans block font-semibold mb-0.5">
                      User ID (Email ID):
                    </span>
                    <span className="font-bold text-slate-900 truncate block">
                      {newClientEmail.trim() || 'candidate@example.com'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-sans block font-semibold mb-0.5">
                      Password (Phone Number):
                    </span>
                    <span className="font-bold text-indigo-700 truncate block">
                      {newClientPhone.trim() || 'phone number'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight font-sans">
                  📌 By default, the candidate's <strong>Email ID</strong> is their User ID and their <strong>Phone Number</strong> is their Password. Once added, it immediately updates the login section so the user can sign in. Admin can change login ID and password anytime.
                </p>
              </div>

              {/* Optional Collapsible Advanced Settings (Trial Days & Notes) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddClientAdvanced(!showAddClientAdvanced)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>{showAddClientAdvanced ? '− Hide' : '+ Show'} Advanced Admin Options (Trial Days &amp; Notes)</span>
                </button>

                {showAddClientAdvanced && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Free Trial Duration (Days)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={newClientTrialDays}
                          onChange={(e) => setNewClientTrialDays(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Custom Login ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={newClientLoginId}
                          onChange={(e) => setNewClientLoginId(e.target.value)}
                          placeholder="Defaults to email address"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Internal Admin Notes
                      </label>
                      <textarea
                        rows={2}
                        value={newClientNotes}
                        onChange={(e) => setNewClientNotes(e.target.value)}
                        placeholder="Batch, referral source, or candidate details..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Register &amp; Add Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          USER REQUESTED MODAL: TOTAL USER DATABASE BULK UPLOAD & CRASH RESTORE
          ========================================================================= */}
      {isImportDatabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
                      Bulk Upload Users &amp; Crash Recovery
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Total Database
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a CSV candidate roster to bulk enroll aspirants, or restore the entire database from a JSON backup file.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportDatabaseModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Choose Import / Restore Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Select Operation Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setImportMode('merge')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    importMode === 'merge'
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold">Merge &amp; Update (Safe)</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importMode === 'merge' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                      {importMode === 'merge' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Safely updates matching candidate records (by email or login ID) and adds all new candidates without deleting existing users.
                  </p>
                </div>

                <div
                  onClick={() => setImportMode('replace')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20 text-rose-950 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-rose-900">Full System Restore</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importMode === 'replace' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'}`}>
                      {importMode === 'replace' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Replaces all candidate records with the uploaded backup file. Master admin accounts (<code className="text-rose-700 font-mono">studeezoneapp@gmail.com, vsfintech@gmail.com</code>) are protected from deletion.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Choose File */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Choose Backup or Candidate File (.json or .csv)
                </label>
                <button
                  type="button"
                  onClick={downloadSampleClientsCSV}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              <input
                ref={importFileInputRef}
                type="file"
                accept=".json,.csv,text/csv,application/json"
                onChange={handleImportFileChange}
                className="hidden"
                id="admin-db-import-file-input"
              />

              <div
                onClick={() => importFileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  importFileName
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                {importFileName ? (
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-mono">{importFileName}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      File loaded successfully. Click to select a different file.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to browse or drop your JSON backup or CSV roster file here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supported formats: <strong>.json</strong> (Full system backup) and <strong>.csv</strong> (Candidate roster spreadsheet)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Error Notice */}
            {importFileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{importFileError}</span>
              </div>
            )}

            {/* Step 3: Parsed Data Preview */}
            {parsedImportData && (
              <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      Candidates Detected: <strong className="text-indigo-600 font-black">{parsedImportData.totalFound} Aspirants</strong>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                      {parsedImportData.type} Format
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready to import</span>
                  </span>
                </div>

                {/* Mini Preview Table (First 5 Rows) */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email / Login</th>
                        <th className="py-2 px-3">Allocated Course</th>
                        <th className="py-2 px-3">Pro Access</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {parsedImportData.records.slice(0, 5).map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">{rec.name || 'Candidate'}</td>
                          <td className="py-2 px-3 font-mono text-[10px]">{rec.email || rec.loginId}</td>
                          <td className="py-2 px-3 line-clamp-1 max-w-[180px]">{rec.targetExam}</td>
                          <td className="py-2 px-3">
                            {rec.isPaid ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Paid Active</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Trial</span>
                            )}
                          </td>
                          <td className="py-2 px-3 uppercase text-[10px] font-bold">{rec.status || 'active'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedImportData.records.length > 5 && (
                  <p className="text-[11px] text-slate-500 italic text-center">
                    ... plus {parsedImportData.records.length - 5} more candidate records in file.
                  </p>
                )}
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Synchronizes with live server memory &amp; backup store.</span>
              </div>
              <div className="flex items-center space-x-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsImportDatabaseModalOpen(false)}
                  disabled={isExecutingImport}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImportDatabase}
                  disabled={!parsedImportData || isExecutingImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  {isExecutingImport ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing &amp; Syncing Database...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Bulk Upload Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT CLIENT (Admin can change login ID and password)
          ========================================================================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                    Edit Client &amp; Login Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify candidate details, login ID, or change sign-in password
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingClient(null);
                  setShowEditPassword(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Dedicated Credentials Management Section: Change Login ID & Password */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-xs text-amber-900">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Candidate Sign-In Credentials (User ID &amp; Password)</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Admin Controlled
                  </span>
                </div>

                {/* Change Login ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Login ID (User ID) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingClient({ ...editingClient, loginId: editingClient.email })}
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Reset to Email ID
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingClient.loginId || editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, loginId: e.target.value })}
                    placeholder="Candidate login ID / username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Change Email ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="candidate@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Change Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Login Password *</span>
                    </label>
                    {editingClient.phone && (
                      <button
                        type="button"
                        onClick={() => setEditingClient({ ...editingClient, password: editingClient.phone })}
                        className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        Reset to Phone Number
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editingClient.password !== undefined ? editingClient.password : (editingClient.phone || '')}
                      onChange={(e) => setEditingClient({ ...editingClient, password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-tight">
                  💡 When changed by Admin, the candidate can immediately log into the login section with this <strong>Login ID</strong> and <strong>Password</strong>.
                </p>
              </div>

              {/* Option to Enable/Disable Pro Paid Active */}
              <div className={`p-4 rounded-2xl border transition-all ${
                editingClient.isPaid || editingClient.status === 'active'
                  ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-amber-500/10 border-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Crown className={`w-4 h-4 ${editingClient.isPaid || editingClient.status === 'active' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                        Pro Paid Active
                      </span>
                      {(editingClient.isPaid || editingClient.status === 'active') ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-2xs">
                          Active (Pro Access)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                          Disabled (Limited)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {(editingClient.isPaid || editingClient.status === 'active')
                        ? 'Candidate has complete, unlimited access to all Grand Mocks and Practice questions.'
                        : 'Free usage limit is enforced. Candidate will see subscription popup after limit.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextPaid = !(editingClient.isPaid || editingClient.status === 'active');
                      setEditingClient({
                        ...editingClient,
                        isPaid: nextPaid,
                        status: nextPaid ? 'active' : 'trial',
                        trialDaysRemaining: nextPaid ? 365 : (editingClient.trialDaysRemaining || 1),
                        paidStreams: nextPaid
                          ? [getExamTrackFromTarget(editingClient.targetExam)]
                          : [],
                      });
                    }}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      (editingClient.isPaid || editingClient.status === 'active') ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        (editingClient.isPaid || editingClient.status === 'active') ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status / Tier
                  </label>
                  <select
                    value={editingClient.status}
                    onChange={(e: any) => {
                      const newStatus = e.target.value;
                      const isNowPaid = newStatus === 'active';
                      setEditingClient({
                        ...editingClient,
                        status: newStatus,
                        isPaid: isNowPaid,
                        trialDaysRemaining: isNowPaid ? 365 : editingClient.trialDaysRemaining,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="trial">Free Trial (1 Day Left)</option>
                    <option value="active">Pro Plan (Enrolled / Paid)</option>
                    <option value="expired">Trial Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trial Days Remaining
                  </label>
                  <input
                    type="number"
                    value={editingClient.trialDaysRemaining}
                    onChange={(e) => setEditingClient({ ...editingClient, trialDaysRemaining: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target STET Exam (Course)
                </label>
                <select
                  value={editingClient.targetExam}
                  onChange={(e) => setEditingClient({ ...editingClient, targetExam: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Sikkim Primary Teacher (PRT - Paper I)">Sikkim Primary Teacher (PRT - Paper I) — Classes I - V</option>
                  <option value="Sikkim Graduate Teacher (GT Maths & Science - Paper II)">Sikkim Graduate Teacher (GT Maths &amp; Science - Paper II) — Classes VI - VIII</option>
                  <option value="Sikkim Graduate Teacher (GT Humanities - Paper II)">Sikkim Graduate Teacher (GT Humanities - Paper II) — Classes VI - VIII</option>
                  {!['Sikkim Primary Teacher (PRT - Paper I)', 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)', 'Sikkim Graduate Teacher (GT Humanities - Paper II)'].includes(editingClient.targetExam) && (
                    <option value={editingClient.targetExam}>{editingClient.targetExam} (Legacy)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={editingClient.phone || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="Internal comments or billing notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleExtendTrial(editingClient, 7)}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 cursor-pointer"
                >
                  +7 Days to Trial
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClient(null);
                      setShowEditPassword(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CLIENT DETAIL DRAWER / INSPECTOR
          ========================================================================= */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                  {selectedClientDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                    {selectedClientDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {isProtectedAdminEmail(selectedClientDetail.email) ? 'studeezone Admin' : selectedClientDetail.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account Type:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedClientDetail.role === 'admin' ? 'Super Administrator' : 'Candidate Learner'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target STET Exam:</span>
                <span className="font-bold text-slate-800 text-right">
                  {selectedClientDetail.targetExam}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Subscription / Free Trial:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  selectedClientDetail.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedClientDetail.trialDaysRemaining > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedClientDetail.status === 'active' 
                    ? 'Pro Plan Enrolled' 
                    : `Trial (${selectedClientDetail.trialDaysRemaining}d remaining)`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mock Tests Completed:</span>
                <span className="font-bold text-indigo-600 font-mono">
                  {selectedClientDetail.testsCompleted} tests
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Average Historical Score:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {selectedClientDetail.avgScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Registration Date:</span>
                <span className="text-slate-700">
                  {new Date(selectedClientDetail.registeredAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last Active Session:</span>
                <span className="text-slate-700">
                  {new Date(selectedClientDetail.lastLoginAt).toLocaleString()}
                </span>
              </div>
              <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-slate-600 font-semibold flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Login Password:</span>
                </span>
                <span className="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {selectedClientDetail.password || selectedClientDetail.phone || 'Phone number / default password'}
                </span>
              </div>
              {selectedClientDetail.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Admin Notes:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200">
                    "{selectedClientDetail.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  handleExtendTrial(selectedClientDetail, 7);
                  setSelectedClientDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                Extend Trial by +7 Days
              </button>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT ADVISORY MEMBER & CONTRIBUTING AUTHOR
          ========================================================================= */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                    {editingMember ? 'Edit Council Fellow / Author' : 'Add Advisory Member or Contributing Author'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Curate credentials, assign prestigious titles, and specify syllabus contributions
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setEditingMember(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Quick Prestigious Title Dropdown Suggestion */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                <label className="block text-xs font-black text-amber-900 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quick-Apply Prestigious Designation (High-Sounding Titles):</span>
                </label>
                <select
                  onChange={(e) => {
                    const found = SUGGESTED_HIGH_SOUNDING_TITLES.find((t) => t.title === e.target.value);
                    if (found) handleApplyTitleSuggestion(found);
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="" disabled>-- Select from Curated Prestigious Titles --</option>
                  {SUGGESTED_HIGH_SOUNDING_TITLES.map((t, idx) => (
                    <option key={idx} value={t.title}>
                      [{t.resonanceTier}] {t.title} ({getCategoryLabel(t.category)})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-800/80">
                  Selecting a preset automatically fills the Designation, Contributor Category, and Recommended Badge.
                </p>
              </div>

              {/* Name & Honorific */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Honorific
                  </label>
                  <select
                    value={memberFormHonorific}
                    onChange={(e) => setMemberFormHonorific(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Prof. Dr.">Prof. Dr.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Shri">Shri</option>
                    <option value="Smt.">Smt.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Scholar">Scholar</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormName}
                    onChange={(e) => setMemberFormName(e.target.value)}
                    placeholder="e.g., Tenzing Norbu Bhutia"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    High-Sounding Role Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormRoleTitle}
                    onChange={(e) => setMemberFormRoleTitle(e.target.value)}
                    placeholder="e.g., Senior Advisory Board Member"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Council Category *
                  </label>
                  <select
                    value={memberFormCategory}
                    onChange={(e) => setMemberFormCategory(e.target.value as ContributorCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="advisory-board">Advisory Board</option>
                    <option value="contributing-authors">Contributing Authors</option>
                    <option value="academic-council">Academic Council</option>
                    <option value="pedagogical-fellows">Pedagogical Fellows</option>
                    <option value="editorial-reviewers">Editorial &amp; Vetting Reviewers</option>
                  </select>
                </div>
              </div>

              {/* Institutional Affiliation & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Affiliation
                  </label>
                  <input
                    type="text"
                    value={memberFormAffiliation}
                    onChange={(e) => setMemberFormAffiliation(e.target.value)}
                    placeholder="e.g., Former SCERT Senior Pedagogy Consultant, Sikkim"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Credentials &amp; Degrees
                  </label>
                  <input
                    type="text"
                    value={memberFormCredentials}
                    onChange={(e) => setMemberFormCredentials(e.target.value)}
                    placeholder="e.g., Ph.D. in Teacher Education, M.Ed (Gold Medalist)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Scholarly Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scholarly Bio &amp; Pedagogical Philosophy
                </label>
                <textarea
                  rows={2}
                  value={memberFormBio}
                  onChange={(e) => setMemberFormBio(e.target.value)}
                  placeholder="Summarize their career contributions, research in teacher education, or curriculum focus..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-xs"
                />
              </div>

              {/* Curricular Contributions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Curricular Contributions (One per line)
                </label>
                <textarea
                  rows={2}
                  value={memberFormContributions}
                  onChange={(e) => setMemberFormContributions(e.target.value)}
                  placeholder="e.g.,&#10;Author of 400+ CDP Conceptual Practice Questions&#10;STET Paper I & II Blueprint Harmonization&#10;Bloom's Taxonomy Cognitive Level Calibrations"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs resize-none"
                />
              </div>

              {/* Avatar URL & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Photo / Avatar URL
                  </label>
                  <input
                    type="text"
                    value={memberFormAvatarUrl}
                    onChange={(e) => setMemberFormAvatarUrl(e.target.value)}
                    placeholder="https://... (optional, initials used if blank)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Leave blank to auto-generate a professional academic monogram.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Badge (Short Title)
                  </label>
                  <input
                    type="text"
                    value={memberFormBadge}
                    onChange={(e) => setMemberFormBadge(e.target.value)}
                    placeholder="e.g., Council Chairperson, Lead Author, Senior Fellow"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Toggles: Featured & Active */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={memberFormFeatured}
                    onChange={(e) => setMemberFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Pin to Featured Council Spotlight</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={memberFormActive}
                    onChange={(e) => setMemberFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active &amp; Visible on Public Page</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingMember ? 'Save Changes' : 'Enroll Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REVIEW FELLOWSHIP APPLICATION & DECIDE POSITION
          ========================================================================= */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
                      Review Credentials &amp; Decide Position
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {inspectingApp.referenceNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Review academic qualifications, verify pedigree, and assign official council position
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden admin photo input */}
            <input
              type="file"
              ref={adminPhotoInputRef}
              onChange={handleAdminPhotoUpload}
              accept="image/*"
              className="hidden"
              id="admin-passport-photo-upload"
            />

            {/* Top Toolbar: Edit Toggle & Save */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                  isEditingAppForm ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isEditingAppForm ? 'Editing Applicant Record' : 'Viewing Applicant Record'}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {isEditingAppForm ? 'Modify credentials, bio, or photo below then click Save Changes' : 'Click Edit to modify credentials, photo or role fit'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAppForm(!isEditingAppForm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5 border ${
                    isEditingAppForm
                      ? 'bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingAppForm ? 'Cancel Edit' : 'Edit Applicant Details'}</span>
                </button>

                {isEditingAppForm && (
                  <button
                    type="button"
                    onClick={handleSaveAppEdits}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>
            </div>

            {/* Applicant Details, Passport Photo & Credentials Summary */}
            <div className="space-y-4">
              {/* Photo & Identity Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Passport Photo Frame (3.5 : 4.5 ratio) */}
                  <div className="relative group shrink-0">
                    <div
                      onClick={() => adminPhotoInputRef.current?.click()}
                      className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl bg-white border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col items-center justify-center relative ring-2 ring-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
                      title="Click to upload or replace passport photo"
                    >
                      {(appEditPhotoUrl || inspectingApp.photoUrl) ? (
                        <img
                          src={appEditPhotoUrl || inspectingApp.photoUrl}
                          alt={inspectingApp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
                          <Camera className="w-7 h-7 mb-1 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            No Photo
                          </span>
                          <span className="text-[8px] text-slate-400">
                            Passport size
                          </span>
                        </div>
                      )}
                      {isProcessingAdminPhoto && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Photo Action Buttons */}
                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => adminPhotoInputRef.current?.click()}
                        className="p-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 cursor-pointer inline-flex items-center space-x-1"
                        title="Upload or replace passport photo"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo</span>
                      </button>
                      {(appEditPhotoUrl || inspectingApp.photoUrl) && (
                        <button
                          type="button"
                          onClick={handleAdminRemovePhoto}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] border border-rose-200 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Identity Header */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                      <div>
                        {isEditingAppForm ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={appEditHonorific}
                              onChange={(e) => setAppEditHonorific(e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                            >
                              <option value="Prof. Dr.">Prof. Dr.</option>
                              <option value="Prof.">Prof.</option>
                              <option value="Dr.">Dr.</option>
                              <option value="Shri">Shri</option>
                              <option value="Smt.">Smt.</option>
                              <option value="Ms.">Ms.</option>
                              <option value="Mr.">Mr.</option>
                            </select>
                            <input
                              type="text"
                              value={appEditName}
                              onChange={(e) => setAppEditName(e.target.value)}
                              placeholder="Full Name"
                              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                            />
                          </div>
                        ) : (
                          <h4 className="font-black text-slate-900 text-base font-['Outfit']">
                            {inspectingApp.honorific ? `${inspectingApp.honorific} ` : ''}{inspectingApp.name}
                          </h4>
                        )}

                        {isEditingAppForm ? (
                          <input
                            type="text"
                            value={appEditAffiliation}
                            onChange={(e) => setAppEditAffiliation(e.target.value)}
                            placeholder="Affiliation / University"
                            className="w-full mt-1.5 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                          />
                        ) : (
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {inspectingApp.affiliation}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(inspectingApp.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Highest Qualification</span>
                        {isEditingAppForm ? (
                          <input
                            type="text"
                            value={appEditHighestQualification}
                            onChange={(e) => setAppEditHighestQualification(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{inspectingApp.highestQualification}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Specialization Domain</span>
                        {isEditingAppForm ? (
                          <input
                            type="text"
                            value={appEditSpecialization}
                            onChange={(e) => setAppEditSpecialization(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{inspectingApp.specializationDomain}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Experience (Years)</span>
                        {isEditingAppForm ? (
                          <input
                            type="number"
                            value={appEditExperienceYears}
                            onChange={(e) => setAppEditExperienceYears(e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                          />
                        ) : (
                          <span className="font-semibold text-slate-700">{inspectingApp.experienceYears || '0'} Years</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Regional Location</span>
                        {isEditingAppForm ? (
                          <input
                            type="text"
                            value={appEditLocation}
                            onChange={(e) => setAppEditLocation(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                          />
                        ) : (
                          <span className="font-semibold text-slate-700">{inspectingApp.location || 'Sikkim / Himalayan Belt'}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email Address</span>
                        {isEditingAppForm ? (
                          <input
                            type="email"
                            value={appEditEmail}
                            onChange={(e) => setAppEditEmail(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                          />
                        ) : (
                          <span className="font-semibold text-slate-700">{inspectingApp.email}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Contact Phone</span>
                        {isEditingAppForm ? (
                          <input
                            type="tel"
                            value={appEditPhone}
                            onChange={(e) => setAppEditPhone(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                          />
                        ) : (
                          <span className="font-semibold text-slate-700">{inspectingApp.phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Profile Link */}
                    <div className="pt-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Research / LinkedIn Link</span>
                      {isEditingAppForm ? (
                        <input
                          type="url"
                          value={appEditProfileLink}
                          onChange={(e) => setAppEditProfileLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                        />
                      ) : inspectingApp.profileLink ? (
                        <a
                          href={inspectingApp.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-flex items-center space-x-1"
                        >
                          <span className="truncate max-w-sm">{inspectingApp.profileLink}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">None provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* USER REQUESTED: Other Credentials / Custom Credentials Section (Editable) */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-300/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Other Credentials, Additional Qualifications &amp; Distinctions</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Custom Credentials
                  </span>
                </div>
                {isEditingAppForm ? (
                  <input
                    type="text"
                    value={appEditCustomCredentials}
                    onChange={(e) => setAppEditCustomCredentials(e.target.value)}
                    placeholder="e.g. Post-Doctoral Fellow, State Best Teacher Awardee 2024, B.El.Ed, Cambridge Diploma, CTET/STET 1st Rank..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <div className="text-xs font-semibold text-slate-800 bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                    {inspectingApp.customCredentials ? (
                      <span className="text-amber-950 font-bold">{inspectingApp.customCredentials}</span>
                    ) : (
                      <span className="text-slate-400 italic">No other custom credentials specified by applicant.</span>
                    )}
                  </div>
                )}
              </div>

              {/* USER REQUESTED: Brief About Experience, Yourself & Role Fit Section (Editable) */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-xs text-slate-900 font-['Outfit']">
                      About Yourself, Experience &amp; Role Fit Statement
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Self-Introduction &amp; Suitability
                  </span>
                </div>

                {isEditingAppForm ? (
                  <textarea
                    rows={4}
                    value={appEditBriefExperienceAndBio}
                    onChange={(e) => setAppEditBriefExperienceAndBio(e.target.value)}
                    placeholder="Write in brief about professional teaching/research background, candidate bio, and why they fit into this council role..."
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                ) : (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-indigo-100 leading-relaxed italic">
                    {inspectingApp.briefExperienceAndBio ? (
                      `"${inspectingApp.briefExperienceAndBio}"`
                    ) : (
                      <span className="text-slate-400 not-italic">No self-introduction or role fit statement submitted.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Statement of Pedagogy */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Pedagogical Vision &amp; Curriculum Focus Note
                </label>
                {isEditingAppForm ? (
                  <textarea
                    rows={3}
                    value={appEditStatementOfPedagogy}
                    onChange={(e) => setAppEditStatementOfPedagogy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-slate-700 leading-relaxed italic">
                    {inspectingApp.statementOfPedagogy ? `"${inspectingApp.statementOfPedagogy}"` : <span className="text-slate-400 not-italic">None provided</span>}
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              {isEditingAppForm && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Administrator Internal Notes
                  </label>
                  <input
                    type="text"
                    value={appEditAdminNotes}
                    onChange={(e) => setAppEditAdminNotes(e.target.value)}
                    placeholder="Internal evaluation notes..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Quick Save Bar if in Editing Mode */}
              {isEditingAppForm && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-bold">
                    You have unsaved edits to this applicant record.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveAppEdits}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    Save Changes Now
                  </button>
                </div>
              )}

              {/* Proposed Contributions */}
              {inspectingApp.contributions && inspectingApp.contributions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Proposed Curricular &amp; Vetting Focus Areas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingApp.contributions.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CHOOSE PREFERRED ACADEMIC FELLOWSHIP ROLE (ADMIN DECISION) */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/50 p-5 rounded-3xl border-2 border-indigo-200/80 space-y-4 shadow-xs">
                <div className="border-b border-indigo-100 pb-3">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black tracking-wide mb-2 shadow-2xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>ADMIN ROLE ALLOCATION</span>
                  </div>
                  <h4 className="font-black text-base sm:text-lg text-slate-900 font-['Outfit']">
                    Choose Your Preferred Academic Fellowship Role
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    As Administrator / Council Chairperson, select the official council position that best aligns with {inspectingApp.honorific ? `${inspectingApp.honorific} ` : ''}{inspectingApp.name}'s scholarly credentials, or customize the title below before induction.
                  </p>
                </div>

                {/* Preset Role Cards for 1-Click Admin Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Curated Prestigious Council Designations (Click to Assign):
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {SUGGESTED_HIGH_SOUNDING_TITLES.map((role, idx) => {
                      const isSelected = decidedAppPosition === role.title;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setDecidedAppPosition(role.title);
                            setDecidedAppCategory(role.category);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-2.5 text-left ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-500 ring-2 ring-amber-400/50 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 border-amber-600 text-slate-950' : 'border-slate-400 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                                {role.title}
                              </h5>
                              <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 shrink-0">
                                {role.recommendedBadge}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {role.description}
                            </p>
                            <span className="text-[10px] font-semibold text-indigo-700 mt-1 block">
                              Category: {getCategoryLabel(role.category)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fine-Tuning & Custom Input */}
                <div className="pt-2 border-t border-indigo-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Selected Council Position Designation (Editable) *
                    </label>
                    <input
                      type="text"
                      required
                      value={decidedAppPosition}
                      onChange={(e) => setDecidedAppPosition(e.target.value)}
                      placeholder="e.g., Distinguished Contributing Author"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Council Roster Category *
                    </label>
                    <select
                      value={decidedAppCategory}
                      onChange={(e) => setDecidedAppCategory(e.target.value as ContributorCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white cursor-pointer"
                    >
                      <option value="advisory-board">Academic Advisory Board</option>
                      <option value="contributing-authors">Contributing Authors</option>
                      <option value="academic-council">Academic Council</option>
                      <option value="pedagogical-fellows">Pedagogical Fellows</option>
                      <option value="editorial-reviewers">Editorial &amp; Psychometric Reviewers</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(inspectingApp.id, 'under_review')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    inspectingApp.status === 'under_review'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Mark Under Review
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(inspectingApp.id, 'declined')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    inspectingApp.status === 'declined'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'border-slate-200 text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  Decline
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setInspectingApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => handleInductApplicant(inspectingApp)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4 stroke-[2.5]" />
                  <span>Ratify &amp; Induct to Council</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Permanent Delete Candidate Confirmation Modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                  Permanently Delete Candidate?
                </h3>
                <p className="text-xs text-slate-500">
                  This action is irreversible and removes all credentials.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Candidate:</span>
                <span className="font-bold text-slate-900">{candidateToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email / ID:</span>
                <span className="font-mono text-slate-800">{candidateToDelete.email || candidateToDelete.loginId || candidateToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Allocated Course:</span>
                <span className="font-bold text-indigo-700">{getSubscribedCourseTitle(getClientAllocatedTrack(candidateToDelete))}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5 leading-relaxed font-medium">
              Removing this candidate will immediately purge their credentials, tombstone their record from reappearing upon refresh/sync, and terminate active sessions.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingCandidate}
                onClick={() => setCandidateToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCandidate}
                onClick={confirmDeleteCandidate}
                className="px-4.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingCandidate ? 'Deleting...' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
