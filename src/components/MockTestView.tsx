import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft, 
  FileDown, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Layers,
  BookOpen,
  Filter,
  Check,
  Award,
  Crown,
  Zap,
  Lock,
} from 'lucide-react';
import { 
  Question, 
  UserProfile, 
  MockTestResult, 
  TestAnswer, 
  ExamTrack, 
  QuestionCategory 
} from '../types';
import { HISTORICAL_EXAM_QUESTIONS } from '../data/examQuestions';
import {
  STET_2026_CDP_QUESTIONS,
  STET_2026_ENGLISH_QUESTIONS,
  STET_2026_SOCIAL_SCIENCE_QUESTIONS,
} from '../data/stet2026VerifiedBank';
import {
  selectUniqueQuestionsForSection,
  ensureTestQuestionsAreUnique,
  deduplicateQuestionList,
} from '../utils/questionDeduplicator';
import { recordLearningActivity } from '../utils/streakTracker';
import { firestoreSyncService } from '../services/firestoreSyncService';
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

export interface MockSectionDef {
  name: string;
  category: QuestionCategory;
  questionCount: number;
  startIndex: number;
}

export interface MockTestDef {
  id: string;
  title: string;
  year: '2026' | '2025' | '2024' | '2023' | '2022';
  durationMinutes: number;
  description: string;
  questions: Question[];
  paperBadge?: string;
  track?: ExamTrack | 'all';
  testType: 'full-120' | 'subject-30' | 'previous-paper';
  sections?: MockSectionDef[];
}

interface MockTestViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onOpenTutor: (contextMsg?: string, questionRef?: Question) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
  onOpenSubscription?: (trackId?: ExamTrack) => void;
  onOpenSubscribeForMore?: (section?: 'practice' | 'mock-tests') => void;
}

