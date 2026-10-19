export type SubjectCategory = 
  | 'CDP' 
  | 'SocialScience' 
  | 'English' 
  | 'MathsScience' 
  | 'Maths' 
  | 'EVS' 
  | 'All';

export type QuestionCategory = 'CDP' | 'SocialScience' | 'English' | 'MathsScience' | 'Maths' | 'EVS';

export type ExamTrack = 'gt-humanities' | 'gt-maths-science' | 'prt';

export interface ExamTrackInfo {
  id: ExamTrack;
  title: string;
  shortTitle: string;
  badge: string;
  level: string;
  description: string;
  subjects: {
    category: SubjectCategory;
    name: string;
    description: string;
  }[];
}

export type ExamYear = '2026' | '2025' | '2024' | '2023' | '2022' | 'All';

export type LogicQuestionMode = 
  | 'all'
  | 'assertion-reason'
  | 'case-study'
  | 'calculation'
  | 'theorist-stage'
  | 'policy-statute'
  | 'linguistic-syntax';

export interface Question {
  id: string;
  year: '2026' | '2025' | '2024' | '2023' | '2022' | '2021' | '2020';
  category: QuestionCategory;
  examTracks?: ExamTrack[];
  topic: string;
  subtopic?: string;
  questionNumber: number;
  passageTitle?: string;
  passageText?: string;
  diagramUrl?: string;
  diagramDescription?: string;
  question: string;
  options: string[];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
  examPatternAnalysis: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  logicMode?: LogicQuestionMode;
  previousPaperSet?: string;
  isStetItemBankRef?: boolean;
  competencyCode?: string;
  cognitiveLevel?: 'Recall' | 'Understanding' | 'Application' | 'Analysis';
  distractorRationales?: string[]; // [Rationale for Opt A, Rationale for Opt B, Rationale for Opt C, Rationale for Opt D]
  contentDomain?: string;
  sourceDoc?: string;
}

export interface StetFramingGuideline {
  id: string;
  ruleNumber: number;
  title: string;
  category: 'Stem Design' | 'Distractor Engineering' | 'Cognitive Rigor' | 'Fairness & Bias' | 'Sikkim Context';
  shortSummary: string;
  corePrinciple: string;
  dos: string[];
  donts: string[];
  classroomExample: {
    flawedItem: string;
    flawExplanation: string;
    improvedItem: string;
    improvedExplanation: string;
  };
}

export interface StetCompetencyDomain {
  domainId: string;
  subject: SubjectCategory;
  title: string;
  description: string;
  subDomains: {
    code: string;
    name: string;
    keyLearningOutcomes: string[];
  }[];
}

export interface TestAnswer {
  questionId: string;
  selectedIndex: number | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
  isCorrect?: boolean;
}

export interface MockTestResult {
  id: string;
  mockTestId: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  subjectScores: {
    category: QuestionCategory;
    correct: number;
    total: number;
  }[];
  answers: TestAnswer[];
}

export interface DailyStreakActivity {
  date: string; // YYYY-MM-DD
  practiceCount: number;
  mockTestCount: number;
  totalXpEarned: number;
  lastCompletedAt: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  loginId?: string;
  phone?: string;
  isLoggedIn?: boolean;
  role?: 'admin' | 'candidate';
  authProvider?: 'google' | 'password' | 'guest';
  avatarSeed: string;
  targetExam: string;
  selectedExamTrack?: ExamTrack;
  examDate: string;
  streakDays: number; // Consecutive days of mock test or practice sessions
  longestStreak?: number; // Longest streak achieved
  lastActiveDate?: string; // YYYY-MM-DD format of last completed session
  lastActivityType?: 'mock_test' | 'practice_session';
  streakHistory?: string[]; // List of YYYY-MM-DD dates with completed activity
  activityLog?: Record<string, DailyStreakActivity>; // Daily breakdown
  totalXp: number;
  savedQuestions: string[]; // question IDs
  diagnosticWeakTopics: string[];
  completedQuestions: Record<string, { selected: number; isCorrect: boolean; timestamp: number }>;
  mockTestResults: MockTestResult[];
  dailyStudyMinutes: number;
  isPaid?: boolean;
  trialExpiresAt?: number;
  trialDaysRemaining?: number;
  subscriptionPlan?: string;
  paidStreams?: ExamTrack[]; // Streams the user has explicitly paid for or unlocked
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  loginId: string;
  phone?: string;
  password?: string;
  authProvider: 'google' | 'password';
  targetExam: string;
  selectedExamTrack?: ExamTrack;
  role?: 'admin' | 'candidate';
  createdAt: number;
  lastLoginAt?: number;
  trialExpiresAt?: number;
  status?: 'active' | 'trial' | 'expired' | 'suspended';
  testsCompleted?: number;
  avgScore?: number;
  isPaid?: boolean;
  paidStreams?: ExamTrack[];
  updatedAt?: number;
}

