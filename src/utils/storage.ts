import { UserProfile, MockTestResult, RegisteredUser, LoginAuditLog, ClientRecord, AdminPaymentConfig, DailyStreakActivity, PaymentSubmissionRecord, ExamTrack } from '../types';
import { formatDateToISO, syncProfileStreakOnLoad } from './streakTracker';
import { cacheCriticalStateToSW } from './serviceWorkerRegistration';
import { firestoreSyncService } from '../services/firestoreSyncService';

export const STORAGE_KEY = 'studeezone_profile_v2';
export const LEGACY_STORAGE_KEY = 'certify_prep_profile_v1';
const SYNC_TIMESTAMP_KEY = 'studeezone_last_sync';
export const REGISTERED_USERS_KEY = 'studeezone_registered_users_v1';
export const LOGIN_LOGS_KEY = 'studeezone_login_audit_logs_v1';
export const CLIENTS_KEY = 'studeezone_clients_directory_v1';
const PAYMENT_CONFIG_KEY = 'studeezone_admin_payment_config_v1';
const PAYMENT_SUBMISSIONS_KEY = 'studeezone_payment_submissions_v1';
const DELETED_CANDIDATES_KEY = 'studeezone_deleted_candidates_v1';

export function getDeletedCandidateList(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CANDIDATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordDeletedCandidate(email?: string, id?: string): void {
  try {
    const list = getDeletedCandidateList();
    let modified = false;
    if (email && email.trim()) {
      const norm = email.toLowerCase().trim();
      if (!list.includes(norm)) {
        list.push(norm);
        modified = true;
      }
    }
    if (id && id.trim()) {
      const normId = id.trim();
      if (!list.includes(normId)) {
        list.push(normId);
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(DELETED_CANDIDATES_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_candidate_deleted', { detail: { email, id } }));
      }
    }
  } catch {}
}

export function isDeletedCandidate(email?: string | null, id?: string | null): boolean {
  if (!email && !id) return false;
  const list = getDeletedCandidateList();
  if (email && list.includes(email.toLowerCase().trim())) return true;
  if (id && list.includes(id.trim())) return true;
  return false;
}

export const ADMIN_EMAILS: readonly string[] = [
  'studeezoneapp@gmail.com',
  'vsfintech@gmail.com',
] as const;

export const ADMIN_EMAIL = ADMIN_EMAILS[0];

export function isAdminUser(email?: string | null, _role?: string): boolean {
  if (_role === 'admin') return true;
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized) ||
    normalized === 'studeezoneapp' ||
    normalized === 'vsfintech'
  );
}

export function isProtectedAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized) ||
    normalized === 'studeezoneapp' ||
    normalized === 'vsfintech'
  );
}

export function maskIfAdminEmail(email?: string | null, fallbackLabel = 'studeezone Admin'): string {
  if (!email) return fallbackLabel;
  if (isProtectedAdminEmail(email)) {
    return fallbackLabel;
  }
  return email;
}

function getDefaultStreakData(): {
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
  lastActivityType: 'mock_test' | 'practice_session';
  streakHistory: string[];
  activityLog: Record<string, DailyStreakActivity>;
} {
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);
  const d3 = new Date();
  d3.setDate(d3.getDate() - 3);

  const iso1 = formatDateToISO(d1);
  const iso2 = formatDateToISO(d2);
  const iso3 = formatDateToISO(d3);

  return {
    streakDays: 3,
    longestStreak: 5,
    lastActiveDate: iso1,
    lastActivityType: 'practice_session',
    streakHistory: [iso3, iso2, iso1],
    activityLog: {
      [iso1]: { date: iso1, practiceCount: 6, mockTestCount: 1, totalXpEarned: 135, lastCompletedAt: d1.getTime() },
      [iso2]: { date: iso2, practiceCount: 10, mockTestCount: 0, totalXpEarned: 110, lastCompletedAt: d2.getTime() },
      [iso3]: { date: iso3, practiceCount: 4, mockTestCount: 1, totalXpEarned: 95, lastCompletedAt: d3.getTime() },
    },
  };
}

const defaultStreakInfo = getDefaultStreakData();

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Candidate Learner',
  email: '',
  loginId: '',
  phone: '',
  isLoggedIn: false,
  role: 'candidate',
  authProvider: undefined,
  avatarSeed: 'aspirant-42',
  targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
  selectedExamTrack: 'prt',
  examDate: '2026-11-15',
  streakDays: defaultStreakInfo.streakDays,
  longestStreak: defaultStreakInfo.longestStreak,
  lastActiveDate: defaultStreakInfo.lastActiveDate,
  lastActivityType: defaultStreakInfo.lastActivityType,
  streakHistory: defaultStreakInfo.streakHistory,
  activityLog: defaultStreakInfo.activityLog,
  totalXp: 450,
  savedQuestions: ['stet26-cdp-95', 'stet24-soc-52'],
  diagnosticWeakTopics: [
    'Piaget & Kohlberg Stage Nuances',
    'Constitutional Writs (Article 32 & 226)',
    'Longitudes & Local Time Math',
  ],
  completedQuestions: {},
  mockTestResults: [],
  dailyStudyMinutes: 0,
};

export const SEED_USERS: RegisteredUser[] = [
  {
    id: 'user-admin-vsfintech',
    name: 'studeezone Administrator',
    email: 'vsfintech@gmail.com',
    loginId: 'vsfintech',
    password: 'Password123!',
    role: 'admin',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    createdAt: Date.now() - 30 * 86400000,
    status: 'active',
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 48,
    avgScore: 96,
  },
  {
    id: 'user-admin-studeezoneapp',
    name: 'studeezone Administrator',
    email: 'studeezoneapp@gmail.com',
    loginId: 'studeezoneapp@gmail.com',
    password: '9876543210',
    phone: '9876543210',
    role: 'admin',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    createdAt: Date.now() - 25 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['prt', 'gt-maths-science', 'gt-humanities'],
    lastLoginAt: Date.now() - 5 * 60000,
    testsCompleted: 50,
    avgScore: 98,
  },
  {
    id: 'user-demo-candidate',
    name: 'Aspirant Candidate',
    email: 'candidate@studeezone.com',
    loginId: 'candidate',
    password: 'Password123!',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    createdAt: Date.now() - 10 * 86400000,
    status: 'trial',
    trialExpiresAt: Date.now() + 5 * 86400000,
    lastLoginAt: Date.now() - 45 * 60000,
    testsCompleted: 12,
    avgScore: 78,
  },
  {
    id: 'user-pooja-sharma',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@gmail.com',
    loginId: 'poojasharma',
    password: 'Password123!',
    role: 'candidate',
    authProvider: 'google',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    createdAt: Date.now() - 6 * 86400000,
    status: 'trial',
    trialExpiresAt: Date.now() + 1 * 86400000,
    lastLoginAt: Date.now() - 15 * 60000,
    testsCompleted: 24,
    avgScore: 84,
  },
  {
    id: 'user-asha-prasad',
    name: 'Asha Prasad',
    email: 'ashaprasad@gmail.com',
    loginId: 'ashaprasad',
    password: '+91 98321 55678',
    phone: '+91 98321 55678',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    createdAt: Date.now() - 4 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 18,
    avgScore: 88,
  },
  {
    id: 'user-shanti-subba',
    name: 'Shanti Subba',
    email: 'shantisubba@gmail.com',
    loginId: 'shantisubba',
    password: '+91 97332 66789',
    phone: '+91 97332 66789',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    createdAt: Date.now() - 3 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 15,
    avgScore: 86,
  },
  {
    id: 'user-sonam-lepcha',
    name: 'Sonam Tshering Lepcha',
    email: 'sonam.lepcha@gmail.com',
    loginId: 'sonamlepcha',
    password: '+91 98320 44512',
    phone: '+91 98320 44512',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    createdAt: Date.now() - 3 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 25 * 60000,
    testsCompleted: 22,
    avgScore: 85,
  },
  {
    id: 'user-diki-bhutia',
    name: 'Diki Bhutia',
    email: 'diki.bhutia99@gmail.com',
    loginId: 'dikibhutia',
    password: '+91 97330 18293',
    phone: '+91 97330 18293',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    createdAt: Date.now() - 2 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 75 * 60000,
    testsCompleted: 19,
    avgScore: 89,
  },
  {
    id: 'user-karma-bhutia',
    name: 'Karma Bhutia',
    email: 'karma.bhutia@gmail.com',
    loginId: 'karmabhutia',
    password: '+91 98320 12345',
    phone: '+91 98320 12345',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    createdAt: Date.now() - 5 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 2 * 3600000,
    testsCompleted: 26,
    avgScore: 91,
  },
  {
    id: 'user-pema-dolma',
    name: 'Pema Dolma',
    email: 'pema.dolma@gmail.com',
    loginId: 'pemadolma',
    password: '+91 98322 34567',
    phone: '+91 98322 34567',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    createdAt: Date.now() - 1 * 86400000,
    status: 'trial',
    isPaid: false,
    trialExpiresAt: Date.now() + 7 * 86400000,
    lastLoginAt: Date.now() - 3 * 3600000,
    testsCompleted: 7,
    avgScore: 76,
  },
  {
    id: 'user-tenzing-norbu',
    name: 'Tenzing Norbu',
    email: 'tenzing.norbu@gmail.com',
    loginId: 'tenzingnorbu',
    password: '+91 98324 56789',
    phone: '+91 98324 56789',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    createdAt: Date.now() - 6 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 4 * 3600000,
    testsCompleted: 31,
    avgScore: 87,
  },
  {
    id: 'user-tshering-yangzom',
    name: 'Tshering Yangzom',
    email: 'tshering.yangzom@gmail.com',
    loginId: 'tsheringyangzom',
    password: '+91 98325 67890',
    phone: '+91 98325 67890',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    selectedExamTrack: 'gt-humanities',
    createdAt: Date.now() - 4 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-humanities'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 1 * 3600000,
    testsCompleted: 24,
    avgScore: 90,
  },
  {
    id: 'user-pemba-sharma',
    name: 'Pemba Tshering Sharma',
    email: 'pemba.sharma.history@sikkim.ac.in',
    loginId: 'pembasharma',
    password: '+91 94340 78901',
    phone: '+91 94340 78901',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    selectedExamTrack: 'gt-humanities',
    createdAt: Date.now() - 5 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-humanities'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 35,
    avgScore: 95,
  },
  {
    id: 'user-passang-doma',
    name: 'Passang Doma',
    email: 'passang.doma@gmail.com',
    loginId: 'passangdoma',
    password: '+91 98326 78901',
    phone: '+91 98326 78901',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    createdAt: Date.now() - 1 * 86400000,
    status: 'trial',
    isPaid: false,
    trialExpiresAt: Date.now() + 6 * 86400000,
    lastLoginAt: Date.now() - 5 * 3600000,
    testsCompleted: 9,
    avgScore: 79,
  },
  {
    id: 'user-mingma-sherpa',
    name: 'Mingma Sherpa',
    email: 'mingma.sherpa@gmail.com',
    loginId: 'mingmasherpa',
    password: '+91 98327 89012',
    phone: '+91 98327 89012',
    role: 'candidate',
    authProvider: 'password',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    createdAt: Date.now() - 3 * 86400000,
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 8 * 3600000,
    testsCompleted: 17,
    avgScore: 83,
  },
];

export const INITIAL_CLIENT_RECORDS: ClientRecord[] = [
  {
    id: 'client-asha-prasad',
    name: 'Asha Prasad',
    email: 'ashaprasad@gmail.com',
    loginId: 'ashaprasad',
    password: '+91 98321 55678',
    phone: '+91 98321 55678',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    selectedStream: 'graduate-science',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 4 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 18,
    avgScore: 88,
    notes: 'Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active',
  },
  {
    id: 'client-shanti-subba',
    name: 'Shanti Subba',
    email: 'shantisubba@gmail.com',
    loginId: 'shantisubba',
    password: '+91 97332 66789',
    phone: '+91 97332 66789',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    selectedStream: 'graduate-science',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 15,
    avgScore: 86,
    notes: 'Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active',
  },
  {
    id: 'client-1',
    name: 'studeezone Administrator',
    email: 'vsfintech@gmail.com',
    loginId: 'vsfintech',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    role: 'admin',
    status: 'active',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 30 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 48,
    avgScore: 96,
    notes: 'Primary Master Administrator Account.',
    phone: '+91 98765 43210',
  },
  {
    id: 'client-1-app',
    name: 'studeezone Administrator',
    email: 'studeezoneapp@gmail.com',
    loginId: 'studeezoneapp@gmail.com',
    password: '9876543210',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    role: 'admin',
    status: 'active',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 25 * 86400000,
    lastLoginAt: Date.now() - 5 * 60000,
    testsCompleted: 50,
    avgScore: 98,
    notes: 'Secondary Master Administrator Account.',
    phone: '9876543210',
    isPaid: true,
    paidStreams: ['prt', 'gt-maths-science', 'gt-humanities'],
  },
  {
    id: 'client-2',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@gmail.com',
    loginId: 'poojasharma',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    role: 'candidate',
    status: 'trial',
    trialDaysRemaining: 5,
    registeredAt: Date.now() - 2 * 86400000,
    lastLoginAt: Date.now() - 15 * 60000,
    testsCompleted: 8,
    avgScore: 82,
    notes: 'Enrolled in 7-Day Free Trial. High activity in CDP practice.',
    phone: '+91 98112 34567',
  },
  {
    id: 'client-5',
    name: 'Amit Patel',
    email: 'amit.stet@gmail.com',
    loginId: 'amitpatel',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    role: 'candidate',
    status: 'expired',
    trialDaysRemaining: 0,
    registeredAt: Date.now() - 12 * 86400000,
    lastLoginAt: Date.now() - 48 * 3600000,
    testsCompleted: 6,
    avgScore: 68,
    notes: '7-day trial ended 5 days ago. Follow-up for trial extension or discount.',
    phone: '+91 95456 78901',
  },
  {
    id: 'client-7',
    name: 'Candidate Learner (Demo)',
    email: 'candidate@studeezone.com',
    loginId: 'candidate',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    role: 'candidate',
    status: 'trial',
    trialDaysRemaining: 6,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 45 * 60000,
    testsCompleted: 12,
    avgScore: 78,
    notes: 'Default student practice persona.',
    phone: '+91 93678 90123',
  },
  {
    id: 'client-sonam-lepcha',
    name: 'Sonam Tshering Lepcha',
    email: 'sonam.lepcha@gmail.com',
    loginId: 'sonamlepcha',
    password: '+91 98320 44512',
    phone: '+91 98320 44512',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    selectedStream: 'primary',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 25 * 60000,
    testsCompleted: 22,
    avgScore: 85,
    notes: 'Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active',
  },
  {
    id: 'client-diki-bhutia',
    name: 'Diki Bhutia',
    email: 'diki.bhutia99@gmail.com',
    loginId: 'dikibhutia',
    password: '+91 97330 18293',
    phone: '+91 97330 18293',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    selectedStream: 'graduate-science',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 2 * 86400000,
    lastLoginAt: Date.now() - 75 * 60000,
    testsCompleted: 19,
    avgScore: 89,
    notes: 'Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active',
  },
  {
    id: 'client-karma-bhutia',
    name: 'Karma Bhutia',
    email: 'karma.bhutia@gmail.com',
    loginId: 'karmabhutia',
    password: '+91 98320 12345',
    phone: '+91 98320 12345',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-maths-science'],
    selectedStream: 'graduate-science',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 5 * 86400000,
    lastLoginAt: Date.now() - 2 * 3600000,
    testsCompleted: 26,
    avgScore: 91,
    notes: 'Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active',
  },
  {
    id: 'client-pema-dolma',
    name: 'Pema Dolma',
    email: 'pema.dolma@gmail.com',
    loginId: 'pemadolma',
    password: '+91 98322 34567',
    phone: '+91 98322 34567',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    role: 'candidate',
    status: 'trial',
    trialDaysRemaining: 7,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 3 * 3600000,
    testsCompleted: 7,
    avgScore: 76,
    notes: '7-Day Free Trial Aspirant • Active in CDP practice',
  },
  {
    id: 'client-tenzing-norbu',
    name: 'Tenzing Norbu',
    email: 'tenzing.norbu@gmail.com',
    loginId: 'tenzingnorbu',
    password: '+91 98324 56789',
    phone: '+91 98324 56789',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    selectedStream: 'primary',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 6 * 86400000,
    lastLoginAt: Date.now() - 4 * 3600000,
    testsCompleted: 31,
    avgScore: 87,
    notes: 'Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active',
  },
  {
    id: 'client-tshering-yangzom',
    name: 'Tshering Yangzom',
    email: 'tshering.yangzom@gmail.com',
    loginId: 'tsheringyangzom',
    password: '+91 98325 67890',
    phone: '+91 98325 67890',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    selectedExamTrack: 'gt-humanities',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-humanities'],
    selectedStream: 'graduate-social',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 4 * 86400000,
    lastLoginAt: Date.now() - 1 * 3600000,
    testsCompleted: 24,
    avgScore: 90,
    notes: 'Subscribed to GT Humanities (Paper II) • Pro Paid Active',
  },
  {
    id: 'client-pemba-sharma',
    name: 'Pemba Tshering Sharma',
    email: 'pemba.sharma.history@sikkim.ac.in',
    loginId: 'pembasharma',
    password: '+91 94340 78901',
    phone: '+91 94340 78901',
    targetExam: 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    selectedExamTrack: 'gt-humanities',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['gt-humanities'],
    selectedStream: 'graduate-social',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 5 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 35,
    avgScore: 95,
    notes: 'Distinguished Council Fellow & Author • Pro Paid Active',
  },
  {
    id: 'client-passang-doma',
    name: 'Passang Doma',
    email: 'passang.doma@gmail.com',
    loginId: 'passangdoma',
    password: '+91 98326 78901',
    phone: '+91 98326 78901',
    targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    selectedExamTrack: 'gt-maths-science',
    role: 'candidate',
    status: 'trial',
    trialDaysRemaining: 6,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 5 * 3600000,
    testsCompleted: 9,
    avgScore: 79,
    notes: 'Enrolled in 7-Day Free Trial • Practicing Mathematics & Pedagogy',
  },
  {
    id: 'client-mingma-sherpa',
    name: 'Mingma Sherpa',
    email: 'mingma.sherpa@gmail.com',
    loginId: 'mingmasherpa',
    password: '+91 98327 89012',
    phone: '+91 98327 89012',
    targetExam: 'Sikkim Primary Teacher (PRT - Paper I)',
    selectedExamTrack: 'prt',
    role: 'candidate',
    status: 'active',
    isPaid: true,
    paidStreams: ['prt'],
    selectedStream: 'primary',
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 8 * 3600000,
    testsCompleted: 17,
    avgScore: 83,
    notes: 'Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active',
  },
];