// Helper to reliably extract exactly 30 unique questions for a given track and subject without repetition
function extract30SubjectQuestions(
  track: ExamTrack, 
  category: QuestionCategory, 
  usedSet?: Set<string>, 
  topicKeyword?: string
): Question[] {
  const tracker = usedSet || new Set<string>();
  return selectUniqueQuestionsForSection({
    pool: HISTORICAL_EXAM_QUESTIONS,
    track,
    category,
    count: 30,
    usedSignatures: tracker,
    topicKeyword,
  });
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenTutor,
  onSelectExamTrack,
  onOpenSubscription,
  onOpenSubscribeForMore,
}) => {
  // Pre-build guaranteed non-repeating 30 questions for PRT subjects
  const prtGlobalUsed = new Set<string>();
  const prtCdp30 = extract30SubjectQuestions('prt', 'CDP', prtGlobalUsed);
  const prtMaths30 = extract30SubjectQuestions('prt', 'Maths', prtGlobalUsed);
  const prtEvs30 = extract30SubjectQuestions('prt', 'EVS', prtGlobalUsed);
  const prtEng30 = extract30SubjectQuestions('prt', 'English', prtGlobalUsed);
  const prtFull120Questions = ensureTestQuestionsAreUnique(
    [...prtCdp30, ...prtMaths30, ...prtEvs30, ...prtEng30],
    HISTORICAL_EXAM_QUESTIONS,
    'prt'
  );

  // Pre-build guaranteed non-repeating 30 questions for GT Maths & Science subjects
  const gtmsGlobalUsed = new Set<string>();
  const gtmsCdp30 = extract30SubjectQuestions('gt-maths-science', 'CDP', gtmsGlobalUsed);
  const gtmsMaths30 = extract30SubjectQuestions('gt-maths-science', 'MathsScience', gtmsGlobalUsed, 'Math');
  const gtmsSci30 = extract30SubjectQuestions('gt-maths-science', 'MathsScience', gtmsGlobalUsed, 'Sci');
  const gtmsEng30 = extract30SubjectQuestions('gt-maths-science', 'English', gtmsGlobalUsed);
  const gtmsFull120Questions = ensureTestQuestionsAreUnique(
    [...gtmsCdp30, ...gtmsMaths30, ...gtmsSci30, ...gtmsEng30],
    HISTORICAL_EXAM_QUESTIONS,
    'gt-maths-science'
  );

  // Pre-build guaranteed non-repeating 30 questions for GT Humanities subjects
  const gthumGlobalUsed = new Set<string>();
  const gthumCdp30 = extract30SubjectQuestions('gt-humanities', 'CDP', gthumGlobalUsed);
  const gthumHist30 = extract30SubjectQuestions('gt-humanities', 'SocialScience', gthumGlobalUsed, 'Hist');
  const gthumGeo30 = extract30SubjectQuestions('gt-humanities', 'SocialScience', gthumGlobalUsed, 'Geo');
  const gthumEng30 = extract30SubjectQuestions('gt-humanities', 'English', gthumGlobalUsed);
  const gthumFull120Questions = ensureTestQuestionsAreUnique(
    [...gthumCdp30, ...gthumHist30, ...gthumGeo30, ...gthumEng30],
    HISTORICAL_EXAM_QUESTIONS,
    'gt-humanities'
  );

  // Build the complete mock test catalog with 30-questions-per-subject full mock papers,
  // 30-questions subject sectional mocks, and authentic official papers
  const rawMockSuites: MockTestDef[] = [
    // --- 1. FULL 120-QUESTION GRAND PAPERS (EXACTLY 30 QUESTIONS FOR EACH OF THE 4 SUBJECTS) ---
    {
      id: 'mock-prt-grand-120',
      title: 'STET PRT Paper I Grand Mock Test (120 Questions - 30 Qs Per Subject)',
      year: '2026',
      durationMinutes: 150,
      track: 'prt',
      testType: 'full-120',
      paperBadge: 'Official 30 Qs/Subject Model',
      description: 'Comprehensive 120-question Primary Teacher test: exactly 30 questions each in Child Development, Mathematics, Environmental Studies (EVS), and English Language.',
      questions: prtFull120Questions,
      sections: [
        { name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 },
        { name: 'Mathematics & Pedagogy', category: 'Maths', questionCount: 30, startIndex: 30 },
        { name: 'Environmental Studies (EVS)', category: 'EVS', questionCount: 30, startIndex: 60 },
        { name: 'English Language I', category: 'English', questionCount: 30, startIndex: 90 },
      ],
    },
    {
      id: 'mock-gtms-grand-120',
      title: 'STET GT Maths & Science Grand Mock Test (120 Questions - 30 Qs Per Subject)',
      year: '2026',
      durationMinutes: 150,
      track: 'gt-maths-science',
      testType: 'full-120',
      paperBadge: 'Official 30 Qs/Subject Model',
      description: 'Full Graduate Teacher Paper II: exactly 30 questions each in Child Development, Graduate Mathematics, Science (Physics/Chemistry/Biology), and English Language.',
      questions: gtmsFull120Questions,
      sections: [
        { name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 },
        { name: 'Graduate Mathematics', category: 'MathsScience', questionCount: 30, startIndex: 30 },
        { name: 'Graduate Science (PCB)', category: 'MathsScience', questionCount: 30, startIndex: 60 },
        { name: 'English Language & Pedagogy', category: 'English', questionCount: 30, startIndex: 90 },
      ],
    },
    {
      id: 'mock-gthum-grand-120',
      title: 'STET GT Humanities Grand Mock Test (120 Questions - 30 Qs Per Subject)',
      year: '2026',
      durationMinutes: 150,
      track: 'gt-humanities',
      testType: 'full-120',
      paperBadge: 'Official 30 Qs/Subject Model',
      description: 'Full Graduate Teacher Paper II: exactly 30 questions each in Child Development, Social Science History/Heritage, Geography/Polity, and English Language & Literature.',
      questions: gthumFull120Questions,
      sections: [
        { name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 },
        { name: 'History & Sikkim Heritage', category: 'SocialScience', questionCount: 30, startIndex: 30 },
        { name: 'Geography, Polity & Civics', category: 'SocialScience', questionCount: 30, startIndex: 60 },
        { name: 'English Language & Literature', category: 'English', questionCount: 30, startIndex: 90 },
      ],
    },

    // --- 2. 30-QUESTION SUBJECT SECTIONAL MOCKS ---
    // PRT Subject Mocks (30 Questions Each)
    {
      id: 'mock-prt-sub-cdp-30',
      title: 'STET PRT: Child Development & Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'prt',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Focused 30-question subject test on Primary Child Development, Piaget, Vygotsky, Kohlberg, RTE 2009, RPwD 2016, and inclusive pedagogy.',
      questions: prtCdp30,
      sections: [{ name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-prt-sub-maths-30',
      title: 'STET PRT: Mathematics & Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 35,
      track: 'prt',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Targeted 30-question subject test covering fractions, exponents, perimeter invariance, Euler polyhedron formula, and primary math pedagogy.',
      questions: prtMaths30,
      sections: [{ name: 'Mathematics & Pedagogy', category: 'Maths', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-prt-sub-evs-30',
      title: 'STET PRT: Environmental Studies & Sikkim Heritage (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'prt',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: '30-question subject mock on Khangchendzonga National Park, Pangolakha Sanctuary, GLOF flood dynamics, Sarhul festival, and EVS inquiry.',
      questions: prtEvs30,
      sections: [{ name: 'Environmental Studies', category: 'EVS', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-prt-sub-eng-30',
      title: 'STET PRT: English Language I & Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'prt',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: '30-question subject test covering reading comprehension, phonics, BICS vs CALP, vocabulary in context, and communicative English teaching.',
      questions: prtEng30,
      sections: [{ name: 'English Language I', category: 'English', questionCount: 30, startIndex: 0 }],
    },

    // GT Maths & Science Subject Mocks (30 Questions Each)
    {
      id: 'mock-gtms-sub-cdp-30',
      title: 'STET GT: Child Development & Secondary Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-maths-science',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Secondary adolescent cognitive development, Bruner spiral curriculum, constructivist assessment, and NEP 2020 PARAKH guidelines.',
      questions: gtmsCdp30,
      sections: [{ name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gtms-sub-maths-30',
      title: 'STET GT: Mathematics & Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 40,
      track: 'gt-maths-science',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Coordinate geometry, AP/GP sequences, quadratic discriminants, trigonometry, mensuration, and GeoGebra teaching models.',
      questions: gtmsMaths30,
      sections: [{ name: 'Graduate Mathematics', category: 'MathsScience', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gtms-sub-sci-30',
      title: 'STET GT: Science (Physics, Chemistry, Biology) (30 Questions)',
      year: '2026',
      durationMinutes: 35,
      track: 'gt-maths-science',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Newtonian mechanics, optics & thin lens formula, chemical bonding, Mendeleev vs Modern periodic table, Planaria regeneration, and lab safety.',
      questions: gtmsSci30,
      sections: [{ name: 'Graduate Science (PCB)', category: 'MathsScience', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gtms-sub-eng-30',
      title: 'STET GT: English Language & Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-maths-science',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Complex reading comprehension, discourse markers, syntax transformation, reported speech, and error analysis.',
      questions: gtmsEng30,
      sections: [{ name: 'English Language', category: 'English', questionCount: 30, startIndex: 0 }],
    },

    // GT Humanities Subject Mocks (30 Questions Each)
    {
      id: 'mock-gthum-sub-cdp-30',
      title: 'STET GT Humanities: Adolescent CDP & Ethics (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-humanities',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Adolescent moral reasoning, social constructivism, inclusive classroom modifications, and secondary school psychological dynamics.',
      questions: gthumCdp30,
      sections: [{ name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gthum-sub-hist-30',
      title: 'STET GT: Social Studies - History & Sikkim Culture (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-humanities',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Harappan Lothal dockyard, Mauryan Dhamma, consecration of first Chogyal at Yuksom (1642), Champaran Satyagraha, and modern national history.',
      questions: gthumHist30,
      sections: [{ name: 'History & Sikkim Culture', category: 'SocialScience', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gthum-sub-geo-30',
      title: 'STET GT: Social Studies - Geography & Polity (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-humanities',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Longitude and local time calculations, troposphere lapse rate, volcanic intrusive landforms, Supreme Court writs, and 73rd Amendment Panchayati Raj.',
      questions: gthumGeo30,
      sections: [{ name: 'Geography & Indian Polity', category: 'SocialScience', questionCount: 30, startIndex: 0 }],
    },
    {
      id: 'mock-gthum-sub-eng-30',
      title: 'STET GT: English Literature & Language Pedagogy (30 Questions)',
      year: '2026',
      durationMinutes: 30,
      track: 'gt-humanities',
      testType: 'subject-30',
      paperBadge: '30 Qs Subject Mock',
      description: 'Tagore\'s Stream of Life, Kamala Das autobiographical poetry, translanguaging pedagogy, literary devices, and transformational grammar.',
      questions: gthumEng30,
      sections: [{ name: 'English Literature & Pedagogy', category: 'English', questionCount: 30, startIndex: 0 }],
    },

    // --- 3. OFFICIAL PREVIOUS QUESTION PAPERS ---
    {
      id: 'mock-stet-item-bank-benchmark',
      title: 'SCERT Sikkim & Azim Premji Univ. STET Benchmark Exam',
      year: '2025',
      durationMinutes: 30,
      track: 'all',
      testType: 'previous-paper',
      paperBadge: 'Official SCERT & APU Item Bank',
      description: 'Gold standard reference exam from the official SCERT Sikkim & Azim Premji University STET Item Bank. Tests pedagogical reasoning, diagnostic distractor rationales, and Bloom cognitive taxonomy across all teacher streams.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.isStetItemBankRef || q.previousPaperSet === 'SCERT Sikkim & APU STET Item Bank'),
    },
    {
      id: 'mock-stet-prt-2024',
      title: 'STET PRT 2024 Official Previous Paper (2024 STET.pdf)',
      year: '2024',
      durationMinutes: 25,
      track: 'prt',
      testType: 'previous-paper',
      paperBadge: 'Uploaded Official 2024 PRT Paper',
      description: 'Official 2024 Primary Teacher exam: Dubdi Monastery, Dokpas pastoral nomads, RAP/PAP permit regulations, UDID Yellow Card (40-79%), Euler polyhedron formula, and POCSO Act 2012 child rights.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET PRT 2024 Paper'),
    },
    {
      id: 'mock-stet-prt-2025',
      title: 'STET PRT 2025 Primary Teacher Official Question Paper',
      year: '2025',
      durationMinutes: 25,
      track: 'prt',
      testType: 'previous-paper',
      paperBadge: 'Official 2025 PRT Paper Set',
      description: 'Official 2025 Primary Teacher paper: Mt. Khangchendzonga expedition ban, Pangolakha Wildlife Sanctuary, GLOF flash-floods, perimeter invariance, fractions, and RPwD 2016 21 disabilities.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET PRT 2025 Paper'),
    },
    {
      id: 'mock-stet-gt-ms-2025-official',
      title: 'STET GT Maths & Science 2025 Official Question Paper',
      year: '2025',
      durationMinutes: 60,
      track: 'gt-maths-science',
      testType: 'previous-paper',
      paperBadge: 'Official 2025 Paper (Full STEM & Core)',
      description: 'Authentic 2025 Graduate Teacher paper: Local haat arithmetic, ruler & compass constructions, cylinder CSA, 125 kJ work-energy, convex lens, Planaria regeneration, Little Women comprehension, and CDP milestones.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET GT Maths & Science 2025 Official Paper' || q.previousPaperSet === 'STET GT Official Paper 2025'),
    },
    {
      id: 'mock-stet-gt-ms-2022-official',
      title: 'STET GT Maths & Science 2022 Official Question Paper',
      year: '2022',
      durationMinutes: 45,
      track: 'gt-maths-science',
      testType: 'previous-paper',
      paperBadge: 'Official 2022 Paper (Full STEM)',
      description: 'Authentic 2022 Graduate Teacher paper: AP common differences, GP nth terms, coordinate slopes and perpendicular lines (m₁m₂ = -1), quadratic discriminant (D ≥ 0), probability axioms, and mensuration.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET GT Maths & Science 2022 Official Paper'),
    },
    {
      id: 'mock-stet-2026',
      title: 'STET 2026 Paper II Official Previous Question Paper',
      year: '2026',
      durationMinutes: 25,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 2026 Paper (Exact Fixed Questions)',
      description: 'Authentic 2026 Special Education & Secondary certification paper featuring Tagore\'s Stream of Life, Totto-Chan, NEP 2020, Volcanic Landforms, and Piaget & Kohlberg stages.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET 2026 Paper II'),
    },
    {
      id: 'mock-stet-2025',
      title: 'STET 2025 GTA Official Previous Question Paper',
      year: '2025',
      durationMinutes: 25,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 2025 Paper (Exact Fixed Questions)',
      description: 'Authentic STET-25 GTA exam with critical bell hooks reading, Indian border geography, time-zone longitudes, population pyramids, and Bandura observational learning sequence.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET 2025 GTA Paper'),
    },
    {
      id: 'mock-stet-2024',
      title: 'STET 2024 Paper II Official Previous Question Paper',
      year: '2024',
      durationMinutes: 25,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 2024 Paper (Exact Fixed Questions)',
      description: 'Authentic Paper II covering Kamala Devi Chattopadhyay, Kamala Das "Words", Constitutional Writs, NEP 2020 5+3+3+4 structure, and vocational bagless days.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET 2024 Paper II'),
    },
    {
      id: 'mock-stet-2023',
      title: 'STET 2023 Teacher Eligibility Official Previous Question Paper',
      year: '2023',
      durationMinutes: 25,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 2023 Paper (Exact Fixed Questions)',
      description: 'Authentic 2023 exam paper testing Kohlberg moral stages, Vygotsky Scaffolding, Troposphere normal lapse rate, and Cummins Common Underlying Proficiency (CUP).',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET 2023 Paper'),
    },
    {
      id: 'mock-stet-2022',
      title: 'STET 2022 Teacher Certification Official Previous Question Paper',
      year: '2022',
      durationMinutes: 25,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 2022 Paper (Exact Fixed Questions)',
      description: 'Authentic 2022 exam paper covering Section 21 SMC rules of RTE 2009, Indus Valley Lothal dockyard, Gardner Multiple Intelligences, and skimming vs scanning.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => q.previousPaperSet === 'STET 2022 Paper'),
    },
    {
      id: 'mock-stet-2026-cdp-master',
      title: 'STET 2026 Child Development & Pedagogy Master Bank (250 Questions)',
      year: '2026',
      durationMinutes: 150,
      track: 'all',
      testType: 'previous-paper',
      paperBadge: 'Official 250 Qs CDP Bank (GT Humanities & GT Maths)',
      description: 'Complete authentic 250-question CDP item bank: Development principles, adolescent transitions, Piaget/Vygotsky/Kohlberg, multiple intelligences, RPwD Act 2016 (21 disabilities), RTE Act 2009, and inclusive education. Shared for GT-Humanities and GT-Maths.',
      questions: STET_2026_CDP_QUESTIONS,
    },
    {
      id: 'mock-stet-2026-english-master',
      title: 'STET 2026 Language I English Master Bank (250 Questions)',
      year: '2026',
      durationMinutes: 150,
      track: 'all',
      testType: 'previous-paper',
      paperBadge: 'Official 250 Qs English Bank (GT Humanities & GT Maths)',
      description: 'Complete authentic 250-question English language item bank: Reading comprehension, literary devices & figures of speech, grammar concord, Sikkim language policy, Cummins BICS/CALP, translanguaging, and Krashen SLA hypotheses. Shared for GT-Humanities and GT-Maths.',
      questions: STET_2026_ENGLISH_QUESTIONS,
    },
    {
      id: 'mock-stet-2026-ssc-master',
      title: 'STET 2026 GT Humanities: Social Science Master Bank (400 Questions)',
      year: '2026',
      durationMinutes: 210,
      track: 'gt-humanities',
      testType: 'previous-paper',
      paperBadge: 'Official 400 Qs Social Science Bank (GT Humanities)',
      description: 'Official 400-question Social Science item bank: Indian History (Indus Valley, Vedic, Mauryas, Delhi Sultanate, Mughals, 1857 Revolt, Freedom Struggle), Physical & Sikkim Geography, Social & Political Life (Constitution, Writs, Panchayati Raj), and Social Science Pedagogy.',
      questions: STET_2026_SOCIAL_SCIENCE_QUESTIONS,
    },

    // --- 4. COMPREHENSIVE FULL-STREAM 1,000+ QUESTION MASTER MOCK EXAMS ---
    {
      id: 'mock-gthum-master-1223',
      title: 'STET GT Humanities Full Comprehensive Master Mock (1,223 Questions)',
      year: '2026',
      durationMinutes: 300,
      track: 'gt-humanities',
      testType: 'full-120',
      paperBadge: 'Complete 1,223 Qs Humanities Master Bank',
      description: 'The complete, unabridged GT Humanities examination repository: all 524 Social Science questions (History, Sikkim Heritage, Geography, Civics, Polity, Pedagogy), all 359 Child Development & Pedagogy questions, and all 340 English Language questions.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => !q.examTracks || q.examTracks.includes('gt-humanities')),
      sections: [
        { name: 'Social Science (History, Geography, Polity & Pedagogy)', category: 'SocialScience', questionCount: 524, startIndex: 0 },
        { name: 'Child Development & Pedagogy', category: 'CDP', questionCount: 359, startIndex: 524 },
        { name: 'English Language & Literature', category: 'English', questionCount: 340, startIndex: 883 },
      ],
    },
    {
      id: 'mock-gtms-master-1909',
      title: 'STET GT Maths & Science Full Comprehensive Master Mock (1,909 Questions)',
      year: '2026',
      durationMinutes: 300,
      track: 'gt-maths-science',
      testType: 'full-120',
      paperBadge: 'Complete 1,909 Qs STEM Master Bank',
      description: 'The complete, unabridged GT Maths & Science examination repository: all Graduate Mathematics, PCB Science, Child Development & Pedagogy, and English questions.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => !q.examTracks || q.examTracks.includes('gt-maths-science')),
    },
    {
      id: 'mock-prt-master-1264',
      title: 'STET PRT Paper I Full Comprehensive Master Mock (1,264 Questions)',
      year: '2026',
      durationMinutes: 300,
      track: 'prt',
      testType: 'full-120',
      paperBadge: 'Complete 1,264 Qs PRT Master Bank',
      description: 'The complete, unabridged Primary Teacher examination repository: all Child Development, Mathematics, Environmental Studies (EVS & Sikkim), and English questions.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) => !q.examTracks || q.examTracks.includes('prt')),
    },
    {
      id: 'mock-vault-master-3573',
      title: 'STET 3,573-Question Ultimate Grand Vault Simulation (All Streams)',
      year: '2026',
      durationMinutes: 360,
      track: 'all',
      testType: 'full-120',
      paperBadge: 'Ultimate 3,573 Qs Grand Vault',
      description: 'The complete 3,573-question master repository across all Sikkim Teacher Eligibility Test streams: PRT, GT Humanities, and GT Maths & Science.',
      questions: HISTORICAL_EXAM_QUESTIONS,
    },
  ];

  const mockSuites: MockTestDef[] = rawMockSuites.map((suite) => ({
    ...suite,
    questions: deduplicateQuestionList(suite.questions),
  }));

  const [activeTest, setActiveTest] = useState<MockTestDef | null>(null);
  const [catalogTrackFilter, setCatalogTrackFilter] = useState<ExamTrack | 'all'>(
    userProfile.selectedExamTrack || 'all'
  );
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<'all' | 'master-exams' | 'full-120' | 'subject-30' | 'previous-paper'>('all');

  useEffect(() => {
    if (userProfile.selectedExamTrack) {
      setCatalogTrackFilter(userProfile.selectedExamTrack);
    }
  }, [userProfile.selectedExamTrack]);

  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: number | null; marked: boolean }>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [testActive, setTestActive] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<MockTestResult | null>(null);
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);

  // Timer Countdown
  useEffect(() => {
    if (!testActive || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testActive, secondsRemaining]);

  const isPaid = isPaidOrAdmin(userProfile);
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

  const handleStartTest = (suite: MockTestDef) => {
    // If free user has already completed dynamic questions limit across Mock and Practice:
    if (!isPaid && getQuestionsUsageCount(userProfile) >= questionLimit) {
      if (onOpenSubscribeForMore) {
        onOpenSubscribeForMore('mock-tests');
      } else if (onOpenSubscription) {
        onOpenSubscription(suite.track === 'all' ? undefined : suite.track);
      }
      return;
    }

    // Restrict paid candidates to their specific subscribed course only
    if (suite.track !== 'all' && isCourseLockedForUser(userProfile, suite.track as ExamTrack)) {
      const subTitle = getSubscribedCourseTitle(userProfile.targetExam, userProfile.paidStreams);
      setRestrictedNotice(`Restricted Course Access: You are SUBSCRIBED TO- "${subTitle}". Full access is granted to that specific course only. Rest of the courses remain inaccessible under your current plan.`);
      return;
    }

    setRestrictedNotice(null);

    // Strictly guarantee 100% unique, non-repeating questions across the mock test
    const cleanQuestions = ensureTestQuestionsAreUnique(
      suite.questions,
      HISTORICAL_EXAM_QUESTIONS,
      suite.track === 'all' ? undefined : suite.track
    );
    const sanitizedSuite: MockTestDef = {
      ...suite,
      questions: cleanQuestions,
    };

    setActiveTest(sanitizedSuite);
    setCurrentQIndex(0);
    setSecondsRemaining(suite.durationMinutes * 60);
    setTestResult(null);

    const initialAnswers: Record<string, { selected: number | null; marked: boolean }> = {};
    cleanQuestions.forEach((q) => {
      initialAnswers[q.id] = { selected: null, marked: false };
    });
    setUserAnswers(initialAnswers);
    setTestActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optIndex: number) => {
    if (!activeTest || !testActive) return;
    const currentQ = activeTest.questions[currentQIndex];

    // Check free question usage limit across Mock & Practice
    if (!isPaid) {
      const attemptedIds = getAttemptedQuestionIds(userProfile);
      const isAlreadyAttempted = 
        Boolean(userAnswers[currentQ.id]?.selected !== null) ||
        Boolean(userProfile.completedQuestions[currentQ.id]) ||
        attemptedIds.includes(currentQ.id);

      if (!isAlreadyAttempted) {
        const currentUsage = getQuestionsUsageCount(userProfile);
        if (currentUsage >= questionLimit) {
          // Reached free questions limit! Block answer and trigger popup
          if (onOpenSubscribeForMore) {
            onOpenSubscribeForMore('mock-tests');
          } else if (onOpenSubscription) {
            onOpenSubscription(activeTest.track === 'all' ? undefined : activeTest.track);
          }
          return;
        }

        const newCount = recordQuestionAttempt(currentQ.id);
        setUsageCount(newCount);

        // If this completed question limit, show pop up immediately
        if (newCount >= questionLimit) {
          setTimeout(() => {
            if (onOpenSubscribeForMore) {
              onOpenSubscribeForMore('mock-tests');
            } else if (onOpenSubscription) {
              onOpenSubscription(activeTest.track === 'all' ? undefined : activeTest.track);
            }
          }, 350);
        }
      }
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selected: optIndex,
      },
    }));
  };

  const handleToggleMark = () => {
    if (!activeTest || !testActive) return;
    const currentQ = activeTest.questions[currentQIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        marked: !prev[currentQ.id]?.marked,
      },
    }));
  };

  const handleClearResponse = () => {
    if (!activeTest || !testActive) return;
    const currentQ = activeTest.questions[currentQIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selected: null,
      },
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    setShowSubmitModal(false);
    setTestActive(false);

    let correctCount = 0;
    const formattedAnswers: TestAnswer[] = [];
    const catStats: Record<string, { correct: number; total: number }> = {};

    activeTest.questions.forEach((q) => {
      const cat = q.category;
      if (!catStats[cat]) {
        catStats[cat] = { correct: 0, total: 0 };
      }
      catStats[cat].total++;

      const ans = userAnswers[q.id];
      const isCorrect = ans?.selected === q.correctIndex;
      if (isCorrect) {
        correctCount++;
        catStats[cat].correct++;
      }

      formattedAnswers.push({
        questionId: q.id,
        selectedIndex: ans?.selected ?? null,
        isMarkedForReview: ans?.marked ?? false,
        timeSpentSeconds: Math.round(
          (activeTest.durationMinutes * 60 - secondsRemaining) / activeTest.questions.length
        ),
        isCorrect,
      });
    });

    const accuracy = Math.round((correctCount / activeTest.questions.length) * 100);
    const timeTaken = activeTest.durationMinutes * 60 - secondsRemaining;

    const subjectScores = Object.entries(catStats).map(([category, stats]) => ({
      category: category as QuestionCategory,
      correct: stats.correct,
      total: stats.total,
    }));

    const result: MockTestResult = {
      id: `result-${Date.now()}`,
      mockTestId: activeTest.id,
      title: activeTest.title,
      date: 'Just now',
      score: correctCount,
      totalQuestions: activeTest.questions.length,
      accuracy,
      timeTakenSeconds: timeTaken,
      subjectScores,
      answers: formattedAnswers,
    };

    setTestResult(result);

    // Update global profile
    onUpdateProfile((prev) => {
      const newCompleted = { ...prev.completedQuestions };
      activeTest.questions.forEach((q) => {
        const ans = userAnswers[q.id];
        if (ans?.selected !== null && ans?.selected !== undefined) {
          newCompleted[q.id] = {
            selected: ans.selected,
            isCorrect: ans.selected === q.correctIndex,
            timestamp: Date.now(),
          };
        }
      });

      const xpEarned = correctCount * 10 + 50;
      const streakUpdated = recordLearningActivity(prev, 'mock_test', 1, xpEarned);

      return {
        ...streakUpdated,
        completedQuestions: newCompleted,
        mockTestResults: [result, ...prev.mockTestResults],
        totalXp: prev.totalXp + xpEarned,
      };
    });

    if (userProfile.email) {
      firestoreSyncService.recordTestAttemptToCloud(result, userProfile.email).catch(() => {});
    }

    if (accuracy >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper to find current section
  const currentSection = activeTest?.sections?.find((sec, idx, arr) => {
    const nextSec = arr[idx + 1];
    if (nextSec) {
      return currentQIndex >= sec.startIndex && currentQIndex < nextSec.startIndex;
    }
    return currentQIndex >= sec.startIndex;
  });

  const answerEntries = Object.values(userAnswers) as Array<{ selected: number | null; marked: boolean }>;
  const answeredCount = answerEntries.filter((a) => a.selected !== null).length;
  const markedCount = answerEntries.filter((a) => a.marked).length;
  const unvisitedCount = activeTest ? activeTest.questions.length - answeredCount : 0;

  // ----------------------------------------------------
  // 1. RENDER RESULT / SCORECARD SCREEN
  // ----------------------------------------------------
  if (testResult && activeTest) {
    return (
      <div className="space-y-6 pb-12" id="mock-test-result-container">
        {/* Result Hero */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mock Test Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
                {testResult.title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Diagnostic analysis with exact subject performance (30 Questions per Subject Standard).
              </p>
            </div>

            <div className="flex items-center space-x-6 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Score</span>
                <div className="text-3xl font-extrabold text-white font-['Outfit']">
                  {testResult.score}/{testResult.totalQuestions}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-700"></div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Accuracy</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">
                  {testResult.accuracy}%
                </div>
              </div>
              <div className="h-10 w-px bg-slate-700"></div>
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Time Taken</span>
                <div className="text-xl font-bold text-slate-200">
                  {Math.round(testResult.timeTakenSeconds / 60)}m {testResult.timeTakenSeconds % 60}s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-Wise Breakdown Cards (Score out of 30 for each subject) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900 font-['Outfit']">
                Subject-Wise Performance Breakdown (30 Marks Benchmark)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Target Pass Threshold: 60% (18/30)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testResult.subjectScores.map((subj) => {
              const pct = Math.round((subj.correct / subj.total) * 100);
              const isPassed = pct >= 60;
              return (
                <div 
                  key={subj.category} 
                  className="rounded-xl p-4 border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700">
                      {subj.category === 'CDP' 
                        ? 'Child Development' 
                        : subj.category === 'MathsScience' 
                        ? 'Maths & Science' 
                        : subj.category === 'SocialScience' 
                        ? 'Social Science' 
                        : subj.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isPassed ? 'Passed' : 'Needs Work'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
                      {subj.correct} <span className="text-xs font-medium text-slate-500">/ {subj.total}</span>
                    </span>
                    <span className={`text-sm font-bold ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-600' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStartTest(activeTest)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake This Mock Test</span>
            </button>
            <button
              onClick={() => setActiveTest(null)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Mock Test Catalog
            </button>
          </div>

          <button
            disabled
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed opacity-75"
            title="PDF download option is disabled"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF Download Disabled</span>
          </button>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
            Question-by-Question Detailed Review ({activeTest.questions.length} Questions)
          </h3>

          <div className="space-y-4">
            {activeTest.questions.map((q, qIndex) => {
              const userAns = userAnswers[q.id]?.selected;
              const isCorrect = userAns === q.correctIndex;
              const isUnattempted = userAns === null || userAns === undefined;

              return (
                <div 
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isUnattempted
                      ? 'bg-slate-50 border-slate-200'
                      : isCorrect
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-slate-800 text-white">
                        Q{qIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {q.category} • {q.topic}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isUnattempted ? (
                        <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                          Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> +1 Mark Correct
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center">
                          <XCircle className="w-3 h-3 mr-1" /> Incorrect
                        </span>
                      )}

                      <button
                        onClick={() => onOpenTutor(`Please explain Question #${qIndex + 1}: "${q.question}"`, q)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold ml-2 cursor-pointer flex items-center"
                      >
                        <HelpCircle className="w-3.5 h-3.5 mr-1" /> Ask Tutor
                      </button>
                    </div>
                  </div>

                  {/* Reading Passage Context if present */}
                  {q.passageText && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-850 mb-3 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>Passage Context</span>
                        </div>
                        {q.passageTitle && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            {q.passageTitle}
                          </span>
                        )}
                      </div>
                      <p className="italic font-serif leading-relaxed whitespace-pre-line bg-white/80 p-2.5 rounded-lg border border-amber-100/80 text-slate-800">
                        "{q.passageText}"
                      </p>
                    </div>
                  )}

                  <p className="text-sm font-semibold text-slate-900 leading-relaxed mb-3">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctIndex;
                      const isOptionChosen = oIdx === userAns;

                      let optStyle = 'border-slate-200 bg-white text-slate-700';
                      if (isOptionCorrect) {
                        optStyle = 'border-emerald-500 bg-emerald-100/70 text-emerald-950 font-semibold';
                      } else if (isOptionChosen && !isOptionCorrect) {
                        optStyle = 'border-rose-400 bg-rose-100/70 text-rose-950 font-semibold';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 ${optStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                          {isOptionCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                          {isOptionChosen && !isOptionCorrect && <XCircle className="w-3.5 h-3.5 text-rose-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Explanation: </strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. RENDER LIVE TEST TAKING SCREEN
  // ----------------------------------------------------
  if (testActive && activeTest) {
    const currentQ = activeTest.questions[currentQIndex];
    const currentAns = userAnswers[currentQ.id];
    const isUnder3Mins = secondsRemaining < 180;

    return (
      <div className="space-y-4 pb-12" id="active-mock-test-screen">
        {/* Live Exam Top Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-18 z-30">
          <div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {activeTest.title}
            </span>
            <span className="ml-2 text-xs text-slate-500 hidden sm:inline">
              30 Questions per Subject Standard
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {!isPaid && (
              <button
                onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('mock-tests') : onOpenSubscription?.(activeTest.track === 'all' ? undefined : activeTest.track)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  usageCount >= questionLimit
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
                title="Click to view subscription options"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {usageCount >= questionLimit ? `Limit Reached (${usageCount}/${questionLimit}) • Subscribe` : `Free Usage: ${usageCount}/${questionLimit} Qs`}
                </span>
              </button>
            )}

            {/* Live Countdown Timer */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              isUnder3Mins
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <Clock className={`w-4 h-4 ${isUnder3Mins ? 'text-rose-600' : 'text-amber-400'}`} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              id="submit-exam-button"
            >
              Finish &amp; Submit
            </button>
          </div>
        </div>

        {/* Subject Section Navigation Bar (for Multi-Subject / 120-Q Tests) */}
        {activeTest.sections && activeTest.sections.length > 1 && (
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Exam Sections (30 Questions Each):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeTest.sections.map((sec, secIdx) => {
                const isSecActive = currentSection?.startIndex === sec.startIndex;
                // calculate answered in this section
                const secQuestions = activeTest.questions.slice(sec.startIndex, sec.startIndex + sec.questionCount);
                const secAnswered = secQuestions.filter(q => userAnswers[q.id]?.selected !== null).length;

                return (
                  <button
                    key={secIdx}
                    onClick={() => setCurrentQIndex(sec.startIndex)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSecActive
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-extrabold text-indigo-600">Sec {secIdx + 1}</span>
                      <span className="text-slate-500">{secAnswered}/{sec.questionCount}</span>
                    </div>
                    <div className="text-xs font-semibold truncate">
                      {sec.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Split Layout: Question View + Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Question Box (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4">
              {/* Question metadata & Bookmark */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold">
                    Q{currentQIndex + 1} of {activeTest.questions.length}
                  </span>
                  {currentSection && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      {currentSection.name} (Q{currentQIndex - currentSection.startIndex + 1}/30)
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    • {currentQ.topic}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleMark}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      currentAns?.marked
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{currentAns?.marked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    onClick={handleClearResponse}
                    disabled={currentAns?.selected === null}
                    className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer px-2 py-1"
                  >
                    Clear Response
                  </button>
                </div>
              </div>

              {/* Reading Passage Context if present */}
              {currentQ.passageText && (
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                    <div className="flex items-center space-x-2 text-xs font-black text-amber-950 tracking-wide uppercase">
                      <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Reading Comprehension Passage / Text Reference</span>
                    </div>
                    {currentQ.passageTitle && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                        {currentQ.passageTitle}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm italic font-serif leading-relaxed text-slate-800 whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-amber-200/50 shadow-xs">
                    "{currentQ.passageText}"
                  </div>
                  <p className="text-[11px] text-amber-800/90 font-medium">
                    Read the passage above carefully to evaluate and answer the question below.
                  </p>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </p>

                {currentQ.diagramDescription && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong className="font-bold">Figure Context: </strong>
                    {currentQ.diagramDescription}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, optIndex) => {
                  const isSelected = currentAns?.selected === optIndex;
                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(optIndex)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center space-x-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                      id={`option-btn-${optIndex}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-slate-500 bg-white'
                      }`}>
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav: Prev, Ask Tutor, Next */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <button
                onClick={() => onOpenTutor(`I need help understanding question #${currentQIndex + 1} (${currentQ.category}): "${currentQ.question}"`, currentQ)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ask AI Mentor</span>
              </button>

              <button
                onClick={() => {
                  if (!isPaid && usageCount >= questionLimit) {
                    const nextQ = activeTest.questions[currentQIndex + 1];
                    if (nextQ && userAnswers[nextQ.id]?.selected === null) {
                      if (onOpenSubscribeForMore) {
                        onOpenSubscribeForMore('mock-tests');
                      } else if (onOpenSubscription) {
                        onOpenSubscription(activeTest.track === 'all' ? undefined : activeTest.track);
                      }
                      return;
                    }
                  }
                  setCurrentQIndex((prev) => Math.min(activeTest.questions.length - 1, prev + 1));
                }}
                disabled={currentQIndex === activeTest.questions.length - 1}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
              >
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Palette Sidebar (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Question Palette
              </h3>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600 shrink-0"></span>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0"></span>
                  <span>Marked ({markedCount})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 shrink-0"></span>
                  <span>Unanswered ({unvisitedCount})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-md border-2 border-indigo-600 shrink-0"></span>
                  <span>Current</span>
                </div>
              </div>

              {/* Number Buttons Grid organized by Sections */}
              {activeTest.sections && activeTest.sections.length > 1 ? (
                <div className="space-y-3">
                  {activeTest.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100">
                        <span>{sec.name}</span>
                        <span className="text-[10px] text-indigo-600 font-extrabold">30 Qs</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {Array.from({ length: sec.questionCount }).map((_, localIdx) => {
                          const qIdx = sec.startIndex + localIdx;
                          const q = activeTest.questions[qIdx];
                          const ans = userAnswers[q?.id];
                          const isCurrent = qIdx === currentQIndex;
                          const isAnswered = ans?.selected !== null && ans?.selected !== undefined;
                          const isMarked = ans?.marked;

                          let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                          if (isMarked) {
                            btnStyle = 'bg-amber-500 text-white font-bold border-amber-600';
                          } else if (isAnswered) {
                            btnStyle = 'bg-indigo-600 text-white font-bold border-indigo-700';
                          }

                          return (
                            <button
                              key={qIdx}
                              onClick={() => setCurrentQIndex(qIdx)}
                              className={`h-7 rounded-lg text-[11px] flex items-center justify-center border transition-all cursor-pointer ${btnStyle} ${
                                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 font-extrabold' : ''
                              }`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeTest.questions.map((q, qIdx) => {
                    const ans = userAnswers[q.id];
                    const isCurrent = qIdx === currentQIndex;
                    const isAnswered = ans?.selected !== null && ans?.selected !== undefined;
                    const isMarked = ans?.marked;

                    let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                    if (isMarked) {
                      btnStyle = 'bg-amber-500 text-white font-bold border-amber-600';
                    } else if (isAnswered) {
                      btnStyle = 'bg-indigo-600 text-white font-bold border-indigo-700';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(qIdx)}
                        className={`h-8 rounded-lg text-xs flex items-center justify-center border transition-all cursor-pointer ${btnStyle} ${
                          isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 font-extrabold' : ''
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Submit Mock Paper
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Target className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  Confirm Mock Test Submission
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Are you ready to submit your test? Here is your current attempt overview:
              </p>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center border border-slate-200 text-xs">
                <div>
                  <span className="font-extrabold text-indigo-600 text-base">{answeredCount}</span>
                  <p className="text-slate-500 text-[10px]">Answered</p>
                </div>
                <div>
                  <span className="font-extrabold text-amber-500 text-base">{markedCount}</span>
                  <p className="text-slate-500 text-[10px]">Marked</p>
                </div>
                <div>
                  <span className="font-extrabold text-rose-500 text-base">{unvisitedCount}</span>
                  <p className="text-slate-500 text-[10px]">Unanswered</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Continue Test
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  id="confirm-submit-modal-btn"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. DEFAULT: CATALOG OF MOCK TESTS
  // ----------------------------------------------------
  const isPaidCandidate = isPaid && !isAdminUser(userProfile.email) && userProfile.role !== 'admin';
  const subscribedTrack = getUserSubscribedTrack(userProfile);
  const currentStream: ExamTrack | 'all' = isPaidCandidate
    ? subscribedTrack
    : (userProfile.selectedExamTrack || (catalogTrackFilter !== 'all' ? catalogTrackFilter : 'all'));

  const filteredSuites = mockSuites.filter((suite) => {
    // Show only the active exam stream's mock suites
    const matchesTrack = currentStream === 'all' || suite.track === currentStream || suite.track === 'all';
    const matchesType =
      catalogTypeFilter === 'all'
        ? true
        : catalogTypeFilter === 'master-exams'
        ? (suite.questions.length >= 400 || suite.id.includes('master'))
        : suite.testType === catalogTypeFilter;
    return matchesTrack && matchesType;
  });

  const masterVaultTotal = HISTORICAL_EXAM_QUESTIONS.length;
  const currentStreamQuestions = HISTORICAL_EXAM_QUESTIONS.filter(
    (q) => currentStream === 'all' || !q.examTracks || q.examTracks.includes(currentStream as ExamTrack)
  );
  const streamTotalCount = currentStreamQuestions.length;

  const sscSuite = mockSuites.find((s) => s.id === 'mock-stet-2026-ssc-master');
  const engSuite = mockSuites.find((s) => s.id === 'mock-stet-2026-english-master');
  const cdpSuite = mockSuites.find((s) => s.id === 'mock-stet-2026-cdp-master');
  const gthumMasterSuite = mockSuites.find((s) => s.id === 'mock-gthum-master-1223');
  const gtmsMasterSuite = mockSuites.find((s) => s.id === 'mock-gtms-master-1909');
  const prtMasterSuite = mockSuites.find((s) => s.id === 'mock-prt-master-1264');
  const vaultMasterSuite = mockSuites.find((s) => s.id === 'mock-vault-master-3573');

  return (
    <div className="space-y-6 pb-12" id="mock-tests-catalog">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
            STET Interactive Mock Tests &amp; 30-Question Subject Papers
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Standard STET exam structure featuring <strong>30 questions for each subject</strong> in full 120-question mock tests, 
          dedicated 30-question subject sectional mocks, and authentic official previous question papers.
        </p>
      </div>

      {/* Live Updated Question Bank Pool Display */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-500/30 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white font-['Outfit']">
                  Updated Master Question Bank Pool
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black tracking-wide uppercase">
                  Live Synced
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Full repository of verified STET examination questions with verified answer keys &amp; rationales.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-black text-xs border border-white/20">
              {masterVaultTotal.toLocaleString()} Master Vault
            </span>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/30 text-indigo-200 font-black text-xs border border-indigo-400/30">
              {streamTotalCount.toLocaleString()} in Active Stream
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs border border-amber-300 shadow-xs">
              900 Verified 2026 Items
            </span>
          </div>
        </div>

        {/* Full Stream Master Mock Banner */}
        {((currentStream === 'gt-humanities' || currentStream === 'all') && gthumMasterSuite) && (
          <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-amber-700/30 border border-amber-400/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wide">
                  ⭐ 1,223 Questions Full Master Mock
                </span>
                <span className="text-amber-200 text-xs font-semibold">
                  Complete GT Humanities Syllabus
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                STET GT Humanities Full Comprehensive Master Mock Exam (1,223 Questions)
              </h4>
              <p className="text-xs text-slate-300">
                All 524 Social Science questions (History, Sikkim Heritage, Geography, Civics, Polity, Pedagogy), all 359 Child Development &amp; Pedagogy questions, and all 340 English Language questions in one complete simulation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartTest(gthumMasterSuite)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 shrink-0 border border-amber-300"
            >
              <Crown className="w-4 h-4" />
              <span>Launch 1,223-Q Master Mock</span>
            </button>
          </div>
        )}

        {(currentStream === 'all' && vaultMasterSuite) && (
          <div className="bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-indigo-700/30 border border-indigo-400/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-400 text-slate-950 font-black text-[11px] uppercase tracking-wide">
                  ⭐ 3,573 Questions Complete Grand Vault
                </span>
                <span className="text-indigo-200 text-xs font-semibold">
                  All STET Streams Combined
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">
                STET 3,573-Question Ultimate Grand Vault Simulation
              </h4>
              <p className="text-xs text-slate-300">
                The complete 3,573-question master repository across all Sikkim Teacher Eligibility Test streams: PRT, GT Humanities, and GT Maths &amp; Science.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartTest(vaultMasterSuite)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-300 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 shrink-0 border border-indigo-300"
            >
              <Crown className="w-4 h-4" />
              <span>Launch 3,573-Q Grand Vault Mock</span>
            </button>
          </div>
        )}

        {/* 2026 Master Bank Quick Launch Strip */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Verified STET 2026 Master Item Banks</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Social Science 400 (GT Humanities) */}
            <div className="bg-white/5 hover:bg-white/10 border border-amber-400/30 rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-extrabold">
                    GT-Humanities
                  </span>
                  <span className="text-xs font-black text-amber-300">400 Questions</span>
                </div>
                <h4 className="font-bold text-xs text-white">Social Science Master Bank</h4>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  History, Geography, Polity &amp; Pedagogy
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (sscSuite) handleStartTest(sscSuite);
                }}
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1"
              >
                <span>Start 400-Q Master Mock</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 2: English 250 (Shared GT-Humanities & GT-Maths) */}
            <div className="bg-white/5 hover:bg-white/10 border border-emerald-400/30 rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold">
                    Shared: GT-Maths &amp; GT-Hum
                  </span>
                  <span className="text-xs font-black text-emerald-300">250 Questions</span>
                </div>
                <h4 className="font-bold text-xs text-white">Language I English Master Bank</h4>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  Comprehension, Grammar, BICS/CALP
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (engSuite) handleStartTest(engSuite);
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1"
              >
                <span>Start 250-Q Master Mock</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 3: CDP 250 (Shared GT-Humanities & GT-Maths) */}
            <div className="bg-white/5 hover:bg-white/10 border border-indigo-400/30 rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-400/20 text-indigo-300 text-[10px] font-extrabold">
                    Shared: GT-Maths &amp; GT-Hum
                  </span>
                  <span className="text-xs font-black text-indigo-300">250 Questions</span>
                </div>
                <h4 className="font-bold text-xs text-white">Child Development &amp; Pedagogy Bank</h4>
                <p className="text-[10px] text-slate-300 line-clamp-1">
                  Piaget, Kohlberg, RTE 2009, RPwD 2016
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (cdpSuite) handleStartTest(cdpSuite);
                }}
                className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-black transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1"
              >
                <span>Start 250-Q Master Mock</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                    ? `Free Usage Limit Reached (${usageCount}/${questionLimit} Questions)` 
                    : `Free Usage: ${usageCount} / ${questionLimit} Questions Used`}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  usageCount >= questionLimit 
                    ? 'bg-rose-200 text-rose-950' 
                    : 'bg-amber-200 text-amber-950'
                }`}>
                  {usageCount >= questionLimit ? 'Trial Period Over' : `${Math.max(0, questionLimit - usageCount)} Remaining`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {usageCount >= questionLimit
                  ? `The trial period is over. Following ${questionLimit} questions, subscription is required to take mock tests.`
                  : `The trial period is over. Free usage is limited to ${questionLimit} questions across Mock & Practice sections.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSubscribeForMore ? onOpenSubscribeForMore('mock-tests') : onOpenSubscription?.(currentStream)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-1.5 shrink-0 border border-amber-400"
            id="mock-subscribe-for-more-banner-btn"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Subscribe for more..!!</span>
          </button>
        </div>
      )}

      {/* Two-Tier Filter Controls: Stream + Format */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Restricted Course Access Banner for Paid Users */}
        {restrictedNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-start space-x-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">{restrictedNotice}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your active subscription gives you full access to your chosen course. Other streams remain inaccessible.
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

        {/* Stream Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Active Stream:
          </span>
          {[
            { id: 'gt-humanities', label: 'GT - Humanities (1,223 Questions)' },
            { id: 'gt-maths-science', label: 'GT - Maths & Science (1,909 Questions)' },
            { id: 'prt', label: 'Primary Teacher (PRT - 1,264 Questions)' },
            { id: 'all', label: '🌟 All Streams & Master Vault (3,573 Questions)' },
          ].map((tab) => {
            const isSelected = currentStream === tab.id;
            const isLocked = tab.id !== 'all' && isCourseLockedForUser(userProfile, tab.id as ExamTrack);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    const subTitle = getSubscribedCourseTitle(userProfile.targetExam, userProfile.paidStreams);
                    setRestrictedNotice(`Restricted Course Access: You are SUBSCRIBED TO- "${subTitle}". Full access is granted to that specific course only. Rest of the courses remain inaccessible under your current plan.`);
                    return;
                  }
                  setRestrictedNotice(null);
                  setCatalogTrackFilter(tab.id as ExamTrack | 'all');
                  if (onSelectExamTrack && tab.id !== 'all') {
                    onSelectExamTrack(tab.id as ExamTrack);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isLocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-amber-300'
                    : isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isLocked ? 'Course inaccessible under your current subscription' : undefined}
              >
                {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                <span>{tab.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
                {isLocked && <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Locked</span>}
              </button>
            );
          })}
        </div>

        {/* Active Stream Note */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-indigo-900 bg-indigo-50/80 border border-indigo-100 px-3.5 py-2.5 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
            <span>
              Showing mock tests &amp; official papers for: <strong className="font-bold">{
                currentStream === 'all' ? 'All Streams Combined Master Vault (3,573 Questions)' :
                currentStream === 'gt-humanities' ? 'Graduate Teacher Humanities (1,223 Questions: Social Science, English & CDP)' :
                currentStream === 'gt-maths-science' ? 'Graduate Teacher Maths & Science (1,909 Questions)' :
                'Primary Teacher (PRT - 1,264 Questions)'
              }</strong>
            </span>
          </div>
          <span className="text-[11px] text-indigo-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
            {filteredSuites.length} test packages available
          </span>
        </div>

        {/* Test Format Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1" /> Format:
          </span>
          {[
            { id: 'all', label: 'All Test Formats' },
            { id: 'master-exams', label: '🌟 1,000+ Comprehensive Master Mocks' },
            { id: 'full-120', label: 'Standard 120-Q Mock (30 Qs/Subject)' },
            { id: 'subject-30', label: '30-Q Subject Sectional Mocks' },
            { id: 'previous-paper', label: 'Official Previous Papers' },
          ].map((typeTab) => (
            <button
              key={typeTab.id}
              onClick={() => setCatalogTypeFilter(typeTab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                catalogTypeFilter === typeTab.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {typeTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mock Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuites.map((suite) => (
          <div
            key={suite.id}
            className={`bg-white rounded-2xl border transition-all p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
              suite.testType === 'full-120'
                ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                : 'border-slate-200 hover:border-indigo-200'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                  suite.testType === 'full-120'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : suite.testType === 'subject-30'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {suite.paperBadge || `STET ${suite.year} Pattern`}
                </span>
                <span className="text-xs text-slate-500 flex items-center font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {suite.durationMinutes} mins
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-['Outfit'] leading-snug">
                {suite.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {suite.description}
              </p>

              {/* Sections summary */}
              {suite.sections && suite.sections.length > 1 ? (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-indigo-700 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>30 Questions in Each Subject:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                    {suite.sections.map((sec, idx) => (
                      <span key={idx} className="truncate">• {sec.name}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center space-x-3 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <span>Total: <strong>{suite.questions.length} MCQs</strong></span>
                  <span>•</span>
                  <span>Format: <strong>Single Subject Practice</strong></span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleStartTest(suite)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                id={`start-test-btn-${suite.id}`}
              >
                <span>Start Timed Mock Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                disabled
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-200 cursor-not-allowed opacity-75"
                title="PDF download option is disabled"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-400" />
                <span>PDF Download Disabled</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