export interface LoginAuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginId: string;
  role: 'admin' | 'candidate';
  authProvider: 'google' | 'password' | 'guest';
  timestamp: number;
  ipAddress: string;
  deviceInfo: string;
  location: string;
  status: 'active' | 'completed';
}

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  loginId: string;
  targetExam: string;
  selectedExamTrack?: ExamTrack;
  role: 'admin' | 'candidate';
  status: 'trial' | 'active' | 'expired' | 'suspended';
  trialDaysRemaining: number;
  registeredAt: number;
  lastLoginAt: number;
  testsCompleted: number;
  avgScore: number;
  notes?: string;
  phone?: string;
  password?: string;
  isPaid?: boolean;
  paymentDate?: number;
  paymentAmount?: number;
  paymentRef?: string;
  paidStreams?: ExamTrack[];
  formFilled?: boolean;
  selectedStream?: string;
  submissionDate?: number;
  updatedAt?: number;
}

export interface PaymentSubmissionRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  selectedStreamId: string;
  selectedStreamName: string;
  amount: number;
  utrNumber?: string;
  submittedAt: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  approvedAt?: number;
  approvedBy?: string;
  notes?: string;
}

export interface AdminPaymentConfig {
  upiId: string;
  upiName: string;
  adminPhone: string;
  qrScannerImageUrl: string;
  subscriptionPrice: number;
  currency: string;
  planDuration: string;
  planName: string;
  instructions?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  mockTestsCount: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface StudyGuideItem {
  id: string;
  title: string;
  category: QuestionCategory;
  readMinutes: number;
  keyFormulasAndRules: string[];
  highYieldPoints: string[];
  sampleMnemonics: string[];
  summary: string;
  examTracks?: ExamTrack[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  questionRef?: Question;
}

export type ContributorCategory = 
  | 'advisory-board' 
  | 'contributing-authors' 
  | 'academic-council' 
  | 'pedagogical-fellows' 
  | 'editorial-reviewers';

export interface AdvisoryMember {
  id: string;
  name: string;
  honorific?: string; // e.g. "Prof.", "Dr.", "Shri", "Smt."
  roleTitle: string; // The high-sounding designation (e.g. "Honorary Academic Council Chairperson")
  category: ContributorCategory;
  affiliation: string; // e.g., "Former Director of Teacher Education, Sikkim"
  credentials: string; // e.g., "Ph.D. in Cognitive Pedagogy, M.Ed, Gold Medalist"
  bio: string;
  contributions: string[]; // e.g. ["CDP Question Bank Validation", "STET Blueprint Peer Review"]
  avatarUrl?: string; // Image URL or avatar style identifier
  badge?: string; // e.g. "Chairperson", "Lead Reviewer", "Senior Fellow"
  email?: string;
  linkedinUrl?: string;
  order: number;
  featured: boolean;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface SuggestedRoleTitle {
  title: string;
  category: ContributorCategory;
  description: string;
  recommendedBadge: string;
  resonanceTier: 'Executive Leadership' | 'Distinguished Scholarly' | 'Psychometric Rigor' | 'Curricular Master';
}

export type FellowshipStatus = 'submitted' | 'under_review' | 'under-review' | 'approved' | 'declined' | 'inducted';

export interface FellowshipApplication {
  id: string;
  referenceNumber: string;
  name: string;
  honorific: string; // e.g. "Prof.", "Dr.", "Shri", "Smt."
  email: string;
  phone: string;
  location: string;
  affiliation: string; // Current institution / university & designation
  highestQualification: string; // Ph.D., M.Ed, M.Phil, M.Sc, etc.
  customCredentials?: string; // Options to specify credentials other than predefined options
  specializationDomain: string; // CDP, Mathematics, Science, EVS, etc.
  experienceYears: number | string;
  briefExperienceAndBio?: string; // Brief write-up about experience, yourself, and how you fit into the role
  photoUrl?: string; // Passport size photo data URL for profile picture
  preferredPosition: string; // Chosen/desired role title
  preferredCategory: ContributorCategory;
  contributions: string[]; // Areas willing to contribute
  profileLink?: string;
  statementOfPedagogy: string;
  status: FellowshipStatus;
  adminAssignedRoleTitle?: string; // Decided by council
  adminAssignedCategory?: ContributorCategory;
  adminNotes?: string;
  submittedAt: number;
  reviewedAt?: number;
}

export interface CouncilSettings {
  showCouncilMembersSection: boolean;
  allowPublicToggle?: boolean;
}