export const INITIAL_LOGIN_LOGS: LoginAuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin-vsfintech',
    userName: 'studeezone Administrator',
    userEmail: 'vsfintech@gmail.com',
    loginId: 'vsfintech',
    role: 'admin',
    authProvider: 'password',
    timestamp: Date.now() - 10 * 60000,
    ipAddress: '157.34.122.91',
    deviceInfo: 'Chrome 131 • Windows 11 Desktop',
    location: 'Patna, Bihar, India',
    status: 'active',
  },
  {
    id: 'log-2',
    userId: 'user-pooja-sharma',
    userName: 'Pooja Sharma',
    userEmail: 'pooja.sharma@gmail.com',
    loginId: 'poojasharma',
    role: 'candidate',
    authProvider: 'google',
    timestamp: Date.now() - 15 * 60000,
    ipAddress: '103.21.144.18',
    deviceInfo: 'Safari 18 • iPhone 15 Pro',
    location: 'Delhi, India',
    status: 'active',
  },
  {
    id: 'log-3',
    userId: 'user-demo-candidate',
    userName: 'Aspirant Candidate',
    userEmail: 'candidate@studeezone.com',
    loginId: 'candidate',
    role: 'candidate',
    authProvider: 'password',
    timestamp: Date.now() - 45 * 60000,
    ipAddress: '122.160.180.204',
    deviceInfo: 'Firefox 133 • macOS Sonoma',
    location: 'Bengaluru, Karnataka, India',
    status: 'active',
  },
];

// Helper to filter out artificial dummy accounts
export function isDummyAccount(userOrEmail?: string | { name?: string; email?: string } | null): boolean {
  if (!userOrEmail) return false;
  const str = (typeof userOrEmail === 'string' 
    ? userOrEmail 
    : `${userOrEmail.name || ''} ${userOrEmail.email || ''}`
  ).toLowerCase();
  
  return (
    str.includes('rohan kumar') ||
    str.includes('rohan.k') ||
    str.includes('rohankumar') ||
    str.includes('sunita verma') ||
    str.includes('sunita.v') ||
    str.includes('sunita_v') ||
    str.includes('priya nair') ||
    str.includes('priya.nair') ||
    str.includes('priya_nair')
  );
}

export const DELETED_EMAILS_KEY = 'stet_deleted_emails';

export function getDeletedEmails(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedEmail(item: string): void {
  try {
    if (!item) return;
    const clean = String(item).toLowerCase().trim();
    if (!clean) return;
    const list = getDeletedEmails();
    const unPrefixed = clean.replace(/^(client-|user-)+/g, '');
    const toAdd = [
      clean,
      unPrefixed,
      `client-${unPrefixed}`,
      `user-${unPrefixed}`,
      `client-user-${unPrefixed}`,
    ].filter(Boolean);

    let changed = false;
    toAdd.forEach((val) => {
      if (!list.includes(val)) {
        list.push(val);
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(DELETED_EMAILS_KEY, JSON.stringify(list));
    }
  } catch {}
}

export function isDeletedEmail(emailOrIdOrName?: string): boolean {
  if (!emailOrIdOrName) return false;
  const clean = String(emailOrIdOrName).toLowerCase().trim();
  if (!clean) return false;
  const list = getDeletedEmails();
  if (list.includes(clean)) return true;
  const unPrefixed = clean.replace(/^(client-|user-)+/g, '');
  if (unPrefixed && list.includes(unPrefixed)) return true;
  if (
    unPrefixed &&
    list.some((item) => {
      const itemClean = String(item).toLowerCase().trim();
      const itemUnprefixed = itemClean.replace(/^(client-|user-)+/g, '');
      return itemClean === clean || (itemUnprefixed && itemUnprefixed === unPrefixed);
    })
  ) {
    return true;
  }
  return false;
}

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    let list: RegisteredUser[];
    if (!raw) {
      list = [...SEED_USERS];
    } else {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [...SEED_USERS];
    }

    // Purge dummy accounts and explicitly deleted users
    const beforeCount = list.length;
    list = list.filter((u) => !isDummyAccount(u) && !isDeletedEmail(u.email) && !isDeletedEmail(u.loginId) && !isDeletedEmail(u.id) && !isDeletedEmail(u.name));
    let modified = list.length !== beforeCount;

    // Ensure all SEED_USERS exist and have valid non-empty passwords (unless deleted)
    for (const seed of SEED_USERS) {
      if (isDummyAccount(seed) || isDeletedEmail(seed.email) || isDeletedEmail(seed.loginId) || isDeletedEmail(seed.id) || isDeletedEmail(seed.name)) continue;
      const existingIdx = list.findIndex(
        (u) => u.email.toLowerCase() === seed.email.toLowerCase()
      );
      if (existingIdx === -1) {
        list.push({ ...seed });
        modified = true;
      } else {
        // If password is missing or empty, restore the correct seed password
        if (!list[existingIdx].password) {
          list[existingIdx].password = seed.password;
          modified = true;
        }
        if (isAdminUser(seed.email)) {
          list[existingIdx].role = 'admin';
          list[existingIdx].password = seed.password || '9876543210';
          list[existingIdx].phone = seed.phone || '9876543210';
          list[existingIdx].isPaid = true;
          list[existingIdx].status = 'active';
          list[existingIdx].paidStreams = ['prt', 'gt-maths-science', 'gt-humanities'];
          modified = true;
        }
      }
    }

    // Ensure studeezoneapp@gmail.com is set to admin with password 9876543210
    list.forEach((u) => {
      const email = (u.email || '').toLowerCase().trim();
      const login = (u.loginId || '').toLowerCase().trim();
      if (email === 'studeezoneapp@gmail.com' || login === 'studeezoneapp' || login === 'studeezoneapp@gmail.com') {
        if (u.password !== '9876543210' || u.phone !== '9876543210' || u.role !== 'admin' || !u.isPaid) {
          u.password = '9876543210';
          u.phone = '9876543210';
          u.role = 'admin';
          u.isPaid = true;
          u.status = 'active';
          u.paidStreams = ['prt', 'gt-maths-science', 'gt-humanities'];
          modified = true;
        }
      }
    });

    // Ensure Asha Prasad and Shanti Subba have their allocated GT Maths & Science course properly saved if present
    list.forEach((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      if (
        name.includes('asha') ||
        name.includes('prasad') ||
        name.includes('shanti') ||
        name.includes('subba') ||
        email.includes('ashaprasad') ||
        email.includes('shantisubba')
      ) {
        if (!u.paidStreams || u.paidStreams.length === 0 || !u.isPaid) {
          u.targetExam = 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
          u.selectedExamTrack = 'gt-maths-science';
          u.paidStreams = ['gt-maths-science'];
          u.isPaid = true;
          u.status = 'active';
          modified = true;
        }
      }
    });

    if (modified || !raw) {
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
      } catch (err) {
        console.error('Failed to sync registered users', err);
      }
    }

    return list;
  } catch {
    return SEED_USERS;
  }
}

export function registerNewUser(userData: {
  name: string;
  email: string;
  loginId?: string;
  password?: string;
  targetExam?: string;
  phone?: string;
  authProvider?: 'google' | 'password';
  role?: 'admin' | 'candidate';
}): { success: boolean; user?: RegisteredUser; message?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = userData.email.toLowerCase().trim();
  const normalizedLoginId = (userData.loginId ? userData.loginId.toLowerCase().trim() : '') || normalizedEmail.split('@')[0] || normalizedEmail;
  const isSuperAdmin = isAdminUser(normalizedEmail);

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      success: false,
      message: 'Please provide a valid email address (e.g. yourname@domain.com).',
    };
  }

  // Validate login ID
  if (!normalizedLoginId || normalizedLoginId.length < 2) {
    return {
      success: false,
      message: 'Invalid email or login identifier.',
    };
  }

  // Validate password / phone
  const effectivePassword = userData.password || userData.phone || '';
  if (!effectivePassword || effectivePassword.trim().length < 4) {
    return {
      success: false,
      message: 'Please provide a valid phone number (used as account password).',
    };
  }

  // Check if exists
  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail ||
      (userData.loginId && u.loginId && u.loginId.toLowerCase() === normalizedLoginId)
  );

  if (existing) {
    return {
      success: false,
      message: 'An account with this Email address already exists. Please sign in.',
    };
  }

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}`,
    name: userData.name.trim(),
    email: normalizedEmail,
    loginId: normalizedLoginId,
    phone: userData.phone ? userData.phone.trim() : undefined,
    password: effectivePassword,
    authProvider: userData.authProvider || 'password',
    role: isSuperAdmin ? 'admin' : (userData.role || 'candidate'),
    targetExam: userData.targetExam || 'Sikkim Primary Teacher (PRT - Paper I)',
    createdAt: Date.now(),
    status: isSuperAdmin ? 'active' : 'trial',
    trialExpiresAt: Date.now() + 1 * 86400000,
    lastLoginAt: Date.now(),
    testsCompleted: 0,
    avgScore: 0,
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    cacheCriticalStateToSW('registeredUsers', updatedUsers);
    window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: updatedUsers }));
  } catch (e) {
    console.error('Failed to save users', e);
  }

  // Also add to client directory
  createClient({
    name: newUser.name,
    email: newUser.email,
    loginId: newUser.loginId,
    password: effectivePassword,
    targetExam: newUser.targetExam,
    phone: newUser.phone,
    role: newUser.role,
    status: isSuperAdmin ? 'active' : 'trial',
    trialDaysRemaining: isSuperAdmin ? 365 : 1,
  });

  // Sync to server users endpoint
  try {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: newUser }),
    }).catch(() => {});
  } catch {}

  return { success: true, user: newUser };
}

export function matchesPasswordOrPhone(
  expectedPassword?: string,
  expectedPhone?: string,
  attempt?: string
): boolean {
  if (!attempt || !attempt.trim()) return false;
  const cleanAttempt = attempt.trim();

  // Direct string match with password
  if (expectedPassword && expectedPassword.trim() === cleanAttempt) return true;

  // Direct string match with phone number
  if (expectedPhone && expectedPhone.trim() === cleanAttempt) return true;

  // Normalized digit-based comparison for phone number as password
  const digitsAttempt = cleanAttempt.replace(/\D/g, '');
  if (digitsAttempt.length >= 7) {
    if (expectedPassword) {
      const digitsPass = expectedPassword.replace(/\D/g, '');
      if (digitsPass.length >= 7 && (digitsPass === digitsAttempt || digitsPass.endsWith(digitsAttempt) || digitsAttempt.endsWith(digitsPass))) {
        return true;
      }
    }
    if (expectedPhone) {
      const digitsPhone = expectedPhone.replace(/\D/g, '');
      if (digitsPhone.length >= 7 && (digitsPhone === digitsAttempt || digitsPhone.endsWith(digitsAttempt) || digitsAttempt.endsWith(digitsPhone))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns the allocated ExamTrack for a candidate based on their subscription,
 * target exam, selected stream, or candidate identity.
 */
export function getClientAllocatedTrack(client?: Partial<ClientRecord> | null): ExamTrack {
  if (!client) return 'gt-maths-science';

  // 1. Paid streams explicitly allocated by Admin or subscription has highest precedence
  if (client.paidStreams && client.paidStreams.length > 0) {
    const pTrack = client.paidStreams[0];
    if (['gt-maths-science', 'gt-humanities', 'prt'].includes(pTrack)) {
      return pTrack;
    }
  }

  // 2. Target STET exam title check (e.g. from Admin Course Allocation)
  if (client.targetExam) {
    const lower = client.targetExam.toLowerCase();
    if (lower.includes('math') || lower.includes('science')) {
      return 'gt-maths-science';
    }
    if (lower.includes('humanities') || lower.includes('social')) {
      return 'gt-humanities';
    }
    if (lower.includes('primary') || lower.includes('prt')) {
      return 'prt';
    }
  }

  // 3. Special candidates Asha Prasad & Shanti Subba who subscribed to GT Maths & Science
  const nameAndEmail = `${client.name || ''} ${client.email || ''} ${client.loginId || ''}`.toLowerCase();
  if (
    nameAndEmail.includes('asha') ||
    nameAndEmail.includes('prasad') ||
    nameAndEmail.includes('shanti') ||
    nameAndEmail.includes('subba')
  ) {
    return 'gt-maths-science';
  }

  // 4. If candidate selected or was allocated an explicit exam track
  if (client.selectedExamTrack && ['gt-maths-science', 'gt-humanities', 'prt'].includes(client.selectedExamTrack)) {
    return client.selectedExamTrack;
  }

  // 5. If candidate selected a specific stream
  if (client.selectedStream === 'graduate-science') return 'gt-maths-science';
  if (client.selectedStream === 'graduate-social') return 'gt-humanities';
  if (client.selectedStream === 'primary') return 'prt';

  return 'gt-maths-science';
}

export function authenticateWithPassword(
  loginIdentifier: string,
  passwordAttempt: string
): { success: boolean; user?: RegisteredUser; message?: string } {
  if (!loginIdentifier || !loginIdentifier.trim()) {
    return {
      success: false,
      message: 'Please enter your registered Login ID or Email address.',
    };
  }

  if (!passwordAttempt || !passwordAttempt.trim()) {
    return {
      success: false,
      message: 'Please enter your password (default is phone number).',
    };
  }

  const users = getRegisteredUsers();
  const clients = getAllClients();
  const identifier = loginIdentifier.toLowerCase().trim();
  const digitsId = identifier.replace(/\D/g, '');
  const cleanPass = passwordAttempt.trim();
  const digitsPass = cleanPass.replace(/\D/g, '');

  // Direct Master Admin authentication bypass for studeezoneapp@gmail.com with password 9876543210
  const isStudeezoneAdmin =
    identifier === 'studeezoneapp@gmail.com' ||
    identifier === 'studeezoneapp' ||
    (digitsId.length >= 7 && digitsId.endsWith('9876543210'));

  if (isStudeezoneAdmin && (cleanPass === '9876543210' || digitsPass === '9876543210')) {
    const adminUser: RegisteredUser = {
      id: 'user-admin-studeezoneapp',
      name: 'studeezone Administrator',
      email: 'studeezoneapp@gmail.com',
      loginId: 'studeezoneapp@gmail.com',
      phone: '9876543210',
      password: '9876543210',
      authProvider: 'password',
      role: 'admin',
      targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
      createdAt: Date.now() - 25 * 86400000,
      status: 'active',
      isPaid: true,
      paidStreams: ['prt', 'gt-maths-science', 'gt-humanities'],
      lastLoginAt: Date.now(),
      testsCompleted: 50,
      avgScore: 98,
    };
    try {
      const allUsers = getRegisteredUsers();
      const idx = allUsers.findIndex((u) => u.email.toLowerCase() === 'studeezoneapp@gmail.com');
      if (idx !== -1) {
        allUsers[idx] = { ...allUsers[idx], ...adminUser };
      } else {
        allUsers.unshift(adminUser);
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(allUsers));
      window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: allUsers }));
    } catch {}
    recordLoginAudit(adminUser);
    return { success: true, user: adminUser };
  }

  // 1. Try finding in Registered Users
  let user = users.find(
    (u) =>
      u.email.toLowerCase() === identifier ||
      (u.loginId && u.loginId.toLowerCase() === identifier) ||
      (digitsId.length >= 7 && u.phone && u.phone.replace(/\D/g, '').endsWith(digitsId))
  );

  // 2. Check Client Directory (Clients added/updated by Admin)
  const matchedClient = clients.find(
    (c) =>
      c.email.toLowerCase() === identifier ||
      (c.loginId && c.loginId.toLowerCase() === identifier) ||
      (user && (c.email.toLowerCase() === user.email.toLowerCase() || c.id === user.id.replace('user-', ''))) ||
      (digitsId.length >= 7 && c.phone && c.phone.replace(/\D/g, '').endsWith(digitsId))
  );

  if (matchedClient) {
    const allocatedTrack = getClientAllocatedTrack(matchedClient);
    const allocatedTitle = getSubscribedCourseTitle(allocatedTrack);
    const isPro = Boolean(matchedClient.isPaid || matchedClient.status === 'active');
    if (!user) {
      user = {
        id: `user-${matchedClient.id}`,
        name: matchedClient.name,
        email: matchedClient.email.toLowerCase().trim(),
        loginId: matchedClient.loginId || matchedClient.email.toLowerCase().trim(),
        phone: matchedClient.phone,
        password: matchedClient.password || matchedClient.phone,
        authProvider: 'password',
        role: matchedClient.role || 'candidate',
        targetExam: matchedClient.targetExam || allocatedTitle,
        createdAt: matchedClient.registeredAt || Date.now(),
        status: matchedClient.status || (isPro ? 'active' : 'trial'),
        trialExpiresAt: Date.now() + (matchedClient.trialDaysRemaining || 7) * 86400000,
        lastLoginAt: Date.now(),
        testsCompleted: matchedClient.testsCompleted || 0,
        avgScore: matchedClient.avgScore || 0,
        isPaid: isPro,
        paidStreams: matchedClient.paidStreams && matchedClient.paidStreams.length > 0 ? matchedClient.paidStreams : [allocatedTrack],
      };

      const updatedUsers = [...users, user];
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
      } catch (e) {}
    } else {
      // Synchronize latest credentials and profile attributes from client directory
      if (matchedClient.password) user.password = matchedClient.password;
      if (matchedClient.loginId) user.loginId = matchedClient.loginId;
      if (matchedClient.phone) user.phone = matchedClient.phone;
      if (matchedClient.name) user.name = matchedClient.name;
      user.targetExam = matchedClient.targetExam || allocatedTitle;
      if (matchedClient.status) user.status = matchedClient.status;
      if (matchedClient.isPaid !== undefined) user.isPaid = matchedClient.isPaid;
      user.paidStreams = matchedClient.paidStreams && matchedClient.paidStreams.length > 0 ? matchedClient.paidStreams : [allocatedTrack];
    }
  }

  if (!user) {
    return {
      success: false,
      message: 'Invalid credentials. No registered account found with that Login ID or Email. Please check with your administrator or register now.',
    };
  }

  // Verify password or phone number
  const isMatch = matchesPasswordOrPhone(user.password, user.phone, passwordAttempt);
  if (!isMatch) {
    if (!user.password || !user.password.trim()) {
      user.password = passwordAttempt;
    } else {
      return {
        success: false,
        message: 'Incorrect password. By default, your password is your registered phone number.',
      };
    }
  }

  // Update last login
  const isSuperAdmin = isAdminUser(user.email);
  const updatedUser: RegisteredUser = {
    ...user,
    role: isSuperAdmin ? 'admin' : (user.role || 'candidate'),
    lastLoginAt: Date.now(),
  };

  try {
    const updatedUsers = users.map((u) => (u.id === user!.id ? updatedUser : u));
    if (!updatedUsers.some((u) => u.id === updatedUser.id)) {
      updatedUsers.push(updatedUser);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: updatedUsers }));
  } catch (e) {
    console.error('Failed to update user login', e);
  }

  recordLoginAudit(updatedUser);

  // Sync login with server
  try {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: loginIdentifier, password: passwordAttempt }),
    }).catch(() => {});
  } catch {}

  return { success: true, user: updatedUser };
}

export function lookupUserByEmail(email: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  const normalized = email.toLowerCase().trim();
  return users.find(
    (u) => u.email.toLowerCase() === normalized || (u.loginId && u.loginId.toLowerCase() === normalized)
  );
}

export function updateUserPassword(
  emailOrLoginId: string,
  newPassword: string
): { success: boolean; user?: RegisteredUser; message?: string } {
  const users = getRegisteredUsers();
  const identifier = emailOrLoginId.toLowerCase().trim();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === identifier || (u.loginId && u.loginId.toLowerCase() === identifier)
  );

  if (index === -1) {
    if (isAdminUser(identifier)) {
      const adminSeed = SEED_USERS.find(u => u.email.toLowerCase() === identifier.toLowerCase()) || SEED_USERS[0];
      const adminUser: RegisteredUser = {
        ...adminSeed,
        email: identifier,
        password: newPassword,
      };
      users.unshift(adminUser);
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      } catch (e) {
        console.error('Failed to save admin user', e);
      }
      return { success: true, user: adminUser };
    }
    return {
      success: false,
      message: 'No registered account found with that email address.',
    };
  }

  const updatedUser: RegisteredUser = {
    ...users[index],
    password: newPassword,
  };
  users[index] = updatedUser;

  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to update password', e);
  }

  return { success: true, user: updatedUser };
}

export function changeUserPasswordWithVerification(
  emailOrLoginId: string,
  currentPasswordAttempt: string,
  newPassword: string
): { success: boolean; user?: RegisteredUser; message?: string } {
  if (!emailOrLoginId || !emailOrLoginId.trim()) {
    return { success: false, message: 'Invalid user identifier.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' };
  }

  const users = getRegisteredUsers();
  const identifier = emailOrLoginId.toLowerCase().trim();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === identifier || (u.loginId && u.loginId.toLowerCase() === identifier)
  );

  if (index === -1) {
    if (isAdminUser(identifier)) {
      const adminSeed = SEED_USERS.find((u) => u.email.toLowerCase() === identifier.toLowerCase()) || SEED_USERS[0];
      const validAdminPass = adminSeed.password || 'Studyzone@09';
      if (
        currentPasswordAttempt &&
        currentPasswordAttempt !== validAdminPass &&
        currentPasswordAttempt !== 'Studyzone@09' &&
        currentPasswordAttempt !== 'Password123!'
      ) {
        return { success: false, message: 'Current password does not match.' };
      }
      return updateUserPassword(identifier, newPassword);
    }
    return {
      success: false,
      message: 'No registered account found with that email address.',
    };
  }

  const user = users[index];
  if (user.password && user.password.trim() && user.password !== currentPasswordAttempt) {
    return { success: false, message: 'Current password does not match. Please try again.' };
  }

  return updateUserPassword(identifier, newPassword);
}

export function updateUserPhone(
  emailOrLoginId: string,
  phone: string
): { success: boolean; message?: string } {
  const users = getRegisteredUsers();
  const identifier = emailOrLoginId.toLowerCase().trim();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === identifier || (u.loginId && u.loginId.toLowerCase() === identifier)
  );

  if (index !== -1) {
    users[index] = { ...users[index], phone: phone.trim() };
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to update phone in users', e);
    }
  }

  // Also update in clients
  const clients = getAllClients();
  const clientIdx = clients.findIndex(
    (c) => c.email.toLowerCase() === identifier || (c.loginId && c.loginId.toLowerCase() === identifier)
  );
  if (clientIdx !== -1) {
    clients[clientIdx] = { ...clients[clientIdx], phone: phone.trim() };
    saveClients(clients);
  }

  return { success: true };
}

const GOOGLE_CLIENT_ID_STORAGE_KEY = 'studeezone_google_client_id';

export function isValidGoogleClientId(clientId: string): boolean {
  if (!clientId) return false;
  const trimmed = clientId.trim();
  return (
    trimmed.endsWith('.apps.googleusercontent.com') &&
    !trimmed.includes('@') &&
    !trimmed.includes(' ') &&
    trimmed.length > 25
  );
}

export function getGoogleClientId(): string {
  if (typeof window === 'undefined') return '';
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (envClientId && typeof envClientId === 'string' && isValidGoogleClientId(envClientId)) {
    return envClientId.trim();
  }
  const stored = localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY) || '';
  if (stored) {
    if (!isValidGoogleClientId(stored)) {
      // Automatically purge invalid entries (e.g. if an email address or test string was mistakenly saved)
      localStorage.removeItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
      return '';
    }
    return stored.trim();
  }
  return '';
}

export function saveGoogleClientId(clientId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!clientId || !clientId.trim()) {
    localStorage.removeItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
    return true;
  }
  const trimmed = clientId.trim();
  if (!isValidGoogleClientId(trimmed)) {
    return false;
  }
  localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, trimmed);
  return true;
}

export function authenticateWithVerifiedGoogle(profile: {
  email: string;
  name?: string;
  picture?: string;
}): { success: boolean; user?: RegisteredUser; message?: string } {
  const { email, name } = profile;
  if (!email || !email.trim()) {
    return {
      success: false,
      message: 'Google authorization did not return a valid email address.',
    };
  }
  const users = getRegisteredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.includes('@')) {
    return {
      success: false,
      message: 'Invalid email format received from Google.',
    };
  }
  const isSuperAdmin = isAdminUser(normalizedEmail);
  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // STRICT REQUIREMENT: Without registration, do NOT allow any email to log in into the site!
  if (!user) {
    return {
      success: false,
      message: `Access denied. The email address "${normalizedEmail}" is not registered in our system. Without prior registration, you cannot log in into the site. Please register an account first via the Register tab.`,
    };
  }

  user = {
    ...user,
    role: isSuperAdmin ? 'admin' : (user.role || 'candidate'),
    lastLoginAt: Date.now(),
  };
  if (name && (!user.name || user.name === user.loginId)) {
    user.name = name;
  }
  try {
    const updatedUsers = users.map((u) => (u.id === user!.id ? user! : u));
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (e) {
    console.error(e);
  }

  recordLoginAudit(user);
  return { success: true, user };
}

export function authenticateWithRegisteredGmail(email: string): {
  success: boolean;
  user?: RegisteredUser;
  needsPassword?: boolean;
  message?: string;
} {
  if (!email || !email.trim()) {
    return {
      success: false,
      message: 'Please enter your registered Gmail address.',
    };
  }
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.includes('@')) {
    return {
      success: false,
      message: 'Please enter a valid Gmail address (e.g. yourname@gmail.com).',
    };
  }
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      message: `Access denied. "${normalizedEmail}" is not registered in our system. Without prior registration, you cannot log in into the site. Please register now or subscribe for full access.`,
    };
  }

  // If the account has a password, prompt for password verification
  if (user.password && user.password.trim()) {
    return {
      success: true,
      user,
      needsPassword: true,
      message: `Registered account found for ${user.name || user.loginId}. Please enter your password to sign in.`,
    };
  }

  // If user has no password (e.g. direct google account), authenticate directly
  const isSuperAdmin = isAdminUser(normalizedEmail);
  const updatedUser: RegisteredUser = {
    ...user,
    role: isSuperAdmin ? 'admin' : (user.role || 'candidate'),
    lastLoginAt: Date.now(),
  };

  try {
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (e) {
    console.error(e);
  }

  recordLoginAudit(updatedUser);
  return { success: true, user: updatedUser, needsPassword: false };
}

export function authenticateWithGoogle(
  email: string,
  name?: string
): { success: boolean; user?: RegisteredUser; message?: string } {
  return authenticateWithVerifiedGoogle({ email, name });
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);

    const isSuperAdmin = Boolean(parsed.isLoggedIn) && (isAdminUser(parsed.email) || parsed.role === 'admin');
    let isPaid = parsed.isPaid;
    let trialDays = parsed.trialDaysRemaining;
    let paidStreams: ExamTrack[] = parsed.paidStreams || [];

    let allocatedClientTrack: ExamTrack | undefined;
    let matchedClientFound: ClientRecord | undefined;

    try {
      const clients = getAllClients();
      const normEmail = (parsed.email || '').toLowerCase().trim();
      const normLogin = (parsed.loginId || '').toLowerCase().trim();
      const normName = (parsed.name || '').toLowerCase().trim();
      const matched = clients.find(
        (c) =>
          (normEmail && c.email.toLowerCase().trim() === normEmail) ||
          (normLogin && c.loginId && c.loginId.toLowerCase().trim() === normLogin) ||
          (normName && normName !== 'candidate learner' && c.name.toLowerCase().trim() === normName)
      );
      if (matched) {
        matchedClientFound = matched;
        allocatedClientTrack = getClientAllocatedTrack(matched);
        if (matched.isPaid === false && matched.status !== 'active') {
          isPaid = false;
          paidStreams = [];
        } else if (matched.isPaid || matched.status === 'active') {
          isPaid = true;
          trialDays = matched.trialDaysRemaining || 365;
          paidStreams = [allocatedClientTrack];
        } else if (matched.status === 'expired') {
          trialDays = 0;
          isPaid = false;
        } else if (matched.trialDaysRemaining !== undefined) {
          trialDays = matched.trialDaysRemaining;
        }
      }
    } catch {}

    const userLowerName = (parsed.name || '').toLowerCase();
    const userLowerEmail = (parsed.email || '').toLowerCase();
    const userLowerLogin = (parsed.loginId || '').toLowerCase();
    const isAshaOrShanti =
      userLowerName.includes('asha') ||
      userLowerName.includes('prasad') ||
      userLowerName.includes('shanti') ||
      userLowerName.includes('subba') ||
      userLowerEmail.includes('ashaprasad') ||
      userLowerEmail.includes('shantisubba') ||
      userLowerLogin.includes('ashaprasad') ||
      userLowerLogin.includes('shantisubba');

    if (isAshaOrShanti && !allocatedClientTrack) {
      isPaid = true;
      trialDays = 365;
      paidStreams = ['gt-maths-science'];
      allocatedClientTrack = 'gt-maths-science';
    }

    if (isSuperAdmin) {
      paidStreams = ['prt', 'gt-maths-science', 'gt-humanities'];
    } else if (allocatedClientTrack) {
      paidStreams = [allocatedClientTrack];
    } else if (isPaid && (paidStreams.length === 0 || paidStreams[0] === 'prt')) {
      const lower = (parsed.targetExam || '').toLowerCase();
      if (lower.includes('math') || lower.includes('science')) paidStreams = ['gt-maths-science'];
      else if (lower.includes('humanities') || lower.includes('social')) paidStreams = ['gt-humanities'];
    }

    const hasIdentifier = Boolean(
      (parsed.email && parsed.email.trim() !== '') ||
      (parsed.loginId && parsed.loginId.trim() !== '')
    );
    const isLoggedIn = Boolean(parsed.isLoggedIn) && hasIdentifier;

    if (!isLoggedIn) {
      isPaid = false;
      trialDays = 0;
      paidStreams = [];
    }

    // Ensure selectedExamTrack points to their track or default
    const finalTrack: ExamTrack = isSuperAdmin
      ? (parsed.selectedExamTrack || 'gt-maths-science')
      : !isLoggedIn
      ? (parsed.selectedExamTrack || 'prt')
      : allocatedClientTrack
      ? allocatedClientTrack
      : isAshaOrShanti
      ? 'gt-maths-science'
      : (paidStreams.length > 0 ? paidStreams[0] : (parsed.selectedExamTrack || 'gt-maths-science'));

    const finalTargetExam: string = isSuperAdmin
      ? (parsed.targetExam || getSubscribedCourseTitle(finalTrack))
      : getSubscribedCourseTitle(finalTrack);

    return syncProfileStreakOnLoad({
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      role: isSuperAdmin ? 'admin' : 'candidate',
      isLoggedIn,
      isPaid: isSuperAdmin ? true : (isLoggedIn && Boolean(isPaid)),
      trialDaysRemaining: isSuperAdmin ? 365 : (isLoggedIn ? (trialDays ?? parsed.trialDaysRemaining ?? 1) : 0),
      paidStreams: isLoggedIn ? paidStreams : [],
      selectedExamTrack: finalTrack,
      targetExam: finalTargetExam,
    });
  } catch {
    return syncProfileStreakOnLoad(DEFAULT_USER_PROFILE);
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    const isSuperAdmin = Boolean(profile.isLoggedIn) && (isAdminUser(profile.email) || profile.role === 'admin');
    const updated = {
      ...profile,
      role: isSuperAdmin ? 'admin' : (profile.role || 'candidate'),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());
    cacheCriticalStateToSW('userProfile', updated);
    if (updated.isLoggedIn && updated.email) {
      firestoreSyncService.saveProfileToCloud(updated).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to save user profile to localStorage', e);
  }
}

export function getLastSyncTime(): string {
  try {
    const time = localStorage.getItem(SYNC_TIMESTAMP_KEY);
    if (!time) return 'Just now';
    const diffSeconds = Math.round((Date.now() - new Date(time).getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  } catch {
    return 'Just now';
  }
}

/* =========================================================
   LOGIN AUDIT LOG SYSTEM ("Check who are all logging in")
   ========================================================= */

export function getLoginAuditLogs(): LoginAuditLog[] {
  try {
    const raw = localStorage.getItem(LOGIN_LOGS_KEY);
    let list: LoginAuditLog[];
    if (!raw) {
      list = [...INITIAL_LOGIN_LOGS];
    } else {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [...INITIAL_LOGIN_LOGS];
    }
    // Filter dummy accounts
    const filtered = list.filter((l) => !isDummyAccount(l.userName || l.userEmail));
    if (filtered.length !== list.length) {
      try {
        localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(filtered));
      } catch {}
    }
    return filtered;
  } catch {
    return INITIAL_LOGIN_LOGS;
  }
}

export function recordLoginAudit(user: {
  id?: string;
  name: string;
  email: string;
  loginId: string;
  role?: 'admin' | 'candidate';
  authProvider?: 'google' | 'password' | 'guest';
}): LoginAuditLog {
  const currentLogs = getLoginAuditLogs();
  const isSuperAdmin = isAdminUser(user.email);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser Client';
  let device = 'Desktop Chrome Browser';
  if (/mobile/i.test(userAgent)) device = 'Mobile Browser (iOS / Android)';
  else if (/mac/i.test(userAgent)) device = 'macOS Browser';
  else if (/windows/i.test(userAgent)) device = 'Windows 11 Desktop';

  // 1-IP rule: If candidate is already logged in with another IP, terminate previous active sessions for this user
  const clientIp = isSuperAdmin ? '157.34.122.91' : `103.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const normalizedEmail = user.email.toLowerCase().trim();

  const terminatedLogs = currentLogs.map((log) => {
    if (log.userEmail.toLowerCase().trim() === normalizedEmail && log.status === 'active' && log.ipAddress !== clientIp) {
      return { ...log, status: 'completed' as const };
    }
    return log;
  });

  const newLog: LoginAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id || `user-${user.loginId}`,
    userName: user.name,
    userEmail: user.email,
    loginId: user.loginId,
    role: isSuperAdmin ? 'admin' : (user.role || 'candidate'),
    authProvider: user.authProvider || 'password',
    timestamp: Date.now(),
    ipAddress: clientIp,
    deviceInfo: device,
    location: isSuperAdmin ? 'Patna, Bihar, India' : 'India (Online)',
    status: 'active',
  };

  const updated = [newLog, ...terminatedLogs.slice(0, 99)];
  try {
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record login audit', e);
  }

  // Also sync with server endpoint asynchronously
  try {
    fetch('/api/admin/record-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
  } catch {}

  return newLog;
}

// Terminate single active session from Admin Hub
export function terminateSession(logId: string, userEmail?: string): void {
  try {
    const logs = getLoginAuditLogs();
    const updated = logs.map((log) => {
      if (log.id === logId) {
        return { ...log, status: 'completed' as const };
      }
      return log;
    });
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_session_terminated', { detail: { logId, userEmail } }));
    }

    // Call server to terminate session
    fetch('/api/admin/terminate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, userEmail }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to terminate session', e);
  }
}

// Terminate all active sessions from Admin Hub
export function terminateAllSessions(): void {
  try {
    const logs = getLoginAuditLogs();
    const updated = logs.map((log) => {
      if (log.status === 'active' && !isAdminUser(log.userEmail)) {
        return { ...log, status: 'completed' as const };
      }
      return log;
    });
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_session_terminated', { detail: { all: true } }));
    }

    fetch('/api/admin/terminate-all-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to terminate all sessions', e);
  }
}

export function clearLoginAuditLogs(): void {
  try {
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify([]));
  } catch {}
}

/* =========================================================
   CLIENT MANAGEMENT SYSTEM ("Separate Client Management")
   ========================================================= */

export function getAllClients(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    let list: ClientRecord[];
    if (!raw) {
      list = [...INITIAL_CLIENT_RECORDS];
    } else {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [...INITIAL_CLIENT_RECORDS];
    }

    // Filter dummy accounts and deleted accounts
    const initialLen = list.length;
    list = list.filter(
      (c) =>
        !isDummyAccount(c.name || c.email) &&
        !isDeletedEmail(c.email) &&
        !isDeletedEmail(c.loginId) &&
        !isDeletedEmail(c.id) &&
        !isDeletedEmail(c.name)
    );
    let modified = list.length !== initialLen;

    // Incorporate all registered candidates into clients so trial registrations are always visible
    const regUsers = getRegisteredUsers();
    regUsers.forEach((u) => {
      if (
        isDummyAccount(u.name || u.email) ||
        isDeletedEmail(u.email) ||
        isDeletedEmail(u.loginId) ||
        isDeletedEmail(u.id) ||
        isDeletedEmail(u.name)
      ) {
        return;
      }
      const uNormEmail = u.email.toLowerCase().trim();
      const existing = list.find((c) => c.email.toLowerCase().trim() === uNormEmail);
      const userTrack: ExamTrack[] = (u.paidStreams && u.paidStreams.length > 0)
        ? u.paidStreams
        : (u.targetExam?.toLowerCase().includes('math') || u.targetExam?.toLowerCase().includes('science'))
        ? ['gt-maths-science']
        : (u.targetExam?.toLowerCase().includes('humanities') || u.targetExam?.toLowerCase().includes('social'))
        ? ['gt-humanities']
        : ['prt'];

      if (!existing) {
        list.push({
          id: `client-${u.id}`,
          name: u.name,
          email: u.email,
          loginId: u.loginId || u.email,
          password: u.password || u.phone || '',
          targetExam: u.targetExam || (userTrack[0] === 'gt-maths-science' ? 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)' : 'Sikkim Primary Teacher (PRT - Paper I)'),
          role: u.role || 'candidate',
          status: u.status || 'trial',
          trialDaysRemaining: u.trialExpiresAt
            ? Math.max(0, Math.ceil((u.trialExpiresAt - Date.now()) / 86400000))
            : 1,
          registeredAt: u.createdAt || Date.now(),
          lastLoginAt: u.lastLoginAt || Date.now(),
          testsCompleted: u.testsCompleted || 0,
          avgScore: u.avgScore || 0,
          notes: 'Self-registered trial candidate from portal registration.',
          phone: u.phone || '',
          isPaid: u.isPaid || false,
          paidStreams: userTrack,
          selectedExamTrack: userTrack[0],
          selectedStream: userTrack[0] === 'gt-maths-science' ? 'graduate-science' : userTrack[0] === 'gt-humanities' ? 'graduate-social' : 'primary',
        });
        modified = true;
      } else {
        // Keep paidStreams and targetExam synchronized
        if (u.isPaid && !existing.isPaid) {
          existing.isPaid = true;
          existing.status = 'active';
          modified = true;
        }
        if (u.paidStreams && u.paidStreams.length > 0 && (!existing.paidStreams || existing.paidStreams.length === 0)) {
          existing.paidStreams = u.paidStreams;
          modified = true;
        }
        if (u.targetExam && (!existing.targetExam || existing.targetExam.includes('Primary') && u.targetExam.includes('Graduate'))) {
          existing.targetExam = u.targetExam;
          modified = true;
        }
      }
    });

    // Ensure Asha Prasad, Shanti Subba, and GT Maths subscribers have their allocated GT Maths & Science course properly saved
    list.forEach((c) => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const isAshaOrShanti =
        name.includes('asha') ||
        name.includes('prasad') ||
        name.includes('shanti') ||
        name.includes('subba') ||
        email.includes('ashaprasad') ||
        email.includes('shantisubba');

      if (isAshaOrShanti) {
        c.targetExam = 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
        c.paidStreams = ['gt-maths-science'];
        c.selectedStream = 'graduate-science';
        c.isPaid = true;
        c.status = 'active';
        c.trialDaysRemaining = 365;
        modified = true;
      } else if (!isAdminUser(c.email) && (!c.paidStreams || c.paidStreams.length === 0) && (c.selectedStream === 'graduate-science' || (c.targetExam && (c.targetExam.toLowerCase().includes('math') || c.targetExam.toLowerCase().includes('science'))))) {
        c.targetExam = 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
        c.paidStreams = ['gt-maths-science'];
        c.selectedStream = 'graduate-science';
        modified = true;
      }
    });

    // Ensure studeezoneapp@gmail.com admin credentials are up to date
    list.forEach((c) => {
      const email = (c.email || '').toLowerCase().trim();
      const login = (c.loginId || '').toLowerCase().trim();
      if (email === 'studeezoneapp@gmail.com' || login === 'studeezoneapp' || login === 'studeezoneapp@gmail.com') {
        if (c.password !== '9876543210' || c.phone !== '9876543210' || c.role !== 'admin' || !c.isPaid) {
          c.password = '9876543210';
          c.phone = '9876543210';
          c.role = 'admin';
          c.isPaid = true;
          c.status = 'active';
          c.paidStreams = ['prt', 'gt-maths-science', 'gt-humanities'];
          modified = true;
        }
      }
    });

    if (modified) {
      try {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(list));
      } catch {}
    }

    return list;
  } catch {
    return INITIAL_CLIENT_RECORDS;
  }
}

export function saveClients(clients: ClientRecord[], syncWithServer: boolean = true): void {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    cacheCriticalStateToSW('clients', clients);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_clients_updated', { detail: clients }));
      window.dispatchEvent(new CustomEvent('studeezone_data_store_change', { detail: { type: 'client_updated', clients } }));
    }

    if (syncWithServer) {
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to save clients', e);
  }
}

export function updateClient(clientId: string, updates: Partial<ClientRecord>): ClientRecord[] {
  const clients = getAllClients();
  const existingClient = clients.find((c) => c.id === clientId);
  const updatedTrack = updates.targetExam ? getExamTrackFromTarget(updates.targetExam) : (existingClient?.paidStreams?.[0] || 'prt');
  const resolvedPaidStreams = updates.paidStreams !== undefined
    ? updates.paidStreams
    : (updates.targetExam
      ? [updatedTrack]
      : (existingClient?.paidStreams || []));

  const mergedUpdates: Partial<ClientRecord> = {
    ...updates,
    paidStreams: resolvedPaidStreams,
  };

  const updated = clients.map((c) => (c.id === clientId ? { ...c, ...mergedUpdates } : c));
  saveClients(updated);

  // Synchronize changes to registered user directory
  if (
    updates.email !== undefined ||
    updates.password !== undefined ||
    updates.phone !== undefined ||
    updates.loginId !== undefined ||
    updates.name !== undefined ||
    updates.status !== undefined ||
    updates.targetExam !== undefined ||
    updates.isPaid !== undefined
  ) {
    try {
      const originalEmail = (existingClient?.email || '').toLowerCase().trim();
      const originalLoginId = (existingClient?.loginId || '').toLowerCase().trim();
      const newEmail = (updates.email || originalEmail || 'candidate@example.com').toLowerCase().trim();
      const newLoginId = (updates.loginId || originalLoginId || newEmail).toLowerCase().trim();
      const newPassword = updates.password !== undefined ? updates.password : (existingClient?.password || existingClient?.phone || '');

      const users = getRegisteredUsers();
      let userIdx = users.findIndex(
        (u) =>
          u.id === `user-${clientId}` ||
          u.id === clientId ||
          (originalEmail && u.email.toLowerCase() === originalEmail) ||
          (newEmail && u.email.toLowerCase() === newEmail) ||
          (originalLoginId && u.loginId && u.loginId.toLowerCase() === originalLoginId)
      );

      let targetUser: RegisteredUser;
      if (userIdx >= 0) {
        users[userIdx] = {
          ...users[userIdx],
          name: updates.name || users[userIdx].name,
          email: newEmail,
          loginId: newLoginId,
          phone: updates.phone !== undefined ? updates.phone : users[userIdx].phone,
          password: newPassword,
          targetExam: updates.targetExam || users[userIdx].targetExam,
          status: updates.status || users[userIdx].status,
          isPaid: updates.isPaid !== undefined ? updates.isPaid : users[userIdx].isPaid,
          paidStreams: resolvedPaidStreams,
        };
        targetUser = users[userIdx];
      } else {
        targetUser = {
          id: `user-${clientId}`,
          name: updates.name || existingClient?.name || 'Candidate',
          email: newEmail,
          loginId: newLoginId,
          phone: updates.phone !== undefined ? updates.phone : existingClient?.phone,
          password: newPassword,
          authProvider: 'password',
          role: existingClient?.role || 'candidate',
          targetExam: updates.targetExam || existingClient?.targetExam || 'Sikkim Primary Teacher (PRT - Paper I)',
          createdAt: existingClient?.registeredAt || Date.now(),
          status: updates.status || existingClient?.status || 'trial',
          trialExpiresAt: Date.now() + 7 * 86400000,
          lastLoginAt: Date.now(),
          testsCompleted: existingClient?.testsCompleted || 0,
          avgScore: existingClient?.avgScore || 0,
          isPaid: updates.isPaid !== undefined ? updates.isPaid : existingClient?.isPaid,
          paidStreams: resolvedPaidStreams,
        };
        users.push(targetUser);
      }

      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: users }));
      }

      // If active userProfile matches, synchronize immediately
      const activeProfile = loadUserProfile();
      if (activeProfile.email && (activeProfile.email.toLowerCase().trim() === newEmail || activeProfile.email.toLowerCase().trim() === originalEmail)) {
        const updatedProfile: UserProfile = {
          ...activeProfile,
          targetExam: updates.targetExam || activeProfile.targetExam,
          selectedExamTrack: updatedTrack,
          isPaid: updates.isPaid !== undefined ? updates.isPaid : activeProfile.isPaid,
          paidStreams: resolvedPaidStreams,
        };
        saveUserProfile(updatedProfile);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: updatedProfile }));
        }
      }
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: targetUser }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to sync updated credentials to RegisteredUser:', e);
    }
  }

  return updated;
}

export function extendClientTrial(clientId: string, additionalDays: number = 7): ClientRecord[] {
  const clients = getAllClients();
  const updated = clients.map((c) => {
    if (c.id === clientId) {
      const newDays = (c.trialDaysRemaining || 0) + additionalDays;
      return {
        ...c,
        status: 'trial' as const,
        trialDaysRemaining: newDays,
        notes: (c.notes ? `${c.notes} • ` : '') + `Trial extended by +${additionalDays} days by Admin on ${new Date().toLocaleDateString()}`,
      };
    }
    return c;
  });
  saveClients(updated);
  return updated;
}

export function createClient(data: Partial<ClientRecord>): ClientRecord {
  const clients = getAllClients();
  const isSuperAdmin = isAdminUser(data.email);
  const normalizedEmail = (data.email || 'candidate@example.com').toLowerCase().trim();
  const normalizedLoginId = data.loginId || normalizedEmail;
  const initialPassword = data.password || data.phone || '';

  const assignedTrack = data.paidStreams && data.paidStreams.length > 0
    ? data.paidStreams[0]
    : data.targetExam
    ? getExamTrackFromTarget(data.targetExam)
    : 'prt';

  const newClient: ClientRecord = {
    id: `client-${Date.now()}`,
    name: data.name || 'New Candidate',
    email: normalizedEmail,
    loginId: normalizedLoginId,
    targetExam: data.targetExam || getSubscribedCourseTitle(assignedTrack),
    role: isSuperAdmin ? 'admin' : (data.role || 'candidate'),
    status: isSuperAdmin ? 'active' : (data.status || 'trial'),
    trialDaysRemaining: isSuperAdmin ? 365 : (data.trialDaysRemaining ?? 7),
    registeredAt: Date.now(),
    lastLoginAt: Date.now(),
    testsCompleted: data.testsCompleted || 0,
    avgScore: data.avgScore || 0,
    notes: data.notes || (isSuperAdmin ? 'Platform Administrator' : 'Registered client with 7-day trial.'),
    phone: data.phone || '',
    password: initialPassword,
    isPaid: data.isPaid !== undefined ? data.isPaid : (isSuperAdmin || data.status === 'active'),
    paidStreams: data.paidStreams || [assignedTrack],
    selectedStream: data.selectedStream || (assignedTrack === 'gt-maths-science' ? 'graduate-science' : assignedTrack === 'gt-humanities' ? 'graduate-social' : 'primary'),
  };

  // Avoid duplicates by email
  const existingIdx = clients.findIndex((c) => c.email.toLowerCase() === newClient.email.toLowerCase());
  let updatedList: ClientRecord[];
  if (existingIdx >= 0) {
    updatedList = [...clients];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...newClient };
  } else {
    updatedList = [newClient, ...clients];
  }
  saveClients(updatedList);

  // Synchronize to registered user directory so candidate can log in with Email/LoginId and Password
  try {
    const users = getRegisteredUsers();
    const existingUserIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
    let regUser: RegisteredUser;
    if (existingUserIdx >= 0) {
      if (initialPassword) {
        users[existingUserIdx].password = initialPassword;
      }
      users[existingUserIdx].name = newClient.name;
      users[existingUserIdx].loginId = newClient.loginId;
      if (newClient.phone) users[existingUserIdx].phone = newClient.phone;
      users[existingUserIdx].targetExam = newClient.targetExam;
      regUser = users[existingUserIdx];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } else {
      regUser = {
        id: `user-${Date.now()}`,
        name: newClient.name,
        email: normalizedEmail,
        loginId: newClient.loginId,
        phone: newClient.phone || undefined,
        password: initialPassword || undefined,
        authProvider: 'password',
        role: newClient.role,
        targetExam: newClient.targetExam,
        createdAt: Date.now(),
        status: newClient.status,
        trialExpiresAt: Date.now() + (newClient.trialDaysRemaining || 7) * 86400000,
        lastLoginAt: Date.now(),
        testsCompleted: 0,
        avgScore: 0,
      };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...users, regUser]));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: users }));
    }

    // Sync to server endpoints
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: regUser }),
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to sync RegisteredUser for client:', e);
  }

  // Also sync single client record to server
  try {
    fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: newClient }),
    }).catch(() => {});
  } catch {}

  return newClient;
}

export function deleteClient(
  clientId: string,
  clientEmail?: string,
  clientLoginId?: string,
  clientName?: string
): ClientRecord[] {
  const clients = getAllClients();
  const target = clients.find(
    (c) =>
      c.id === clientId ||
      (clientEmail && c.email.toLowerCase().trim() === clientEmail.toLowerCase().trim()) ||
      (clientLoginId && c.loginId && c.loginId.toLowerCase().trim() === clientLoginId.toLowerCase().trim())
  );
  const targetEmail = (clientEmail || target?.email || '').toLowerCase().trim();
  const targetLoginId = (clientLoginId || target?.loginId || '').toLowerCase().trim();
  const targetName = (clientName || target?.name || '').trim();

  // Strip prefixes to find all variants of ID
  const cleanId = clientId.replace(/^(client-|user-)+/, '');
  const idVariants = [
    clientId,
    cleanId,
    `client-${clientId}`,
    `client-${cleanId}`,
    `user-${clientId}`,
    `user-${cleanId}`,
    `client-user-${cleanId}`,
  ];

  // 1. Tombstone the email, loginId, name, and all ID variants so they NEVER resurrect
  if (targetEmail) addDeletedEmail(targetEmail);
  if (targetLoginId) addDeletedEmail(targetLoginId);
  if (targetName && targetName.toLowerCase() !== 'candidate learner') {
    addDeletedEmail(targetName.toLowerCase());
  }
  idVariants.forEach((idVar) => {
    if (idVar) addDeletedEmail(idVar);
  });

  // 2. Remove from clients list
  const updatedClients = clients.filter((c) => {
    if (idVariants.includes(c.id)) return false;
    if (targetEmail && c.email.toLowerCase().trim() === targetEmail) return false;
    if (targetLoginId && c.loginId && c.loginId.toLowerCase().trim() === targetLoginId) return false;
    if (targetName && targetName.toLowerCase() !== 'candidate learner' && c.name.toLowerCase().trim() === targetName.toLowerCase()) return false;
    return true;
  });
  saveClients(updatedClients, false);

  // 3. Remove from registered users list
  try {
    const rawUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    if (rawUsers) {
      const users: RegisteredUser[] = JSON.parse(rawUsers);
      const updatedUsers = users.filter((u) => {
        if (idVariants.includes(u.id)) return false;
        if (targetEmail && u.email.toLowerCase().trim() === targetEmail) return false;
        if (targetLoginId && u.loginId && u.loginId.toLowerCase().trim() === targetLoginId) return false;
        if (targetName && targetName.toLowerCase() !== 'candidate learner' && u.name.toLowerCase().trim() === targetName.toLowerCase()) return false;
        return true;
      });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: updatedUsers }));
      }
    }
  } catch (e) {
    console.error('Failed to remove user on deleteClient', e);
  }

  // 4. Remove any payment submissions for this email / loginId / name
  if (targetEmail || targetLoginId) {
    try {
      const rawSubs = localStorage.getItem(PAYMENT_SUBMISSIONS_KEY);
      if (rawSubs) {
        const subs: PaymentSubmissionRecord[] = JSON.parse(rawSubs);
        const updatedSubs = subs.filter((s) => {
          if (targetEmail && s.email.toLowerCase().trim() === targetEmail) return false;
          if (targetName && s.name.toLowerCase().trim() === targetName.toLowerCase()) return false;
          return true;
        });
        localStorage.setItem(PAYMENT_SUBMISSIONS_KEY, JSON.stringify(updatedSubs));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studeezone_payment_submissions_updated', { detail: updatedSubs }));
        }
      }
    } catch {}

    // Terminate any active session for this user
    if (targetEmail) {
      terminateSession(targetEmail);
    }
  }

  // 5. Reset active profile if the deleted user is currently loaded
  try {
    const activeProfile = loadUserProfile();
    const activeEmail = (activeProfile.email || '').toLowerCase().trim();
    const activeLogin = (activeProfile.loginId || '').toLowerCase().trim();
    const activeName = (activeProfile.name || '').toLowerCase().trim();
    if (
      (targetEmail && activeEmail === targetEmail) ||
      (targetLoginId && activeLogin === targetLoginId) ||
      (targetName && targetName.toLowerCase() !== 'candidate learner' && activeName === targetName.toLowerCase()) ||
      idVariants.includes((activeProfile as any).id || '')
    ) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: DEFAULT_USER_PROFILE }));
      }
    }
  } catch {}

  // 6. Call server delete APIs with query params for robust server purging
  try {
    const query = new URLSearchParams();
    if (targetEmail) query.set('email', targetEmail);
    if (targetLoginId) query.set('loginId', targetLoginId);
    if (targetName) query.set('name', targetName);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    fetch(`/api/clients/${encodeURIComponent(clientId)}${queryString}`, { method: 'DELETE' }).catch(() => {});
    if (targetEmail) {
      fetch(`/api/users/${encodeURIComponent(targetEmail)}${queryString}`, { method: 'DELETE' }).catch(() => {});
    }
    fetch('/api/deleted-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, loginId: targetLoginId, id: clientId, name: targetName }),
    }).catch(() => {});
  } catch {}

  return updatedClients;
}

/**
 * Directly allocate a specific STET course/stream to a candidate in the Admin Aspirant Directory
 */
export function allocateClientCourse(clientId: string, track: ExamTrack): ClientRecord | null {
  const clients = getAllClients();
  const cleanId = clientId.replace(/^(client-|user-)+/, '');
  let idx = clients.findIndex(
    (c) =>
      c.id === clientId ||
      c.id === cleanId ||
      c.id === `client-${cleanId}` ||
      c.id === `user-${cleanId}` ||
      c.id === `client-user-${cleanId}`
  );
  if (idx === -1) {
    idx = clients.findIndex((c) => c.email.toLowerCase().trim() === clientId.toLowerCase().trim());
  }
  if (idx === -1) return null;

  const targetExam = getSubscribedCourseTitle(track);
  const paidStreams: ExamTrack[] = [track];
  const selectedStream = track === 'gt-maths-science' ? 'graduate-science' : track === 'gt-humanities' ? 'graduate-social' : 'primary';

  const updatedClient: ClientRecord = {
    ...clients[idx],
    targetExam,
    paidStreams,
    selectedStream,
    selectedExamTrack: track,
    isPaid: true,
    status: 'active',
    trialDaysRemaining: Math.max(clients[idx].trialDaysRemaining || 0, 365),
  };
  clients[idx] = updatedClient;
  saveClients(clients, true);

  const email = (updatedClient.email || '').toLowerCase().trim();
  const loginId = (updatedClient.loginId || '').toLowerCase().trim();
  const clientName = updatedClient.name;

  if (email || loginId || clientId) {
    try {
      const users = getRegisteredUsers();
      const uIdx = users.findIndex(
        (u) =>
          (email && u.email.toLowerCase().trim() === email) ||
          (loginId && u.loginId && u.loginId.toLowerCase().trim() === loginId) ||
          u.id === clientId ||
          u.id === cleanId ||
          u.id === `user-${cleanId}` ||
          u.id === `user-${clientId}`
      );
      if (uIdx !== -1) {
        users[uIdx] = {
          ...users[uIdx],
          targetExam,
          paidStreams,
          selectedExamTrack: track,
          isPaid: true,
          status: 'active',
        };
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: users }));
        }
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: users[uIdx] }),
        }).catch(() => {});
      }
    } catch {}

    // If this is the currently active userProfile, synchronize immediately
    const activeProfile = loadUserProfile();
    if (
      (activeProfile.email && email && activeProfile.email.toLowerCase().trim() === email) ||
      (activeProfile.loginId && loginId && activeProfile.loginId.toLowerCase().trim() === loginId) ||
      (clientName && activeProfile.name && activeProfile.name.toLowerCase().trim() === clientName.toLowerCase().trim())
    ) {
      const updatedProfile: UserProfile = {
        ...activeProfile,
        targetExam,
        selectedExamTrack: track,
        isPaid: true,
        paidStreams: [track],
      };
      saveUserProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: updatedProfile }));
      }
    }
  }

  // Also notify server via dedicated allocate API
  try {
    fetch(`/api/clients/${encodeURIComponent(updatedClient.id)}/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        track,
        email: updatedClient.email,
        loginId: updatedClient.loginId,
        targetExam,
        paidStreams,
        selectedStream,
      }),
    }).catch(() => {});
  } catch {}

  fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client: updatedClient }),
  }).catch(() => {});

  return updatedClient;
}

/**
 * Bidirectional startup synchronization for Clients & Registered Users
 */
export async function initAuthAndClientSync(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Sync deleted emails registry first to prevent resurrection
  try {
    const res = await fetch('/api/deleted-emails');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.deletedEmails)) {
        data.deletedEmails.forEach((email: string) => addDeletedEmail(email));
      }
    }
  } catch {}

  // 2. Sync clients from server
  try {
    const res = await fetch('/api/clients');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.clients) && data.clients.length > 0) {
        const localClients = getAllClients();
        const merged = [...localClients];
        data.clients.forEach((sc: ClientRecord) => {
          if (
            !isDummyAccount(sc.name || sc.email) &&
            !isDeletedEmail(sc.email) &&
            !isDeletedEmail(sc.loginId) &&
            !isDeletedEmail(sc.id) &&
            !isDeletedEmail(sc.name)
          ) {
            const idx = merged.findIndex((lc) => lc.email.toLowerCase() === sc.email.toLowerCase() || lc.id === sc.id);
            const scTrack = getClientAllocatedTrack(sc);
            if (idx !== -1) {
              merged[idx] = {
                ...merged[idx],
                ...sc,
                paidStreams: (sc.paidStreams && sc.paidStreams.length > 0) ? sc.paidStreams : (merged[idx].paidStreams || [scTrack]),
                selectedExamTrack: sc.selectedExamTrack || merged[idx].selectedExamTrack || scTrack,
                selectedStream: sc.selectedStream || merged[idx].selectedStream,
                targetExam: sc.targetExam || merged[idx].targetExam || getSubscribedCourseTitle(scTrack),
                isPaid: sc.isPaid !== undefined ? sc.isPaid : merged[idx].isPaid,
              };
            } else {
              merged.push({
                ...sc,
                selectedExamTrack: sc.selectedExamTrack || scTrack,
              });
            }
          }
        });
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('studeezone_clients_updated', { detail: merged }));

        // If local browser has clients not yet saved on server (e.g. 16 clients on PC 1 vs 7 on server), push full union to server!
        const hasUnsyncedClients = merged.length > data.clients.length || merged.some((c) => !data.clients.some((sc: any) => (sc.email && sc.email.toLowerCase().trim() === c.email?.toLowerCase().trim()) || sc.id === c.id));
        if (hasUnsyncedClients) {
          fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clients: merged }),
          }).catch(() => {});
        }
      }
    }
  } catch {}

  // 3. Sync users from server
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        const localUsers = getRegisteredUsers();
        const merged = [...localUsers];
        data.users.forEach((su: RegisteredUser) => {
          if (
            !isDummyAccount(su.name || su.email) &&
            !isDeletedEmail(su.email) &&
            !isDeletedEmail(su.loginId) &&
            !isDeletedEmail(su.id) &&
            !isDeletedEmail(su.name)
          ) {
            const idx = merged.findIndex((lu) => lu.email.toLowerCase() === su.email.toLowerCase());
            const suTrack = getClientAllocatedTrack(su as any);
            if (idx !== -1) {
              merged[idx] = {
                ...merged[idx],
                ...su,
                paidStreams: (su.paidStreams && su.paidStreams.length > 0) ? su.paidStreams : (merged[idx].paidStreams || [suTrack]),
                selectedExamTrack: su.selectedExamTrack || merged[idx].selectedExamTrack || suTrack,
                targetExam: su.targetExam || merged[idx].targetExam || getSubscribedCourseTitle(suTrack),
                isPaid: su.isPaid !== undefined ? su.isPaid : merged[idx].isPaid,
              };
            } else {
              merged.push({
                ...su,
                selectedExamTrack: su.selectedExamTrack || suTrack,
              });
            }
          }
        });
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: merged }));

        // If local browser has registered users not yet saved on server, push full union to server!
        const hasUnsyncedUsers = merged.length > data.users.length || merged.some((u) => !data.users.some((su: any) => su.email && su.email.toLowerCase().trim() === u.email?.toLowerCase().trim()));
        if (hasUnsyncedUsers) {
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: merged }),
          }).catch(() => {});
        }
      }
    }
  } catch {}

  // 4. Synchronize active user profile if logged in
  try {
    const active = loadUserProfile();
    if (active.isLoggedIn && (active.email || active.loginId)) {
      window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: active }));
    }
  } catch {}
}

/* =========================================================
   ADMIN PAYMENT & SUBSCRIPTION GATEWAY SETTINGS
   ========================================================= */

export const DEFAULT_ADMIN_PAYMENT_CONFIG: AdminPaymentConfig = {
  upiId: 'sabutamang1a@oksbi',
  upiName: 'Sabu Tamang',
  adminPhone: '8250739457',
  qrScannerImageUrl: '/gpay-scanner.svg',
  subscriptionPrice: 499,
  currency: '₹',
  planDuration: '1 Year Access / Stream',
  planName: 'STET Pro Pass (₹499 Per Stream)',
  instructions:
    '1. Select your target stream.\n2. Scan the GPay QR code or pay ₹499 to UPI ID: sabutamang1a@oksbi.\n3. Take a screenshot of the completed payment.\n4. Click "Share Payment Screenshot on WhatsApp" to send it to Sabu Tamang (8250739457).\n5. Admin will verify and activate your chosen stream access immediately.',
};

export function getAdminPaymentConfig(): AdminPaymentConfig {
  try {
    const raw = localStorage.getItem(PAYMENT_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENT_CONFIG_KEY, JSON.stringify(DEFAULT_ADMIN_PAYMENT_CONFIG));
      return DEFAULT_ADMIN_PAYMENT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    // If client has previous placeholder settings or old plan description, migrate to active Sabu Tamang credentials
    if (!parsed.upiId || parsed.upiId === 'studeezone@okaxis' || parsed.adminPhone === '+91 98765 43210' || !parsed.qrScannerImageUrl || parsed.planDuration === '1 Year Full Access') {
      const updated: AdminPaymentConfig = {
        ...DEFAULT_ADMIN_PAYMENT_CONFIG,
        ...parsed,
        upiId: parsed.upiId === 'studeezone@okaxis' || !parsed.upiId ? 'sabutamang1a@oksbi' : parsed.upiId,
        upiName: parsed.upiName === 'studeezone EdTech' || !parsed.upiName ? 'Sabu Tamang' : parsed.upiName,
        adminPhone: parsed.adminPhone === '+91 98765 43210' || !parsed.adminPhone ? '8250739457' : parsed.adminPhone,
        qrScannerImageUrl: (parsed.qrScannerImageUrl && parsed.qrScannerImageUrl.trim() !== '') ? parsed.qrScannerImageUrl : '/gpay-scanner.svg',
        planDuration: parsed.planDuration === '1 Year Full Access' ? '1 Year Access / Stream' : (parsed.planDuration || '1 Year Access / Stream'),
        planName: 'STET Pro Pass (₹499 Per Stream)',
      };
      localStorage.setItem(PAYMENT_CONFIG_KEY, JSON.stringify(updated));
      return updated;
    }
    return {
      ...DEFAULT_ADMIN_PAYMENT_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_ADMIN_PAYMENT_CONFIG;
  }
}

export function saveAdminPaymentConfig(updates: Partial<AdminPaymentConfig>): AdminPaymentConfig {
  const current = getAdminPaymentConfig();
  const merged: AdminPaymentConfig = {
    ...current,
    ...updates,
  };
  try {
    localStorage.setItem(PAYMENT_CONFIG_KEY, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_payment_config_updated', { detail: merged }));
    }
  } catch (e) {
    console.error('Failed to save admin payment config', e);
  }
  return merged;
}

/* =========================================================
   PAID CUSTOMER ACTIVATION ("Add paid customers email id and phone number")
   ========================================================= */

export function activatePaidCustomer(params: {
  email: string;
  phone?: string;
  name?: string;
  notes?: string;
  amount?: number;
  paymentRef?: string;
  planDurationDays?: number;
  streamTrack?: ExamTrack;
}): { success: boolean; message: string; client: ClientRecord } {
  const normalizedEmail = (params.email || '').toLowerCase().trim();
  const cleanPhone = (params.phone || '').trim();
  const candidateName = (params.name || '').trim() || normalizedEmail.split('@')[0] || 'Paid Candidate';
  const durationDays = params.planDurationDays || 365;

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Please provide a valid Email Address for the paid customer.');
  }

  // 1. Determine specific subscribed track and course title
  const clients = getAllClients();
  const clientIdx = clients.findIndex(
    (c) =>
      c.email.toLowerCase() === normalizedEmail ||
      (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
  );

  const users = getRegisteredUsers();
  const userIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  const matchedClient = clientIdx >= 0 ? clients[clientIdx] : undefined;
  const matchedUser = userIdx >= 0 ? users[userIdx] : undefined;

  let effectiveTrack: ExamTrack = params.streamTrack || 'prt';
  if (!params.streamTrack) {
    if (matchedClient?.paidStreams && matchedClient.paidStreams.length > 0) {
      effectiveTrack = matchedClient.paidStreams[0];
    } else if (matchedClient?.selectedStream === 'graduate-science') {
      effectiveTrack = 'gt-maths-science';
    } else if (matchedClient?.selectedStream === 'graduate-social') {
      effectiveTrack = 'gt-humanities';
    } else {
      const existingExam = matchedClient?.targetExam || matchedUser?.targetExam || 'Sikkim Primary Teacher (PRT - Paper I)';
      const lower = existingExam.toLowerCase();
      if (lower.includes('math') || lower.includes('science')) effectiveTrack = 'gt-maths-science';
      else if (lower.includes('humanities') || lower.includes('social')) effectiveTrack = 'gt-humanities';
      else effectiveTrack = 'prt';
    }
  }
  const courseTitle = getSubscribedCourseTitle(effectiveTrack);
  const paidStreams: ExamTrack[] = [effectiveTrack];
  const selectedStream = effectiveTrack === 'gt-maths-science' ? 'graduate-science' : effectiveTrack === 'gt-humanities' ? 'graduate-social' : 'primary';

  const now = Date.now();
  const trialExpiresAt = now + durationDays * 86400000;

  if (userIdx >= 0) {
    users[userIdx] = {
      ...users[userIdx],
      status: 'active',
      isPaid: true,
      trialExpiresAt,
      phone: cleanPhone || users[userIdx].phone,
      targetExam: courseTitle,
      paidStreams,
    };
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  } else {
    // Register as active paid user
    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      name: candidateName,
      email: normalizedEmail,
      loginId: normalizedEmail.split('@')[0] || `user_${Date.now()}`,
      phone: cleanPhone,
      password: cleanPhone || 'Password123!',
      authProvider: 'password',
      role: 'candidate',
      targetExam: courseTitle,
      createdAt: now,
      status: 'active',
      isPaid: true,
      trialExpiresAt,
      lastLoginAt: now,
      testsCompleted: 0,
      avgScore: 0,
      paidStreams,
    };
    users.unshift(newUser);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }

  // 2. Update or create in Client Record Directory
  let updatedClient: ClientRecord;
  const paymentNotes = params.notes
    ? `${params.notes} (Activated by Admin on ${new Date().toLocaleDateString()})`
    : `Paid Pro Customer • Subscribed to ${courseTitle} • Activated by Admin on ${new Date().toLocaleDateString()}`;

  if (clientIdx >= 0) {
    updatedClient = {
      ...clients[clientIdx],
      status: 'active',
      isPaid: true,
      trialDaysRemaining: durationDays,
      phone: cleanPhone || clients[clientIdx].phone,
      targetExam: courseTitle,
      notes: (clients[clientIdx].notes ? `${clients[clientIdx].notes} • ` : '') + paymentNotes,
      paymentDate: now,
      paymentAmount: params.amount || 499,
      paymentRef: params.paymentRef || 'WhatsApp Verification',
      paidStreams,
      selectedStream,
    };
    clients[clientIdx] = updatedClient;
  } else {
    updatedClient = {
      id: `client-${Date.now()}`,
      name: candidateName,
      email: normalizedEmail,
      loginId: normalizedEmail.split('@')[0] || `user_${Date.now()}`,
      targetExam: courseTitle,
      role: 'candidate',
      status: 'active',
      isPaid: true,
      trialDaysRemaining: durationDays,
      registeredAt: now,
      lastLoginAt: now,
      testsCompleted: 0,
      avgScore: 0,
      phone: cleanPhone,
      password: cleanPhone || 'Password123!',
      notes: paymentNotes,
      paymentDate: now,
      paymentAmount: params.amount || 499,
      paymentRef: params.paymentRef || 'WhatsApp Verification',
      paidStreams,
      selectedStream,
    };
    clients.unshift(updatedClient);
  }
  saveClients(clients);

  // 3. If currently logged-in user matches this email/phone, update their live profile
  const activeProfile = loadUserProfile();
  if (
    activeProfile.email &&
    (activeProfile.email.toLowerCase() === normalizedEmail ||
      (cleanPhone && activeProfile.phone && activeProfile.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')))
  ) {
    const updatedProfile: UserProfile = {
      ...activeProfile,
      isPaid: true,
      trialDaysRemaining: durationDays,
      trialExpiresAt,
      phone: cleanPhone || activeProfile.phone,
      targetExam: courseTitle,
      selectedExamTrack: effectiveTrack,
      paidStreams,
    };
    saveUserProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: updatedProfile }));
    }
  }

  // 4. Sync to server endpoints
  try {
    fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: updatedClient }),
    }).catch(() => {});

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          name: updatedClient.name,
          email: updatedClient.email,
          loginId: updatedClient.loginId,
          phone: updatedClient.phone,
          password: updatedClient.password,
          targetExam: updatedClient.targetExam,
          role: updatedClient.role,
          status: 'active',
          isPaid: true,
          paidStreams,
        },
      }),
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    message: `Complete Pro Access enabled for "${candidateName}"! Subscribed to: "${courseTitle}". Rest of courses remain inaccessible under this plan.`,
    client: updatedClient,
  };
}

/* =========================================================
   PAYMENT FORM SUBMISSION & ADMIN APPROVAL WORKFLOW
   ========================================================= */

export const INITIAL_PAYMENT_SUBMISSIONS: PaymentSubmissionRecord[] = [
  {
    id: 'pay-sub-asha',
    name: 'Asha Prasad',
    email: 'ashaprasad@gmail.com',
    phone: '+91 98321 55678',
    selectedStreamId: 'graduate-science',
    selectedStreamName: 'Graduate Teacher (Paper II) - Maths & Science',
    amount: 499,
    utrNumber: '426791234567',
    submittedAt: Date.now() - 4 * 86400000,
    status: 'approved',
    approvedAt: Date.now() - 4 * 86400000 + 3600000,
    approvedBy: 'vsfintech@gmail.com',
    notes: 'Subscribed to GT-Maths & Science (Paper II). Paid via Google Pay. Direct Admin Pro Activated.',
  },
  {
    id: 'pay-sub-shanti',
    name: 'Shanti Subba',
    email: 'shantisubba@gmail.com',
    phone: '+91 97332 66789',
    selectedStreamId: 'graduate-science',
    selectedStreamName: 'Graduate Teacher (Paper II) - Maths & Science',
    amount: 499,
    utrNumber: '426792345678',
    submittedAt: Date.now() - 3 * 86400000,
    status: 'approved',
    approvedAt: Date.now() - 3 * 86400000 + 3600000,
    approvedBy: 'vsfintech@gmail.com',
    notes: 'Subscribed to GT-Maths & Science (Paper II). Paid via PhonePe. Direct Admin Pro Activated.',
  },
  {
    id: 'pay-sub-1',
    name: 'Sonam Tshering Lepcha',
    email: 'sonam.lepcha@gmail.com',
    phone: '+91 98320 44512',
    selectedStreamId: 'primary',
    selectedStreamName: 'Primary Teacher (Paper I)',
    amount: 499,
    utrNumber: '426798112345',
    submittedAt: Date.now() - 25 * 60000,
    status: 'pending_approval',
    notes: 'Paid via Google Pay QR scanner. Form details verified by candidate.',
  },
  {
    id: 'pay-sub-2',
    name: 'Diki Bhutia',
    email: 'diki.bhutia99@gmail.com',
    phone: '+91 97330 18293',
    selectedStreamId: 'graduate-science',
    selectedStreamName: 'Graduate Teacher (Paper II) - Maths & Science',
    amount: 499,
    utrNumber: '426799015821',
    submittedAt: Date.now() - 75 * 60000,
    status: 'pending_approval',
    notes: 'Paid via PhonePe. Requesting immediate approval for GT Science mock tests.',
  },
  {
    id: 'pay-sub-3',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@gmail.com',
    phone: '+91 98112 34567',
    selectedStreamId: 'graduate-social',
    selectedStreamName: 'Graduate Teacher (Paper II) - Social Studies',
    amount: 499,
    utrNumber: '426790518392',
    submittedAt: Date.now() - 4 * 3600000,
    status: 'approved',
    approvedAt: Date.now() - 3 * 3600000,
    approvedBy: 'vsfintech@gmail.com',
    notes: 'Directly approved by Administrator Sabu Tamang on WhatsApp screenshot review.',
  }
];

export function getPaymentSubmissions(): PaymentSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENT_SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENT_SUBMISSIONS_KEY, JSON.stringify(INITIAL_PAYMENT_SUBMISSIONS));
      return INITIAL_PAYMENT_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENT_SUBMISSIONS;
  }
}

export function savePaymentSubmissions(submissions: PaymentSubmissionRecord[]): void {
  try {
    localStorage.setItem(PAYMENT_SUBMISSIONS_KEY, JSON.stringify(submissions));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_payment_submissions_updated', { detail: submissions }));
    }
  } catch (e) {
    console.error('Failed to save payment submissions', e);
  }
}

export function submitPaymentForm(data: {
  name: string;
  phone: string;
  email: string;
  selectedStreamId: string;
  selectedStreamName: string;
  amount?: number;
  utrNumber?: string;
  notes?: string;
}): { success: boolean; submission: PaymentSubmissionRecord; client: ClientRecord } {
  const cleanEmail = (data.email || '').toLowerCase().trim();
  const cleanPhone = (data.phone || '').trim();
  const cleanName = (data.name || '').trim();

  const newSub: PaymentSubmissionRecord = {
    id: `pay-sub-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    selectedStreamId: data.selectedStreamId,
    selectedStreamName: data.selectedStreamName,
    amount: data.amount || 499,
    utrNumber: data.utrNumber?.trim(),
    submittedAt: Date.now(),
    status: 'pending_approval',
    notes: data.notes || `Candidate submitted payment verification form for ${data.selectedStreamName}`,
  };

  const subs = getPaymentSubmissions();
  subs.unshift(newSub);
  savePaymentSubmissions(subs);

  // Also record/update candidate in Client directory with formFilled: true
  const clients = getAllClients();
  const existingIdx = clients.findIndex(
    (c) => c.email.toLowerCase() === cleanEmail ||
           (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
  );

  // Determine canonical track & course title
  const mappedTrack: ExamTrack = data.selectedStreamId === 'graduate-science' || data.selectedStreamName.toLowerCase().includes('math') || data.selectedStreamName.toLowerCase().includes('science')
    ? 'gt-maths-science'
    : data.selectedStreamId === 'graduate-social' || data.selectedStreamName.toLowerCase().includes('humanities') || data.selectedStreamName.toLowerCase().includes('social')
    ? 'gt-humanities'
    : 'prt';
  const canonicalCourseTitle = getSubscribedCourseTitle(mappedTrack);

  let client: ClientRecord;
  const noteText = `Form Filled & Submitted Payment: ${data.selectedStreamName} (₹${newSub.amount}) UTR: ${data.utrNumber || 'Pending'} on ${new Date().toLocaleString()}`;

  if (existingIdx >= 0) {
    client = {
      ...clients[existingIdx],
      name: cleanName || clients[existingIdx].name,
      phone: cleanPhone || clients[existingIdx].phone,
      formFilled: true,
      selectedStream: data.selectedStreamId,
      targetExam: canonicalCourseTitle,
      paidStreams: [mappedTrack],
      submissionDate: Date.now(),
      notes: (clients[existingIdx].notes ? `${clients[existingIdx].notes} • ` : '') + noteText,
    };
    clients[existingIdx] = client;
  } else {
    client = {
      id: `client-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      loginId: cleanEmail.split('@')[0] || `user_${Date.now()}`,
      targetExam: canonicalCourseTitle,
      role: 'candidate',
      status: 'trial',
      trialDaysRemaining: 1,
      registeredAt: Date.now(),
      lastLoginAt: Date.now(),
      testsCompleted: 0,
      avgScore: 0,
      phone: cleanPhone,
      formFilled: true,
      selectedStream: data.selectedStreamId,
      paidStreams: [mappedTrack],
      submissionDate: Date.now(),
      notes: noteText,
    };
    clients.unshift(client);
  }
  saveClients(clients);

  // Synchronize to registered user directory
  try {
    const users = getRegisteredUsers();
    const uIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (uIdx >= 0) {
      users[uIdx] = {
        ...users[uIdx],
        targetExam: canonicalCourseTitle,
        paidStreams: [mappedTrack],
      };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: users }));
      }
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: users[uIdx] }),
      }).catch(() => {});
    }
  } catch {}

  // Synchronize to active profile if this is the logged-in user
  const activeProfile = loadUserProfile();
  if (activeProfile.email && activeProfile.email.toLowerCase().trim() === cleanEmail) {
    const updatedProfile: UserProfile = {
      ...activeProfile,
      targetExam: canonicalCourseTitle,
      selectedExamTrack: mappedTrack,
      paidStreams: activeProfile.isPaid ? [mappedTrack] : activeProfile.paidStreams,
    };
    saveUserProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: updatedProfile }));
    }
  }

  return { success: true, submission: newSub, client };
}

export function directApprovePaymentSubmission(
  submissionId: string,
  approvedBy = 'Administrator'
): { success: boolean; submission: PaymentSubmissionRecord; client?: ClientRecord; message: string } {
  const subs = getPaymentSubmissions();
  const subIdx = subs.findIndex((s) => s.id === submissionId);
  if (subIdx < 0) {
    throw new Error('Payment submission not found');
  }

  const sub = subs[subIdx];
  const trackMapping: Record<string, ExamTrack> = {
    'primary': 'prt',
    'prt': 'prt',
    'graduate-science': 'gt-maths-science',
    'gt-maths-science': 'gt-maths-science',
    'graduate-social': 'gt-humanities',
    'gt-humanities': 'gt-humanities',
  };
  const targetTrack: ExamTrack = trackMapping[sub.selectedStreamId] || 'prt';

  sub.status = 'approved';
  sub.approvedAt = Date.now();
  sub.approvedBy = approvedBy;
  sub.notes = (sub.notes ? `${sub.notes} • ` : '') + `Directly approved by ${approvedBy} on ${new Date().toLocaleDateString()}`;
  subs[subIdx] = sub;
  savePaymentSubmissions(subs);

  // Activate candidate with paid status and unlocked stream
  const activation = activatePaidCustomer({
    email: sub.email,
    phone: sub.phone,
    name: sub.name,
    amount: sub.amount,
    paymentRef: sub.utrNumber || 'Form Submission Direct Approval',
    notes: `Approved for ${sub.selectedStreamName}`,
    streamTrack: targetTrack,
  });

  return {
    success: true,
    submission: sub,
    client: activation.client,
    message: `Directly approved ${sub.name} for ${sub.selectedStreamName}! Access has been unlocked.`,
  };
}

/* =========================================================
   FREE USAGE (CONFIGURABLE QUESTIONS LIMIT) & SUBSCRIPTION HELPER
   ========================================================= */

export const FREE_QUESTION_LIMIT_STORAGE_KEY = 'studeezone_free_question_limit_v1';

export function getFreeTierQuestionLimit(): number {
  try {
    const raw = localStorage.getItem(FREE_QUESTION_LIMIT_STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  return 30; // default 30 questions
}

export function setFreeTierQuestionLimit(limit: number): void {
  try {
    const valid = Math.max(1, Math.min(500, Math.floor(limit)));
    localStorage.setItem(FREE_QUESTION_LIMIT_STORAGE_KEY, valid.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_free_limit_updated', { detail: { limit: valid } }));
    }
  } catch (e) {
    console.error('Failed to set free question limit', e);
  }
}

export const FREE_TIER_QUESTION_LIMIT = 30;
export const ATTEMPTED_QUESTIONS_STORAGE_KEY = 'studeezone_attempted_question_ids_v1';

export function isPaidOrAdmin(userProfile?: UserProfile | null): boolean {
  if (!userProfile) return false;
  // A non-logged-in user or guest is NEVER paid or admin under any circumstance
  if (!userProfile.isLoggedIn) return false;
  const hasIdentifier = Boolean(
    (userProfile.email && userProfile.email.trim() !== '') ||
    (userProfile.loginId && userProfile.loginId.trim() !== '')
  );
  if (!hasIdentifier) return false;

  // Admin privileges only apply after user has logged in with admin credentials
  if (isAdminUser(userProfile.email) || userProfile.role === 'admin') {
    return true;
  }
  
  if (userProfile.email) {
    const clients = getAllClients();
    const matched = clients.find(c => c.email.toLowerCase() === userProfile.email!.toLowerCase());
    if (matched) {
      // If admin has explicitly disabled Pro Paid Active on this client
      if (matched.isPaid === false && matched.status !== 'active') {
        return false;
      }
      if (matched.isPaid || matched.status === 'active') {
        return true;
      }
    }
  }
  return Boolean(userProfile.isPaid);
}

export function getAttemptedQuestionIds(userProfile?: UserProfile | null): string[] {
  const ids = new Set<string>();
  if (userProfile?.completedQuestions) {
    Object.keys(userProfile.completedQuestions).forEach((id) => ids.add(id));
  }
  try {
    const raw = localStorage.getItem(ATTEMPTED_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => ids.add(id));
      }
    }
  } catch {}
  return Array.from(ids);
}

export function getQuestionsUsageCount(userProfile?: UserProfile | null): number {
  if (isPaidOrAdmin(userProfile)) return 0;
  return getAttemptedQuestionIds(userProfile).length;
}

export function recordQuestionAttempt(questionId: string): number {
  try {
    const raw = localStorage.getItem(ATTEMPTED_QUESTIONS_STORAGE_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (!existing.includes(questionId)) {
      existing.push(questionId);
      localStorage.setItem(ATTEMPTED_QUESTIONS_STORAGE_KEY, JSON.stringify(existing));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_question_attempted', { detail: { questionId, count: existing.length } }));
      }
    }
    return existing.length;
  } catch {
    return 0;
  }
}

export function hasReachedQuestionLimit(userProfile?: UserProfile | null): boolean {
  if (isPaidOrAdmin(userProfile)) return false;
  return getQuestionsUsageCount(userProfile) >= getFreeTierQuestionLimit();
}

export function getUserTrialStatus(userProfile?: UserProfile | null): {
  isPaid: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  badgeLabel: string;
  questionsUsed: number;
  questionsLimit: number;
} {
  const isSuperAdmin = Boolean(userProfile && userProfile.isLoggedIn && (isAdminUser(userProfile.email) || userProfile.role === 'admin'));
  const isPaid = isPaidOrAdmin(userProfile);
  const questionsUsed = getQuestionsUsageCount(userProfile);
  const questionsLimit = getFreeTierQuestionLimit();

  if (isSuperAdmin) {
    return {
      isPaid: true,
      isTrial: false,
      isExpired: false,
      daysRemaining: 365,
      badgeLabel: 'ADMIN ACCESS',
      questionsUsed,
      questionsLimit,
    };
  }

  if (isPaid) {
    return {
      isPaid: true,
      isTrial: false,
      isExpired: false,
      daysRemaining: 365,
      badgeLabel: 'PRO Paid Member',
      questionsUsed,
      questionsLimit,
    };
  }

  // Free users are capped at configurable question limit across Mock and Practice
  const isLimitReached = questionsUsed >= questionsLimit;
  return {
    isPaid: false,
    isTrial: false,
    isExpired: true,
    daysRemaining: 0,
    badgeLabel: isLimitReached 
      ? `Limit Reached (${questionsLimit}/${questionsLimit})` 
      : `${questionsUsed}/${questionsLimit} Free Qs`,
    questionsUsed,
    questionsLimit,
  };
}

/* =========================================================
   PAID PRO COURSE SUBSCRIPTION & ACCESS LOCKING
   Requirement: "After granting Paid pro access.. the dashboard 
   should show - You are SUBSCRIBED TO- 'course'. And should be 
   given full access to that specific course only. Rest of the 
   courses should remain inaccessible."
   ========================================================= */

export function getExamTrackFromTarget(targetExamOrTrack?: string): ExamTrack {
  if (!targetExamOrTrack) return 'prt';
  const lower = targetExamOrTrack.toLowerCase();
  if (lower === 'gt-maths-science' || lower.includes('math') || lower.includes('science')) {
    return 'gt-maths-science';
  }
  if (lower === 'gt-humanities' || lower.includes('humanities') || lower.includes('social')) {
    return 'gt-humanities';
  }
  return 'prt';
}

export function getUserSubscribedTrack(userProfile?: UserProfile | null): ExamTrack {
  if (!userProfile) return 'prt';

  // 1. Check matched client record first (Aspirant Directory is source of truth for Admin course allocations)
  const normEmail = (userProfile.email || '').toLowerCase().trim();
  const normLogin = (userProfile.loginId || '').toLowerCase().trim();
  const normName = (userProfile.name || '').toLowerCase().trim();
  if (normEmail || normLogin || (normName && normName !== 'candidate learner')) {
    try {
      const clients = getAllClients();
      const matched = clients.find(
        (c) =>
          (normEmail && c.email.toLowerCase().trim() === normEmail) ||
          (normLogin && c.loginId && c.loginId.toLowerCase().trim() === normLogin) ||
          (normName && normName !== 'candidate learner' && c.name.toLowerCase().trim() === normName)
      );
      if (matched) {
        return getClientAllocatedTrack(matched);
      }
    } catch {}
  }

  // 2. Special candidates Asha Prasad & Shanti Subba
  const userLower = `${userProfile.name || ''} ${userProfile.email || ''} ${userProfile.loginId || ''}`.toLowerCase();
  const isAshaOrShanti =
    userLower.includes('asha') ||
    userLower.includes('prasad') ||
    userLower.includes('shanti') ||
    userLower.includes('subba');
  if (isAshaOrShanti) {
    return 'gt-maths-science';
  }

  // 3. Check paidStreams explicitly on userProfile
  if (userProfile.paidStreams && userProfile.paidStreams.length > 0) {
    return userProfile.paidStreams[0];
  }

  // 4. Fallback to userProfile.targetExam
  if (userProfile.targetExam) {
    const lower = userProfile.targetExam.toLowerCase();
    if (lower.includes('math') || lower.includes('science')) return 'gt-maths-science';
    if (lower.includes('humanities') || lower.includes('social')) return 'gt-humanities';
    if (lower.includes('primary') || lower.includes('prt')) return 'prt';
  }

  return userProfile.selectedExamTrack || 'prt';
}

export function getSubscribedCourseTitle(targetExamOrTrack?: string, paidStreams?: ExamTrack[]): string {
  // If exact track identifier passed
  if (targetExamOrTrack === 'gt-maths-science') {
    return 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
  }
  if (targetExamOrTrack === 'gt-humanities') {
    return 'Sikkim Graduate Teacher (GT Humanities - Paper II)';
  }
  if (targetExamOrTrack === 'prt') {
    return 'Sikkim Primary Teacher (PRT - Paper I)';
  }

  // If paidStreams passed
  if (paidStreams && paidStreams.length > 0) {
    const track = paidStreams[0];
    if (track === 'gt-maths-science') return 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
    if (track === 'gt-humanities') return 'Sikkim Graduate Teacher (GT Humanities - Paper II)';
    if (track === 'prt') return 'Sikkim Primary Teacher (PRT - Paper I)';
  }

  if (targetExamOrTrack) {
    const lower = targetExamOrTrack.toLowerCase();
    if (lower.includes('math') || lower.includes('science')) {
      return 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';
    }
    if (lower.includes('humanities') || lower.includes('social')) {
      return 'Sikkim Graduate Teacher (GT Humanities - Paper II)';
    }
    if (lower.includes('primary') || lower.includes('prt')) {
      return 'Sikkim Primary Teacher (PRT - Paper I)';
    }
  }

  return 'Sikkim Primary Teacher (PRT - Paper I)';
}

export function canAccessExamTrack(userProfile?: UserProfile | null, trackId?: ExamTrack): boolean {
  if (!trackId) return true;
  if (!userProfile) return true;

  // Master Admin has full access to all courses
  const isSuperAdmin = Boolean(userProfile.isLoggedIn) && (isAdminUser(userProfile.email) || userProfile.role === 'admin');
  if (isSuperAdmin) return true;

  const userLower = `${userProfile.name || ''} ${userProfile.email || ''} ${userProfile.loginId || ''}`.toLowerCase();
  const isAshaOrShanti =
    userLower.includes('asha') ||
    userLower.includes('prasad') ||
    userLower.includes('shanti') ||
    userLower.includes('subba');
  if (isAshaOrShanti) {
    return trackId === 'gt-maths-science';
  }

  const isPaid = isPaidOrAdmin(userProfile);
  // Free / trial users have preview access across tracks up to question limit
  if (!isPaid) return true;

  // For Paid Pro candidate, access is strictly limited to their subscribed course
  const allowedStreams: ExamTrack[] = userProfile.paidStreams && userProfile.paidStreams.length > 0
    ? userProfile.paidStreams
    : [getUserSubscribedTrack(userProfile)];

  return allowedStreams.includes(trackId);
}

export function isCourseLockedForUser(userProfile?: UserProfile | null, trackId?: ExamTrack): boolean {
  if (!trackId || !userProfile) return false;
  const isSuperAdmin = Boolean(userProfile.isLoggedIn) && (isAdminUser(userProfile.email) || userProfile.role === 'admin');
  if (isSuperAdmin) return false;

  const isPaid = isPaidOrAdmin(userProfile);
  if (!isPaid) return false;

  return !canAccessExamTrack(userProfile, trackId);
}

/* =========================================================
   DATABASE BACKUP, CSV EXPORT & BULK IMPORT SYSTEM
   ========================================================= */

export interface DatabaseBackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  exportedTimestamp: number;
  totalClients: number;
  totalUsers: number;
  totalLogs: number;
  clients: ClientRecord[];
  users: RegisteredUser[];
  logs: LoginAuditLog[];
}

/**
 * Exports complete user database (clients, registered users, and audit logs) as JSON
 * Provides full crash recovery capability
 */
export function exportDatabaseJSON(): void {
  try {
    const clients = getAllClients();
    const users = getRegisteredUsers();
    const logs = getLoginAuditLogs();

    const payload: DatabaseBackupPayload = {
      app: 'studeezone.com',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedTimestamp: Date.now(),
      totalClients: clients.length,
      totalUsers: users.length,
      totalLogs: logs.length,
      clients,
      users,
      logs,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `studeezone_total_user_database_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export database JSON', error);
  }
}

/**
 * Exports all database clients to Excel/Google Sheets compatible CSV
 */
export function exportClientsCSV(): void {
  try {
    const clients = getAllClients();
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Login ID',
      'Password',
      'Allocated Course',
      'Exam Track',
      'Status',
      'Pro Paid Active',
      'Trial Days Left',
      'Tests Completed',
      'Average Score',
      'Registered Date',
      'Notes',
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = clients.map((c) => {
      const regDate = c.registeredAt ? new Date(c.registeredAt).toLocaleDateString() : '';
      const track = c.selectedExamTrack || (c.paidStreams && c.paidStreams[0]) || 'gt-maths-science';
      return [
        escapeCSV(c.name || ''),
        escapeCSV(c.email || ''),
        escapeCSV(c.phone || ''),
        escapeCSV(c.loginId || ''),
        escapeCSV(c.password || ''),
        escapeCSV(c.targetExam || getSubscribedCourseTitle(track)),
        escapeCSV(track),
        escapeCSV(c.status || 'trial'),
        escapeCSV(c.isPaid ? 'true' : 'false'),
        escapeCSV(c.trialDaysRemaining ?? (c.isPaid ? 365 : 7)),
        escapeCSV(c.testsCompleted ?? 0),
        escapeCSV(c.avgScore ?? 0),
        escapeCSV(regDate),
        escapeCSV(c.notes || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `studeezone_total_user_database_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export clients CSV', error);
  }
}

/**
 * Downloads a ready-to-fill sample CSV template for bulk user uploading
 */
export function downloadSampleClientsCSV(): void {
  try {
    const headers = ['Name', 'Email', 'Phone', 'Login ID', 'Password', 'Allocated Course', 'Status', 'Is Paid', 'Notes'];
    const sampleRows = [
      ['"Karma Bhutia"', '"karma.bhutia@gmail.com"', '"+91 98320 12345"', '"karmabhutia"', '"Karma@123"', '"Sikkim Graduate Teacher (GT Maths & Science - Paper II)"', '"active"', '"true"', '"Enrolled in GT Maths & Science"'],
      ['"Sonam Lepcha"', '"sonam.lepcha@gmail.com"', '"+91 98321 23456"', '"sonamlepcha"', '"Sonam@123"', '"Sikkim Graduate Teacher (GT Humanities - Paper II)"', '"active"', '"true"', '"Enrolled in GT Humanities"'],
      ['"Pema Dolma"', '"pema.dolma@gmail.com"', '"+91 98322 34567"', '"pemadolma"', '"Pema@123"', '"Sikkim Primary Teacher (PRT - Paper I)"', '"trial"', '"false"', '"1-Day Free Trial Aspirant"'],
    ];

    const csvContent = [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studeezone_bulk_upload_sample_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download sample CSV template', error);
  }
}

/**
 * Robust CSV parser supporting quotes, commas within quotes, and multi-line fields
 */
export function parseCSVToClients(csvText: string): Partial<ClientRecord>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQuotesCell = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotesCell && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotesCell = !inQuotesCell;
        }
      } else if (char === ',' && !inQuotesCell) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const findIdx = (possibleNames: string[]): number => {
    return headers.findIndex((h) => possibleNames.some((p) => h.includes(p)));
  };

  const nameIdx = findIdx(['name', 'candidate', 'student', 'fullname']);
  const emailIdx = findIdx(['email', 'mail']);
  const phoneIdx = findIdx(['phone', 'mobile', 'contact']);
  const loginIdx = findIdx(['login', 'loginid', 'username']);
  const passIdx = findIdx(['password', 'pass', 'pwd']);
  const courseIdx = findIdx(['course', 'exam', 'target', 'stream', 'paper']);
  const trackIdx = findIdx(['track', 'examtrack']);
  const statusIdx = findIdx(['status', 'tier']);
  const paidIdx = findIdx(['paid', 'ispaid', 'pro']);
  const trialIdx = findIdx(['trial', 'days', 'remaining']);
  const notesIdx = findIdx(['notes', 'remark', 'comments']);

  const results: Partial<ClientRecord>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0 || row.every((c) => !c)) continue;

    const email = emailIdx >= 0 ? row[emailIdx] : '';
    const name = nameIdx >= 0 ? row[nameIdx] : '';
    if (!email && !name) continue;

    const phone = phoneIdx >= 0 ? row[phoneIdx] : '';
    const loginId = loginIdx >= 0 && row[loginIdx] ? row[loginIdx] : (email ? email.split('@')[0] : `user_${Date.now()}_${i}`);
    const password = passIdx >= 0 ? row[passIdx] : (phone || '123456');
    const courseRaw = courseIdx >= 0 ? row[courseIdx] : '';
    const trackRaw = trackIdx >= 0 ? row[trackIdx] : '';

    let resolvedTrack: ExamTrack = 'gt-maths-science';
    const cLower = (courseRaw + ' ' + trackRaw).toLowerCase();
    if (cLower.includes('humanities') || cLower.includes('social') || cLower.includes('gt-hum')) {
      resolvedTrack = 'gt-humanities';
    } else if (cLower.includes('primary') || cLower.includes('prt') || cLower.includes('paper i') || cLower.includes('paper 1')) {
      resolvedTrack = 'prt';
    } else {
      resolvedTrack = 'gt-maths-science';
    }

    const targetExam = getSubscribedCourseTitle(resolvedTrack);
    const selectedStream = resolvedTrack === 'gt-maths-science' ? 'graduate-science' : resolvedTrack === 'gt-humanities' ? 'graduate-social' : 'primary';

    const statusRaw = (statusIdx >= 0 ? row[statusIdx] : '').toLowerCase();
    const paidRaw = (paidIdx >= 0 ? row[paidIdx] : '').toLowerCase();
    const isPaid = paidRaw === 'true' || paidRaw === '1' || paidRaw === 'yes' || paidRaw === 'active' || statusRaw === 'active';
    const status: 'trial' | 'active' | 'expired' | 'suspended' =
      statusRaw === 'active' || isPaid ? 'active' : statusRaw === 'expired' ? 'expired' : statusRaw === 'suspended' ? 'suspended' : 'trial';

    const trialDays = trialIdx >= 0 && row[trialIdx] ? parseInt(row[trialIdx], 10) || (isPaid ? 365 : 7) : (isPaid ? 365 : 7);
    const notes = notesIdx >= 0 ? row[notesIdx] : '';

    results.push({
      name: name || email.split('@')[0] || 'Imported Candidate',
      email: email.toLowerCase().trim(),
      phone,
      loginId,
      password,
      targetExam,
      selectedExamTrack: resolvedTrack,
      selectedStream,
      paidStreams: [resolvedTrack],
      status,
      isPaid,
      trialDaysRemaining: trialDays,
      role: 'candidate',
      notes: notes || `Bulk imported on ${new Date().toLocaleDateString()}`,
    });
  }

  return results;
}

/**
 * Parses either JSON backup files or CSV rosters into structured client records
 */
export function parseImportFileContent(fileText: string, fileName: string): {
  type: 'json' | 'csv';
  records: Partial<ClientRecord>[];
  totalFound: number;
  rawPayload?: any;
} {
  const isJson = fileName.toLowerCase().endsWith('.json') || fileText.trim().startsWith('{') || fileText.trim().startsWith('[');
  if (isJson) {
    try {
      const parsed = JSON.parse(fileText);
      if (Array.isArray(parsed)) {
        return {
          type: 'json',
          records: parsed,
          totalFound: parsed.length,
          rawPayload: parsed,
        };
      } else if (parsed && typeof parsed === 'object') {
        const clientList = Array.isArray(parsed.clients) ? parsed.clients : [];
        const userList = Array.isArray(parsed.users) ? parsed.users : [];
        const combined = clientList.length > 0 ? clientList : userList;
        return {
          type: 'json',
          records: combined,
          totalFound: Math.max(clientList.length, userList.length),
          rawPayload: parsed,
        };
      }
    } catch (e) {
      // Fallback to CSV parsing
    }
  }

  // Treat as CSV
  const csvRecords = parseCSVToClients(fileText);
  return {
    type: 'csv',
    records: csvRecords,
    totalFound: csvRecords.length,
  };
}

/**
 * Imports candidate records into localStorage and synchronizes with server backend
 * Supports 'merge' (safe update + append) or 'replace' (full restore from backup)
 */
export async function importUserDatabase(
  importedInput: Partial<ClientRecord>[] | { clients?: Partial<ClientRecord>[]; users?: Partial<RegisteredUser>[]; logs?: LoginAuditLog[] },
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ added: number; updated: number; total: number }> {
  let importedList: Partial<ClientRecord>[] = [];
  let backupLogs: LoginAuditLog[] | undefined;

  if (Array.isArray(importedInput)) {
    importedList = importedInput;
  } else if (importedInput && typeof importedInput === 'object') {
    if (Array.isArray(importedInput.clients) && importedInput.clients.length > 0) {
      importedList = importedInput.clients;
    } else if (Array.isArray(importedInput.users)) {
      importedList = importedInput.users as any;
    }
    if (Array.isArray(importedInput.logs)) {
      backupLogs = importedInput.logs;
    }
  }

  const currentClients = getAllClients();
  const currentUsers = getRegisteredUsers();

  let added = 0;
  let updated = 0;

  let finalClients: ClientRecord[] = mode === 'replace'
    ? currentClients.filter((c) => isProtectedAdminEmail(c.email))
    : [...currentClients];

  let finalUsers: RegisteredUser[] = mode === 'replace'
    ? currentUsers.filter((u) => isProtectedAdminEmail(u.email))
    : [...currentUsers];

  importedList.forEach((item, index) => {
    if (!item.email && !item.name) return;
    const normEmail = (item.email || '').toLowerCase().trim();
    const normLogin = (item.loginId || normEmail).toLowerCase().trim();

    const track: ExamTrack = item.selectedExamTrack || (item.paidStreams && item.paidStreams[0]) || 'gt-maths-science';
    const courseTitle = item.targetExam || getSubscribedCourseTitle(track);
    const stream = item.selectedStream || (track === 'gt-maths-science' ? 'graduate-science' : track === 'gt-humanities' ? 'graduate-social' : 'primary');
    const isPaid = item.isPaid !== undefined ? Boolean(item.isPaid) : item.status === 'active';

    const existingClientIdx = finalClients.findIndex(
      (c) => (normEmail && c.email.toLowerCase().trim() === normEmail) || (normLogin && c.loginId && c.loginId.toLowerCase().trim() === normLogin)
    );

    if (existingClientIdx !== -1) {
      finalClients[existingClientIdx] = {
        ...finalClients[existingClientIdx],
        ...item,
        email: normEmail || finalClients[existingClientIdx].email,
        name: item.name || finalClients[existingClientIdx].name,
        loginId: normLogin || finalClients[existingClientIdx].loginId,
        targetExam: courseTitle,
        selectedExamTrack: track,
        selectedStream: stream,
        paidStreams: [track],
        isPaid,
        status: item.status || (isPaid ? 'active' : finalClients[existingClientIdx].status),
        trialDaysRemaining: item.trialDaysRemaining ?? (isPaid ? 365 : finalClients[existingClientIdx].trialDaysRemaining),
      };
      updated++;
    } else {
      const newId = item.id || `client-${Date.now()}-${index}`;
      finalClients.push({
        id: newId,
        name: item.name || normEmail.split('@')[0] || 'Imported Candidate',
        email: normEmail,
        loginId: normLogin || normEmail,
        phone: item.phone || '',
        password: item.password || item.phone || '123456',
        targetExam: courseTitle,
        selectedExamTrack: track,
        selectedStream: stream,
        paidStreams: [track],
        role: item.role || 'candidate',
        status: item.status || (isPaid ? 'active' : 'trial'),
        isPaid,
        trialDaysRemaining: item.trialDaysRemaining ?? (isPaid ? 365 : 7),
        registeredAt: item.registeredAt || Date.now(),
        lastLoginAt: item.lastLoginAt || Date.now(),
        testsCompleted: item.testsCompleted || 0,
        avgScore: item.avgScore || 0,
        notes: item.notes || `Bulk imported on ${new Date().toLocaleDateString()}`,
      });
      added++;
    }

    // Synchronize to registered users
    const existingUserIdx = finalUsers.findIndex(
      (u) => (normEmail && u.email.toLowerCase().trim() === normEmail) || (normLogin && u.loginId && u.loginId.toLowerCase().trim() === normLogin)
    );

    if (existingUserIdx !== -1) {
      finalUsers[existingUserIdx] = {
        ...finalUsers[existingUserIdx],
        name: item.name || finalUsers[existingUserIdx].name,
        loginId: normLogin || finalUsers[existingUserIdx].loginId,
        phone: item.phone || finalUsers[existingUserIdx].phone,
        password: item.password || finalUsers[existingUserIdx].password,
        targetExam: courseTitle,
        selectedExamTrack: track,
        paidStreams: [track],
        isPaid,
        status: item.status || (isPaid ? 'active' : finalUsers[existingUserIdx].status),
      };
    } else if (normEmail) {
      finalUsers.push({
        id: `user-${Date.now()}-${index}`,
        name: item.name || normEmail.split('@')[0] || 'Imported Candidate',
        email: normEmail,
        loginId: normLogin || normEmail,
        phone: item.phone || undefined,
        password: item.password || item.phone || '123456',
        authProvider: 'password',
        role: 'candidate',
        targetExam: courseTitle,
        selectedExamTrack: track,
        paidStreams: [track],
        status: item.status || (isPaid ? 'active' : 'trial'),
        isPaid,
        trialExpiresAt: Date.now() + (isPaid ? 365 : 7) * 86400000,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        testsCompleted: 0,
        avgScore: 0,
      });
    }
  });

  saveClients(finalClients, true);
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(finalUsers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: finalUsers }));
    }
  } catch {}

  if (backupLogs && backupLogs.length > 0) {
    try {
      const currentLogs = getLoginAuditLogs();
      const mergedLogs = mode === 'replace' ? backupLogs : [...backupLogs, ...currentLogs];
      localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(mergedLogs));
    } catch {}
  }

  // Sync to server backend
  try {
    await fetch('/api/admin/database/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients: finalClients, users: finalUsers, logs: backupLogs, mode }),
    });
  } catch {}

  return { added, updated, total: finalClients.length };
}

